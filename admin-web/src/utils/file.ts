
export const getImgUrl = (url: string): string => {
    if (url.startsWith("http")) {
        return url;
    }
    return "http://static-edu-test.leleshuju.com/" + url;
}
export const removeImgUrl = (url: string): string => {
    return url.replace(/^http:\/\/static-edu-test\.leleshuju\.com/, '');

}
