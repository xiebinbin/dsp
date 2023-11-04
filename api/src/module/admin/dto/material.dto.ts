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
  // 广告位置 1.列表页 2.详情页 3.侧边栏 4.全屏弹窗(仅 pc 有)
  @IsNotEmpty()
  position: number;
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
    taxNumber: string;
    user: { id: number; nickname: string };
  };
}
