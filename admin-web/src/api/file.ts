import createRequestInstance from "@/api/lib/create-request-instance.ts";
import axios from "axios";
import mime from "mime";
// 假设 FileApi.getToken 返回的数据结构

interface filelocalres {
  filename: string;
  fileurl: string;
  filemimetype: string;
}
export interface GetTokenParam {
  filename: string;
  fileurl: string;
  filemimetype: string;
}
const getPutObjectUrl = (
  ext: string
): Promise<{
  url: string;
  key: string;
}> => {
  console.log("getPutObjectUrl", ext);
  return createRequestInstance().post("/api/admin/files/get-put-object-url", {
    ext,
  });
};

const upload = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const ext = mime.getExtension(file.type);
    const contentType = mime.getType(file.name) ?? null;
    console.log(ext, contentType);
    getPutObjectUrl(ext as string)
      .then((val) => {
        axios
          .put(val.url, file, {
            headers: {
              "Content-Type": contentType ?? "application/octet-stream",
            },
          })
          .then(() => {
            resolve(val.key);
          })
          .catch((e) => reject(e));
      })
      .catch((e) => reject(e));
  });
};
const uploadcloud = async (file: File): Promise<filelocalres> => {
  const contentType = mime.getType(file.name) || "application/octet-stream";
  // 创建一个FormData对象，用于将文件包装成可上传的形式
  const formData = new FormData();
  formData.append("file", file);
  return createRequestInstance().post(
    `/api/admin/upload/${file.name}`,
    formData,
    {
      headers: {
        "Content-Type": contentType,
      },
    }
  );
};


export default {
  getPutObjectUrl,
  upload,
  // getToken,
  uploadcloud,
};
