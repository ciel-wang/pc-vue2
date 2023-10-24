<template>
  <el-dialog
    title=""
    :visible.sync="dialogVisible"
    width="30%"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleClose">
    <template slot="title">
      <div>
        <span style="font-size: 18px;margin-right: 4px;">调换</span>
        <span style="font-size: 12px;color: #909399;">仅支持同类型房间或床位之间的调换</span>
      </div>
    </template>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="按房间" name="1">
        <avue-form
          ref="roomFormRef"
          :option="roomOption"
          v-model="roomForm"
          @submit="submitBtn"
          @error="error">
          <template slot-scope="scope" slot="menuForm">
            <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
          </template>
        </avue-form>
      </el-tab-pane>

      <el-tab-pane label="按床位" name="2">
        <avue-form
          ref="bedFormRef"
          :option="bedOption"
          v-model="bedForm"
          @submit="submitBtn"
          @error="error">
          <template slot-scope="scope" slot="menuForm">
            <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
          </template>
        </avue-form>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
  import moment from 'moment'
  import { getDormZtree } from "@/api/dorm/dorm_mng.js";
  import { getBedContainerSelect } from "@/api/dorm/dorm_checkin.js"
  import { apartmentExchange } from '@/api/dorm/apartment_manage.js'

  export default{
    data(){
      return{
        dialogVisible:false,
        activeName:"1",
        roomForm:{},
        bedForm:{},
        dormIdDic:[],
        bedIdDic:[],
        containerIdDic:[],
        beforForm:{}
      }
    },
    methods:{
      submitBtn(form,done){
        form['dormId'] = form.dormId.split('-')[1]
        form['liveId'] = this.beforForm.liveId
        if(this.activeName == 1){
          form['liveEmpType'] = this.beforForm.liveEmpType
        }else{
          form['empId'] = this.beforForm.liveEmpType == 2 ? this.beforForm.id : this.beforForm.visitorId
          form['liveEmpType'] = this.beforForm.liveEmpType
        }
        apartmentExchange(form).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.$emit('refeshPage')
            this.$emit('refeshDorm')
            this.handleClose()
            done()
          }else{
            this.$message.error(r.data.msg)
            done()
          }
        }).catch(() => {
          done()
        })
      },
      openDialog(val){
        this.dialogVisible = true
        this.beforForm = val
        let costType = val.costType;
        getDormZtree({stype:'APARTMENT-'+costType}).then(r => {
          this.dormIdDic = r.data;
        })
        this.roomForm.entryTime = moment().format('YYYY-MM-DD HH:mm:ss')
        this.bedForm.entryTime = moment().format('YYYY-MM-DD HH:mm:ss')
        this.bedForm.empName = val.empName ? val.empName : val.vidisotName
      },
      getBedContainer(val){
        getBedContainerSelect({dormId:val.id}).then(r => {
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
          }
        })
      },
      handleClose(){
        if(this.activeName == 1){
          this.$refs['roomFormRef'].clearValidate();
          this.$refs['roomFormRef'].resetForm();
        }else{
          this.$refs['bedFormRef'].clearValidate();
          this.$refs['bedFormRef'].resetForm();
        }
        this.dialogVisible = false;
      }
    },
    computed:{
      roomOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"宿舍",
              prop:'dormId',
              type:"tree",
              span:24,
              dicData:this.dormIdDic,
              rules:[{
                required:true,
                message:"请选择宿舍",
                trigger:"change"
              }],
              props:{
                value:'valueStr'
              }
            },
            {
              label:"调换日期",
              prop:"entryTime",
              span:24,
              type:'datetime',
              rules:[{
                required:true,
                message:"请选择调换日期",
                trigger:"change"
              }],
              format:'yyyy-MM-dd HH:mm:ss',
              valueFormat:'yyyy-MM-dd HH:mm:ss',
              pickerOptions:{
                disabledDate:(time) => {
                  return time.getTime()+24*60*60*1000 < Date.now();
                },
              }
            },
            {
              label:'备注',
              prop:'remark',
              span:24,
              maxRows:6,
              minRows:4,
              type:"textarea"
            }
          ]
        }
      },
      bedOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"姓名",
              prop:"empName",
              span:24,
              readonly:true
            },
            {
              label:"宿舍",
              prop:'dormId',
              type:"tree",
              span:24,
              dicData:this.dormIdDic,
              rules:[{
                required:true,
                message:"请选择宿舍",
                trigger:"change"
              }],
              props:{
                value:'valueStr'
              },
              nodeClick:(data, node,ref)=>{
                let that = this;
                if(data.valueStr.startsWith('DORM')){
                  that.getBedContainer({id:data.value})
                }else{
                  that.$message.error('请选择到宿舍')
                  that.bedForm.dormId = ""
                }
              }
            },
            {
              label:"床号",
              prop:"badId",
              type:"select",
              span:24,
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
              span:24,
              type:"select",
              rules:[{
                required:true,
                message:"请选择柜号",
                trigger:"change"
              }],
              dicData:this.containerIdDic
            },
            {
              label:"调换日期",
              prop:"entryTime",
              span:24,
              type:'datetime',
              rules:[{
                required:true,
                message:"请选择调换日期",
                trigger:"change"
              }],
              format:'yyyy-MM-dd HH:mm:ss',
              valueFormat:'yyyy-MM-dd HH:mm:ss',
              pickerOptions:{
                disabledDate:(time) => {
                  return time.getTime()+24*60*60*1000 < Date.now();
                },
              }
            },
            {
              label:'备注',
              prop:'remark',
              span:24,
              maxRows:6,
              minRows:4,
              type:"textarea"
            }
          ]
        }
      }
    }
  }
</script>

<style lang="scss" scoped="scoped">
  /deep/.el-dialog__body{
    padding: 0 20px 30px;
  }
</style>
