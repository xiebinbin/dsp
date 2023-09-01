import createRequestInstance from '@/api/lib/create-request-instance.ts';
import {LoginUser} from "@/shims";

export interface LoginParams {
    sign: string;
    timestamp: number;
    password: string;
    dataHash: string;
}

export interface LoginResponse {
    key: string;
}

const login = (params: LoginParams): Promise<LoginResponse> => {
    return createRequestInstance().post('/api/admin/auth/login', params)
}
const getInfo = (): Promise<LoginUser> => {
    return createRequestInstance().get('/api/admin/auth/info')
}
export default {
    login,
    getInfo
}
