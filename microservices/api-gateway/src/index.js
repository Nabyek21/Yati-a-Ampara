import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import iaRoutes from './routes/iaRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/ia', iaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'API Gateway',
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    microservices: {
      auth: 'http://localhost:3001',
      course: 'http://localhost:3002',
      content: 'http://localhost:3003',
      ia: 'http://localhost:3004'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API Gateway - SOA Yatinya',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      content: '/api/content',
      ia: '/api/ia',
      health: '/health'
    }
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🌐 API Gateway running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Auth Service: http://localhost:3001`);
  console.log(`   Course Service: http://localhost:3002`);
  console.log(`   Content Service: http://localhost:3003`);
  console.log(`   IA Service: http://localhost:3004`);
});

export default app;
