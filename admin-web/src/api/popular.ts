import createRequestInstance from "@/api/lib/create-request-instance.ts";
import {GetListDto, Popular} from "@/shims";

export interface PopularEditDto {
    lang: string;
    title: string;
    tags: bigint[];
    startedAt: string;
    endedAt: string;
    sort: number;
}

const remove = (id: bigint) => {
    return createRequestInstance().delete(`/api/admin/populars/${id}`)
}

const getList = (params: GetListDto): Promise<{
    total: number,
    data: Popular[]
}> => {
    return createRequestInstance().post('/api/admin/populars/list', params)
}

const getInfo = (id: bigint): Promise<Popular> => {
    return createRequestInstance().get(`/api/admin/populars/${id}`)
}
const create = (params: PopularEditDto): Promise<Popular> => {
    return createRequestInstance().post('/api/admin/populars/store', params)
}
const update = (id: bigint, params: PopularEditDto): Promise<Popular> => {
    return createRequestInstance().put(`/api/admin/populars/${id}`, params)
}

export default {
    remove,
    getList,
    getInfo,
    create,
    update,
}
