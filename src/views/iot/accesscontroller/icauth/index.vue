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
  import EmpSelect from "./ic-auth-empselect.vue"
  import EqSelect from "./ic-auth-eqselect.vue"
  import VueMagicTree from 'vue-magic-tree'
  import { getAreaEquipmentTree,getList,authDown,deptAuthDown,gradeclassAuthDown} from "@/api/iot/access/icauth";
  import { reqTimestepList } from '@/api/iot/access/ic';
  
  export default{
    components:{EmpSelect,EqSelect},
    data(){
      return{
        setpActive:0,
        obj:{
          authDownType:1,
          cardWgType:'wg34',
          vaildDate:'2099-12-30',
          isStayDevOriginalAuth:[1]
        },
        isVaildDate:true,
        eqTreeData:[],
        empData:[],
        tableHeight:0,
        timestepSeqDic:[]
      }
    },
    mounted() {
      this.tableHeight=window.innerHeight-234;
    },
    activated() {
      reqTimestepList().then(r => {
        this.timestepSeqDic = r.data.data.map(v => ({value:v.timestepSeq,label:v.timestepName}))
      })
    },
    watch:{
      'obj.authDownType':{
        handler(val){
          if(val != 1){
            this.isVaildDate = false;
          }else{
            this.isVaildDate = true;
          }
        }
      },
    },
    methods:{
      submit(data,done){
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
        var areaDoorIds = "";
        for(let i=0;i<this.eqTreeData.length;i++){
          areaDoorIds =  areaDoorIds + this.eqTreeData[i].devCode + "#" +this.eqTreeData[i].id + ",";
        }
        if(areaDoorIds.length > 0){
          areaDoorIds = areaDoorIds.substring(0,areaDoorIds.length -1)
        }
        var userIds = "",deptIds = "",gsIds = "";
        for(let i=0;i<this.empData.length;i++){
          userIds = userIds + this.empData[i].id + ",";
          deptIds = deptIds + this.empData[i].id + ",";
          gsIds = gsIds + this.empData[i].id + ",";
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
        var params = {"authDownType":this.obj.authDownType,"vaildDate":this.obj.vaildDate,timestepSeq:this.obj.timestepSeq};
        params["userIds"] = userIds;
        params["deptIds"] = deptIds;
        params['gsIds'] = gsIds;
        params["areaDoorIds"] = areaDoorIds;
        params['cardWgType'] = this.obj.cardWgType;
        params['isStayDevOriginalAuth'] = this.obj.isStayDevOriginalAuth.length ? true : false;
        if(this.$refs.empRef.radio == 1){
          authDown(params).then(res=>{
            this.$message({
              message: '提交成功，请在事件中查看',
              type: 'success'
            });
            this.$refs.empRef.reset();
            this.$refs.eqRef.onLoad();
          } ,error => {
            window.console.log(error);
          })
        }else if(this.$refs.empRef.radio == 2){
          deptAuthDown(params).then(res => {
            if(res.data.code == 200){
              this.$message({
                message: '提交成功，请在事件中查看',
                type: 'success'
              });
              this.$refs.empRef.reset();
              this.$refs.eqRef.onLoad();
            }
          }).catch(err => {
            console.log(err)
          })
        }else{
          gradeclassAuthDown(params).then(res => {
            if(res.data.code == 200){
              this.$message({
                message: '提交成功，请在事件中查看',
                type: 'success'
              });
              this.$refs.empRef.reset();
              this.$refs.eqRef.onLoad();
            }
          })
        }
      },
      empTreeDataHandler(arr){
        this.empData = arr;
      },
      eqTreeDataHandler(arr){
        this.eqTreeData = arr;
      },
      nextStep(){
        this.setpActive += 1
      },
      preStep(){
        this.setpActive -= 1;
      },
    },
    computed:{
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
              span:24
            },
            {
              label:'下载内容',
              prop:'cardWgType',
              type:'radio',
              dicData:[
                {"label":"WG34",value:"wg34"},
                {"label":"WG26",value:"wg26"},
              ],
              rules: [{
                required: true,
                message: "请选择下载内容",
                trigger: "blur"
              }],
              span:24
            },
            {
              label:'有效期',
              prop:'vaildDate',
              type:'date',
              format:'yyyy-MM-dd',
              valueFormat:'yyyy-MM-dd',
              rules: [{
                required: this.isVaildDate,
                message: "请选择有效期",
                trigger: "blur"
              }],
              span:24,
              display:this.isVaildDate
            },
            {
              label:"时段策略",
              prop:"timestepSeq",
              type:'select',
              dicData:this.timestepSeqDic,
              span:16,
              display:this.isVaildDate
            },
            {
              label:'保留控制器原有权限',
              labelWidth:160,
              prop:'isStayDevOriginalAuth',
              type:'checkbox',
              dicData:[{value:1,label:""}],
              display:this.isVaildDate
            }
          ]
        }
      },
    }
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
