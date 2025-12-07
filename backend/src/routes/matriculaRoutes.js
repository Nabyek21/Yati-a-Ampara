import express from "express";
import { getAlumnosBySeccion, getMatriculasByUsuario, createMatricula, deleteMatricula } from "../controllers/matriculaController.js";
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/matriculas?seccion=ID
router.get("/", verificarToken, (req, res) => {
  if (req.query.seccion) {
    return getAlumnosBySeccion(req, res);
  } else if (req.query.usuario) {
    return getMatriculasByUsuario(req, res);
  } else if (req.user && req.user.id_usuario) {
    // Si no viene parámetro usuario, usar el del token
    req.query.usuario = req.user.id_usuario;
    return getMatriculasByUsuario(req, res);
  }
  res.status(400).json({ message: 'Se requiere un filtro (seccion o usuario)' });
});

// POST /api/matriculas  -> Crear nueva matrícula (protegido)
router.post('/', verificarToken, createMatricula);

// DELETE /api/matriculas/:id_matricula -> Eliminar matrícula (protegido)
router.delete('/:id_matricula', verificarToken, deleteMatricula);

export default router;
