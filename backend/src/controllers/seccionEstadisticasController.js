import { SeccionEstadisticasModel } from '../models/SeccionEstadisticasModel.js';

export async function getEstadisticasPorSeccion(req, res) {
  try {
    const { id_seccion } = req.params;

    if (!id_seccion) {
      return res.status(400).json({ message: 'id_seccion es requerido' });
    }

    const data = await SeccionEstadisticasModel.getEstadisticasPorSeccion(id_seccion);
    
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (error) {
    console.error('Error en getEstadisticasPorSeccion:', error);
    res.status(500).json({ 
      message: 'Error obteniendo estadísticas',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
