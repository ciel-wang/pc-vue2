<template>
  <el-dialog :title="title" append-to-body :visible.sync="dialogVisible" width="580px">
    <p style="margin-left:35px">
      <el-radio v-model="importType" :disabled="isDisabled" label="live">分配</el-radio>
      <el-radio v-model="importType" :disabled="isDisabled"  label="exchange">调换</el-radio>
      <span class="itt">{{importTipTxt}}</span>
    </p>
    <avue-form :option="excelOption" :upload-before="uploadBefore" :on-change="handleChangeExcelImport" v-model="excelForm" :upload-after="uploadExcelAfter">
      <template slot="excelTemplate">
        <div>
          <el-button type="primary" @click="handleTemplate">
            点击下载<i class="el-icon-download el-icon--right"></i>
          </el-button>
          <div v-if="importExcelErrors.length > 0" class="imerrText">
            <p v-for="(v,i) in importExcelErrors" :key="'importExcelErrors2'+i">
              {{v}}
            </p>
          </div>
        </div>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
  import {mapGetters} from 'vuex';
  import website from '@/config/website';
  import {getToken} from '@/util/auth';

  export default{
    data(){
      return{
        isDisabled:false,
        importTipTxt:"",
        excelForm:{},
        importType:"live",
        dialogVisible:false,
        fileListExcelImport:[],
        importExcelErrors:[],
        action:"",
        title:"",
        sourceType:""
      }
    },
    methods:{
      handleTemplate() {
        if(this.sourceType == "dorm"){
          window.open(`/api/iot-dorm/live/student/export-template?${this.website.tokenHeader}=${getToken()}`);
        }else{
          window.open(`/api/iot-dorm/live/apartment/teacher/export-template?${this.website.tokenHeader}=${getToken()}`);
        }
      },
      openDialog(val){
        this.sourceType = val.sourceType
        this.isDisabled = false;
        this.importTipTxt = "";
        this.importExcelErrors = [];
        this.dialogVisible = true;
        this.excelForm = {}
        if(this.sourceType == 'dorm'){
          this.title = "宿舍分配信息导入"
          this.action = `/api/iot-dorm/live/student/import?${this.website.tokenHeader}=${getToken()}`
        }else{
          this.title = "内部人员公寓分配信息导入"
          this.action = `/api/iot-dorm/live/apartment/teacher/import?${this.website.tokenHeader}=${getToken()}`
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
    computed:{
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
              "importType":this.importType
            },
            action: this.action
          },
          {
            label: '模板下载',
            prop: 'excelTemplate',
            formslot: true,
            span: 24,
          }
        ]
       }
      },
    },
  }
</script>

<style scoped="scoped">
  .itt{
    float: right;
    margin-right: 57px;
    color: red;
    font-size: 16px;
    font-weight: 600;
  }
  .imerrText{
    width:100%;
    height:150px;
    border:1px solid #efefef;
    margin-top:10px;
    margin-top: 10px;
    overflow: auto;
    font-size: 14px;
    color: red;}
  .imerrText p{line-height:0px}
  .upload-err-text{line-height:5px;color:red}
</style>
