import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable} from "@ant-design/pro-components";
import {useRef} from 'react';
import {RechargeOrder} from "@/shims";
import RechargeOrderApi from "@/api/recharge-order";

const columns: ProColumns<RechargeOrder>[] = [
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
        title: '用户地址',
        key: 'address',
        dataIndex: 'member.address',
        valueType: "text",
        width: 200,
        ellipsis: true,
        copyable: true,
        render: (_dom, record) => {
            return record.member.address;
        }
    },
    {
        title: '支付金额',
        key: 'payAmount',
        dataIndex: 'payAmount',
        valueType: "text",
        width: 200,
        ellipsis: true,
        copyable: true,
        render: (_dom, record) => {
            return record.payAmount;
        }
    },
    {
        title: '币种',
        key: 'currency',
        dataIndex: 'currency',
        valueType: "text",
        width: 200,
    },
    {
        title: '结算状态',
        key: 'settlementStatus',
        dataIndex: 'settlementStatus',
        valueType: "text",
        width: 200,
    },
    {
        title: '结算金额',
        key: 'settlementAmount',
        dataIndex: 'settlementAmount',
        valueType: "text",
        width: 200,
        ellipsis: true,
        copyable: true,
        render: (_dom, record) => {
            return (record.settlementAmount / 100).toFixed(2);
        }
    },
    {
        title: '到账金币',
        key: 'coinAmount',
        dataIndex: 'coinAmount',
        valueType: "text",
        width: 200,
        hideInSearch: true,
    },
    {
        title: '支付状态',
        key: 'payStatus',
        dataIndex: 'payStatus',
        valueType: "text",
        width: 200,
        hideInSearch: true,
    },
    {
        title: '充值渠道',
        key: 'paymentChannel',
        dataIndex: 'paymentChannel',
        valueType: "text",
        width: 200,
        hideInSearch: true,
        render: (_, record) => {
            return record.paymentChannel.title;
        }
    },
    {
        title: '支付时间',
        key: "paidAt",
        dataIndex: "paidAt",
        valueType: "text",
        width: 200,
        hideInSearch: true,
    },
    {
        title: '支付状态',
        key: "level",
        dataIndex: "level",
        valueType: "text",
        width: 100,
        hideInSearch: true,
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
                    console.log(record, action)
                }}
            >
                手动支付成功
            </a>,
        ],
    },
];
export default () => {
    const actionRef = useRef<ActionType>();
    return <PageContainer
        title="充值订单管理"
        token={{
            paddingInlinePageContainerContent: 40,
        }}
    >
        <div>
            <ProTable<RechargeOrder>
                scroll={{x: 1000}}
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
                    const extra: { [key: string]: string } = {}

                    if (params?.address) {
                        extra.address = params.address
                    }
                    const result = await RechargeOrderApi.getList({
                        page: (params?.current ?? 1) as number,
                        limit: (params.pageSize ?? 10) as number,
                        q: '',
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
                headerTitle="充值列表"
            />
        </div>
    </PageContainer>
}
