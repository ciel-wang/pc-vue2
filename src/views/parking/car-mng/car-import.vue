<template>
  <el-dialog title="导入车辆信息" append-to-body :visible.sync="dialogVisible" width="580px" class="info">
    <avue-form 
      :option="excelOption" 
      :upload-before="uploadBefore" 
      :on-change="handleChangeExcelImport" 
      v-model="excelForm" 
      :upload-after="uploadExcelAfter">
      <template slot="excelTemplate">
        <div>
          <el-button type="primary" @click="handleTemplate">
            点击下载
            <i class="el-icon-download el-icon--right"></i>
          </el-button>
          <div v-if="importExcelErrors.length > 0" class="imerrText">
            <p v-for="(v, index) in importExcelErrors" :key="index">{{ v }}</p>
          </div>
        </div>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import website from '@/config/website';
import { getToken } from '@/util/auth';

export default {
  data() {
    return {
      excelForm: {},
      dialogVisible: false,
      importExcelErrors: [],
      fileListExcelImport: []
    };
  },
  methods: {
    handleTemplate() {
      window.open(`/api/iot-car/carinfo/export-template?${this.website.tokenHeader}=${getToken()}`);
    },
    openDialog() {
      this.importExcelErrors = [];
      this.dialogVisible = true;
      this.excelForm = {};
    },
    uploadBefore(file, done, loading) {
      this.importTipTxt = '正在导入中，请稍候...';
      loading = true;
      done();
    },
    handleChangeExcelImport(file, fileList) {
      this.fileListExcelImport = [];
    },
    uploadExcelAfter(res, done, loading, column) {
      loading = false;
      if (res instanceof Array || res instanceof Error) {
        this.importExcelErrors = res;
        setTimeout(() => {
          this.importTipTxt = '导入失败';
          this.$message.error('导入失败');
        }, 500);
      } else {
        this.importExcelErrors = [];
        this.dialogVisible = false;
        setTimeout(() => {
          this.importTipTxt = '导入成功';
          this.$message.success('导入成功');
          this.$emit('refeshPage');
        }, 500);
      }
      this.fileListExcelImport = [];
      done();
    }
  },
  computed: {
    excelOption() {
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
            data: {},
            action: `/api/iot-car/carinfo/import?${this.website.tokenHeader}=${getToken()}`
          },
          {
            label: '模板下载',
            prop: 'excelTemplate',
            formslot: true,
            span: 24
          }
        ]
      };
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.avue-form__row:nth-child(12) {
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
  line-height: 1;
}
.avue-upload .el-upload {
  line-height: 130px !important;
}
/deep/.el-upload-list {
  display: none !important;
}
.itt {
  float: right;
  margin-right: 57px;
  color: red;
  font-size: 16px;
  font-weight: 600;
}
.info /deep/.el-dialog__body {
  padding: 30px 20px !important;
}
</style>
