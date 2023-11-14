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
import PositionApi from "@/api/position.ts";
import { AdpositionOpt } from "@/shims";
import specApi, { } from "@/api/spec.ts";
import MedialApi, { MediaParams } from "@/api/media.ts";

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
  // const [positionOptionsPC, setPositionOptionsPC] = useSafeState<
  //   { label: string; value: number }[]
  // >([]);
  // const [positionOptionsSoft, setPositionOptionsSoft] = useSafeState<
  //   { label: string; value: number }[]
  // >([]);
  // const [positionOptions, setPositionOptions] = useSafeState<
  //   { label: string; value: number }[]
  // >([]);
  const [specOptions, setspecOptions] = useSafeState<
    { label: string; value: number }[]
  >([]);
  const [positionOptionsAll, setPositionOptionsAll] = useState<
    { label: string; value: number }[]
  >([]);
  const [positionInfo1, setPositionInfo1] = useState<AdpositionOpt[]>([]); //用于存储位置信息
  const [positionInfo2, setPositionInfo2] = useState<AdpositionOpt[]>([]); //用于存储位置信息
  const [positionInfo3, setPositionInfo3] = useState<AdpositionOpt[]>([]); //用于存储位置信息

  const [agents, setAgents] = useSafeState<{ name: string; id: number }[]>([]);
  const [advertisers, setAdvertisers] = useState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const [advertisersList, setadvertisersList] = useState<
    { id: number; name: string; agentId: number }[]
  >([]);
  const [selectedAgent, setSelectedAgent] = useState<number | string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [mediasAlllist, setMediasAlllist] = useSafeState<
    { name: string; id: number }[]
  >([]);
  const [mediaInfo1, setMediaInfo1] = useSafeState<{ id: number }[]>([]);
  const [mediaInfo2, setMediaInfo2] = useSafeState<{ id: number }[]>([]);

  // const handleAgentChange = (e: string | null) => {
  //   console.log(e);
  //   formRef.current?.setFieldsValue({
  //     advertiserId: "",
  //   });
  //    loadAgentsRelation();
  //   // loadAdvertisers("");
  //   setSelectedAgent
  // };

  const handleMediaTypeChange = (e: RadioChangeEvent) => {
    const param = { mediatype: Number(e.target.value) };
    formRef.current?.setFieldsValue({
      mediaId: "",
      positionId: "",
    });

    setMediasAlllist([]);
    loadMedias(0);
    loadPositionsOpt(param);
  };
  const handleMediaChange = (e: string | null) => {
    const param = { mediaid: Number(e) };
    formRef.current?.setFieldsValue({
      positionId: "",
    });
    loadPositionsOpt(param);
  };
  const handleContentTypeChange = (e: RadioChangeEvent) => {
    console.log("handleContentTypeChange");
    loadSpecOpt(e.target.value);
  };

  const handleSpecChange = (e: string | null) => {
    console.log("specchange", e);
    formRef.current?.setFieldsValue({
      mediaId: "",
      positionId: "",
    });
    const param = { specid: Number(e) };
    setMediasAlllist([]);
    loadMedias(0);
    setPositionOptionsAll([]);
    setPositionInfo1([]);
    setPositionInfo2([]);
    setPositionInfo3([]);
    loadPositionsOpt(param);
  };

  useEffect(() => {
    console.log("useEffect");

    // 加载相关数据
    loadAgentsRelation();
    loadAdvertisers("");
    loadSpecOpt();
    // loadMedias(0);

    // 处理广告主
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

    const positionInfoArrays = [positionInfo1, positionInfo2, positionInfo3];

    const conditions = positionInfoArrays.filter((info) => info.length > 0);

    if (conditions.length > 0) {
      const intersectionOptions = conditions.reduce(
        (acc, current) => getPostionInner(acc, current),
        conditions[0]
      );

      console.log("useEffect positionInfo", intersectionOptions);

      // 设置位置选项
      setPositionOptionsAll(
        intersectionOptions.map((opt) => ({
          label: opt.name,
          value: opt.id,
        }))
      );

      console.log("effect mediasAlllist", mediasAlllist);

      // }
    }
    console.log("media1", mediaInfo1);
    console.log("media2", mediaInfo2);

    const uniqueMediaInfo1 = Array.from(
      new Set(mediaInfo1.map((item) => item.id))
    ).map((id) => ({ id }));
    const uniqueMediaInfo2 = Array.from(
      new Set(mediaInfo2.map((item) => item.id))
    ).map((id) => ({ id }));

    const mediaInfoArrays = [uniqueMediaInfo1, uniqueMediaInfo2];
    const mediaConditions = mediaInfoArrays.filter((info) => info.length > 0);

    if (mediaConditions.length > 0) {
      let mediaOptions: { id: number }[] = [];

      if (mediaConditions.length === 1) {
        console.log("medicon=1", mediaConditions);

        mediaOptions = mediaConditions[0];
      } else {
        console.log("medicon else", mediaConditions);

        mediaOptions = mediaConditions.reduce(
          (acc, current) => getMediaInner(acc, current),
          mediaConditions[0]
        );
      }

      const filteredMedias = mediasAlllist.filter((media) =>
        mediaOptions.some((option) => option.id === media.id)
      );
      console.log("filteredMedias", filteredMedias);

      setMediasAlllist(filteredMedias);
    }
  }, [
    selectedAgent,
    positionInfo1,
    positionInfo2,
    positionInfo3,
    mediaInfo1,
    mediaInfo2,
    setPositionOptionsAll,
  ]);

  const getPostionInner = (
    arr1: AdpositionOpt[],
    arr2: AdpositionOpt[]
  ): AdpositionOpt[] => {
    return arr1.filter((item1) => arr2.some((item2) => item1.id === item2.id));
  };
  const getMediaInner = (
    arr1: { id: number }[],
    arr2: { id: number }[]
  ): { id: number }[] => {
    return arr1.filter((item1) => arr2.some((item2) => item1.id === item2.id));
  };
  const loadMedias = useCallback(
    async (q: number) => {
      const params: MediaParams = { type: q ?? 0 };
      const res = await MedialApi.postMediasList(params);
      console.log("loadMedias res", res);
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

    // return positionOpt.map((opt) => ({
    //   label: opt.name,
    //   value: opt.id,
    //   type: opt.type,
    // }));
  }, []);
  const loadPositionsOpt = useCallback(
    async (param?: {
      specid?: number;
      mediatype?: number;
      mediaid?: number;
    }) => {
      const positionOpt: AdpositionOpt[] = await PositionApi.getPositionsList();

      if (param) {
        const filteredOptions = positionOpt.filter((opt) => {
          if (param.specid && param.mediatype) {
            return (
              opt.adSpecId === param.specid && opt.type === param.mediatype
            );
          } else if (param.specid) {
            return opt.adSpecId === param.specid;
          } else if (param.mediatype) {
            return opt.type === param.mediatype;
          } else if (param.mediaid) {
            return opt.adMediaId === param.mediaid;
          }
          return true; // 如果没有任何筛选条件，返回全部选项
        });
        if (param.specid) {
          const op = filteredOptions.map((opt) => ({
            label: opt.name,
            value: opt.id,
          }));
          setPositionInfo1(filteredOptions);
          setMediaInfo1(
            filteredOptions.map((opt) => ({
              id: opt.adMediaId,
            }))
          );
          setPositionOptionsAll(op);
        } else if (param.mediatype) {
          console.log(" else if(param.mediatype)", filteredOptions);
          setPositionInfo2(filteredOptions);
          setMediaInfo2(
            filteredOptions.map((opt) => ({
              id: opt.adMediaId,
            }))
          );
          setPositionOptionsAll(
            filteredOptions.map((opt) => ({
              label: opt.name,
              value: opt.id,
            }))
          );
        } else if (param.mediaid) {
          console.log(" else if(param.mediaid)", filteredOptions);
          setPositionInfo3(filteredOptions);
          setPositionOptionsAll(
            filteredOptions.map((opt) => ({
              label: opt.name,
              value: opt.id,
            }))
          );
        }
      } else {
        // console.log("loadPositionsOpt else");
        // setPositionInfo1(positionOpt);
        // setPositionInfo2(positionOpt);
        setPositionOptionsAll(
          positionOpt.map((opt) => ({
            label: opt.name,
            value: opt.id,
          }))
        );
      }
    },
    [setMediaInfo1, setMediaInfo2]
  );
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
        positionId: "",
        mediaId: "",
        url: "",
        spec: "",
        jumpUrl: "",
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

    setPositionOptionsAll([]);
  }, [setShow]);
  const loadInfo = useCallback(async (val: bigint) => {
    const data = await MaterialApi.getInfo(val);
    console.log("material load data", data);
    // console.log("positions",positions)
    setTimeout(() => {
      formRef.current?.setFieldsValue({
        name: data.name,
        mediaType: data.adPosition.type,
        content: data.content,
        contentType: data.contentType,
        enabled: data.enabled,
        agent: data.advertiser.user.id,
        advertiserId: data.advertiser.id,
        positionId: data.adPosition.id,
        materialurl: data.url,
        mediaId: data.adPosition.adMedia.id,
        jumpUrl: data.jumpUrl,
        specId: data.adPosition.adSpec.id,
      });
      loadPositionsOpt();
      loadMedias(0);
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
    // if (data.adPosition.type == 2) {
    //   // setPositionOptions(positionOptionsSoft);
    //   setPositionOptionsAll(positionOptionsSoft);
    // } else {
    //   // setPositionOptions(positionOptionsPC);
    //   setPositionOptionsAll(positionOptionsPC);
    // }
    // console.log("soft pc", positionOptionsSoft, positionOptionsPC);
    // loadPositionsOpt();
  }, []);
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

          console.log("material data", data);
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
          options={[
            { label: "图片", value: 1 },
            { label: "视频", value: 2 },
          ]}
          fieldProps={{
            onChange: handleContentTypeChange,
          }}
        />
        <ProFormSelect
          name="specId"
          label="广告规格"
          required
          initialValue={true}
          options={specOptions}
          fieldProps={{
            onChange: handleSpecChange,
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
        <ProFormSelect
          name="mediaId"
          label="媒体"
          required
          initialValue={true}
          options={mediasAlllist.map(
            (medias: { name: string; id: number }) => ({
              label: medias.name,
              value: medias.id,
            })
          )}
          fieldProps={{
            onChange: handleMediaChange,
          }}
        />
        <ProFormSelect
          name="positionId"
          label="广告位置"
          required
          initialValue={positionOptionsAll.map((val) => val.value)}
          options={positionOptionsAll.map((val) => ({
            label: val.label,
            value: val.value,
          }))}
        />
        <ProFormText
          required
          rules={[{ required: true, message: "请输入广告创意名称" }]}
          initialValue={""}
          width="xl"
          name="name"
          label="广告创意名称"
          placeholder="请输入广告创意名称"
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
          // required
          // rules={[{ required: true, message: "请输入素材跳转地址" }]}
          initialValue={""}
          width="xl"
          name="jumpUrl"
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
