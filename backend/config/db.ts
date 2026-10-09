import mongoose from 'mongoose';
import { config } from './env.ts';
import { logger } from '../utils/logger.ts';

let mongoMemoryServerInstance: any = null;

export interface DatabaseState {
  isConnected: boolean;
  state: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'uninitialized';
  uriConfigured: boolean;
  mode: 'standalone' | 'in-process-memory' | 'unconnected';
}

export const getDbState = (): DatabaseState => {
  const states: Record<number, DatabaseState['state']> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const currentReadyState = mongoose.connection.readyState;
  return {
    isConnected: currentReadyState === 1,
    state: states[currentReadyState] || 'uninitialized',
    uriConfigured: Boolean(config.mongodbUri),
    mode: mongoMemoryServerInstance ? 'in-process-memory' : currentReadyState === 1 ? 'standalone' : 'unconnected',
  };
};

export const connectDatabase = async (): Promise<boolean> => {
  // If already connected, skip
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // 1. First attempt connecting to configured URI (if standard server is running)
  if (config.mongodbUri) {
    try {
      logger.info(`Attempting MongoDB connection to ${config.mongodbUri}...`);
      await mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 1500,
        connectTimeoutMS: 2000,
      });
      logger.info('MongoDB connected successfully to primary URI.');
      return true;
    } catch (err: any) {
      logger.info(`Standalone MongoDB not available (${err.message}). Starting in-process MongoDB instance...`);
    }
  }

  // 2. Fallback to MongoMemoryServer for guaranteed in-process genuine MongoDB instance
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!mongoMemoryServerInstance) {
      mongoMemoryServerInstance = await MongoMemoryServer.create({
        instance: { dbName: 'authshield' },
      });
    }
    const inMemoryUri = mongoMemoryServerInstance.getUri();
    await mongoose.connect(inMemoryUri);
    logger.info(`MongoDB connected successfully via in-process memory instance at ${inMemoryUri}`);
    return true;
  } catch (error: any) {
    logger.error('Failed to initialize in-process MongoDB:', error.message);
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err.message);
});

