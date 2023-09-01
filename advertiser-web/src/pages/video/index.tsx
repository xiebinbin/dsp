import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable, TableDropdown} from "@ant-design/pro-components";
import {Button, Popconfirm} from 'antd';
import {useCallback, useRef} from 'react';
import EditForm, {$emit} from "./edit-form.tsx";
import {Video} from "@/shims";
import VideoApi from "@/api/video.ts";
import {useMount, useSafeState, useUnmount} from "ahooks";
import UserApi from "@/api/user.ts";
import {boolMap} from "@/utils/list-tool.ts";


const VideoIndexPage = () => {

    const actionRef = useRef<ActionType>();
    const [pageSize, setPageSize] = useSafeState(100);
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
    const [creators, setCreators] = useSafeState<{ label: string; value: number }[]>([])
    const loadCreators = useCallback(async (q: string) => {
        const extra: Record<string, boolean | string> = {
            role: 'CREATOR'
        }
        const filters: Record<string, (number | string | boolean)[] | null> = {}

        const res = await UserApi.getList({
            q,
            page: 1,
            limit: 100,
            extra,
            filters
        });
        setCreators(res.data.map((item) => {
            return {
                label: item.name,
                value: Number(item.id),
            }
        }));
    }, [setCreators])
    const columns: ProColumns<Video>[] = [
        {
            title: 'ID',
            key: 'id',
            dataIndex: 'id',
            render: (_dom, record) => {
                return record.id.toString();
            },
            width: 200,
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
            title: '创作者',
            key: 'userId',
            dataIndex: 'creator',
            valueType: 'select',
            width: 200,
            render: (_dom, record) => {
                return record.creator?.name ?? '-';
            },
            fieldProps: {
                showSearch: true,
                onSearch: async (value: string) => {
                    await loadCreators(value)
                },
                onClear: async () => {
                    await loadCreators('')
                },
                options: creators,
            },
        },
        {
            title: '启用状态',
            dataIndex: 'enabled',
            width: 100,
            valueEnum: boolMap,
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
            fixed: 'right',
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
                                title="删除视频"
                                description="是否删除该视频？"
                                onConfirm={() => {
                                    VideoApi.remove(record.id).then(() => {
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
    return <PageContainer
        title="视频管理"
        token={{
            paddingInlinePageContainerContent: 40,
        }}
    >
        <div>
            <ProTable<Video>
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
                    if (params.userId) {
                        extra.userId = params.userId;
                    }
                    const result = await VideoApi.getList({
                        page: (params?.current ?? 1) as number,
                        limit: (params.pageSize ?? 10) as number,
                        q: params?.q ?? undefined,
                        filters,
                        orderBy,
                        extra,
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
                    showQuickJumper: true,
                    pageSize,
                    onChange: (_page, pageSize) => {
                        setPageSize(pageSize ?? 10);
                    }
                }}
                dateFormatter="string"
                headerTitle="视频列表"
                toolBarRender={() => []}
            />
            <EditForm/>
        </div>
    </PageContainer>
}

export default VideoIndexPage;
