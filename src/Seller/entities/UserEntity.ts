export interface SignupEntity extends Document {
    name: string;
    mobileNo: string;
    profilePic: string;
    type: 'buyer' | 'seller';
    fcmToken: string;
    deviceType: string;
    cDt: Date;
    id: string;
}

