import request from '@/router/axios';

export const getAppCfgList = (params) => {
    return request({
        url: '/api/iot-basic/appcfg/detail',
        method: 'get',
        params: {
            ...params,
        }
    })
}
export const update = (row) => {
    return request({
        url: '/api/iot-basic/appcfg/update',
        method: 'post',
        data:row
    })
}
