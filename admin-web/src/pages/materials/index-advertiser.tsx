import type {
    ActionType,
    ProColumns,
  } from "@ant-design/pro-components";
  import {
    PageContainer,
    ProTable,
  } from "@ant-design/pro-components";
  import { useCallback, useRef } from "react";
  import MaterialDetail,{$detailemit} from "./detail-form.tsx"
  import { AdMaterial } from "@/shims";
  import { useMount, useSafeState, useUnmount } from "ahooks";
  import MaterialApi from "@/api/material.ts";
  // import { boolMap } from "@/utils/list-tool.ts";
  export interface MaterialsPageProps {
    role: "Agent" | "Advertiser"|"Root";
    roleName: string;
  }
  const MaterialsAdvertiserIndexPage = (props: MaterialsPageProps) => {
    const { role, } = props;
    const actionRef = useRef<ActionType>();
    const [pageSize, setPageSize] = useSafeState(100);
    const reload = useCallback(() => {
      actionRef.current?.reload();
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
      if (role === "Advertiser"||role==='Root') {
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
         
                const result = await MaterialApi.getListByAdvertiser({
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
      </PageContainer>
    );
  };
  
  export default MaterialsAdvertiserIndexPage;
  