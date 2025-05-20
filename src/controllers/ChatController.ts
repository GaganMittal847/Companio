import { Request, Response, Router } from 'express';
import { MessageModel } from '../models/MessageModel';
import { ApiResponseDto } from '../models/Dto/ApiResponseDto';
import { ApiResponse, HttpStatus } from '../constant/constant';
import { MessageEntity } from '../entities/MessageEntity';

import { ChatListModel } from '../models/ChatListModel';

// Chat Controller functions

// 1. Get messages by requestId
export class ChatController {


    public router: Router;

    constructor() {
        this.router = Router();
        this.configureRoutes();
    }

    private configureRoutes(): void {
        this.router.get('/getMessagesByRequestId/:requestId', this.getMessagesByRequestId);
        this.router.post('/deleteMessageById/:id', this.deleteMessageById);
        this.router.post('/updateMessageById/:id', this.updateMessageById);
        this.router.post('/createMessage', this.createMessage);
        this.router.post('/createChatList', this.createChatList);
        this.router.post('/getChatListsByUserId/:userId', this.getChatListsByUserId);

    }

    private getMessagesByRequestId = async (req: Request, res: Response): Promise<any> => {
        const apiResponseDto = new ApiResponseDto();
        try {
            const requestId = req.params.requestId;

            // No need to validate if it's a number anymore, as it's a string

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
    private deleteMessageById = async (req: Request, res: Response): Promise<any> => {
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
    private updateMessageById = async (req: Request, res: Response): Promise<any> => {
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
    private createMessage = async (req: Request, res: Response): Promise<any> => {
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

            // Update the corresponding chat list with the latest message
            await ChatListModel.findOneAndUpdate(
                { requestid: requestId },
                {
                    LatestMsg: msg,
                    Latest_msg_time: new Date()
                },
                { new: true, upsert: true } // Create the chat list if it doesn't exist
            );

            apiResponseDto.status = ApiResponse.SUCCESS;
            apiResponseDto.message = 'Message created successfully and chat list updated.';
            apiResponseDto.data = newMessage;
            apiResponseDto.responseCode = HttpStatus.OK; // Use 201 for creation
            return res.status(HttpStatus.OK).json(apiResponseDto);
        } catch (error) {
            console.error('Error creating message or updating chat list:', error);
            apiResponseDto.status = ApiResponse.ERROR;
            apiResponseDto.message = ApiResponse.GENERIC_ERROR_MESSAGE;
            apiResponseDto.responseCode = HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponseDto);
        }
    };

    // 5. Create chat list
    private createChatList = async (req: Request, res: Response): Promise<any> => {
        const apiResponseDto = new ApiResponseDto();
        try {
            const { requestid, Users_array } = req.body;

            // Basic validation
            if (!requestid || !Users_array || !Array.isArray(Users_array) || Users_array.length === 0) {
                apiResponseDto.status = ApiResponse.ERROR;
                apiResponseDto.message = 'Missing required fields (requestid, Users_array) or Users_array is empty/invalid.';
                apiResponseDto.responseCode = HttpStatus.BAD_REQUEST;
                return res.status(HttpStatus.BAD_REQUEST).json(apiResponseDto);
            }

            // Check if a chat list with this requestid already exists
            const existingChatList = await ChatListModel.findOne({ requestid: requestid });
            if (existingChatList) {
                apiResponseDto.status = ApiResponse.ERROR;
                apiResponseDto.message = `Chat list with requestid ${requestid} already exists.`;
                apiResponseDto.responseCode = HttpStatus.OK; // Use 409 Conflict
                return res.status(HttpStatus.OK).json(apiResponseDto);
            }

            // Create a new chat list instance
            const newChatList = new ChatListModel({
                requestid: requestid,
                Users_array: Users_array,
                cDt: new Date() // Set creation date on backend
            });

            // Save the new chat list to the database
            await newChatList.save();

            apiResponseDto.status = ApiResponse.SUCCESS;
            apiResponseDto.message = 'Chat list created successfully.';
            apiResponseDto.data = newChatList;
            apiResponseDto.responseCode = HttpStatus.OK; // Use 201 for creation
            return res.status(HttpStatus.OK).json(apiResponseDto);
        } catch (error) {
            console.error('Error creating chat list:', error);
            apiResponseDto.status = ApiResponse.ERROR;
            apiResponseDto.message = ApiResponse.GENERIC_ERROR_MESSAGE;
            apiResponseDto.responseCode = HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponseDto);
        }
    };

    // 6. Get chat lists by userId
    private getChatListsByUserId = async (req: Request, res: Response): Promise<any> => {
        const apiResponseDto = new ApiResponseDto();
        try {
            const userId = req.params.userId;

            // Basic validation
            if (!userId) {
                apiResponseDto.status = ApiResponse.ERROR;
                apiResponseDto.message = 'Missing required field (userId).';
                apiResponseDto.responseCode = HttpStatus.BAD_REQUEST;
                return res.status(HttpStatus.BAD_REQUEST).json(apiResponseDto);
            }

            // Find chat lists where the Users_array contains an object with the specified userId
            const chatLists = await ChatListModel.find({
                Users_array: {
                    $elemMatch: { id: userId }
                }
            }).sort({ Latest_msg_time: -1 }); // Sort by latest message time

            apiResponseDto.status = ApiResponse.SUCCESS;
            apiResponseDto.data = chatLists;
            apiResponseDto.responseCode = HttpStatus.OK;
            return res.status(HttpStatus.OK).json(apiResponseDto);
        } catch (error) {
            console.error('Error fetching chat lists by userId:', error);
            apiResponseDto.status = ApiResponse.ERROR;
            apiResponseDto.message = ApiResponse.GENERIC_ERROR_MESSAGE;
            apiResponseDto.responseCode = HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponseDto);
        }
    }
};