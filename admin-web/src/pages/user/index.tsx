import {PageContainer, ProSchemaValueEnumType} from "@ant-design/pro-components";
import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable, TableDropdown} from '@ant-design/pro-components';
import {Button, Popconfirm} from 'antd';
import {ReactNode, useCallback, useEffect, useRef} from 'react';
import EditForm, {$emit} from "./edit-form.tsx";
import {SuperUser} from "@/shims";
import UserApi from "@/api/user.ts";
import {useMount, useUnmount} from "ahooks";
import {useLocation, useNavigate} from "react-router-dom";
import { useRecoilState } from "recoil";
import { AuthInfo } from "@/stores/auth-info.ts";

const maps = new Map<string | number | boolean, ProSchemaValueEnumType | ReactNode>()
maps.set(true, {
    text: '启用',
    status: '0',
});
maps.set(false, {
    text: '禁用',
    status: 'Error',
})

  
const Supercolumns: ProColumns<SuperUser>[] = [

    {
        title: '昵称',
        key: 'nickname',
        dataIndex: 'nickname',
        ellipsis: true,
        sorter: true,
        valueType: 'text',
        width: 100,
        hideInSearch: true,
        // render: (_, record) => {
        //     // 在这里根据用户角色来判断是否显示列内容
        //     if (record.role !== 'Root') {
        //       return <span>{record.nickname}</span>;
        //     }
        //     return null; // 返回 null 来隐藏列内容
        //   },

     
    },
    {
        title: '账号',
        key: 'username',
        dataIndex: 'username',
        ellipsis: true,
        valueType: 'text',
        width: 100,
        formItemProps: {
            name: 'q',
        }
    },
    {
        title: '角色',
        key: 'role',
        dataIndex: 'role',
        ellipsis: true,
        valueType: 'text',
        width: 100,
        hideInSearch: true,

        // valueEnum: {
        //     all: { text: '全部', status: 'All' },
        //     Root: { text: '管理员', status: 'Root' },
        //     Operator: { text: '运营者', status: 'Operator' },
        //     Agent: { text: '代理商', status: 'Agent' },
        //   },
        //   formItemProps: {
        //     name: 'r',
        // }
    },
    {
        title: '更新时间',
        key: 'updatedAt',
        width: 100,
        dataIndex: 'updatedAt',
        valueType: 'dateTime',
        sorter: true,
        hideInSearch: true,
    },
    {
        title: '状态',
        key: 'enabled',
        dataIndex: 'enabled',
        ellipsis: true,
        valueType: 'text',
        width: 100,
        hideInSearch: true,
        valueEnum: maps,

    },
    {
        title: '操作',
        valueType: 'option',
        width: 100,
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
                            title={"删除" + record.username}
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
                        <Button danger icon={<DeleteOutlined />}>删除</Button>
                        </Popconfirm>
                    },
                ]}
            />,
        ],
    },
]
const AgentColumns: ProColumns<SuperUser>[] = [
    // {
    //     title: 'ID',
    //     key: 'id',
    //     dataIndex: 'id',
    //     render: (_dom, record) => {
    //         return record.id.toString();
    //     },
    //     width: 120,
    //     hideInSearch: true,
    // },
    {
        title: '公司名',
        key: 'nickname',
        dataIndex: 'nickname',
        ellipsis: true,
        sorter: true,
        valueType: 'text',
        width: 100,
        hideInSearch: true,
     
    },
 
    {
        title: '账号',
        key: 'username',
        dataIndex: 'username',
        ellipsis: true,
        valueType: 'text',
        width: 100,
        formItemProps: {
            name: 'q',
        }
    },
    // {
    //     title: '角色',
    //     key: 'role',
    //     dataIndex: 'role',
    //     ellipsis: true,
    //     valueType: 'text',
    //     width: 100,
    //     hideInSearch: true,

    // },
    {
        title: '更新时间',
        key: 'updatedAt',
        width: 100,
        dataIndex: 'updatedAt',
        valueType: 'dateTime',
        sorter: true,
        hideInSearch: true,
    },
    {
        title: '状态',
        key: 'enabled',
        dataIndex: 'enabled',
        ellipsis: true,
        valueType: 'text',
        width: 100,
        hideInSearch: true,
        valueEnum: maps,

    },
    {
        title: '操作',
        valueType: 'option',
        width: 100,
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
                            title={"删除" + record.username}
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
                        <Button danger icon={<DeleteOutlined />}>删除</Button>
                        </Popconfirm>
                    },
                ]}
            />,
        ],
    },
]


export interface UserIndexPageProps {
    role: 'Root' | 'Operator' | 'Agent';
    roleName: string;
}

const UserIndexPage = (props: UserIndexPageProps) => {
    const {role, roleName} = props;
    const [authUser] = useRecoilState(AuthInfo);

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
    console.log("UserIndexPage role: ",role)
    const navigate = useNavigate();

    const renderContent = () => {
 
        if (role === 'Root'||role==='Operator') {
            if (authUser.role !== "Root" && authUser.role !== "Operator") {
                navigate("/unauthorized");
                return null;
              }
            // SUPER 角色的内容
                return   <div>
                <ProTable<SuperUser> 
                scroll={{x:"100%"}}
                columns={Supercolumns}
                actionRef={actionRef}
                cardBordered
                request={async (params = {}, sort, filters) => {
                        const orderBy: { [key: string]: 'asc' | 'desc' } = {};
                        for (const sortKey in sort) {
                            console.log('sortKey',sortKey)
                            const field = sortKey.replace(/_(\w)/g, function (_all, letter) {
                                return letter.toUpperCase();
                            });
                            console.log('field',field)
                            orderBy[field] = sort[sortKey] === 'ascend' ? 'asc' : 'desc'
                            console.log(' orderBy[field] ', orderBy[field] )
                        }
                        const extra: Record<string, boolean | number | string> = {
                            role,
                        }
                        // if (typeof params.enabled === 'boolean') {
                        //     extra.enabled = params.enabled;
                        // }
                        // if (params?.address) {
                        //     extra.address = params.address;
                        // }
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
                    rowKey="username"
                    search={{
                        labelWidth: 'auto',
                    }}
                    options={{
                        setting: {
                            listsHeight: 400,
                        },
                    }}
                    pagination={{
                        pageSize: 10,
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

                </div>;
                
            } 
        else if(role==='Agent'){
            return   <div>
            <ProTable<SuperUser> 
            scroll={{x:"100%"}}
            columns={AgentColumns}
            actionRef={actionRef}
            cardBordered
            request={async (params = {}, sort, filters) => {
                    const orderBy: { [key: string]: 'asc' | 'desc' } = {};
                    for (const sortKey in sort) {
                        console.log('sortKey',sortKey)
                        const field = sortKey.replace(/_(\w)/g, function (_all, letter) {
                            return letter.toUpperCase();
                        });
                        console.log('field',field)
                        orderBy[field] = sort[sortKey] === 'ascend' ? 'asc' : 'desc'
                        console.log(' orderBy[field] ', orderBy[field] )
                    }
                    const extra: Record<string, boolean | number | string> = {
                        role,
                    }
                    // if (typeof params.enabled === 'boolean') {
                    //     extra.enabled = params.enabled;
                    // }
                    // if (params?.address) {
                    //     extra.address = params.address;
                    // }
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
                rowKey="username"
                search={{
                    labelWidth: 'auto',
                }}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                pagination={{
                    pageSize: 10,
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

            </div>;
        }
        else{
            return <div></div>;

        }
    };
    return (
        <PageContainer
            title={roleName + '管理'}
            token={{
                paddingInlinePageContainerContent: 40,
            }}
        >
            {renderContent()}
            
        </PageContainer>
    );
         
}

export default UserIndexPage;
