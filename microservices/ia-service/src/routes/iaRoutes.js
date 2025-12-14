import express from 'express';
import {
  generateSummary,
  getSummary,
  getSummariesByContent,
  getAllSummaries,
  generateQuestions,
  getQuestion,
  getQuestionsByContent,
  getAllQuestions,
  getQuestionsByDifficulty,
  generateLearningPath
} from '../controllers/iaController.js';

const router = express.Router();

// Summary routes
router.get('/summaries', getAllSummaries);
router.get('/summaries/:id', getSummary);
router.get('/summaries/content/:contentId', getSummariesByContent);
router.post('/summaries/generate', generateSummary);

// Questions routes
router.get('/questions', getAllQuestions);
router.get('/questions/:id', getQuestion);
router.get('/questions/content/:contentId', getQuestionsByContent);
router.get('/questions/difficulty/:dificultad', getQuestionsByDifficulty);
router.post('/questions/generate', generateQuestions);

// Learning path route
router.get('/learning-path/:userId', generateLearningPath);

export default router;
