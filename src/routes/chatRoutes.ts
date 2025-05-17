import express from 'express';
import { getMessagesByRequestId, deleteMessageById, updateMessageById, createMessage } from '../controllers/ChatController';

const router = express.Router();

// Route to get messages by requestId
router.get('/messages/:requestId', getMessagesByRequestId);

// Route to delete a message by id
router.delete('/messages/:id', deleteMessageById);

// Route to update a message by id
router.put('/messages/:id', updateMessageById);

// Route to create a new message
router.post('/messages', createMessage);

export { router as chatRoutes };