import { IsNotEmpty } from 'class-validator';

export class MaterialDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  name: string;
  // 媒体类型 1网站 2pc软件
  @IsNotEmpty()
  mediaType: number;
  // 类型 1:图片 2:视频 3:文字
  @IsNotEmpty()
  contentType: number;
  // specId: number;
  analyticJs: string;
  analyticUrl: string;
  // 广告位置id
  positionId: number;
  adPosition: {
    id: number;
    name: string;
    type: number;
    adSpec: {
      id: number;
      name: string; //规格名称
      type: number; //规格类型 图片，视频
    };
    adMedia: {
      id: number;
      name: string;
    };
  };
  // 广告内容
  @IsNotEmpty()
  content: string;
  // 图片链接
  url: string;
  // 跳转链接
  jumpUrl: string;
  enabled: boolean;
  @IsNotEmpty()
  advertiserId: number;
  advertiser: {
    id: number;
    companyName: string;
    domainName: string;
    user: { id: number; nickname: string };
  };
}
