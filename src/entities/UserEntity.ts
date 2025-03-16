// Define the Gender Enum
export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
}

export interface UserEntity extends Document {
    name: string;
    mobileNo: string;
    profilePic?: string;
    type: 'buyer' | 'seller';
    fcmToken?: string;
    deviceType?: string;
    media?: string[];
    catList?: string[];
    subCatList?: string[];
    bio?: string;
    geoLocation?: {
        latitude: number;
        longitude: number;
    };
    age: number;
    gender: Gender;  // Use the Gender enum
    cDt: Date;
    uDt: Date;
    id: string;
}
