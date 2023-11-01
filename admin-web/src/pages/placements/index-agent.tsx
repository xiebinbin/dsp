import type {
  ActionType,
  ProColumns,
  ProSchemaValueEnumType,
} from "@ant-design/pro-components";
import {
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import PlacementDetail, { $detailemit } from "./detail-form.tsx";
import { AdPlacement } from "@/shims";
import { useMount, useSafeState, useUnmount } from "ahooks";
import PlacementApi from "@/api/placement.ts";
import App from "@/App.tsx";

// import { boolMap } from "@/utils/list-tool.ts";
import AdvAPI from "@/api/advertiser.ts";
export interface PlacementsPageProps {
  role: "Root" | "Agent" | "Advertiser";
  roleName: string;
}
const maps = new Map<
  string | number | boolean,
  ProSchemaValueEnumType | ReactNode
>();
maps.set(1, {
  text: "启动",
  status: "success",
});
maps.set(0, {
  text: "暂停",
  status: "error",
});
maps.set(2, {
  text: "结束",
  status: "warning",
});
const PlacementsAgentIndexPage = (props: PlacementsPageProps) => {
  const { role,  } = props;
  const [advertisers, setAdvertisers] = useSafeState<
    { id: number; name: string;  }[]
  >([]);


  const actionRef = useRef<ActionType>();
  const [pageSize, setPageSize] = useSafeState(100);
  const reload = useCallback(() => {
    actionRef.current?.reload();
  }, []);
  // const loadAgents = useCallback(async () => {
  //   try {
  //     const agentslist = await AgentApi.getAgentsList();
  //     console.log("agentslist", agentslist);

  //     setAgents(
  //       agentslist.map((agent) => {
  //         return {
  //           label: agent.name,
  //           value: Number(agent.id),
  //         };
  //       })
  //     );
  //   } catch (error) {
  //     console.error("Error fetching agent options:", error);
  //   }
  // }, [setAgents]);

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
      setAdvertisers(
        res.map((item) => {
          return {
            name: item.name,
            id: Number(item.id),
          };
        })
      );
      console.log("advlist advertisers", advertisers);
    },
    [setAdvertisers]
  );

  useEffect(() => {
    // 在组件加载时触发 loadAdvertisers 并设置值给 advertiserSearch
    //   loadAgents();
    loadAdvertisers("");
  }, []);
  useMount(() => {
    $detailemit.on("reload", () => {
      reload();
    });
  });
  useUnmount(() => {
    $detailemit.off("reload", () => {
      reload();
    });
  });

  const agentcolumns: ProColumns<AdPlacement>[] = [
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
    //   {
    //     title: "计划名称",
    //     key: "name",
    //     dataIndex: "name",
    //     ellipsis: true,
    //     valueType: "text",
    //     width: 200,
    //     formItemProps: {
    //       name: "q",
    //     },
    //   },
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
        title: "创意名称",
        key: "materialname",
        dataIndex: "materialname",
        ellipsis: true,
        valueType: "text",
        width: 200,
        formItemProps: {
          name: "mn",
        },
        render: (_, record) => {
          // 自定义渲染函数，将 AdMaterial 中的 nickname 放到 agentname 处
          return record.adMaterial?.name || "-";
        },
      },

    {
      title: "当前消耗",
      key: "usedBudget",
      width: 100,
      dataIndex: "usedBudget",
      valueType: "money",

      hideInSearch: true,
       render: (_, entity) => {
      // 假设 budget 字段以分为单位
      const text = entity.usedBudget; // 获取实体对象中的 budget 属性

      const usedBudgetYuan = Number(text) / 100; // 将分转换为元
      return `¥ ${usedBudgetYuan.toFixed(2)}`; // 显示为元并保留两位小数
    },
    },
    {
      title: "预算上限",
      key: "budget",
      width: 100,
      dataIndex: "budget",
      valueType: "money",
      hideInSearch: true,
       render: (_, entity) => {
      // 假设 budget 字段以分为单位
      const text = entity.budget; // 获取实体对象中的 budget 属性

      const budgetYuan = Number(text) / 100; // 将分转换为元
      return `¥ ${budgetYuan.toFixed(2)}`; // 显示为元并保留两位小数
    },
    },
    {
      title: "展现次数",
      key: "displayCount",
      width: 100,
      dataIndex: "displayCount",
      valueType: "text",
      hideInSearch: true,
    },
    {
      title: "点击次数",
      key: "clickCount",
      width: 100,
      dataIndex: "clickCount",
      valueType: "text",

      hideInSearch: true,
    },
    {
        title: "开始时间",
        key: "startedAt",
        width: 200,
        dataIndex: "startedAt",
        valueType: "dateTime",
        sorter: true,
        hideInSearch: true,
      },
      {
        title: "结束时间",
        key: "endedAt",
        width: 200,
        dataIndex: "endedAt",
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
      width: 100,
      hideInSearch: true,
      valueEnum: maps,
    },
    {
      title: "操作",
      valueType: "option",
      width: 200,
      key: "option",
      fixed: "right",
      render: (_text, record) => [
        <a
          key="editable"
          onClick={() => {
            $detailemit.emit("detail", record.id);
          }}
        >
          查看
        </a>,
      ],
    },
  ];

  const renderContent = () => {
    if (role === "Agent") {
      return (
        <div>
          <ProTable<AdPlacement>
            columns={agentcolumns}
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
              console.log("request params", params);
              if (params.advid) {
                extra.advid = params.advid;
              }
              if(params.mn)
              {
                extra.materialname=params.mn;
              }
           
              const result = await PlacementApi.getList({
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
            rowKey="name"
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
            headerTitle={"广告投放列表"}
        
          />
          <PlacementDetail {...props} />
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
      <><App/></>
    </PageContainer>
  );
};

export default PlacementsAgentIndexPage;
