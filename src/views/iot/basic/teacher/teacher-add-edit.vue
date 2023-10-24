<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :modal-append-to-body="true"
    width="1200px"
    top="8vh"
    :lock-scroll="true"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :append-to-body="true"
    :before-close="handleClose">
    <avue-form
      v-if="dialogVisible"
      ref="formRef"
      :option="option"
      v-model="form"
      @submit="submit"
      @error="error">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
  import moment from "moment";
  import axios from "axios";
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import { teacherAdd, teacherUpdate} from "@/api/iot/teacher.js"
  import { getGenrateEmpCode } from "@/api/iot/student.js"
  import XEUtils from 'xe-utils'
  import {isvalidatemobile,validateEmpCode} from '@/util/validate.js'
  export default {
    props:['empStatusDic','empPostDic','resignTypeDic','userCategoryDic','deptDic'],
    data() {
      return {
        dialogVisible: false,
        title:"添加教师",
        form: {empSex: "1",facePicSyncDev:false},
        resignDisabled:true,
      }
    },
    methods:{
      handleClose() {
        this.form = {}
        this.checkList = []
        this.dialogVisible = false;
      },
      openDialog(details){
        this.dialogVisible = true;
        if(details){
          this.title = "编辑教师"
          this.rowway = "edit"
          this.form = details;
          this.form.facePicSyncDev = false;
        }else{
          this.title = "添加教师"
          this.form.empSex = 1
          this.form.empPost = this.empPostDic[0].value;
          this.form.empStatus = this.empStatusDic[0].value
          this.form.empCategory = this.userCategoryDic[0].value;
          this.form.deptId = this.deptDic[0].valueStr;
          this.form.facePicSyncDev = false;
          this.rowway = "add"
          getGenrateEmpCode().then(r => {
            let empCode = r.data.data.newEmpCode;
            this.form.empCode = empCode;
          })
        }
      },
      submit(form,done) {
        this.$refs.formRef.validate((vaild, done) => {
          if (vaild) {
            if(form.deptId.startsWith('SCHOOL')){
              this.$message.error("请选择部门级别");
              this.form.deptId = ""
              done();
              return;
            }else{
              let arr = form.deptId.split('-')
              form.deptId = arr[1]
            }
            if(this.rowway == 'edit'){
              teacherUpdate(form).then(r => {
                if(r.data.code == 200){
                  this.$message.success(r.data.msg)
                  this.$emit('refeshPage')
                  this.handleClose()
                }else{
                  this.$message.error(r.data.msg)
                }
                done();
              }).catch(()=> done())
            }else{
              teacherAdd(form).then(r => {
                if(r.data.code == 200){
                  this.$message.success(r.data.msg)
                  this.$emit('refeshPage')
                  this.handleClose()
                }else{
                  this.$message.error(r.data.msg)
                }
                done();
              }).catch(()=> done())
            }
          }
        })
      },
    },
    computed: {
      option() {
        return {
          emptyBtn: false,
          submitText: "保存",
          group: [
            {
              label: "基础资料",
              prop: "basicInfo",
              icon: "el-icon-s-custom",
              column: [
                {
                  label:"工号",
                  prop:"empCode",
                  span:6,
                  rules:[{
                    validator: (rule, value, callback) => {
                      if (value === "") {
                        callback(new Error("请输入工号"));
                      } else {
                        if (!validateEmpCode(value)) {
                          callback(new Error("工号由数字或字母组成，最大20位"));
                        } else {
                          callback();
                        }
                      }
                    },
                    required:true,
                    trigger:"blur"
                  }],
                  maxlength:20
                },
                {
                  label: "性别",
                  prop: "empSex",
                  span: 6,
                  type:"radio",
                  dicData:[
                    {value:1,label:"男"},
                    {value:2,label:"女"}
                  ],
                  row:true
                },
                {
                  label: "姓名",
                  prop: "empName",
                  span: 6,
                  rules:[{
                    required:true,
                    message:"请输入姓名",
                    trigger:"blur"
                  }],
                  maxlength:20
                },
                {
                  label:"职工状态",
                  prop:"empStatus",
                  span:6,
                  type:"select",
                  dicData:this.empStatusDic,
                  change:({value})=>{
                    let that = this;
                    if(value == 4){
                      that.resignDisabled = false;
                      that.quitStatusRequire = true;
                      that.form.resignDate = that.form.resignDate ? that.form.resignDate : new Date();
                      that.form.resignType = 1;
                    }else{
                      that.resignDisabled = true;
                      that.quitStatusRequire = false;
                      that.form.resignDate = "";
                      that.form.resignType = "";
                    }
                  }
                },
                {
                  label:"职务",
                  prop:"empPost",
                  span:6,
                  type:"select",
                  dicData:this.empPostDic,
                  row:true
                },
                {
                  label:"部门",
                  prop:"deptId",
                  span:6,
                  type:"tree",
                  dicData:this.deptDic,
                  rules:[{
                    required:true,
                    message:"请选择部门",
                    trigger:"change"
                  }],
                  props:{
                    value:'valueStr'
                  },
                },
                {
                  label: "身份证号",
                  prop: "idCardNo",
                  span: 6,
                  maxlength:18
                },
                {
                  label: "入职日期",
                  valueFormat:'yyyy-MM-dd',
                  type: "date",
                  span: 6,
                  prop: "entryYear",
                  row:true
                },
                {
                  label: "手机号码",
                  prop: "empPhone",
                  span: 6,
                  rules:[{
                    validator: (rule, value, callback) => {
                      if (isvalidatemobile(value)[0]) {
                        callback(new Error(isvalidatemobile(value)[1]));
                      } else {
                        callback();
                      }
                    },
                    required:true,
                    trigger:"blur",
                  }],
                  maxlength:11
                },
                {
                  label:"职工分类",
                  prop:"empCategory",
                  span:6,
                  type:"select",
                  dicData:this.userCategoryDic,
                },
                {
                  label:"自动同步AIoT设备",
                  prop:"facePicSyncDev",
                  span:12,
                  labelWidth:430,
                  type:"radio",
                  dicData:[
                    {value:true,label:"是"},
                    {value:false,label:"否"}
                  ]
                },
                {
                  label: "现居住地址",
                  prop: "residence",
                  span: 12,
                  maxlength:99
                },
                {
                  label: "",
                  prop: "faceUrl",
                  type: "upload",
                  loadText: "上传中，请稍等",
                  limit: 1,
                  listType: "picture-img",
                  span: 6,
                  drag: false,
                  propsHttp: {
                    res: "data"
                  },
                  data: {
                    basicUserId: this.form.id == null ? 0 : this.form.id
                  },
                  tip: "支持上传JPG,JPEG,PNG格式的图片,单张图片大小不能超过5M",
                  action: `/api/iot-basic/user/upload/user/faceimg?${this.website.tokenHeader}=${getToken()}`
                },

              ],
            },
            {
              label: "个人资料",
              prop: "basicInfo",
              collapse: false,
              icon: "el-icon-s-custom",
              column: [
                {
                  label: "离职方式",
                  prop: "resignType",
                  type:"select",
                  dicData:this.resignTypeDic,
                  span: 6,
                  disabled: this.resignDisabled,
                  rules: [{
                    required: this.quitStatusRequire,
                    message: "请选择离职方式",
                    trigger: "blur"
                  }],
                },
                {
                  label: "离职日期",
                  prop: "resignDate",
                  type: "date",
                  span: 6,
                  disabled: this.resignDisabled,
                  rules: [{
                    required: this.quitStatusRequire,
                    message: "请选择离职日期",
                    trigger: "blur"
                  }],
                },
                {
                  label: "邮箱",
                  prop: "empEmail",
                  span: 6,
                  maxlength:20
                },
                {
                  label: "扩展一",
                  prop: "ext1",
                  span: 6,
                  maxlength:99
                },
                {
                  label: "扩展二",
                  prop: "ext2",
                  span: 6,
                  maxlength:99
                },
                {
                  label: "扩展三",
                  prop: "ext3",
                  span: 6,
                  maxlength:99
                },
              ]
            },
          ]
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
    .el-scrollbar {
        height: 100%;
    }

    // 图片的样式
    /deep/.avue-form__group {
      div:nth-child(16) {
        position: absolute;
        top: 76px;
        right: 50px;
        z-index: 100;
      }

        .avue-upload__icon {
            width: 149px !important;
            height: 149px !important;
            line-height: 116px !important;
        }

        .el-upload__tip {
            line-height: 19px;
            padding: 10px;
            width: 133px;
            margin-top: -85px !important;
        }
    }

    /deep/ .el-upload__tip {
        font-size: 12px;
        color: #c0c4cc !important;
        margin-top: 7px;
    }

    /deep/ .avue-upload__avatar {
        width: 149px !important;
        height: 149px !important;
        display: block;
    }

    /deep/.avue-upload--list .el-upload {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
    }

    .box .el-scrollbar__wrap {
        overflow: scroll;
    }

    .imgConHeight {
        border: 1px solid #dadada;
        height: 320px;
        overflow: auto;
        padding: 10px;
    }

    .upload-err-text {
        line-height: 5px;
        color: red;
    }

    .imerrText {
        width: 100%;
        height: 150px;
        border: 1px solid #efefef;
        margin-top: 10px;
        margin-top: 10px;
        overflow: auto;
        font-size: 14px;
        color: red;
    }

    .imerrText p {
        line-height: 0px;
    }
    .bgfff{
      background-color: #fff;
    }
    /deep/.el-checkbox__label{
      padding-left: 6px !important;
    }
    /deep/.el-dialog__body{
      padding: 0 20px 30px;
    }
    /deep/.el-checkbox{
      margin-right: 16px;
    }
    .checkbox{
      width: 100%;
      /deep/.vxe-checkbox--label{width: 99%;}
    }
</style>
