import { MessageInstance } from "antd/es/message/interface";

interface AxiosErrorResponse {
  statusCode: number;
  message: string;
}

declare global {
  interface Window {
    Message: MessageInstance;
  }
}

interface LoginUser {
  username: string;
  role: string;
  // address: string;
}
interface AdMaterial {
  id: bigint;
  name: string;
  // 媒体类型 1网站 2pc软件
  mediaType: Int;
  // 类型 1:图片 2:视频 3:文字
  contentType: Int;
  // 广告位置 1.列表页 2.详情页 3.侧边栏 4.全屏弹窗(仅 pc 有)
  position: Int;
  // 广告内容
  content: string;
  // 广告链接
  url: string;
  enabled: boolean;
  // 广告主id
  advertiserId: bigInt;
  createdAt: DateTime;
  updatedAt: DateTime;
  advertiser: {
    id: number;
    companyName: string;
    user: { id: number; nickname: string };
  };
}
interface AdPlacement {
  id: bigint;
  name: string;
  enabled: boolean;
  // 广告素材
  adMaterialId: bigint;
  adMaterial: {
    name: string;
    url: string;
  };
  // 预算金额上限
  budget: bigint;
  // 媒体类型
  mediaType: Int;
  // 开始日期
  startedAt: DateTime;
  // 结束日期
  endedAt: DateTime;
  // 已消耗预算
  usedBudget: bigint;
  // 展现次数
  displayCount: bigint;
  // 点击次数
  clickCount: bigint;
  advertiserId: bigint;
  createdAt: DateTime;
  updatedAt: DateTime;
  advertiser: {
    id: number;
    companyName: string;
    user: { id: number; nickname: string };
  };
  adMediaRelations: [{ mediaId: number; mediaName: string }];
}
interface Adposition {
  id: number;
  name: string;
  enabled: number;
  // 类型 1 网站 2pc 软件
  type: number;
  cpmPrice: number;
  createdAt: string;
  updatedAt: string;
  adSpec: {
    id: number;
    name: string;
  };
  adMedia: {
    id: number;
    name: string;
  };
}
interface AdpositionOpt {
  id: number;
  name: string;
  type: number;
  adSpecId: number;
  adMediaId: number;
}
interface Admedia {
  id: number;
  name: string;
  enabled: number;
  // 类型 1 网站 2pc 软件
  type: number;
  url: string;
  createdAt: string;
  updatedAt: string;
}
interface AdmediaOpt {
  id: number;
  name: string;
  type: number;
}
interface Adspec {
  id: number;
  name: string;
  enabled: number;
  // 类型 1 图片2视频
  type: number;
  size: string;
  createdAt: string;
  updatedAt: string;
}
interface AdspecOpt {
  id: number;
  name: string;
  type: number;
}
interface AdMaterialAgent {
  jumpUrl: string;
  id: bigint;
  name: string;
  // 媒体类型 1网站 2pc软件
  mediaType: number;
  // 类型 1:图片 2:视频 3:文字
  contentType: number;
  // 广告位置 1.列表页 2.详情页 3.侧边栏 4.全屏弹窗(仅 pc 有)
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
  // 广告链接
  updatedAt: DateTime;
  // 广告内容
  content: string;
  // 广告链接
  url: string;
  enabled: boolean;
  // 广告主id
  advertiser: {
    id: number;
    companyName: string;
    domainName: string;
    user: { id: number; nickname: string };
  };
}
interface User {
  id: bigint;
  name: string;
  address: string;
  role: "SUPER" | "CREATOR" | "OPERATOR";
  remark: string;
  enabled: boolean;
  videoNumber: number;
  createdAt: string;
  updatedAt: string;
  avatar: string | null;
}

interface Tag {
  id: bigint;
  title: string;
  sort?: number;
  enabled: boolean;
  recommended: boolean;
  locales?: Record<string, string>[];
  createdAt: string;
  updatedAt: string;
}

interface PaymentChannel {
  id: bigint;
  title: string;
  icon?: string | null;
  remark: string;
  locales: Record<
    string,
    {
      title: string;
      description?: string;
    }
  >;
  balance: bigint;
  totalRechargeAmount: bigint;
  transaction_number: number;
  driver: string;
  supportCountryCodes: string[];
  currency: string;
  enabled: boolean;
  payRate: number;
  sort: number;
  swapCoinRate: number;
  supportAmounts: number[];
  driverConfig: Record<string, string | number | null>;
  createdAt: string;
  updatedAt: string;
}

interface PlacementChannel {
  id: bigint;
  title: string;
  remark: string;
  enabled: boolean;
  level: number;
  priceRate: number;
  createdAt: string;
  updatedAt: string;
  iosMemberNumber: number;
  androidMemberNumber: number;
  webMemberNumber: number;
}

interface Popular {
  id: bigint;
  title: string;
  lang: string;
  sort: number;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  updatedAt: string;
  tags: bigint[];
}

interface FeaturedCard {
  id: bigint;
  title: string;
  lang: string;
  showName: string;
  cover: string;
  tags: bigint[];
  sort: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Video {
  id: bigint;
  title: string;
  locales: Record<
    string,
    {
      title: string;
      description?: string;
    }
  >;
  lang: number;
  cover: string;
  tags: bigint[];
  m3u8File: string;
  previewM3u8File: string;
  previewBlocks: [number, number][];
  resolutionWidth?: number;
  resolutionHeight?: number;
  duration: number;
  enabled: boolean;
  level: number;
  size: number;
  country: string;
  denyCountries: string[];
  screen: number;
  clickNumber: number;
  playNumber: number;
  virtualPlayNumber: number;
  likeNumber: number;
  commentNumber: number;
  sortWeight: number;
  oldId: number;
  userId: bigint;
  creator?: User;
  price: number;
  priceMode: number;
  createdAt: string;
  updatedAt: string;
}

interface Help {
  id: bigint;
  title: string;
  lang: string;
  content: string;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

interface GetListDto {
  page: number;
  limit: number;
  q?: string;
  filters?: Record<string, (string | number | boolean)[] | null>;
  orderBy?: { [key: string]: "asc" | "desc" };
  extra?: { [key: string]: string | number | boolean };
}

interface AgentWallet {
  coin: number;
  cash: number;
}

interface Agent {
  id: bigint;
  memberId: bigint;
  isAgent: boolean;
  inviteCode: string;
  level: number;
  todayInviteNum: number;
  totalInviteNum: number;
  todayRechargeAmount: number;
  totalRechargeAmount: number;
  rechargeAmount: number;
  createdAt: string;
  member: Member;
  wallet?: {
    coin: number;
    points: number;
  };
  agentWallet?: AgentWallet;
}

interface RechargeOrder {
  id: bigint;
  member: Member;
  coinAmount: number;
  // 支付状态 1待支付 2 支付成功 3 支付超时
  payStatus: number;
  paymentChannel: PaymentChannel;
  settlementStatus: boolean;
  settlementAmount: number;
  payAmount: number;
  currency: string;
  paidAt: string;
  createdAt: string;
}
interface SystemSetting {
  registerPointsGift: number;
  firstLoginPointsGift: number;
  dailyFirstLoginPointsGift: number;
  likePointsCost: number;
}

interface PaymentSetting {
  // 金币支付费率
  coinPayRate: number;
}

interface PromotionSetting {
  agentCommissionRateList: Array<number>[];
  creatorCommissionRate: number;
}

type AllSetting = SystemSetting | PaymentSetting | PromotionSetting | null;
