import createRequestInstance from "@/api/lib/create-request-instance.ts";
import {AllSetting} from "@/shims";

export interface SettingEditDto {
    group: string;
    data: Record<string, number | Array<number>[]>;
}

const getGroupInfo = (group: 'system' | 'payment' | 'promotion'): Promise<AllSetting> => {
    return createRequestInstance().get(`/api/admin/settings/${group}`, {
        params: {
            group
        }
    })
}
const update = (params: SettingEditDto): Promise<boolean> => {
    return createRequestInstance().put(`/api/admin/settings/update`, params)
}

export default {
    update,
    getGroupInfo
}
