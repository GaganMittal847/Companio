export interface AddressEntity extends Document {
    userId: string,
    mobileNo: number,
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}