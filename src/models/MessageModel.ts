import mongoose, { Schema, Document, Model } from 'mongoose';
import { MessageEntity } from '../entities/MessageEntity';

// Define the Mongoose schema for the Message entity
const MessageSchema: Schema = new Schema({
    requestId: { type: Number, required: true }, // Primary key for grouping messages
    cDt: { type: Date, default: Date.now }, // Creation date, defaults to current timestamp
    msg: { type: String, required: true }, // Message content
    userId: { type: String, required: true }, // ID of the user who sent the message
    userName: { type: String, required: true }, // Name of the user who sent the message
    url: { type: String, required: false }, // Optional field for attachment URL
});

// Create and export the Message model
export const MessageModel: Model<MessageEntity> = mongoose.model<MessageEntity>('Message', MessageSchema);