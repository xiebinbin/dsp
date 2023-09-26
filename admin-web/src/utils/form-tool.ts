import TagApi from "@/api/tag.ts";
import FileApi from "@/api/file.ts";
import { v4 } from "uuid";
import * as mimeTypes from "mime-types";
 import { GetTokenParam } from "@/api/file"; //  import S3 from 'aws-sdk/clients/s3';
export const uploads3 = (file: File): Promise<any> => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const key = v4().replace("-", "");
    console.log("文件类型", file.type, mimeTypes.extension(file.type));
    const fileName = [
      key.substring(0, 2),
      key.substring(2, 4),
      key + "." + mimeTypes.extension(file.type),
    ].join("/");
    const param: GetTokenParam = {
      name: fileName,
    };
    await FileApi.getToken(param)
      .then((rep) => {
        console.log("rep.data;", rep.data);
        // const { credentials, s3Bucket,s3Endpoint, keyPrefix } = rep.data;
        // const s3client = new (window as any).AWS.S3({
        //   // 用服务端返回的信息初始化一个 S3 实例
        //   region: "automatic",
        //   endpoint: s3Endpoint,
        //   credentials: credentials,
        //   params: {
        //     Bucket:s3Bucket,
        //   },
        // });
        // const s3Upload = s3client.upload({
        //   Key: fileName,
        //   Body: file,
        //   Bucket: s3Bucket,
        //   ContentType: file.type, // 设置上传后文件的 Content-Type 头，即 MIME 类型
        // });
        // s3Upload.on(
        //   "httpUploadProgress",
        //   (evt: { loaded: number; total: number }) => {
        //     // 上传进度回调函数
        //     const percent = ((evt.loaded * 100) / evt.loaded).toFixed(2);
        //     console.log("进度 : " + percent + "%");
        //   }
        // );
        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // s3Upload.send((err: any, data: any) => {
        //   if (err) {
        //     reject(err);
        //   } else {
        //     resolve({
        //       url: keyPrefix + "/" + data.Key,
        //       size: file.size,
        //     });
        //   }
        // });

        resolve({
                url: rep.data.keyPrefix ,
                size: file.size,
              });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const loadTags = (
  q: string,
  ids: number[] = []
): Promise<
  {
    label: string;
    value: number;
  }[]
> => {
  const extra: Record<string, boolean> = {};
  if (q === "" && ids.length == 0) {
    extra.enabled = true;
    extra.recommended = true;
  }
  const filters: Record<string, (number | string | boolean)[] | null> = {};
  if (ids.length > 0) {
    filters.id = ids;
  }
  return new Promise((resolve, reject) => {
    TagApi.getList({
      q,
      page: 1,
      limit: 100,
      extra,
      filters: {
        id: ids,
      },
    })
      .then((res) => {
        resolve(
          res.data.map((item) => {
            return {
              label: item.title,
              value: Number(item.id),
            };
          })
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const upload = (
  file: File
): Promise<{
  key: string;
  url: string;
}> => {
  return new Promise((resolve, reject) => {
    FileApi.upload(file)
      .then((key) => {
        resolve({
          key,
          url: "https://file.acg.fans/" + key,
        });
      })
      .catch((e) => {
        console.log(e);
        reject(e);
      });
  });
};
