import { pool } from '../config/database.js';

class PonderacionSectionController {
  // Obtener configuración de ponderación de una sección
  static async getPonderaciones(req, res) {
    try {
      const { id_seccion } = req.params;

      if (!id_seccion) {
        return res.status(400).json({
          success: false,
          error: 'id_seccion es requerido'
        });
      }

      const [ponderaciones] = await pool.query(
        `SELECT id_ponderacion, id_seccion, tipo_evaluacion, peso_porcentaje, descripcion, activo
         FROM ponderaciones
         WHERE id_seccion = ? AND activo = TRUE
         ORDER BY FIELD(tipo_evaluacion, 'práctica', 'examen', 'examen_final')`,
        [id_seccion]
      );

      // Si no hay configuración, retornar valores por defecto
      if (!ponderaciones || ponderaciones.length === 0) {
        return res.json([
          { tipo_evaluacion: 'práctica', peso_porcentaje: 10, descripcion: 'Práctica Calificada (10% c/u, máx 3)' },
          { tipo_evaluacion: 'examen', peso_porcentaje: 30, descripcion: 'Examen Normal (30% compartido)' },
          { tipo_evaluacion: 'examen_final', peso_porcentaje: 40, descripcion: 'Examen Final (40%)' }
        ]);
      }

      res.json(ponderaciones);

    } catch (error) {
      console.error('Error en getPonderaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener ponderaciones',
        details: error.message
      });
    }
  }

  // Guardar/actualizar configuración de ponderación
  static async guardarPonderaciones(req, res) {
    try {
      const { id_seccion } = req.params;
      const { ponderaciones } = req.body;

      if (!id_seccion || !ponderaciones || !Array.isArray(ponderaciones)) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros inválidos. Se requiere id_seccion y array de ponderaciones'
        });
      }

      // Validar que la suma sea 100%
      const total = ponderaciones.reduce((sum, p) => sum + (parseFloat(p.peso_porcentaje) || 0), 0);
      
      if (total !== 100) {
        return res.status(400).json({
          success: false,
          error: `La suma de porcentajes debe ser 100%, actualmente es ${total}%`
        });
      }

      // Validar que la sección existe
      const [seccion] = await pool.query(
        'SELECT id_seccion FROM secciones WHERE id_seccion = ?',
        [id_seccion]
      );

      if (!seccion || seccion.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Sección no encontrada'
        });
      }

      // Iniciar transacción
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Actualizar ponderaciones (borrar existentes y crear nuevas)
        await connection.query(
          'DELETE FROM ponderaciones WHERE id_seccion = ?',
          [id_seccion]
        );

        for (const pond of ponderaciones) {
          await connection.query(
            `INSERT INTO ponderaciones (id_seccion, tipo_evaluacion, peso_porcentaje, descripcion, activo, fecha_creacion)
             VALUES (?, ?, ?, ?, TRUE, NOW())`,
            [
              id_seccion,
              pond.tipo_evaluacion,
              parseFloat(pond.peso_porcentaje),
              pond.descripcion || ''
            ]
          );
        }

        await connection.commit();
        console.log(`✅ Ponderaciones guardadas para sección ${id_seccion}`);

        res.json({
          success: true,
          message: 'Configuración de ponderación guardada correctamente',
          data: ponderaciones
        });

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Error en guardarPonderaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al guardar ponderaciones',
        details: error.message
      });
    }
  }

  // Obtener tipos de actividad disponibles
  static async getTiposActividad(req, res) {
    try {
      const { id_seccion } = req.params;

      if (!id_seccion) {
        return res.status(400).json({
          success: false,
          error: 'id_seccion es requerido'
        });
      }

      const [tipos] = await pool.query(
        `SELECT id_tipo, nombre, codigo, color, icono, activo
         FROM tipos_actividad
         WHERE id_seccion = ? AND activo = TRUE
         ORDER BY nombre`,
        [id_seccion]
      );

      // Si no hay tipos configurados, retornar por defecto
      if (!tipos || tipos.length === 0) {
        return res.json([
          { nombre: 'Práctica Calificada', codigo: 'practica', color: '#3b82f6', icono: '✏️' },
          { nombre: 'Examen', codigo: 'examen', color: '#f59e0b', icono: '📋' },
          { nombre: 'Examen Final', codigo: 'examen_final', color: '#ef4444', icono: '🏆' }
        ]);
      }

      res.json(tipos);

    } catch (error) {
      console.error('Error en getTiposActividad:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener tipos de actividad',
        details: error.message
      });
    }
  }

  // Crear nuevo tipo de actividad
  static async crearTipoActividad(req, res) {
    try {
      const { id_seccion } = req.params;
      const { nombre, codigo, color, icono } = req.body;

      if (!nombre || !codigo) {
        return res.status(400).json({
          success: false,
          error: 'Nombre y código son requeridos'
        });
      }

      const [resultado] = await pool.query(
        `INSERT INTO tipos_actividad (id_seccion, nombre, codigo, color, icono, activo, fecha_creacion)
         VALUES (?, ?, ?, ?, ?, TRUE, NOW())`,
        [id_seccion, nombre, codigo, color || '#6b7280', icono || '📝']
      );

      console.log(`✅ Tipo de actividad creado: ${nombre} para sección ${id_seccion}`);

      res.json({
        success: true,
        id_tipo: resultado.insertId,
        message: 'Tipo de actividad creado correctamente'
      });

    } catch (error) {
      console.error('Error en crearTipoActividad:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          error: 'Este código ya existe para la sección'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error al crear tipo de actividad',
        details: error.message
      });
    }
  }
}

export default PonderacionSectionController;
