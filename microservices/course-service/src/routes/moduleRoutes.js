import express from 'express';
import {
  getAllModules,
  getModule,
  getModulesByCourse,
  createModule,
  updateModule,
  deleteModule,
  reorderModules
} from '../controllers/moduleController.js';

const router = express.Router();

router.get('/', getAllModules);
router.get('/course/:courseId', getModulesByCourse);
router.get('/:id', getModule);
router.post('/', createModule);
router.put('/:id', updateModule);
router.delete('/:id', deleteModule);
router.post('/course/:courseId/reorder', reorderModules);

export default router;
