import request from '@/router/axios';

export const getTeacherData = (params) => {
  return request({
    url: '/api/iot-basic/emp/teacher/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const teacherRemove = (row) => {
  return request({
    url: '/api/iot-basic/emp/teacher/remove',
    method: 'post',
    data:row
  })
}
export const getDictCode = (params) => {
  return request({
    url: '/api/iot-basic/common/system/bizdict',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const teacherAdd = (row) => {
  return request({
    url: '/api/iot-basic/emp/teacher/add',
    method: 'post',
    data:row
  })
}
export const teacherUpdate = (row) => {
  return request({
    url: '/api/iot-basic/emp/teacher/update',
    method: 'post',
    data:row
  })
}
export const teacherDetails = (params) => {
  return request({
    url: '/api/iot-basic/emp/teacher/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const updateVisitorAuditState = row => {
  return request({
    url: "/api/iot-basic/user/update/visitor/auditstate",
    method: "post",
    data: row
  });
};

export const gradeclassList = row => {
  return request({
    url: `/api/iot-basic/emp/teacher/grade-class/list?size=${row.size}&current=${row.current}`,
    method: "post",
    data:row
  });
};
export const reqTeacherGradeclass = params => {
  return request({
    url: "/api/iot-basic/emp/teacher/mng/grade-class/list",
    method: "get",
    params:{
      ...params
    }
  });
};
export const updateTeacherGradeclass = row => {
  return request({
    url: "/api/iot-basic/emp/teacher/grade-class/update",
    method: "post",
    data: row
  });
};
