import {
  ModalForm,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
} from "@ant-design/pro-components";
import { message } from "antd";
import { useMount, useSafeState, useUnmount } from "ahooks";
import Emittery from "emittery";
import { useCallback, useRef } from "react";
import { getCountryList } from "@/utils/country.ts";
import speclApi, { specEditDto } from "@/api/spec";

// eslint-disable-next-line react-refresh/only-export-components
export const $emit = new Emittery();

const countriesMaps = new Map<string, string>();
getCountryList().forEach((item) => {
  countriesMaps.set(item.value, item.label);
});
const EditForm = () => {
  const [show, setShow] = useSafeState(false);
  const [id, setId] = useSafeState<bigint>(BigInt(0));
  const formRef = useRef<ProFormInstance>();
  const [mode, setMode] = useSafeState("add");

  useMount(async () => {
    $emit.on("add", (val: bigint) => {
      setId(val);
      setMode("add");
      // loadAgentsRelation();
      // loadAdvertisers("");
      // loadspecs();
      formRef.current?.resetFields();
      formRef.current?.setFieldsValue({
        name: "",
        enabled: "",

        type: "",
        specs: [],
      });
      // setId(BigInt(0));
      setShow(true);
    });
    $emit.on("update", (val: bigint) => {
      setMode("update");
      console.log("update id", val);
      setId(val);
      //   setShow(true);

      //   setDefaultFileList([]);
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
  const close = useCallback(() => {
     setShow(false);
  }, [setShow]);
  const loadInfo = useCallback(async (val: bigint) => {
    const data = await speclApi.getInfo(val);

    setTimeout(() => {
      console.log("loadInfo data", data);
      formRef.current?.setFieldsValue({
        name: data.name,
        enabled: data.enabled,
        type: data.type,
        size: data.size,
      });
    }, 500);
  }, []);
  const update = useCallback(
    async (vId: bigint, data: specEditDto) => {
      await speclApi.update(vId, data);
      message.success("更新成功");
      $emit.emit("reload");
      close();
    },
    [close]
  );
  const create = useCallback(
    async (data: specEditDto) => {
      console.log("create data", data);
      try {
        const res = await speclApi.create(data);
        if (!res) {
          window.Message.error("新建失败，请重试");
        } else {
          window.Message.success("新建成功");
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
  return (
    <ModalForm
      formRef={formRef}
      title={mode === "add" ? "新建广告规格" : "编辑广告规格"}
      open={show}
      onFinish={async () => {
        if (formRef.current) {
          const data = await formRef.current.validateFields();
          // data.avatar = avatar;

          console.log("validateFields data", data);
          if (mode === "add") {
            // data.role = role;

            await create(data);
          }
          if (mode === "update") {
            console.log("update data", data);

            await update(id, data);
          }
        }
        return false;
      }}
      onOpenChange={setShow}
    >
      <div>
        <ProFormText
          required
          rules={[{ required: true, message: "请输入名称" }]}
          initialValue={""}
          width="xl"
          name="name"
          label="请输入名称"
          placeholder="请输入名称"
        />

        <ProFormRadio.Group
          name="type"
          label="媒体类型"
          required
          initialValue={true}
          options={[
            { label: "图片", value: 1 },
            { label: "视频", value: 2 },
          ]}
        />
        <ProFormText
          name="size"
          label="规格尺寸"
          required
          initialValue={'100*100'}
        />
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
      </div>
    </ModalForm>
  );
};

export default EditForm;
