import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import App from "@/App.tsx";

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleReturnToLogin = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div>
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
        extra={
          <Button type="primary" onClick={handleReturnToLogin}>
            返回登录
          </Button>
        }
      />
      <App />{" "}
    </div>
  );
};

export default UnauthorizedPage;
