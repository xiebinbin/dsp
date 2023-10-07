import type {
    ActionType,
    ProColumns,
  } from "@ant-design/pro-components";
  import {
    PageContainer,
    ProTable,
  } from "@ant-design/pro-components";
  import { useCallback, useEffect, useRef } from "react";
  import MaterialDetail,{$detailemit} from "./detail-form.tsx"
  import { AdMaterial } from "@/shims";
  import { useMount, useSafeState, useUnmount } from "ahooks";
  import MaterialApi from "@/api/material.ts";
  // import { boolMap } from "@/utils/list-tool.ts";
  import AdvAPI from "@/api/advertiser.ts";
  import App from "@/App.tsx";

  export interface MaterialsPageProps {
    role: "Agent" | "Advertiser"|"Root";
    roleName: string;
  }
  const MaterialsAgentIndexPage = (props: MaterialsPageProps) => {
    const { role, roleName } = props;
    const [advertisers, setAdvertisers] = useSafeState<
      { id: number; name: string; agentId: number }[]
    >([]);
  
    const actionRef = useRef<ActionType>();
    const [pageSize, setPageSize] = useSafeState(100);
    const reload = useCallback(() => {
      actionRef.current?.reload();
    }, []);

  
    const loadAdvertisers = useCallback(
      async (q: string) => {
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
              agentId: Number(item.agentId),
            };
          }))
      
      },
      [setAdvertisers,role]
    );
  
    useEffect(() => {
      // 在组件加载时触发 loadAdvertisers 并设置值给 advertiserSearch
      loadAdvertisers("");
  
    }, [loadAdvertisers]);
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
  
    const agentcolumns: ProColumns<AdMaterial>[] = [
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
        render: (_text, record) => [
          <a
            key="detail"
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
      if (role === "Agent"||role==='Root') {
          return(
            <div>
              <ProTable<AdMaterial>
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
                if (params.agentid) {
                  extra.agentid = params.agentid;
                }
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
              
              />
              <MaterialDetail {...props} />
              </div>
              )
                        
 
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
  
  export default MaterialsAgentIndexPage;
  