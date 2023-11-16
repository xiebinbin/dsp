import {
  ModalForm,
  ProForm,
  ProFormInstance,
  ProFormText,
} from "@ant-design/pro-components";
import { useMount, useSafeState, useUnmount } from "ahooks";

import Emittery from "emittery";
import { useCallback, useRef } from "react";
import { message } from "antd";

export const $detailemit = new Emittery();

const AdvertiserDetail = () => {

  const [show, setShow] = useSafeState(false);
  const [mode, setMode] = useSafeState("add");
  const formRef = useRef<ProFormInstance>();
  const companyNameRef = useRef<string | undefined>();

  const domainNameRef = useRef<string | undefined>();

  useMount(() => {
    $detailemit.on("detail", ({ companyName, domainName }) => {
      setMode("detail");
      companyNameRef.current = companyName;
      domainNameRef.current = domainName;
      loadInfo()
        .then(() => {
        //   setTimeout(() => {
            setShow(true);
        //   }, 500);
        })
        .catch(() => {
          message.error("加载失败");
        });
    });
  });
  useUnmount(() => {
    $detailemit.clearListeners();
  });
  const loadInfo = useCallback(async () => {
    // const user = await AdvAPI.getInfo(val);

    setTimeout(() => {
      formRef.current?.setFieldsValue({
        domainName: domainNameRef.current,
        companyName: companyNameRef.current,
      });
    }, 500);
  }, []);

  return (
    <ModalForm
      formRef={formRef}
      title={mode === "detail" ? "详情" : "记录"}
      open={show}
    //   onOpenChange={setShow}
      onOpenChange={(isOpen) => {
        // 在 Modal 关闭时清空数据
        if (!isOpen) {
          formRef.current?.resetFields(); // 清空表单字段
        }
        setShow(isOpen);
      }}
      submitter={{
        resetButtonProps: {
          type: "dashed",
        },
        submitButtonProps: {
          style: {
            display: "none",
          },
        },
      }} // 渲染一个空内容，相当于隐藏确定按钮
    >
      {mode === "detail" && (
        <>
          <ProForm.Group>
            <ProFormText
              name="companyName"
              label="公司名称"
              placeholder=""
              disabled
              width="md"
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText
              name="domainName"
              label="域名"
              placeholder=""
              disabled
              width="md"
            />
          </ProForm.Group>
        </>
      )}
    </ModalForm>
  );
};

export default AdvertiserDetail;
