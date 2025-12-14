const config = {
  gateway: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    course: process.env.COURSE_SERVICE_URL || 'http://localhost:3002',
    content: process.env.CONTENT_SERVICE_URL || 'http://localhost:3003',
    ia: process.env.IA_SERVICE_URL || 'http://localhost:3004'
  },
  timeout: process.env.SERVICE_TIMEOUT || 5000
};

export default config;
