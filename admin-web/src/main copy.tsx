import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import utc from "dayjs/plugin/utc";
import "@unocss/reset/normalize.css";
import "@unocss/reset/sanitize/sanitize.css";
import "virtual:uno.css";
import App from "@/App.tsx";
import "@/index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminLayout from "@/layouts/admin";
import dayjs from "dayjs";

import { RecoilRoot } from "recoil";
import { UserIndexPageProps } from "@/pages/user";
import { AdvIndexPageProps } from "@/pages/advertiser";
import { MaterialsPageProps } from "@/pages/materials";
import { PlacementsPageProps } from "./pages/placements";
import { MediaPageProps } from "@/pages/media/index";
dayjs.extend(utc);
const HelpIndexPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/help")
);
const UnauthorizedPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/unauthorized")
);
const UserIndexPage: React.LazyExoticComponent<React.FC<UserIndexPageProps>> =
  lazy(() => import("@/pages/user"));
// const VideoIndexPage: React.LazyExoticComponent<React.FC> = lazy(() => import("@/pages/video"));
const FeaturedCardIndexPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/featured-card")
);
// const TagIndexPage: React.LazyExoticComponent<React.FC> = lazy(() => import("@/pages/tag"));
const PopularIndexPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/popular")
);
const LoginPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/login")
);
const DashboardPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/dashboard")
);
const PaymentSettingPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/setting/payment")
);
const SystemSettingPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/setting/system")
);
const PromotionSettingPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/setting/promotion")
);
const PaymentChannelIndexPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/payment-channel")
);
const PlacementChannelIndexPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/placement-channel")
);
const AgentIndexPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/agent")
);
const RechargeOrderIndexPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/recharge-order")
);
const AdvertiserIndexPage: React.LazyExoticComponent<
  React.FC<AdvIndexPageProps>
> = lazy(() => import("@/pages/advertiser"));
const MaterialsIndexPage: React.LazyExoticComponent<
  React.FC<MaterialsPageProps>
> = lazy(() => import("@/pages/materials"));
const MaterialsAgentIndexPage: React.LazyExoticComponent<
  React.FC<MaterialsPageProps>
> = lazy(() => import("@/pages/materials/index-agent"));

const MaterialsAdvertiserIndexPage: React.LazyExoticComponent<
  React.FC<MaterialsPageProps>
> = lazy(() => import("@/pages/materials/index-advertiser"));
const PlacementsIndexPage: React.LazyExoticComponent<
  React.FC<PlacementsPageProps>
> = lazy(() => import("@/pages/placements/index"));
const PlacementsAgentIndexPage: React.LazyExoticComponent<
  React.FC<PlacementsPageProps>
> = lazy(() => import("@/pages/placements/index-agent"));
const PlacementsAdvertiserIndexPage: React.LazyExoticComponent<
  React.FC<PlacementsPageProps>
> = lazy(() => import("@/pages/placements/index-advertiser"));
const MediaIndexPage: React.LazyExoticComponent<React.FC<MediaPageProps>> =
  lazy(() => import("@/pages/media/index"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            path: "dashboard",
            element: (
              <Suspense>
                {" "}
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: "content/populars",
            element: (
              <Suspense>
                <PopularIndexPage />
              </Suspense>
            ),
          },
          // {
          //     path: "content/tags",
          //     element: <Suspense><TagIndexPage/></Suspense>,
          // },
          {
            path: "content/featured-cards",
            element: (
              <Suspense>
                <FeaturedCardIndexPage />
              </Suspense>
            ),
          },
          {
            path: "advertiser/root",
            element: (
              <Suspense>
                <AdvertiserIndexPage role="Root" roleName="管理员广告主" />
              </Suspense>
            ),
          },
          {
            path: "advertiser/agent",
            element: (
              <Suspense>
                <AdvertiserIndexPage role="Agent" roleName="管理员广告主" />
              </Suspense>
            ),
          },

          {
            path: "/admin/materials/root",
            element: (
              <Suspense>
                <MaterialsIndexPage role="Root" roleName="管理员素材" />
              </Suspense>
            ),
          },
          {
            path: "/admin/materials/agent",
            element: (
              <Suspense>
                <MaterialsAgentIndexPage role="Agent" roleName="代理商素材" />
              </Suspense>
            ),
          },
          {
            path: "/admin/materials/advertiser",
            element: (
              <Suspense>
                <MaterialsAdvertiserIndexPage
                  role="Advertiser"
                  roleName="广告主素材"
                />
              </Suspense>
            ),
          },
          {
            path: "/admin/placements/root",
            element: (
              <Suspense>
                <PlacementsIndexPage role="Root" roleName="管理员投放" />
              </Suspense>
            ),
          },
          {
            path: "/admin/placements/agent",
            element: (
              <Suspense>
                <PlacementsAgentIndexPage role="Agent" roleName="代理商投放" />
              </Suspense>
            ),
          },
          {
            path: "/admin/placements/advertiser",
            element: (
              <Suspense>
                <PlacementsAdvertiserIndexPage
                  role="Advertiser"
                  roleName="广告主投放"
                />
              </Suspense>
            ),
          },
          {
            path: "user/creators",
            element: (
              <Suspense>
                <UserIndexPage role="Agent" roleName="代理商" />
              </Suspense>
            ),
          },
          {
            path: "user/operators",
            element: (
              <Suspense>
                <UserIndexPage role="Operator" roleName="运营者" />
              </Suspense>
            ),
          },
          {
            path: "user/supers",
            element: (
              <Suspense>
                <UserIndexPage role="Root" roleName="超级管理员" />
              </Suspense>
            ),
          },
          
          {
            path: "media/manage",
            element: (
              <Suspense>
                <MediaIndexPage role="Root" roleName="媒体投放" />
              </Suspense>
            ),
          },
          {
            path: "content/helps",
            element: (
              <Suspense>
                <HelpIndexPage />
              </Suspense>
            ),
          },
          {
            path: "setting/system",
            element: (
              <Suspense>
                <SystemSettingPage />
              </Suspense>
            ),
          },
          {
            path: "setting/payment",
            element: (
              <Suspense>
                <PaymentSettingPage />
              </Suspense>
            ),
          },
          {
            path: "setting/promotion",
            element: (
              <Suspense>
                <PromotionSettingPage />
              </Suspense>
            ),
          },
          {
            path: "payment/channels",
            element: (
              <Suspense>
                <PaymentChannelIndexPage />
              </Suspense>
            ),
          },
          {
            path: "placement/channels",
            element: (
              <Suspense>
                <PlacementChannelIndexPage />
              </Suspense>
            ),
          },
          {
            path: "placement/agents",
            element: (
              <Suspense>
                <AgentIndexPage />
              </Suspense>
            ),
          },
          {
            path: "order/recharge-orders",
            element: (
              <Suspense>
                <RechargeOrderIndexPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  </React.StrictMode>
);
