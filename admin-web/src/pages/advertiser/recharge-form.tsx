import {
  ModalForm,
  ProForm,
  ProFormDigit,
  ProFormInstance,
  ProFormText,
} from "@ant-design/pro-components";
import { useMount, useSafeState, useUnmount } from "ahooks";
import Emittery from "emittery";
import { useCallback, useEffect, useRef } from "react";
import AdvAPI, { AdvEditDto } from "@/api/advertiser.ts";
import RechargeApi, { RechargeDto } from "@/api/recharge-order.ts";
import { Button, Modal, message } from "antd";

export const $rechargeemit = new Emittery();

const RechargeForm = (props: { role: "Root" | "Agent"; roleName: string }) => {
  const { role, roleName } = props;
  const [show, setShow] = useSafeState(false);
  const [mode, setMode] = useSafeState("add");
  const [id, setId] = useSafeState<bigint>(BigInt(0));

  const formRef = useRef<ProFormInstance>();

  useEffect(() => {}, []);
  useMount(() => {
    $rechargeemit.on("recharge", (val: bigint) => {
      setMode("recharge");
      setId(val);

      loadInfo(val)
        .then(() => {
          setShow(true);
        })
        .catch(() => {
          message.error("加载失败");
        });
    });
    $rechargeemit.on("update", (val: bigint) => {
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
    $rechargeemit.clearListeners();
  });

  // formRef.current?.resetFields();
  const loadInfo = useCallback(async (val: bigint) => {
    const user = await AdvAPI.getInfo(val);

    console.log("user.wallet?.balance", user.wallet?.balance);
    setTimeout(() => {
      formRef.current?.setFieldsValue({
        id: user.id,
        currentBalance: user.wallet?.balance+'(元)',
        companyName: user.companyName,
      });
    }, 500);
  }, []);
  const recharge = useCallback(
    async (data: RechargeDto) => {
      console.log("create data", data);
      try {
        const res = await RechargeApi.create(data);
        if (!res) {
          window.Message.error("新建失败，请重试");
        } else {
          window.Message.success("修改成功");
          formRef.current?.resetFields();
          $rechargeemit.emit("reload");
          setShow(false);
        }
      } catch (error) {
        console.log(error);
        console.error("发生错误", error);
      }
    },
    [setShow]
  );
  const record = useCallback(
    async (vId: bigint, data: AdvEditDto) => {
      await AdvAPI.update(vId, data);
      message.success("更新成功");
      formRef.current?.resetFields();
      $rechargeemit.emit("reload");
      setShow(false);
    },
    [setShow]
  );
  return (
    <ModalForm
      formRef={formRef}
      title={mode === "recharge" ? "充值" : "记录"}
      open={show}
      submitter={false}
      onFinish={async () => {
        if (formRef.current) {
          const data = await formRef.current.validateFields();
          // data.avatar = avatar;
          // data.total=data.amount+data.currentBalance;
          console.log("validateFields data", data);
          if (mode === "recharge") {
            data.id = Number(id);
            await recharge(data);
          }
          if (mode === "record") {
            console.log("record data", data);

            await record(id, data);
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
          name="companyName" // 添加公司名称字段
          label="公司名称"
          placeholder=""
          disabled
          width="md"
        />{" "}
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          name="currentBalance"
          label="当前余额"
          initialValue={0} // 将余额转换为字符串并设置为初始值
          disabled
          width="md"
          fieldProps={{
            type: "money",
            precision: 2, // 小数点位数，根据需求设置
          }}

        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          name="amount"
          label="预存数量（元）"
          required
          width="md"
          // min={1} // 最小值，根据业务需求设置
          fieldProps={{
            type: "number",
            precision: 2, // 小数点位数，根据需求设置
          }}
          rules={[
            {
              validator: async (_, value) => {
                if (value < 1) {
                  throw new Error("预存数量必须大于等于1元");
                }
              },
            },
          ]}
        />
      </ProForm.Group>
      <Button
        type="primary"
        onClick={() => {
          if (formRef.current) {
            formRef.current.validateFields().then((values) => {
              const { amount,companyName } = values;
              const formattedAmount = parseFloat(amount).toFixed(2);
              Modal.confirm({
                title: "确认提交",
                content: (
                  <div>
                    您确定给 <span style={{ fontWeight: 'bold', color: 'black' }}>{companyName}</span> 预存{" "}
                    <span style={{ color: 'red' }}>{formattedAmount}(元)</span> 吗？
                  </div>
                ),
                onOk: () => {
                  formRef.current?.submit();
                },
              });
            });
          }
        }}
      >
        提交
      </Button>
    </ModalForm>
  );
};

export default RechargeForm;
