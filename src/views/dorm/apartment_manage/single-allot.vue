<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="50%"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleClose">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="内部人员" name="1">
        <avue-form
          ref="allotFormRef"
          :option="allotOption"
          v-model="allotForm"
          @submit="allotSubmitBtn"
          @error="error">
          <template slot-scope="scope" slot="menuForm">
            <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
          </template>
          <template slot-scope="scope" slot="empName">
            <el-input v-model="allotForm.empName" placeholder="请选择" :disabled="true">
              <el-button slot="append" icon="el-icon-search" @click="$refs.selectEmpRef.openDialog('apartment')"></el-button>
            </el-input>
          </template>
        </avue-form>
      </el-tab-pane>
      <el-tab-pane label="外来访客" name="2">
        <avue-form
          ref="visitorFormRef"
          :option="visitorOption"
          v-model="visitorForm">
          <template slot-scope="scope" slot="menuForm">
            <el-button @click="readIdCard" >读身份证</el-button>
            <el-button @click="visitorSubmitBtn" icon="el-icon-check" type="primary">保存</el-button>
            <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
          </template>
          <template slot-scope="scope" slot="visitorIdCardPhoto" class="formClassName1">
            <div style="width: 110px;height: 130px;border: 1px solid #E8E8E8;text-align: center;">
              <img :src="visitorForm.visitorIdCardPhoto" />
            </div>
          </template>
          <template slot-scope="scope" slot="visitorPhoto">
            <div style="width: 110px;height: 130px;border: 1px solid #E8E8E8;text-align: center;display: flex;align-items: center;justify-content: center;">
              <i v-if="!visitorForm.visitorPhoto" class="iconfont icon-shexiangtou" style="font-size: 40px !important;cursor: pointer;" @click="openCamera"></i>
              <img v-else :src="visitorForm.visitorPhoto" width="100%" @click="openCamera" />
            </div>
          </template>
        </avue-form>
      </el-tab-pane>
    </el-tabs>

    <select-emp ref="selectEmpRef" @getEmpInfo="getEmpInfo" :dormType="2"></select-emp>
    <open-camera ref="openCameraRef" @getImgInfo="getImgInfo"></open-camera>
  </el-dialog>
</template>

<script>
  import axios from "axios";
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import moment from 'moment'
  import selectEmp from "../dorm_checkin/select-emp.vue"
  import { getBedContainerSelect, allotSubmit } from "@/api/dorm/dorm_checkin.js"
  import { visitorAllotSubmit } from '@/api/dorm/apartment_manage.js'
  import { isvalidatemobile } from '@/util/validate.js'
  import openCamera from './open_camera.vue'
  import { getSystemDetails} from '@/api/dorm/dorm_mng.js'

  export default{
    components:{ selectEmp, openCamera },
    data(){
      return{
        title:'',
        dialogVisible:false,
        activeName:'1',
        allotForm:{},
        dormIdDic:[],
        bedIdDic:[],
        containerIdDic:[],
        visitorForm:{planLeaveTime:''},
        action:"",
        fileList:[],
        planLeaveTime:'',
        pickerOptions:{}
      }
    },
    mounted() {
      getSystemDetails().then(r => {
        if(r.data.code == 200){
          let d = r.data.data;
          this.planLeaveTime = d.DAY_NODE_HOUR;
        }
      })
    },
    watch:{
      'visitorForm.entryTime':{
        handler(val){
          if(val){
            if(new Date(val).getTime() >= new Date()){
              this.visitorForm.planLeaveTime = moment(val).add(1,'day').format('YYYY-MM-DD') +' ' + this.planLeaveTime
              this.pickerOptions = {
                disabledDate:(time) => {
                  return time.getTime()+24*60*60*1000 < new Date(val).getTime();
                },
              }
            }else{
              this.visitorForm.planLeaveTime = moment().add(1,'day').format('YYYY-MM-DD') +' ' + this.planLeaveTime
              this.pickerOptions = {
                disabledDate:(time) => {
                  return time.getTime()+24*60*60*1000 < new Date().getTime();
                },
              }
            }
          }
        }
      }
    },
    methods:{
      openCamera(){
        this.$refs.openCameraRef.openDialog();
      },
      getImgInfo(val){
        this.visitorForm.visitorPhoto = val;
      },
      visitorSubmitBtn(done){
        this.$refs.visitorFormRef.validate((vaild,done)=>{
          if(vaild){
            let form = {...this.visitorForm};
            if(!form.visitorPhoto){
              this.$message.warning('请先拍照');
              done();
              return;
            }
            form['liveEmpType'] = 3
            form['visitorSex'] = form['visitorSex'] == '女' ? 2 : 1
            visitorAllotSubmit(form).then(r => {
              if(r.data.code == 200){
                this.$message.success(r.data.msg)
                this.$emit('refeshPage')
                this.$emit('refeshDorm')
                this.handleClose();
                done();
              }else{
                this.$message.error(r.data.msg)
                done();
              }
            }).catch(() => {
              done()
            })
          }
        })
      },
      allotSubmitBtn(form,done){
        form['empType'] = 2
        form['liveEmpType'] = 2
        allotSubmit(form).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.$emit('refeshPage')
            this.$emit('refeshDorm')
            this.handleClose();
            done();
          }else{
            this.$message.error(r.data.msg)
            done();
          }
        }).catch(() => {
          done()
        })
      },
      getEmpInfo(val){
        let form = val[0]
        this.allotForm.empName = form.empName
        this.allotForm.empId = form.id
      },
      openDialog(val){
        this.dialogVisible = true;
        this.title = `【${val.form.dormName}】分配`;
        this.allotForm.dormId = val.form.id
        this.visitorForm.dormId = val.form.id
        this.allotForm.entryTime = moment().format('YYYY-MM-DD HH:mm:ss')
        this.visitorForm.entryTime = moment().format('YYYY-MM-DD HH:mm:ss')
        this.visitorForm.planLeaveTime = moment().add(1,'day').format('YYYY-MM-DD') +' ' + this.planLeaveTime
        this.getBedContainer()
      },
      // 获取该宿舍空床和空柜
      getBedContainer(val){
        let id = ""
        if(val){
          id = val.id
        }else{
          id = this.allotForm.dormId
          this.allotTitle = "分配"
        }
        getBedContainerSelect({dormId:id}).then(r => {
          if(r.data.code == 200){
            let arr = [],arr1 = [];
            r.data.data.bads.forEach(v => {
              arr.push({
                value:v.id,
                label:v.name
              })
            })
            r.data.data.cabinets.forEach(v => {
              arr1.push({
                value:v.id,
                label:v.name
              })
            })
            this.bedIdDic = arr
            this.containerIdDic = arr1;
            this.visitorForm.badId = arr[0].value
            this.visitorForm.cabinetId = arr1[0].value
            this.allotForm.badId = arr[0].value
            this.allotForm.cabinetId = arr1[0].value
          }
          if(this.btnType == "allot"){
            this.dialogVisible = true
          }
        })
      },
      readIdCard() {
        axios.get("http://127.0.0.1:18888/idcard?photoBase64=true").then(r => {
          let d = r.data;
          let form = {}
          form['visitorName'] = d.username
          form['visitorSex'] = d.sex
          form['visitorAddress'] = d.address
          form['visitorIdCardNo'] = d.idNo
          form['visitorIdCardPhoto'] = d.photoBase64
          this.$nextTick(() => {
            this.$forceUpdate()
            this.visitorForm = Object.assign({},this.visitorForm, form);
          })
        }).catch(() => {
          this.$message.warning('请检测读取器服务是否启动正常')
        })
      },
      handleClose(){
        this.$refs['visitorFormRef'].clearValidate();
        this.$refs['visitorFormRef'].resetForm();
        this.$refs['allotFormRef'].clearValidate();
        this.$refs['allotFormRef'].resetForm();
        this.dialogVisible = false;
      },
    },
    computed:{
      visitorOption(){
        return{
          emptyBtn: false,
          submitBtn:false,
          column:[
            {
              label:'姓名',
              prop:'visitorName',
              span:12,
              readonly:true,
              row:true,
              placeholder:"请读取身份证"
            },
            {
              label:'性别',
              prop:'visitorSex',
              span:12,
              readonly:true,
              row:true,
              placeholder:"请读取身份证"
            },
            {
              label:'身份证号',
              prop:'visitorIdCardNo',
              span:12,
              readonly:true,
              placeholder:"请读取身份证",
              row:true,
            },
            {
              label:'家庭住址',
              prop:'visitorAddress',
              span:12,
              readonly:true,
              placeholder:"请读取身份证",
            },
            {
              label:'联系方式',
              prop:'visitorPhone',
              span:12,
              rules:[{
                validator: (rule, value, callback) => {
                  if (isvalidatemobile(value)[0]) {
                    callback(new Error(isvalidatemobile(value)[1]));
                  } else {
                    callback();
                  }
                },
                required:true,
                trigger:"blur"
              }]
            },
            {
              label:"床号",
              prop:"badId",
              type:"select",
              span:12,
              rules:[{
                required:true,
                message:"请选择床号",
                trigger:"change"
              }],
              dicData:this.bedIdDic
            },
            {
              label:"入住日期",
              prop:"entryTime",
              span:12,
              type:'datetime',
              rules:[{
                required:true,
                message:"请选择入住日期",
                trigger:"change"
              }],
              format:'yyyy-MM-dd HH:mm:ss',
              valueFormat:'yyyy-MM-dd HH:mm:ss',
            },
            {
              label:"柜号",
              prop:"cabinetId",
              span:12,
              type:"select",
              rules:[{
                required:true,
                message:"请选择柜号",
                trigger:"change"
              }],
              dicData:this.containerIdDic
            },
            {
              label:"退宿日期",
              prop:"planLeaveTime",
              span:12,
              type:'datetime',
              format:'yyyy-MM-dd HH:mm:ss',
              valueFormat:'yyyy-MM-dd HH:mm:ss',
              pickerOptions: this.pickerOptions
            },
            {
              label:'备注',
              prop:'remark',
              span:12,
              maxRows:6,
              minRows:4,
              maxlength:100,
              type:"textarea"
            },
            {
              label:'',
              labelWidth:0,
              prop:'visitorIdCardPhoto',
              span:5,
              formslot:true,
              className:'formClassName1'
            },
            {
              label:'',
              labelWidth:0,
              prop:'visitorPhoto',
              span:5,
              formslot:true,
              className:'formClassName2'
            }
          ]
        }
      },
      allotOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"姓名",
              prop:"empName",
              span:12,
              rules:[{
                required:true,
                message:"请选择姓名",
                trigger:"blur"
              }],
              formslot: true,
            },
            {
              label:"分配日期",
              prop:"entryTime",
              span:12,
              type:'datetime',
              rules:[{
                required:true,
                message:"请选择分配日期",
                trigger:"change"
              }],
              format:'yyyy-MM-dd HH:mm:ss',
              valueFormat:'yyyy-MM-dd HH:mm:ss',
            },
            {
              label:"床号",
              prop:"badId",
              type:"select",
              span:12,
              rules:[{
                required:true,
                message:"请选择床号",
                trigger:"change"
              }],
              dicData:this.bedIdDic
            },
            {
              label:"柜号",
              prop:"cabinetId",
              span:12,
              type:"select",
              rules:[{
                required:true,
                message:"请选择柜号",
                trigger:"change"
              }],
              dicData:this.containerIdDic
            },
            {
              label:'备注',
              prop:'remark',
              span:12,
              maxRows:6,
              minRows:4,
              maxlength:100,
              type:"textarea"
            }
          ]
        }
      }
    }
  }
</script>

<style scoped="scoped" lang="scss">
  /deep/.el-dialog__body{
    padding: 0 20px 30px;
  }
  .formClassName1{
    position: absolute;
    top: 0px;
    right: 130px;
    z-index: 100;
  }
  /deep/.avue-form, /deep/.avue-form__group {
    div:nth-child(14) {
      position: absolute;
      top: 0px;
      right: 130px;
      z-index: 100;
    }
    div:nth-child(15) {
      position: absolute;
      top: 0px;
      right: 0px;
      z-index: 100;
    }
  }
</style>
