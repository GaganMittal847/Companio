import  mongoose,{ Schema, Document } from 'mongoose';

export interface RegisterUserEntity extends Document {
    mobileNo: number;
    catId: string;
    subCatId: string;
    timestamp: number;
    coordinates: {
        lat: string;
        long: string;
    };
    status: string;
}

const RegisterUsersSchema: Schema = new Schema({
    mobileNo: { type: Number, required: true },
    catId: { type: String, required: true },
    subCatId: { type: String, required: true },
    timestamp: { type: Number, required: true },
    coordinates: {
        lat: { type: String, required: true },
        long: { type: String, required: true }
    },
    status: { type: String, required: true }
});


export const RegisterUserEntity = mongoose.model<RegisterUserEntity>(
    'registration',
    RegisterUsersSchema
);
