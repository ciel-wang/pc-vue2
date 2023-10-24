
export function checkFloatNum(rule, value, callback) {
  const reg = /(^[0-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
  if(value==0 && value!==""){
      callback();
  }else if (value=="") {
    return callback(new Error('请填写数字'))
  } else if (!reg.test(value)) {
    return callback(new Error('请填写数字,最多2位小数'))
  } else {
    callback()
  }
}
export function checkInterNum(rule, value, callback) {
  const reg = /^[0-9]*[0-9][0-9]*$/
  if(value==0 && value!==""){
      callback();
  }else if (!value) {
    return callback(new Error('请填写整数'))
  } else if (!reg.test(value)) {
    return callback(new Error('请输入整数'))
  } else {
    callback()
  }
}
export default {
  floatNum: [{ required: true, validator: checkFloatNum, trigger: 'blur' }],
  interNum: [{ required: true, validator: checkInterNum, trigger: 'blur' }]
}
