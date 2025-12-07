import express from "express";
import {
  getContenidoByModulo,
  getContenidoBySeccion,
  getContenidoById,
  createContenido,
  updateContenido,
  deleteContenido
} from "../controllers/moduloContenidoController.js";

const router = express.Router();

// Ruta raíz que acepta query params: ?id_modulo=X&id_seccion=Y
router.get("/", (req, res, next) => {
  const { id_modulo, id_seccion } = req.query;
  if (id_modulo) {
    req.params.id_modulo = id_modulo;
    return getContenidoByModulo(req, res);
  } else if (id_seccion) {
    req.params.id_seccion = id_seccion;
    return getContenidoBySeccion(req, res);
  } else {
    return res.status(400).json({ message: "Se requiere id_modulo o id_seccion" });
  }
});

router.get("/modulo/:id_modulo", getContenidoByModulo);
router.get("/seccion/:id_seccion", getContenidoBySeccion);
router.get("/:id_contenido", getContenidoById);
router.post("/", createContenido);
router.put("/:id_contenido", updateContenido);
router.delete("/:id_contenido", deleteContenido);

export default router;

