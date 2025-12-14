import iaService from '../services/IAService.js';

export const generateSummary = (req, res, next) => {
  try {
    const { content_id, usuario_id } = req.body;

    if (!content_id || !usuario_id) {
      return res.status(400).json({
        error: 'content_id y usuario_id son requeridos'
      });
    }

    const summary = iaService.generateSummary(content_id, usuario_id);
    res.status(201).json({
      success: true,
      message: 'Resumen generado exitosamente',
      data: summary
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSummary = (req, res, next) => {
  try {
    const { id } = req.params;
    const summary = iaService.getSummary(id);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getSummariesByContent = (req, res, next) => {
  try {
    const { contentId } = req.params;
    const summaries = iaService.getSummariesByContent(contentId);
    res.json({
      success: true,
      data: summaries
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSummaries = (req, res, next) => {
  try {
    const summaries = iaService.getAllSummaries();
    res.json({
      success: true,
      data: summaries
    });
  } catch (error) {
    next(error);
  }
};

export const generateQuestions = (req, res, next) => {
  try {
    const { content_id, cantidad = 3, dificultad = 'MEDIA' } = req.body;

    if (!content_id) {
      return res.status(400).json({
        error: 'content_id es requerido'
      });
    }

    const questions = iaService.generateQuestions(content_id, cantidad, dificultad);
    res.status(201).json({
      success: true,
      message: 'Preguntas generadas exitosamente',
      data: questions
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getQuestion = (req, res, next) => {
  try {
    const { id } = req.params;
    const question = iaService.getQuestion(id);
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getQuestionsByContent = (req, res, next) => {
  try {
    const { contentId } = req.params;
    const questions = iaService.getQuestionsByContent(contentId);
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

export const getAllQuestions = (req, res, next) => {
  try {
    const questions = iaService.getAllQuestions();
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsByDifficulty = (req, res, next) => {
  try {
    const { dificultad } = req.params;
    const questions = iaService.getQuestionsByDifficulty(dificultad);
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

export const generateLearningPath = (req, res, next) => {
  try {
    const { userId } = req.params;
    const learningPath = iaService.generateLearningPath(userId);
    res.json({
      success: true,
      data: learningPath
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
