import {atom, RecoilState} from "recoil";
import {LoginUser} from "@/shims";

export const AuthInfo: RecoilState<LoginUser> = atom({
    key: 'AuthInfo',
    default: {
        name: '',
        role: '',
        address: ''
    }
})
