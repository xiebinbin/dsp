export class DashboardDto {
  agentNumber: number;
  advertiserNumber: number;
  adMaterialNumber: number; // 广告素材
  todayPV: bigint; // 今日PV次数
  yesterdayPV: bigint; // 昨日PV次数
  ongoingPlans: number; // 进行中的计划
  completedPlans: number; //
}
