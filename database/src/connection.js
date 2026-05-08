import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('MONGO_URI is missing. Running with local seed data.');
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    console.warn(`MongoDB connection failed: ${error.message}`);
    return false;
  }
}
