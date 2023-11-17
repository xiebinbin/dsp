import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, Checkbox, Form, Space, TimePicker, message } from "antd";
import { useMount, useSafeState, useUnmount } from "ahooks";
import Emittery from "emittery";
import { useCallback, useEffect, useRef, useState } from "react";
import "xgplayer/dist/index.min.css";
import { getCountryList } from "@/utils/country.ts";
import MaterialApi from "@/api/material.ts";
import AgentApi from "@/api/agent.ts";
import AdvAPI from "@/api/advertiser.ts";
import error from "xgplayer/es/error";
import MedialApi from "@/api/media.ts";
import PlacementApi, { PlacementEditDto } from "@/api/placement.ts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);
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
  const [materials, setMaterials] = useSafeState<
    { name: string; id: number }[]
  >([]); // 使用 useState 初始化为空数组
  const [mediaslist, setMediaslist] = useSafeState<
    { name: string; id: number }[]
  >([]); // 使用 useState 初始化为空数组
  const [mediasAlllist, setMediasAlllist] = useSafeState<
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

  const handleAdvertiserChange = (e: string | null) => {
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
    const res = await MedialApi.postMediasList();
    console.log("res", res);
    setMediasAlllist(
      res.map((item) => {
        return {
          name: item.name,
          id: Number(item.id),
        };
      })
    );
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
        name: "",
        enabled: "",
        adMaterialId: "",
        budget: "",
        mediaType: "",
        usedBudget: "",
        cpmPrice: 30,
        displayCount: "",
        clickCount: "",
        agent: "",
        advertiserId: "",
        medias: [],
        timerange: [],
      });
      setShow(true);
    });
    $emit.on("update", (val: bigint) => {
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
    $emit.clearListeners();
  });
  const close = useCallback(() => {
    setMediaslist([]);
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
          budget: Number(data.budget) / 100,
          cpmPrice: data.cpmPrice / 100,
          mediaType: data.mediaType,
          startedAt: data.startedAt,
          endedAt: data.endedAt,
          usedBudget: Number(data.usedBudget) / 100,
          displayCount: data.displayCount,
          clickCount: data.clickCount,
          agent: data.advertiser.user.id,
          advertiserId: data.advertiser.id,
          medias: data.adMediaRelations.map((val) => val.mediaId),
          timerange: [],
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
      console.log("mediaslist", mediaslist);

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
      try {
        const res = await PlacementApi.create(data);
        if (!res) {
          window.Message.error("新建失败，请重试");
        } else {
          window.Message.success("新建成功");
          formRef.current?.resetFields();
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

          data.startedAt = dayjs(data.startedAt)
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm:ss");
          data.endedAt = dayjs(data.endedAt)
            .utcOffset(8)
            .format("YYYY-MM-DD HH:mm:ss");
          data.budget = Math.round(data.budget * 100); //转换成分
          data.medias = data.medias.map(Number); // 将媒体 id 转换为数字
          console.log("placement data", data);
          if (mode === "add") {
            await create(data);
          }
          if (mode === "update") {
            await update(id, data);
          }
        }
        return false;
      }}
      onOpenChange={setShow}
    >
      <div>
        <ProFormSelect
          required
          disabled={mode == "update"}
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
          disabled={mode == "update"}
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
          disabled={mode == "update"}
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
        <ProFormDigit
          name="cpmPrice"
          label="cpm"
          required
          width="md"
          fieldProps={{
            type: "number",
            precision: 0,
          }}
          rules={[
            {
              validator: async (_, value) => {
                if (!Number.isInteger(value)) {
                  throw new Error("预算必须为正整数");
                }
              },
            },
          ]}
        />
        <ProFormText
          name="medias"
          label="选择投放媒体(多选)"
          initialValue={mediaslist.map((val) => val.id)} // 设置初始选中的媒体的 id 组成的数组
          rules={[
            {
              required: true,
              message: "选择投放媒体!",
              type: "array",
            },
          ]}
        >
          <Checkbox.Group
            options={mediasAlllist.map((val) => ({
              label: val.name,
              value: val.id,
            }))}
          />
        </ProFormText>

        <div style={{ display: "flex", alignItems: "center" }}>
          <ProFormDateTimePicker
            name="startedAt"
            label="开始投放时间"
            fieldProps={{
              format: (value) => value.format("YYYY-MM-DD HH:mm:ss"),
            }}
          />
          <span style={{ margin: "0 8px" }}>-</span>
          <ProFormDateTimePicker
            name="endedAt"
            label="结束投放时间"
            fieldProps={{
              format: (value) => value.format("YYYY-MM-DD HH:mm:ss"),
            }}
          />
        </div>
        <Form.List name="timerange">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "range"]}
                    label="选择时间段"
                  >
                    <TimePicker.RangePicker
                      format="HH:mm:ss"
                      defaultValue={[
                        dayjs("00:00:00", "HH:mm:ss"),
                        dayjs("23:59:59", "HH:mm:ss"),
                      ]}
                    />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                >
                  添加时间段
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <ProFormText
          initialValue={""}
          width="xl"
          name="name"
          label="计划备注"
          placeholder="请输入计划备注"
        />
      </div>
    </ModalForm>
  );
};

export default EditForm;
