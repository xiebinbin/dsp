import {
  ModalForm,
  ProForm,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useMount, useSafeState, useUnmount } from "ahooks";
import Emittery from "emittery";
import { useCallback, useEffect, useRef } from "react";
import AdvAPI, { AdvEditDto } from "@/api/advertiser.ts";
import AgentApi from "@/api/agent.ts";

import { message } from "antd";
import UserApi from "@/api/user.ts";
export const $emit = new Emittery();

const EditForm = (props: { role: "Root" | "Agent"; roleName: string }) => {
  const { role, roleName } = props;
  const [show, setShow] = useSafeState(false);
  const [mode, setMode] = useSafeState("add");
  const [id, setId] = useSafeState<bigint>(BigInt(0));

  const [userId, setUserId] = useSafeState<{ id: number; name: string }[]>();
  const [operators, setOperators] =
    useSafeState<{ id: number; name: string }[]>();

  const formRef = useRef<ProFormInstance>();
  const positiveNumberPattern = /^(?:[1-9]\d*|0)(?:\.\d+)?$/;
  const getAgentList = useCallback(async () => {
    try {
      const agentOptList = await AgentApi.getAgentsList();
      console.log("agentOptList", agentOptList);

      setUserId(agentOptList);
    } catch (error) {
      console.error("Error fetching agent options:", error);
    }
  }, [setUserId]);
  const getOperatorList = useCallback(async () => {
    const operatorlist = await UserApi.getOptList();
    console.log("operatorlist", operatorlist);
    setOperators(operatorlist);
  }, [setOperators]);
  const handleSelectAgent = () => {
    // 在这里执行点击事件处理逻辑
    // 假设 agentOptList 是点击事件后要设置的值
    getAgentList();
  };
  const handleSelectOperator = () => {
    // 在这里执行点击事件处理逻辑
    // 假设 agentOptList 是点击事件后要设置的值
    getOperatorList();
  };
  useEffect(() => {
    getAgentList();
    getOperatorList();
  }, [getAgentList,getOperatorList]);
  useMount(() => {
    $emit.on("add", () => {
      setMode("add");
      formRef.current?.resetFields();
      formRef.current?.setFieldsValue({
        companyName: "",
        username: "",
        password: "",
        domainName: "",
        enabled: "",
        cpmPrice: "",
      });
      // setId(BigInt(0));
      setShow(true);
    });
    $emit.on("update", (val: bigint) => {
      setMode("update");
      setId(val);

      loadInfo(val)
        .then(() => {
          setShow(true);
        })
        .catch(() => {
          message.error("加载失败");
        });
    });
  });
  useUnmount(() => {
    $emit.clearListeners();
  });


  // formRef.current?.resetFields();
  const loadInfo = useCallback(
    async (val: bigint) => {
      const user = await AdvAPI.getInfo(val);
      // user.userId= [
      //     { id: 1, name: 'Agent 1' },
      //     { id: 2, name: 'Agent 2' },
      //     // 可以添加更多的示例对象
      //   ];

      // const agentInfoArray: { id: bigint; name: string }[] =
      // (user.agents as { id: bigint; name: string }[]).map(agent => ({ id: agent.id, name: agent.name }));
      console.log("user.user", user.user);
      // setUserId([user.user]);
      console.log("edit user", user);

      setTimeout(() => {
        formRef.current?.setFieldsValue({
          companyName: user.companyName,
          username: user.username,
          domainName: user.domainName,
          password: user.password,
          confirmPassword: user.password,
          userId: user.userId,
          enabled: user.enabled,
          cpmPrice: user.cpmPrice / 100,
          operatorId: user.operatorId,
        });
      }, 500);
    },
    [setUserId,setOperators]
  );
  const create = useCallback(
    async (data: AdvEditDto) => {
      console.log("create data", data);
      try {
        const res = await AdvAPI.create(data);
        if (!res) {
          window.Message.error("新建失败，请重试");
        } else {
          window.Message.success("修改成功");
          formRef.current?.resetFields();

          //   $emit.emit('update', res.id);
          $emit.emit("reload");
          setShow(false);
        }
      } catch (error) {
        console.log(error);
        console.error("发生错误", error);
      }
    },
    [setShow]
  );
  const update = useCallback(
    async (vId: bigint, data: AdvEditDto) => {
      // console.log('password',data.password,
      // 'confirmPassword',data.confirmPassword,
      // " data.role", data.role)
      if (data.password != data.confirmPassword) {
        message.error("两次密码不一致");
        return;
      }
      await AdvAPI.update(vId, data);
      message.success("更新成功");
      formRef.current?.resetFields();
      $emit.emit("reload");
      setShow(false);
    },
    [setShow]
  );
  return (
    <ModalForm
      formRef={formRef}
      title={mode === "add" ? "新建" + roleName : "编辑" + roleName}
      open={show}
      onFinish={async () => {
        if (formRef.current) {
          const data = await formRef.current.validateFields();
          // data.avatar = avatar;
          data.cpmPrice = data.cpmPrice * 100;
          console.log("validateFields data", data);
          if (mode === "add") {
            data.role = role;
            // if(role!='Root')
            // {
            // data.role=role;
            // }
            await create(data);
          }
          if (mode === "update") {
            console.log("update data", data);

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
          //   setUsername(''); // 清空相关状态
          setId(BigInt(0));
        }
        setShow(isOpen);
      }}
    >
      <ProForm.Group>
        <ProFormText
          required
          rules={[{ required: true, message: "请输入公司名称" }]}
          initialValue={""}
          width="xl"
          name="companyName"
          label="公司名称"
          placeholder="请输入公司名称"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          required
          rules={[{ required: true, message: "请输入域名" }]}
          initialValue={""}
          width="xl"
          name="domainName"
          label="域名"
          placeholder="请输入域名"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          required
          disabled={mode != "add"} // Conditionally disable based on 'mode'
          rules={[{ required: true, message: "请输入用户名" }, {}]}
          initialValue={""}
          width="xl"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          required
          rules={[
            { required: true, message: "千次展现价格" },
            {
              pattern: positiveNumberPattern,
              message: "千次展现价格必须为正数",
            },
          ]}
          initialValue={0} // 设置初始值为字符串 "0"
          width="xl"
          name="cpmPrice"
          label="千次展现价格(元)"
          placeholder="请输入千次展现价格"
        />
      </ProForm.Group>

      <ProForm.Group>
        <ProFormText.Password
          required={mode == "add"}
          rules={[{ required: mode == "add", message: "请输入密码" }]}
          initialValue={""}
          width="xl"
          name="password"
          label="登录密码"
          placeholder="请输入密码"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText.Password
          rules={[{ required: mode == "add", message: "再次输入密码" }]}
          initialValue={""}
          width="xl"
          name="confirmPassword"
          label="确认密码"
          placeholder="再次输入密码"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          name="userId"
          label="代理商"
          placeholder="请选择代理商"
          options={userId?.map((user) => ({
            label: user.name,
            value: user.id,
          }))}
          required
          rules={[{ required: true, message: "请选择代理商" }]}
          onChange={handleSelectAgent}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          name="operatorId"
          label="运营者"
          placeholder="请选择运营者"
          options={operators?.map((operator) => ({
            label: operator.name,
            value: operator.id,
          }))}
          required
          rules={[{ required: true, message: "请选择运营者" }]}
          onChange={handleSelectOperator}
        />
      </ProForm.Group>
      <ProForm.Group></ProForm.Group>
      <ProForm.Group>
        <ProFormRadio.Group
          name="enabled"
          label="启用状态"
          required
          initialValue={true}
          options={[
            {
              label: "启用",
              value: true,
            },
            {
              label: "禁用",
              value: false,
            },
          ]}
        />
      </ProForm.Group>
    </ModalForm>
  );
};

export default EditForm;
