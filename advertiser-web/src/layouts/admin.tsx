import type {ProSettings} from '@ant-design/pro-components';
import {ProConfigProvider, ProLayout, SettingDrawer,} from '@ant-design/pro-components';
import {Button, ConfigProvider, Dropdown,} from 'antd';
import {useState} from 'react';
import {useNavigate, useOutlet} from "react-router-dom";
import setting from "@/layouts/setting.ts";
import GetRouter from "@/routers";
import {useRecoilState} from "recoil";
import {AuthInfo} from "@/stores/auth-info.ts";
import {LockTwoTone, LogoutOutlined} from "@ant-design/icons";
import localforage from "localforage";
import ChangepwdComp from './changepwdComp';

const AdminLayout = () => {
    const [settings, setSetting] = useState<Partial<ProSettings>>(setting);
    const outlet = useOutlet();
    const navigate = useNavigate();
    const [changepwdVisible, setChangepwdVisible] = useState(false);
    const [authUser,] = useRecoilState(AuthInfo)
    console.log(authUser,'authUser');
    const [pathname, setPathname] = useState('/admin/dashboard');
 

    const showChangepwdModal = () => {
        setChangepwdVisible(true);
      };
    
      const handleChangepwdCancel = () => {
        setChangepwdVisible(false);
      };
    
    
      
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
                        route={GetRouter(authUser.role)}
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
                            size: 'small',
                            title: authUser.username+(authUser.role ? `(${authUser.role})` : ''),
                            render: () => (<div className="flex pt-.5rem">
                                <Dropdown
                                    menu={{
                                        items: [
                                            {
                                                onClick: () => {
                                                    console.log("点击退出登录按钮");
                                                    localforage.removeItem("token")
                                                        .then(() => {
                                                        console.log("token 已移除");
                                                        location.reload();
                                                        })
                                                        .catch((error) => {
                                                        console.error("移除 token 时出错", error);
                                                        });
                                                },
                                                key: 'logout',
                                                icon: <LogoutOutlined />,
                                                label: '退出登录',
                                            },{
                                                
                                                onClick:showChangepwdModal,
                                                key: 'changepwd',
                                                icon: <LockTwoTone />,
                                                label: '修改密码',
                                            },
                                        ],
                                    
                                    }}
                                >
                                    <Button size="small" type="primary">{authUser.username}({authUser.role})</Button>
                                </Dropdown>
                               
                            </div>),
                        }
                    
                    }
                      
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
                    <ChangepwdComp visible={changepwdVisible} onCancel={handleChangepwdCancel} />

                </ConfigProvider>
            </ProConfigProvider>
        </div>
    );
};

export default AdminLayout;
