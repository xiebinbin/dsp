import CryptoJS from 'crypto-js';

const En = (val: string, key: string): string => {
    const iv = CryptoJS.enc.Utf8.parse(CryptoJS.SHA256(key).toString().substring(0, 16));
    const cfg = {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7};
    return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(val), iv, cfg).ciphertext.toString();
}
const De = (valHex: string, key: string): string => {
    const iv = CryptoJS.enc.Utf8.parse(
        CryptoJS.SHA256(key).toString().substring(0, 16),
    );
    const val = CryptoJS.enc.Hex.parse(valHex);
    const valB64Str = CryptoJS.enc.Base64.stringify(val);
    const cfg = { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
    const decrypt = CryptoJS.AES.decrypt(valB64Str, iv, cfg);
    return decrypt.toString(CryptoJS.enc.Utf8);
}

export default {
    En,
    De
};
