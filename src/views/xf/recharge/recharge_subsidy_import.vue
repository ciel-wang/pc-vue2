<template>
  <el-drawer 
    title="导入补贴" 
    :visible.sync="drawer" 
    :append-to-body="true" 
    :modal-append-to-body="true" 
    :close-on-press-escape="false" 
    size="480px"
    :wrapperClosable="false">
    <avue-form
      ref="importFormRef"
      :option="importOptions"
      v-model="importFormData"
      @submit="submit"
      :upload-before="uploadExcelBefore"
      :upload-after="uploadExcelAfter"
      @error="error"
      v-loading="loading">
      <template slot="excelTemplate">
        <el-button type="primary" @click="handleTemplate" :disabled="handleTemplateDisabled">
          点击下载
          <i class="el-icon-download el-icon--right"></i>
        </el-button>
      </template>
    </avue-form>
    <div v-if="importExcelErrors.length > 0" class="imerrText">
      <p v-for="(v,i) in importExcelErrors" :key="i">{{ v }}</p>
    </div>
  </el-drawer>
</template>

<script>
import website from '@/config/website';
import { getToken } from '@/util/auth';
import moment from 'moment';
import { subsidyRechargeSg, subsidyRechargeSgTotal } from '@/api/xf/recharge';
import { getDeptZtreeData } from '@/api/iot/dept';

export default {
  data() {
    return {
      visible: false,
      drawer: false,
      selectDept: '',
      sbtnTxt: '提 交',
      sbtnDisabled: false,
      importExcelErrors: [],
      conObj: {
        personCount: 0,
        totalAmount: 0
      },
      importFormData: {
        rechargeType: 1,
        rechargeWallet: 1,
        rechargeMode: '现金'
      },
      submitBtnDisabled: false,
      handleTemplateDisabled: false,
      loading: false
    };
  },
  created() {
    this.initTreeData();
  },
  methods: {
    openDialog() {
      let importFormData = {
        rechargeType: 1,
        rechargeWallet: 1,
        rechargeMode: '现金'
      };
      this.importFormData = importFormData;
      let planDate = moment().format('YYYY-MM-DD');
      let nextMonth = moment().add(1, 'months').startOf('month').format('YYYY-MM-DD');
      let now = moment().format('YYYY-MM-DD');
      let end = moment().endOf('month').subtract(3, 'days').format('YYYY-MM-DD');
      if (now > end) {
        nextMonth = moment().startOf('month').add({ days: 14, months: 1 }).format('YYYY-MM-DD');
      }
      this.importFormData['failureDate'] = nextMonth;
      this.importFormData['planDate'] = planDate;
      this.importExcelErrors = [];
      this.drawer = true;
    },
    initTreeData() {
      getDeptZtreeData().then(res => {
        this.selectDept = res.data.data;
      });
    },
    submitAuditHandle() {
      this.sbtnDisabled = true;
      this.sbtnTxt = '正在提交';
      this.$message.info('补贴正在创建中，请耐心等待');
      subsidyRechargeSg(this.importFormData).then(res => {
        if (res.data.code == 200) {
          this.$message.success('补贴创建成功');
          this.drawer = false;
          this.visible = false;
          this.sbtnTxt = '提 交';
          this.sbtnDisabled = false;
          this.$emit('refreshData');
        }
      }).catch(err => {
        this.sbtnTxt = '提 交';
        this.sbtnDisabled = false;
      });
    },
    submit(form, done) {
      this.importFormData = form;
      subsidyRechargeSgTotal(form).then(res => {
        this.conObj = res.data.data;
        if (this.conObj.personCount == 0) {
          this.$message.warning('该部门人数为0');
        } else if (this.conObj.totalAmount <= 0) {
          this.$message.warning('金额必须大于0');
        } else {
          this.visible = true;
        }
        done();
      });
    },
    handleTemplate() {
      window.open(`/api/iot-xf/rechrage/export-template?${this.website.tokenHeader}=${getToken()}`);
    },
    uploadExcelBefore(file, done) {
      this.submitBtnDisabled = true;
      this.handleTemplateDisabled = true;
      done();
      this.loading = true;
      this.loading = this.$loading({
        lock: true,
        text: '正在上传中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    },
    uploadExcelAfter(res, done, column) {
      this.loading.close();
      this.loading = false;
      this.submitBtnDisabled = false;
      this.handleTemplateDisabled = false;
      let data = res;
      if (Array.isArray(data) || data instanceof Error) {
        setTimeout(() => {
          this.$message.error('导入失败');
        }, 1000);
        this.importExcelErrors = data;
      } else {
        this.drawer = false;
        this.$emit('refreshData');
      }
      done();
    },
    handleEsc() {
      this.drawer = false;
    }
  },
  computed: {
    importOptions() {
      return {
        emptyBtn: false,
        labelPosition: 'left',
        labelSuffix: '：',
        labelWidth: 100,
        gutter: 0,
        menuBtn: true,
        submitBtn: false,
        loadText: '正在上传中，请稍等',
        menuPosition: 'center',
        tabs: false,
        detail: false,
        column: [
          {
            type: 'date',
            label: '计划日期',
            span: 24,
            display: true,
            valueFormat: 'yyyy-MM-dd',
            prop: 'planDate',
            pickerOptions: {
              disabledDate(time) {
                return time.getTime() < moment().subtract(1, 'days');
              }
            },
            rules: [{
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error('请选择计划日期'));
                } else if (new Date(value).getTime() + 2 * 24 * 60 * 60 * 1000 + 1000 > new Date(this.importFormData.failureDate).getTime()) {
                  callback(new Error('失效日期-计划日期>=3天'));
                } else {
                  callback();
                }
              },
              required: true,
              trigger: 'change'
            }]
          },
          {
            label: '充值类型',
            span: 24,
            type: 'radio',
            dicData: [{ label: '累加', value: 1 }, { label: '清零', value: 0 }],
            prop: 'rechargeType',
            display: true,
            rules: [{
              required: true,
              message: '请选择充值类型',
              trigger: 'click'
            }]
          },
          {
            label: '充值钱包',
            span: 24,
            display: true,
            type: 'radio',
            dicData: [{ label: '补贴钱包1', value: 1 }, { label: '补贴钱包2', value: 2 }, { label: '补贴钱包3', value: 3 }],
            prop: 'rechargeWallet',
            rules: [{
              required: true,
              message: '请选择充值钱包',
              trigger: 'click'
            }]
          },
          {
            label: '充值方式',
            span: 24,
            type: 'radio',
            dicData: [{ label: '现金', value: '现金' }, { label: '微信', value: '微信' }, { label: '支付宝', value: '支付宝' }, { label: '其它', value: '其它' }],
            prop: 'rechargeMode',
            display: true,
            rules: [{
              required: true,
              message: '请选择充值方式',
              trigger: 'blur'
            }]
          },
          {
            type: 'date',
            label: '失效日期',
            span: 24,
            width: 270,
            valueFormat: 'yyyy-MM-dd',
            display: true,
            prop: 'failureDate',
            pickerOptions: {
              disabledDate(time) {
                return time.getTime() < moment().add(2, 'days');
              }
            },
            rules: [{
              validator: (rule, value, callback) => {
                if (value == null) {
                  callback(new Error('请选择失效日期'));
                } else if (new Date(value) < new Date(this.importFormData.planDate) * 1 + 2 * 24 * 60 * 60 * 1000 + 1000) {
                  callback(new Error('失效日期-计划日期>=3天'));
                } else {
                  callback();
                }
              },
              required: true,
              // message: "请选择失效日期",
              trigger: 'change'
            }]
          },
          {
            label: '上传补贴',
            prop: 'file',
            type: 'upload',
            drag: true,
            loadText: '上传中，请稍等',
            span: 24,
            propsHttp: {
              res: 'data'
            },
            data: {
              importMode: this.importFormData.rechargeType,
              rechargeWellet: this.importFormData.rechargeWallet,
              rechargeDate: this.importFormData.planDate,
              failureDate: this.importFormData.failureDate,
              rechargeMode: this.importFormData.rechargeMode
            },
            tip: '请上传xls格式文件，且大小不超过3M',
            action: `/api/iot-xf/rechrage/import?${this.website.tokenHeader}=${getToken()}`
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
.upload-err-text {
  line-height: 5px;
  color: red;
}
.imerrText {
  width: 100%;
  height: calc(100% - 510px) !important;
  border: 1px solid #efefef;
  margin-top: 10px;
  margin-bottom: 10px;

  overflow: auto;
  font-size: 14px;
  color: red;
}
.imerrText p {
  line-height: 0px;
}
/deep/ .el-upload-list {
  display: none !important;
}
/deep/ .el-upload-list--text {
  display: none !important;
}
/deep/ .el-upload-dragger {
  width: 300px !important;
  height: 120px;
}
/deep/ .avue-form__group {
  .el-col:nth-child(1),
  el-col:nth-child(2),
  el-col:nth-child(3),
  .el-col:nth-child(4) {
    .el-form-item__content {
      width: 300px !important;
    }
  }
}
/deep/.el-form-item {
  margin-bottom: 4px !important;
}
/deep/.el-upload-dragger .el-icon-upload {
  margin: 12px 0 12px;
}
/deep/.el-drawer__header {
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 14px;
}
/deep/.el-upload__tip {
  margin-top: 0;
}
</style>
