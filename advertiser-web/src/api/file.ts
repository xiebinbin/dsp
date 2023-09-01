import createRequestInstance from "@/api/lib/create-request-instance.ts";
import axios from "axios";
import mime from 'mime'

const getPutObjectUrl = (ext: string): Promise<{
    url: string;
    key: string;
}> => {
    console.log('getPutObjectUrl',ext);
    return createRequestInstance().post('/api/admin/files/get-put-object-url', {ext})
}

const upload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {

        const ext = mime.getExtension(file.type);
        const contentType =mime.getType(file.name) ?? null;
        console.log(ext,contentType)
        getPutObjectUrl(ext as string).then((val) => {
            axios.put(val.url, file, {
                headers: {
                    'Content-Type': contentType ?? 'application/octet-stream'
                }
            }).then(() => {
                resolve(val.key);
            }).catch((e) => reject(e))
        }).catch(e => reject(e))
    })
}
export default {
    getPutObjectUrl,
    upload
}
