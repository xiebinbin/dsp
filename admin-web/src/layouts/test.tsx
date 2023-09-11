import React, { useState, useCallback } from 'react';
import { Modal, Input, message } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'; // 引入图标
import AuthApi from '@/api/auth.ts';

interface ChangepwdCompProps {
  visible: boolean;
  onCancel: () => void;
}

const ChangepwdComp: React.FC<ChangepwdCompProps> = ({ visible, onCancel}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 控制密码可见性的状态

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleOk = useCallback(async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      message.error('所有字段都不能为空');
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error('新密码与确认密码不一致');
      return;
    }

    try {
      await AuthApi.changePWD({ username, oldPassword, confirmPassword });
      window.Message.success('修改成功');
      onCancel();
    } catch (error) {
      message.error('修改密码失败：');
    }
  }, [username, oldPassword, newPassword, confirmPassword, onCancel]);

  return (
    <Modal
      title="修改密码"
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <div>
        <label htmlFor="oldPassword">原密码:</label>
        <Input.Password
          id="oldPassword"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="newPassword">新密码:</label>
        <Input.Password
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)} // 切换密码可见性的图标
          type={showPassword ? 'text' : 'password'} // 根据 showPassword 控制密码是否可见
        />
      </div>
      <div>
        <label htmlFor="confirmPassword">再次输入密码:</label>
        <Input.Password
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)} // 切换密码可见性的图标
          type={showPassword ? 'text' : 'password'} // 根据 showPassword 控制密码是否可见
        />
      </div>
  
    </Modal>
  );
};

export default ChangepwdComp;
