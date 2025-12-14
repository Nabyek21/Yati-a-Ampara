import gatewayService from '../services/GatewayService.js';

const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || 'http://localhost:3002';

export const getAllCourses = async (req, res, next) => {
  try {
    const result = await gatewayService.callService(
      COURSE_SERVICE_URL,
      '/courses',
      'GET'
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gatewayService.callService(
      COURSE_SERVICE_URL,
      `/courses/${id}`,
      'GET'
    );
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const result = await gatewayService.callService(
      COURSE_SERVICE_URL,
      '/courses',
      'POST',
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gatewayService.callService(
      COURSE_SERVICE_URL,
      `/courses/${id}`,
      'PUT',
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gatewayService.callService(
      COURSE_SERVICE_URL,
      `/courses/${id}`,
      'DELETE'
    );
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
