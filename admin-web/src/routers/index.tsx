import {Route} from "@ant-design/pro-layout/es/typing";
import {
    DashboardOutlined,
    PayCircleFilled,
    SettingOutlined,
    ShareAltOutlined,
    UnorderedListOutlined,
    UserOutlined
} from "@ant-design/icons";


const GetRouter = (): Route => {
    return {
        path: 'admin',
        routes: [
            {
                path: "/admin/dashboard",
                name: "控制台",
                icon: <DashboardOutlined/>
            },
            {
                name: '用户管理',
                path: '/admin/user',
                icon: <UserOutlined/>,
                routes: [
                    {
                        name: '超级管理员',
                        path: '/admin/user/supers',

                    },
                    {
                        name: '运营',
                        path: '/admin/user/operators',
                        // access: ['operator'], // 该菜单项需要的角色
                    },
                    {
                        name: '代理商',
                        path: '/admin/user/creators',
                    },
                    {
                        name: '管理员-广告主',
                        path: '/admin/advertiser/root',
                    },
                    {
                        name: '代理商-广告主',
                        path: '/admin/advertiser/agent',
                    }
                ]
            },
            {
                path: '/admin/materials',
                name: '广告管理',
                icon: <div className="i-ri-sticky-note-line text-1rem"/>,
                component: './Admin',
                routes: [
                    {
                        path: '/admin/materials/root',
                        name: '广告创意管理',
                    },
                    {
                        path: '/admin/materials/agent',
                        name: '广告创意管理代理商',
                    },
                    {
                        path: '/admin/materials/advertiser',
                        name: '广告创意管理广告主',
                    },
                    
                    {
                        path: '/admin/content/tags',
                        name: '广告投放管理',
                    },
                ],
            },
            {
                name: '支付管理',
                icon: <PayCircleFilled/>,
                path: '/payment',
                component: './ListTableList',
                routes: [
                    {
                        path: '/admin/payment/channels',
                        name: '支付通道',
                    },
                    // {
                    //     path: '/admin/payment/channel-bills',
                    //     name: '入账记录',
                    // },
                ],
            },
            {
                name: '订单管理',
                icon: <UnorderedListOutlined/>,
                path: '/admin/order',
                routes: [
                    {
                        path: '/admin/order/recharge-orders',
                        name: '金币充值',
                    },
                    // {
                    //     path: '/admin/order/video-orders',
                    //     name: '视频购买',
                    // },
                ],
            },
            {
                name: '推广管理',
                icon: <ShareAltOutlined/>,
                path: '/admin/placement',
                routes: [
                    {
                        path: '/admin/placement/channels',
                        name: '推广渠道',
                    },
                    {
                        path: '/admin/placement/agents',
                        name: '代理商',
                    },
                    // {
                    //     path: '/list1/sub-page2',
                    //     name: '提现申请',
                    //     icon: <CrownFilled/>,
                    //     component: './Welcome',
                    // },
                ],
            },
           
            {
                name: '设置',
                path: '/admin/setting',
                icon: <SettingOutlined/>,
                routes: [
                    {
                        name: '系统设置',
                        path: '/admin/setting/system',
                    },
                    {
                        name: '支付设置',
                        path: '/admin/setting/payment',
                    },
                    {
                        name: '推广设置',
                        path: '/admin/setting/promotion',
                    },
                ]
            }
        ],
    };
    
}


export default GetRouter;
