import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable, TableDropdown} from "@ant-design/pro-components";
import {PlusOutlined} from '@ant-design/icons';
import {Button, Popconfirm} from 'antd';
import {useCallback, useRef} from 'react';
import EditForm, {$emit} from "./edit-form.tsx";
import {Tag} from "@/shims";
import TagApi from "@/api/tag.ts";
import {useMount, useUnmount} from "ahooks";
import {boolMap} from "@/utils/list-tool.ts";


const columns: ProColumns<Tag>[] = [
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
        title: '推荐状态',
        dataIndex: 'recommended',
        valueEnum: boolMap,
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
                            title="删除标签"
                            description="是否删除该标签？"
                            onConfirm={() => {
                                TagApi.remove(record.id).then(() => {
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
const TagIndexPage = () => {
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
        title="标签管理"
        token={{
            paddingInlinePageContainerContent: 40,
        }}
    >
        <div>
            <ProTable<Tag>
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
                    const extra: Record<string, boolean> = {}
                    if (typeof params.enabled === 'boolean') {
                        extra.enabled = params.enabled;
                    }
                    if (typeof params.recommended === 'boolean') {
                        extra.recommended = params.recommended;
                    }
                    const result = await TagApi.getList({
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
                headerTitle="标签列表"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined/>}
                        onClick={() => {
                            // console.log(aes.En(JSON.stringify({data: "123456"}), "123"))
                            $emit.emit('add')
                        }}
                        type="primary"
                    >
                        新建标签
                    </Button>,
                ]}
            />
            <EditForm/>
        </div>
    </PageContainer>
}

export default TagIndexPage;
