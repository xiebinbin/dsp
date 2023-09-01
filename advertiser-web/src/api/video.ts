import createRequestInstance from "@/api/lib/create-request-instance.ts";
import {GetListDto, Video} from "@/shims";

export interface VideoEditDto {
    title: string;
    cover: string;
    enabled: boolean;
    tags?: bigint[];
    level: number;
    locales: Record<string, {
        title: string;
        description?: string;
    }>;
    country: string;
    previewBlocks?: [number, number][];
    denyCountries?: string[];
    screen: 1 | 2;
    priceMode: 1|2;
    price: number;

}

const remove = (id: bigint) => {
    return createRequestInstance().delete(`/api/admin/videos/${id}`)
}

const getList = (params: GetListDto): Promise<{
    total: number,
    data: Video[]
}> => {
    return createRequestInstance().post('/api/admin/videos/list', params)
}

const getInfo = (id: bigint): Promise<Video> => {
    return createRequestInstance().get(`/api/admin/videos/${id}`)
}
const create = (params: VideoEditDto): Promise<Video> => {
    return createRequestInstance().post('/api/admin/videos/store', params)
}
const update = (id: bigint, params: VideoEditDto): Promise<Video> => {
    return createRequestInstance().put(`/api/admin/videos/${id}`, params)
}

export default {
    remove,
    getList,
    getInfo,
    create,
    update,
}
