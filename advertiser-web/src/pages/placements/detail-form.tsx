import {
  ModalForm,
  ProForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
} from "@ant-design/pro-components";
import { useMount, useSafeState, useUnmount } from "ahooks";

import Emittery from "emittery";
import { useCallback, useRef } from "react";
import { message } from "antd";
import PlacementApi from "@/api/placement.ts";
import { getImgUrl } from "@/utils/file";

export const $detailemit = new Emittery();

const PlacementDetail = (props: {
  role: "Advertiser" | "Agent" | "Root";
  roleName: string;
}) => {
  const { role, roleName } = props;
  const [materialurl, setMaterialurl] = useSafeState("");

  const [show, setShow] = useSafeState(false);
  const [mode, setMode] = useSafeState("detail");
  const formRef = useRef<ProFormInstance>();
  useMount(() => {
    $detailemit.on("detail", (val) => {
      setMode("detail");
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
    $detailemit.clearListeners();
  });
  const loadInfo = useCallback(
    async (id: bigint) => {
      // const user = await AdvAPI.getInfo(val);
      const data = await PlacementApi.getDetailInfo(id);
      formRef.current?.resetFields();
      setTimeout(() => {
        formRef.current?.setFieldsValue({
            materialname: data.adMaterial.name,
            mediaType: data.mediaType,
            displayCount: data.displayCount,
            clickCount: data.clickCount,
            startedAt: data.startedAt,  
            endedAt:data.endedAt, 
            budget: data.budget,
            usedBudget: data.usedBudget,
            materialurl:data.adMaterial.url,
        });
      }, 500);
      setMaterialurl(data.adMaterial.url)
  
    },
    [setMaterialurl]
  );

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
      {mode === "detail"  && (
        <>
          <ProForm.Group>
            <ProFormText
              name="materialname"
              label="广告创意"
              placeholder=""
              disabled
              width="md"
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormText
              name="mediaType"
              label="广告类型"
              placeholder=""
              disabled
              width="md"
            />
          </ProForm.Group>

          <ProFormDigit
            name="displayCount"
            label="展现次数"
            disabled
            required
            width="md"
            // min={1} // 最小值，根据业务需求设置
            fieldProps={{
              type: "number",
              precision: 2, // 小数点位数，根据需求设置
            }}
           
          />
            <ProFormDigit
            name="clickCount"
            label="点击次数"
            disabled
            required
            width="md"
            // min={1} // 最小值，根据业务需求设置
            fieldProps={{
              type: "number",
              precision: 2, // 小数点位数，根据需求设置
            }}
         
          />
          <div style={{ display: "flex", alignItems: "center" }}>
          <ProFormDateTimePicker
            name="startedAt"
            label="开始投放时间"
            disabled
            fieldProps={{
              format: (value) => value.format("YYYY-MM-DD hh:mm:ss"),
            }}
          />
          <span style={{ margin: "0 8px" }}>-</span>
          <ProFormDateTimePicker
            name="endedAt"
            label="结束投放时间"
            disabled
            fieldProps={{
              format: (value) => value.format("YYYY-MM-DD  hh:mm:ss"),
            }}
          />

        </div>
           <ProFormDigit
            name="budget"
            label="预算"
            disabled
            required
            width="md"
            // min={1} // 最小值，根据业务需求设置
            fieldProps={{
              type: "number",
              precision: 2, // 小数点位数，根据需求设置
            }}
           
          />
            <ProFormDigit
            name="usedBudget"
            label="当前消耗"
            required
            disabled
            width="md"
            // min={1} // 最小值，根据业务需求设置
            fieldProps={{
              type: "number",
              precision: 2, // 小数点位数，根据需求设置
            }}
          />
           <ProForm.Group>
            <ProForm.Item label="素材预览">
                {materialurl !== "" && (
                <img
                    className="w-150px h-150px mr-1rem"
                    // src={getImgUrl('https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png')}
                    src={getImgUrl(materialurl)}

                    alt="素材预览图"
                />
                )}
            </ProForm.Item>
            </ProForm.Group>
        </>
      )}

    </ModalForm>
  );
};

export default PlacementDetail;
