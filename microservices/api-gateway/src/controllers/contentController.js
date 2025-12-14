import gatewayService from '../services/GatewayService.js';

const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || 'http://localhost:3003';

export const getAllContents = async (req, res, next) => {
  try {
    const result = await gatewayService.callService(
      CONTENT_SERVICE_URL,
      '/content',
      'GET'
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gatewayService.callService(
      CONTENT_SERVICE_URL,
      `/content/${id}`,
      'GET'
    );
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const createContent = async (req, res, next) => {
  try {
    const result = await gatewayService.callService(
      CONTENT_SERVICE_URL,
      '/content',
      'POST',
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gatewayService.callService(
      CONTENT_SERVICE_URL,
      `/content/${id}`,
      'PUT',
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gatewayService.callService(
      CONTENT_SERVICE_URL,
      `/content/${id}`,
      'DELETE'
    );
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
