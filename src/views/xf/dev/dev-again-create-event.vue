<template>
  <el-dialog
    title="设备权限迁移"
    :append-to-body="true"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
    :before-close="handleClose"
    width="400px">
    <avue-form ref="formRef" :option="option" v-model="obj" @submit="submit" @error="error">
      <template slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { againDevEventCreate } from '@/api/xf/event';
import website from '@/config/website';
import { getToken } from '@/util/auth';
export default {
  name: 'emp-select',
  data() {
    return {
      moreQueryParam: '',
      data: [],
      devId: '',
      currRows: [],
      obj: {},
      isVisible: false,
      option: {
        emptyBtn: false,
        submitText: '确定',
        labelWidth:120,
        column: [
          {
            label: '目标设备SN',
            placeholder: '请填写目标设备的SN码',
            prop: 'targetDevSn',
            span: 24,
            rules: [{
              required: true,
              message: '请填写目标设备的SN码',
              trigger: 'blur'
            }]
          }
        ]
      }
    };
  },
  computed: {
    ...mapGetters(['colorName'])
  },
  methods: {
    openDialog(dev) {
      this.obj['targetDevSn'] = '';
      this.devId = dev.devId;
      this.isVisible = true;
    },
    submit(form, done) {
      form['devId'] = this.devId;
      againDevEventCreate(form).then(res => {
        this.$message({
          type: 'success',
          message: res.data.msg
        });
        this.$refs['formRef'].resetFields();
        this.obj['targetDevSn'] = '';
        this.isVisible = false;
      });
      done();
    },
    handleClose(done) {
      this.$refs['formRef'].resetFields();
      this.obj['targetDevSn'] = '';
      this.isVisible = false;
    }
  }
};
</script>

<style>
.center_open::before {
  left: 7px !important;
}
</style>
