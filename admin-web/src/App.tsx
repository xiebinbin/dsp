import './App.css'
import {useLocation, useNavigate, useOutlet} from "react-router-dom";
import {useMount} from "ahooks";
import localforage from 'localforage';
import {useCallback} from "react";
import {message} from 'antd';
import AuthApi from "@/api/auth.ts";
import {AuthInfo} from "@/stores/auth-info.ts";
import {useRecoilState} from "recoil";


function App() {
    const [messageApi, contextHolder] = message.useMessage();
    window.Message = messageApi;
    const outlet = useOutlet();
    const local = useLocation();
    const navigate = useNavigate();
    const [, setAuthInfo] = useRecoilState(AuthInfo)
    const init = useCallback(async () => {
        const loginKey = await localforage.getItem('token');
        if (!loginKey && !/\/login/.test(local.pathname)) {
            navigate("/login");
            return;
        }
        if ((loginKey && /\/login/.test(local.pathname)) || local.pathname == "/") {
            navigate("/admin/dashboard");
            return;
        }
        const user = await AuthApi.getInfo()
        setAuthInfo(user);
    }, [local.pathname, navigate, setAuthInfo]);

    useMount(async () => {
        await init();
    });
    return (
        <>
            {outlet}
            {contextHolder}
        </>
    )
}

export default App
