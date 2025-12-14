import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import { ModuloContenidoModel } from '../models/ModuloContenidoModel.js';
import { pool } from '../config/database.js';

/**
 * Servicio para gestionar la carga de contenido en módulos
 * Permite a profesores subir archivos de contenido (PDF, videos, documentos)
 */
export class ContenidoUploadService {
  // Directorio donde se almacenan los contenidos
  static UPLOAD_DIR = './uploads/contenidos/';
  
  // Tipos de contenido permitidos
  static TIPOS_PERMITIDOS = {
    'pdf': { ext: '.pdf', mime: 'application/pdf' },
    'video': { ext: ['.mp4', '.webm', '.avi'], mime: 'video/*' },
    'documento': { ext: ['.docx', '.doc', '.txt', '.rtf'], mime: 'application/*' },
    'imagen': { ext: ['.jpg', '.jpeg', '.png', '.gif'], mime: 'image/*' },
    'presentacion': { ext: ['.ppt', '.pptx'], mime: 'application/*' },
    'url': { ext: 'link', mime: 'url' }
  };

  /**
   * Crear directorio de uploads si no existe
   */
  static async ensureUploadDir() {
    try {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creando directorio de uploads:', error);
    }
  }

  /**
   * Validar tipo de archivo
   */
  static validarTipoArchivo(nombreArchivo, tipo) {
    if (!this.TIPOS_PERMITIDOS[tipo]) {
      return { valido: false, error: `Tipo de contenido no permitido: ${tipo}` };
    }

    const ext = path.extname(nombreArchivo).toLowerCase();
    const extensionesPermitidas = this.TIPOS_PERMITIDOS[tipo].ext;

    if (Array.isArray(extensionesPermitidas)) {
      if (!extensionesPermitidas.includes(ext)) {
        return { valido: false, error: `Extensión no permitida. Use: ${extensionesPermitidas.join(', ')}` };
      }
    } else if (typeof extensionesPermitidas === 'string') {
      if (extensionesPermitidas !== ext && extensionesPermitidas !== 'link') {
        return { valido: false, error: `Extensión no permitida: ${ext}` };
      }
    }

    return { valido: true };
  }

  /**
   * Generar nombre único para el archivo
   */
  static generarNombreArchivoUnico(nombreOriginal) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(nombreOriginal);
    const nombre = path.basename(nombreOriginal, ext);
    
    return `${nombre}-${timestamp}-${random}${ext}`;
  }

  /**
   * Cargar archivo de contenido
   */
  static async cargarArchivo(buffer, nombreArchivo, tipo) {
    await this.ensureUploadDir();

    // Validar tipo
    const validacion = this.validarTipoArchivo(nombreArchivo, tipo);
    if (!validacion.valido) {
      throw new Error(validacion.error);
    }

    // Generar nombre único
    const nombreUnico = this.generarNombreArchivoUnico(nombreArchivo);
    const rutaArchivo = path.join(this.UPLOAD_DIR, nombreUnico);

    // Guardar archivo
    await fs.writeFile(rutaArchivo, buffer);

    return {
      nombreArchivo: nombreUnico,
      rutaRelativa: `uploads/contenidos/${nombreUnico}`,
      tamano: buffer.length
    };
  }

  /**
   * Crear contenido en módulo con archivo
   */
  static async crearContenidoConArchivo(datosContenido, buffer, nombreArchivo) {
    const { id_modulo, id_seccion, tipo, titulo, descripcion, id_docente } = datosContenido;

    try {
      // Cargar archivo
      const infoArchivo = await this.cargarArchivo(buffer, nombreArchivo, tipo);

      // Crear registro en BD
      const contenido = await ModuloContenidoModel.create({
        id_modulo,
        id_seccion,
        tipo,
        titulo,
        descripcion,
        url_contenido: null,
        archivo: infoArchivo.rutaRelativa,
        orden: await this.obtenerProximoOrden(id_modulo, id_seccion),
        id_estado: 1 // Activo
      });

      // Registrar en auditoría
      await this.registrarAuditoria(id_docente, 'CREATE', 'modulo_contenido', contenido.insertId, {
        tipo,
        titulo,
        archivo: infoArchivo.nombreArchivo,
        tamano: infoArchivo.tamano
      });

      return {
        id_contenido: contenido.insertId,
        ...infoArchivo,
        titulo,
        tipo
      };
    } catch (error) {
      throw new Error(`Error al crear contenido: ${error.message}`);
    }
  }

  /**
   * Crear contenido con URL (video, enlace externo, etc)
   */
  static async crearContenidoConURL(datosContenido, id_docente) {
    const { id_modulo, id_seccion, tipo, titulo, descripcion, url_contenido } = datosContenido;

    try {
      // Validar URL
      new URL(url_contenido);

      // Crear registro en BD
      const contenido = await ModuloContenidoModel.create({
        id_modulo,
        id_seccion,
        tipo,
        titulo,
        descripcion,
        url_contenido,
        archivo: null,
        orden: await this.obtenerProximoOrden(id_modulo, id_seccion),
        id_estado: 1
      });

      // Registrar en auditoría
      await this.registrarAuditoria(id_docente, 'CREATE', 'modulo_contenido', contenido.insertId, {
        tipo,
        titulo,
        url: url_contenido
      });

      return {
        id_contenido: contenido.insertId,
        titulo,
        tipo,
        url_contenido
      };
    } catch (error) {
      throw new Error(`Error al crear contenido: ${error.message}`);
    }
  }

  /**
   * Obtener próximo número de orden para el contenido
   */
  static async obtenerProximoOrden(id_modulo, id_seccion) {
    const [rows] = await pool.query(
      'SELECT MAX(orden) as max_orden FROM modulo_contenido WHERE id_modulo = ? AND id_seccion = ?',
      [id_modulo, id_seccion]
    );
    
    return (rows[0].max_orden || 0) + 1;
  }

  /**
   * Obtener contenido de un módulo
   */
  static async obtenerContenidoModulo(id_modulo, id_seccion = null) {
    const contenidos = await ModuloContenidoModel.getByModulo(id_modulo, id_seccion);
    
    return contenidos.map(c => ({
      ...c,
      tipo_display: this.obtenerNombreTipo(c.tipo),
      puede_descargar: !!c.archivo
    }));
  }

  /**
   * Actualizar contenido
   */
  static async actualizarContenido(id_contenido, datosActualizacion, id_docente) {
    const { titulo, descripcion, orden } = datosActualizacion;

    const [result] = await pool.query(
      'UPDATE modulo_contenido SET titulo = ?, descripcion = ?, orden = ? WHERE id_contenido = ?',
      [titulo, descripcion, orden, id_contenido]
    );

    await this.registrarAuditoria(id_docente, 'UPDATE', 'modulo_contenido', id_contenido, {
      titulo,
      descripcion,
      orden
    });

    return result;
  }

  /**
   * Eliminar contenido
   */
  static async eliminarContenido(id_contenido, id_docente) {
    // Obtener info del contenido
    const [contenidos] = await pool.query(
      'SELECT archivo FROM modulo_contenido WHERE id_contenido = ?',
      [id_contenido]
    );

    if (contenidos.length === 0) {
      throw new Error('Contenido no encontrado');
    }

    const { archivo } = contenidos[0];

    // Eliminar archivo físico si existe
    if (archivo) {
      try {
        const rutaCompleta = path.join(this.UPLOAD_DIR, path.basename(archivo));
        await fs.unlink(rutaCompleta);
      } catch (error) {
        console.error('Error al eliminar archivo físico:', error);
      }
    }

    // Eliminar registro de BD
    const [result] = await pool.query(
      'DELETE FROM modulo_contenido WHERE id_contenido = ?',
      [id_contenido]
    );

    await this.registrarAuditoria(id_docente, 'DELETE', 'modulo_contenido', id_contenido, {
      archivo
    });

    return result;
  }

  /**
   * Descargar contenido
   */
  static async descargarContenido(id_contenido) {
    const [contenidos] = await pool.query(
      'SELECT archivo, titulo FROM modulo_contenido WHERE id_contenido = ?',
      [id_contenido]
    );

    if (contenidos.length === 0 || !contenidos[0].archivo) {
      throw new Error('Archivo no encontrado');
    }

    return {
      rutaCompleta: path.join(this.UPLOAD_DIR, path.basename(contenidos[0].archivo)),
      nombreDescarga: `${contenidos[0].titulo}${path.extname(contenidos[0].archivo)}`
    };
  }

  /**
   * Registrar auditoría de cambios
   */
  static async registrarAuditoria(id_usuario, accion, tabla, id_registro, detalles) {
    try {
      await pool.query(
        `INSERT INTO historial_cambios (id_usuario, accion, tabla, id_registro, detalles, fecha_cambio) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [id_usuario, accion, tabla, id_registro, JSON.stringify(detalles)]
      );
    } catch (error) {
      console.error('Error registrando auditoría:', error);
    }
  }

  /**
   * Obtener nombre display del tipo
   */
  static obtenerNombreTipo(tipo) {
    const nombres = {
      'pdf': 'Documento PDF',
      'video': 'Video',
      'documento': 'Documento de Texto',
      'imagen': 'Imagen',
      'presentacion': 'Presentación',
      'url': 'Enlace Externo'
    };
    return nombres[tipo] || tipo;
  }

  /**
   * Obtener estadísticas de contenido
   */
  static async obtenerEstadisticasContenido(id_modulo, id_seccion = null) {
    let query = `
      SELECT 
        tipo,
        COUNT(*) as cantidad,
        SUM(CHAR_LENGTH(archivo)) as tamano_total
      FROM modulo_contenido
      WHERE id_modulo = ?
    `;
    const params = [id_modulo];

    if (id_seccion) {
      query += ' AND id_seccion = ?';
      params.push(id_seccion);
    }

    query += ' GROUP BY tipo';

    const [rows] = await pool.query(query, params);
    
    return rows.map(row => ({
      tipo: this.obtenerNombreTipo(row.tipo),
      cantidad: row.cantidad,
      tamano_total: row.tamano_total || 0
    }));
  }
}

export default ContenidoUploadService;
