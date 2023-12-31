import { useCallback, useEffect, useRef } from "react";
import {
  ActionType,
  PageContainer,
  ProCard,
  ProColumns,
  ProForm,
  ProFormDateRangePicker,
  ProFormInstance,
  ProFormSelect,
  ProTable,
} from "@ant-design/pro-components";
import { Line } from "@antv/g2plot";
import ReportApi, {
  ChartDataRequest,
  ChartDataResponse,
} from "@/api/report.ts";
import { useMount, useSafeState } from "ahooks";
import MaterialApi from "@/api/material.ts";
import AdvAPI from "@/api/advertiser.ts";
import { useRecoilState } from "recoil";
import { AuthInfo } from "@/stores/auth-info";
import { useNavigate } from "react-router-dom";
import App from "@/App.tsx";
import { CloseCircleOutlined } from "@ant-design/icons";
import { Divider, Tag } from "antd";
import dayjs from "dayjs";

export interface ReportPageProps {
  role: "Root" | "Agent" | "Advertiser";
  roleName: string;
}

const ReportIndexPage = (props: ReportPageProps) => {
  const { role, roleName } = props;
  const [authUser] = useRecoilState(AuthInfo);
  const actionRef = useRef<ActionType>();
  const [displayTotal, setDisplayTotal] = useSafeState<number>(0); // 使用 useState 初始化为 0
  const [clickTotal, setClickTotal] = useSafeState<number>(0); // 使用 useState 初始化为 0
  const [usedBudgetTotal, setUsedBudgetTotal] = useSafeState<number>(0); // 使用 useState 初始化为 0
  const plotRef = useRef<Line | null>(null); // 用于引用 G2Plot 的实例
  const formRef = useRef<ProFormInstance>();
  const [materials, setMaterials] = useSafeState<
    { name: string; id: number }[]
  >([]); // 使用 useState 初始化为空数组
  const [placements, setPlacements] = useSafeState<
    { name: string; id: number }[]
  >([]); // 使用 useState 初始化为空数组

  const [selectedAgent, setSelectedAgent] = useSafeState<number | string>("");
  const [agents, setAgents] = useSafeState<{ name: string; id: number }[]>([]);
  const [advertisers, setAdvertisers] = useSafeState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const [advertisersList, setadvertisersList] = useSafeState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const reload = useCallback(() => {
    actionRef.current?.reload();
  }, []);
  const handleAdvertiserChange = (e: string | null) => {
    setSelectedAgent;
    console.log("hand adverchange e,", e);
    if (e != null) {
      loadMaterials(e);
    }
  };
  const [detailData, setDetailData] = useSafeState<ChartDataResponse[]>([]); // 用于保存明细数据

  const handleMaterialChange = (e: string | null) => {
    console.log("handleMaterialChange e,", e);
    if (e != null) {
      loadPlacements(e);
    }
  };

  const loadAgentsRelation = useCallback(async () => {
    const agentList = await AdvAPI.getreportagentlist();
    setAgents(agentList);
  }, [setAgents]);

  const loadAdvertisers = useCallback(
    async (q: string) => {
      const filters: Record<string, (number | string | boolean)[] | null> = {};
      const orderBy: { [key: string]: "asc" | "desc" } = {};
      const res = await AdvAPI.getOptList({
        page: 1,
        limit: 1000,
        q: q ?? "",
        filters,
        orderBy,
        extra: {},
      });

      setadvertisersList(
        res.map((item) => {
          return {
            name: item.name,
            id: Number(item.id),
            agentId: Number(item.agentId),
          };
        })
      );
    },
    [setadvertisersList]
  );
  const loadMaterials = useCallback(
    async (q: string) => {
      try {
        const filters: Record<string, (number | string | boolean)[] | null> =
          {};
        const orderBy: { [key: string]: "asc" | "desc" } = {};
        console.log("materials load q", q);
        const res = await MaterialApi.getOptList({
          page: 1,
          limit: 1000,
          q: q ?? "",
          filters,
          orderBy,
          extra: {},
        });

        setMaterials(
          res.data.map((item) => {
            return {
              name: item.name,
              id: Number(item.id),
            };
          }) || []
        );
      } catch {
        console.error("An error occurred:");
      }
    },
    [setMaterials]
  );

  const loadPlacements = useCallback(
    async (q: string) => {
      try {
        console.log("loadPlacements load q", q);
        const res = await ReportApi.getPlacementOptlist({
          q: q ?? "",
          extra: {},
        });
        console.log("placement", res);

        setPlacements(
          res.data.map((item) => {
            return {
              name: item.name,
              id: Number(item.id),
            };
          }) || []
        );
      } catch {
        console.error("An error occurred:");
      }
    },
    [setPlacements]
  );

  const loadInfo = useCallback(
    async (data: ChartDataRequest) => {
      try {
        const chartContainer = document.getElementById("chart-container");
        // 检查元素是否存在
        if (chartContainer) {
          // 清空元素内容
          chartContainer.innerHTML = "";
        }

        const response = await ReportApi.getChartData(data);
        setDisplayTotal(response.reduce((a, b) => a + b.displayCount, 0));
        setClickTotal(response.reduce((a, b) => a + b.clickCount, 0));
        setUsedBudgetTotal(
          response.reduce((a, b) => a + b.usedBudget, 0)
        );
        if (response && response.length > 0) {
          setDetailData(response); // 设置明细表数据
          const transformedData: {
            date: string;
            value: number;
            category: string;
          }[] = [];

          for (const item of response) {
            transformedData.push(
              {
                date: item.date,
                value: item.displayCount,
                category: "PV数",
              },
              {
                date: item.date,
                value: item.clickCount,
                category: "点击数",
              },
              {
                date: item.date,
                value: Number(item.usedBudget / 100),
                category: "消耗金额",
              }
            );
          }
          const line = new Line("chart-container", {
            data: transformedData,
            xField: "date",
            yField: "value",
            seriesField: "category",
            xAxis: {
              nice: true,
              type: "time",
              // 文本标签
              label: {
                autoRotate: true,
                rotate: Math.PI / 6,
                offset: 35,
                style: {
                  fontSize: 10,
                },
                formatter: (text) => {
                  const formattedDate = dayjs(text).format("YYYY-MM-DD");
                  return formattedDate;
                },
              },
            },
            yAxis: {
              nice: true,
              label: {
                offset: 25,
                // formatter: (v) => Number(v).toFixed(2),

                // 数值格式化为千分位

                formatter: (v) =>
                  `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
              },
            },

            // label
            label: {
              // layout: [{ type: "hide-overlap" }], // 隐藏重叠label
              style: { color: "#d62728", textAlign: "center" },
              formatter: (item) => {
                if (item.category === "消耗金额") {
                  console.log(
                    "消耗金额",
                    (Number(item.value) / 100).toFixed(2)
                  );
                  return Number(item.value).toFixed(2);
                } else {
                  return item.value.toString();
                }
              },
            },
            padding: "auto",
            point: {
              size: 5,
              style: {
                lineWidth: 1,
                fillOpacity: 1,
              },
              shape: (item) => {
                if (item.category === "Cement production") {
                  return "circle";
                }
                return "diamond";
              },
            },
            legend: {
              position: "top",
            },
            animation: {
              appear: {
                duration: 3500,
              },
            },
          });

          line.render();

          plotRef.current = line;

          // // 更新图表数据
          if (plotRef.current) {
            plotRef.current.update({
              data: transformedData,
            });
          }
          return transformedData; // 表示成功
        } else {
          setDetailData([]);

          return false; // 表示失败
        }
        // 保存 G2Plot 实例的引用
      } catch (error) {
        console.error("获取数据失败：", error);
        return false; // 表示失败
      }
    },
    [setDetailData]
  );
  console.log("roleName", roleName);
  useEffect(() => {
    console.log("useEffect");

    loadAgentsRelation();
    loadAdvertisers("");
    if (selectedAgent) {
      const filteredAdvertisers = advertisersList.filter(
        (advertiser) => advertiser.agentId === selectedAgent
      );
      setAdvertisers(filteredAdvertisers);
      formRef.current?.setFieldsValue({
        advertiserId: "",
        adMaterialId: "",
        adPlacmentId: "",
      });
      reload();
    } else {
      setAdvertisers([]);
    }
  }, [selectedAgent]);

  useMount(() => {
    console.log("useMount");
    // 发起 POST 请求来获取数据
    setTimeout(() => {
      const currentDate = dayjs('2023-01-15').toDate();

      // 获取七天前的日期
      const sevenDaysAgo = new Date(currentDate);
      sevenDaysAgo.setDate(currentDate.getDate() - 7);
      const formattedStartDate = `${sevenDaysAgo.getFullYear()}-${(
        sevenDaysAgo.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${sevenDaysAgo
          .getDate()
          .toString()
          .padStart(2, "0")}`;
      const formattedcurrentDate = `${currentDate.getFullYear()}-${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${currentDate
          .getDate()
          .toString()
          .padStart(2, "0")}`;
      loadInfo({
        startDate: formattedStartDate,
        endDate: formattedcurrentDate,
        agentId: 0,
        advertiserId: 0,
        adMaterialId: 0,
        adPlacementId: 0,
      });
      formRef.current?.setFieldsValue({
        rangeDate: [dayjs(formattedStartDate), dayjs(formattedcurrentDate)],
      });
    }, 500);
    reload();
  });
  const rootcolumns: ProColumns<ChartDataResponse>[] = [
    {
      title: "日期",
      key: "date",
      dataIndex: "date",
      ellipsis: true,
      valueType: "text",
      width: 120,
      hideInSearch: true,
      render: (_, record) => {
        if (record.date == "汇总") {
          return record.date;
        }
        const formattedDate = dayjs(record.date).format("YYYY-MM-DD");
        return formattedDate;

      }
    },
    {
      title: "PV数",
      key: "displayCount",
      dataIndex: "displayCount",
      ellipsis: true,
      valueType: "select",
      width: 120,
      hideInSearch: true,
    },
    {
      title: "点击数",
      key: "clickCount",
      dataIndex: "clickCount",
      ellipsis: true,
      valueType: "select",
      width: 120,
      hideInSearch: true,
    },
    {
      title: "点击率",
      key: "clickrate",
      dataIndex: "clickrate",
      ellipsis: true,
      valueType: "text",
      width: 100,

      render: (_, record) => {
        if (record.date == '汇总') {
          const clickRate = (clickTotal / displayTotal) * 100;
          return clickRate.toFixed(2) + "%(平均)";
        }
        // 自定义渲染函数，将 AdMaterial 中的 companyName 放到 agentname 处
        const clickRate = (record.clickCount / record.displayCount) * 100;
        return clickRate.toFixed(2) + "%";
      },
      hideInSearch: true,
    },

    {
      title: "消耗金额",
      key: "usedBudget",
      width: 120,
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
  ];
  const navigate = useNavigate();

  const renderContent = () => {
    if (authUser.role !== "Root" && authUser.role !== "Operator") {
      navigate("/unauthorized");
      return null;
    }
    if (role === "Root") {
      return (
        <div>
          <ProCard>
            <ProForm
              // layout="horizontal"
              formRef={formRef}
              onFinish={async (values) => {
                try {

                  const requestData: ChartDataRequest = {
                    startDate: values.rangeDate[0],
                    endDate: values.rangeDate[1],
                    agentId: values.agent,
                    advertiserId: values.advertiserId,
                    adMaterialId: values.adMaterialId,
                    adPlacementId: values.adPlacementId,
                  };
                  // 处理表单提交，例如向后端发送请求
                  const result = await loadInfo(requestData);

                  // 根据请求结果返回相应的值，例如：
                  if (result) {
                    return true; // 表示提交成功
                  } else {
                    return false; // 表示提交失败
                  }
                } catch (error) {
                  console.error("提交失败：", error);
                  return false; // 表示提交失败
                }
              }}
            >
              <ProForm.Group>
                <ProFormDateRangePicker
                  name="rangeDate"
                  label="投放时间"
                  fieldProps={{
                    format: "YYYY-MM-DD",
                    onChange: (e) => {
                      console.log("e", e);
                    },
                  }}
                />
              </ProForm.Group>
              <ProForm.Group>
                <ProFormSelect
                  initialValue={null}
                  name="agent"
                  placeholder="选择代理商"
                  options={agents.map((agent) => ({
                    label: agent.name,
                    value: agent.id,
                  }))}
                  fieldProps={{
                    showSearch: true,

                    onChange: setSelectedAgent,
                    style: {
                      width: "200px", // 设置代理商选择框的宽度
                    },
                  }}
                />

                <ProFormSelect
                  initialValue={null}
                  name="advertiserId"
                  placeholder="选择广告主"
                  options={advertisers.map(
                    (advertiser: { name: string; id: number }) => ({
                      label: advertiser.name,
                      value: advertiser.id,
                    })
                  )}
                  fieldProps={{
                    showSearch: true,

                    onChange: handleAdvertiserChange, // 直接传递选中的值
                    style: {
                      width: "200px", // 设置代理商选择框的宽度
                    },
                  }}
                />
                <ProFormSelect
                  initialValue={null}
                  name="adMaterialId"
                  placeholder="选择广告创意"
                  options={materials.map((material) => ({
                    label: material.name,
                    value: material.id,
                  }))}
                  fieldProps={{
                    showSearch: true,

                    onChange: handleMaterialChange, // 直接传递选中的值
                    style: {
                      width: "200px", // 设置代理商选择框的宽度
                    },
                  }}
                />
                <ProFormSelect
                  initialValue={null}
                  name="adPlacementId"
                  placeholder="选择计划备注"
                  options={placements.map((placement) => ({
                    label: placement.name,
                    value: placement.id,
                  }))}
                  fieldProps={{
                    style: {
                      width: "200px", // 设置代理商选择框的宽度
                    },
                  }}
                />
              </ProForm.Group>
            </ProForm>
            <div id="chart-container"></div>
          </ProCard>
          <Divider type={'horizontal'} />
          <ProCard title="数据明细">
            {detailData.length > 0 ? (
              <div>
                <ProTable<ChartDataResponse>
                  columns={rootcolumns}
                  dataSource={detailData.concat([{
                    date: '汇总', // 日期
                    agentId: 0,
                    agentName: '',
                    advertiserId: 0,
                    advertiserName: '',
                    adMaterialId: 0,
                    adMaterialName: '',
                    adPlacementId: 0,
                    adPlacementName: '',
                    displayCount: displayTotal,
                    clickCount: clickTotal,
                    usedBudget: usedBudgetTotal,
                  }])}
                  search={false}
                  scroll={{ x: 1000 }}
                  actionRef={actionRef}
                  pagination={false}
                />
              </div>
            ) : (
              <div>
                <Tag icon={<CloseCircleOutlined />} color="error">
                  暂无数据
                </Tag>
              </div>
            )}
          </ProCard>
        </div>
      );
    } else {
      return <div>none</div>;
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

export default ReportIndexPage;
