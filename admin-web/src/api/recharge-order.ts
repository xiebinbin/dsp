import createRequestInstance from "@/api/lib/create-request-instance.ts";
import { GetListDto, RechargeOrder} from "@/shims";
export interface RechargeDto
{   id: number,
    companyName:string,
    amount:number,
}
export interface RechargeHistDto
{
    advertiserId:number,
    // companyName:string,
    amount:number,
    createdAt: string,
}
const getList = (params: RechargeDto): Promise<{
    total: number,
    data: RechargeOrder[]
}> => {
    return createRequestInstance().post('/api/admin/recharge-orders/list', params)
}

const create = (params: RechargeDto): Promise<boolean> => {
    return createRequestInstance().post("/api/admin/recharge-orders/store", params);
  };
  const getRechargeHistList = (
    params: GetListDto
  ): Promise<{ data: RechargeHistDto[]; total: number }> => {
    return createRequestInstance().post("/api/admin/recharge-orders/rechargehistlist", params);
  };
export default {
    getList,
    create,
    getRechargeHistList,
}
