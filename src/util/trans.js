
//性别转换
export function sexTrans(val) {
  if(val == -1){
    return "";
  }
     return val == 1 ? "男" : "女";
}

//离职方式
export function quitTypeTrans(val) {
    return [
      {value:1,label:"主动离职"},
      {value:5,label:"被动离职"},
    ]
}

//人员分类
export function userCategoryTrans(val) {
     if(val == 1){
       return "内部人员";
     }else if(val == 2){
       return "借调人员";
     }else if(val == 3){
       return "其他人员";
     }else{
       return "";
     }
}

//老师状态
export function userStatusTrans(val) {
    if(val == 1){
      return "未审核";
    }else if(val == 2){
      return "未转正";
    }else if(val == 3){
      return "在职";
    }else if(val == 4){
      return "离职";
    }else if(val == 5){
      return "停职留薪";
    }else if(val == 6){
      return "长假期";
    }else if(val == 7){
      return "临时人员";
    }else{
      return "";
    }
}


//卡片状态
export function cardStatusTrans(val) {
    if(val == 1){
      return "未发卡";
    }else if(val == 2){
      return "正常";
    }else if(val == 3){
      return "报损";
    }else if(val == 4){
      return "挂失";
    }else if(val == 5){
      return "解挂";
    }else if(val == 6){
      return "退卡";
    }else{
      return "";
    }
}


//卡类型
export function cardTypeTrans(val) {
    if(val == 1){
      return "一类卡";
    }else if(val == 2){
      return "二类卡";
    }else if(val == 3){
      return "三类卡";
    }else if(val == 4){
      return "四类卡";
    }else if(val == 5){
      return "五类卡";
    }else if(val == 6){
      return "六类卡";
    }else if(val == 7){
      return "七类卡";
    }else if(val == 8){
      return "八类卡";
    }else{
      return "";
    }
}



//事件状态
export function eventStateTrans(val) {
    if(val == 0){
      return "未执行";
    }else if(val == 1){
      return "执行中";
    }else if(val == 2){
      return "失败";
    }else if(val == 3){
      return "成功";
    }else{
      return "";
    }
}

// 计算两个时间间的时长（天小时分秒）
export function datetimeToDurationTrans(startTime,endTime,isSecond) {
  let diff = new Date(endTime).getTime() - new Date(startTime).getTime()
  let days=Math.floor(diff/(24*3600*1000))
  //计算出小时数
  var leave1=diff%(24*3600*1000)    //计算天数后剩余的毫秒数
  var hours=Math.floor(leave1/(3600*1000))
  //计算相差分钟数
  var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
  var minutes=Math.floor(leave2/(60*1000))
  //计算相差秒数
  var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
  var seconds=Math.round(leave3/1000)

  if(isSecond){
      return `${days}天${hours}时${minutes}分${seconds}秒`
  }
  return `${days}天${hours}时${minutes}分`
}

// 人脸设备
export function isDevAi(type){
  let arr = [2,7];
  return arr.includes(type)
}
export function isDevIc(type){
  let arr = [1,7];
  return arr.includes(type)
}