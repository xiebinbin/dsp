import {
    DashboardTwoTone,
    FundTwoTone,
    ScheduleTwoTone,
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
          access: ["Advertiser"]
  
        },
       
        {
          path: "/admin/materials",
          name: "广告管理",
          icon: <ScheduleTwoTone />,
          component: "./Admin",
          routes: [
         
            {
              path: "/admin/materials/advertiser",
              name: "广告素材列表",
              access: ["Advertiser"]
            },
   
            
            {
              path: "/admin/placements/advertiser",
              name: "广告计划列表",
              access: ["Advertiser"]
  
            },
          ],
        },
  
        {
          name: "数据报表",
          icon: <FundTwoTone />,
          path: "/admin/report",
          routes: [
            {
              path: "/admin/report/advertiser",
              name: "广告主日报",
              access: ["Advertiser"]
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
  