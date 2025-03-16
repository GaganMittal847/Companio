export interface UserEntity extends Document {
    name: string;
    mobileNo: string;
    profilePic: string;
    type: 'buyer' | 'seller';
    fcmToken: string;
    deviceType: string;
    media: string[];
    catList: string[];
    subCatList: string[];
    cDt: Date;
    uDt: Date;
    id: string;
}

