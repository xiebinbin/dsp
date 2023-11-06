import {
    ModalForm,
    ProForm,
    ProFormInstance,
    ProFormRadio,
    ProFormText,
    // ProFormTextArea,
} from '@ant-design/pro-components';
import { message} from 'antd';
import {useMount, useSafeState, useUnmount} from "ahooks";
import Emittery from 'emittery';
import { useCallback, useRef} from "react";
import UserApi, {UserEditDto} from "@/api/user.ts";
// import {RcFile} from "antd/es/upload";
// import {CloudUploadOutlined} from "@ant-design/icons";
// import {upload} from "@/utils/form-tool.ts";
// eslint-disable-next-line react-refresh/only-export-components
export const $emit = new Emittery();
const EditForm = (props: {
    role: 'Root' | 'Operator' | 'Agent';
    roleName: string;
}) => {
    const {role, roleName} = props;
    const [show, setShow] = useSafeState(false);
    const [mode, setMode] = useSafeState('add');
    const [id, setId] = useSafeState<bigint>(BigInt(0));
    const formRef = useRef<ProFormInstance>();
    const [username, setUsername] = useSafeState('');

 
    
    // const [fileList, setFileList] = useSafeState<UploadFile[]>([]);
    // const [avatar, setAvatar] = useSafeState('');
    // const customRequest = useCallback(async (file: RcFile) => {
    //     setFileList([{
    //         uid: file.uid,
    //         name: file.name,
    //         originFileObj: file,
    //         status: "uploading",
    //     }])
    //     try {
    //         const res = await upload(file);
    //         const uploadFile: UploadFile = {
    //             uid: file.uid,
    //             name: res.key,
    //             url: res.url,
    //             thumbUrl: res.url,
    //             status: "success",
    //         }
    //         setFileList([uploadFile]);
    //         setAvatar(res.key);
    //     }catch (e) {
    //         setFileList([]);
    //         setAvatar('');
    //         message.error('上传失败');
    //     }
    // }, [setAvatar, setFileList]);
    useMount(() => {
        $emit.on('add', () => {
            setMode('add');
            formRef.current?.resetFields();
            formRef.current?.setFieldsValue({
                nickname: '',
                username: '',
                password: '',
                taxnumber:'',
                confirmPassword:  '',
                enabled: '',
                role: role,
            });
            console.log('username',username)
            // setId(BigInt(0));
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
    // formRef.current?.resetFields();
    const loadInfo = useCallback(async (val: bigint) => {
        const user = await UserApi.getInfo(val);
        console.log('edit user',user)
    
        setTimeout(() => {

            formRef.current?.setFieldsValue({
                nickname: user.nickname,
                username: user.username,
                taxnumber:user.taxnumber,
                password: user.password,
                confirmPassword:  user.password,
                enabled: user.enabled,
                role: user.role,
            });
            // setNickname(user.nickname?? "")
            // setUsername(user.username?? "")
            // setEnabled(user.enabled?? "")
        }, 500);
    }, []);
    const create = useCallback(async (data: UserEditDto) => {
        console.log('create data',data)
        try {
            const res = await UserApi.create(data);
            if (!res) {
              window.Message.error('新建失败，请重试');
            } else {
              window.Message.success('修改成功');
              formRef.current?.resetFields();
              
            //   $emit.emit('update', res.id);
              $emit.emit('reload');
              setShow(false);
            }
          } catch (error) {
            console.log(error);
            console.error('发生错误', error);
          }
    }, [setShow]);
    const update = useCallback(async (vId: bigint, data: UserEditDto) => {
       

        // console.log('password',data.password,
        // 'confirmPassword',data.confirmPassword,
        // " data.role", data.role)
        if(data.password!=data.confirmPassword)
        {
            message.error('两次密码不一致');
            return ;
        }
        await UserApi.update(vId, data);
        message.success('更新成功');
        formRef.current?.resetFields();
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
                    // data.avatar = avatar;
                    
                    console.log('validateFields data',data)
                    if (mode === 'add') {
                        data.role=role;
                        // if(role!='Root')
                        // {
                        // data.role=role;
                        // }
                        await create(data);
                    }
                    if (mode === 'update') {
                        console.log('update data',data)

                        await update(id, data);
                    }
                }
                return false;
            }}
            // onOpenChange={setShow}
            onOpenChange={(isOpen) => {
                // 在 Modal 关闭时清空数据
                if (!isOpen) {
                  formRef.current?.resetFields(); // 清空表单字段
                  setUsername(''); // 清空相关状态
                  setId(BigInt(0));
                }
                setShow(isOpen);
              }}
        >
            {/* <ProForm.Group>
                <ProFormText
                    required
                    rules={[{required: true, message: '请输入名昵称'}]}
                    initialValue={""}
                    width="xl"
                    name="nickname"
                    label="昵称"
                    placeholder="请输入名昵称"
                   
                />
            </ProForm.Group> */}
            <ProForm.Group>
                {role === 'Agent' ? (
                    <ProFormText
                    required
                    rules={[{ required: true, message: '请输入公司名称' }]}
                    initialValue={''}
                    width="xl"
                    name="nickname"
                    label="公司"
                    placeholder="请输入公司名称"
                    />
                ) : (
                    <ProFormText
                    required
                    rules={[{ required: true, message: '请输入昵称' }]}
                    initialValue={''}
                    width="xl"
                    name="nickname"
                    label="昵称"
                    placeholder="请输入昵称"
                    />
                )}
                </ProForm.Group>
                <ProForm.Group>
                {role === 'Agent' ? (
                    <ProFormText
                    required
                    rules={[{ required: true, message: '请输入税号' }]}
                    initialValue={''}
                    width="xl"
                    name="taxnumber"
                    label="税号"
                    placeholder="请输入税号"
                    />
                ) : (
                   null
                )}
                </ProForm.Group>
            <ProForm.Group>
                <ProFormText         
                    required 
                    disabled={mode != 'add'} // Conditionally disable based on 'mode'
                    rules={[{required: true, message: '请输入用户名'}, {
                        // pattern: /^0x[a-fA-F0-9]{40}$/,
                        // message: '请输入正确的地址'
                    }]}
                    initialValue={""}
                    width="xl"
                    name="username"
                    label="用户名"
                    placeholder="请输入用户名"
                />
            </ProForm.Group>
            <ProForm.Group>
                <ProFormText.Password
                     fieldProps={{
                        autoComplete: 'off' 
                    }}            
                  required={mode == "add"}
                    rules={[{required: mode == "add", message: '请输入登录密码'}]}
                    initialValue={""}
                    width="xl"
                    name="password"
                    label="登录密码"
                    placeholder="请输入登录密码"
                />
            </ProForm.Group>
            <ProForm.Group >
                <ProFormText.Password

                    rules={[{required: mode == "add", message: '再次输入登录密码'}]}
                    initialValue={""}
                    width="xl"
                    name="confirmPassword"
                    label="确认登录密码"
                    placeholder="再次输入登录密码"

                />  
            </ProForm.Group>
            <ProForm.Group style={{ display: "none" }}>
                <ProFormText
                  name="role"
                   disabled
                   style={{ display: "none" }}

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
        </ModalForm>
    );
};

export default EditForm;
