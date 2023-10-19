import {
  ModalForm,
   ProFormInstance,
  ProFormRadio,
   ProFormText,
} from "@ant-design/pro-components";
import { message, } from "antd";
import { useMount, useSafeState, useUnmount } from "ahooks";
import Emittery from "emittery";
import { useCallback, useEffect, useRef, useState } from "react";
import "xgplayer/dist/index.min.css";
import { getCountryList } from "@/utils/country.ts";
import AgentApi from "@/api/agent.ts";
import AdvAPI from "@/api/advertiser.ts";
import MedialApi, { MediaEditDto } from "@/api/media.ts";
 
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
  const [, setAgents] = useSafeState<{ name: string; id: number }[]>([]);
  const [, setAdvertisers] = useState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const [advertisersList, setadvertisersList] = useState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const [selectedAgent, ] = useState<number | string>("");
  //   const [selectedMaterial, setselectedMaterial] = useSafeState<{ name: string; id: number }[]>([]);
  
  const [, setMediaslist] = useSafeState<
    { name: string; id: number }[]
  >([]); // 使用 useState 初始化为空数组

  useEffect(() => {
    loadAgentsRelation();
    loadAdvertisers("");
    loadMedias();
    if (selectedAgent) {
      const filteredAdvertisers = advertisersList.filter(
        (advertiser) => advertiser.agentId === selectedAgent
      );
      setAdvertisers(filteredAdvertisers);
      formRef.current?.setFieldsValue({
        advertiserId: "",
        adMaterialId: "",
      });
    } else {
      setAdvertisers([]);
    }
  }, [selectedAgent]);

  const loadAgentsRelation = useCallback(async () => {
    const agentList = await AgentApi.getAgentsList();
    setAgents(agentList);
  }, [setAgents]);

  const loadAdvertisers = useCallback(
    async (q: string) => {
      const filters: Record<string, (number | string | boolean)[] | null> = {};
      const orderBy: { [key: string]: "asc" | "desc" } = {};
      const res = await AdvAPI.getOptList({
        page: 1,
        limit: 1000,
        q: q ?? "",
        filters,
        orderBy,
        extra: {},
      });

      setadvertisersList(
        res.map((item) => {
          return {
            name: item.name,
            id: Number(item.id),
            agentId: Number(item.agentId),
          };
        })
      );
    },
    [setadvertisersList]
  );
  const loadMedias = useCallback(async () => {
    const res = await MedialApi.getMediasList();
    setMediaslist(
      res.map((item) => {
        return {
          name: item.name,
          id: Number(item.id),
        };
      })
    );
  }, [setMediaslist]);
 
  useMount(async () => {
    $emit.on("add", (val: bigint) => {
      setId(val);
      setMode("add");
      loadAgentsRelation();
      loadAdvertisers("");
      loadMedias();
      formRef.current?.resetFields();
      formRef.current?.setFieldsValue({
        name:"",
        enabled: "",
        adMaterialId: "",
        budget:"",
        mediaType: "",
        usedBudget: "",
        displayCount: "",
        clickCount: "",
        agent: "",
        advertiserId: "",
        medias: [],
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
    setMediaslist([])
    setShow(false);
  }, [setShow]);
  const loadInfo = useCallback(
    async (val: bigint) => {
      const data = await MedialApi.getInfo(val);

      setTimeout(() => {
        formRef.current?.setFieldsValue({
          name: data.name,
          enabled: data.enabled,
          
          type: data.type,
          
        });
      }, 500);
  
    },
    []
  );
  const update = useCallback(
    async (vId: bigint, data: MediaEditDto) => {
      await MedialApi.update(vId, data);
      message.success("更新成功");
      $emit.emit("reload");
      close();
    },
    [close]
  );
  const create = useCallback(
    async (data: MediaEditDto) => {
      console.log("create data", data);
      try {
        const res = await MedialApi.create(data);
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
      title={mode === "add" ? "新建媒体" : "编辑媒体"}
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
            { label: "网站", value: 1 },
            { label: "pc软件", value: 2 },
          ]}

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
