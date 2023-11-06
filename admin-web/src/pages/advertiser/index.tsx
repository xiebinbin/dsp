import type {
  ActionType,
  ProColumns,
  ProSchemaValueEnumType,
} from "@ant-design/pro-components";
import {
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { Button, Popconfirm } from "antd";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import EditForm, { $emit } from "./edit-form.tsx";
import { Advertiser } from "@/shims";
import AdvAPI from "@/api/advertiser.ts";
import { useMount, useUnmount } from "ahooks";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import RechargeForm, { $rechargeemit } from "./recharge-form.tsx";
import RechargeHist, { $histemit } from "./recharge-hist.tsx";
import { AuthInfo } from "@/stores/auth-info.ts";

import AdvertiserDetail, { $detailemit } from "./advertiser-detail.tsx";
import { useRecoilState } from "recoil";

const maps = new Map<
  string | number | boolean,
  ProSchemaValueEnumType | ReactNode
>();
maps.set(true, {
  text: "启用",
  status: "Success",
});
maps.set(false, {
  text: "禁用",
  status: "Error",
});
const advcolumns: ProColumns<Advertiser>[] = [
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
    title: "公司名",
    key: "companyName",
    dataIndex: "companyName",
    ellipsis: true,
    sorter: true,
    valueType: "text",
    width: 150,
    formItemProps: {
      name: "comp",
    },
  },

  {
    title: "账号",
    key: "username",
    dataIndex: "username",
    ellipsis: true,
    valueType: "text",
    width: 80,
    formItemProps: {
      name: "q",
    },
  },
  {
    title: "余额",
    key: "balance",
    width: 80,
    dataIndex: "balance",
    valueType: "money",

    hideInSearch: true,
    render: (_, entity) => {
      // 假设 budget 字段以分为单位
      const text = entity.wallet?.balance || 0; // 获取实体对象中的 budget 属性

      const balanceYuan = Number(text) / 100; // 将分转换为元
      return `¥ ${balanceYuan.toFixed(2)}`; // 显示为元并保留两位小数
    },
  },
  {
    title: "更新时间",
    key: "updatedAt",
    width: 80,
    dataIndex: "updatedAt",
    valueType: "dateTime",
    sorter: true,
    hideInSearch: true,
  },
  {
    title: "状态",
    key: "enabled",
    dataIndex: "enabled",
    ellipsis: true,
    valueType: "text",
    width: 50,
    hideInSearch: true,
    valueEnum: maps,
  },
  {
    title: "操作",
    valueType: "option",
    width: 100,
    fixed: "right",
    key: "option",
    render: (_text, record, _, action) => [
      <a
        key="recharge"
        onClick={() => {
          $rechargeemit.emit("recharge", record.id);
        }}
      >
        充值
      </a>,
      <a
        key="record"
        onClick={() => {
          $histemit.emit("record", {
            val: record.id,
            companyName: record.companyName,
          });
        }}
      >
        充值记录
      </a>,
      <a
        key="editable"
        onClick={() => {
          $emit.emit("update", record.id);
        }}
      >
        编辑
      </a>,
      <TableDropdown
        key="actionGroup"
        menus={[
          {
            key: "remove",
            name: (
              <Popconfirm
                title={"删除" + record.username}
                description="是否删除？"
                onConfirm={() => {
                  AdvAPI.remove(record.id)
                    .then(() => {
                      action?.reload();
                      window.Message.success("删除成功");
                    })
                    .catch(() => {
                      window.Message.error("删除失败");
                    });
                }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            ),
          },
        ]}
      />,
    ],
  },
];
const agentcolumns: ProColumns<Advertiser>[] = [
  {
    title: "公司名",
    key: "companyName",
    dataIndex: "companyName",
    ellipsis: true,
    sorter: true,
    valueType: "text",
    width: 150,
    formItemProps: {
      name: "comp",
    },
  },

  {
    title: "账号",
    key: "username",
    dataIndex: "username",
    ellipsis: true,
    valueType: "text",
    width: 80,
    formItemProps: {
      name: "q",
    },
  },
  {
    title: "更新时间",
    key: "updatedAt",
    width: 80,
    dataIndex: "updatedAt",
    valueType: "dateTime",
    sorter: true,
    hideInSearch: true,
  },
  {
    title: "状态",
    key: "enabled",
    dataIndex: "enabled",
    ellipsis: true,
    valueType: "text",
    width: 50,
    hideInSearch: true,
    valueEnum: maps,
  },
  {
    title: "操作",
    valueType: "option",
    width: 100,
    fixed: "right",
    key: "option",
    render: (_text, record) => [
      <a
        key="detail"
        onClick={() => {
          $detailemit.emit("detail", {
            val: record.id,
            companyName: record.companyName,
            cpmPrice: record.cpmPrice,
            domainName: record.domainName,
          });
        }}
      >
        查看
      </a>,
    ],
  },
];
export interface AdvIndexPageProps {
  role: "Root" | "Agent";
  roleName: string;
}
const AdvertiserIndexPage = (props: AdvIndexPageProps) => {
  const { role, roleName } = props;
  const [authUser] = useRecoilState(AuthInfo);

  const actionRef = useRef<ActionType>();
  const reload = useCallback(() => {
    actionRef.current?.reload();
  }, []);
  useMount(() => {
    $emit.on("reload", () => {
      reload();
    });
    $rechargeemit.on("reload", () => {
      reload();
    });
  });
  useUnmount(() => {
    $emit.off("reload", () => {
      reload();
    });
    $rechargeemit.off("reload", () => {
      reload();
    });
  });
  const location = useLocation();
  useEffect(() => {
    reload();
  }, [location, reload]);
  const navigate = useNavigate();

  const renderContent = () => {
    if (role === "Root") {
      if (authUser.role !== "Root" && authUser.role !== "Operator") {
        navigate("/unauthorized");
        return null;
      }
      return (
        <div>
          <ProTable<Advertiser>
            scroll={{ x: "100%" }}
            columns={advcolumns}
            actionRef={actionRef}
            cardBordered
            request={async (params = {}, sort, filters) => {
              const orderBy: { [key: string]: "asc" | "desc" } = {};
              for (const sortKey in sort) {
                console.log("sortKey", sortKey);
                const field = sortKey.replace(
                  /_(\w)/g,
                  function (_all, letter) {
                    return letter.toUpperCase();
                  }
                );
                console.log("field", field);
                orderBy[field] = sort[sortKey] === "ascend" ? "asc" : "desc";
                console.log(" orderBy[field] ", orderBy[field]);
              }
              const extra: Record<string, boolean | number | string> = {
                role,
              };
              // if (typeof params.enabled === 'boolean') {
              //     extra.enabled = params.enabled;
              // }
              // if (params?.address) {
              //     extra.address = params.address;
              // }
              if (params?.comp) {
                extra.comp = params.comp;
              }
              const result = await AdvAPI.getList({
                page: params.current ?? 1,
                limit: params.pageSize ?? 10,
                q: params.q ?? "",
                filters,
                orderBy,
                extra,
              });
              const data = result.data.map((item) => {
                return {
                  ...item,
                  balance: item.wallet?.balance || 0, // 如果 wallet 不存在或 balance 为空，使用默认值 0
                };
              });
              return {
                ...result,
                data: data, // 更新 data 字段为处理后的数据
                success: true,
              };
            }}
            rowKey="username"
            search={{
              labelWidth: "auto",
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
            headerTitle={roleName + "列表"}
            toolBarRender={() => [
              <Button
                key="button"
                icon={<PlusOutlined />}
                onClick={() => {
                  $emit.emit("add");
                }}
                type="primary"
              >
                新建{roleName}
              </Button>,
            ]}
          />
          <EditForm {...props} />
          <RechargeForm {...props} />
          <RechargeHist {...props} />
        </div>
      );
    } else if (role == "Agent") {
      if (authUser.role !== "Agent") {
        navigate("/unauthorized");
        return null;
      }
      return (
        <div>
          <ProTable<Advertiser>
            scroll={{ x: "100%" }}
            columns={agentcolumns}
            actionRef={actionRef}
            cardBordered
            request={async (params = {}, sort, filters) => {
              const orderBy: { [key: string]: "asc" | "desc" } = {};
              for (const sortKey in sort) {
                console.log("sortKey", sortKey);
                const field = sortKey.replace(
                  /_(\w)/g,
                  function (_all, letter) {
                    return letter.toUpperCase();
                  }
                );
                console.log("field", field);
                orderBy[field] = sort[sortKey] === "ascend" ? "asc" : "desc";
                console.log(" orderBy[field] ", orderBy[field]);
              }
              const extra: Record<string, boolean | number | string> = {
                role,
              };
              // if (typeof params.enabled === 'boolean') {
              //     extra.enabled = params.enabled;
              // }
              // if (params?.address) {
              //     extra.address = params.address;
              // }

              const result = await AdvAPI.getList({
                page: params.current ?? 1,
                limit: params.pageSize ?? 10,
                q: params.q ?? "",
                filters,
                orderBy,
                extra,
              });
              const data = result.data.map((item) => {
                return {
                  ...item,
                };
              });
              return {
                ...result,
                data: data, // 更新 data 字段为处理后的数据
                success: true,
              };
            }}
            rowKey="username"
            search={{
              labelWidth: "auto",
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
          />
          <AdvertiserDetail {...props} />
        </div>
      );
    } else {
      return <div>None</div>;
    }
  };
  return (
    <PageContainer
      title={roleName + "管理"}
      token={{
        paddingInlinePageContainerContent: 40,
      }}
    >
      {renderContent()}
    </PageContainer>
  );
};
export default AdvertiserIndexPage;
