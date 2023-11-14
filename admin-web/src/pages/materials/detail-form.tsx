import {
  ModalForm,
  ProForm,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { useMount, useSafeState, useUnmount } from "ahooks";
import PositionApi from "@/api/position.ts";

import Emittery from "emittery";
import { useCallback, useRef } from "react";
import { message } from "antd";
import MaterialApi from "@/api/material.ts";
import { getImgUrl } from "@/utils/file";
import { AdpositionOpt } from "@/shims";
import specApi from "@/api/spec.ts";

export const $detailemit = new Emittery();

const MaterialDetail = (props: {
  role: "Advertiser" | "Agent" | "Root";
  roleName: string;
}) => {
  const { role } = props;
  const [materialurl, setMaterialurl] = useSafeState(""); //http://static-edu-test.leleshuju.com/
  const [positionOptionsAll, setPositionOptionsAll] = useSafeState<
    { label: string; value: number }[]
  >([]);
  const [specOptions, setspecOptions] = useSafeState<
    { label: string; value: number }[]
  >([]);
  const [show, setShow] = useSafeState(false);
  const [mode, setMode] = useSafeState("detail");
  const formRef = useRef<ProFormInstance>();
  const loadSpecOpt = useCallback(async (type?: number) => {
    const specOpt = await specApi.getSpecsList();
    if (type) {
      setspecOptions(
        specOpt
          .filter((opt) => opt.type === type)
          .map((opt) => ({
            label: opt.name,
            value: opt.id,
          }))
      );
    } else {
      setspecOptions(
        specOpt.map((opt) => ({
          label: opt.name,
          value: opt.id,
        }))
      );
    }
  }, []);
  const loadPositionsOpt = useCallback(async () => {
    const positionOpt: AdpositionOpt[] = await PositionApi.getPositionsList();

    setPositionOptionsAll(
      positionOpt.map((opt) => ({
        label: opt.name,
        value: opt.id,
      }))
    );
  }, []);
  useMount(() => {
    loadSpecOpt();
    loadPositionsOpt();
    $detailemit.on("detail", (val) => {
      setMode("detail");
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
  const loadInfo = useCallback(async (id: bigint) => {
    console.log("role", role);
    // const user = await AdvAPI.getInfo(val);
    const data = await MaterialApi.getDetailInfo(id);
    formRef.current?.resetFields();
    setTimeout(() => {
      formRef.current?.setFieldsValue({
        name: data.name,
        mediaType: data.adPosition.type,
        content: data.content,
        contentType: data.contentType,
        enabled: data.enabled,
        advertiserId: data.advertiser.id,
        positionId: data.adPosition.id,
        materialurl: data.url,
        mediaId: data.adPosition.adMedia.id,
        jumpUrl: data.jumpUrl,
        specId: data.adPosition.adSpec.id,
        domainName: data.advertiser.domainName,
        companyName: data.advertiser.companyName,
      });
    }, 500);
    setMaterialurl(data.url);
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
              name="domainName"
              label="域名"
              placeholder=""
              disabled
              width="md"
            />
          </ProForm.Group>
          <ProFormSelect
            name="specId"
            label="广告规格"
            required
            disabled
            initialValue={true}
            options={specOptions}
          />
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
          <ProFormSelect
            name="positionId"
            label="广告位置"
            required
            disabled
            initialValue={positionOptionsAll.map((val) => val.value)}
            options={positionOptionsAll.map((val) => ({
              label: val.label,
              value: val.value,
            }))}
          />
          <ProFormText
            disabled
            required
            initialValue={""}
            width="xl"
            name="name"
            label="广告创意名称"
          />
          <ProFormText
            disabled
            required
            initialValue={""}
            width="xl"
            name="content"
            label="广告内容"
          />
          <ProFormText
            // required
            disabled
            rules={[{ required: true, message: "请输入素材跳转地址" }]}
            initialValue={""}
            width="xl"
            name="jumpUrl"
            label="素材跳转地址"
            placeholder="请输入素材跳转地址"
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
    </ModalForm>
  );
};

export default MaterialDetail;
