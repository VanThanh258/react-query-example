import Exception from "@utils/exception/Exception";
import { delay } from "@utils/common/functions";
import { appRequest } from "./axios";
import { IFailResponse, IResponseData, ISuccessResponse } from "../types/apiReponse";

interface RequesterOptions<Model> {
    requestFunc?: (url: string) => Promise<{ data: IResponseData }>;
    boundedTime?: number;
    ignoreStatus?: boolean;
    handleData?: (data: ISuccessResponse) => Model;
}

// API REQUESTER
// requester(config)(url)
export const requester =
    <Model>({
        requestFunc = (url = "") => appRequest.mapServer.get(url),
        boundedTime = 0,
        ignoreStatus = false,
        handleData = (data: ISuccessResponse) => data as Model
    }: RequesterOptions<Model> = {}) =>
    async (url = "") => {
        const beforeTime = Date.now();
        try {
            const { data } = await requestFunc(url);

            if (Date.now() - beforeTime < 1000) await delay(boundedTime);

            if (data?.status || ignoreStatus) return await handleData(data as ISuccessResponse);
            else {
                const { errorCode, message } = data as IFailResponse;
                throw new Exception(errorCode, message);
            }
        } catch (error) {
            if (error instanceof Exception) {
                // console.log("ERROR", url, JSON.stringify(error.response?.data, null, 4));
                throw new Exception(error.code ? error.code : error.response?.status, error.message, error);
            } else {
                throw error;
            }
        }
    };

export const fetcher = requester({
    requestFunc: (url) => appRequest.mapServer.get(url),
    boundedTime: 200
});
