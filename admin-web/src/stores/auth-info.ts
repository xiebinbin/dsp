import {atom, RecoilState} from "recoil";
import {AuthUser} from "@/shims";

export const AuthInfo: RecoilState<AuthUser> = atom({
    key: 'AuthInfo',
    default: {
        username: '',
        role: '',
    }
})
