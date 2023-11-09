import {
  ModalForm,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { RadioChangeEvent, message } from "antd";
import { useMount, useSafeState, useUnmount } from "ahooks";
import Emittery from "emittery";
import { useCallback, useRef } from "react";
import "xgplayer/dist/index.min.css";
import { getCountryList } from "@/utils/country.ts";
import PositionlApi, { PositionEditDto } from "@/api/position";
import MedialApi, { MediaParams } from "@/api/media.ts";
import specApi from "@/api/spec.ts";

// eslint-disable-next-line react-refresh/only-export-components
export const $emit = new Emittery();
const positiveNumberPattern = /^(?:[1-9]\d*|0)(?:\.\d+)?$/;

const countriesMaps = new Map<string, string>();
getCountryList().forEach((item) => {
  countriesMaps.set(item.value, item.label);
});
const EditForm = () => {
  const [show, setShow] = useSafeState(false);
  const [id, setId] = useSafeState<bigint>(BigInt(0));
  const formRef = useRef<ProFormInstance>();
  const [mode, setMode] = useSafeState("add");
  const [mediaslist, setMediaslist] = useSafeState<
    { name: string; id: number }[]
  >([]);
  const [specslist, setSpecslist] = useSafeState<
    { name: string; id: number }[]
  >([]);
  //   const [selectedMaterial, setselectedMaterial] = useSafeState<{ name: string; id: number }[]>([]);
  const [mediasAlllist, setMediasAlllist] = useSafeState<
    { name: string; id: number }[]
  >([]); // 使用 useState 初始化为空数组

  const [, setPositionslist] = useSafeState<{ name: string; id: number }[]>([]); // 使用 useState 初始化为空数组
  const handletypeChange = (e: RadioChangeEvent) => {
    console.log("hand adverchange e,", e.target.value);
    if (e != null) {
      loadMedias(e.target.value);
      console.log("empty e", e);
    }
  };

  useMount(async () => {
    $emit.on("add", (val: bigint) => {
      setId(val);
      setMode("add");
      // loadAgentsRelation();
      // loadAdvertisers("");
      // loadPositions();
      loadMedias(0);
      loadSpec();

      formRef.current?.resetFields();
      formRef.current?.setFieldsValue({
        name: "",
        enabled: "",
        adSpecId: "",
        adMediaId: "",
        type: "",
        cpmPrice: "",
        positions: [],
      });
      // setId(BigInt(0));
      setShow(true);
    });
    $emit.on("update", (val: bigint) => {
      setMode("update");
      console.log("update id", val);
      setId(val);
      loadMedias(0);
      loadSpec();
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
    setPositionslist([]);
    setMediaslist([]);
    setSpecslist([]);
    setShow(false);
  }, [setShow, setMediaslist, setSpecslist, setPositionslist]);
  const loadInfo = useCallback(async (val: bigint) => {
    const data = await PositionlApi.getInfo(val);

    setTimeout(() => {
      formRef.current?.setFieldsValue({
        name: data.name,
        enabled: data.enabled,
        type: data.type,
        adSpecId: data.adSpec.id,
        adMediaId: data.adMedia.id,
        cpmPrice: data.cpmPrice / 100,
      });
    }, 500);

    loadMedias(data.type);
    // setMediaslist();
  }, []);
  const loadMedias = useCallback(
    async (q: number) => {
      const params: MediaParams = { type: q ?? 0 };
      const res = await MedialApi.postMediasList(params);
      console.log("res", res);
      setMediasAlllist(
        res.map((item) => {
          return {
            name: item.name,
            id: Number(item.id),
            type: Number(item.type),
          };
        })
      );
    },
    [setMediasAlllist]
  );
  const loadSpec = useCallback(async () => {
    const res = await specApi.getSpecsList();
    console.log("res", res);
    setSpecslist(
      res.map((item) => {
        return {
          name: item.name,
          id: Number(item.id),
        };
      })
    );
  }, [setSpecslist]);
  const update = useCallback(
    async (vId: bigint, data: PositionEditDto) => {
      await PositionlApi.update(vId, data);
      message.success("更新成功");
      $emit.emit("reload");
      close();
    },
    [close]
  );
  const create = useCallback(
    async (data: PositionEditDto) => {
      console.log("create data", data);
      try {
        const res = await PositionlApi.create(data);
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
      title={mode === "add" ? "新建广告位置" : "编辑广告位置"}
      open={show}
      onFinish={async () => {
        if (formRef.current) {
          const data = await formRef.current.validateFields();
          // data.avatar = avatar;
          data.cpmPrice = data.cpmPrice * 100; //存储为分

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
            { label: "网站", value: 1 },
            { label: "pc软件", value: 2 },
          ]}
          fieldProps={{
            onChange: handletypeChange, // 直接传递选中的值
          }}
        />

        <ProFormSelect
          name="adMediaId"
          label="媒体"
          required
          initialValue={mediaslist.map((val) => val.id)} // 设置初始选中的媒体的 id 组成的数组
          options={mediasAlllist.map((val) => ({
            label: val.name,
            value: val.id,
          }))}
        />

        <ProFormSelect
          name="adSpecId"
          label="规格"
          required
          initialValue={""} // 设置初始选中的规格的 id 组成的数组
          options={specslist.map((val) => ({
            label: val.name,
            value: val.id,
          }))}
          // options={[
          //   { label: "网站", value: 1 },
          //   { label: "pc软件", value: 2 },
          // ]}
        />
        <ProFormText
          required
          rules={[
            { required: true, message: "千次展现价格" },
            {
              pattern: positiveNumberPattern,
              message: "千次展现价格必须为正数",
            },
          ]}
          initialValue={""}
          width="xl"
          name="cpmPrice"
          label="千次展现价格(元)"
          placeholder="请输入"
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
