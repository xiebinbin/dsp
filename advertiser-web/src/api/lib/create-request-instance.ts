import type {AxiosInstance} from 'axios';
import axios from 'axios';
import localforage from 'localforage';
import {AxiosErrorResponse} from "@/vite-env";

const createRequestInstance = (auth: boolean = true) => {
    const instance: AxiosInstance = axios.create({
        withCredentials: false
    });
    instance.interceptors.request.use(async (config) => {
        if (auth) {
            const token = await localforage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config
    }, (err) => {
        return Promise.reject(err);
    })
    instance.interceptors.response.use(async (rep) => {
        return rep?.data.data;
    }, (err) => {
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
