<template>
  <basic-container>
    <div class="mbottom8">
      <el-date-picker
        v-model="dateTime"
        size="small"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        :clearable="false"
        range-separator="至"
        start-placeholder="识别开始时间"
        end-placeholder="识别结束时间"
        :default-time="['00:00:00','23:59:59']"
        style="width: 330px;margin-right: 10px;"
      ></el-date-picker>
      <el-input
        size="small"
        style="width: 200px;margin-right: 10px;"
        clearable
        @keyup.enter.native="search"
        v-model.trim="empName"
        placeholder="请输入车主姓名/联系电话"
      ></el-input>
      <el-input 
        size="small" 
        style="width: 160px;margin-right: 10px;" 
        clearable
        @keyup.enter.native="search" 
        v-model.trim="plateNum" 
        placeholder="请输入车牌号码"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.park_carinout_export_btn">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      :height="tableHeight"
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
      @checkbox-all="checkboxChangeEvent">
      <template #imgUrl="{row}">
        <img width="30px" height="30px" v-if="row.imgUrl.length > 0" :src="row.imgUrl" @click="openPreview(row.imgUrl)" />
      </template>
    </vxe-grid>
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
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import moment from 'moment';
import { getCarInoutList } from '@/api/parking/car.js';

export default {
  data() {
    return {
      dateTime: [],
      empName: '',
      plateNum: '',
      loading: false,
      tableData: [],
      selectionList: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      }
    };
  },
  mounted() {
    let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    this.dateTime = [start, end];
    this.search();
  },
  methods: {
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.empName = '';
      this.plateNum = '';
      let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.dateTime = [start, end];
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['triggerStartTime'] = this.dateTime[0] || '';
      params['triggerEndTime'] = this.dateTime[1] || '';
      params['plateNum'] = this.plateNum;
      params['empName'] = this.empName;
      this.loading = true;
      getCarInoutList(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
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
    },
    handleExport() {
      this.$confirm('是否导出进出记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-car/inout/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&empName=${this.empName}&plateNum=${this.plateNum}&triggerStartTime=${this.dateTime[0] || ''}&triggerEndTime=${this.dateTime[1] || ''}`
        );
      });
    },
    openPreview(url) {
      let arr = [{
        thumbUrl: url,
        url: url
      }];
      this.$ImagePreview(arr, 0);
    }
  },
  computed: {
    ...mapGetters(['permission']),
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids;
    },
    tableHeight() {
      return window.innerHeight - 264;
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
          title: '车辆类型',
          field: 'carTypeName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '识别时间',
          field: 'triggerTime',
          sortable: true,
          minWidth: 120
        },
        {
          title: '上报时间',
          field: 'createTime',
          sortable: true,
          minWidth: 120
        },
        {
          title: '识别设备',
          field: 'devName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '进出方向',
          field: 'inOutDirection',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            return cellValue == 1 ? '进' : '出';
          }
        },
        {
          title: '所属通道',
          field: 'channelName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '所属岗亭',
          field: 'sentryName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '所属区域',
          field: 'parkingAreaName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '所属车场',
          field: 'parkingName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '识别图片',
          field: 'imgUrl',
          sortable: true,
          minWidth: 100,
          slots: { default: 'imgUrl' }
        }
      ];
    }
  }
};
</script>

<style></style>
