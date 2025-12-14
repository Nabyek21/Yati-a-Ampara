import express from 'express';
import {
  generateSummary,
  getSummary,
  generateQuestions,
  getQuestion,
  getLearningPath
} from '../controllers/iaController.js';

const router = express.Router();

router.post('/summaries/generate', generateSummary);
router.get('/summaries/:id', getSummary);
router.post('/questions/generate', generateQuestions);
router.get('/questions/:id', getQuestion);
router.get('/learning-path/:userId', getLearningPath);

export default router;
