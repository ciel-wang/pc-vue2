<template>
  <el-dialog
    title="查看设备"
    :visible.sync="dialogVisible"
    top="8vh"
    :modal-append-to-body="true"
    width="780px"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :append-to-body="true">
    <el-collapse v-model="activeNames">
      <el-collapse-item name="1">
        <template slot="title">
          <i class="iconfont icon-xf-dev" style="font-size: 18px !important;margin-right: 4px;"></i>
          <span class="fw600">消费设备</span>
        </template>
        <el-tag
          type="success" size="mini"
          v-for="(item, index) in xfDevs" :key="'xf' + index"
          style="margin: 0 6px 6px 0;">{{ item.devName }}【{{ item.devCode }}】</el-tag>
      </el-collapse-item>

      <el-collapse-item name="2">
        <template slot="title">
          <i class="iconfont icon-iot-accesscontroller" style="font-size: 18px !important;margin-right: 4px;"></i>
          <span class="fw600">门禁设备</span>
        </template>
        <el-tag
          size="mini"
          v-for="(item, index) in mjDevs" :key="'mj' + index"
          style="margin: 0 6px 6px 0;">{{ item.devName }}【{{ item.devCode }}】</el-tag>
      </el-collapse-item>

      <el-collapse-item name="3">
        <template slot="title">
          <i class="iconfont icon-iot-accesscontroller" style="font-size: 18px !important;margin-right: 4px;"></i>
          <span class="fw600">考勤设备</span>
        </template>
        <el-tag
          size="mini" type="warning"
          v-for="(item, index) in kqDevs" :key="'kq' + index"
          style="margin: 0 6px 6px 0;">{{ item.devName }}【{{ item.devCode }}】</el-tag>
      </el-collapse-item>
    </el-collapse>
  </el-dialog>
</template>

<script>
import { reqDeptSnycDev } from '@/api/iot/dept.js';

export default {
  data() {
    return {
      dialogVisible: false,
      activeNames: ['1', '2', '3'],
      mjDevs: [],
      xfDevs: [],
      kqDevs: []
    };
  },
  methods: {
    openDialog(entityId,entityType) {
      reqDeptSnycDev({ entityId,entityType }).then(r => {
        if (r.data.code === 200) {
          let d = r.data.data;
          this.mjDevs = d.mjDevs || [];
          this.xfDevs = d.xfDevs || [];
          this.kqDevs = d.kqDevs || [];
          this.dialogVisible = true;
        }
      });
    }
  }
};
</script>

<style scoped>
>>> .el-collapse {
  border: none;
}
</style>
