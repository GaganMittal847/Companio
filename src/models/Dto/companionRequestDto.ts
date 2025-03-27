import { HttpStatus } from "../../constant/constant";

export class CompanionRequestDto {
    status: string;
    userId: string;
    userName: string;
    userDp: string;
    companionId: string;
    location: {
        latitude: number;
        longitude: number;
    };
    categoryId: string;
    subCategoryId: string;
    date: string; // Format: YYYY-MM-DD
    slots: string[];
    price: number;
    finalPrice: number;
    comments?: string;
    responseCode?: HttpStatus;

    constructor(
        status: string = '',
        userId: string,
        userName: string,
        userDp: string,
        companionId: string,
        location: { latitude: number; longitude: number },
        categoryId: string,
        subCategoryId: string,
        date: string,
        slots: string[],
        price: number,
        finalPrice: number,
        comments: string = '',
        responseCode: HttpStatus = HttpStatus.OK
    ) {
        this.status = status;
        this.userId = userId;
        this.userName = userName;
        this.userDp = userDp;
        this.companionId = companionId;
        this.location = location;
        this.categoryId = categoryId;
        this.subCategoryId = subCategoryId;
        this.date = date;
        this.slots = slots;
        this.price = price;
        this.finalPrice = finalPrice;
        this.comments = comments;
        this.responseCode = responseCode;
    }
}
