import createRequestInstance from "@/api/lib/create-request-instance.ts";
import { GetListDto, AdMaterial, AdMaterialAgent } from "@/shims";

export interface MaterialEditDto {
  name: string;
  // 媒体类型 1网站 2pc软件
  mediaType: number;
  // 类型 1:图片 2:视频 3:文字
  contentType: number;
  // 广告位置 1.列表页 2.详情页 3.侧边栏 4.全屏弹窗(仅 pc 有)
  position: number;
  // 广告内容
  content: string;
  // 广告链接
  url: string;
  enabled: boolean;
  advertiser: bigint;
}
interface MaterialOpt {
  id: number;
  name: string;
  advertiserId: number;
}

const getDetailInfo  = (id: bigint): Promise<AdMaterialAgent> => {
  return createRequestInstance().get(`/api/advertiser/material/detail/${id}`);
};

const getListByAdvertiser = (
  params: GetListDto
): Promise<{
  total: number;
  data: AdMaterial[];
}> => {
  return createRequestInstance().post(
    "/api/advertiser/material/listbyadvertiser",
    params
  );
};
const getOptList =():Promise<MaterialOpt[]>=>{
  return createRequestInstance().post(`/api/advertiser/material/optlist`);

}

export default {
  getListByAdvertiser,
  getDetailInfo,
  getOptList
};
