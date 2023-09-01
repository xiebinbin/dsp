/// <reference types="vite/client" />

import {MessageInstance} from "antd/es/message/interface";

interface AxiosErrorResponse {
    statusCode: number;
    message: string;
}

// 讲 Message 的类型声明到 window 上
declare global {
    interface Window {
        Message: MessageInstance
    }
}

interface LoginUser {
    name: string;
    role: string;
    address: string;
}
