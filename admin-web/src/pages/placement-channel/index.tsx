import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable, TableDropdown} from "@ant-design/pro-components";
import {PlusOutlined} from '@ant-design/icons';
import {Button, Popconfirm} from 'antd';
import {useCallback, useRef} from 'react';
import EditForm, {$emit} from "./edit-form.tsx";
import {PlacementChannel} from "@/shims";
import placementChannelApi from "@/api/placement-channel.ts";
import {useMount, useUnmount} from "ahooks";
import {boolMap} from "@/utils/list-tool.ts";


const columns: ProColumns<PlacementChannel>[] = [
    {
        title: 'ID',
        key: 'id',
        dataIndex: 'id',
        render: (_dom, record) => {
            return record.id.toString();
        },
        width: 48,
        hideInSearch: true,
    },
    {
        title: '标题',
        key: 'title',
        dataIndex: 'title',
        ellipsis: true,
        valueType: 'text',
        width: 200,
        formItemProps: {
            name: 'q',
        }
    },
    {
        title: '启用状态',
        dataIndex: 'enabled',
        width: 100,
        valueEnum: boolMap,
    },
    {
        title:'渠道代码',
        dataIndex:'code',
        width:100,
        valueType:'text',
        copyable:true,
    },
    {
        title: 'ios用户数',
        dataIndex: 'iosMemberNumber',
        width: 100,
    },
    {
        title: '安卓用户数',
        dataIndex: 'androidMemberNumber',
        width: 100,
    },
    {
        title: 'web用户数',
        dataIndex: 'webMemberNumber',
        width: 100,
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
        fixed: 'right',
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
                            title="删除推广渠道"
                            description="是否删除？"
                            onConfirm={() => {
                                placementChannelApi.remove(record.id).then(() => {
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
const PlacementChannelIndexPage = () => {
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
    return <PageContainer
        title="投放渠道管理"
        token={{
            paddingInlinePageContainerContent: 40,
        }}
    >
        <div>
            <ProTable<PlacementChannel>
                columns={columns}
                scroll={{x: 1000}}
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
                    const extra: Record<string, boolean> = {}
                    if (typeof params.enabled === 'boolean') {
                        extra.enabled = params.enabled;
                    }
                    const result = await placementChannelApi.getList({
                        page: (params?.current ?? 1) as number,
                        limit: (params.pageSize ?? 10) as number,
                        q: params?.q ?? undefined,
                        filters,
                        orderBy,
                        extra,
                    });
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
                headerTitle="投放渠道列表"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined/>}
                        onClick={() => {
                            $emit.emit('add')
                        }}
                        type="primary"
                    >
                        新建推广渠道
                    </Button>,
                ]}
            />
            <EditForm/>
        </div>
    </PageContainer>
}
export default PlacementChannelIndexPage;
