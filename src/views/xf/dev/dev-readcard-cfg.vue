<template>
  <el-dialog
    title="设备读卡方式"
    :append-to-body="true"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
    width="400px"
    :before-close="handleEsc">
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit">
      <template slot="menuForm">
        <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { sendDevReadcard } from '@/api/xf/xfdev.js';

export default {
  data() {
    return {
      isVisible: false,
      form: {},
      devIds: ''
    };
  },
  methods: {
    openDialog(ids) {
      this.devIds = ids;
      this.isVisible = true;
    },
    submit(form, done) {
      form['devIds'] = this.devIds;
      sendDevReadcard(form).then(r => {
        done();
        if (r.data.code === 200) {
          this.$message.success(r.data.msg);
          this.handleEsc();
        } else {
          this.$message.error(r.data.msg);
        }
      }).catch(() => done());
    },
    handleEsc() {
      this.isVisible = false;
      this.$refs.formRef.resetForm();
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        submitText: '确定',
        column: [
          {
            label: '端口类型',
            prop: 'port',
            span: 24,
            type: 'select',
            dicData: [{ value: 0, label: '小端' }, { value: 1, label: '大端' }]
          },
          {
            label: '数据类型',
            prop: 'serial_number',
            span: 24,
            type: 'select',
            dicData: [{ value: 0, label: '物理卡号' }, { value: 1, label: '卡序列号' }]
          }
        ]
      };
    }
  }
};
</script>