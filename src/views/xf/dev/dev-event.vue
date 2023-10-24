<template>
  <el-dialog
    title="设备待处理事件"
    :append-to-body="true"
    top="10vh"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
    width="1000px">
    <el-button icon="el-icon-refresh" class="resh" @click="onLoad" size="small" type="primary">刷新</el-button>
    <avue-crud 
      :option="option" 
      :search.sync="search" 
      :table-loading="loading" 
      :data="data" 
      ref="crud" 
      @refresh-change="onLoad" 
      v-model="form" 
      @on-load="onLoad"></avue-crud>
  </el-dialog>
</template>

<script>
import { getDevEventDownParams } from '@/api/xf/xfdev';
export default {
  name: 'xf-set-meal',
  data() {
    return {
      data: [],
      isVisible: false
    };
  },
  methods: {
    openDialog(ids) {
      this.isVisible = true;
      this.onLoad();
    },
    onLoad() {
      getDevEventDownParams().then(res => {
        this.data = res.data.data;
      });
    }
  },
  computed: {
    option() {
      return {
        height: 600,
        calcHeight: 80,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        border: true,
        index: true,
        selection: false,
        stripe: true,
        viewBtn: true,
        delBtn: false,
        refreshBtn: false,
        emptyBtnText: '重置',
        columnBtn: false,
        addBtn: false,
        menu: false,
        indexLabel: '序号',
        dialogClickModal: false,
        column: [
          {
            label: '设备名称',
            prop: 'devName',
            sortable: true,
            minWidth: 100,
            align: 'center',
            display: false
          },
          {
            label: '设备编号',
            prop: 'devCode',
            sortable: true,
            minWidth: 100,
            align: 'center',
            display: false
          },
          {
            label: '事件名称',
            prop: 'eventName',
            sortable: true,
            minWidth: 100,
            align: 'center',
            display: false
          }
        ]
      };
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .avue-crud__menu {
  display: none;
}
/deep/ .el-dialog__body {
  padding: 15px 20px !important;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
.resh {
  margin-bottom: 15px;
  margin-left: 7px;
}
</style>
