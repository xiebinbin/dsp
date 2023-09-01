import createRequestInstance from '@/api/lib/create-request-instance.ts';
import {GetListDto, Tag} from "@/shims";

export interface TagEditDto {
    title: string;
    locales: Record<string, string>;
    recommended: boolean;
    sort: number;
    enabled: boolean;
}


const getList = (params: GetListDto): Promise<{ data: Tag[]; total: number }> => {
    return createRequestInstance().post('/api/admin/tags/list', params);
}
const getInfo = (id: bigint): Promise<Tag> => {
    return createRequestInstance().get(`/api/admin/tags/${id}`)
}
const create = (params: TagEditDto): Promise<Tag> => {
    return createRequestInstance().post('/api/admin/tags/store', params)
}
const update = (id: bigint, params: TagEditDto): Promise<Tag> => {
    return createRequestInstance().put(`/api/admin/tags/${id}`, params)
}

const remove = (id: bigint): Promise<boolean> => {
    return createRequestInstance().delete(`/api/admin/tags/${id}`)
}

export default {
    create,
    getInfo,
    update,
    getList,
    remove
}
