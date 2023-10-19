// import {
//     ModalForm,
//     ProCard,
//     ProForm,
//     ProFormDigit,
//     ProFormInstance,
//     ProFormList,
//     ProFormRadio,
//     ProFormSelect,
//     ProFormText,
//     ProFormTextArea,
// } from '@ant-design/pro-components';
// import {Button, message, Upload, UploadFile} from 'antd';
// import {useMount, useSafeState, useUnmount} from "ahooks";
// import PaymentChannelApi, {PaymentChannelEditDto} from "@/api/payment-channel.ts";
// import Emittery from 'emittery';
// import {useCallback, useRef} from "react";
// import {RcFile} from "antd/es/upload";
// import {getLangList} from "@/utils/lang.ts";
// import {upload} from "@/utils/form-tool.ts";
// import {CloudUploadOutlined} from "@ant-design/icons";
// import {getImgUrl} from "@/utils/file.ts";
// import {getCountryList} from "@/utils/country.ts";
// // eslint-disable-next-line react-refresh/only-export-components
// const langMap = new Map<string, string>();
// Object.entries(getLangList()).forEach(([key, value]) => {
//     langMap.set(key, value);
// });
// export const $emit = new Emittery();

// interface PayDriverConfig {
//     label: string;
//     key: string;
// }

// interface PayDriver {
//     title: string;
//     key: string;
//     config: PayDriverConfig[];
// }

// const drivers: PayDriver[] = [
//     {
//         title: 'MixPay',
//         key: 'mix-pay',
//         config: [
//             {
//                 label: 'app id',
//                 key: 'payeeId',
//             },
//             {
//                 label: '引用币种 id',
//                 key: 'quoteAssetId',
//             },
//             {
//                 label: '结算币种 id',
//                 key: 'settlementAssetId',
//             }
//         ]
//     },
//     {
//         title: '易顺',
//         key: 'easun-pay',
//         config: [
//             {
//                 label: '商户ID',
//                 key: 'mch_id'
//             },
//             {
//                 label: '商户密钥',
//                 key: 'key'
//             },
//             {
//                 label: '支付通道代码',
//                 key: 'bank_code'
//             }
//         ]
//     }
// ]
// const EditForm = () => {
//     const [show, setShow] = useSafeState(false);
//     const [mode, setMode] = useSafeState('add');
//     const [id, setId] = useSafeState<bigint>(BigInt(0));
//     const [payDriverConfig, setPayDriverConfig] = useSafeState<PayDriverConfig[]>();
//     const formRef = useRef<ProFormInstance>();
//     const [icon, setIcon] = useSafeState('');
//     const [fileList, setFileList] = useSafeState<UploadFile[]>([]);
//     const [currency, setCurrency] = useSafeState('CNY');
//     const [locales, setLocales] = useSafeState<Record<string, { title: string, description?: string }>>({});
//     useMount(async () => {
//         $emit.on('add', () => {
//             setMode('add');
//             formRef.current?.resetFields();
//             setIcon('');
//             setFileList([]);
//             setId(BigInt(0));
//             setShow(true);
//         });
//         $emit.on('update', (val: bigint) => {
//             setMode('update');
//             setId(val);
//             setFileList([])
//             loadInfo(val).then(() => {
//                 setShow(true);
//             }).catch(() => {
//                 message.error('加载失败');
//             });
//         });
//         setLocales(Object.entries(getLangList()).map(v => {
//             return {
//                 [v[0]]: {
//                     title: '',
//                     description: ''
//                 }
//             }
//         }).reduce((a, b) => {
//             return {
//                 ...a,
//                 ...b
//             }
//         }));
//     });
//     useUnmount(() => {
//         $emit.clearListeners();
//     });
//     const loadInfo = useCallback(async (val: bigint) => {
//         const channel = await PaymentChannelApi.getInfo(val);
//         if (channel.icon) {
//             const defaultFile: UploadFile = {
//                 uid: channel.id.toString(),
//                 name: channel.icon,
//                 url: getImgUrl(channel.icon),
//                 thumbUrl: getImgUrl(channel.icon),
//                 status: "success",
//             }
//             setFileList([defaultFile]);
//             setIcon(channel.icon);
//         }
//         setLocales(channel.locales);
//         setIcon(channel.icon??'');
//         setPayDriverConfig(drivers.find(item => item.key === channel.driver)?.config);
//         setTimeout(() => {
//             console.log(channel)
//             formRef.current?.setFieldsValue({
//                 title: channel.title,
//                 icon: channel.icon,
//                 remark: channel.remark,
//                 sort: channel.sort,
//                 locales: channel.locales,
//                 supportCountryCodes: channel.supportCountryCodes,
//                 currency: channel.currency,
//                 enabled: channel.enabled,
//                 payRate: channel.payRate,
//                 supportAmounts: channel.supportAmounts.map((item: number) => {
//                     return {
//                         amount: item
//                     }
//                 }),
//                 driverConfig: channel.driverConfig,
//                 driver: channel.driver,
//             });
//         }, 1000);
//     }, [setFileList, setIcon, setLocales]);
//     const create = useCallback(async (data: PaymentChannelEditDto) => {
//         await PaymentChannelApi.create(data);
//         message.success('新建成功');
//         formRef.current?.resetFields();
//         $emit.emit('reload');
//         setShow(false);
//     }, [setShow]);
//     const update = useCallback(async (vId: bigint, data: PaymentChannelEditDto) => {
//         await PaymentChannelApi.update(vId, data);
//         message.success('更新成功');
//         $emit.emit('reload');
//         setShow(false);
//     }, [setShow]);
//     const customRequest = useCallback(async (file: RcFile) => {
//         setFileList([{
//             uid: file.uid,
//             name: file.name,
//             originFileObj: file,
//             status: "uploading",
//         }]);
//         try {
//             const res = await upload(file);
//             const uploadFile: UploadFile = {
//                 uid: file.uid,
//                 name: res.key,
//                 url: res.url,
//                 thumbUrl: res.url,
//                 status: "success",
//             }
//             setFileList([uploadFile]);
//             setIcon(res.key);
//         } catch (e) {
//             setFileList([]);
//             setIcon('');
//             console.log(e);
//             message.error('上传失败');
//         }
//     }, [setFileList, setIcon]);
//     return (
//         <ModalForm
//             formRef={formRef}
//             title={mode === 'add' ? '新建支付通道' : '编辑支付通道'}
//             open={show}
//             onFinish={async () => {
//                 if (formRef.current && formRef.current.validateFieldsReturnFormatValue) {
//                     const data = await formRef.current?.validateFieldsReturnFormatValue();
//                     data.icon = icon;
//                     if (data?.supportAmounts) {
//                         data.supportAmounts = data.supportAmounts.map((item: { amount: number }) => {
//                             return item.amount;
//                         }) as number[];
//                     } else {
//                         data.supportAmounts = [];
//                     }
//                     data.supportAmounts = Array.from(new Set(data.supportAmounts));
//                     if (mode === 'add') {
//                         await create(data);
//                     }
//                     if (mode === 'update') {
//                         await update(id, data);
//                     }
//                 }

//                 return false;
//             }}
//             onOpenChange={setShow}
//         >
//             <ProCard title="基础信息">
//                 <ProForm.Group>
//                     <ProFormText
//                         required
//                         rules={[{required: true, message: '请输入标题'}]}
//                         initialValue={""}
//                         width="xl"
//                         name="title"
//                         label="标题"
//                         placeholder="请输入标题"
//                     />
//                 </ProForm.Group>
//                 <ProForm.Group>
//                     <ProFormTextArea
//                         initialValue={""}
//                         width="xl"
//                         name="remark"
//                         label="备注"
//                         placeholder="请输入备注"
//                     />
//                 </ProForm.Group>
//                 <ProForm.Group>
//                     <ProForm.Item label="图标">
//                         {
//                             icon != '' ? <img className="w-50px h-50px mr-1rem" src={getImgUrl(icon)} alt=""/> : null
//                         }
//                         <Upload
//                             name="icon"
//                             accept="image/*, .svg"
//                             maxCount={1}
//                             showUploadList={false}
//                             onChange={(info) => {
//                                 setFileList(info.fileList);
//                             }}
//                             onRemove={() => {
//                                 setFileList([]);
//                                 setIcon('');
//                             }}
//                             fileList={fileList}
//                             customRequest={({file}) => customRequest(file as RcFile)}
//                         >
//                             <Button icon={<CloudUploadOutlined/>}>上传</Button>
//                         </Upload>
//                     </ProForm.Item>
//                 </ProForm.Group>
//                 <ProForm.Group>
//                     <ProFormDigit
//                         required
//                         width="xs"
//                         name="payRate"
//                         label="支付费率"
//                         initialValue={10}
//                         addonAfter={"%"}
//                         placeholder="请输入手续费"
//                     />
//                     <ProFormSelect
//                         required
//                         width="sm"
//                         name="currency"
//                         initialValue='CNY'
//                         rules={[{required: true, message: '请选择支付币种'}]}
//                         onChange={(val) => setCurrency(val as string)}
//                         label="支付币种"
//                         options={[
//                             {
//                                 label: '人民币',
//                                 value: 'CNY'
//                             },
//                             {
//                                 label: '美元',
//                                 value: 'USD'
//                             },
//                             {
//                                 label: '巴西雷亚尔',
//                                 value: 'BRL'
//                             }
//                         ]}
//                     />
//                 </ProForm.Group>
//                 <ProForm.Group>
//                     <ProFormList
//                         name={['supportAmounts']}
//                         copyIconProps={false}
//                         required
//                         initialValue={[
//                             {
//                                 amount: 10
//                             }
//                         ]}
//                         creatorRecord={{
//                             amount: 10
//                         }}
//                         label="支持金额">
//                         <ProFormDigit
//                             required
//                             name="amount"
//                             addonAfter={currency}
//                             width="xs"
//                             placeholder="请输入支持金额"
//                         />
//                     </ProFormList>
//                 </ProForm.Group>
//                 <ProForm.Group>
//                     <ProFormDigit
//                         required
//                         width="xs"
//                         name="sort"
//                         label="排序"
//                         initialValue={10}
//                         placeholder="请输入排序"
//                     />
//                     <ProFormRadio.Group
//                         name="enabled"
//                         label="启用状态"
//                         required
//                         initialValue={true}
//                         options={[
//                             {
//                                 label: '启用',
//                                 value: true,
//                             },
//                             {
//                                 label: '禁用',
//                                 value: false
//                             },
//                         ]}
//                     />
//                 </ProForm.Group>
//                 <ProForm.Group>
//                     <ProFormSelect
//                         name="supportCountryCodes"
//                         initialValue={['ALL']}
//                         options={getCountryList()}
//                         fieldProps={{
//                             mode: 'multiple',
//                         }}
//                         label="允许的地区"></ProFormSelect>
//                 </ProForm.Group>
//             </ProCard>
//             <ProCard
//                 title="驱动设置"
//                 headerBordered
//                 collapsible
//                 defaultCollapsed
//                 bordered
//             >
//                 <ProForm.Group>
//                     <ProFormSelect
//                         required
//                         label="驱动列表"
//                         name="driver"
//                         rules={[{required: true, message: `请选择驱动`}]}
//                         onChange={(val) => {
//                             const driver = drivers.find(item => item.key === val);
//                             setPayDriverConfig(driver ? driver.config : []);
//                         }}
//                         options={drivers.map(item => {
//                             return {
//                                 label: item.title,
//                                 value: item.key
//                             }
//                         })}/>
//                 </ProForm.Group>
//                 <ProForm.Group>
//                     {payDriverConfig?.map(item => {
//                         return (
//                             <ProFormText
//                                 required
//                                 rules={[{required: true, message: `请输入${item.label}`}]}
//                                 initialValue={""}
//                                 width="xl"
//                                 name={['driverConfig', item.key]}
//                                 label={item.label}
//                                 placeholder={`请输入${item.label}`}
//                             />
//                         )
//                     })}
//                 </ProForm.Group>
//             </ProCard>
//             <ProCard
//                 title="多语言设置"
//                 headerBordered
//                 collapsible
//                 defaultCollapsed
//                 bordered
//             >
//                 {Object.entries(locales).map(([k]) => {
//                     const locale = locales?.[k];
//                     if (!locale) {
//                         return null;
//                     }
//                     const lang = langMap.get(k) ?? '';
//                     return (
//                         <ProForm.Group key={k}>
//                             <ProFormText
//                                 initialValue={locale.title ?? ''}
//                                 name={['locales', k, 'title']}
//                                 label={`${lang}标题`}
//                                 placeholder="请输入标题"
//                             />
//                             <ProFormText
//                                 initialValue={locale.description ?? ''}
//                                 name={['locales', k, 'description']}
//                                 label={`${lang}描述`}
//                                 placeholder="请输入描述"
//                             />
//                         </ProForm.Group>
//                     );
//                 })}
//             </ProCard>
//         </ModalForm>
//     )
//         ;
// };

// export default EditForm;
