import { Schema, Model, model } from 'mongoose';
import { ChatListEntity, ChatListUserEmbedEntity } from '../entities/ChatListEntity';

const ChatListUserEmbedSchema = new Schema<ChatListUserEmbedEntity>({
  Name: { type: String, required: true },
  Profilepic: { type: String, required: false },
  id: { type: String, required: true },
  Mobile: { type: String, required: false },
});

const ChatListSchema = new Schema<ChatListEntity>({
  requestid: { type: String, required: true, unique: true },
  LatestMsg: { type: String, required: false },
  Latest_msg_time: { type: Date, required: false },
  Users_array: [ChatListUserEmbedSchema],
  cDt: { type: Date, default: Date.now },
});

export const ChatListModel: Model<ChatListEntity> = model<ChatListEntity>('ChatList', ChatListSchema, 'chatlist');