import { Route } from "@ant-design/pro-layout/es/typing";
import {
  DashboardOutlined,
  ShareAltOutlined,
  UserOutlined,
} from "@ant-design/icons";

const GetRouter = (): Route => {
  return {
    path: "admin",
    routes: [
      {
        path: "/admin/dashboard",
        name: "控制台",
        icon: <DashboardOutlined />,
      },
      {
        name: "用户管理",
        path: "/admin/user",
        icon: <UserOutlined />,
        routes: [
          {
            name: "超级管理员",
            path: "/admin/user/supers",
          },
          {
            name: "运营管理",
            path: "/admin/user/operators",
            // access: ['operator'], // 该菜单项需要的角色
          },
          {
            name: "代理商管理",
            path: "/admin/user/creators",
          },
          {
            name: "管理员-广告主管理",
            path: "/admin/advertiser/root",
          },
          {
            name: "代理商-广告主列表",
            path: "/admin/advertiser/agent",
          },
        ],
      },
      {
        path: "/admin/materials",
        name: "广告管理",
        icon: <div className="i-ri-sticky-note-line text-1rem" />,
        component: "./Admin",
        routes: [
          {
            path: "/admin/materials/root",
            name: "广告创意管理",
          },
          {
            path: "/admin/materials/agent",
            name: "代理商-广告创意列表",
          },
          {
            path: "/admin/materials/advertiser",
            name: "广告主-广告素材列表",
          },

          // {
          //     path: '/admin/content/tags',
          //     name: '广告投放管理',
          // },
          {
            path: "/admin/placements/root",
            name: "管理员-广告投放计划",
          },
          {
            path: "/admin/placements/agent",
            name: "代理商-广告计划列表",
          },
          {
            path: "/admin/placements/advertiser",
            name: "广告主-广告计划列表",
          },
        ],
      },
    
      {
        name: "媒体管理",
        icon: <ShareAltOutlined />,
        path: "/admin/media",
        routes: [
          {
            path: "/admin/media/manage",
            name: "投放媒体管理",
          },
        ],
      },

    //   {
    //     name: "设置",
    //     path: "/admin/setting",
    //     icon: <SettingOutlined />,
    //     routes: [
    //       {
    //         name: "系统设置",
    //         path: "/admin/setting/system",
    //       },
    //       {
    //         name: "支付设置",
    //         path: "/admin/setting/payment",
    //       },
    //       {
    //         name: "推广设置",
    //         path: "/admin/setting/promotion",
    //       },
    //     ],
    //   },
    ],
  };
};

export default GetRouter;
