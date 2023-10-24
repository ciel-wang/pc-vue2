<template>
    <!-- 人员信息的导入资料模块 -->
  <el-dialog :title="title" append-to-body :visible.sync="dialogVisible" width="580px" class="info">
    <p style="margin-left:35px" v-if="['student','teacher'].includes(type)">
      <el-radio v-model="execlReplace" :disabled="isDisabled" label="1">新增用户</el-radio>
      <el-radio v-model="execlReplace" :disabled="isDisabled"  label="2">更新用户</el-radio>
      <span class="itt">{{importTipTxt}}</span>
    </p>
    <div
      style="line-height: 10px; padding-bottom: 10px; background: #f5f6f7; margin-bottom: 13px; padding-top: 5px; width: 522px; margin-left: -20px; padding-left: 58px;"
      v-if="['student','teacher','parents'].includes(type)">
      <p>注释：</p>
      <p>1.请下载当前页面模板并上传用户数据，且大小不超过3M;</p>
      <p v-if="type == 'student'">2.创建学生信息规则：excel中学号、学籍号不能重复；</p>
      <p v-if="type == 'teacher'">2.创建教师信息规则：excel中工号、手机号、身份证号不能重复；</p>
      <p v-if="type == 'student'">3.更新指批量修改学生年级、班级、学生状态、学生类型等；</p>
      <p v-if="type == 'teacher'">3.更新指批量修改教师部门、手机号、职工状态、职务、身份证号等；</p>
    </div>
    <avue-form
      :option="excelOption"
      :upload-before="uploadBefore"
      :on-change="handleChangeExcelImport"
      v-model="excelForm"
      :upload-after="uploadExcelAfter">
      <template slot="excelTemplate">
        <div>
          <el-button type="primary" @click="handleTemplate">
            点击下载<i class="el-icon-download el-icon--right"></i>
          </el-button>
          <div v-if="importExcelErrors.length > 0" class="imerrText">
            <p v-for="(v,i) in importExcelErrors" :key="i">
              {{v}}
            </p>
          </div>
        </div>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
  import moment from 'moment';
  import axios from 'axios';
  import {mapGetters} from 'vuex';
  import website from '@/config/website';
  import {getToken} from '@/util/auth';

  export default {
    data() {
      return {
        isDisabled:false,
        importTipTxt:"",
        excelForm:{},
        execlReplace:"1",
        dialogVisible:false,
        fileListExcelImport:[],
        importExcelErrors:[],
        action:"",
        type:"",
        title:""
      };
    },
    created() {
    },
    computed:{
      ...mapGetters(['userInfo']),
      excelOption(){
        return {
        submitBtn: false,
        emptyBtn: false,
        column: [
          {
            label: '模板上传',
            prop: 'file',
            type: 'upload',
            drag: true,
            loadText: '模板上传中，请稍等',
            span: 24,
            propsHttp: {
              res: 'data'
            },
            data:{
              "execlReplace":this.execlReplace
            },
            action: this.action
          },
          {
            label: '模板下载',
            prop: 'excelTemplate',
            formslot: true,
            span: 24,
            display:['report-list','reportSql','datavSql'].includes(this.type) ? false : true
          }
        ]
       }
      },
    },
    methods: {
      handleTemplate() {
        if(this.type === 'student'){
          window.open(`/api/iot-basic/emp/student/export-template?${website.tokenHeader}=${getToken()}`);
        }
        if(this.type === 'teacher'){
          window.open(`/api/iot-basic/emp/teacher/export-template?${website.tokenHeader}=${getToken()}`);
        }
        if(this.type === 'parents'){
          window.open(`/api/iot-basic/parents/export-template?${website.tokenHeader}=${getToken()}`);
        }
        if(this.type === 'publisher'){
          window.open(`${this.userInfo.staticPrefix}/doc/出版单位.xlsx`);
        }
        if(this.type === 'booksCategories'){
          window.open(`${this.userInfo.staticPrefix}/doc/书刊类别导入模版.xlsx`);
        }
        if(this.type === 'booksPeriodicals'){
          window.open(`/api/iot-basic/export-template?${website.tokenHeader}=${getToken()}&fileName=书刊目录导入模版.xlsx`);
        }
        if(this.type === 'duplicateOriginal'){
          window.open(`/api/iot-basic/export-template?${website.tokenHeader}=${getToken()}&fileName=书刊目录复本导入模版.xlsx`);
        }
        if(this.type === 'dept'){
          window.open(`/api/iot-basic/export-template?${website.tokenHeader}=${getToken()}&fileName=%E9%83%A8%E9%97%A8%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xlsx`);
        }
        if(this.type === 'energyNocardRecharge'){
          window.open(`/api/iot-basic/export-template?${website.tokenHeader}=${getToken()}&fileName=%E6%97%A0%E5%8D%A1%E5%85%85%E5%80%BC%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xlsx`);
        }
        if (this.type === 'blackEmp') {
          window.open(`/api/iot-basic/export-template?${website.tokenHeader}=${getToken()}&fileName=%E8%AE%BF%E5%AE%A2%E9%BB%91%E5%90%8D%E5%8D%95%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xlsx`);
        }
        if (this.type === 'gradeclass') {
          window.open(`/api/iot-basic/export-template?${website.tokenHeader}=${getToken()}&fileName=%E5%B9%B4%E7%8F%AD%E7%BA%A7%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xlsx`);
        }
        if (this.type === 'recharge_havecard') {
          window.open(`/api/iot-basic/export-template?${website.tokenHeader}=${getToken()}&fileName=%E6%97%A0%E5%8D%A1%E5%85%85%E5%80%BC%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xlsx`);
        }
      },
      openDialog(d){
        this.isDisabled = false;
        this.importTipTxt = "";
        this.importExcelErrors = [];
        this.dialogVisible = true;
        this.excelForm = {}
        if(d === 'student'){
          this.type = 'student'
          this.title = "学生信息导入"
          this.action = `/api/iot-basic/emp/student/import?${this.website.tokenHeader}=${getToken()}`
        }
        if(d === 'teacher'){
          this.type = 'teacher'
          this.title = "教师信息导入"
          this.action = `/api/iot-basic/emp/teacher/import?${this.website.tokenHeader}=${getToken()}`
        }
        if(d === 'parents'){
          this.type = 'parents'
          this.title = "学生家长信息导入"
          this.action = `/api/iot-basic/parents/import?${this.website.tokenHeader}=${getToken()}`
        }
        if(d === 'publisher'){
          this.type = 'publisher'
          this.title = "出版社信息导入"
          this.action = `/api/iot-library/publisher-unit/import?${website.tokenHeader}=${getToken()}`
        }
        if(d === 'booksCategories'){
          this.type = 'booksCategories'
          this.title = "书刊类别信息导入"
          this.action = `/api/iot-library/booktype/import?${website.tokenHeader}=${getToken()}`
        }
        if(d === 'booksPeriodicals'){
          this.type = 'booksPeriodicals'
          this.title = "书刊目录信息导入"
          this.action = `/api/iot-library/booklist/import?${website.tokenHeader}=${getToken()}`
        }
        if(d === 'duplicateOriginal'){
          this.type = 'duplicateOriginal'
          this.title = "复本信息导入"
          this.action = `/api/iot-library/booklist-ectype/import?${website.tokenHeader}=${getToken()}`
        }
        if(d === 'dept'){
          this.type = 'dept'
          this.title = "部门信息导入"
          this.action = `/api/iot-basic/dept/import?${website.tokenHeader}=${getToken()}`
        }
        if(d === 'energyNocardRecharge'){
          this.type = 'energyNocardRecharge'
          this.title = "无卡充值信息导入"
          this.action = `/api/iot-sdctrl/recharge/import?${website.tokenHeader}=${getToken()}`
        }
        if(d === 'blackEmp'){
          this.type = 'blackEmp'
          this.title = '黑名单导入';
          this.action = `/api/iot-visitor/blacklist/import?${website.tokenHeader}=${getToken()}`;
        }
        if(d === 'gradeclass'){
          this.type = 'gradeclass'
          this.title = '年班级导入';
          this.action = `/api/iot-basic/grade/class/import?${website.tokenHeader}=${getToken()}`;
        }
        if(d === 'recharge_havecard'){
          this.type = 'recharge_havecard'
          this.title = '无卡充值导入';
          this.action = `/api/iot-xf/rechrage/nocard/personal/import?${website.tokenHeader}=${getToken()}`;
        }
        if(d === 'report-list'){
          this.type = 'report-list'
          this.title = '报表导入';
          this.action = `/api/iot-mreport/reportImport?${website.tokenHeader}=${getToken()}`;
        }
        if(d === 'reportSql'){
          this.type = 'reportSql'
          this.title = '报表接口导入';
          this.action = `/api/iot-sql/cussql/import?${website.tokenHeader}=${getToken()}`;
        }
        if(d === 'datavSql'){
          this.type = 'datavSql'
          this.title = '大屏接口导入';
          this.action = `/api/iot-sql/cussql/import?${website.tokenHeader}=${getToken()}`;
        }
      },
      uploadBefore(file,done,loading){
        this.isDisabled = true;
        this.importTipTxt = "正在导入中，请稍候..."
        loading = true;
        done();
      },
      handleChangeExcelImport(file, fileList){
        this.fileListExcelImport = [];
      },
      uploadExcelAfter(res, done, loading, column) {
        loading = false;
        if(res instanceof Array || res instanceof Error){
          this.importExcelErrors = res;
          setTimeout(()=>{
            this.isDisabled = false;
            this.importTipTxt = "导入失败"
            this.$message.error("导入失败")
          },500)
        }else{
          this.importExcelErrors = [];
          this.dialogVisible = false;
          setTimeout(()=>{
            this.isDisabled = false;
            this.importTipTxt = "导入成功"
            this.$message.success("导入成功")
            this.$emit("refeshPage");
          },500)

        }
        this.fileListExcelImport = [];
        done();
      }
  },
 }
</script>

<style lang="scss" scoped>
  .el-scrollbar {
    height: 100%;
  }
  /**add by lishibin 覆盖 上传图片样式**/
  /deep/.avue-form__row:nth-child(12) {
      .el-form-item__content{
          margin-left: 50px !important;
          margin-top: -115px;
      }
      .avue-upload__icon{
          width: 145px !important;
          height: 145px !important;
          line-height: 116px !important;
      }
    .el-upload__tip
    {
      line-height: 19px;
      padding: 10px;
      width: 133px;
      margin-top: -85px !important;
    }
  }
  /deep/.el-upload__tip {
    font-size: 12px;
    color: #c0c4cc !important;
    margin-top: 7px;
   }
  /deep/.avue-upload__avatar {
    width: 145px !important;
    height: 145px !important;
    display: block;
  }
  .imgConHeight{
    border: 1px solid #dadada;
    height: 320px;
    overflow: auto;
    padding: 10px;
  }
  .upload-err-text{line-height:5px;color:red}
  .imerrText{width:100%;height:150px;border:1px solid #efefef;margin-top:10px;margin-top: 10px;overflow: auto;font-size: 14px;color: red;}
  .imerrText p{line-height:1}
 .avue-upload .el-upload {
    line-height: 130px !important;
  }
  /deep/.el-upload-list{
    display: none !important;
  }
   .itt{
      float: right;
      margin-right: 57px;
      color: red;
      font-size: 16px;
      font-weight: 600;
   }
.info /deep/.el-dialog__body{
  padding: 30px 20px !important;
}
</style>
