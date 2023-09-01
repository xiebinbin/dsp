import createRequestInstance from "@/api/lib/create-request-instance.ts";
import {FeaturedCard, GetListDto} from "@/shims";

export interface FeaturedCardEditDto {
    title: string;
    lang: string;
    showName: string;
    cover: string;
    enabled: boolean;
    tags?: bigint[];
    sort: number;
}

const remove = (id: bigint) => {
    return createRequestInstance().delete(`/api/admin/featured-cards/${id}`)
}

const getList = (params: GetListDto): Promise<{
    total: number,
    data: FeaturedCard[]
}> => {
    return createRequestInstance().post('/api/admin/featured-cards/list', params)
}

const getInfo = (id: bigint): Promise<FeaturedCard> => {
    return createRequestInstance().get(`/api/admin/featured-cards/${id}`)
}
const create = (params: FeaturedCardEditDto): Promise<FeaturedCard> => {
    return createRequestInstance().post('/api/admin/featured-cards/store', params)
}
const update = (id: bigint, params: FeaturedCardEditDto): Promise<FeaturedCard> => {
    return createRequestInstance().put(`/api/admin/featured-cards/${id}`, params)
}

export default {
    remove,
    getList,
    getInfo,
    create,
    update,
}
