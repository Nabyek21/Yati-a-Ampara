import { ClaseModel } from "../models/ClaseModel.js";
import { ModuloModel } from "../models/ModuloModel.js";
import { HoraClaseModel } from "../models/HoraClaseModel.js";
import { SeccionModel } from "../models/SeccionModel.js";
import { CursoModel } from "../models/CursoModel.js";
import { pool } from "../config/database.js";

// Función auxiliar para obtener todas las fechas de un día de la semana entre dos fechas
function getFechasPorDiaSemana(fechaInicio, fechaFin, diaSemana) {
  const fechas = [];
  const fecha = new Date(fechaInicio);
  const fechaFinDate = new Date(fechaFin);
  
  // Mapeo de días de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const diasMap = {
    'Domingo': 0,
    'Lunes': 1,
    'Martes': 2,
    'Miercoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sabado': 6
  };
  
  const diaObjetivo = diasMap[diaSemana];
  
  // Avanzar hasta el primer día de la semana objetivo
  while (fecha.getDay() !== diaObjetivo && fecha <= fechaFinDate) {
    fecha.setDate(fecha.getDate() + 1);
  }
  
  // Agregar todas las fechas del día objetivo en el rango
  while (fecha <= fechaFinDate) {
    fechas.push(new Date(fecha));
    fecha.setDate(fecha.getDate() + 7); // Siguiente semana
  }
  
  return fechas;
}

export const generateClasesForSeccion = async (req, res) => {
  try {
    const { id_seccion, id_horas } = req.body; // id_horas es un array de IDs de horas_clase
    
    if (!id_seccion || !id_horas || !Array.isArray(id_horas) || id_horas.length === 0) {
      return res.status(400).json({ message: "Se requiere id_seccion y un array de id_horas" });
    }

    // 1. Obtener información de la sección (necesitamos id_curso y id_docente_perfil)
    const seccionData = await SeccionModel.findById(id_seccion);
    
    if (!seccionData) {
      return res.status(404).json({ message: "Sección no encontrada" });
    }
    
    // Extraer los campos necesarios de la sección
    const seccion = {
      id_curso: seccionData.id_curso,
      id_docente_perfil: seccionData.id_docente_perfil,
      fecha_inicio: seccionData.fecha_inicio,
      fecha_fin: seccionData.fecha_fin
    };

    // Validar que la sección tenga fechas
    if (!seccion.fecha_inicio || !seccion.fecha_fin) {
      return res.status(400).json({ message: "La sección debe tener fecha_inicio y fecha_fin definidas para generar clases" });
    }

    // 2. Obtener todos los módulos del curso
    let modulos = await ModuloModel.getByCurso(seccion.id_curso);
    
    if (modulos.length === 0) {
      return res.status(400).json({ message: "El curso no tiene módulos asociados" });
    }

    // 3. Si los módulos no tienen fechas, calcularlas automáticamente
    const modulosSinFechas = modulos.filter(m => !m.fecha_inicio || !m.fecha_fin);
    if (modulosSinFechas.length > 0) {
      // Obtener la duración del curso en semanas
      const curso = await CursoModel.findById(seccion.id_curso);
      const duracionSemanas = curso?.duracion_semanas || modulos.length;
      
      // Calcular la duración en días del rango de fechas de la sección
      const fechaInicio = new Date(seccion.fecha_inicio);
      const fechaFin = new Date(seccion.fecha_fin);
      const diasTotales = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)); // Diferencia en días
      
      // Calcular días por módulo (cada módulo representa aproximadamente 1 semana)
      // Si hay 18 módulos y 18 semanas, cada módulo = 1 semana
      const semanasPorModulo = duracionSemanas / modulos.length;
      const diasPorModulo = Math.floor((diasTotales / duracionSemanas) * semanasPorModulo);

      // Actualizar cada módulo con sus fechas calculadas
      for (let i = 0; i < modulos.length; i++) {
        const modulo = modulos[i];
        if (!modulo.fecha_inicio || !modulo.fecha_fin) {
          // Calcular fecha_inicio del módulo
          const moduloFechaInicio = new Date(fechaInicio);
          moduloFechaInicio.setDate(moduloFechaInicio.getDate() + (i * diasPorModulo));
          
          // Calcular fecha_fin del módulo
          // El último módulo termina en fecha_fin de la sección
          // Los demás módulos terminan justo antes del siguiente módulo
          let moduloFechaFin;
          if (i === modulos.length - 1) {
            moduloFechaFin = new Date(fechaFin);
          } else {
            moduloFechaFin = new Date(moduloFechaInicio);
            moduloFechaFin.setDate(moduloFechaFin.getDate() + diasPorModulo - 1);
          }

          // Actualizar el módulo en la base de datos
          await pool.query(
            "UPDATE modulos SET fecha_inicio = ?, fecha_fin = ? WHERE id_modulo = ?",
            [
              moduloFechaInicio.toISOString().split('T')[0],
              moduloFechaFin.toISOString().split('T')[0],
              modulo.id_modulo
            ]
          );

          // Actualizar el objeto módulo en memoria
          modulo.fecha_inicio = moduloFechaInicio.toISOString().split('T')[0];
          modulo.fecha_fin = moduloFechaFin.toISOString().split('T')[0];
        }
      }
    }

    // 4. Obtener información de las horas seleccionadas
    const horas = [];
    for (const id_hora of id_horas) {
      const hora = await HoraClaseModel.findById(id_hora);
      if (hora) {
        horas.push(hora);
      }
    }

    if (horas.length === 0) {
      return res.status(400).json({ message: "No se encontraron horas válidas" });
    }

    // 5. Eliminar clases existentes de esta sección (para regenerar)
    await ClaseModel.deleteBySeccion(id_seccion);

    // 6. Generar clases para cada módulo y cada hora seleccionada
    let clasesCreadas = 0;
    
    for (const modulo of modulos) {
      // Los módulos ahora deberían tener fechas (se calcularon automáticamente si no las tenían)
      if (!modulo.fecha_inicio || !modulo.fecha_fin) {
        console.warn(`Módulo ${modulo.id_modulo} no tiene fechas definidas después del cálculo automático, se omite`);
        continue;
      }

      for (const hora of horas) {
        // Obtener todas las fechas del día de la semana en el rango del módulo
        const fechas = getFechasPorDiaSemana(
          modulo.fecha_inicio,
          modulo.fecha_fin,
          hora.dia_semana
        );

        // Crear una clase para cada fecha
        for (const fecha of fechas) {
          await ClaseModel.create({
            id_modulo: modulo.id_modulo,
            id_seccion: id_seccion,
            id_docente_perfil: seccion.id_docente_perfil,
            id_hora: hora.id_hora,
            fecha_clase: fecha.toISOString().split('T')[0] // Formato YYYY-MM-DD
          });
          clasesCreadas++;
        }
      }
    }

    res.json({ 
      message: `Se generaron ${clasesCreadas} clases correctamente`,
      clases_generadas: clasesCreadas
    });

  } catch (err) {
    console.error("ERROR generando clases:", err);
    res.status(500).json({ message: "Error interno al generar clases" });
  }
};

export const getAllClases = async (req, res) => {
  try {
    const filters = req.query;
    console.log('🔍 Obteniendo clases con filtros:', filters);
    const clases = await ClaseModel.getAll(filters);
    console.log('✅ Clases obtenidas:', clases.length);
    res.json(clases);
  } catch (err) {
    console.error("❌ ERROR obteniendo clases:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ message: "Error interno al obtener clases", error: err.message });
  }
};

export const createClase = async (req, res) => {
  try {
    const { id_modulo, id_seccion, id_docente_perfil, id_hora, fecha_clase } = req.body;
    
    if (!id_modulo || !id_seccion || !id_docente_perfil || !id_hora || !fecha_clase) {
      return res.status(400).json({ message: "Se requieren id_modulo, id_seccion, id_docente_perfil, id_hora y fecha_clase" });
    }

    const result = await ClaseModel.create({
      id_modulo: parseInt(id_modulo),
      id_seccion: parseInt(id_seccion),
      id_docente_perfil: parseInt(id_docente_perfil),
      id_hora: parseInt(id_hora),
      fecha_clase
    });

    res.status(201).json({ 
      message: "Clase creada correctamente", 
      id_clase: result.insertId 
    });
  } catch (err) {
    console.error("ERROR creando clase:", err);
    res.status(500).json({ message: "Error interno al crear clase" });
  }
};

export const updateClase = async (req, res) => {
  try {
    const { id_clase } = req.params;
    const data = req.body;
    
    if (!id_clase) {
      return res.status(400).json({ message: "Se requiere id_clase" });
    }

    const updated = await ClaseModel.update(parseInt(id_clase), data);
    if (updated.affectedRows === 0) {
      return res.status(404).json({ message: "Clase no encontrada o sin cambios" });
    }
    
    res.json({ message: "Clase actualizada correctamente" });
  } catch (err) {
    console.error("ERROR actualizando clase:", err);
    res.status(500).json({ message: "Error interno al actualizar clase" });
  }
};

export const deleteClase = async (req, res) => {
  try {
    const { id_clase } = req.params;
    
    if (!id_clase) {
      return res.status(400).json({ message: "Se requiere id_clase" });
    }

    const deleted = await ClaseModel.delete(parseInt(id_clase));
    if (deleted.affectedRows === 0) {
      return res.status(404).json({ message: "Clase no encontrada" });
    }
    
    res.json({ message: "Clase eliminada correctamente" });
  } catch (err) {
    console.error("ERROR eliminando clase:", err);
    res.status(500).json({ message: "Error interno al eliminar clase" });
  }
};

