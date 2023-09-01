import createRequestInstance from '@/api/lib/create-request-instance.ts';

const login = (params: {
    username: string;
    password: string;
}): Promise<{
    token: string;
}> => {
    return createRequestInstance().post('/api/admin/auth/login', params)
}
const getInfo = (): Promise<{
    role: string;
    username: string;
}> => {
    return createRequestInstance().post('/api/admin/auth/info')
}
export default {
    login,
    getInfo
}
