<template>
  <!-- 单个分配和调换表单 -->
  <el-dialog
    :title="allotTitle"
    :visible.sync="allotDialogVisible"
    width="30%"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleClose">
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
          <el-button v-if="btnType == 'allot'" slot="append" icon="el-icon-search" @click="empNameClick"></el-button>
        </el-input>
      </template>
    </avue-form>
    <select-emp ref="selectEmpRef" @getEmpInfo="getEmpInfo" :dormType="dormType"></select-emp>
  </el-dialog>
</template>

<script>
  import moment from 'moment'
  import selectEmp from "./select-emp.vue"
  import { getDormZtree } from "@/api/dorm/dorm_mng.js";
  import { getBedContainerSelect, allotSubmit, exchange } from "@/api/dorm/dorm_checkin.js"

  export default{
    props:{
      dormType:{
        type:Number,
        default:1
      }
    },
    components:{ selectEmp },
    data(){
      return{
        allotTitle:"分配",
        allotForm:{},
        allotDialogVisible:false,
        btnType:"",
        bedIdDic:[],
        containerIdDic:[],
        dormIdDic:[],
        exchangeBtn:false,
        dateLabel:"",
      }
    },
    mounted() {
      getDormZtree({stype:'DORM'}).then(r => {
        this.dormIdDic = r.data;
      })
    },
    methods:{
      openDialog(val){
        this.btnType = val.btnType;
        if(val.btnType == 'exchange'){
          this.allotTitle = "调换"
          this.allotForm.empName = val.form.empName;
          this.allotForm.empId = val.form.id;
          this.exchangeBtn = true;
          this.dateLabel = "调换日期"
          this.allotDialogVisible = true
        }else if(val.btnType == 'allot'){
          this.allotForm.dormId = val.form.id;
          this.allotForm.dormName = val.form.dormName;
          this.exchangeBtn = false;
          this.dateLabel = "分配日期"
          this.getBedContainer()
        }
        this.allotForm.entryTime = moment().format('YYYY-MM-DD');
      },
      // 获取该宿舍空床和空柜
      getBedContainer(val){
        let id = ""
        if(val){
          id = val.id
        }else{
          id = this.allotForm.dormId
          this.allotTitle = `【${this.allotForm.dormName}】分配`;
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
            this.allotForm.badId = arr.length ? arr[0].value : ''
            this.allotForm.cabinetId = arr1.length ? arr1[0].value : ''
          }
          if(this.btnType == "allot"){
            this.allotDialogVisible = true
          }
        })
      },
      allotSubmitBtn(form,done){
        form['isAdmin'] = form.isAdmin[0]
        if(this.btnType == "allot"){
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
        }else if(this.btnType == 'exchange'){
          form['afterBadId'] = form.badId
          form['afterCabinetId'] = form.cabinetId
          exchange(form).then(r => {
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
      },
      empNameClick(){
        this.$refs.selectEmpRef.openDialog('dorm');
      },
      getEmpInfo(val){
        let form = val[0]
        this.allotForm.empName = form.empName
        this.allotForm.empId = form.id
      },
      handleClose(){
        this.$refs['allotFormRef'].clearValidate();
        this.$refs['allotFormRef'].resetForm();
        this.allotDialogVisible = false;
      },
    },
    computed:{
      allotOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"姓名",
              prop:"empName",
              span:20,
              rules:[{
                required:true,
                message:"请选择姓名",
                trigger:"blur"
              }],
              formslot: true,
            },
            {
              label:"",
              labelWidth:0,
              span:4,
              prop:'isAdmin',
              type:"checkbox",
              dicData:[
                {value:true,label:"舍长"}
              ],
              display:this.dormType == 1 ? true : false
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
              display:this.exchangeBtn,
              nodeClick:(data, node,ref)=>{
                let that = this;
                if(data.valueStr.startsWith('DORM')){
                  that.getBedContainer({id:data.value})
                }else{
                  that.$message.error('请选择到宿舍')
                  that.allotForm.dormId = ""
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
              label:this.dateLabel,
              prop:"entryTime",
              span:24,
              type:'date',
              rules:[{
                required:true,
                message:"请选择"+this.dateLabel,
                trigger:"change"
              }],
              format:'yyyy-MM-dd',
              valueFormat:'yyyy-MM-dd',
              pickerOptions:{
                disabledDate:(time) => {
                  return this.btnType == 'exchange' ? time.getTime()+24*60*60*1000 < Date.now() : '';
                },
              }
            },
            {
              label:'备注',
              prop:'remark',
              span:24,
              maxRows:6,
              minRows:4,
              type:"textarea",
              maxlength:100
            }
          ]
        }
      }
    }
  }
</script>

<style>
</style>
