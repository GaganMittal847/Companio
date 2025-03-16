import mongoose, { Schema, Document } from 'mongoose';
import { UserEntity } from '../entities/UserEntity';

// Enum for Gender
enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
}

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
    media: { type: [String], required: false }, 
    geoLocation: {
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false }
    },
    catList: { type: [String], required: false }, 
    subCatList: { type: [String], required: false }, 
    age: { type: Number, required: false }, // Fixed type issue (should be `Number`, not `number`)
    gender: { type: String, enum: Object.values(Gender), required: false }, // Enum for gender
    bio: { type: String, required: false }, // Fixed `bio` type (should be `String`, not `[String]`)
    id: { type: String, required: true, unique: true }
});

export const Counter = mongoose.model('Counter', CounterSchema);
export const UserModel = mongoose.model<UserEntity>('users', SignupSchema);
