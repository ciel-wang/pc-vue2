<template>
  <el-dialog
    title="设备参数"
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
import { faceSetParSeller } from '@/api/xf/xfdev';
import rules from '@/util/numrules';
export default {
  name: 'xf-set-parseller',
  data() {
    return {
      isVisible: false,
      obj: {
        per_maxconsume: 1,
        same_card: 2,
        repeat_face_time: 2,
        free_card: 3,
        device_total_offline_consumemoney: 100
      },
      ids: {}
    };
  },
  methods: {
    openDialog(ids) {
      this.ids = ids;
      this.isVisible = true;
    },
    submit(form, done) {
      form['devIds'] = this.ids;
      form.device_total_offline_consumemoney = parseInt(form.device_total_offline_consumemoney * 100);
      form.per_maxconsume = parseInt(form.per_maxconsume * 100);
      faceSetParSeller(form).then(res => {
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
      for (let i = 1; i <= 15; i++) {
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
            label: '每次消费限额',
            append: '元',
            tip: '仅支持单价模式',
            labelWidth: 150,
            prop: 'per_maxconsume',
            rules: rules.floatNum
          },
          {
            label: '重复消费间隔',
            labelWidth: 150,
            append: '秒',
            prop: 'repeat_face_time',
            rules: rules.interNum
          },
          {
            label: '离线最大消费限额',
            labelWidth: 150,
            tip: '仅支持设备离线最大消费限额',
            append: '元',
            prop: 'device_total_offline_consumemoney',
            rules: rules.floatNum
          }
        ]
      };
    }
  }
};
</script>

<style></style>
