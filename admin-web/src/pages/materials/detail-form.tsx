import {
  ModalForm,
  ProForm,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
} from "@ant-design/pro-components";
import { useMount, useSafeState, useUnmount } from "ahooks";

import Emittery from "emittery";
import { useCallback, useRef } from "react";
import { message } from "antd";
import MaterialApi from "@/api/material.ts";

export const $detailemit = new Emittery();

const MaterialDetail = (props: {
  role: "Advertiser" | "Agent" | "Root";
  roleName: string;
}) => {
  const { role, roleName } = props;
  const [materialurl, setMaterialurl] = useSafeState(""); //http://static-edu-test.leleshuju.com/

  const [show, setShow] = useSafeState(false);
  const [mode, setMode] = useSafeState("detail");
  const formRef = useRef<ProFormInstance>();
  const [id, setId] = useSafeState<bigint>(BigInt(0));
  const [positionOptions, setPositionOptions] = useSafeState([
    { label: "列表页", value: 1 },
    { label: "详情页", value: 2 },
    { label: "侧边栏", value: 3 },
  ]);
  useMount(() => {
    $detailemit.on("detail", (val) => {
      setMode("detail");
      setId(val);
      loadInfo(val)
        .then(() => {
          // setTimeout(() => {
          setShow(true);
          // }, 500);
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
      console.log("role", role);
      // const user = await AdvAPI.getInfo(val);
      const data = await MaterialApi.getDetailInfo(id);
      formRef.current?.resetFields();
      setTimeout(() => {
        formRef.current?.setFieldsValue({
          companyName: data.advertiser.companyName,
          taxNumber: data.advertiser.taxNumber,
          mediaType: data.mediaType,
          position: data.position,
          url: data.url,
        });
      }, 500);
      setMaterialurl(data.url)
      if (data.mediaType === 2) {
        setPositionOptions([
          { label: "列表页", value: 1 },
          { label: "详情页", value: 2 },
          { label: "侧边栏", value: 3 },
          { label: "全屏弹窗", value: 4 },
        ]);
      } else {
        setPositionOptions([
          { label: "列表页", value: 1 },
          { label: "详情页", value: 2 },
          { label: "侧边栏", value: 3 },
        ]);
      }
    },
    [setPositionOptions]
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
      {mode === "detail" && role === "Agent" && (
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

          <ProFormRadio.Group
            name="mediaType"
            label="媒体类型"
            required
            disabled
            initialValue={true}
            options={[
              { label: "网站", value: 1 },
              { label: "pc软件", value: 2 },
            ]}
          />
          <ProFormRadio.Group
            name="position"
            label="广告位置"
            required
            disabled
            initialValue={true}
            options={positionOptions}
          />
          <ProForm.Item label="上传素材">
            {materialurl != "" ? (
              <img
                className="w-200px h-200px mr-1rem"
                src={getImgUrl(materialurl)}
                alt=""
              />
            ) : null}{" "}
          </ProForm.Item>
        </>
      )}
      {mode === "detail" && role === "Advertiser" && (
        <>
          <ProFormRadio.Group
            name="mediaType"
            label="媒体类型"
            required
            disabled
            initialValue={true}
            options={[
              { label: "网站", value: 1 },
              { label: "pc软件", value: 2 },
            ]}
          />
          <div className="custom-radio-group">
            <ProFormRadio.Group
              name="position"
              label="广告位置"
              required
              disabled
              initialValue={true}
              options={positionOptions}
            />
          </div>
        </>
      )}
    </ModalForm>
  );
};

export default MaterialDetail;
