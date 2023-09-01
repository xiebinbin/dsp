
export const getImgUrl = (url: string): string => {
    if (url.startsWith("http")) {
        return url;
    }
    return "https://file.acg.fans/" + url;
}
