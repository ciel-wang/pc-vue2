<template>
  <el-dialog
    title="权限查询"
    :visible.sync="dialogVisible"
    width="70%"
    append-to-body
    top="5vh"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <div class="mbottom8">
      <el-input
        size="small"
        style="width: 160px;margin-right: 10px;"
        clearable
        @keyup.enter.native="search"
        v-model.trim="empName"
        placeholder="请输入车主姓名/联系电话"
      ></el-input>
      <el-input
        size="small" clearable
        style="width: 160px;margin-right: 10px;"
        @keyup.enter.native="search"
        v-model.trim="plateNum"
        placeholder="请输入车牌号码"></el-input>
      <el-select
        size="small" clearable
        v-model="authType"
        style="width: 160px;margin-right: 10px;"
        placeholder="请选择权限类型">
        <el-option v-for="item in authTypeDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select
        size="small" clearable
        v-model="channelInOut"
        style="width: 160px;margin-right: 10px;"
        placeholder="请选择进出方向">
        <el-option v-for="item in channelInOutDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      height="600"
      keep-source
      ref="xGrid"
      size="mini"
      align="center"
      :highlight="true"
      :columns="tableColumn"
      :loading="loading"
      :data="tableData"
      :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent"
    ></vxe-grid>
    <div style="min-height: 52px;text-align: right;padding-top: 25px;">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[30, 50, 100, 500,1000,3000]"
        :page-size="page.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :hide-on-single-page="false"
      ></el-pagination>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getCarAuthList } from '@/api/parking/car.js';

export default {
  data() {
    return {
      dialogVisible: false,
      plateNum: '',
      empName: '',
      tableData: [],
      loading: false,
      selectionList: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      authType: '',
      authTypeDic: [{ value: 1, label: '有权' }, { value: 3, label: '黑名单' }],
      channelInOut: '',
      channelInOutDic: [{ value: 1, label: '进' }, { value: 2, label: '出' }]
    };
  },
  methods: {
    handleExport() {
      this.$confirm('是否导出权限查询?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-car/devauth/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&empName=${this.empName}&plateNum=${this.plateNum}&authType=${this.authType}&channelInOut=${this.channelInOut}`
        );
      });
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.empName = '';
      this.plateNum = '';
      this.authType = '';
      this.channelInOut = '';
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['empName'] = this.empName;
      params['plateNum'] = this.plateNum;
      params['authType'] = this.authType;
      params['channelInOut'] = this.channelInOut;
      this.loading = true;
      getCarAuthList(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
          d.records.forEach(v => {
            v.validDate = v.enableTime + '-' + v.overdueTime;
          });
          this.tableData = d.records;
        }
      }).catch(() => {
        this.loading = false;
      });
    },
    checkboxChangeEvent({ records }) {
      this.selectionList = records;
    },
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.onLoad();
    },
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.onLoad();
    }
  },
  computed: {
    ids() {
      return this.selectionList.map(v => v.id);
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '车牌号码',
          field: 'plateNum',
          sortable: true,
          minWidth: 100,
          fixed: 'left'
        },
        {
          title: '车主姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '联系电话',
          field: 'empPhone',
          sortable: true,
          minWidth: 100
        },
        {
          title: '权限类型',
          field: 'authType',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            return cellValue == 1 ? '有权' : cellValue == 2 ? '删除' : '黑名单';
          }
        },
        {
          title: '有效期',
          field: 'validDate',
          sortable: true,
          minWidth: 220
        },
        {
          title: '设备名称',
          field: 'devName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '进出方向',
          field: 'channelInOut',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            return cellValue == 1 ? '进' : '出';
          }
        },
        {
          title: '通道名称',
          field: 'channelName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '操作员',
          field: 'oprtEmpName',
          sortable: true,
          minWidth: 100
        }
      ];
    }
  }
};
</script>

<style></style>
