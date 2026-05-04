import 'dotenv/config';
import express from 'express';
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { logger } from './config/logger';

app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 8000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}/api/v1`;

async function bootstrap() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🚀 Base URL: ${BASE_URL}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down server...');
  await disconnectDB();
  process.exit(0);
});

bootstrap();