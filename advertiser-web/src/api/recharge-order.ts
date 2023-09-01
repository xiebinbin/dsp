import createRequestInstance from "@/api/lib/create-request-instance.ts";
import {GetListDto, RechargeOrder} from "@/shims";

const getList = (params: GetListDto): Promise<{
    total: number,
    data: RechargeOrder[]
}> => {
    return createRequestInstance().post('/api/admin/recharge-orders/list', params)
}


export default {
    getList,
}
