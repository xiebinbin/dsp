import {PageContainer, ProForm, ProFormDigit} from "@ant-design/pro-components";
import {useMount} from "ahooks";
import SettingApi from "@/api/setting.ts";
import {useCallback} from "react";
import {PaymentSetting} from "@/shims";

export default () => {
    const [form] = ProForm.useForm();
    const loadInfo = useCallback(async () => {
        let s = await SettingApi.getGroupInfo("system");
        if (s) {
            s = s as PaymentSetting;
            form.setFieldsValue({
                coinPayRate: s.coinPayRate,
            });
        }
    }, [form])
    useMount(() => {
        loadInfo().then(r => {
            console.log(r);
        });
    })
    return <PageContainer
        title="支付设置"
        token={{
            paddingInlinePageContainerContent: 40,
        }}
    >
        <ProForm
            onFinish={async (formData: Record<string, number>) => {
                SettingApi.update({
                    group: "payment",
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
                    label="金币支付费率"
                    fieldProps={{
                        step: 1,
                        formatter: (val) => {
                            if (!val) {
                                return "0";
                            }
                            return parseInt(val.toString()).toString();
                        }
                    }}
                    name="coinPayRate"
                />
            </ProForm.Group>
        </ProForm>;
    </PageContainer>
}
