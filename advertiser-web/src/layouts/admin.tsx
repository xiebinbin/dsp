import type {ProSettings} from '@ant-design/pro-components';
import {
    ProConfigProvider,
    ProLayout,
    SettingDrawer,
} from '@ant-design/pro-components';
import {
    ConfigProvider,
} from 'antd';
import {useEffect, useState} from 'react';
import {useNavigate, useOutlet} from "react-router-dom";
import {Web3Button} from "@web3modal/react";
import {useAccount} from "wagmi";
import localforage from "localforage";
import setting from "@/layouts/setting.ts";
import GetRouter from "@/routers";

const AdminLayout = () => {
    const [settings, setSetting] = useState<Partial<ProSettings>>(setting);
    const outlet = useOutlet();
    const navigate = useNavigate();
    const {isConnected} = useAccount()

    const [pathname, setPathname] = useState('/admin/dashboard');
    useEffect(() => {
        if (!isConnected) {
            localforage.removeItem('login-key').then(() => {
                navigate("/login");
            }).catch(() => {
                window.Message.error('退出登录失败');
            });
        }
    }, [isConnected, navigate, outlet]);
    if (typeof document === 'undefined') {
        return <div/>;
    }
    return (
        <div
            id="test-pro-layout"
            style={{
                height: '100vh',
                overflow: 'auto',
            }}
        >
            <ProConfigProvider hashed={false}>
                <ConfigProvider
                    getTargetContainer={() => {
                        return document.getElementById('test-pro-layouts') || document.body;
                    }}
                >
                    <ProLayout
                        prefixCls="my-prefix"
                        route={GetRouter()}
                        location={{
                            pathname,
                        }}
                        token={{
                            header: {
                                colorBgMenuItemSelected: 'rgba(0,0,0,0.04)',
                            },
                        }}
                        siderMenuType="group"
                        menu={{
                            collapsedShowGroupTitle: true,
                        }}
                        avatarProps={{
                            render: () => (<div className="flex pt-.5rem">
                                <Web3Button/>
                            </div>),
                        }}
                        headerTitleRender={(logo, title, _) => {
                            const defaultDom = (
                                <a>
                                    {logo}
                                    {title}
                                </a>
                            );
                            if (typeof window === 'undefined') return defaultDom;
                            if (document.body.clientWidth < 1400) {
                                return defaultDom;
                            }
                            if (_.isMobile) return defaultDom;
                            return (
                                <>
                                    {defaultDom}
                                </>
                            );
                        }}
                        onMenuHeaderClick={(e) => console.log(e)}
                        menuItemRender={(item, dom) => (
                            <div
                                onClick={() => {
                                    setPathname(item.path || '/welcome');
                                    if (item.path) {
                                        navigate(item.path)
                                    }
                                }}
                            >
                                {dom}
                            </div>
                        )}
                        {...settings}
                    >
                        {outlet}

                        <SettingDrawer
                            pathname={pathname}
                            enableDarkTheme
                            getContainer={(e: never) => {
                                if (typeof window === 'undefined') return e;
                                return document.getElementById('test-pro-layouts');
                            }}
                            settings={settings}
                            onSettingChange={(changeSetting) => {
                                setSetting(changeSetting);
                            }}
                            disableUrlParams={false}
                        />
                    </ProLayout>
                </ConfigProvider>
            </ProConfigProvider>
        </div>
    );
};

export default AdminLayout;
