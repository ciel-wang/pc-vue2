import axios from 'axios';
import { Message } from 'element-ui';
import { reqCardIssuerType, reqFC2Cipher, issueCard, getWriteCardCipher, getCleanCardCipher, recycle, checkCardUsable, reqCheckCardIssue } from '@/api/iot/account';

export async function cardFunction(params = {},btnType){
  let cardType = await reqCardIssuerType().then(r => {
    if(r.data.code === 200) return r.data.data.cardIssuerType*1;
  })
  let cipher = "",physicalCardNum = "";
  // 1是SM发卡器
  if(cardType === 1){
    // 获取卡号
    physicalCardNum = await axios.get('http://localhost:18888/rscardno?beep=1').then(res => {
      if(!/^\d+$/.test(res.data) || (/^\d+$/.test(res.data) && res.data < 1000)){
        return Promise.reject(res.data)
      }else{
        return res.data
      }
    })
    // 写卡
    if(btnType === "sendCard"){
      try{
        let cip = await getWriteCardCipher({empId:params.empId}).then(r => {
          if(r.data.msg){
            return r.data.msg
          }else{
            return Promise.reject('密钥获取失败')
          }
        })
        axios.get('http://localhost:18888/fscard?cipher=' + cip).then(r => {
          Message({ message: r.data, type: 'success' })
        })
      }catch(e){
        Message({ message: '请检测读取器服务是否启动正常', type: 'error' })
      }
    }
    // 退卡
    if(btnType === "cleanCard"){
      if(params.physicalCardNum == physicalCardNum){
        let CleanCardCipher = await getCleanCardCipher({ physicalCardNum }).then(r => {
          return r.data.msg
        })
        await axios.get('http://localhost:18888/cscard?cipher=' + CleanCardCipher).then(r => {
          if(r.data != '清卡成功'){
            return Promise.reject(r.data)
          }else{
            return Message({ message: r.data, type: 'success' })
          }
        })
      }else{
        return Promise.reject('退卡卡号与实际卡号不符')
      }
    }
  }

  // 2是FC2发卡器
  if(cardType === 2){
    // 读取卡号
    physicalCardNum = await axios.get('http://localhost:18888/fc2read/cardno').then(res => {
      if(res.data.status === 0){
        return res.data.cardNo
      }else{
        if(res.data.msg == '02') return Promise.reject('未找到发卡器')
        if(res.data.msg == 'd5') return Promise.reject('未找到卡片')
        return Promise.reject(res.data.msg)
      }
    })
    // 获取秘钥,cardOprtType：1发卡，2退卡,3清空卡
    if(['sendCard','cleanCard','emptyCard'].includes(btnType)){
      let accountNum = ['sendCard','cleanCard'].includes(btnType) ? params.accountNum : 0;
      let cardOprtType = btnType === "cleanCard" ? 0 : btnType === "emptyCard" ? 3 : 1
      cipher = await reqFC2Cipher({accountNum,physicalCardNum,cardOprtType}).then(r => {
        if(r.data.code === 200){
          return r.data.msg
        }else{
          return Promise.reject(r.data.msg)
        }
      })
    }
    // 写卡( 发卡和补卡 )
    if(btnType === "sendCard"){
      await reqCheckCardIssue({...params,physicalCardNum}).then(r => {
        if(r.data.code === 200) return r.data.msg;
        return Promise.reject(r.data.msg)
      })
      physicalCardNum = await axios.get('http://localhost:18888/fc2write/cardopen?cipher='+cipher).then(res => {
        if(res.data.status === 0){
          return res.data.cardNo
        }else{
          return Promise.reject(res.data.msg)
        }
      })
    }
    // 退卡
    if(btnType === "cleanCard"){
      if(params.physicalCardNum == physicalCardNum){
        physicalCardNum = await axios.get('http://localhost:18888/fc2write/cardrecovery?cipher='+cipher).then(res => {
          if(res.data.status === 0){
            return res.data.cardNo
          }else{
            return Promise.reject(res.data.msg)
          }
        })
      }else{
        return Promise.reject('退卡卡号与实际卡号不符')
      }
    }
    // 清空卡
    if(btnType === "emptyCard"){
      physicalCardNum = await axios.get('http://localhost:18888/fc2write/cleandata?cipher='+cipher).then(res => {
        if(res.data.status === 0){
          return res.data.msg
        }else{
          return Promise.reject(res.data.msg)
        }
      })
    }
  }

  // 3是SMRW发卡器发FC2卡
  if(cardType === 3){
    // 获取卡号
    physicalCardNum = await axios.get('http://localhost:18888/rscardno?beep=1').then(res => {
      if(!/^\d+$/.test(res.data) || (/^\d+$/.test(res.data) && res.data < 1000)){
        return Promise.reject(res.data)
      }else{
        return res.data
      }
    })
    // 获取秘钥,cardOprtType：1发卡，2退卡
    if(['sendCard','cleanCard','emptyCard'].includes(btnType)){
      let accountNum = ['sendCard','cleanCard'].includes(btnType) ? params.accountNum : 0;
      let cardOprtType = btnType === "cleanCard" ? 0 : btnType === "emptyCard" ? 3 : 1
      cipher = await reqFC2Cipher({accountNum,physicalCardNum,cardOprtType}).then(r => {
        if(r.data.code === 200){
          return r.data.msg
        }else{
          return Promise.reject(r.data.msg)
        }
      })
    }
    // 写卡( 发卡和补卡 )
    if(btnType === "sendCard"){
      await reqCheckCardIssue({...params,physicalCardNum}).then(r => {
        if(r.data.code === 200) return r.data.msg;
        return Promise.reject(r.data.msg)
      })
      await axios.get('http://localhost:18888/sm2write/cardopen?cipher='+cipher).then(res => {
        if(res.data.status === 0){
          return physicalCardNum
        }else{
          return Promise.reject(res.data.msg)
        }
      })
    }
    // 退卡
    if(btnType === "cleanCard"){
      if(params.physicalCardNum == physicalCardNum){
        physicalCardNum = await axios.get('http://localhost:18888/sm2write/cardrecovery?cipher='+cipher).then(res => {
          if(res.data.status === 0){
            return res.data.cardNo
          }else{
            return Promise.reject(res.data.msg)
          }
        })
      }else{
        return Promise.reject('退卡卡号与实际卡号不符')
      }
    }
    // 清空卡
    if(btnType === "emptyCard"){
      physicalCardNum = await axios.get('http://localhost:18888/sm2write/cleandata?cipher='+cipher).then(res => {
        if(res.data.status === 0){
          return res.data.msg
        }else{
          return Promise.reject(res.data.msg)
        }
      })
    }
  }

  //系统接口
  // 测试卡
  if(btnType === "testCard"){
    return checkCardUsable({...params,cardNo:physicalCardNum})
  }
  if(btnType === "sendCard"){
    return issueCard({...params,physicalCardNum})
  }

  if(btnType === "cleanCard"){
    return recycle(params.empId)
  }
  if(btnType === 'CardFindEmp') return physicalCardNum;
}
