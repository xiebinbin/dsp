import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormInstance,
    ProFormRadio,
    ProFormText,
} from '@ant-design/pro-components';
import {message} from 'antd';
import {useMount, useSafeState, useUnmount} from "ahooks";
import TagApi from "@/api/tag";
import Emittery from 'emittery';
import {useCallback, useRef} from "react";
import {TagEditDto} from "@/api/tag.ts";
import {getLangList} from "@/utils/lang.ts";
// eslint-disable-next-line react-refresh/only-export-components
export const $emit = new Emittery();
const locales = Object.entries(getLangList()).flatMap(([key, value]) => {
    return {
        key,
        label: value
    }
});
const EditForm = () => {
    const [show, setShow] = useSafeState(false);
    const [mode, setMode] = useSafeState('add');
    const [id, setId] = useSafeState<bigint>(BigInt(0));
    const formRef = useRef<ProFormInstance>();
    useMount(() => {
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
        const tag = await TagApi.getInfo(val);
        setTimeout(() => {
            formRef.current?.setFieldsValue({
                title: tag.title,
                sort: tag.sort,
                enabled: tag.enabled,
                recommended: tag.recommended,
                locales: tag.locales,
            });
        }, 1000)
    }, []);
    const create = useCallback(async (data: TagEditDto) => {
        const tag = await TagApi.create(data);
        message.success('新建成功');
        formRef.current?.resetFields();
        $emit.emit('update', tag.id);
        $emit.emit('reload');
    }, []);
    const update = useCallback(async (vId: bigint, data: TagEditDto) => {
        await TagApi.update(vId, data);
        message.success('更新成功');
        $emit.emit('reload');
    }, []);
    return (
        <ModalForm
            formRef={formRef}
            title={mode === 'add' ? '新建标签' : '编辑标签'}
            open={show}
            onFinish={async () => {
                if (formRef.current) {
                    const data = await formRef.current.validateFields();
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
                    name="sort"
                    label="排序"
                    initialValue={10}
                    placeholder="请输入排序"
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
                <ProFormRadio.Group
                    name="recommended"
                    label="推荐状态"
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
                {locales.map((locale) => (
                    <ProFormText
                        width="lg"
                        name={['locales', locale.key]}
                        initialValue={""}
                        label={locale.label}
                        placeholder="请输入标题"
                    />
                ))}
            </ProForm.Group>
        </ModalForm>
    )
        ;
};

export default EditForm;
