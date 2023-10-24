<template>
  <el-dialog
    title="批量修改班次"
    :visible.sync="dialogVisible"
    width="500px"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <p style="margin: 0 0 19px 34px;color: red;">对上一界面所选择的人和日期修改下列排班内容</p>
    <avue-form
      ref="formRef"
      :option="option"
      v-model="form"
      @submit="submit">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
  import { classesUpdate } from "@/api/kq/scheduling.js"
  export default{
    props:['classesTimeData','jbDic','kqHolidayDic'],
    data(){
      return{
        dialogVisible:false,
        form:{isUpdateDayProperties:[],isUpdateDayClassestimeNum:[],dayMode:''},
        holidayNameDIS:true
      }
    },
    methods:{
      openDialog(form = {}){
        this.form = form;
        this.form.isUpdateDayProperties = []
        this.form.isUpdateDayClassestimeNum = []
        this.dialogVisible = true;
      },
      submit(){
        this.$refs.formRef.validate((vaild, done) => {
          if (vaild) {
            let form = {...this.form};
            form.isUpdateDayProperties = form.isUpdateDayProperties.length ? true : false;
            form.isUpdateDayClassestimeNum = form.isUpdateDayClassestimeNum.length ? true : false;
            classesUpdate(form).then(r => {
              done()
              if(r.data.code == 200){
                this.$message.success(r.data.msg)
                this.$emit('refreshPage')
                this.handleClose()
              }else{
                this.$message.error(r.data.msg)
              }
            }).catch(() => done())
          }
        })
      },
      handleClose(){
        this.$refs['formRef'].clearValidate();
        this.$refs["formRef"].resetForm();
        this.dialogVisible = false;
      },
    },
    computed:{
      option(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"",
              prop:"isUpdateDayProperties",
              type:'checkbox',
              labelWidth:0,
              dicData:[{value:true,label:"修改当天属性"}],
              change:({value}) => {
                let that = this;
                if(!value || !value.length || that.form.dayMode != 3){
                  that.holidayNameDIS = true;
                }else{
                  that.holidayNameDIS = false;
                }
              }
            },
            {
              label:"假日属性",
              prop:"dayMode",
              type:"radio",
              dicData:[
                {value:1,label:"工作日"},
                {value:2,label:"休息日"},
                {value:3,label:"节假日"}
              ],
              span:24,
              change:({value}) => {
                let that = this;
                if(value === 1){
                  let item = that.jbDic.find(v => v.label === '平日加班');
                  that.form.overtimeTypeRoleId = item ? item.value : ""
                  that.form.holidayName = "";
                  that.holidayNameDIS = true;
                }
                if(value === 2){
                  let item = that.jbDic.find(v => v.label === '周日加班');
                  that.form.overtimeTypeRoleId = item ? item.value : ""
                  that.form.holidayName = "周休";
                  that.holidayNameDIS = true;
                }
                if(value === 3){
                  that.holidayNameDIS = false;
                  let item = that.jbDic.find(v => v.label === '假日加班');
                  that.form.overtimeTypeRoleId = item ? item.value : ""
                  that.form.holidayName = that.kqHolidayDic.length ? that.kqHolidayDic[0].value : '';
                }
              },
              disabled:this.form.isUpdateDayProperties.length ? false : true
            },
            {
              label:"假日名称",
              prop:"holidayName",
              type:"select",
              clearable:false,
              dicData:this.form.dayMode == 2 ? [{value:'周休',label:"周休日"}] : this.kqHolidayDic,
              span:24,
              disabled:this.holidayNameDIS
            },
            {
              label:"加班类型",
              prop:"overtimeTypeRoleId",
              type:"select",
              clearable:false,
              dicData:this.jbDic,
              span:24,
              disabled:this.form.isUpdateDayProperties.length ? false : true
            },
            {
              label:"",
              labelWidth:0,
              prop:"isUpdateDayClassestimeNum",
              type:'checkbox',
              dicData:[{value:true,label:"修改当天班次"}]
            },
            {
              label:"班次编号",
              prop:"classesTimeNum",
              type:"select",
              filterable:true,
              dicData:this.classesTimeData,
              span:24,
              disabled:this.form.isUpdateDayClassestimeNum.length ? false : true
            }
          ]
        }
      }
    }
  }
</script>

<style>
</style>
