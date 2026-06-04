import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * The URI is loaded from environment variables (.env).
 */
export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital_noticeboard';
    
    console.log(`Connecting to MongoDB at: ${connString}`);
    await mongoose.connect(connString);
    
    console.log('MongoDB Database Connected Successfully.');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); // Exit process with failure
  }
};
