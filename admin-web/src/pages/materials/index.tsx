import type {
  ActionType,
  ProColumns,
} from "@ant-design/pro-components";
import {
  PageContainer,
  ProTable,
  TableDropdown,
} from "@ant-design/pro-components";
import { Button, Popconfirm } from "antd";
import { useCallback, useEffect, useRef } from "react";
import EditForm, { $emit } from "./edit-form.tsx";
import { AdMaterial } from "@/shims";
import { useMount, useSafeState, useUnmount } from "ahooks";
import MaterialApi from "@/api/material.ts";
// import { boolMap } from "@/utils/list-tool.ts";
import AdvAPI from "@/api/advertiser.ts";
import AgentApi from "@/api/agent.ts";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthInfo } from "@/stores/auth-info.ts";
import { useRecoilState } from "recoil";

export interface MaterialsPageProps {
  role: "Root" | "Agent" | "Advertiser";
  roleName: string;
}
const MaterialsIndexPage = (props: MaterialsPageProps) => {
  const { role, roleName } = props;
  const [authUser] = useRecoilState(AuthInfo);

  const [advertisers, setAdvertisers] = useSafeState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const [agents, setAgents] = useSafeState<{ label: string; value: number }[]>(
    []
  );
  const [advertisersList, setadvertisersList] = useSafeState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const actionRef = useRef<ActionType>();
  const [pageSize, setPageSize] = useSafeState(100);
  const reload = useCallback(() => {
    actionRef.current?.reload();
  }, []);
  const [selectedAgent, setSelectedAgent] = useSafeState<number | string>("");

  const loadAgents = useCallback(async () => {
    try {
      const agentslist = await AgentApi.getAgentsList();
      console.log("agentslist", agentslist);

      setAgents(
        agentslist.map((agent) => {
          return {
            label: agent.name,
            value: Number(agent.id),
          };
        })
      );
      console.log("index agents", agents);
    } catch (error) {
      console.error("Error fetching agent options:", error);
    }
  }, [setAgents]);

  const loadAdvertisers = useCallback(
    async (q: string) => {
      console.log("loadAdv");
      const extra: Record<string, boolean | string> = {
        role,
      };
      const filters: Record<string, (number | string | boolean)[] | null> = {};
      const orderBy: { [key: string]: "asc" | "desc" } = {};
      const res = await AdvAPI.getOptList({
        page: 1,
        limit: 10,
        q: q ?? "",
        filters,
        orderBy,
        extra,
      });
      console.log("advlist res", res);

      setadvertisersList(
        res.map((item) => {
          return {
            name: item.name,
            id: Number(item.id),
            agentId: Number(item.agentId),
          };
        })
      );
      console.log("advlist advertisersList", advertisersList);
    },
    [setadvertisersList, role]
  );

  useEffect(() => {
    // 在组件加载时触发 loadAdvertisers 并设置值给 advertiserSearch
    loadAgents();
    loadAdvertisers("");
    if (selectedAgent) {
      const filteredAdvertisers = advertisersList.filter(
        (advertiser) => advertiser.agentId === selectedAgent
      );
      setAdvertisers(filteredAdvertisers);
    } else {
      setAdvertisers([]);
    }
  }, [selectedAgent]);
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

  const rootcolumns: ProColumns<AdMaterial>[] = [
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
      title: "代理商",
      key: "agentname",
      dataIndex: "agentname",
      ellipsis: true,
      valueType: "select",
      width: 200,
      fieldProps: {
        showSearch: true,
        // onChange: (e) => {
        //   // 设置代理商状态
        //   setSelectedAgent(e);

        // },
        options: agents,

        onChange: setSelectedAgent,
      },
      formItemProps: {
        name: "agentid",
      },
      render: (_, record) => {
        // 自定义渲染函数，将 AdMaterial 中的 nickname 放到 agentname 处
        return record.advertiser?.user?.nickname || "-";
      },
    },
    {
      title: "广告主",
      key: "advertiserSearch",
      dataIndex: "advertiserSearch",
      valueType: "select",
      width: 200,
      fieldProps: {
        showSearch: true,
        options: advertisers.map(
          (advertiser: { name: string; id: number }) => ({
            label: advertiser.name,
            value: advertiser.id,
          })
        ),
      },
      render: (_, record) => {
        // 自定义渲染函数，将 AdMaterial 中的 companyName 放到 agentname 处
        return record.advertiser?.companyName || "-";
      },
      formItemProps: {
        name: "advid",
      },
      hideInTable: true,
    },
    {
      title: "广告主",
      key: "advertiser",
      dataIndex: "advertiser",
      ellipsis: true,
      valueType: "text",
      width: 200,

      render: (_, record) => {
        // 自定义渲染函数，将 AdMaterial 中的 companyName 放到 agentname 处
        return record.advertiser?.companyName || "-";
      },
      hideInSearch: true,
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
      title: "更新时间",
      key: "updatedAt",
      width: 200,
      dataIndex: "updatedAt",
      valueType: "dateTime",
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "操作",
      valueType: "option",
      width: 200,
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
                  title="删除创意"
                  description="是否删除该创意？"
                  onConfirm={() => {
                    MaterialApi.remove(record.id)
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
          <ProTable<AdMaterial>
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
              const extra: Record<string, boolean | number | string> = {};
              console.log("request params", params);
              if (params.advid) {
                extra.advid = params.advid;
              }
              if (params.agentid) {
                extra.agentid = params.agentid;
              }
              extra.role = role;
              console.log("extra", extra);
              const result = await MaterialApi.getList({
                page: (params?.current ?? 1) as number,
                limit: (params.pageSize ?? 10) as number,
                q: params?.q ?? undefined,
                filters,
                orderBy,
                extra,
              });

              console.log("result", result);
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
            headerTitle={"广告创意列表"}
            toolBarRender={() => [
              <Button
                key="button"
                icon={<PlusOutlined />}
                onClick={() => {
                  $emit.emit("add", {});
                }}
                type="primary"
              >
                新建{"广告创意"}
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
    </PageContainer>
  );
};

export default MaterialsIndexPage;
