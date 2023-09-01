import {
    ModalForm,
    ProForm,
    ProFormInstance,
    ProFormRadio,
    ProFormText,
    ProFormTextArea,
} from '@ant-design/pro-components';
import {Avatar, message, Upload, UploadFile} from 'antd';
import ImgCrop from 'antd-img-crop';
import {useMount, useSafeState, useUnmount} from "ahooks";
import Emittery from 'emittery';
import {useCallback, useRef} from "react";
import UserApi, {UserEditDto} from "@/api/user.ts";
import {RcFile} from "antd/es/upload";
import {CloudUploadOutlined} from "@ant-design/icons";
import {upload} from "@/utils/form-tool.ts";
// eslint-disable-next-line react-refresh/only-export-components
export const $emit = new Emittery();
const EditForm = (props: {
    role: 'CREATOR' | 'SUPER' | 'OPERATOR';
    roleName: string;
}) => {
    const {role, roleName} = props;
    const [show, setShow] = useSafeState(false);
    const [mode, setMode] = useSafeState('add');
    const [id, setId] = useSafeState<bigint>(BigInt(0));
    const formRef = useRef<ProFormInstance>();
    const [fileList, setFileList] = useSafeState<UploadFile[]>([]);
    const [avatar, setAvatar] = useSafeState('');
    const customRequest = useCallback(async (file: RcFile) => {
        setFileList([{
            uid: file.uid,
            name: file.name,
            originFileObj: file,
            status: "uploading",
        }])
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
            setAvatar(res.key);
        }catch (e) {
            setFileList([]);
            setAvatar('');
            message.error('上传失败');
        }
    }, [setAvatar, setFileList]);
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
        const user = await UserApi.getInfo(val);
        setTimeout(() => {
            formRef.current?.setFieldsValue({
                name: user.name,
                remark: user.remark,
                address: user.address,
                enabled: user.enabled,
            });
            setAvatar(user.avatar ?? "");
        }, 1000);
    }, [setAvatar]);
    const create = useCallback(async (data: UserEditDto) => {
        data.role = role;
        const tag = await UserApi.create(data);
        message.success('新建成功');
        formRef.current?.resetFields();
        $emit.emit('update', tag.id);
        $emit.emit('reload');
        setShow(false);
    }, [role, setShow]);
    const update = useCallback(async (vId: bigint, data: UserEditDto) => {
        await UserApi.update(vId, data);
        message.success('更新成功');
        $emit.emit('reload');
        setShow(false);
    }, [setShow]);
    return (
        <ModalForm
            formRef={formRef}
            title={mode === 'add' ? '新建' + roleName : '编辑' + roleName}
            open={show}
            onFinish={async () => {
                if (formRef.current) {
                    const data = await formRef.current.validateFields();
                    data.avatar = avatar;
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
                    rules={[{required: true, message: '请输入名称'}]}
                    initialValue={""}
                    width="xl"
                    name="name"
                    label="名称"
                    placeholder="请输入名称"
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProForm.Item label="头像">
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
                                setAvatar('');
                            }}
                            fileList={fileList}
                            customRequest={({file}) => customRequest(file as RcFile)}
                        >
                            <div className="cursor-pointer">
                                {avatar != "" ?
                                    <Avatar src={'https://file.acg.fans/' + avatar} size={64}/> :
                                    <Avatar size={64} icon={<CloudUploadOutlined/>}/>
                                }
                            </div>
                        </Upload>
                    </ImgCrop>
                </ProForm.Item>

            </ProForm.Group>
            <ProForm.Group>
                <ProFormText
                    required
                    rules={[{required: true, message: '请输入地址'}, {
                        pattern: /^0x[a-fA-F0-9]{40}$/,
                        message: '请输入正确的地址'
                    }]}
                    initialValue={""}
                    width="xl"
                    name="address"
                    transform={(v) => v.toLowerCase()}
                    label="地址"
                    placeholder="请输入地址"
                />
            </ProForm.Group>

            <ProForm.Group>
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
                <ProFormText
                    required={mode == "add"}
                    rules={[{required: mode == "add", message: '请输入登录口令'}]}
                    initialValue={""}
                    width="xl"
                    name="password"
                    label="登录口令"
                    placeholder="请输入登录口令"
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
