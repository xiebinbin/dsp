import createRequestInstance from "@/api/lib/create-request-instance.ts";

// 请求参数类型
export interface CardDataRequest {
  startDate: string;
  endDate: string;
  agentId: number;
  advertiserId: number; // 广告主名称
  adMaterialId: number; // 广告素材名称
}

// 响应数据类型
export interface CardDataResponse {
  agentNumber: number;
  advertiserNumber: number; 
  adMaterialNumber: number; // 广告素材
  todayPV: number; // 今日PV次数
  yesterdayPV: number; // 昨日PV次数
  ongoingPlans: number; // 进行中的计划
  completedPlans: number; //

}

// 创建 POST 请求函数
// const getChartData = (
//     params: ChartDataRequest
//   ): Promise<ChartDataResponse[]> => {
//     return createRequestInstance().post("/api/admin/report/getReportsByDateRange", params);
//   };
const getChartData = (
  //  req: CardDataRequest
): Promise<CardDataResponse> => {
  return createRequestInstance().post(
    `/api/admin/dahsbord/getData`
  );
};
export default {
  getChartData,
};
