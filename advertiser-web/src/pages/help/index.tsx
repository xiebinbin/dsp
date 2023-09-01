import {PageContainer} from "@ant-design/pro-components";
import {PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable, TableDropdown} from '@ant-design/pro-components';
import {Button, Popconfirm} from 'antd';
import {useCallback, useRef} from 'react';
import EditForm, {$emit} from "./edit-form.tsx";
import {Help} from "@/shims";
import HelpApi from "@/api/help.ts";
import {useMount, useUnmount} from "ahooks";
import {getLangList} from "@/utils/lang.ts";

const columns: ProColumns<Help>[] = [
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
        title: '语言',
        key: 'lang',
        dataIndex: 'lang',
        valueType: 'text',
        valueEnum: getLangList(),
        width: 100,
        hideInSearch: true,
        filters: true,
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
                            title="删除问题"
                            description="是否删除该问题？"
                            onConfirm={() => {
                                HelpApi.remove(record.id).then(() => {
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
export default () => {
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
        title="热点管理"
        token={{
            paddingInlinePageContainerContent: 40,
        }}
    >
        <div>
            <ProTable<Help>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params = {}, sort, filters) => {
                    const orderBy: { [key: string]: 'asc' | 'desc' } = {};
                    for (const sortKey in sort) {
                        const field = sortKey.replace(/_(\w)/g, function (_all, letter) {
                            return letter.toUpperCase();
                        }) as "createdAt" | "updatedAt";
                        orderBy[field] = sort[sortKey] === 'ascend' ? 'asc' : 'desc'
                    }
                    const result = await HelpApi.getList({
                        page: params.current ?? 1,
                        limit: params.pageSize ?? 10,
                        q: params.q ?? undefined,
                        filters,
                        orderBy,
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
                headerTitle="常见问题列表"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined/>}
                        onClick={() => {
                            $emit.emit('add')
                        }}
                        type="primary"
                    >
                        新建常见问题
                    </Button>,
                ]}
            />
            <EditForm/>
        </div>
    </PageContainer>
}
