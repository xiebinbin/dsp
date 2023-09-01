import {PageContainer, ProSchemaValueEnumType} from "@ant-design/pro-components";
import {PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable, TableDropdown} from '@ant-design/pro-components';
import {Button, Popconfirm} from 'antd';
import {ReactNode, useCallback, useEffect, useRef} from 'react';
import EditForm, {$emit} from "./edit-form.tsx";
import {User} from "@/shims";
import UserApi from "@/api/user.ts";
import {useMount, useUnmount} from "ahooks";
import {useLocation} from "react-router-dom";

const maps = new Map<string | number | boolean, ProSchemaValueEnumType | ReactNode>()
maps.set(true, {
    text: '启用',
    status: 'Success',
});
maps.set(false, {
    text: '禁用',
    status: 'Error',
})
const columns: ProColumns<User>[] = [
    {
        title: 'ID',
        key: 'id',
        dataIndex: 'id',
        render: (_dom, record) => {
            return record.id.toString();
        },
        width: 120,
        hideInSearch: true,
    },
    {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        ellipsis: true,
        valueType: 'text',
        width: 200,
        hideInSearch: true,
        formItemProps: {
            name: 'q',
        }
    },
    {
        title: '地址',
        key: 'address',
        dataIndex: 'address',
        ellipsis: true,
        valueType: 'text',
        width: 200,
    },
    {
        title: '启用状态',
        dataIndex: 'enabled',
        width: 100,
        valueEnum: maps,
    },
    {
        title: '更新时间',
        key: 'updatedAt',
        width: 200,
        dataIndex: 'updatedAt',
        valueType: 'dateTime',
        sorter: true,
        hideInSearch: true,
    },
    {
        title: '操作',
        valueType: 'option',
        width: 200,
        fixed: "right",
        key: 'option',
        render: (_text, record, _, action) => [
            <a
                key="editable"
                onClick={() => {
                    $emit.emit('update', record.id);
                }}
            >
                编辑
            </a>,
            <TableDropdown
                key="actionGroup"
                menus={[
                    {
                        key: 'remove', name: <Popconfirm
                            title={"删除" + record.name}
                            description="是否删除？"
                            onConfirm={() => {
                                UserApi.remove(record.id).then(() => {
                                    action?.reload();
                                    window.Message.success('删除成功');
                                }).catch(() => {
                                    window.Message.error('删除失败');
                                });
                            }}
                        >
                            <Button danger>删除</Button>
                        </Popconfirm>
                    },
                ]}
            />,
        ],
    },
];

export interface UserIndexPageProps {
    role: 'CREATOR' | 'SUPER' | 'OPERATOR';
    roleName: string;
}

const UserIndexPage = (props: UserIndexPageProps) => {
    const {role, roleName} = props;
    const actionRef = useRef<ActionType>();
    const reload = useCallback(() => {
        actionRef.current?.reload()
    }, []);
    useMount(() => {
        $emit.on('reload', () => {
            reload()
        })
    });
    useUnmount(() => {
        $emit.off('reload', () => {
            reload()
        });
    });
    const location = useLocation();
    useEffect(() => {
        reload();
    }, [location, reload])
    return <PageContainer
        title={roleName + '管理'}
        token={{
            paddingInlinePageContainerContent: 40,
        }}
    >
        <div>
            <ProTable<User>
                scroll={{x: "100%"}}
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params = {}, sort, filters) => {
                    const orderBy: { [key: string]: 'asc' | 'desc' } = {};
                    for (const sortKey in sort) {
                        const field = sortKey.replace(/_(\w)/g, function (_all, letter) {
                            return letter.toUpperCase();
                        });
                        orderBy[field] = sort[sortKey] === 'ascend' ? 'asc' : 'desc'
                    }
                    const extra: Record<string, boolean | number | string> = {
                        role,
                    }
                    if (typeof params.enabled === 'boolean') {
                        extra.enabled = params.enabled;
                    }
                    if (params?.address) {
                        extra.address = params.address;
                    }
                    const result = await UserApi.getList({
                        page: params.current ?? 1,
                        limit: params.pageSize ?? 10,
                        q: params.q ?? '',
                        filters,
                        orderBy,
                        extra
                    })
                    return {
                        ...result,
                        success: true,
                    };
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                pagination={{
                    pageSize: 100,
                }}
                dateFormatter="string"
                headerTitle={roleName + '列表'}
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined/>}
                        onClick={() => {
                            $emit.emit('add')
                        }}
                        type="primary"
                    >
                        新建{roleName}
                    </Button>,
                ]}
            />
            <EditForm {...props} />
        </div>
    </PageContainer>
}

export default UserIndexPage;
