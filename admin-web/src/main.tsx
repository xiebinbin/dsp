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
import { PositionPageProps } from "@/pages/position/index";

import { ReportPageProps } from "@/pages/report";
import { DashbordPageProps } from "@/pages/dashboard";
import { SpecPageProps } from "./pages/spec";
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
// const FeaturedCardIndexPage: React.LazyExoticComponent<React.FC> = lazy(
//   () => import("@/pages/featured-card")
// );

const LoginPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/login")
);
const DashboardPage: React.LazyExoticComponent<React.FC<DashbordPageProps>> =
  lazy(() => import("@/pages/dashboard"));

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
const PositionIndexPage: React.LazyExoticComponent<
  React.FC<PositionPageProps>
> = lazy(() => import("@/pages/position/index"));
const SpecIndexPage: React.LazyExoticComponent<React.FC<SpecPageProps>> = lazy(
  () => import("@/pages/spec/index")
);
const ReportIndexPage: React.LazyExoticComponent<React.FC<ReportPageProps>> =
  lazy(() => import("@/pages/report"));
const ReportAgentIndexPage: React.LazyExoticComponent<
  React.FC<ReportPageProps>
> = lazy(() => import("@/pages/report/index-agent"));
const UserAgreementPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/policy/user")
);
const PrivacyPolicyPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/policy/privacy")
);

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
                <DashboardPage role="Root" roleName="管理员看板" />
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
            path: "position/manage",
            element: (
              <Suspense>
                <PositionIndexPage role="Root" roleName="广告位置管理" />
              </Suspense>
            ),
          },
          {
            path: "spec/manage",
            element: (
              <Suspense>
                <SpecIndexPage role="Root" roleName="广告规格管理" />
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

          // {
          //   path: "placement/agents",
          //   element: (
          //     <Suspense>
          //       <AgentIndexPage />
          //     </Suspense>
          //   ),
          // },

          {
            path: "report/index",
            element: (
              <Suspense>
                <ReportIndexPage role="Root" roleName="管理员" />
              </Suspense>
            ),
          },
          {
            path: "report/agent",
            element: (
              <Suspense>
                <ReportAgentIndexPage role="Agent" roleName="代理商" />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "user-agreement",
    element: <UserAgreementPage />,
  },
  {
    path: "privacy",
    element: <PrivacyPolicyPage />,
  },
]);
ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <RecoilRoot>
    <RouterProvider router={router} />
  </RecoilRoot>
  // </React.StrictMode>
);
