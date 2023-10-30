import {
  ModalForm,
  ProForm,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { Button, message, RadioChangeEvent, Upload, UploadFile } from "antd";
import { useMount, useSafeState, useUnmount } from "ahooks";
import Emittery from "emittery";
import { useCallback, useEffect, useRef, useState } from "react";
import "xgplayer/dist/index.min.css";
import { getCountryList } from "@/utils/country.ts";
import { MaterialEditDto } from "@/api/material";
import MaterialApi from "@/api/material.ts";
import AgentApi from "@/api/agent.ts";
import AdvAPI from "@/api/advertiser.ts";
import { CloudUploadOutlined } from "@ant-design/icons";
import { getImgUrl, removeImgUrl } from "@/utils/file";
import { RcFile } from "antd/es/upload";
import FileApi from "@/api/file.ts";
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
  const [materialurl, setMaterialurl] = useSafeState(""); //http://static-edu-test.leleshuju.com/
  const [fileList, setFileList] = useSafeState<UploadFile[]>([]);
  const [mode, setMode] = useSafeState("add");
  const [positionOptions, setPositionOptions] = useState([
    { label: "列表页", value: 1 },
    { label: "详情页", value: 2 },
    { label: "侧边栏", value: 3 },
  ]);
  const [agents, setAgents] = useSafeState<{ name: string; id: number }[]>([]);
  const [advertisers, setAdvertisers] = useState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const [advertisersList, setadvertisersList] = useState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const [selectedAgent, setSelectedAgent] = useState<number | string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleMediaTypeChange = (e: RadioChangeEvent) => {
    if (e.target.value === 2) {
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
  };

  useEffect(() => {
    loadAgentsRelation();
    loadAdvertisers("");

    if (selectedAgent) {
      const filteredAdvertisers = advertisersList.filter(
        (advertiser) => advertiser.agentId === selectedAgent
      );
      setAdvertisers(filteredAdvertisers);
      formRef.current?.setFieldsValue({
        advertiserId: "",
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
  useMount(async () => {
    $emit.on("add", (val: bigint) => {
      setId(val);
      loadAgentsRelation();
      loadAdvertisers("");
      setMode("add");
      setMaterialurl("");

      formRef.current?.resetFields();
      formRef.current?.setFieldsValue({
        name: "",
        mediaType: "",
        content: "",
        agent: "",
        advertiser: "",
        position: "",
        url: "",
        jumpurl: "",
      });
      // setId(BigInt(0));
      setShow(true);
    });
    $emit.on("update", (val: bigint) => {
      setMode("update");

      setId(val);
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
  const loadInfo = useCallback(
    async (val: bigint) => {
      const data = await MaterialApi.getInfo(val);
      console.log("material load data", data);
      setTimeout(() => {
        formRef.current?.setFieldsValue({
          name: data.name,
          mediaType: data.mediaType,
          content: data.content,
          contentType: data.contentType,
          enabled: data.enabled,
          agent: data.advertiser.user.id,
          advertiserId: data.advertiser.id,
          position: data.position,
          materialurl: data.url,
          jumpurl: data.jumpurl,
        });
      }, 500);
      setMaterialurl(data.url);
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

      if (data.mediaType == 2) {
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
    [setAgents, setAdvertisers]
  );
  const customRequest = useCallback(
    async (file: RcFile) => {
      setFileList([
        {
          uid: file.uid,
          name: file.name,
          originFileObj: file,
          status: "uploading",
        },
      ]);
      try {
        setIsUploading(true);

        // const res = await FileApi.uploadLocal(file);
        const res = await FileApi.uploadcloud(file);

        setTimeout(() => {
          setMaterialurl(res.fileurl);
        }, 1000);
      } catch (e) {
        setFileList([]);
        setMaterialurl("");
        console.log(e);
        message.error("上传失败");
      } finally {
        setTimeout(() => {
          setIsUploading(false);
        }, 1500);
      }
    },
    [setFileList, setMaterialurl]
  );
  const update = useCallback(
    async (vId: bigint, data: MaterialEditDto) => {
      await MaterialApi.update(vId, data);
      message.success("更新成功");
      $emit.emit("reload");
      close();
    },
    [close]
  );
  const create = useCallback(
    async (data: MaterialEditDto) => {
      console.log("create data", data);
      try {
        const res = await MaterialApi.create(data);
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
      title={mode === "add" ? "新建创意素材" : "编辑创意素材"}
      open={show}
      onFinish={async () => {
        if (formRef.current) {
          const data = await formRef.current.validateFields();
          // data.avatar = avatar;
          data.url = removeImgUrl(materialurl);

          // console.log("validateFields data", data);
          if (mode === "add") {
            // data.role = role;

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
        <ProFormText
          required
          rules={[{ required: true, message: "请输入广告创意名称" }]}
          initialValue={""}
          width="xl"
          name="name"
          label="广告创意名称"
          placeholder="请输入广告创意名称"
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
        />

        <ProFormRadio.Group
          name="contentType"
          label="类型"
          required
          initialValue={true}
          options={[{ label: "图片", value: 1 }]}
          fieldProps={{
            onChange: handleMediaTypeChange,
          }}
        />
        <ProFormRadio.Group
          name="mediaType"
          label="媒体类型"
          required
          initialValue={true}
          options={[
            { label: "网站", value: 1 },
            { label: "pc软件", value: 2 },
          ]}
          fieldProps={{
            onChange: handleMediaTypeChange,
          }}
        />
        <ProFormRadio.Group
          name="position"
          label="广告位置"
          required
          initialValue={true}
          options={positionOptions}
        />
        <ProFormText
          required
          rules={[{ required: true, message: "请输入广告内容" }]}
          initialValue={""}
          width="xl"
          name="content"
          label="广告内容"
          placeholder="请输入广告内容"
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
        <ProFormText
          required
          rules={[{ required: true, message: "请输入素材跳转地址" }]}
          initialValue={""}
          width="xl"
          name="jumpurl"
          label="素材跳转地址"
          placeholder="请输入素材跳转地址"
        />
        <ProForm.Group>
          <ProForm.Item label="上传素材">
            {materialurl != "" ? (
              <img
                className="w-200px h-200px mr-1rem"
                src={getImgUrl(materialurl)}
                alt=""
              />
            ) : null}
            <Upload
              name="materialurl"
              accept="image/*, .svg, .png, .jpg, .jpeg"
              maxCount={1}
              showUploadList={false}
              onChange={(info) => {
                setFileList(info.fileList);
              }}
              onRemove={() => {
                setFileList([]);
                setMaterialurl("");
              }}
              fileList={fileList}
              customRequest={({ file }) => customRequest(file as RcFile)}
            >
              <Button loading={isUploading} icon={<CloudUploadOutlined />}>
                上传
              </Button>
            </Upload>
          </ProForm.Item>
        </ProForm.Group>
      </div>
    </ModalForm>
  );
};

export default EditForm;
