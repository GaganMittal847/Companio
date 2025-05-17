import { Request, Response, Router } from 'express';
import { MessageModel } from '../models/MessageModel';
import { ApiResponseDto } from '../models/Dto/ApiResponseDto';
import { ApiResponse, HttpStatus } from '../config/constant/constant';
import { MessageEntity } from '../entities/MessageEntity';

// Chat Controller functions

// 1. Get messages by requestId
export const getMessagesByRequestId = async (req: Request, res: Response): Promise<Response> => {
    const apiResponseDto = new ApiResponseDto();
    try {
        const requestId = parseInt(req.params.requestId, 10);

        if (isNaN(requestId)) {
            apiResponseDto.status = ApiResponse.ERROR;
            apiResponseDto.message = 'Invalid requestId provided.';
            apiResponseDto.responseCode = HttpStatus.BAD_REQUEST;
            return res.status(HttpStatus.BAD_REQUEST).json(apiResponseDto);
        }

        const messages = await MessageModel.find({ requestId: requestId }).sort({ cDt: 1 });

        apiResponseDto.status = ApiResponse.SUCCESS;
        apiResponseDto.data = messages;
        apiResponseDto.responseCode = HttpStatus.OK;
        return res.status(HttpStatus.OK).json(apiResponseDto);
    } catch (error) {
        console.error('Error fetching messages by requestId:', error);
        apiResponseDto.status = ApiResponse.ERROR;
        apiResponseDto.message = ApiResponse.GENERIC_ERROR_MESSAGE;
        apiResponseDto.responseCode = HttpStatus.INTERNAL_SERVER_ERROR;
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponseDto);
    }
};

// 2. Delete message by id
export const deleteMessageById = async (req: Request, res: Response): Promise<Response> => {
    const apiResponseDto = new ApiResponseDto();
    try {
        const messageId = req.params.id;

        const deletedMessage = await MessageModel.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            apiResponseDto.status = ApiResponse.ERROR;
            apiResponseDto.message = 'Message not found.';
            apiResponseDto.responseCode = HttpStatus.NOT_FOUND;
            return res.status(HttpStatus.NOT_FOUND).json(apiResponseDto);
        }

        apiResponseDto.status = ApiResponse.SUCCESS;
        apiResponseDto.message = 'Message deleted successfully.';
        apiResponseDto.responseCode = HttpStatus.OK;
        return res.status(HttpStatus.OK).json(apiResponseDto);
    } catch (error) {
        console.error('Error deleting message by id:', error);
        apiResponseDto.status = ApiResponse.ERROR;
        apiResponseDto.message = ApiResponse.GENERIC_ERROR_MESSAGE;
        apiResponseDto.responseCode = HttpStatus.INTERNAL_SERVER_ERROR;
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponseDto);
    }
};

// 3. Update message by id
export const updateMessageById = async (req: Request, res: Response): Promise<Response> => {
    const apiResponseDto = new ApiResponseDto();
    try {
        const messageId = req.params.id;
        const updateData = req.body;

        // Update the creation date (cDt) to the current timestamp
        updateData.cDt = new Date();

        const updatedMessage = await MessageModel.findByIdAndUpdate(messageId, updateData, { new: true });

        if (!updatedMessage) {
            apiResponseDto.status = ApiResponse.ERROR;
            apiResponseDto.message = 'Message not found.';
            apiResponseDto.responseCode = HttpStatus.NOT_FOUND;
            return res.status(HttpStatus.NOT_FOUND).json(apiResponseDto);
        }

        apiResponseDto.status = ApiResponse.SUCCESS;
        apiResponseDto.message = 'Message updated successfully.';
        apiResponseDto.data = updatedMessage;
        apiResponseDto.responseCode = HttpStatus.OK;
        return res.status(HttpStatus.OK).json(apiResponseDto);
    } catch (error) {
        console.error('Error updating message by id:', error);
        apiResponseDto.status = ApiResponse.ERROR;
        apiResponseDto.message = ApiResponse.GENERIC_ERROR_MESSAGE;
        apiResponseDto.responseCode = HttpStatus.INTERNAL_SERVER_ERROR;
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponseDto);
    }
};

// 4. Create message
export const createMessage = async (req: Request, res: Response): Promise<Response> => {
    const apiResponseDto = new ApiResponseDto();
    try {
        const { requestId, msg, userId, userName, url } = req.body;

        // Basic validation
        if (!requestId || !msg || !userId || !userName) {
             apiResponseDto.status = ApiResponse.ERROR;
             apiResponseDto.message = 'Missing required fields (requestId, msg, userId, userName).';
             apiResponseDto.responseCode = HttpStatus.BAD_REQUEST;
             return res.status(HttpStatus.BAD_REQUEST).json(apiResponseDto);
        }

        // Create a new message instance
        const newMessage = new MessageModel({
            requestId: requestId,
            msg: msg,
            userId: userId,
            userName: userName,
            url: url,
            cDt: new Date() // Set creation date on backend
        });

        // Save the new message to the database
        await newMessage.save();

        apiResponseDto.status = ApiResponse.SUCCESS;
        apiResponseDto.message = 'Message created successfully.';
        apiResponseDto.data = newMessage;
        apiResponseDto.responseCode = HttpStatus.CREATED; // Use 201 for creation
        return res.status(HttpStatus.CREATED).json(apiResponseDto);
    } catch (error) {
        console.error('Error creating message:', error);
        apiResponseDto.status = ApiResponse.ERROR;
        apiResponseDto.message = ApiResponse.GENERIC_ERROR_MESSAGE;
        apiResponseDto.responseCode = HttpStatus.INTERNAL_SERVER_ERROR;
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponseDto);
    }
};