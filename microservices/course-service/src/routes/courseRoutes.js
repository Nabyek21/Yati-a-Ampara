import express from 'express';
import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getDocenteCourses,
  getActiveCourses
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/active', getActiveCourses);
router.get('/docente/:docenteId', getDocenteCourses);
router.get('/:id', getCourse);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
