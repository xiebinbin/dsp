import TagApi from "@/api/tag.ts";
import FileApi from "@/api/file.ts";

export const loadTags = (q: string, ids: number[] = []): Promise<{
    label: string;
    value: number;
}[]> => {
    const extra: Record<string, boolean> = {}
    if (q === '' && ids.length == 0) {
        extra.enabled = true;
        extra.recommended = true;
    }
    const filters: Record<string, (number | string | boolean)[] | null> = {}
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
                id: ids
            }
        }).then((res) => {
            resolve(res.data.map((item) => {
                return {
                    label: item.title,
                    value: Number(item.id)
                }
            }));
        }).catch((err) => {
            reject(err);
        });
    });
};

export const upload = (file: File): Promise<{
    key: string;
    url: string;
}> => {
    return new Promise((resolve, reject) => {
        FileApi.upload(file).then((key) => {
            resolve({
                key,
                url: "https://file.acg.fans/" + key,
            });
        }).catch((e) => {
            console.log(e);
            reject(e);
        });
    });
}
