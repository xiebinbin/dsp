import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormInstance,
  ProTable,
} from "@ant-design/pro-components";
import { useMount, useSafeState, useUnmount } from "ahooks";
import RechargeApi, { RechargeHistDto } from "@/api/recharge-order.ts";

import Emittery from "emittery";
import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const $histemit = new Emittery();

const RechargeHist = (props: { role: "Root" | "Agent"; roleName: string }) => {
  const { role, roleName } = props;

  const [show, setShow] = useSafeState(false);
  const [mode, setMode] = useSafeState("add");
  const [advertiserId, setAdvId] = useSafeState<bigint>(BigInt(0));
  const [companyName, setCompanyName] = useSafeState<string>("");

  const formRef = useRef<ProFormInstance>();
  // 示例充值记录数据
  const actionRef = useRef<ActionType>();
  const reload = useCallback(() => {
    actionRef.current?.reload();
  }, []);
  const columns: ProColumns<RechargeHistDto>[] = [
    {
      title: "广告主id",
      dataIndex: "advertiserId",
      valueType: "text",
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: "充值时间",
      dataIndex: "createdAtSearch",
      valueType: "date",
      hideInTable: true,
      formItemProps: {
        name: "q",
      },
    },
    {
      title: "充值时间",
      dataIndex: "createdAt",
      valueType: "dateTime",
      defaultSortOrder: "descend", // 默认上到下为由大到小的顺序
      sorter: (a, b) => {
        return a.createdAt > b.createdAt ? 1 : -1;
      },
      hideInSearch: true,
    },
    {
      title: "充值金额",
      dataIndex: "amount",
      valueType: "money",
      hideInSearch: true,
    },
  ];
  const location = useLocation();
  useEffect(() => {
    reload();
  }, [location, reload]);
  useMount(() => {
    $histemit.on("record", ({ val, companyName }) => {
      reload();
      setMode("record");
      setAdvId(val);
      setCompanyName(companyName);
      setShow(true);
    });
  });
  useUnmount(() => {
    reload();
    $histemit.clearListeners();
  });

  return (
    <ModalForm
      formRef={formRef}
      title={mode === "record" ? "充值记录" : "记录"}
      open={show}
      onOpenChange={(isOpen) => {
        // 在 Modal 关闭时清空数据
        if (!isOpen) {
          formRef.current?.resetFields(); // 清空表单字段
          //   setUsername(''); // 清空相关状态
          setAdvId(BigInt(0));
        }
        setShow(isOpen);
      }}
    >
      {mode === "record" && (
        <ProTable<RechargeHistDto>
          columns={columns}
          rowKey="id"
          actionRef={actionRef}
          options={{
            setting: {
              listsHeight: 400,
            },
          }}
          pagination={{
            pageSize: 30,
          }}
          search={{
            labelWidth: "auto", // 设置搜索区域中每个列的标题宽度，也可以设置具体的宽度值，例如 '100px'
            span: 6, // 设置搜索区域中每个列的宽度占比
          }}
          headerTitle={`${companyName}`}
          request={async (params = {}, sort, filters) => {
            console.log("params", params);
            const orderBy: { [key: string]: "asc" | "desc" } = {};
            for (const sortKey in sort) {
              console.log("sortKey", sortKey);
              const field = sortKey.replace(/_(\w)/g, function (_all, letter) {
                return letter.toUpperCase();
              });
              console.log("field", field);
              orderBy[field] = sort[sortKey] === "ascend" ? "asc" : "desc";
              console.log(" orderBy[field] ", orderBy[field]);
            }
            const extra: Record<string, boolean | number | string> = {
              role,
            };
            console.log("advertiserId", advertiserId);

            // if (typeof params.enabled === 'boolean') {
            //     extra.enabled = params.enabled;
            // }
            // if (params?.address) {
            //     extra.address = params.address;
            // }
            extra.advertiserId = Number(advertiserId);
            params.advertiserId = Number(advertiserId);
            console.log("params", params);
            const result = await RechargeApi.getRechargeHistList({
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
        />
      )}
    </ModalForm>
  );
};

export default RechargeHist;
