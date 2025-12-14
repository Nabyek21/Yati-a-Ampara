import gatewayService from '../services/GatewayService.js';

const IA_SERVICE_URL = process.env.IA_SERVICE_URL || 'http://localhost:3004';

export const generateSummary = async (req, res, next) => {
  try {
    const result = await gatewayService.callService(
      IA_SERVICE_URL,
      '/ia/summaries/generate',
      'POST',
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gatewayService.callService(
      IA_SERVICE_URL,
      `/ia/summaries/${id}`,
      'GET'
    );
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const generateQuestions = async (req, res, next) => {
  try {
    const result = await gatewayService.callService(
      IA_SERVICE_URL,
      '/ia/questions/generate',
      'POST',
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gatewayService.callService(
      IA_SERVICE_URL,
      `/ia/questions/${id}`,
      'GET'
    );
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getLearningPath = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await gatewayService.callService(
      IA_SERVICE_URL,
      `/ia/learning-path/${userId}`,
      'GET'
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
