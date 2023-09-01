import {ProSchemaValueEnumType} from "@ant-design/pro-components";
import {ReactNode} from "react";


export const boolMap = new Map<string | number | boolean, ProSchemaValueEnumType | ReactNode>()
boolMap.set(true, {
    text: '启用',
    status: 'Success',
});
boolMap.set(false, {
    text: '禁用',
    status: 'Error',
});


