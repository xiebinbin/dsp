import createRequestInstance from '@/api/lib/create-request-instance.ts';
import {GetListDto, PaymentChannel} from "@/shims";

export interface PaymentChannelEditDto {
    title: string;
    icon: string;
    remark: string;
    locales: Record<
        string,
        {
            title: string;
            description?: string;
        }
    >;
    supportCountryCodes: string[];
    currency: string;
    enabled: boolean;
    payRate: number;
    supportAmounts: number[];
    driverConfig: Record<string, string | number | null>;
    driver: string;
}


const getList = (params: GetListDto): Promise<{ data: PaymentChannel[]; total: number }> => {
    return createRequestInstance().post('/api/admin/payment-channels/list', params);
}
const getInfo = (id: bigint): Promise<PaymentChannel> => {
    return createRequestInstance().get(`/api/admin/payment-channels/${id}`)
}
const create = (params: PaymentChannelEditDto): Promise<PaymentChannel> => {
    return createRequestInstance().post('/api/admin/payment-channels/store', params)
}
const update = (id: bigint, params: PaymentChannelEditDto): Promise<PaymentChannel> => {
    return createRequestInstance().put(`/api/admin/payment-channels/${id}`, params)
}

const remove = (id: bigint): Promise<boolean> => {
    return createRequestInstance().delete(`/api/admin/payment-channels/${id}`)
}

export default {
    create,
    getInfo,
    update,
    getList,
    remove
}
