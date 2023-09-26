import {
  DashboardTwoTone,
  FundTwoTone,
  IdcardTwoTone,
  ScheduleTwoTone,
  VideoCameraTwoTone,
} from "@ant-design/icons";
interface Route {
  name: string;
  path: string;
  access?: string[];
  icon?: React.ReactNode;
  component?: string;
  routes?: Route[];
}

function hasAccess(route: Route, role: string) {
  return !route.access || route.access.includes(role);
}


function filterRoutes(routes: Route[] | undefined, role: string) {
  const result: Route[] = [];  

  routes?.forEach((r) => {
    if (hasAccess(r, role)) {
      const filteredRoute = { ...r };
      if (filteredRoute.routes) {
        filteredRoute.routes = filterRoutes(filteredRoute.routes, role);
      }
      result.push(filteredRoute);
    }
  });
  return result;
}
const GetRouter = (userRole:string): Route => {


  const fullRoutes: Route = {
    path: "admin",
    routes: [
      {
        path: "/admin/dashboard",
        name: "控制台",
        icon: <DashboardTwoTone />,
        access: ["Root","Operator","Agent"]

      },
      // {
      //   path: "/admin/dashboard/agent",
      //   name: "控制台",
      //   icon: <DashboardTwoTone />,
      //   access: ["Agent"]

      // },
      {
        path: "/admin/dashboard/advertiser",
        name: "控制台",
        icon: <DashboardTwoTone />,
        access: ["Advertiser"]

      },
      {
        name: "用户管理",
        path: "/admin/user",
        icon: <IdcardTwoTone />,

        routes: [
          {
            
            name: "超级管理员",
            path: "/admin/user/supers",
            access: ["Root"]
          },
          {
            name: "运营管理",
            path: "/admin/user/operators",
            access: ["Root"]
          },
          {
            name: "代理商管理",
            path: "/admin/user/creators",
            access: ["Root","Operator"]

          },
          {
            name: "管理员-广告主管理",
            path: "/admin/advertiser/root",
            access: ["Root","Operator"]

          },
          {
            name: "代理商-广告主列表",
            path: "/admin/advertiser/agent",
            access: ["Agent"]
          },
        ],
      },
      {
        path: "/admin/materials",
        name: "广告管理",
        icon: <ScheduleTwoTone />,
        component: "./Admin",
        routes: [
          {
            path: "/admin/materials/root",
            name: "广告创意管理",
            access: ["Root","Operator"]
          },
          {
            path: "/admin/materials/agent",
            name: "代理商-广告创意列表",
            access: ["Agent"]
          },
          {
            path: "/admin/materials/advertiser",
            name: "广告主-广告素材列表",
            access: ["Advertiser"]
          },
 
          {
            path: "/admin/placements/root",
            name: "管理员-广告投放计划",
            access: ["Root","Operator"]
          },
          {
            path: "/admin/placements/agent",
            name: "代理商-广告计划列表",
            access: ["Agent"]
          },
          {
            path: "/admin/placements/advertiser",
            name: "广告主-广告计划列表",
            access: ["Advertiser"]

          },
        ],
      },

      {
        name: "媒体管理",
        icon: <VideoCameraTwoTone />,
        path: "/admin/media",
        access: ["Root","Operator"],
        routes: [
          {
            path: "/admin/media/manage",
            name: "投放媒体管理",
            access: ["Root","Operator"]
          },
        ],
      },
      {
        name: "数据报表",
        icon: <FundTwoTone />,
        path: "/admin/report",
        routes: [
          {
            path: "/admin/report/index",
            name: "数据报表",
            access: ["Root","Operator"]
          },
          {
            path: "/admin/report/agent",
            name: "代理商数据报表",
            access: ["Agent"]
          },
        ],
      },
      // 根据用户角色配置允许访问的路由
    ],
    name: ""
  };
 // 根据用户角色过滤路由
 const filteredRoutes = filterRoutes(fullRoutes.routes, userRole);

 return {
   ...fullRoutes,
   routes: filteredRoutes,
 };
};

export default GetRouter;
