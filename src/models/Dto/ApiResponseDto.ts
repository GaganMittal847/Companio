//import { HttpStatus } from "../../../constant";

import { HttpStatus } from "../../config/constant/constant";

//import { HttpStatus } from "../../constants/constants";
export class ApiResponseDto<T> {
    status: string;
    data?: T;
    message?: string;
    responseCode?: HttpStatus;
    constructor(status: string = '', message: string = '', data?: T, responseCode: HttpStatus = HttpStatus.OK) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.responseCode = responseCode;
    }
}