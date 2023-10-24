import axios from 'axios';
import { reqCardIssuerType, reqWECtrlCipher } from '@/api/iot/account';

export async function waterCardFunction(params = {},btnType){
  let cardType = await reqCardIssuerType().then(r => {
    if(r.data.code === 200) return r.data.data.cardIssuerType*1;
  })

  let cipher = "",physicalCardNum = "";
  if(cardType === 2){
    // 获取卡号
    physicalCardNum = await axios.get('http://localhost:18888/fc2read/cardno').then(res => {
      if(res.data.status === 0){
        return res.data.cardNo
      }else{
        if(res.data.msg == '02') return Promise.reject('未找到发卡器')
        if(res.data.msg == 'd5') return Promise.reject('未找到卡片')
        return Promise.reject(res.data.msg)
      }
    })
    // 获取秘钥
    let accountNum = ['sendCard','cleanCard','recharge'].includes(btnType) ? params.accountNum : 0;
    cipher = await reqWECtrlCipher({ physicalCardNum ,accountNum }).then(r => {
      if(r.data.code === 200){
        return r.data.msg
      }else{
        return Promise.reject(r.data.msg)
      }
    })
    // 写卡( 发卡和补卡 )
    if(btnType === "sendCard"){
      return await axios.get('http://127.0.0.1:18888/fc2write/sdctrldata?cipher='+cipher).then(res => {
        if(res.data.status == 0){
          return res.data.status
        }else{
          return Promise.reject(res.data.msg)
        }
      })
    }
    if(btnType === "cleanCard" || btnType === "emptyCard"){
      if(btnType === "cleanCard" && params.physicalCardNum != physicalCardNum){
        return Promise.reject('退卡卡号与实际卡号不符')
      }
      return await axios.get('http://127.0.0.1:18888/fc2write/cleansdctrldata?cipher='+cipher).then(res => {
        if(res.data.status == 0){
          return res.data.status
        }else{
          return Promise.reject(res.data.msg)
        }
      })
    }
    if(btnType === "recharge"){
      return await axios.get('http://127.0.0.1:18888/fc2write/sdctrlrechargedata?cipher='+cipher).then(res => {
        if(res.data.status === 0){
          return res.data.status
        }else{
          return Promise.reject(res.data.msg)
        }
      })
    }
  }

  if(cardType === 3){
    // 获取卡号
    physicalCardNum = await axios.get('http://localhost:18888/rscardno?beep=1').then(res => {
      if(!/^\d+$/.test(res.data) || (/^\d+$/.test(res.data) && res.data < 1000)){
        return Promise.reject(res.data)
      }else{
        return res.data
      }
    })
    // 获取秘钥
    let accountNum = ['sendCard','cleanCard','recharge'].includes(btnType) ? params.accountNum : 0;
    cipher = await reqWECtrlCipher({ physicalCardNum ,accountNum }).then(r => {
      if(r.data.code === 200){
        return r.data.msg
      }else{
        return Promise.reject(r.data.msg)
      }
    })
    // 写卡( 发卡和补卡 )
    if(btnType === "sendCard"){
      return await axios.get('http://localhost:18888/sm2write/sdctrldata?cipher='+cipher).then(res => {
        if(res.data.status === 0){
          return res.data.status
        }else{
          return Promise.reject(res.data.msg)
        }
      })
    }
    if(btnType === "cleanCard" || btnType === "emptyCard"){
      if(btnType === "cleanCard" && params.physicalCardNum != physicalCardNum){
        return Promise.reject('退卡卡号与实际卡号不符')
      }
      return await axios.get('http://localhost:18888/sm2write/cleansdctrldata?cipher='+cipher).then(res => {
        if(res.data.status === 0){
          return res.data.status
        }else{
          return Promise.reject(res.data.msg)
        }
      })
    }
    if(btnType === "recharge"){
      return await axios.get('http://localhost:18888/sm2write/sdctrlrechargedata?cipher='+cipher).then(res => {
        if(res.data.status === 0){
          return res.data.status
        }else{
          return Promise.reject(res.data.msg)
        }
      })
    }
  }
}
