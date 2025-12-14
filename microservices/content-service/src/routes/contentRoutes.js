import express from 'express';
import {
  getAllContents,
  getContent,
  getContentsByModule,
  createContent,
  updateContent,
  deleteContent,
  getContentsByType,
  reorderContents
} from '../controllers/contentController.js';

const router = express.Router();

router.get('/', getAllContents);
router.get('/type/:tipo', getContentsByType);
router.get('/module/:moduleId', getContentsByModule);
router.get('/:id', getContent);
router.post('/', createContent);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);
router.post('/module/:moduleId/reorder', reorderContents);

export default router;
