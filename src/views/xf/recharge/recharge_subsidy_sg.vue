<template>
  <div>
    <el-drawer
      title="创建补贴"
			size="480px"
      :visible.sync="drawer"
      :append-to-body="true"
      :modal-append-to-body="true"
      :before-close="handleEsc">
      <avue-form :option="options" v-model="obj" ref="formRef" @submit="submit" @error="error">
        <template slot="menuForm">
          <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-drawer>

    <el-dialog
      title="补贴金额确认"
      append-to-body
      :visible.sync="visible"
      :show-close="false"
      top="5vh"
      :close-on-press-escape="false"
      :close-on-click-modal="false" width="500px">
      <el-row>
        <el-col span="10" style="font-weight: 600;">预充值人数：{{ conObj.preEmpCount }}</el-col>
        <el-col span="10" style="font-weight: 600;">预充值金额：{{ conObj.preAmount }}</el-col>
      </el-row>
      <el-row>
        <el-col span="10" style="font-weight: 600;">实际充值人数：{{ conObj.realEmpCount }}</el-col>
        <el-col span="10" style="font-weight: 600;">实际充值金额：{{ conObj.realAmount }}</el-col>
      </el-row>
      <el-row style="border-top:1px solid #F1F1F1;padding-top:10px">
        <el-col span="10" style="font-weight: 600;">异常人数：{{ conObj.errEmpCount }}</el-col>
      </el-row>
      <div v-if="subsidyErrors.length > 0" class="imerrText" :style="{ height: height }">
        <p v-for="(v,i) in subsidyErrors" :key="i">{{ v }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="escAuditHandle" :disabled="escDisabled">取 消</el-button>
        <el-button size="small" type="primary" @click="submitAuditHandle" :disabled="sbtnDisabled">{{ sbtnTxt }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment';
import { subsidyRechargeSg, subsidyRechargeSgTotal } from '@/api/xf/recharge';
import {getAccountZtreeData} from "@/api/iot/account.js";

export default {
  data() {
    return {
      visible: false,
      drawer: false,
      selectDept: '',
      sbtnTxt: '提 交',
      sbtnDisabled: false,
      escDisabled: false,
      conObj: {
        personCount: 0,
        totalAmount: 0
      },
      obj: {
        rechargeType: 1,
        rechargeWallet: 1,
        rechargeMode: '现金'
      },
      subsidyErrors: [],
      height: ''
    };
  },
  created() {
    this.initTreeData();
    this.height = window.innerHeight - 340 + 'px';
  },
  methods: {
    openDialog() {
      this.obj = {
        rechargeType: 1,
        rechargeWallet: 1,
        rechargeMode: '现金'
      };
      let planDate = moment().format('YYYY-MM-DD');
      let nextMonth = moment().add(1, 'months').startOf('month').format('YYYY-MM-DD');
      let now = moment().format('YYYY-MM-DD');
      let end = moment().endOf('month').subtract(3, 'days').format('YYYY-MM-DD');
      if (now > end) {
        nextMonth = moment().startOf('month').add({ days: 14, months: 1 }).format('YYYY-MM-DD');
      }
      this.obj['failureDate'] = nextMonth;
      this.obj['planDate'] = planDate;
      this.drawer = true;
      this.$nextTick(() => {
        this.$refs.formRef.clearValidate();
      })
    },
    initTreeData() {
      getAccountZtreeData().then(res => {
        this.selectDept = res.data.data;
      });
    },
    submitAuditHandle() {
      this.sbtnDisabled = true;
      this.escDisabled = true;
      this.sbtnTxt = '正在提交';
      this.$message.info('补贴正在创建中，请耐心等待');
      subsidyRechargeSg(this.obj).then(res => {
        if (!Array.isArray(res.data.data)) {
          this.$message.success('补贴创建成功');
          this.drawer = false;
          this.visible = false;
          this.sbtnTxt = '提 交';
          this.$refs['formRef'].resetFields();
          this.obj.rechargeAmount = '';
          this.obj.deptId = '';
          this.sbtnDisabled = false;
          this.escDisabled = false;
          this.$emit('refreshData');
        } else {
          this.escDisabled = false;
          this.$message.error('补贴创建失败');
          this.subsidyErrors = res.data.data;
          this.sbtnTxt = '提 交';
        }
      }).catch(err => {
        this.sbtnTxt = '提 交';
        this.sbtnDisabled = false;
      });
    },
    escAuditHandle() {
      this.sbtnDisabled = false;
      this.subsidyErrors = '';
      this.visible = false;
    },
    submit(form, done) {
      let dept = form.deptId;
      let arr = []
      dept.forEach(v => {
        if(!v.startsWith('SCHOOL')){
          arr.push(v)
        }
      })
      form.deptId = arr;
      this.obj = form;
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
    handleEsc(done) {
      this.$refs['formRef'].resetFields();
      this.obj.rechargeAmount = '';
      this.selectDept = '';
      this.obj.deptId = '';
      this.drawer = false;
    }
  },
  computed: {
    options() {
      return {
        labelPosition: 'left',
        labelSuffix: '：',
        labelWidth: 100,
        gutter: 0,
        menuBtn: true,
        submitBtn: true,
        submitText: '确定',
        emptyBtn: false,
        menuPosition: 'center',
        tabs: false,
        detail: false,
        column: [
          {
            type: 'input',
            label: '充值金额',
            span: 24,
            display: true,
            prop: 'rechargeAmount',
            rules: [{
              validator: (rule, value, callback) => {
                if (value == '') {
                  callback(new Error('请填写充值金额'));
                } else if (value * 1 <= 0 || !/^[+-]?((\d*(\.\d{1,})$)|(\d+$))/.test(value)) {
                  callback(new Error('请输入大于0的充值金额'));
                } else {
                  callback();
                }
              },
              required: true,
              trigger: 'blur'
            }]
          },
          {
            type: 'date',
            label: '计划日期',
            span: 24,
            display: true,
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
                } else if (new Date(value).getTime() + 2 * 24 * 60 * 60 * 1000 + 1000 > new Date(this.obj.failureDate).getTime()) {
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
            label: '充值方式',
            span: 24,
            type: 'radio',
            dicData: [
              { label: '现金', value: '现金' },
              { label: '微信', value: '微信' },
              { label: '支付宝', value: '支付宝' },
              { label: '其它', value: '其它' },
            ],
            prop: 'rechargeMode',
            display: true,
            rules: [{
              required: true,
              message: '请选择充值方式',
              trigger: 'blur'
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
              trigger: 'blur'
            }]
          },
          {
            label: '充值钱包',
            span: 24,
            display: true,
            type: 'radio',
            dicData: [
              { label: '补贴钱包1', value: 1 },
              { label: '补贴钱包2', value: 2 },
              { label: '补贴钱包3', value: 3 },
            ],
            prop: 'rechargeWallet',
            rules: [{
              required: true,
              message: '请选择充值钱包',
              trigger: 'click'
            }]
          },
          {
            type: 'date',
            label: '失效日期',
            span: 24,
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
                } else if (new Date(value) < new Date(this.obj.planDate) * 1 + 2 * 24 * 60 * 60 * 1000 + 1000) {
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
            label: '部门/班级',
            prop: 'deptId',
            type: 'tree',
            multiple: true,
            hide: true,
            span: 24,
            display: true,
            align: 'center',
            dicData: this.selectDept,
            rules: [{
              required: true,
              message: '请选择所属部门/班级',
              trigger: 'blur'
            }],
            props:{
              value:"valueStr"
            }
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
.imerrText {
  width: 100%;
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
</style>
