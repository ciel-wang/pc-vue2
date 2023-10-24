import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/dev/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}


export const getSystemDetail = ( ) => {
  return request({
    url: '/api/iot-xf/systempar/details',
    method: 'get',
  })
}

export const getMealDetail = ( ) => {
  return request({
    url: '/api/iot-xf/systempar/mealdetail',
    method: 'get',
  })
}
export const updateXfSystem = (row) => {
  return request({
    url: '/api/iot-xf/systempar/update',
    method: 'post',
    data:row
  })
}