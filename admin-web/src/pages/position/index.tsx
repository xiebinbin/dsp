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
import { useMount, useSafeState, useUnmount } from "ahooks";
import PositionApi, { PositionEditDto } from "@/api/position.ts";
import { PlusOutlined } from "@ant-design/icons";
export interface PositionPageProps {
  role: "Root" | "Operator";
  roleName: string;
}
import { AuthInfo } from "@/stores/auth-info.ts";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import App from "@/App.tsx";
const maps = new Map<
  string | number | boolean,
  ProSchemaValueEnumType | ReactNode
>();
maps.set(true, {
  text: "启动",
  status: "success",
});
maps.set(false, {
  text: "暂停",
  status: "error",
});
const types = new Map<number, ProSchemaValueEnumType | ReactNode>();
types.set(1, {
  text: "网站",
});
types.set(2, {
  text: "PC软件",
});
const PositionIndexPage = (props: PositionPageProps) => {
  const { role } = props;
  const [authUser] = useRecoilState(AuthInfo);

  const actionRef = useRef<ActionType>();
  const [pageSize, setPageSize] = useSafeState(100);
  const reload = useCallback(() => {
    actionRef.current?.reload();
  }, []);

  useEffect(() => {}, []);
  useMount(() => {
    $emit.on("reload", () => {
      reload();
    });
  });
  useUnmount(() => {
    $emit.off("reload", () => {
      reload();
    });
  });

  const rootcolumns: ProColumns<PositionEditDto>[] = [
    {
      title: "ID",
      key: "id",
      dataIndex: "id",
      render: (_dom, record) => {
        return record.id.toString();
      },
      width: 50,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "id", // 使用数据项的唯一ID作为key值
      ellipsis: true,
      valueType: "text",
      width: 150,
      formItemProps: {
        name: "q",
      },
    },
    {
      title: "媒体类型", // 类型 1 网站 2pc 软件
      dataIndex: "type",
      ellipsis: true,
      valueType: "text",
      width: 80,
      valueEnum: types,
      hideInSearch: true,

      // render: (_, record) => {
      //   // 自定义渲染函数，将 AdMaterial 中的 nickname 放到 agentname 处
      //   return record.advertiser?.user?.nickname || "-";
      // },
    },
    {
      title: "规格",
      dataIndex: "spec",
      ellipsis: true,
      valueType: "text",
      width: 100,
      hideInSearch: true,

      render: (_, record) => {
        return record.adSpec?.name || "-";
      },
    },
    {
      title: "媒体",
      dataIndex: "media",
      ellipsis: true,
      valueType: "text",
      width: 100,
      hideInSearch: true,

      render: (_, record) => {
        return record.adMedia?.name || "-";
      },
    },
    {
      title: "千次展现价格",
      dataIndex: "cpmPrice",
      ellipsis: true,
      valueType: "text",
      width: 100,
      hideInSearch: true,

      render: (_, record) => {
        const balanceYuan = Number(record.cpmPrice) / 100; // 将分转换为元
        return `¥ ${balanceYuan.toFixed(2)}`;
        // return `¥ $(record.cpmPrice / 100).toFixed(2)`;
      },
    },
    {
      title: "更新时间",
      width: 100,
      dataIndex: "updatedAt",
      valueType: "dateTime",
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "状态",
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
      render: (_text, record, _, action) => [
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
                  title="删除广告位置"
                  description="是否删除该广告位置？"
                  onConfirm={() => {
                    PositionApi.remove(BigInt(record.id))
                      .then(() => {
                        action?.reload();
                        window.Message.success("删除成功");
                      })
                      .catch(() => {
                        window.Message.error("删除失败");
                      });
                  }}
                >
                  <Button danger>删除</Button>
                </Popconfirm>
              ),
            },
          ]}
        />,
      ],
    },
  ];
  const navigate = useNavigate();

  const renderContent = () => {
    if (role === "Root") {
      if (authUser.role !== "Root" && authUser.role !== "Operator") {
        navigate("/unauthorized");
        return null;
      }
      return (
        <div>
          <ProTable<PositionEditDto>
            columns={rootcolumns}
            scroll={{ x: 1000 }}
            actionRef={actionRef}
            cardBordered
            request={async (params = {}, sort, filters) => {
              const orderBy: { [key: string]: "asc" | "desc" } = {};
              // for (const sortKey in sort) {
              //   const field = sortKey.replace(
              //     /_(\w)/g,
              //     function (_all, letter) {
              //       return letter.toUpperCase();
              //     }
              //   );
              //   orderBy[field] = sort[sortKey] === "ascend" ? "asc" : "desc";
              // }
              const extra: Record<string, boolean> = {};
              console.log("extra", extra);
              const result = await PositionApi.getList({
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
              labelWidth: "auto",
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
              },
            }}
            dateFormatter="string"
            headerTitle={"广告位置列表"}
            toolBarRender={() => [
              <Button
                key="button"
                icon={<PlusOutlined />}
                onClick={() => {
                  $emit.emit("add", {});
                }}
                type="primary"
              >
                新建{"广告位置"}
              </Button>,
            ]}
          />
          <EditForm />
        </div>
      );
    } else {
      <div>none</div>;
    }
  };
  return (
    <PageContainer
      token={{
        paddingInlinePageContainerContent: 40,
      }}
    >
      {renderContent()}
      <>
        <App />
      </>
    </PageContainer>
  );
};

export default PositionIndexPage;
