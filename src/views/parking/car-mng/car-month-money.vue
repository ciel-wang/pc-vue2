<template>
  <el-dialog
    title="月租车续期"
    :visible.sync="dialogVisible"
    width="40%"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <div style="text-align: center;">
      <span class="fw600" style="font-size: 22px;margin-right: 8px;">{{ form.plateNum }}</span>
      <span>{{ form.empName }}</span>
    </div>
    <div style="margin: 10px;">
      当前车类续期时不允许修改续期金额和开始有效期。当车主过期后再进行续期，将默认按照上次有效结束时间开始续期。如果需要更改此设置，请管理员在该车类设置中修改。
    </div>
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import moment from 'moment';
import { carMonthSubmit } from '@/api/parking/car.js';

export default {
  data() {
    return {
      dialogVisible: false,
      form: {},
      editDisabled: false
    };
  },
  methods: {
    openDialog(form = { endTime: '', startTime: '', totalMoney: '' }) {
      this.form = form;
      this.form.startTime = form.newDate;
      this.editDisabled = !form.isUpdateOnlineRenewalMonth;
      this.form.renewalMonth = form.onlineRenewalMonth;
      this.dialogVisible = true;
    },
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          let { carInfoId, startTime, renewalMonth } = { ...this.form };
          let form = { carInfoId, startTime, renewalMonth };

          carMonthSubmit(form).then(r => {
            done();
            if (r.data.code == 200) {
              this.$message.success(r.data.msg);
              this.$emit('refeshPage');
              this.handleClose();
            } else {
              this.$message.error(r.data.msg);
            }
          }).catch(() => {
            done();
          });
        }
      });
    },
    handleClose() {
      this.form = {};
      this.$refs.formRef.resetForm();
      this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        submitText: '保存',
        labelWidth: 120,
        column: [
          {
            label: '原有效结束时间',
            prop: 'lastDate',
            type: 'date',
            format: 'yyyy-MM-dd',
            valueFormat: 'yyyy-MM-dd',
            disabled: true
          },
          {
            label: '续费月数',
            prop: 'renewalMonth',
            type: 'select',
            dicData: [
              { value: 1, label: '1个月' },
              { value: 2, label: '2个月' },
              { value: 3, label: '3个月' },
              { value: 4, label: '4个月' },
              { value: 5, label: '5个月' },
              { value: 6, label: '6个月' },
              { value: 7, label: '7个月' },
              { value: 8, label: '8个月' },
              { value: 9, label: '9个月' },
              { value: 10, label: '10个月' },
              { value: 11, label: '11个月' },
              { value: 12, label: '12个月' }
            ],
            change: ({ value }) => {
              let _this = this;
              if (value) {
                _this.form.totalMoney = _this.form.payMoneyMonth * 1 * value;
                if (_this.form.startTime) {
                  _this.form.endTime = moment(_this.form.startTime).add(value, 'month').format('YYYY-MM-DD');
                }
              }
            }
          },
          {
            label: '新有效开始时间',
            prop: 'startTime',
            type: 'date',
            format: 'yyyy-MM-dd',
            valueFormat: 'yyyy-MM-dd',
            change: ({ value }) => {
              let _this = this;
              if (value && _this.form.renewalMonth) {
                _this.form.endTime = moment(value).add(_this.form.renewalMonth, 'month').format('YYYY-MM-DD');
              }
            },
            disabled: true
          },
          {
            label: '新有效结束时间',
            prop: 'endTime',
            type: 'date',
            format: 'yyyy-MM-dd',
            valueFormat: 'yyyy-MM-dd',
            disabled: this.editDisabled
          },
          {
            label: '续费总金额',
            prop: 'totalMoney',
            disabled: true
          }
        ]
      };
    }
  }
};
</script>
