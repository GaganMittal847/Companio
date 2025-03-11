import mongoose, { Schema, Document } from 'mongoose';
import { SignupEntity } from '../entities/UserEntity';

//import {autoIncrement} from 'mongoose-auto-increment';

const CounterSchema: Schema = new Schema({
    modelName: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
});


const SignupSchema: Schema = new Schema({
    name: { type: String, required: true },
    mobileNo: { type: String, required: true },
    profilePic: { type: String, required: false },
    type: { type: String, enum: ['buyer', 'seller'], required: true },
    fcmToken: { type: String, required: false },
    deviceType: { type: String, required: false },
    cDt: { type: Date, default: Date.now },
    id: { type: String, required: true, unique: true }
});

export const Counter = mongoose.model('Counter', CounterSchema);

export const SignupModel = mongoose.model<SignupEntity>('Signup', SignupSchema);