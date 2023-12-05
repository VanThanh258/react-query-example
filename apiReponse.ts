export type ISuccessResponse<T = any> = {
    status: true;
    data: T;
    message: string;
    // metaData?: any;
};

export type IFailResponse = {
    status: false;
    errorCode: number;
    message: string;
    metaData?: any;
};

export type IResponseData = ISuccessResponse | IFailResponse;
