import request from '@/router/axios';

export const getStudentData = (params) => {
  return request({
    url: '/api/iot-basic/emp/student/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getStudentDetails = (params) => {
  return request({
    url: '/api/iot-basic/emp/student/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const studentAdd = (row) => {
  return request({
    url: '/api/iot-basic/emp/student/add',
    method: 'post',
    data:row
  })
}
export const studentUpdate = (row) => {
  return request({
    url: '/api/iot-basic/emp/student/update',
    method: 'post',
    data:row
  })
}
export const studentRemove = (row) => {
  return request({
    url: '/api/iot-basic/emp/student/remove',
    method: 'post',
    data:row
  })
}
export const getGenrateEmpCode = params => {
  return request({
    url: "/api/iot-basic/user/generate/empcode",
    method: "get",
    params: params
  });
};
export const studentGraduate = (row) => {
  return request({
    url: "/api/iot-basic/emp/student/finish",
    method: "post",
    data:row
  });
};
export const studentStatusUpdate = (row) => {
  return request({
    url: "/api/iot-basic/emp/student/update/status",
    method: "post",
    data:row
  });
};