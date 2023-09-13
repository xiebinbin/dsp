import createRequestInstance from "@/api/lib/create-request-instance.ts";
import {Advertiser, GetListDto} from "@/shims";
export interface AdvEditDto {
    companyName: string;
    username: string;
    taxNumber: string;
    cpmPrice: number;
    password?: string;
    confirmPassword?: string;
    enabled: boolean;
    userId: number;
    role: "Advertiser";
  }

const getList = (params: GetListDto): Promise<{
    total: number,
    data: Advertiser[]
}> => {
    return createRequestInstance().post('/api/admin/advertiser/list', params)
}

const getInfo = (id: bigint): Promise<Advertiser> => {
    return createRequestInstance().get(`/api/admin/advertiser/${id}`);
  };
const create = (params: AdvEditDto): Promise<Advertiser> => {
    return createRequestInstance().post("/api/admin/advertiser/store", params);
  };
const update = (id: bigint, params: AdvEditDto ): Promise<AdvEditDto> => {
    return createRequestInstance().put(`/api/admin/advertiser/${id}`, {
        id,
        ...params
    })
}
const remove = (id: bigint): Promise<boolean> => {
    return createRequestInstance().delete(`/api/admin/advertiser/${id}`);
  };
export default {
    getList,
    getInfo,
    update,
    create,
    remove
}
