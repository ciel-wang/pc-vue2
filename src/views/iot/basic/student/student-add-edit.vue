<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :modal-append-to-body="true"
    width="1200px"
    :lock-scroll="true"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :append-to-body="true"
    :before-close="handleClose">
    <avue-form
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
  import { studentAdd , studentUpdate, getGenrateEmpCode,  } from "@/api/iot/student.js"
  import {validateEmpCode,cardid} from '@/util/validate.js'

  export default {
    props:['classIdDic','empStatusOptionList','empCategoryOptionList'],
    data() {
      return {
        dialogVisible: false,
        title:"添加学生",
        form: { empSex: "1",facePicSyncDev:false },
        resignDisabled:true,
        studentStatus:[],
      }
    },
    methods:{
      handleClose() {
        this.$refs.formRef.resetFields();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
      openDialog(details){
        this.dialogVisible = true;
        this.studentStatus = [];
        if(details){
          this.title = "编辑"
          this.rowway = "edit"
          this.form = details
          this.form.classId = details.gsTreeKey;
          this.form.facePicSyncDev = false;
          this.studentStatus = this.empStatusOptionList;
        }else{
          this.studentStatus = this.empStatusOptionList.filter(v => v.value != 1007);
          this.title = "添加学生"
          this.form.empSex = 1
          this.form.isLive = false;
          this.form.facePicSyncDev = false;
          this.form.empStatus = this.studentStatus[0].value
          this.form.empCategory = this.empCategoryOptionList[0].value
          this.rowway = "add"
          getGenrateEmpCode().then(r => {
            let empCode = r.data.data.newEmpCode;
            this.form.empCode = empCode;
          })
        }
        this.$nextTick(() => this.$refs.formRef.clearValidate());
      },
      submit(form,done) {
        this.$refs.formRef.validate((vaild, done) => {
          if (vaild) {
            let arr = form.classId.split('-');
            if(arr.length != 4){
              this.$message.error("请选择班级");
              done();
              form.classId = "";
              return;
            }else{
              form.classId = arr[3];
            }
            if(this.rowway == 'edit'){
              studentUpdate(form).then(r => {
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
              studentAdd(form).then(r => {
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
                  label:"学号",
                  prop:"empCode",
                  span:6,
                  rules:[{
                    validator: (rule, value, callback) => {
                      if (value === "") {
                        callback(new Error("请输入学号"));
                      } else {
                        if (!validateEmpCode(value)) {
                          callback(new Error("学号由数字或字母组成，最大20位"));
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
                },
                {
                  label: "入学日期",
                  prop: "entryYear",
                  type: "date",
                  span: 6,
                  format:'yyyy-MM-dd',
                  valueFormat:'yyyy-MM-dd',
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
                  label: "学籍号",
                  prop: "studentCode",
                  span: 6,
                  maxlength:19
                },
                {
                  label:"学生状态",
                  prop:"empStatus",
                  span:6,
                  type:"select",
                  dicData:this.studentStatus,
                  row:true,
                  change:({value})=>{
                    let that = this;
                    let item = that.studentStatus.find(v => v.value === value);
                    if(item && (item.label === "毕业" || item.label === "退学")){
                      that.resignDisabled = false;
                      that.quitStatusRequire = true;
                      that.form.resignDate = that.form.resignDate ? that.form.resignDate : moment().format('YYYY-MM-DD');
                    }else{
                      that.resignDisabled = true;
                      that.quitStatusRequire = false;
                      that.form.resignDate = "";
                    }
                  }
                },
                {
                  label:"班级",
                  prop:"classId",
                  span:6,
                  type:"tree",
                  dicData:this.classIdDic,
                  rules:[{
                    required:true,
                    message:"请选择班级",
                    trigger:"blur"
                  }],
                  props:{
                    value:'valueStr',
                  }
                },
                {
                  label: "学生类型",
                  prop: "empCategory",
                  span: 6,
                  type:"select",
                  dicData:this.empCategoryOptionList,
                },
                {
                  label: "住宿",
                  prop: "isLive",
                  span: 6,
                  type:"radio",
                  dicData:[
                    {value:true,label:"是"},{value:false,label:"否"}
                  ],
                  row:true,
                },
                {
                  label:"身份证号",
                  prop:'idCardNo',
                  span:6,
                  rules:[{
                    validator: (rule, value, callback) => {
                      if (cardid(value)[0]) {
                        callback(new Error(cardid(value)[1]));
                      } else {
                        callback();
                      }
                    },
                    required:true,
                    trigger:"blur"
                  }],
                },
                {
                  label: "手机号码",
                  prop: "empPhone",
                  span: 6,
                  maxlength:11
                },
                {
                  label: "现居住地址",
                  prop: "residence",
                  span: 6,
                  maxlength:99
                },
                {
                  label:"自动同步AIoT设备",
                  prop:"facePicSyncDev",
                  span:6,
                  labelWidth:130,
                  type:"radio",
                  dicData:[
                    {value:true,label:"是"},
                    {value:false,label:"否"}
                  ]
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
                  propsHttp: { res: "data" },
                  data: {
                    basicUserId: this.form.id == null ? 0 : this.form.id
                  },
                  tip: "支持上传JPG,JPEG,PNG格式的图片,单张图片大小不能超过5M",
                  action: `/api/iot-basic/user/upload/user/faceimg?${website.tokenHeader}=${getToken()}`
                }
              ],
            },
            {
              label: "个人资料",
              prop: "basicInfo",
              collapse: false,
              icon: "el-icon-s-custom",
              column: [
                {
                  label: "离校日期",
                  prop: "resignDate",
                  type: "date",
                  span: 6,
                  disabled: this.resignDisabled,
                  rules: [{
                    required: this.quitStatusRequire,
                    message: "请选择离校日期",
                    trigger: "blur"
                  }],
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
              ],
            }
          ],
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  /deep/.avue-form__group {
    div:nth-child(17) {
      position: absolute !important;
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
  /deep/.el-dialog__body{
    padding: 0 20px 30px;
  }
</style>
