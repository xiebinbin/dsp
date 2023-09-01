import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormInstance,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
} from '@ant-design/pro-components';
import {message} from 'antd';
import {useMount, useSafeState, useUnmount} from "ahooks";
import HelpApi, {HelpEditDto} from "@/api/help.ts";
import Emittery from 'emittery';
import {useCallback, useRef} from "react";
import {getLangList} from "@/utils/lang.ts";
// eslint-disable-next-line react-refresh/only-export-components
export const $emit = new Emittery();
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
        const popular = await HelpApi.getInfo(val);
        setTimeout(() => {
            formRef.current?.setFieldsValue({
                title: popular.title,
                content: popular.content,
                sort: popular.sort,
                lang: popular.lang,
            });
        }, 1000);
    }, []);
    const close = useCallback(() => {
        setShow(false);
        formRef.current?.resetFields();
    }, [setShow])
    const create = useCallback(async (data: HelpEditDto) => {
        const tag = await HelpApi.create(data);
        message.success('新建成功');
        formRef.current?.resetFields();
        $emit.emit('update', tag.id);
        $emit.emit('reload');
        close()
    }, [close]);
    const update = useCallback(async (vId: bigint, data: HelpEditDto) => {
        console.log(vId, data)
        await HelpApi.update(vId, data);
        message.success('更新成功');
        $emit.emit('reload');
        close();
    }, [close]);
    return (
        <ModalForm
            formRef={formRef}
            title={mode === 'add' ? '新建常见问题' : '编辑常见问题'}
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
                <ProFormSelect
                    required
                    name="lang"
                    rules={[{required: true, message: '语言不能为空'}]}
                    placeholder="请选择语言"
                    initialValue={"zh-Hans"}
                    label="语言"
                    valueEnum={getLangList()}/>
                <ProFormDigit
                    required
                    width="xs"
                    name="sort"
                    label="排序"
                    initialValue={10}
                    placeholder="请输入排序"
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormTextArea width="lg" name="content" label="内容" required placeholder="请输入常见问题内容"/>
            </ProForm.Group>
        </ModalForm>
    );
};

export default EditForm;
