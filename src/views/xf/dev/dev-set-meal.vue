<template>
  <el-dialog
    title="餐段设置"
    :append-to-body="true"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
    width="1000px">
    <avue-form ref="formRef" :option="option" v-model="obj" @submit="submit" @error="error">
      <template slot="menuForm">
        <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { binTimeStepDown } from '@/api/xf/event';
import { getMealDetail } from '@/api/xf/xfsystem';
export default {
  name: 'xf-set-meal',
  data() {
    return {
      isVisible: false,
      obj: {
        timeGrade1: 0,
        timeGrade2: 0,
        timeGrade3: 0,
        timeGrade4: 0,
        timeGrade5: 0,
        sellerMode1: 1,
        sellerMode2: 1,
        sellerMode3: 1,
        sellerMode4: 1,
        sellerMode5: 1,
        fixedMoney1: 1,
        fixedMoney2: 1,
        fixedMoney3: 1,
        fixedMoney4: 1,
        fixedMoney5: 1
      },
      ids: {},
      sellerMode: [{ label: '单价', value: 0 }, { label: '时段', value: 1 }, { label: '计次', value: 3 }]
    };
  },
  methods: {
    initMeal() {
      getMealDetail().then(res => {
        let data = res.data.data;
        data.forEach((v, i) => {
          let timeRange = 'timeRange' + (i + 1);
          this.obj[timeRange] = v.parValue;
        });
      });
    },
    openDialog(ids) {
      this.ids = ids;
      this.isVisible = true;
      this.initMeal();
    },
    submit(form, done) {
      if (Array.isArray(form.timeRange1)) {
        form.timeRange1 = form.timeRange1[0] + ',' + form.timeRange1[1];
      }
      if (Array.isArray(form.timeRange2)) {
        form.timeRange2 = form.timeRange2[0] + ',' + form.timeRange2[1];
      }
      if (Array.isArray(form.timeRange3)) {
        form.timeRange3 = form.timeRange3[0] + ',' + form.timeRange3[1];
      }
      if (Array.isArray(form.timeRange4)) {
        form.timeRange4 = form.timeRange4[0] + ',' + form.timeRange4[1];
      }
      if (Array.isArray(form.timeRange5)) {
        form.timeRange5 = form.timeRange5[0] + ',' + form.timeRange5[1];
      }
      form['devIds'] = this.ids;
      binTimeStepDown(form).then(res => {
        if (res.data.code == 200) {
          this.$message({
            type: 'success',
            message: res.data.msg
          });
        }
        this.isVisible = false;
      });
      done();
    },
    handleEsc() {
      this.isVisible = false;
    }
  },
  computed: {
    timeStepGrade() {
      let arr = [];
      for (let i = 0; i <= 15; i++) {
        arr.push({ label: i, value: i });
      }
      return arr;
    },
    option() {
      return {
        emptyBtn: false,
        submitText: '确定',
        column: [
          {
            label: '时间段一',
            prop: 'timeRange1',
            type: 'timerange',
            valueFormat: 'HH:mm:ss',
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间',
            span: 8
          },
          {
            label: '消费模式',
            prop: 'sellerMode1',
            type: 'select',
            dicData: this.sellerMode,
            span: 8
          },
          {
            label: '时段金额',
            labelWidth: 100,
            append: '元',
            prop: 'fixedMoney1',
            span: 8
          },
          {
            label: '时间段二',
            prop: 'timeRange2',
            type: 'timerange',
            valueFormat: 'HH:mm:ss',
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间',
            span: 8
          },
          {
            label: '消费模式',
            prop: 'sellerMode2',
            type: 'select',
            dicData: this.sellerMode,
            span: 8
          },
          {
            label: '时段金额',
            labelWidth: 100,
            append: '元',
            prop: 'fixedMoney2',
            span: 8
          },
          {
            label: '时间段三',
            prop: 'timeRange3',
            type: 'timerange',
            valueFormat: 'HH:mm:ss',
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间',
            span: 8
          },
          {
            label: '消费模式',
            prop: 'sellerMode3',
            type: 'select',
            dicData: this.sellerMode,
            span: 8
          },
          {
            label: '时段金额',
            labelWidth: 100,
            append: '元',
            prop: 'fixedMoney3',
            span: 8
          },
          {
            label: '时间段四',
            prop: 'timeRange4',
            type: 'timerange',
            valueFormat: 'HH:mm:ss',
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间',
            span: 8
          },
          {
            label: '消费模式',
            prop: 'sellerMode4',
            type: 'select',
            dicData: this.sellerMode,
            span: 8
          },
          {
            label: '时段金额',
            labelWidth: 100,
            append: '元',
            prop: 'fixedMoney4',
            span: 8
          },
          {
            label: '时间段五',
            prop: 'timeRange5',
            type: 'timerange',
            valueFormat: 'HH:mm:ss',
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间',
            span: 8
          },
          {
            label: '消费模式',
            prop: 'sellerMode5',
            type: 'select',
            dicData: this.sellerMode,
            span: 8
          },
          {
            label: '时段金额',
            labelWidth: 100,
            append: '元',
            prop: 'fixedMoney5',
            span: 8
          }
        ]
      };
    }
  }
};
</script>

<style></style>
