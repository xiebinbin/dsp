import {
    ModalForm,
    ProCard,
    ProForm,
    ProFormDigit,
    ProFormDigitRange,
    ProFormInstance,
    ProFormList,
    ProFormRadio,
    ProFormSelect,
    ProFormText,
    ProFormUploadDragger,
} from '@ant-design/pro-components';
import {Button, Image, message, UploadFile} from 'antd';
import {useMount, useSafeState, useUnmount} from "ahooks";
import UserApi from "@/api/user";
import VideoApi, {VideoEditDto} from "@/api/video.ts";
import FileApi from "@/api/file.ts";
import Emittery from 'emittery';
import {useCallback, useRef} from "react";
import {RcFile} from "antd/es/upload";
import {Video} from "@/shims";
import Player from 'xgplayer';
import HlsPlugin from 'xgplayer-hls'
import 'xgplayer/dist/index.min.css';
import {getCountryList} from "@/utils/country.ts";
import {getLangList} from "@/utils/lang.ts";
import {loadTags} from "@/utils/form-tool.ts";
// eslint-disable-next-line react-refresh/only-export-components
export const $emit = new Emittery();
const langMap = new Map<string, string>();
Object.entries(getLangList()).forEach(([key, value]) => {
    langMap.set(key, value);
});
const countriesMaps = new Map<string, string>();
getCountryList().forEach((item) => {
    countriesMaps.set(item.value, item.label);
});
const EditForm = () => {
    const [show, setShow] = useSafeState(false);
    const [id, setId] = useSafeState<bigint>(BigInt(0));
    const formRef = useRef<ProFormInstance>();
    const [video, setVideo] = useSafeState<Video>();
    const [tags, setTags] = useSafeState<{ label: string, value: number }[]>([]);
    const [users, setUsers] = useSafeState<{ label: string, value: bigint }[]>([]);
    const [defaultFileList, setDefaultFileList] = useSafeState<UploadFile[]>([]);
    const loadUsers = useCallback(async (q: string, ids: number[] = []) => {
        const extra: Record<string, boolean | string> = {
            role: 'CREATOR'
        }
        if (q === '' && ids.length == 0) {
            extra.enabled = true;
        }
        const filters: Record<string, (number | string | boolean)[] | null> = {}
        if (ids.length > 0) {
            filters.id = ids;
        }
        const res = await UserApi.getList({
            q,
            page: 1,
            limit: 100,
            extra,
            filters
        });
        setUsers(res.data.map((item) => {
            return {
                label: item.name,
                value: item.id
            }
        }));
    }, [setUsers]);
    const player = useRef<Player>();
    const playerEl = useRef<HTMLDivElement>();
    useMount(async () => {
        $emit.on('update', (val: bigint) => {
            setId(val);
            setDefaultFileList([])
            loadInfo(val).then(() => {
                setShow(true);
            }).catch(() => {
                message.error('加载失败');
            });
        });
        setTags(await loadTags(''));
    });
    useUnmount(() => {
        $emit.clearListeners();
        player.current?.destroy()
    });
    const close = useCallback(() => {
        setShow(false);
        player.current?.destroy()
    }, [setShow])
    const loadInfo = useCallback(async (val: bigint) => {
        const data = await VideoApi.getInfo(val);
        const defaultFile: UploadFile = {
            uid: data.cover,
            name: data.cover,
            url: "https://file.acg.fans/" + data.cover,
            thumbUrl: "https://file.acg.fans/" + data.cover,
            status: "success",
        }
        data.tags = data.tags.filter((item) => item > 0n);
        if (data.tags.length > 0) {
            const items = await loadTags('', data.tags.map((item) => Number(item)));
            setTags(items);
        }
        if (data.userId) {
            await loadUsers('', [Number(data.userId)]);
        }
        setDefaultFileList([defaultFile]);
        formRef.current?.resetFields();
        setTimeout(() => {
            formRef.current?.setFieldsValue({
                title: data.title,
                tags: data.tags.map((v) => Number(v)),
                lang: data.lang,
                denyCountries: data.denyCountries,
                cover: [defaultFile],
                country: data.country,
                level: data.level.toString(),
                sortWeight: data.sortWeight.toString(),
                enabled: data.enabled,
                previewBlocks: data.previewBlocks.map((item) => {
                    return {
                        data: item
                    }
                }),
                virtualPlayNumber: data.virtualPlayNumber.toString(),
                locales: data.locales,
                userId: data.userId,
                screen: data.screen,
                price: data.price.toString(),
                priceMode: data.priceMode,
            });
        }, 1000)

        setVideo(data);
        if (playerEl.current) {
            if (player.current) {
                player.current.destroy();
            }
            player.current = new Player({
                el: playerEl.current,
                url: "https://p-2yqscq.gfyrchj.com/" + data.m3u8File,
                width: '100%',
                autoplay: false,
                videoInit: false,
                crossOrigin: 'anonymous',
                plugins: [HlsPlugin],
            });
        } else {
            setTimeout(() => {
                if (player.current) {
                    player.current.destroy();
                }
                player.current = new Player({
                    el: playerEl.current,
                    autoplay: false,
                    videoInit: false,
                    url: "https://p-2yqscq.gfyrchj.com/" + data.m3u8File,
                    width: '100%',
                    crossOrigin: 'anonymous',
                    plugins: [HlsPlugin],
                });
            }, 2000);
        }

    }, [loadTags, loadUsers, setDefaultFileList, setVideo]);
    const update = useCallback(async (vId: bigint, data: VideoEditDto) => {
        await VideoApi.update(vId, data);
        message.success('更新成功');
        $emit.emit('reload');
        close()
    }, [close]);
    const customRequest = useCallback((file: RcFile) => {
        setDefaultFileList([{
            uid: file.uid,
            name: file.name,
            originFileObj: file,
            status: "uploading",
        }])
        formRef.current?.setFieldsValue({
            cover: []
        });
        FileApi.upload(file).then((key) => {
            const uploadFile: UploadFile = {
                uid: file.uid,
                name: key,
                url: "https://file.acg.fans/" + key,
                thumbUrl: "https://file.acg.fans/" + key,
                status: "success",
            }
            setDefaultFileList([uploadFile]);
            formRef.current?.setFieldsValue({
                cover: [uploadFile]
            });
        }).catch(() => {
            const uploadFile: UploadFile = {
                uid: file.uid,
                name: file.name,
                status: "error",
                originFileObj: file,
            }
            setDefaultFileList([uploadFile]);
            window.Message.error('上传失败');
        });
    }, [setDefaultFileList]);
    return (
        <ModalForm
            formRef={formRef}
            title={'编辑视频'}
            open={show}
            onFinish={async () => {
                if (formRef.current && formRef.current.validateFieldsReturnFormatValue) {
                    const data = await formRef.current?.validateFieldsReturnFormatValue();
                    data.previewBlocks = data?.previewBlocks ?? [];
                    data.previewBlocks = data.previewBlocks.map((item: { data: number[] }) => {
                        return item.data;
                    });
                    await update(id, data);
                }

                return false;
            }}
            onOpenChange={setShow}
        >
            <ProCard bordered title="基础信息">
                <div className="w-full flex flex-col">
                    <div className="w-full">
                        <span className="mr-1rem">分辨率：{video?.resolutionWidth}*{video?.resolutionHeight}</span>
                        <span>时长：{video?.duration}s</span>
                    </div>
                    <div>
                        <span className="mr-1rem">点击次数：{video?.clickNumber.toString()}</span>
                        <span className="mr-1rem">点赞次数：{video?.likeNumber.toString()}</span>
                        <span className="mr-1rem">播放次数：{video?.playNumber.toString()}</span>
                        <span className="mr-1rem">虚拟播放次数：{video?.virtualPlayNumber.toString()}</span>
                        <span>评论次数：{video?.commentNumber.toString()}</span>
                    </div>
                </div>
            </ProCard>
            <ProCard
                title="在线播放"
                headerBordered
                collapsible
                bordered
                defaultCollapsed={false}
            >
                <div ref={(v) => playerEl.current = v as HTMLDivElement}></div>
            </ProCard>
            <ProCard
                title="基础设置"
                headerBordered
                collapsible
                bordered
                defaultCollapsed
            >
                <ProForm.Group>
                    <ProFormText
                        required
                        rules={[{required: true, message: '请输入标题'}]}
                        initialValue={""}
                        width="xl"
                        name="title"
                        label="标题"
                        placeholder="请输入标题"
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormSelect
                        name="userId"
                        required
                        rules={[{required: true, message: '创作者不能为空'}]}
                        options={users}
                        fieldProps={{
                            showSearch: true,
                            onSearch: (value: string) => loadUsers(value),
                            onClear: () => loadUsers('')
                        }}
                        label="创作者"/>
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormDigit
                        required
                        width="xs"
                        name="price"
                        label="基础价格"
                        initialValue={10}
                        placeholder="请输入基础价格"
                        transform={(value) => {
                            return {
                                price: Number(value)
                            }
                        }}
                    />
                    <ProFormRadio.Group
                        name="priceMode"
                        label="价格模式"
                        required
                        initialValue={1}
                        options={[
                            {
                                label: '自动',
                                value: 1,
                            },
                            {
                                label: '手动',
                                value: 2
                            },
                        ]}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormSelect
                        required
                        name="country"
                        rules={[{required: true, message: '地区不能为空'}]}
                        placeholder="请选择地区"
                        initialValue={"CHN"}
                        label="地区"
                        valueEnum={countriesMaps}/>
                    <ProFormSelect
                        name="denyCountries"
                        fieldProps={{
                            mode: 'multiple',
                        }}
                        options={getCountryList()}
                        label="排除的地区"/>
                    <ProFormDigit
                        required
                        width="xs"
                        name="level"
                        label="评级"
                        initialValue={10}
                        placeholder="请输入评级"
                        transform={(value) => {
                            return {
                                level: Number(value)
                            }
                        }}
                    />
                    <ProFormDigit
                        required
                        width="xs"
                        name="sortWeight"
                        label="排序权重"
                        initialValue={10}
                        placeholder="请输入排序权重"
                        transform={(value) => {
                            return {
                                sortWeight: Number(value)
                            }
                        }}
                    />
                    <ProFormDigit
                        required
                        width="xs"
                        name="virtualPlayNumber"
                        label="虚拟播放数"
                        initialValue={10}
                        placeholder="请输入虚拟播放数"
                        transform={(value) => {
                            return {
                                virtualPlayNumber: Number(value)
                            }
                        }}
                    />
                    <ProFormRadio.Group
                        name="enabled"
                        label="启用状态"
                        required
                        initialValue={true}
                        options={[
                            {
                                label: '启用',
                                value: true,
                            },
                            {
                                label: '禁用',
                                value: false
                            },
                        ]}
                    />
                    <ProFormRadio.Group
                        name="screen"
                        label="屏幕"
                        required
                        initialValue={1}
                        options={[
                            {
                                label: '竖屏',
                                value: 2,
                            },
                            {
                                label: '横屏',
                                value: 1
                            },
                        ]}
                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormSelect
                        name="tags"
                        options={tags}
                        fieldProps={{
                            mode: 'multiple',
                            showSearch: true,
                            onSearch: async (value: string) => setTags(await loadTags(value)),
                            onClear: async () => setTags(await loadTags(''))
                        }}
                        label="关联标签"/>
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormUploadDragger
                        width="xs"
                        description="仅支持上传图片"
                        label="封面"
                        name="cover"
                        required
                        transform={(values: UploadFile[]) => {
                            if (values.length > 0) {
                                const val = values[0];
                                if (val.status == "success") {
                                    return val.name;
                                }
                                return '';
                            }
                            return '';
                        }}
                        fieldProps={{
                            listType: "picture",
                            accept: "image/*",
                            maxCount: 1,
                            fileList: defaultFileList,
                            onChange: (info) => {
                                if (info.fileList.length > 0) {
                                    formRef.current?.setFieldsValue({
                                        cover: info.fileList
                                    });
                                }
                            },
                            disabled: defaultFileList.length > 0,
                            itemRender: (_originNode, _file, fileList) => {
                                return (<div>
                                    {fileList.map((file) => {
                                        return (
                                            <div key={file.uid} className="w-10rem">
                                                <div className="w-full m-1rem">
                                                    <Image width={"100%"} src={file.thumbUrl}
                                                           preview={{src: file.url}}/>
                                                    <div
                                                        className="w-full flex items-center justify-center my-.5rem flex-col">
                                                        {file.status == "error" ?
                                                            <Button className="w-5rem" size="small" onClick={() => {
                                                                if (file.originFileObj) {
                                                                    customRequest(file.originFileObj);
                                                                }
                                                            }}>重新上传</Button> : null}
                                                        <Button
                                                            className="w-5rem mt-.5rem"
                                                            danger={file.status != "uploading"}
                                                            disabled={file.status == "uploading"}
                                                            onClick={() => {
                                                                setDefaultFileList([])
                                                                formRef.current?.setFieldsValue({
                                                                    cover: []
                                                                });
                                                            }}
                                                            size="small"
                                                            loading={file.status == "uploading"}>
                                                            {file.status == "uploading" ? "上传中" : "删除"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>)
                            },
                            customRequest: ({file}) => customRequest(file as RcFile),
                        }
                        }

                    />
                </ProForm.Group>
                <ProForm.Group>
                    <ProFormList
                        required
                        label="预览段"
                        name="previewBlocks"
                        initialValue={[
                            {
                                data: [0, 15],
                            },
                        ]}
                        creatorButtonProps={{
                            position: 'top',
                            creatorButtonText: '再建一行',
                        }}
                        copyIconProps={false}
                        creatorRecord={{
                            data: [0, 15],
                        }}
                    >
                        <ProFormDigitRange name="data" label="起始时间" key="data"/>
                    </ProFormList>
                </ProForm.Group>
            </ProCard>

            <ProCard
                title="多语言设置"
                headerBordered
                collapsible
                defaultCollapsed
                bordered
            >
                {Object.entries(video?.locales ?? {}).map(([k]) => {
                    const locale = video?.locales?.[k];
                    if (!locale) {
                        return null;
                    }
                    const lang = langMap.get(k) ?? '';
                    return (
                        <ProForm.Group key={k}>
                            <ProFormText
                                initialValue={locale.title ?? ''}
                                width="md"
                                name={['locales', k, 'title']}
                                label={`${lang}标题`}
                                placeholder="请输入标题"
                            />
                            <ProFormText
                                initialValue={locale.description ?? ''}
                                width="md"
                                name={['locales', k, 'description']}
                                label={`${lang}描述`}
                                placeholder="请输入描述"
                            />
                        </ProForm.Group>
                    );
                })}
            </ProCard>
        </ModalForm>
    );
};

export default EditForm;
