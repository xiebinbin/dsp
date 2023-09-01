import {
    ModalForm,
    ProForm,
    ProFormDateRangePicker,
    ProFormDigit,
    ProFormInstance,
    ProFormSelect,
    ProFormText,
} from '@ant-design/pro-components';
import {message} from 'antd';
import {useMount, useSafeState, useUnmount} from "ahooks";
import PopularApi, {PopularEditDto} from "@/api/popular.ts";
import Emittery from 'emittery';
import {useCallback, useRef} from "react";
import {getLangList} from "@/utils/lang.ts";
import {loadTags} from "@/utils/form-tool.ts";
// eslint-disable-next-line react-refresh/only-export-components
export const $emit = new Emittery();
const EditForm = () => {
    const [show, setShow] = useSafeState(false);
    const [mode, setMode] = useSafeState('add');
    const [id, setId] = useSafeState<bigint>(BigInt(0));
    const formRef = useRef<ProFormInstance>();
    const [tags, setTags] = useSafeState<{ label: string, value: number }[]>([]);
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
        setTags(await loadTags(''));
    });
    useUnmount(() => {
        $emit.clearListeners();
    });

    const loadInfo = useCallback(async (val: bigint) => {
        const popular = await PopularApi.getInfo(val);
        const items = await loadTags('', popular.tags.map((v) => Number(v)));
        setTags(items);
        setTimeout(() => {
            formRef.current?.setFieldsValue({
                title: popular.title,
                sort: popular.sort,
                tags: popular.tags.map((v) => Number(v)),
                lang: popular.lang,
                dateRange: [popular.startedAt, popular.endedAt],
            });
        }, 1000);
    }, [setTags]);
    const create = useCallback(async (data: PopularEditDto) => {
        const tag = await PopularApi.create(data);
        message.success('新建成功');
        formRef.current?.resetFields();
        $emit.emit('update', tag.id);
        $emit.emit('reload');
    }, []);
    const update = useCallback(async (vId: bigint, data: PopularEditDto) => {
        console.log(vId, data)
        await PopularApi.update(vId, data);
        message.success('更新成功');
        $emit.emit('reload');
    }, []);
    return (
        <ModalForm
            formRef={formRef}
            title={mode === 'add' ? '新建热点' : '编辑热点'}
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
                <ProFormDateRangePicker key="dateRange" transform={(value) => {
                    return {
                        startedAt: value[0],
                        endedAt: value[1]
                    }
                }} name="dateRange" label="日期区间"/>
            </ProForm.Group>
            <ProForm.Group>
                <ProFormSelect
                    name="tags"
                    options={tags}
                    fieldProps={{
                        mode: 'multiple',
                        showSearch: true,
                        onSearch: async (value: string) => setTags(await loadTags(value)),
                        onClear: async () => setTags(await loadTags(''))
                    }}
                    label="关联标签"></ProFormSelect>
            </ProForm.Group>
        </ModalForm>
    )
        ;
};

export default EditForm;
