import createRequestInstance from '@/api/lib/create-request-instance.ts';

const login = (params: {
    username: string;
    password: string;
    inputCode : string;
    codeid : string;
}): Promise<{
    token: string;
}> => {
    return createRequestInstance().post('/api/advertiser/auth/login', params)
}

const getInfo = (): Promise<{
    role: string;
    username: string;
}> => {
    return createRequestInstance().post('/api/advertiser/auth/info')
}
const getCode=(): Promise<{
    url: string;
    codeid : string;
    getCode: string;
}> => {
    return createRequestInstance().get('/api/advertiser/auth/getcode')
}

const changePWD = (params: {    
    username: string;
    oldPassword : string;
    confirmPassword: string;
}): Promise<{res: boolean}> => {
    return createRequestInstance().post('/api/advertiser/auth/changepwd',params)
}

export default {
    login,
    getInfo,
    getCode,
    changePWD
}
