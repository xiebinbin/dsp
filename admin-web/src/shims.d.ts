import {MessageInstance} from "antd/es/message/interface";

interface AxiosErrorResponse {
    statusCode: number;
    message: string;
}

declare global {
    interface Window {
        Message: MessageInstance
    }
}
interface AuthUser {
    username: string,
    role: string,
}
interface SuperUser {
    id: bigint;
    nickname: string;
    username: string;
    password: string;
    role: string;
    updatedAt: string;
    enabled: boolean;
}

interface Operator {
    id: bigint;
    nickname: string;
    username: string;
    password: string;
    role: string;
    updatedAt: string;
    enabled: boolean;
}
interface User {
    id: bigint;
    name: string;
    address: string;
    role: "Root" | "Operator" | "Agent";
    remark: string;
    enabled: boolean;
    videoNumber: number;
    createdAt: string;
    updatedAt: string;
    avatar: string | null;
}
interface RootInfo{
    name: string;

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
    locales: Record<string, {
        title: string;
        description?: string;
    }>;
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
    locales: Record<string, {
        title: string;
        description?: string;
    }>;
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
    orderBy?: { [key: string]: 'asc' | 'desc' };
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
    agentWallet?: AgentWallet
}

interface RechargeOrder{
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
