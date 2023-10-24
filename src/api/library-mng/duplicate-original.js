import request from '@/router/axios';

export const getBookDuplicateList = (params) => {
  return request({
    url: '/api/iot-library/booklist-ectype/list',
    method: 'get',
    params:{
      ...params
    }
  })
}