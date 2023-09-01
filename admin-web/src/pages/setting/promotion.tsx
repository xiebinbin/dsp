import {
    PageContainer,
    ProForm,
    ProFormDigit,
    ProFormGroup,
    ProFormInstance,
    ProFormList
} from "@ant-design/pro-components";
import {useMount} from "ahooks";
import SettingApi from "@/api/setting.ts";
import {useCallback, useRef} from "react";
import {PromotionSetting} from "@/shims";

export default () => {
    const formRef = useRef<ProFormInstance>();
    const loadInfo = useCallback(async () => {
        let s = await SettingApi.getGroupInfo("promotion");
        if (s) {
            s = s as PromotionSetting;
            const {agentCommissionRateList} = s;
            const items: {
                amount: number,
                commissionRate: number,
            }[] = [];
            agentCommissionRateList.forEach((v) => {
                items.push({
                    amount: v[0],
                    commissionRate: v[1],
                })
            });
            formRef.current?.setFieldsValue({
                creatorCommissionRate: s.creatorCommissionRate,
                'agentCommissionRateList': items
            })
            console.log(items)
        }
    }, [])
    useMount(() => {
        loadInfo();
    })
    return <PageContainer
        title="推广设置"
        token={{
            paddingInlinePageContainerContent: 40,
        }}
    >
        <ProForm
            formRef={formRef}
            onFinish={async (formData: Record<string, number | Map<string, {
                amount: 1000,
                commissionRate: 30,
            }>>) => {
                const agentCommissionRateList = formData.agentCommissionRateList as Map<string, {
                    amount: 1000,
                    commissionRate: 30,
                }>;
                const agentCommissionRateListArray: Array<number>[] = [];
                agentCommissionRateList.forEach((v) => {
                    agentCommissionRateListArray.push([v.amount, v.commissionRate]);
                });
                SettingApi.update({
                    group: "promotion",
                    data: {
                        creatorCommissionRate: formData.creatorCommissionRate as number,
                        agentCommissionRateList: agentCommissionRateListArray as Array<number>[],
                    }
                }).then(() => {
                    window.Message.success('保存成功');
                }).catch(() => {
                    window.Message.error('保存失败');
                });

                return true;
            }}>
            <ProFormDigit
                initialValue={10}
                width="xs"
                label="创作者分成比例(30=30% 最大 30%)"
                fieldProps={{
                    step: 1,
                    min: 0,
                    max: 30,
                    formatter: (val) => {
                        if (!val) {
                            return "0";
                        }
                        return parseInt(val.toString()).toString();
                    }
                }}
                name="creatorCommissionRate"
            />
            <ProFormList
                copyIconProps={false}
                label="代理分成规则"
                name="agentCommissionRateList"
                creatorButtonProps={{
                    position: 'bottom',
                    creatorButtonText: '新建规则',
                }}
                creatorRecord={{
                    amount: 1,
                    commissionRate: 1,
                }}

            >
                <ProFormGroup>
                    <ProFormDigit
                        initialValue={10}
                        label="金额"
                        fieldProps={{
                            step: 1,
                            min: 1,
                            formatter: (val) => {
                                if (!val) {
                                    return "0";
                                }
                                return parseInt(val.toString()).toString();
                            }
                        }}
                        name="amount"
                    />
                    <ProFormDigit
                        initialValue={10}
                        label="比例"
                        fieldProps={{
                            step: 1,
                            min: 1,
                            formatter: (val) => {
                                if (!val) {
                                    return "0";
                                }
                                return parseInt(val.toString()).toString();
                            }
                        }}
                        name="commissionRate"
                    />
                </ProFormGroup>
            </ProFormList>
        </ProForm>
    </PageContainer>
}
