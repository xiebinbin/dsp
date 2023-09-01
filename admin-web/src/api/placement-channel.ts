import createRequestInstance from '@/api/lib/create-request-instance.ts';
import {GetListDto, PlacementChannel} from "@/shims";

export interface PlacementChannelEditDto {
    title: string;
    remark?: string;
    enabled: boolean;
    priceRate: number;
    level: number;
}


const getList = (params: GetListDto): Promise<{ data: PlacementChannel[]; total: number }> => {
    return createRequestInstance().post('/api/admin/placement-channels/list', params);
}
const getInfo = (id: bigint): Promise<PlacementChannel> => {
    return createRequestInstance().get(`/api/admin/placement-channels/${id}`)
}
const create = (params: PlacementChannelEditDto): Promise<PlacementChannel> => {
    return createRequestInstance().post('/api/admin/placement-channels/store', params)
}
const update = (id: bigint, params: PlacementChannelEditDto): Promise<PlacementChannel> => {
    return createRequestInstance().put(`/api/admin/placement-channels/${id}`, params)
}

const remove = (id: bigint): Promise<boolean> => {
    return createRequestInstance().delete(`/api/admin/placement-channels/${id}`)
}

export default {
    create,
    getInfo,
    update,
    getList,
    remove
}
