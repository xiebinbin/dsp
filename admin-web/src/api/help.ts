import createRequestInstance from "@/api/lib/create-request-instance.ts";
import {GetListDto, Help} from "@/shims";

export interface HelpEditDto {
    lang: string;
    title: string;
    content: string;
    sort: number;
}

const remove = (id: bigint) => {
    return createRequestInstance().delete(`/api/admin/helps/${id}`)
}

const getList = (params: GetListDto): Promise<{
    total: number,
    data: Help[]
}> => {
    return createRequestInstance().post('/api/admin/helps/list', params)
}

const getInfo = (id: bigint): Promise<Help> => {
    return createRequestInstance().get(`/api/admin/helps/${id}`)
}
const create = (params: HelpEditDto): Promise<Help> => {
    return createRequestInstance().post('/api/admin/helps/store', params)
}
const update = (id: bigint, params: HelpEditDto): Promise<Help> => {
    return createRequestInstance().put(`/api/admin/helps/${id}`, params)
}

export default {
    remove,
    getList,
    getInfo,
    create,
    update,
}
