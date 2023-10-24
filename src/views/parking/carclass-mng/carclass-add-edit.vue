<template>
  <el-dialog
    :title="btnType == 'add' ? '添加车类' : '编辑车类'"
    :visible.sync="dialogVisible"
    width="800px"
    top="10vh"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <avue-form ref="formRef" :option="addEditOption" v-model="form" @submit="submit">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>

      <template slot="cfg">
        <el-checkbox v-show="form.category == 2" v-model="form.isExpireTrunTemporary">
          过期转临停进出（不勾选时禁止进出）
        </el-checkbox>
        <el-checkbox v-show="form.category == 2" v-model="form.isContinueStopHourTemporaryOutPay">
          连续停放转临停后先出场后结算
        </el-checkbox>
        <el-checkbox v-show="form.category == 2" v-model="form.isUpdateOnlineRenewalMonth">
          允许修改续期金额和有效期
        </el-checkbox>
        <el-checkbox v-model="form.allowRepeatIn">允许车辆重复入场</el-checkbox>
        <el-checkbox v-model="form.allowRepeatOut">允许车辆重复出场（无入场记录时直接出场）</el-checkbox>
        <el-checkbox v-model="form.inConfirm">车辆入场需要确认</el-checkbox>
        <el-checkbox v-model="form.outConfirm">车辆出场需要确认（不勾选时0元自动抬杆）</el-checkbox>
        <div class="mbottom8">
          车辆出入场确认时间：
          <el-time-picker
            is-range
            v-model="inOutConfirmTime"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            size="small"
            value-format="HH:mm:ss"
            style="width: 220px !important;"
          ></el-time-picker>
        </div>
        <el-checkbox v-model="form.inOutUpdateCarNum">此类型车辆进出修改车位</el-checkbox>
        <el-checkbox v-model="form.allowFullIn">车位已满可以入场</el-checkbox>
        <el-checkbox v-model="form.likeMatch">忽略首汉字匹配通行记录</el-checkbox>
        <el-checkbox v-model="form.outNoInPopConfirm">出场无记录时弹出模糊识别窗口</el-checkbox>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { addCartype, updateCartype } from '@/api/parking/carclass.js';

export default {
  props: {
    carTypeDic: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      form: {},
      btnType: 'add',
      inOutConfirmTime: []
    };
  },
  methods: {
    openDialog(
      type,
      form = {
        allowRepeatIn: false,
        allowRepeatOut: false,
        inConfirm: false,
        outConfirm: false,
        inOutUpdateCarNum: false,
        allowFullIn: false,
        likeMatch: false,
        outNoInPopConfirm: false,
        inOutConfirmStartTime: '00:00:00',
        inOutConfirmEndTime: '23:59:59',
        isContinueStopHourTemporaryOutPay: false,
        isUpdateOnlineRenewalMonth: false,
        isExpireTrunTemporary: false
      }
    ) {
      this.btnType = type;
      this.form = form;
      this.inOutConfirmTime = [form?.inOutConfirmStartTime || '', form?.inOutConfirmEndTime || ''];
      this.dialogVisible = true;
    },
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          let form = { ...this.form };
          form.inOutConfirmStartTime = this.inOutConfirmTime[0] || '';
          form.inOutConfirmEndTime = this.inOutConfirmTime[1] || '';
          if (this.btnType === 'add') {
            addCartype(form).then(r => {
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
          } else {
            updateCartype(form).then(r => {
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
        }
      });
    },
    handleClose() {
      this.inOutConfirmTime = [];
      this.form = {};
      this.$refs.formRef.resetForm();
      this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
    }
  },
  computed: {
    addEditOption() {
      return {
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '车类名称',
            prop: 'typeName',
            rules: [
              {
                required: true,
                message: '请输入车类名称',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label: '基础类型',
            prop: 'category',
            type: 'select',
            dicData: this.carTypeDic,
            rules: [
              {
                required: true,
                message: '请选择基础类型',
                trigger: 'blur'
              }
            ],
            control: (val, form) => {
              if (val == 2) {
                return {
                  payMoneyMonth: { display: true },
                  expirePostponeDays: { display: true },
                  onlineRenewalMonth: { display: true },
                  continueStopHourTemporary: { display: true }
                };
              } else {
                return {
                  payMoneyMonth: { display: false },
                  expirePostponeDays: { display: false },
                  onlineRenewalMonth: { display: false },
                  continueStopHourTemporary: { display: false }
                };
              }
            }
          },
          {
            label: '续费月金额',
            prop: 'payMoneyMonth',
            type: 'number',
            minRows: 1,
            maxRows:99999,
            precision: 0
          },
          {
            label: '过期延期可进出天数',
            prop: 'expirePostponeDays',
            type: 'number',
            minRows: 1,
            maxRows:99999,
            precision: 0,
            labelWidth: 150
          },
          {
            label: '线上续期',
            prop: 'onlineRenewalMonth',
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
            ]
          },
          {
            label: '连续停放转临停小时数',
            prop: 'continueStopHourTemporary',
            type: 'number',
            minRows: 1,
            precision: 0,
            labelWidth: 160
          },
          {
            label: '',
            labelWidth: 20,
            prop: 'cfg',
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
.el-form-item--mini.el-form-item,
/deep/.el-form-item--small.el-form-item {
  margin-bottom: 8px !important;
}
/deep/.el-checkbox {
  margin-bottom: 8px;
}
</style>
