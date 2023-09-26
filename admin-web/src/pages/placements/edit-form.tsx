import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Image, message, RadioChangeEvent, UploadFile } from "antd";
import { useMount, useSafeState, useUnmount } from "ahooks";
import Emittery from "emittery";
import { useCallback, useEffect, useRef, useState } from "react";
import "xgplayer/dist/index.min.css";
import { getCountryList } from "@/utils/country.ts";
import { MaterialEditDto } from "@/api/material";
import MaterialApi from "@/api/material.ts";
import AgentApi from "@/api/agent.ts";
import AdvAPI from "@/api/advertiser.ts";
import error from "xgplayer/es/error";
import MedialApi from "@/api/media.ts";
import PlacementApi, { PlacementEditDto } from "@/api/placement.ts";

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
  const [agents, setAgents] = useSafeState<{ name: string; id: number }[]>([]);
  const [advertisers, setAdvertisers] = useState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const [advertisersList, setadvertisersList] = useState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const [selectedAgent, setSelectedAgent] = useState<number | string>("");
  //   const [selectedMaterial, setselectedMaterial] = useSafeState<{ name: string; id: number }[]>([]);
  const [materials, setMaterials] = useSafeState<
    { name: string; id: number }[]
  >([]); // 使用 useState 初始化为空数组
  const [mediaslist, setMediaslist] = useSafeState<
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

  const handleAdvertiserChange = (e) => {
    setSelectedAgent;
    console.log("hand adverchange e,", e);
    if (e != null) {
      loadMaterials(e);
    }
  };
 
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
  const loadMaterials = useCallback(
    async (q: string) => {
      try {
        const filters: Record<string, (number | string | boolean)[] | null> =
          {};
        const orderBy: { [key: string]: "asc" | "desc" } = {};
        // console.log("materials load q", q);
        const res = await MaterialApi.getOptList({
          page: 1,
          limit: 1000,
          q: q ?? "",
          filters,
          orderBy,
          extra: {},
        });

        setMaterials(
          res.data.map((item) => {
            return {
              name: item.name,
              id: Number(item.id),
            };
          }) || []
        );
      } catch {
        console.error("An error occurred:", error);
      }
    },
    [setMaterials]
  );
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
      // console.log("update id", val);
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
      const data = await PlacementApi.getInfo(val);

      setTimeout(() => {
        formRef.current?.setFieldsValue({
          name: data.name,
          enabled: data.enabled,
          adMaterialId: data.adMaterialId,
          budget: data.budget,
          mediaType: data.mediaType,
          startedAt: data.startedAt,
          endedAt: data.endedAt,
          usedBudget: data.usedBudget,
          displayCount: data.displayCount,
          clickCount: data.clickCount,
          agent: data.advertiser.user.id,
          advertiserId: data.advertiser.id,
          medias: data.adMediaRelations.map((val) => val.mediaId),
        });
      }, 500);
      setMaterials([
        { id: Number(data.adMaterialId), name: data.adMaterial.name },
      ]);
      setMediaslist(
        data.adMediaRelations.map((val) => ({
          name: val.mediaName,
          id: val.mediaId,
        })) || []
      );
      setAgents([
        { name: data.advertiser.user.nickname, id: data.advertiser.user.id },
      ]);
      setAdvertisers([
        {
          id: data.advertiser.id,
          name: data.advertiser.companyName,
          agentId: data.advertiser.user.id,
        },
      ]);
    },
    [setAgents, setAdvertisers, setMediaslist]
  );
  const update = useCallback(
    async (vId: bigint, data: PlacementEditDto) => {
      await PlacementApi.update(vId, data);
      message.success("更新成功");
      $emit.emit("reload");
      close();
    },
    [close]
  );
  const create = useCallback(
    async (data: PlacementEditDto) => {
      // console.log("create data", data);
      try {
        const res = await PlacementApi.create(data);
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
      title={mode === "add" ? "新建投放计划" : "编辑投放计划"}
      open={show}
      onFinish={async () => {
        if (formRef.current) {
          const data = await formRef.current.validateFields();
          // data.avatar = avatar;

          // console.log("validateFields data", data);
          if (mode === "add") {
            // data.role = role;

            await create(data);
          }
          if (mode === "update") {
            // console.log("update data", data);

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
          rules={[{ required: true, message: "请输入计划名称" }]}
          initialValue={""}
          width="xl"
          name="name"
          label="请输入计划名称"
          placeholder="请输入计划名称"
        />
        <ProFormSelect
          required
          rules={[{ required: true, message: "选择代理商" }]}
          initialValue=""
          width="xl"
          name="agent"
          label="选择代理商"
          placeholder="选择代理商"
          options={agents.map((agent) => ({
            label: agent.name,
            value: agent.id,
          }))}
          fieldProps={{
            onChange: setSelectedAgent,
          }}
        />
        <ProFormSelect
          required
          rules={[{ required: true, message: "选择广告主" }]}
          initialValue=""
          width="xl"
          name="advertiserId"
          label="选择广告主"
          placeholder="选择广告主"
          options={advertisers.map(
            (advertiser: { name: string; id: number }) => ({
              label: advertiser.name,
              value: advertiser.id,
            })
          )}
          fieldProps={{
            onChange: handleAdvertiserChange, // 直接传递选中的值
          }}
        />
        <ProFormSelect
          required
          rules={[{ required: true, message: "选择广告创意" }]}
          initialValue={""}
          width="xl"
          name="adMaterialId"
          label="选择广告创意"
          placeholder="选择广告创意"
          options={materials.map((material) => ({
            label: material.name,
            value: material.id,
          }))}
          // fieldProps={{
          //   onChange: handleMaterialChange,
          // }}
        />
        <ProFormDigit
          name="budget"
          label="预算"
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
                if (value < 1 || value === null) {
                  throw new Error("预算必须大于等于1元");
                }
              },
            },
          ]}
        />
        <ProFormSelect
          name="medias"
          label="选择投放媒体(多选)"
          options={mediaslist.map((val) => ({
            label: val.name,
            value: val.id,
          }))}
          fieldProps={{
            mode: "multiple",
          }}
          placeholder="选择投放媒体"
          rules={[
            {
              required: true,
              message: "选择投放媒体!",
              type: "array",
            },
          ]}
        />
        <div style={{ display: "flex", alignItems: "center" }}>
          <ProFormDateTimePicker
            name="startedAt"
            label="开始投放时间"
            fieldProps={{
              format: (value) => value.format("YYYY-MM-DD hh:mm:ss"),
            }}
          />
          <span style={{ margin: "0 8px" }}>-</span>
          <ProFormDateTimePicker
            name="endedAt"
            label="结束投放时间"
            fieldProps={{
              format: (value) => value.format("YYYY-MM-DD  hh:mm:ss"),
            }}
          />
        </div>
      </div>
    </ModalForm>
  );
};

export default EditForm;