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
import { MaterialsPageProps } from "@/pages/materials/index-advertiser";
import { RecoilRoot } from "recoil";
import { PlacementsPageProps } from "@/pages/placements/index-advertiser";
import { ReportAdvPageProps } from "@/pages/report/index-advertiser";
dayjs.extend(utc);
const LoginPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/login")
);
const DashboardPage: React.LazyExoticComponent<React.FC> = lazy(
  () => import("@/pages/dashboard")
);

const MaterialsAdvertiserIndexPage: React.LazyExoticComponent<
  React.FC<MaterialsPageProps>
> = lazy(() => import("@/pages/materials/index-advertiser"));
const PlacementsAdvertiserIndexPage: React.LazyExoticComponent<
  React.FC<PlacementsPageProps>
> = lazy(() => import("@/pages/placements/index-advertiser"));
const ReportAdvertiserIndexPage: React.LazyExoticComponent<
  React.FC<ReportAdvPageProps>
> = lazy(() => import("@/pages/report/index-advertiser"));
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
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            path: "dashboard/",
            element: (
              <Suspense>
                {" "}
                <DashboardPage />
              </Suspense>
            ),
          },

          {
            path: "materials/advertiser",
            element: (
              <Suspense>
                <MaterialsAdvertiserIndexPage
                  role="Advertiser"
                  roleName="广告主"
                />
              </Suspense>
            ),
          },
          {
            path: "placements/advertiser",
            element: (
              <Suspense>
                <PlacementsAdvertiserIndexPage
                  role="Advertiser"
                  roleName="广告主"
                />
              </Suspense>
            ),
          },
          {
            path: "report/advertiser",
            element: (
              <Suspense>
                <ReportAdvertiserIndexPage
                  role="Advertiser"
                  roleName="广告主"
                />
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
  <RecoilRoot>
    <RouterProvider router={router} />
  </RecoilRoot>
);
