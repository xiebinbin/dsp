import React, { useState, useCallback } from 'react';
import { Modal, Input, message } from 'antd';
import AuthApi from '@/api/auth.ts';
import { useRecoilState } from 'recoil';
import { AuthInfo } from '@/stores/auth-info';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

interface ChangepwdCompProps {
  visible: boolean;
  onCancel: () => void;
}

const ChangepwdComp: React.FC<ChangepwdCompProps> = ({ visible, onCancel }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authUser,] = useRecoilState(AuthInfo)
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleCancel = () => {
    // 清空输入框数据
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setConfirmLoading(false);
    onCancel();
  };
  const handleOk = useCallback(async () => {
    setConfirmLoading(true);

    // 添加验证规则
    if (!oldPassword || !newPassword || !confirmPassword) {
      message.error('所有字段都不能为空');
      setConfirmLoading(false);

      return; // 如果任意一个字段为空，停止处理并显示错误消息
    }
    if (oldPassword == newPassword) {
      message.error('新密码与确认密码相同');
      setConfirmLoading(false);

      return; // 如果新密码与确认密码不一致，停止处理并显示错误消息
    }
    if (newPassword !== confirmPassword) {
      message.error('新密码与确认密码不一致');
      setConfirmLoading(false);

      return; // 如果新密码与确认密码不一致，停止处理并显示错误消息
    }

    try {
      // 调用修改密码接口
      const username=authUser.username;
        console.log("token",authUser.username,'oldPassword',oldPassword,'confirm',confirmPassword)
      await AuthApi.changePWD({username, oldPassword, confirmPassword} ).then (async (res) => {
        if(!res)
        {
          setTimeout(() => {
            setConfirmLoading(false);
            window.Message.error('修改密码失败，请重试');
          }, 1000);

        }
        else{
            setConfirmLoading(false);
            window.Message.success('修改成功');
            handleCancel();
        }
      });

      // 修改密码成功后的逻辑，可以显示成功消息等等

      // 完成后关闭模态框
    } catch (error) {
      setTimeout(() => {
        setConfirmLoading(false);
        message.error('系统异常，请稍后重试');
      }, 1500);
      // 处理修改密码失败的情况，可以显示错误消息等等
    }finally{
      setTimeout(() => {
        setConfirmLoading(false);
        }, 1500);
    }
  }, [oldPassword, confirmPassword, onCancel]);

  return (
    <Modal
      title="修改密码"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}

    >
      <div>
      <label htmlFor="confirmPassword">原密码:</label>

      <Input.Password
        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        id="oldPassword"
        type="password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}/>
      </div>
      <div>
      <label htmlFor="confirmPassword">新密码:</label>

      <Input.Password
        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        id="newPassword"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}/>
      </div>
      <div>
      <label htmlFor="confirmPassword">再次输入密码:</label>

      <Input.Password
        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}/>
   
      </div>
    
    </Modal>
  );
};

export default ChangepwdComp;
 

