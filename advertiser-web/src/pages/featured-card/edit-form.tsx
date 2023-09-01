import {
    ModalForm,
    ProForm,
    ProFormDigit,
    ProFormInstance,
    ProFormRadio,
    ProFormSelect,
    ProFormText,
} from '@ant-design/pro-components';
import {Button, Image, message, Upload, UploadFile} from 'antd';
import {useMount, useSafeState, useUnmount} from "ahooks";
import FeaturedCardApi, {FeaturedCardEditDto} from "@/api/featured-card.ts";
import Emittery from 'emittery';
import {useCallback, useRef} from "react";
import {RcFile} from "antd/es/upload";
import {getLangList} from "@/utils/lang.ts";
import {loadTags, upload} from "@/utils/form-tool.ts";
import ImgCrop from "antd-img-crop";
import {CloudUploadOutlined} from "@ant-design/icons";
import {getImgUrl} from "@/utils/file.ts";
// eslint-disable-next-line react-refresh/only-export-components
export const $emit = new Emittery();
const EditForm = () => {
    const [show, setShow] = useSafeState(false);
    const [mode, setMode] = useSafeState('add');
    const [id, setId] = useSafeState<bigint>(BigInt(0));
    const formRef = useRef<ProFormInstance>();
    const [cover, setCover] = useSafeState('');
    const [tags, setTags] = useSafeState<{ label: string, value: number }[]>([]);
    const [fileList, setFileList] = useSafeState<UploadFile[]>([]);
    useMount(async () => {
        $emit.on('add', () => {
            setMode('add');
            formRef.current?.resetFields();
            setFileList([])
            setId(BigInt(0));
            setShow(true);
        });
        $emit.on('update', (val: bigint) => {
            setMode('update');
            setId(val);
            setFileList([])
            loadInfo(val).then(() => {
                setShow(true);
            }).catch(() => {
                message.error('加载失败');
            });
        });
        setTags(await loadTags(''))
    });
    useUnmount(() => {
        $emit.clearListeners();
    });
    const loadInfo = useCallback(async (val: bigint) => {
        const card = await FeaturedCardApi.getInfo(val);
        const defaultFile: UploadFile = {
            uid: card.cover,
            name: card.cover,
            url: "https://file.acg.fans/" + card.cover,
            thumbUrl: "https://file.acg.fans/" + card.cover,
            status: "success",
        }
        setFileList([defaultFile]);
        setCover(card.cover);
        setTags(await loadTags('', card.tags.map((item) => Number(item))));
        setTimeout(() => {
            formRef.current?.setFieldsValue({
                title: card.title,
                showName: card.showName,
                sort: card.sort,
                tags: card.tags.map((v) => Number(v)),
                lang: card.lang,
            });
        }, 1000);
    }, [setCover, setFileList, setTags]);
    const create = useCallback(async (data: FeaturedCardEditDto) => {
        await FeaturedCardApi.create(data);
        message.success('新建成功');
        formRef.current?.resetFields();
        $emit.emit('reload');
        setShow(false);
    }, [setShow]);
    const update = useCallback(async (vId: bigint, data: FeaturedCardEditDto) => {
        await FeaturedCardApi.update(vId, data);
        message.success('更新成功');
        $emit.emit('reload');
        setShow(false);
    }, [setShow]);
    const customRequest = useCallback(async (file: RcFile) => {
        setFileList([{
            uid: file.uid,
            name: file.name,
            originFileObj: file,
            status: "uploading",
        }]);
        try {
            const res = await upload(file);
            const uploadFile: UploadFile = {
                uid: file.uid,
                name: res.key,
                url: res.url,
                thumbUrl: res.url,
                status: "success",
            }
            setFileList([uploadFile]);
            setCover(res.key);
        } catch (e) {
            setFileList([]);
            setCover('');
            message.error('上传失败');
        }
    }, [setFileList]);
    return (
        <ModalForm
            formRef={formRef}
            title={mode === 'add' ? '新建推荐卡片' : '编辑推荐卡片'}
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
                <ProFormText
                    required
                    rules={[{required: true, message: '请输入展示名称'}]}
                    initialValue={""}
                    width="xl"
                    name="showName"
                    label="展示名称"
                    placeholder="请输入展示名称"
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProForm.Item label="头像">

                    {cover ?
                        <Image
                            width={200}
                            src={getImgUrl(cover)}
                            preview={{
                                src: getImgUrl(cover),
                            }}
                        /> :
                        null
                    }
                    <ImgCrop rotationSlider>
                        <Upload
                            name="avatar"
                            accept="image/*"
                            maxCount={1}
                            showUploadList={false}
                            onChange={(info) => {
                                setFileList(info.fileList);
                            }}
                            onRemove={() => {
                                setFileList([]);
                                setCover('');
                            }}
                            fileList={fileList}
                            customRequest={({file}) => customRequest(file as RcFile)}
                        >
                            <Button icon={<CloudUploadOutlined/>}>上传</Button>
                        </Upload>
                    </ImgCrop>
                </ProForm.Item>
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
