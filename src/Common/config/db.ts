import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error('MONGO_URI  variable is not defined.');
}
const connectToDatabase = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected with connection pooling');
    } catch (err) {
        console.error('Database connection error:', err);
    }
};

export default connectToDatabase;
