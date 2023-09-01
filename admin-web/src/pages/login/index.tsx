import {useSafeState} from "ahooks";
import {useCallback, useRef} from "react";
import AuthApi from "@/api/auth.ts";
import localforage from "localforage";
import {useNavigate} from "react-router-dom";
import {Button, Input} from "antd";
import {useRecoilState} from "recoil";
import {AuthInfo} from "@/stores/auth-info.ts";

const LoginPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useSafeState('');
    const [username, setUsername] = useSafeState('');
    const [loading, setLoading] = useSafeState(false);
    const [, setAuthInfo] = useRecoilState(AuthInfo);
    const loadingRef = useRef(false);
    const login = useCallback(async (password: string) => {
        if (loadingRef.current) return;
        setLoading(true);
        loadingRef.current = true;
        AuthApi.login({username, password}).then(async (res) => {
            await localforage.setItem('token', res.token);
            window.Message.success('登录成功');
            AuthApi.getInfo().then((res) => {
                setAuthInfo(res);
            })
            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 1000);
        }).finally(() => {
            setLoading(false);
            loadingRef.current = false;
        });
    }, [navigate, setLoading, username])
    return <div className="w-screen h-screen flex items-center justify-center">
        <div className="w-20rem">
            <Input className="w-full" placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)}/>
            <Input className="w-full mt-1rem" placeholder="密码" type="password" value={password}
                   onChange={(e) => setPassword(e.target.value)}/>
            <Button type="primary" className="w-full mt-1rem" loading={loading} onClick={() => login(password)}>登录</Button>
        </div>
    </div>
}

export default LoginPage;
