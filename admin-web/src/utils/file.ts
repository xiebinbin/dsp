
export const getImgUrl = (url: string): string => {
    console.log("getImgUrl", url);
    if (url.startsWith("https")) {
        return url;
    }
    return "https://cdn.adbaba.net" + url;
}
export const removeImgUrl = (url: string): string => {
    return url.replace(/^https:\/\/cdn\.adbaba\.net\//, '');

}
