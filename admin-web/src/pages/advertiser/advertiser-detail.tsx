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

const AdvertiserDetail = (props: {
  role: "Root" | "Agent";
  roleName: string;
}) => {
  const { role, roleName } = props;

  const [show, setShow] = useSafeState(false);
  const [mode, setMode] = useSafeState("add");
  const formRef = useRef<ProFormInstance>();
  const companyNameRef = useRef<string | undefined>();

  const taxNumberRef = useRef<string | undefined>();
  const cpmPriceRef = useRef<number | undefined>();

  useMount(() => {
    $detailemit.on("detail", ({ val, companyName, taxNumber, cpmPrice }) => {
      setMode("detail");
      
    // setCompanyName(companyName);
    // settaxNumber(taxNumber);
    // setcpmPrice(cpmPrice);
    console.log(role,roleName)
      console.log('val',val,'taxNumber',taxNumber,'cpmPrice',cpmPrice)
      companyNameRef.current = companyName;
      taxNumberRef.current = taxNumber;
      cpmPriceRef.current = cpmPrice/100;
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
        taxNumber: taxNumberRef.current,
        companyName: companyNameRef.current,
        cpmPrice: Number(cpmPriceRef.current).toFixed(2)+'(元)'||'0.00(元)',
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
              name="taxNumber"
              label="纳税人识别号"
              placeholder=""
              disabled
              width="md"
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText
              name="cpmPrice"
              label="千次展现价格"
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
