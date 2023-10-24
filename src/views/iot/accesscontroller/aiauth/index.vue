<template>
  <div>
    <basic-container style="margin-bottom: 8px;padding: 0 !important;">
      <el-steps :active="setpActive" align-center style="width: 50%;margin: 0 auto;" process-status="finish">
        <el-step title="选择人员"></el-step>
        <el-step title="选择设备"></el-step>
        <el-step title="权限下载"></el-step>
      </el-steps>
    </basic-container>

    <emp-select ref="empRef" @changeTreeData="empTreeDataHandler" v-show="setpActive == 0"></emp-select>
    <eq-select ref="eqRef" @changeTreeData="eqTreeDataHandler" v-show="setpActive == 1"></eq-select>
    <basic-container v-show="setpActive == 2" :style="{height:tableHeight+'px'}" style="padding: 0 0 8px 0 !important;">
      <avue-form style="width: 40%;padding-top: 20px;" :option="option" v-model="obj"></avue-form>
    </basic-container>
    <basic-container style="padding: 0 !important;">
      <div style="text-align: center;padding: 6px 0;">
        <el-button @click="preStep" type="primary" size="mini" v-show="setpActive != 0">
          <i class="el-icon-arrow-left el-icon--left"></i>上一步
        </el-button>
        <el-button @click="nextStep" type="primary" size="mini" v-show="setpActive != 2">
          下一步<i class="el-icon-arrow-right el-icon--right"></i>
        </el-button>
        <el-button type="primary" icon="el-icon-check" size="mini" v-show="setpActive == 2" @click="submit">
          提 交</el-button>
      </div>
    </basic-container>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  import EmpSelect from "./ai-auth-empselect.vue"
  import EqSelect from "./ai-auth-eqselect.vue"
  import VueMagicTree from 'vue-magic-tree'
  import { getAreaEquipmentTree,getList,faceAuthDown,deptFaceAuthDown,gradeclassFaceAuthDown} from "@/api/iot/access/icauth";
  import { getTimeStrategysDic } from "@/api/iot/access/face";
  export default{
    components:{EmpSelect,EqSelect},
    data(){
      return{
        obj:{
          authDownType:1,
          vaildDate:'2099-12-30 00:00:00'
        },
        authDownCon:[],
        setpActive:0,
        eqTreeData:[],
        empData:[],
        tableHeight:0,
        devType:7,
        strategyDic:[],
        empType:''
      }
    },
    mounted() {
      this.tableHeight=window.innerHeight-234;
      getTimeStrategysDic().then(r => {
        let arr = r.data.data.map(v => ({ value: v.id,label: v.strategyName }));
        this.strategyDic = arr;
      })
    },
    methods: {
      getHHmmss(date){
        let hours =  date.getHours();
        let minutes =  date.getMinutes();
        let seconds =  date.getSeconds();
        if(hours < 10){
          hours = "0"+hours;
        }
        if(minutes < 10){
          minutes = "0"+minutes;
        }
        if(seconds < 10){
          seconds = "0"+seconds;
        }
        return hours+":"+minutes+":"+seconds;
      },
      getYYYYMMdd(date){
        let year= "2020";
        let month=date.getMonth()+1;
        let day =  date.getDate();
        if(month < 10){
          month = "0"+month;
        }
        if(day < 10){
          day = "0"+day;
        }
        return year+"-"+month+"-"+day;
      },
      submit(data,done){
        var t1 = "";
        if(this.obj.timestep1.length){
          let s1 = this.obj.timestep1[0];
          let s2 = this.obj.timestep1[1];
          t1 = this.getHHmmss(s1) + "-"+this.getHHmmss(s2);
        }
        var t2 = "";
        if(this.obj.timestep2.length){
          let s1 = this.obj.timestep2[0];
          let s2 = this.obj.timestep2[1];
          t1 = this.getHHmmss(s1) + "-"+this.getHHmmss(s2);
        }
        var t3 = "";
        if(this.obj.timestep3.length){
          let s1 = this.obj.timestep3[0];
          let s2 = this.obj.timestep3[1];
          t3 = this.getHHmmss(s1) + "-"+this.getHHmmss(s2);
        }
        if(this.empData.length == 0){
          this.$message.warning("请选择人")
          this.setpActive = 0;
          return ;
        }
        if(this.eqTreeData.length == 0){
          this.$message.warning("请选择门区")
          this.setpActive = 1;
          return ;
        }
        var devIds = "";
        for(let i=0;i<this.eqTreeData.length;i++){
          devIds = devIds + this.eqTreeData[i].id + ",";
        }
        if(devIds.length > 0){
          devIds = devIds.substring(0,devIds.length -1)
        }
        var userIds = "",deptIds = "",gsIds = "";
        for(let i=0;i<this.empData.length;i++){
          if(this.empType == 1){
            userIds = userIds + this.empData[i].id + ",";
          }else if(this.empType == 2){
            deptIds = deptIds + this.empData[i].deptId + ",";
          }else{
            gsIds = gsIds + this.empData[i].id + ",";
          }
        }
        if(userIds.length > 0){
          userIds = userIds.substring(0,userIds.length -1)
        }
        if(deptIds.length > 0){
          deptIds = deptIds.substring(0,deptIds.length -1)
        }
        if(gsIds.length > 0){
          gsIds = gsIds.substring(0,gsIds.length -1)
        }
        let vdate = this.obj.vaildDate;
        var params = {"authDownType":this.obj.authDownType,"vaildDate":vdate};
        params["userIds"] = userIds;
        params["deptIds"] = deptIds;
        params["devIds"] = devIds;
        params['gsIds'] = gsIds;
        params['timestep1'] = t1;
        params['timestep2'] = t2;
        params['timestep3'] = t3;
        params['strategyId'] = this.obj.strategyId;
        let item = this.strategyDic.find(v => v.value == this.obj.strategyId);
        params['strategyName'] = item ? item.label : '';
        var authDownConStr = "";
        if(this.obj.authDownCon.length > 0){
          for(let i=0;i<this.obj.authDownCon.length;i++){
            authDownConStr = authDownConStr + this.obj.authDownCon[i] + ",";
          }
          if(authDownConStr.length > 0){
            authDownConStr = authDownConStr.substring(0,authDownConStr.length -1)
          }
        }
        params['authDownCon'] = authDownConStr;
        if(this.empType == 1){
          faceAuthDown(params).then(res=>{
            this.$message({
              message: '提交成功，请在事件中查看',
              type: 'success'
            });
          } ,error => {
            window.console.log(error);
          })
        }else if(this.empType == 2){
          deptFaceAuthDown(params).then(res => {
            if(res.data.code == 200){
              this.$message({
                message: '提交成功，请在事件中查看',
                type: 'success'
              });
            }
          }).catch(err => {
            window.console.log(err);
          })
        }else{
          gradeclassFaceAuthDown(params).then(res => {
            if(res.data.code == 200){
              this.$message({
                message: '提交成功，请在事件中查看',
                type: 'success'
              });
            }
          })
        }
      },
      empTreeDataHandler(arr,type){
        this.empType = type
        this.empData = arr;
      },
      eqTreeDataHandler(arr){
        this.eqTreeData = arr;
      },
      nextStep(){
        if(this.setpActive == 0 && this.empData.length == 0){
          this.$message.warning("请选择人")
          this.setpActive = 0;
          return ;
        }
        if(this.setpActive == 1 && this.eqTreeData.length == 0){
          this.$message.warning("请选择门区")
          this.setpActive = 1;
          return ;
        }
        if(this.eqTreeData.length != 0){
          this.devType = this.eqTreeData[0].devType
        }
        this.setpActive += 1
      },
      preStep(){
        this.setpActive -= 1;
      },
    },
    computed: {
      ...mapGetters(["colorName"]),
      option(){
        return {
          emptyBtn:false,
          submitBtn:false,
          column:[
            {
              label:'权限设置',
              prop:'authDownType',
              type:'radio',
              dicData:[
                {"label":"有权",value:1},
                // {"label":"无权",value:2},
                {"label":"删除",value:3},
              ],
              rules: [{
                required: true,
                message: "请选择权限",
                trigger: "blur"
              }],
              span:24,
              control:(val,form)=>{
                let that = this;
                if(val == 3 && that.devType == 7){
                  return{
                    authDownCon:{display:false},
                    strategyId:{display:false},
                    vaildDate:{display:false}
                  }
                }else{
                  return{
                    authDownCon:{display:true},
                    strategyId:{display:true},
                    vaildDate:{display:true}
                  }
                }
              }
            },
            {
              label:'下载内容',
              prop:'authDownCon',
              type:'checkbox',
              dicData:this.devType == 7 ? [
                {"label":"人脸",value:"1"},
                {"label":"卡",value:"2"},
              ] : [
                {"label":"人脸",value:"1"},
                {"label":"卡",value:"2"},
                {"label":"时间区间",value:"3"},
                {"label":"有效时间",value:"4"},
              ],
              rules: [{
                required: true,
                message: "请选择下载内容",
                trigger: "blur"
              }],
              span:16,
              row:true
            },
            {
              label:"选择策略",
              prop:"strategyId",
              type:'select',
              dicData:this.strategyDic,
              display:this.devType == 7 ? true : false,
              row: true,
            },
            {
              label:'有效期',
              prop:'vaildDate',
              type:'datetime',
              valueFormat:'yyyy-MM-dd HH:mm:ss',
              format:'yyyy-MM-dd HH:mm:ss',
              rules: [{
                required: true,
                message: "请选择有效期",
                trigger: "blur"
              }],
              row:true,
            },
            {
              label:'时间段1',
              prop:'timestep1',
              type:'timerange',
              dicData:[
                {"label":"WG34",value:"wg34"},
                {"label":"WG26",value:"wg26"},
              ],
              rules: [{
                required: false,
                message: "请选择下载内容",
                trigger: "blur"
              }],
              row:true,
              display:this.devType == 2 ? true : false
            },
            {
              label:'时间段2',
              prop:'timestep2',
              type:'timerange',
              dicData:[
                {"label":"WG34",value:"wg34"},
                {"label":"WG26",value:"wg26"},
              ],
              rules: [{
                required: false,
                message: "请选择下载内容",
                trigger: "blur"
              }],
              row:true,
              display:this.devType == 2 ? true : false
            },
            {
              label:'时间段3',
              prop:'timestep3',
              type:'timerange',
              dicData:[
                {"label":"WG34",value:"wg34"},
                {"label":"WG26",value:"wg26"},
              ],
              rules: [{
                required: false,
                message: "请选择下载内容",
                trigger: "blur"
              }],
              row:true,
              display:this.devType == 2 ? true : false
            }
          ]
        }
      },
    },
  }
</script>

<style scoped>
  >>>.el-step__title{
    font-size: 14px;
  }
  .basic-container >>>.el-card__body{
    padding: 2px 16px !important;
  }
  >>>.el-card.is-always-shadow{
      height: 100%;
  }
</style>
