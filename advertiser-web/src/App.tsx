import "./App.css";
import { useLocation, useNavigate, useOutlet } from "react-router-dom";
import { useMount, useSafeState } from "ahooks";
import localforage from "localforage";
import { useCallback } from "react";
import { Button, Modal, message } from "antd";
import AuthApi from "@/api/auth.ts";
import { AuthInfo } from "@/stores/auth-info.ts";
import { useRecoilState } from "recoil";

function App() {
  const [messageApi, contextHolder] = message.useMessage();
  window.Message = messageApi;
  const outlet = useOutlet();
  const local = useLocation();
  const navigate = useNavigate();
  const [, setAuthInfo] = useRecoilState(AuthInfo);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useSafeState(false); // 添加退出弹窗状态变量

  const init = useCallback(async () => {
    const loginKey = await localforage.getItem("token");
    if (!loginKey && !/\/login/.test(local.pathname)) {
      navigate("/login");
      return;
    }
    if ((loginKey && /\/login/.test(local.pathname)) || local.pathname == "/") {
      navigate("/admin/dashboard");
      return;
    }
    try {
      const user = await AuthApi.getInfo();
      setAuthInfo(user);
    } catch (error) {
      console.log("err", error);

      if (local.pathname !== "/login" && local.pathname !== "/") {
        setIsLogoutModalVisible(true); // 捕获异常后显示退出按钮弹窗
      }
    }
  }, [local.pathname, navigate, setAuthInfo]);

  useMount(async () => {
    await init();
  });
  const handleLogout = () => {
    // 在这里执行退出逻辑
    // 例如，清除 token、重定向到登录页面等等
    // localforage.removeItem("token");
    // navigate("/login");
    setIsLogoutModalVisible(false);
    localforage.removeItem("token")
    .then(() => {
    console.log("token 已移除");
    location.reload();
    })
  };
  return (
    <>
      {outlet}
      {contextHolder}
      <Modal
        title=""
        visible={isLogoutModalVisible}
        onOk={handleLogout}
        onCancel={handleLogout}
        footer={[
            <Button key="logout" type="primary" onClick={handleLogout}>
              确定
            </Button>,
          ]}
      >
        <p>登录信息已过期，请重新登录</p>
      </Modal>
    </>
  );
}

export default App;
