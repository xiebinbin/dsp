// import type {ActionType, ProColumns} from '@ant-design/pro-components';
// import {PageContainer, ProTable, TableDropdown} from "@ant-design/pro-components";
// import {Button} from 'antd';
// import {useCallback, useRef} from 'react';
// import EditForm, {$emit} from "./edit-form.tsx";
// import {Agent} from "@/shims";
// import AgentApi from "@/api/agent.ts";
// import {useMount, useUnmount} from "ahooks";

// const columns: ProColumns<Agent>[] = [
//     {
//         title: 'ID',
//         key: 'id',
//         dataIndex: 'id',
//         render: (_dom, record) => {
//             return record.id.toString();
//         },
//         width: 120,
//         hideInSearch: true,
//     },
//     {
//         title: '地址',
//         key: 'address',
//         dataIndex: 'member.address',
//         valueType: "text",
//         width: 200,
//         ellipsis: true,
//         copyable: true,
//         render: (_dom, record) => {
//             return record.member.address;
//         }
//     },
//     {
//         title: '当日邀请人数',
//         key: 'todayInviteNum',
//         dataIndex: 'todayInviteNum',
//         valueType: "text",
//         width: 200,
//         hideInSearch: true,
//     },
//     {
//         title: '累计邀请人数',
//         key: 'totalInviteNum',
//         dataIndex: 'totalInviteNum',
//         valueType: "text",
//         width: 200,
//         hideInSearch: true,
//     },
//     {
//         title: '当日充值金额',
//         key: 'todayRechargeAmount',
//         dataIndex: 'todayRechargeAmount',
//         valueType: "text",
//         width: 200,
//         hideInSearch: true,
//     },
//     {
//         title: '累计充值金额',
//         key: 'totalRechargeAmount',
//         dataIndex: 'totalRechargeAmount',
//         valueType: "text",
//         width: 200,
//         hideInSearch: true,
//     },
//     {
//         title: '当前有效充值',
//         key: 'rechargeAmount',
//         dataIndex: 'rechargeAmount',
//         valueType: "text",
//         width: 200,
//         hideInSearch: true,
//     },
//     {
//         title: '登录奖励',
//         key: 'loginCoinRewardAmount',
//         dataIndex: 'loginCoinRewardAmount',
//         valueType: "text",
//         width: 200,
//         hideInSearch: true,
//     },
//     {
//         title: '可提现余额',
//         key: "cash",
//         dataIndex: "cash",
//         valueType: "text",
//         width: 200,
//         hideInSearch: true,
//         render: (_dom, record) => {
//             return  "$"+ Math.floor((Number(record.member.agentWallet.cash) / 100));
//         }
//     },
//     {
//         title: '等级',
//         key: "level",
//         dataIndex: "level",
//         valueType: "text",
//         width: 100,
//         hideInSearch: true,
//     },
//     {
//         title: '更新时间',
//         key: 'updatedAt',
//         width: 200,
//         dataIndex: 'updatedAt',
//         valueType: 'dateTime',
//         sorter: true,
//         hideInSearch: true,
//     },
//     {
//         title: '操作',
//         valueType: 'option',
//         width: 200,
//         fixed: "right",
//         key: 'option',
//         render: (_text, record) => [
//             <a
//                 key="editable"
//                 onClick={() => {
//                     $emit.emit('update', record.id);
//                 }}
//             >
//                 编辑
//             </a>,
//             <TableDropdown
//                 key="actionGroup"
//                 menus={[
//                     {
//                         key: 'remove', name: <Button danger>充值金币</Button>
//                     },
//                 ]}
//             />,
//         ],
//     },
// ];
// const AgentIndexPage = () => {
//     const actionRef = useRef<ActionType>();
//     const reload = useCallback(() => {
//         actionRef.current?.reload()
//     }, []);
//     useMount(() => {
//         $emit.on('reload', () => {
//             reload()
//         })
//     });
//     useUnmount(() => {
//         $emit.off('reload', () => {
//             reload()
//         });
//     });
//     return <PageContainer
//         title="代理商管理"
//         token={{
//             paddingInlinePageContainerContent: 40,
//         }}
//     >
//         <div>
//             <ProTable<Agent>
//                 scroll={{x: 1000}}
//                 columns={columns}
//                 actionRef={actionRef}
//                 cardBordered
//                 request={async (params = {}, sort, filters) => {
//                     const orderBy: { [key: string]: 'asc' | 'desc' } = {};
//                     for (const sortKey in sort) {
//                         const field = sortKey.replace(/_(\w)/g, function (_all, letter) {
//                             return letter.toUpperCase();
//                         });
//                         orderBy[field] = sort[sortKey] === 'ascend' ? 'asc' : 'desc'
//                     }
//                     const extra: {[key:string]: string} = {}

//                     if (params?.address){
//                         extra.address = params.address
//                     }
//                     const result = await AgentApi.getList({
//                         page: (params?.current ?? 1) as number,
//                         limit: (params.pageSize ?? 10) as number,
//                         q: '',
//                         filters,
//                         orderBy,
//                         extra
//                     })
//                     return {
//                         ...result,
//                         success: true,
//                     };
//                 }}
//                 rowKey="id"
//                 search={{
//                     labelWidth: 'auto',
//                 }}
//                 options={{
//                     setting: {
//                         listsHeight: 400,
//                     },
//                 }}
//                 pagination={{
//                     pageSize: 100,
//                 }}
//                 dateFormatter="string"
//                 headerTitle="代理商列表"
//             />
//             <EditForm/>
//         </div>
//     </PageContainer>
// }
// export default AgentIndexPage;
