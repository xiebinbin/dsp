import { useCallback, useEffect, useRef } from "react";
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormDateTimePicker,
  ProFormInstance,
  ProFormSelect,
} from "@ant-design/pro-components";
import { Line } from "@antv/g2plot";
import ReportApi, { ChartDataRequest } from "@/api/report";
import { useMount, useSafeState } from "ahooks";
import MaterialApi from "@/api/material.ts";
// import AgentApi from "@/api/agent.ts";
export interface ReportAdvPageProps {
  role: "Advertiser";
  roleName: string;
}

const ReportAdvertiserIndexPage = (props: ReportAdvPageProps) => {
  const { role, roleName } = props;
  const plotRef = useRef<Line | null>(null); // 用于引用 G2Plot 的实例
  const formRef = useRef<ProFormInstance>();
  const [materials, setMaterials] = useSafeState<
    { name: string; id: number }[]
  >([]); // 使用 useState 初始化为空数组

  const loadMaterials = useCallback(async () => {
    try {
      const optlistres = await MaterialApi.getOptList();
      console.log('optlistres',optlistres)
      setMaterials(
        optlistres.map((item) => {
          return {
            name: item.name,
            id: Number(item.id),
          };
        }) || []
      );
    } catch {
      console.error("An error occurred:");
    }
  }, [setMaterials]);
  const loadInfo = useCallback(async (data: ChartDataRequest) => {
    try {
      const chartContainer = document.getElementById("chart-container");
      // 检查元素是否存在
      if (chartContainer) {
        // 清空元素内容
        chartContainer.innerHTML = "";
      }

      const response = await ReportApi.getChartData(data);
      if (response && response.length > 0) {
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
              category: "展现数",
            },
            {
              date: item.date,
              value: item.clickCount,
              category: "点击数",
            },
            {
              date: item.date,
              value: item.usedBudget,
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
              offset: 15,
              style: {
                fontSize: 10,
              },
            },
          },
          yAxis: {
            nice: true,
            label: {
              offset: 25,

              // 数值格式化为千分位
              formatter: (v) =>
                `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
            },
          },

          // label
          label: {
            // layout: [{ type: "hide-overlap" }], // 隐藏重叠label
            style: { color: "#d62728", textAlign: "center" },
            formatter: (item) => item.value,
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
          //   color: ["#1979C9", "#D62A0D", "#FAA219"],
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
        return false; // 表示失败
      }
      // 保存 G2Plot 实例的引用
    } catch (error) {
      console.error("获取数据失败：", error);
      return false; // 表示失败
    }
  }, []);
  console.log("roleName", roleName);
  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);
  useMount(() => {
    // 发起 POST 请求来获取数据
    setTimeout(() => {
      const currentDate = new Date();

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
      });
      formRef.current?.setFieldsValue({
        startDate: formattedStartDate,
        endDate: formattedcurrentDate,
      });
    }, 500);
  });

  const renderContent = () => {
    if (role === "Advertiser") {
      return (
        <div>
          <ProCard>
            <ProForm
              //   layout="horizontal"
              formRef={formRef}
              onFinish={async (values) => {
                try {
                  console.log("report values", values);
                  const requestData: ChartDataRequest = {
                    startDate: values.startDate,
                    endDate: values.endDate,
                  };
                  console.log("report requestData", requestData);

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
                <ProFormDateTimePicker
                  name="startDate"
                  label="开始投放时间"
                  fieldProps={{
                    format: "YYYY-MM-DD",
                  }}
                />
                <ProFormDateTimePicker
                  name="endDate"
                  label="结束投放时间"
                  fieldProps={{
                    format: "YYYY-MM-DD",
                  }}
                />

                <ProFormSelect
                  initialValue={""}
                  //   width="xl"
                  name="adMaterialId"
                  label="选择广告创意"
                  placeholder="选择广告创意"
                  options={materials.map((material) => ({
                    label: material.name,
                    value: material.id,
                  }))}
                />
              </ProForm.Group>
            </ProForm>
            <div id="chart-container"></div>
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
    </PageContainer>
  );
};

export default ReportAdvertiserIndexPage;