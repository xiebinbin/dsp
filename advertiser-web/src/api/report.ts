import createRequestInstance from "@/api/lib/create-request-instance.ts";

// 请求参数类型
export interface ChartDataRequest {
  startDate: string;
  endDate: string;
}

// 响应数据类型
export interface ChartDataResponse {
  date: string; // 日期
  adMaterialId: number; // 广告素材名称
  adMaterialName: string; // 广告素材名称
  displayCount: number; // 展示次数
  clickCount: number; // 点击次数
  usedBudget: number; // 使用预算
}
// 请求参数类型
export interface placementOptRequest {
  q?: string;
  extra?: { [key: string]: string | number | boolean };
}
// 创建 POST 请求函数
// const getChartData = (
//     params: ChartDataRequest
//   ): Promise<ChartDataResponse[]> => {
//     return createRequestInstance().post("/api/admin/report/getReportsByDateRange", params);
//   };
const getChartData = (
   req: ChartDataRequest
): Promise<ChartDataResponse[]> => {
  return createRequestInstance().post(
    `/api/advertiser/report/getReportsByDateRange`,req
  );
};
const getPlacementOptlist = (
  req: placementOptRequest
): Promise<{
  data: { id: number; name: string }[]
}> => {
  return createRequestInstance().post(
    `/api/advertiser/report/placementOptlist`,
    req
  );
};
export default {
  getChartData,
  getPlacementOptlist,
};
