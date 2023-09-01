import aes from '@/utils/aes';
import {Wallet} from '@/utils/wallet';
import axios from 'axios';
import dayjs from 'dayjs';
import type {AxiosInstance} from 'axios';
import CryptoJS from 'crypto-js';
import localforage from 'localforage';
import {AxiosErrorResponse} from "@/vite-env";

const createRequestInstance = (en: boolean = true) => {
    const instance: AxiosInstance = axios.create({
        withCredentials: false
    });
    instance.interceptors.request.use(async (config) => {
        if (en) {
            const content = JSON.stringify(config.data ?? {}, (_key, value) => {
                if (typeof value === 'bigint') {
                    return value.toString() + 'n';
                }
                return value;
            });
            const userPriKey = await localforage.getItem('user-pri-key') as string;
            const loginKey = await localforage.getItem('login-key') as string | undefined | null;
            const wallet = new Wallet(userPriKey);
            const time = dayjs().utc().unix() + '';
            const contentHash = CryptoJS.SHA256(content).toString().substring(0, 16);
            const sign = wallet.sign(contentHash + ":" + time);
            const address = wallet.getAddress().toLowerCase();
            config.headers.set('X-Time', time);
            config.headers.set('X-Sign', sign);
            config.headers.set('X-Sign-Address', address);
            config.headers.set('X-Login-Key', loginKey);
            config.headers.set('X-Pub-Key', wallet.getPubKey());
            config.headers.set('X-Data-Hash', contentHash);
            if (config.method == 'post' || config.method == 'put') {
                const sysPubKey = await localforage.getItem('sys-pub-key') as string;
                const sharedSecret = wallet.getSharedSecret(sysPubKey);
                const enData = aes.En(content, sharedSecret);
                config.data = {
                    data: enData
                }
            }
        }
        return config
    }, (err) => {
        return Promise.reject(err);
    })
    instance.interceptors.response.use(async (rep) => {
        if (en) {
            const userPriKey = await localforage.getItem('user-pri-key') as string;
            const wallet = new Wallet(userPriKey);
            const sysPubKey = await localforage.getItem('sys-pub-key') as string;
            const sharedSecret = wallet.getSharedSecret(sysPubKey)
            let data = rep.data.data ?? ""
            if (data.substring(0, 2) == '0x') {
                data = data.substring(2)
            }
            if (data != "") {
                rep.data.data = JSON.parse(aes.De(data, sharedSecret), (_key, value) => {
                    if (typeof value === 'string' && /^-?\d+n$/.test(value)) {
                        return BigInt(value.slice(0, -1));
                    }
                    return value;
                });
            }
        }
        return rep.data.data;
    }, (err) => {
        // 判断  err 是否为 AxiosError 类型
        if (axios.isAxiosError(err)) {
            // 判断是否为网络错误
            if (!err.response) {
                window.Message.error('网络错误')
                return Promise.reject(err);
            }
            // 请求已发出，但不在2xx的范围
            const data = err.response.data as AxiosErrorResponse;
            window.Message.error(data.message)
            return Promise.reject(err);

        }
        return Promise.reject(err);
    });
    return instance;
};

export default createRequestInstance;
