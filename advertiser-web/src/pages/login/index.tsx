import { useSafeState } from "ahooks";
import { useCallback, useRef, useEffect } from "react";
import AuthApi from "@/api/auth.ts";
import localforage from "localforage";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card, Space,  message } from "antd";
import { useRecoilState } from "recoil";
import { AuthInfo } from "@/stores/auth-info.ts";
import Icon, {
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Form, Checkbox, Typography } from "antd";

const LoginPage = () => {
  const { Link } = Typography;
  const navigate = useNavigate();
  const [password, setPassword] = useSafeState("");
  const [username, setUsername] = useSafeState("");
  const [codeid, setCodeid] = useSafeState("");
  const [loading, setLoading] = useSafeState(false);
  const [, setAuthInfo] = useRecoilState(AuthInfo);
  const loadingRef = useRef(false);
  // const [imgSrc, setImgSrc] = useSafeState("");
  const [agreedToTerms, setAgreedToTerms] = useSafeState(false);

  useEffect(() => {
    // 在组件加载后调用 refreshCaptcha
    (async () => {
      const codeIdFromLocalStorage = localStorage.getItem("codeid");
      setCodeid(codeIdFromLocalStorage || "");
    })();
  }, [setCodeid]);

  const checkUser = useCallback(() => {
    if (username === "" || password === "") {
      window.Message.error("用户名、密码或验证码不能为空！");
      return true;
    }
    return false;
  }, [username, password]);

  const login = useCallback(
    async (password: string) => {
      if (loadingRef.current) return;
      setLoading(true);
      loadingRef.current = true;

      if (checkUser()) {
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      try {
        //  codeid= localStorage.getItem('codeid')?.toString;
        const res = await AuthApi.login({
          username,
          password,
          inputCode: 'null',
          codeid: 'null',
        });

        console.log("res", res);

        if (!res) {
          message.error("用户名密码或验证码错误");
        } else {
          await localforage.setItem("token", res.token);
          window.Message.success("登录成功");

          const info = await AuthApi.getInfo();
          console.log("登录成功info", info);

          setAuthInfo(info);

          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("登录失败", error);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [navigate, setLoading, checkUser, setAuthInfo, username, codeid]
  );

  return (
    <div className="w-screen h-screen   bg-gray-100 flex items-center justify-center">
      <div
        className="flex-1 bg-cover"
        style={{ backgroundImage: "url(your-background-image-url)" }}
      >
        {/* 可以添加其他内容到左侧，如果需要的话 */}
      </div>
      {/* 右侧的登录卡片 */}
      <div className="flex-1 flex justify-center">
        <Card
          className="mx-4 h-full"
          style={{ width: "380px" }}
          title="欢迎登录"
        >
          <h1 className="text-center text-2xl">DSP广告主平台</h1>

          {/* Slogan */}
          <h2 className="text-center text-sm text-gray-500">
            <img
              style={{
                width: "100px", // 调整宽度，根据需要修改
                height: "100px", // 调整高度，根据需要修改
              }}
              src={
                "  https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*1NHAQYduQiQAAAAAAAAAAABkARQnAQ"
              }
              className="w-auto h-auto max-w-full max-h-full"
            />
          </h2>
          <Input
            className="w-full mt-1rem"
            addonBefore={<UserOutlined />}
            placeholder="用户名："
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            className="w-full mt-1rem"
            addonBefore={<LockOutlined />}
            placeholder="密码："
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="w-full mt-4"></div>

          <Space className="w-full" direction="horizontal"></Space>
          <div style={{ height: "10px" }}></div>

          {/* 用户协议和隐私协议链接 */}
          <Form>
            <Form.Item>
              <Checkbox
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              >
                我已阅读并同意
                <Link href="/user-agreement" target="_blank">
                  《用户协议》
                </Link>
                和
                <Link href="/privacy" target="_blank">
                  《隐私协议》
                </Link>
              </Checkbox>
            </Form.Item>
          </Form>
          <div className="w-full mt-4">
            <Button
              type="primary"
              className="w-full mt-1rem"
              loading={loading}
              onClick={() => {
                if (agreedToTerms && !loading) {
                  setLoading(true); // 开始加载

                  setTimeout(() => {
                    login(password);
                    setLoading(false); // 结束加载
                  }, 1500); // 2秒的延迟
                } else {
                  message.error("请先同意用户协议");
                }
              }}
            >
              登录
            </Button>
            <Icon name="arrow-right" />
          </div>
          <div style={{ height: "20px" }}></div>

          <Form>
            <Form.Item>
              <Typography.Text type="secondary" style={{ textAlign: "center" }}>
                @2023 All Rights Reserved
              </Typography.Text>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
