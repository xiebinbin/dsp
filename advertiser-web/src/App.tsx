import './App.css'
import {useLocation, useNavigate, useOutlet} from "react-router-dom";
import {arbitrum, polygon, mainnet} from "wagmi/chains";
import {configureChains, createConfig, WagmiConfig} from "wagmi";
import {EthereumClient, w3mConnectors, w3mProvider} from "@web3modal/ethereum";
import {Web3Modal} from "@web3modal/react";
import {useMount} from "ahooks";
import SysApi from '@/api/sys.ts';
import localforage from 'localforage';
import {useCallback} from "react";
import {GenerateKey} from "@/utils/wallet.ts";
import {message} from 'antd';
import AuthApi from "@/api/auth.ts";
import {AuthInfo} from "@/stores/auth-info.ts";
import {useRecoilState} from "recoil";

const projectId = '85d7f167671901e11e9a8950c146e301';
const chains = [arbitrum, polygon, mainnet];
const {publicClient} = configureChains(chains, [w3mProvider({projectId})])
const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({projectId, chains}),
    publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains);

function App() {
    const [messageApi, contextHolder] = message.useMessage();
    window.Message = messageApi;
    const outlet = useOutlet();
    const local = useLocation();
    const navigate = useNavigate();
    const [, setAuthInfo] = useRecoilState(AuthInfo)
    const init = useCallback(async () => {

        const loginKey = await localforage.getItem('login-key');
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
        // await localforage.removeItem('login-key');
        SysApi.getPubKey().then(async rep => {
            await localforage.setItem('sys-pub-key', rep.pub_key)
            const userPriKey = await localforage.getItem('user-pri-key');
            if (!userPriKey) {
                await localforage.setItem('user-pri-key', GenerateKey());
            }
            await init();
        }).catch(err => {
            console.log(err);
        });
    });
    return (
        <>
            <WagmiConfig config={wagmiConfig}>
                {outlet}
            </WagmiConfig>
            {contextHolder}
            <Web3Modal themeVariables={{
                "--w3m-accent-color": "#1677ff"
            }} projectId={projectId} ethereumClient={ethereumClient}/>
        </>
    )
}

export default App
