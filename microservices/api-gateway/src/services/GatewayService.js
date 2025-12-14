import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

class GatewayService {
  async forwardRequest(path, method = 'GET', data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${AUTH_SERVICE_URL}${path}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`Auth Service Error: ${error.message}`);
    }
  }

  async callService(baseUrl, path, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${baseUrl}${path}`,
        headers: { 'Content-Type': 'application/json' }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
    }
  }

  getServiceUrls() {
    return {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      course: process.env.COURSE_SERVICE_URL || 'http://localhost:3002',
      content: process.env.CONTENT_SERVICE_URL || 'http://localhost:3003',
      ia: process.env.IA_SERVICE_URL || 'http://localhost:3004'
    };
  }
}

export default new GatewayService();
