export enum HttpStatus {
    OK = 200,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    CREATED = 201,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403
}
export class ApiResponse{
    static SUCCESS : string = 'success';
    static ERROR : string = 'failed';
    static readonly GENERIC_ERROR_MESSAGE: string = 'An error occurred while processing the request';


    static OTP_TIME_LIMIT : string = 'Time limit exceeds please resend Otp';
    static OTP_INVALID : string = 'invalid Otp!';
    static OTP_VERIFIED : string = 'Mobile Number Verified Successfully';
    static OTP_NOT_VERIFIED : string = 'Mobile Number Not Verified';
}