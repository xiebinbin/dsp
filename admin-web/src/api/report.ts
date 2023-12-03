import createRequestInstance from "@/api/lib/create-request-instance.ts";

// 请求参数类型
export interface ChartDataRequest {
  startDate: string;
  endDate: string;
  agentId: number;
  advertiserId: number; // 广告主名称
  adMaterialId: number; // 广告素材名称
  adPlacementId: number; // 广告计划名称
}

// 响应数据类型
export interface ChartDataResponse {
  date: string; // 日期
  agentId: number;
  agentName: string; // 代理商名称
  advertiserId: number; // 广告主名称
  advertiserName: string; // 广告主名称
  adMaterialId: number; // 广告素材名称
  adMaterialName: string; // 广告素材名称
  adPlacementId: number; // 广告计划
  adPlacementName: string; // 广告计划名称
  uvCount: number; // uv
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
const getChartData = (req: ChartDataRequest): Promise<ChartDataResponse[]> => {
  return createRequestInstance().post(
    `/api/admin/report/getReportsByDateRange`,
    req
  );
};
const getPlacementOptlist = (
  req: placementOptRequest
): Promise<{
  data: { id: number; name: string }[];
}> => {
  return createRequestInstance().post(
    `/api/admin/report/placementOptlist`,
    req
  );
};
// const getPlacementChartData = (
//   req: ChartDataRequest
// ): Promise<ChartDataResponse[]> => {
//   return createRequestInstance().post(
//     `/api/admin/report/placement/getReportsByPlacement`,
//     req
//   );
// };
// const getPlacementOptlistByPlace = (
//   req: placementOptRequest
// ): Promise<{
//   data: { id: number; name: string }[];
// }> => {
//   return createRequestInstance().post(
//     `/api/admin/report/placement/placementOptlist`,
//     req
//   );
// };
// const AgentsByReportPlacement = (): Promise<{
//   data: { id: number; name: string }[];
// }> => {
//   return createRequestInstance().post(
//     `/api/admin/report/placement/AgentsByReportPlacement`
//   );
// };
export default {
  getChartData,
  getPlacementOptlist,
  // getPlacementChartData,
  // getPlacementOptlistByPlace,
  // AgentsByReportPlacement,
};
