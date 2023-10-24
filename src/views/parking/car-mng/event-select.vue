<template>
  <el-dialog
    title="事件查询"
    :visible.sync="dialogVisible"
    width="80%"
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
        style="width: 120px;margin-right: 10px;"  
        @keyup.enter.native="search" 
        v-model.trim="plateNum" 
        placeholder="请输入车牌号码"></el-input>
      <el-select 
        size="small" clearable 
        v-model="executeStatus" 
        style="width: 120px;margin-right: 10px;" 
        placeholder="请选择下载状态">
        <el-option v-for="item in executeStatusDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-date-picker
        v-model="createDate"
        size="small"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        :clearable="false"
        range-separator="至"
        start-placeholder="创建开始时间"
        end-placeholder="创建结束时间"
        style="width: 330px;margin-right: 10px;"
      ></el-date-picker>
      <el-date-picker
        v-model="executeDate"
        size="small"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        :clearable="false"
        range-separator="至"
        start-placeholder="执行开始时间"
        end-placeholder="执行结束时间"
        style="width: 330px;margin-right: 10px;"
      ></el-date-picker>
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
import moment from 'moment';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getEventList } from '@/api/parking/car.js';

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
      executeStatusDic: [{ value: 1, label: '未执行' }, { value: 2, label: '成功' }, { value: 4, label: '失败' }],
      executeStatus: 1,
      createDate: [],
      executeDate: []
    };
  },
  mounted() {
    let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    this.createDate = [start, end];
    this.search();
  },
  methods: {
    handleExport() {
      this.$confirm('是否导出事件查询?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-car/event/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids.join(',')}&current=${this.page.currentPage}&size=${this.page.pageSize}&empName=${this.empName}&plateNum=${this.plateNum}&executeStatus=${this.executeStatus}&createStartTime=${this.createDate[0] || ''}&createEndTime=${this.createDate[1] || ''}&executeStartTime=${this.executeDate[1] || ''}&executeEndTime=${this.executeDate[1] || ''}`
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
      this.executeStatus = 1;
      let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.createDate = [start, end];
      this.executeDate = [];
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['empName'] = this.empName;
      params['plateNum'] = this.plateNum;
      params['executeStatus'] = this.executeStatus;
      params['createStartTime'] = this.createDate[0] || '';
      params['createEndTime'] = this.createDate[1] || '';
      params['executeStartTime'] = this.executeDate[1] || '';
      params['executeEndTime'] = this.executeDate[1] || '';
      this.loading = true;
      getEventList(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
          this.tableData = d.records;
        }
      }).catch(() => this.loading = false);
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
          minWidth: 100
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
          field: 'eventType',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            return cellValue == 1 ? '有权' : cellValue == 2 ? '删除' : '黑名单';
          }
        },
        {
          title: '下载状态',
          field: 'executeStatus',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            let item = this.executeStatusDic.find(item => item.value === cellValue);
            return item ? item.label : '';
          }
        },
        {
          title: '创建时间',
          field: 'createTime',
          sortable: true,
          minWidth: 120
        },
        {
          title: '执行时间',
          field: 'executeTime',
          sortable: true,
          minWidth: 120
        },
        {
          title: '设备名称',
          field: 'devName',
          sortable: true,
          minWidth: 100
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
