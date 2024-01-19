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
import specApi, { specEditDto } from "@/api/spec.ts";
import { PlusOutlined } from "@ant-design/icons";
export interface SpecPageProps {
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
  text: "图片",
});
types.set(2, {
  text: "视频",
});
const SpecIndexPage = (props: SpecPageProps) => {
  const { role } = props;
  const [authUser] = useRecoilState(AuthInfo);

  const actionRef = useRef<ActionType>();
  const [pageSize, setPageSize] = useSafeState(100);
  const reload = useCallback(() => {
    actionRef.current?.reload();
  }, []);

  useEffect(() => {
    // 在组件加载时触发 loadAdvertisers 并设置值给 advertiserSearch
  }, []);
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

  const rootcolumns: ProColumns<specEditDto>[] = [
    {
      title: "ID",
      key: "id",
      dataIndex: "id",
      render: (_dom, record) => {
        return record.id.toString();
      },
      width: 200,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: "名称",
      key: "name",
      dataIndex: "name",
      ellipsis: true,
      valueType: "text",
      width: 200,
      formItemProps: {
        name: "q",
      },
    },
    {
      title: "类型", // 类型 1 图片 2视频
      key: "type",
      dataIndex: "type",
      ellipsis: true,
      valueType: "text",
      width: 60,
      valueEnum: types,
      hideInSearch: true,
    },
    {
      title: "尺寸",
      key: "size",
      dataIndex: "size",
      ellipsis: true,
      valueType: "text",
      width: 100,
      hideInSearch: true,
    },
    // {
    //   title: "更新时间",
    //   key: "updatedAt",
    //   width: 100,
    //   dataIndex: "updatedAt",
    //   valueType: "dateTime",
    //   sorter: true,
    //   hideInSearch: true,
    // },
    {
      title: "状态",
      key: "enabled",
      dataIndex: "enabled",
      ellipsis: true,
      valueType: "text",
      width: 100,
      hideInSearch: true,
      valueEnum: maps,
    },
    {
      title: "操作",
      valueType: "option",
      width: 100,
      key: "option",
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
                  title="删除广告规格"
                  description="是否删除该广告规格？"
                  onConfirm={() => {
                    specApi
                      .remove(BigInt(record.id))
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
          <ProTable<specEditDto>
            columns={rootcolumns}
            scroll={{ x: 1000 }}
            actionRef={actionRef}
            cardBordered
            request={async (params = {}, sort, filters) => {
              const orderBy: { [key: string]: "asc" | "desc" } = {};
              for (const sortKey in sort) {
                const field = sortKey.replace(
                  /_(\w)/g,
                  function (_all, letter) {
                    return letter.toUpperCase();
                  }
                );
                orderBy[field] = sort[sortKey] === "ascend" ? "asc" : "desc";
              }
              const extra: Record<string, boolean> = {};
              console.log("extra", extra);
              const result = await specApi.getList({
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
            headerTitle={"广告规格列表"}
            toolBarRender={() => [
              <Button
                key="button"
                icon={<PlusOutlined />}
                onClick={() => {
                  $emit.emit("add", {});
                }}
                type="primary"
              >
                新建{"广告规格"}
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

export default SpecIndexPage;
