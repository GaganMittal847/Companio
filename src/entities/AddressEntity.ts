export interface AddressEntity extends Document {
    userId: string,
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}