import {PageContainer, ProForm, ProFormDigit} from "@ant-design/pro-components";
import {useMount} from "ahooks";
import SettingApi from "@/api/setting.ts";
import {useCallback} from "react";
import {SystemSetting} from "@/shims";

export default () => {
    const [form] = ProForm.useForm();
    const loadInfo = useCallback(async () => {
        let s = await SettingApi.getGroupInfo("system");
        console.log(s,'s');
        if (s) {
            s = s as SystemSetting;
            form.setFieldsValue({
                registerPointsGift: s.registerPointsGift,
                firstLoginPointsGift: s.firstLoginPointsGift,
                dailyFirstLoginPointsGift: s.dailyFirstLoginPointsGift,
                likePointsCost: s.likePointsCost,
            });
        }
    }, [form])
    useMount(() => {
        loadInfo().then(r => {
            console.log(r);
        });
    })
    return <PageContainer
        title="系统设置"
        token={{
            paddingInlinePageContainerContent: 40,
        }}
    >
        <ProForm
            onFinish={async (formData: Record<string, number>) => {
                SettingApi.update({
                    group: "system",
                    data: formData
                }).then(() => {
                    window.Message.success('保存成功');
                }).catch(() => {
                    window.Message.error('保存失败');
                });

                return true;
            }}>
            <ProForm.Group>
                <ProFormDigit
                    initialValue={10}
                    width="xs"
                    label="注册积分奖励"
                    fieldProps={{
                        step: 1,
                        formatter: (val) => {
                            if (!val) {
                                return "0";
                            }
                            return parseInt(val.toString()).toString();
                        }
                    }}
                    name="registerPointsGift"
                />
                <ProFormDigit
                    initialValue={10}
                    width="xs"
                    label="首次登录积分奖励"
                    fieldProps={{
                        step: 1,
                        formatter: (val) => {
                            if (!val) {
                                return "0";
                            }
                            return parseInt(val.toString()).toString();
                        }
                    }}
                    name="firstLoginPointsGift"/>
                <ProFormDigit
                    initialValue={10}
                    width="xs"
                    label="每日登录积分奖励"
                    fieldProps={{
                        step: 1,
                        formatter: (val) => {
                            if (!val) {
                                return "0";
                            }
                            return parseInt(val.toString()).toString();
                        }
                    }}
                    name="dailyFirstLoginPointsGift"/>
                <ProFormDigit
                    initialValue={10}
                    width="xs"
                    label="点赞积分消耗"
                    fieldProps={{
                        step: 1,
                        formatter: (val) => {
                            if (!val) {
                                return "0";
                            }
                            return parseInt(val.toString()).toString();
                        }
                    }}
                    name="likePointsCost"/>
            </ProForm.Group>
        </ProForm>;
    </PageContainer>
}
