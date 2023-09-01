import createRequestInstance from "@/api/lib/create-request-instance.ts";
import {Agent, GetListDto} from "@/shims";
const getList = (params: GetListDto): Promise<{
    total: number,
    data: Agent[]
}> => {
    return createRequestInstance().post('/api/admin/agents/list', params)
}

const getInfo = (id: bigint): Promise<Agent> => {
    return createRequestInstance().post(`/api/admin/agents/info`, {id})
}
const update = (id: bigint, params: {
    loginCoinRewardAmount: number
}): Promise<Agent> => {
    return createRequestInstance().post(`/api/admin/agents/${id}`, {
        id,
        ...params
    })
}

export default {
    getList,
    getInfo,
    update,
}
