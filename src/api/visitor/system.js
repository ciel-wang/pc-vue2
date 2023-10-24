import request from '@/router/axios';

export const fksystemUpdate = (row) => {
  return request({
    url: '/api/iot-visitor/fksystem/update',
    method: 'post',
    data:row
  })

}

export const fksystemDetails = () => {
  return request({
    url: '/api/iot-visitor/fksystem/details',
    method: 'get',
  })

}
