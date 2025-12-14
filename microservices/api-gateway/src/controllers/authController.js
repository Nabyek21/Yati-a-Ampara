import gatewayService from '../services/GatewayService.js';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

export const register = async (req, res, next) => {
  try {
    const result = await gatewayService.callService(
      AUTH_SERVICE_URL,
      '/auth/register',
      'POST',
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await gatewayService.callService(
      AUTH_SERVICE_URL,
      '/auth/login',
      'POST',
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const verify = async (req, res, next) => {
  try {
    const result = await gatewayService.callService(
      AUTH_SERVICE_URL,
      '/auth/verify',
      'POST',
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (req, res, next) => {
  try {
    const result = await gatewayService.callService(
      AUTH_SERVICE_URL,
      '/auth/logout',
      'POST',
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
