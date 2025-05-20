import { Document } from 'mongoose';

// Defining the Message Entity interface
export interface MessageEntity extends Document {
    requestId: number; // Primary key for grouping messages (as per schema)
    cDt: Date; // Creation date of the message (using Date for Mongoose compatibility)
    msg: string; // The message content
    userId: string; // ID of the user who sent the message
    userName: string; // Name of the user who sent the message
    url?: string; // Optional field for attachment URL
}