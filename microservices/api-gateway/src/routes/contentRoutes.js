import express from 'express';
import {
  getAllContents,
  getContent,
  createContent,
  updateContent,
  deleteContent
} from '../controllers/contentController.js';

const router = express.Router();

router.get('/', getAllContents);
router.get('/:id', getContent);
router.post('/', createContent);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router;
