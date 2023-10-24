<template>
  <el-dialog
    title="下载权限"
    :append-to-body="true"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
    :before-close="handleClose"
    top="3vh"
    width="1200px">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="按部门下载" name="dept">
        <dev-down-dept :devIds="devIds" v-model="isVisible" ref="devDownDeptRef"></dev-down-dept>
      </el-tab-pane>
      <el-tab-pane label="按年/班级下载" name="gradclass">
        <dev-down-gradclass :devIds="devIds" v-model="isVisible" ref="devDownGradclassRef"></dev-down-gradclass>
      </el-tab-pane>
      <el-tab-pane label="按个人下载" name="person">
        <dev-down-person :devIds="devIds" v-model="isVisible" ref="devDownPersonRef"></dev-down-person>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import DevDownPerson from './dev-down-person';
import DevDownDept from './dev-down-dept';
import DevDownGradclass from './dev-down-gradclass.vue'

export default {
  name: 'emp-select',
  components: {
    DevDownPerson,
    DevDownDept,
    DevDownGradclass
  },
  data() {
    return {
      devIds: '',
      isVisible: false,
      activeName: 'dept'
    };
  },
  methods: {
    close() {
      this.isVisible = false;
    },
    handleClick(val, vv, v) {
      if (val.name == 'dept') {
        this.$refs.devDownDeptRef.openDialog(this.devIds);
      }
      if (val.name == 'gradclass') {
        this.$refs.devDownGradclassRef.openDialog(this.devIds);
      }
      if (val.name == 'person') {
        this.$refs.devDownPersonRef.openDialog(this.devIds);
      }
    },
    openDialog(ids) {
      this.devIds = ids;
      this.isVisible = true;
      this.activeName = 'dept';
      this.$nextTick(() => {
        this.$refs.devDownDeptRef.openDialog(this.devIds);
      });
    },
    handleClose(done) {
      this.devIds = '';
      this.$refs.devDownDeptRef.empData = [];
      this.$refs.devDownDeptRef.clearData();
      done();
    }
  }
};
</script>

<style scoped>
.el-dialog__body {
  padding: 10px 20px !important;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
/deep/ .el-dialog__body {
  padding: 5px 25px !important;
}
</style>
