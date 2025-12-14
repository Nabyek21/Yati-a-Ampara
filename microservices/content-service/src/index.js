import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contentRoutes from './routes/contentRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/content', contentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Content Service',
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`📄 Content Service running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

export default app;
