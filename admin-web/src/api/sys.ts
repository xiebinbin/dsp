import createRequestInstance from "@/api/lib/create-request-instance.ts";


const getPubKey = (): Promise<{
    pub_key: string;
}> => {
    return createRequestInstance(false).get('/api/common/sys/pub-key')
}

export default {
    getPubKey
}
