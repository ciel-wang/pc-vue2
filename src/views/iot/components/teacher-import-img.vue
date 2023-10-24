<template>
    <el-dialog
      title="照片批量导入"
      :append-to-body="true"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      width="850px">
      <p>注释：</p>
      <p style="margin-left:22px" v-if="come">
        1. 照片命名规则：以学生学号、学籍号命名；
      </p>
      <p style="margin-left:22px" v-else>
        1. 照片命名规则：以教师工号、手机号码、身份证号命名；
      </p>
      <p style="margin-left:22px">
        2. 根据浏览器性能建议一次最多上传500张照片，避免浏览器卡顿；
      </p>
      <p style="margin-left:22px">
        3. 图片上传支持JPG,JPEG,PNG等格式的图片，单张图片大小不能超过5M；
      </p>
      <p>
        <span>自动同步AIoT设备：</span>
        <el-radio-group v-model="facePicSyncDev" @change="change">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </p>
      <el-upload
        name="file"
        ref="elUploadRef"
        accept="image/jpeg,image/png"
        :file-list="fileList"
        :action="uploadActionUrl"
        :on-success="uploadSuccess"
        :on-change="uploadFileOnChange"
        :on-progress="uploadProgress"
        :auto-upload="false"
        show-file-list
        multiple>
        <el-button
          slot="trigger"
          size="small"
          icon="el-icon-picture-outline"
          type="primary"
          >1.选择照片</el-button>
        <el-button
          style="margin-left: 10px;"
          icon="el-icon-upload2"
          :disabled="uploadFileBtnIsDisabled"
          size="small"
          type="success"
          @click="submitUpload"
          >2.上传照片</el-button>
      </el-upload>
      <el-row style="margin-top:20px">
        <el-col span="20">
          <el-progress
            :text-inside="true"
            style="margin-bottom:10px"
            :stroke-width="26"
            :percentage="uploadPercentage"></el-progress>
        </el-col>
        <el-col span="3">
          <span style="margin-left:10px;font-size:16px">{{ uploadSuccessCount }}/{{ fileLen }}</span>
        </el-col>
      </el-row>
      <el-row
        v-if="uploadErrors.length > 0"
        style="height: 200px; border: 1px solid #dadada; margin-top: 10px;overflow: auto;">
        <p v-for="(v,i) in uploadErrors" :key="'imgp'+i" class="upload-err-text">
          {{ v }}
        </p>
      </el-row>
    </el-dialog>
</template>

<script>
import moment from "moment";
import axios from "axios";
import { mapGetters } from "vuex";
import website from "@/config/website";
import { getToken } from "@/util/auth";

export default {
  data() {
    return {
      readFileBtnIsDisabled: false,
      uploadFileBtnIsDisabled: false,
      isDisabled: false,
      importTipTxt: "",
      excelForm: {},
      excelReplace: "1",
      fileList: [],
      files: [],
      fileLen: 0,
      filesLength: 0,
      uploadErrors: [],
      dialogVisible: false,
      fileListExcelImport: [],
      importExcelErrors: [],
      uploadSuccessCount: 0,
      uploadCount: 0,
      come:"",
      empType:2,
      facePicSyncDev:false,
      uploadActionUrl:""
    };
  },
  methods: {
    openDialog(v) {
      if(v){
        this.come = "student";
        this.empType = 1
      }else{
        this.empType = 2
      }
      this.isDisabled = false;
      this.importTipTxt = "";
      this.importExcelErrors = [];
      this.dialogVisible = true;
      this.files = [];
      this.uploadSuccessCount = 0;
      this.uploadCount = 0;
      this.uploadErrors = [];
      this.uploadPercentage = 0;
      this.readFileBtnIsDisabled = false;
      this.uploadFileBtnIsDisabled = false;
      this.facePicSyncDev = false;
      this.uploadActionUrl = `/api/iot-basic/user/upload/user/idcard?${this.website.tokenHeader}=${getToken()}&empType=${this.empType}&facePicSyncDev=${this.facePicSyncDev}`;
    },
    change(e){
      this.uploadActionUrl = `/api/iot-basic/user/upload/user/idcard?${this.website.tokenHeader}=${getToken()}&empType=${this.empType}&facePicSyncDev=${e}`;
    },
    uploadFileOnChange(file, fileList) {
      if (file.status == "ready") {
        this.files = fileList;
        this.fileLen = this.files.length;
        this.uploadSuccessCount = 0;
        this.uploadCount = 0;
        this.uploadErrors = [];
        this.uploadPercentage = 0;
      }
    },
    uploadSuccess(response, file, fileList) {
      if (response.code == 400) {
        this.$message.error("照片上传失败");
        this.uploadErrors.push(response.msg);
      } else {
        this.uploadSuccessCount = this.uploadSuccessCount + 1;
      }
      this.uploadCount = this.uploadCount + 1;
      //计算百分比
      this.uploadPercentage = Math.floor(
        (this.uploadCount / this.files.length) * 100
      );
      if (this.files.length == this.uploadCount) {
        this.files = [];
        this.$refs.elUploadRef.clearFiles();
        this.readFileBtnIsDisabled = false;
        this.uploadFileBtnIsDisabled = false;
      }
    },
    submitUpload() {
      if (this.files.length == 0) {
        this.$message.warning("请选择照片");
        return;
      }
      this.readFileBtnIsDisabled = true;
      this.uploadFileBtnIsDisabled = true;
      this.$refs.elUploadRef.submit();
      this.$message.success("照片正在上传中，请耐心等待，勿重复点击");
    },
    clearFileList() {
      this.$refs.elUploadRef.clearFiles();
      this.files = [];
    },
    handleClose(done) {
      this.uploadSuccessCount = 0;
      this.fileLen = 0;
      this.come = "";
      this.$emit("refeshPage");
      done();
    }
  }
};
</script>

<style lang="scss" scoped>
.el-scrollbar {
    height: 100%;
}
/**add by lishibin 覆盖 上传图片样式**/
/deep/ .avue-form__row:nth-child(12) {
  .el-form-item__content {
    margin-left: 50px !important;
    margin-top: -115px;
  }
  .avue-upload__icon {
    width: 145px !important;
    height: 145px !important;
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
  width: 145px !important;
  height: 145px !important;
  display: block;
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
.avue-upload .el-upload {
  line-height: 130px !important;
}
/deep/ .el-upload-list {
  display: none !important;
}
.itt {
  float: right;
  margin-right: 57px;
  color: red;
  font-size: 16px;
  font-weight: 600;
}
/deep/.el-dialog__body{
  padding: 0px 20px 30px;
}
</style>
