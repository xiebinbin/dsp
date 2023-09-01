import createRequestInstance from '@/api/lib/create-request-instance.ts';
import {GetListDto, User} from "@/shims";

export interface UserEditDto {
    name: string;
    remark?: string;
    enabled: boolean;
    role: "SUPER" | "CREATOR" | "OPERATOR";
    address: string;
    password?: string;
}


const getList = (params: GetListDto): Promise<{ data: User[]; total: number }> => {
    return createRequestInstance().post('/api/admin/users/list', params);
}
const getInfo = (id: bigint): Promise<User> => {
    return createRequestInstance().get(`/api/admin/users/${id}`)
}
const create = (params: UserEditDto): Promise<User> => {
    return createRequestInstance().post('/api/admin/users/store', params)
}
const update = (id: bigint, params: UserEditDto): Promise<User> => {
    return createRequestInstance().put(`/api/admin/users/${id}`, params)
}

const remove = (id: bigint): Promise<boolean> => {
    return createRequestInstance().delete(`/api/admin/users/${id}`)
}

export default {
    create,
    getInfo,
    update,
    getList,
    remove
}
