import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormInstance, ProFormRadio,
    ProFormText,
    ProFormTextArea,
} from '@ant-design/pro-components';
import {message} from 'antd';
import {useMount, useSafeState, useUnmount} from "ahooks";
import PlacementChannelApi, {PlacementChannelEditDto} from "@/api/placement-channel.ts";
import Emittery from 'emittery';
import {useCallback, useRef} from "react";
import {getLangList} from "@/utils/lang.ts";
// eslint-disable-next-line react-refresh/only-export-components
const langMap = new Map<string, string>();
Object.entries(getLangList()).forEach(([key, value]) => {
    langMap.set(key, value);
});
export const $emit = new Emittery();

const EditForm = () => {
    const [show, setShow] = useSafeState(false);
    const [mode, setMode] = useSafeState('add');
    const [id, setId] = useSafeState<bigint>(BigInt(0));
    const formRef = useRef<ProFormInstance>();
    useMount(async () => {
        $emit.on('add', () => {
            setMode('add');
            formRef.current?.resetFields();
            setId(BigInt(0));
            setShow(true);
        });
        $emit.on('update', (val: bigint) => {
            setMode('update');
            setId(val);
            loadInfo(val).then(() => {
                setShow(true);
            }).catch(() => {
                message.error('加载失败');
            });
        });
    });
    useUnmount(() => {
        $emit.clearListeners();
    });
    const loadInfo = useCallback(async (val: bigint) => {
        const channel = await PlacementChannelApi.getInfo(val);
        setTimeout(() => {
            formRef.current?.setFieldsValue({
                title: channel.title,
                remark: channel.remark,
                level: channel.level,
                priceRate: channel.priceRate,
            });
        }, 1000);
    }, []);
    const create = useCallback(async (data: PlacementChannelEditDto) => {
        await PlacementChannelApi.create(data);
        message.success('新建成功');
        formRef.current?.resetFields();
        $emit.emit('reload');
        setShow(false);
    }, [setShow]);
    const update = useCallback(async (vId: bigint, data: PlacementChannelEditDto) => {
        await PlacementChannelApi.update(vId, data);
        message.success('更新成功');
        $emit.emit('reload');
        setShow(false);
    }, [setShow]);
    return (
        <ModalForm
            formRef={formRef}
            title={mode === 'add' ? '新建投放渠道' : '编辑投放渠道'}
            open={show}
            onFinish={async () => {
                if (formRef.current && formRef.current.validateFieldsReturnFormatValue) {
                    const data = await formRef.current?.validateFieldsReturnFormatValue();
                    if (mode === 'add') {
                        await create(data);
                    }
                    if (mode === 'update') {
                        await update(id, data);
                    }
                }

                return false;
            }}
            onOpenChange={setShow}
        >
            <ProForm.Group>
                <ProFormText
                    required
                    rules={[{required: true, message: '请输入标题'}]}
                    initialValue={""}
                    width="xl"
                    name="title"
                    label="标题"
                    placeholder="请输入标题"
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormDigit
                    required
                    width="xs"
                    name="priceRate"
                    label="价格费率"
                    initialValue={10}
                    addonAfter={"%"}
                    placeholder="请输入价格费率"
                />
                <ProFormDigit
                    required
                    rules={[{required: true, message: '请输入评级'}]}
                    width="xs"
                    name="level"
                    label="评级"
                    initialValue={10}
                />
                <ProFormRadio.Group
                    name="enabled"
                    label="启用状态"
                    required
                    initialValue={true}
                    options={[
                        {
                            label: '启用',
                            value: true,
                        },
                        {
                            label: '禁用',
                            value: false
                        },
                    ]}
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormTextArea
                    initialValue={""}
                    width="xl"
                    name="remark"
                    label="备注"
                    placeholder="请输入备注"
                />
            </ProForm.Group>
        </ModalForm>
    );
};

export default EditForm;
