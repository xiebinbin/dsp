import {Web3Button} from "@web3modal/react";
import {useAccount, useDisconnect, useSignMessage} from "wagmi";
import {useSafeState} from "ahooks";
import {Input, Button} from 'antd';
import clsx from "clsx";
import {useCallback} from "react";
import {InputStatus} from "antd/es/_util/statusUtils";
import sha256 from "crypto-js/sha256";
import CryptoJS from "crypto-js";
import AuthApi from "@/api/auth.ts";
import localforage from "localforage";
import {useNavigate} from "react-router-dom";

const LoginPage = () => {
    const {signMessageAsync} = useSignMessage();
    const navigate = useNavigate();
    const {disconnect} = useDisconnect();
    const {isConnected} = useAccount({
        onConnect() {
            setConnected(true);
        },
        onDisconnect() {
            console.log('disconnect');
            setConnected(false);
        }
    });
    const [password, setPassword] = useSafeState('');
    const [connected, setConnected] = useSafeState(isConnected);

    const [loading, setLoading] = useSafeState(false);
    const [inputStatus, setInputStatus] = useSafeState<InputStatus>("");
    const login = useCallback(async (password: string) => {
        const timestamp = parseInt(String(new Date().getTime() / 1000));
        const data = {
            password: password
        }
        const dataHash = sha256(JSON.stringify(data)).toString(CryptoJS.enc.Hex);
        const sign = await signMessageAsync({message: dataHash + ":" + timestamp});
        setLoading(true);
        AuthApi.login({password, sign, dataHash: dataHash, timestamp}).then(async (res) => {
            await localforage.setItem('login-key', res.key);
            window.Message.success('登录成功');
            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 1000);
        }).finally(() => {
            setLoading(false);
        });
    }, [navigate, setLoading, signMessageAsync])
    return <div className="w-screen h-screen flex items-center justify-center">
        <div className="w-20rem">
            <div className="w-full">
                {!connected && <div className="w-full justify-center flex">
                    <Web3Button/>
                </div>}
                <div className={
                    clsx([
                        "w-full",
                        !connected && 'hidden'
                    ])}>
                    <div className="pt-1rem w-full">
                        <Input status={inputStatus} size="large" className="w-full" onChange={(e) => {
                            setPassword(e.target.value);
                            setInputStatus('');
                        }} placeholder="口令" value={password}/>
                    </div>
                    <div className="pt-1rem w-full flex justify-between">
                        <div className="w-6/13">

                            <Button onClick={async () => {
                                if (loading) return;
                                disconnect();

                                setConnected(false);
                            }} size="large" block>退出登录</Button>
                        </div>
                        <div className="w-6/13">
                            <Button loading={loading} onClick={async () => {
                                if (loading) return;
                                if (password == "") {
                                    window.Message.error('请输入口令');
                                    return;
                                }
                                login(password);
                            }} size="large" block type="primary">进入后台</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default LoginPage;
