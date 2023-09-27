import { useSafeState } from "ahooks";
import { useCallback, useRef, useEffect } from "react";
import AuthApi from "@/api/auth.ts";
import localforage from "localforage";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card, Space, Tag, message } from "antd";
import { useRecoilState } from "recoil";
import { AuthInfo } from "@/stores/auth-info.ts";
import Icon, {
  KeyOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";

const LoginPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useSafeState("");
  const [username, setUsername] = useSafeState("");
  const [codeid, setCodeid] = useSafeState("");
  const [loading, setLoading] = useSafeState(false);
  const [, setAuthInfo] = useRecoilState(AuthInfo);
  const loadingRef = useRef(false);
  const [inputCode, setInputCode] = useSafeState(""); // 初始化验证码
  const [imgSrc, setImgSrc] = useSafeState("");

  const refreshCaptcha = useCallback(() => {
    // 在此处处理刷新验证码的逻辑，可以生成新的验证码并更新到页面
    AuthApi.getCode()
      .then((res) => {
        localStorage.setItem("codeid", res.codeid);
        setCodeid(res.codeid); // 使用 useCallback 后不再需要 localStorage
        setImgSrc(res.url);
      })
      .catch((error) => {
        console.error("刷新验证码失败", error);
      });
  }, [setCodeid, setImgSrc]);

  useEffect(() => {
    // 在组件加载后调用 refreshCaptcha
    refreshCaptcha();
    (async () => {
      const codeIdFromLocalStorage = localStorage.getItem("codeid");
      setCodeid(codeIdFromLocalStorage || "");
    })();
  }, [setCodeid, refreshCaptcha]);

  const checkUser = useCallback(() => {
    console.log("inputCode", inputCode);
    if (username === "" || password === "" || inputCode === "") {
      window.Message.error("用户名、密码或验证码不能为空！");
      return true;
    }
    return false;
  }, [username, password, inputCode]);

  const login = useCallback(
    async (password: string, inputCode: string) => {
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
        const res = await AuthApi.login({ username, password, inputCode, codeid });

        console.log("res", res);

        if (!res) {
          message.error("用户名密码或验证码错误");
        } else {
          await localforage.setItem("token", res.token);
          window.Message.success("登录成功");
       
          const info = await AuthApi.getInfo();
          console.log('登录成功info',info)

          setAuthInfo(info);

          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 1000);
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
      <Card className="mx-4" style={{ width: "380px" }} title="DSP广告主平台">
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
        <Input
          className="w-full mt-1rem"
          addonBefore={<KeyOutlined />}
          placeholder="验证码："
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // 按下回车键触发登录
              login(password, inputCode);
            }
          }}
        />
        <div className="w-full mt-4"></div>

        <Space className="w-full" direction="horizontal">
          <img
            src={imgSrc}
            className="w-auto h-auto max-w-full max-h-full"
            onClick={refreshCaptcha}
          />
          <Tag color="lime">不清楚？点击图片换一张</Tag>
        </Space>

        <div className="w-full mt-4">
          <Button
            type="primary"
            className="w-full mt-1rem"
            loading={loading}
            onClick={() => {
              // 防止重复点击登录按钮
              if (!loading) {
                login(password, inputCode);
              }
            }}
          >
            登录
          </Button>
          <Icon name="arrow-right" />
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
