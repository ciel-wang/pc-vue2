<template>
  <basic-container>
    <div class="mbottom8">
      <el-date-picker
        v-model="createDate"
        size="small"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        :clearable="false"
        range-separator="至"
        start-placeholder="缴费开始时间"
        end-placeholder="缴费结束时间"
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
      <el-select 
        size="small" clearable 
        v-model="carTypeId" 
        style="width: 160px;margin-right: 10px;" 
        placeholder="请选择缴费渠道">
        <el-option v-for="item in carTypeDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.park_monthcar_export_btn">导出</el-button>
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
  </basic-container>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getMonthCarRenewList } from '@/api/parking/charge-rules.js';

export default {
  data() {
    return {
      createDate: [],
      plateNum: '',
      empName: '',
      carTypeId: '',
      carTypeDic: [],
      tableData: [],
      loading: false,
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
    this.createDate = [start, end];
    this.search();
  },
  methods: {
    handleExport() {
      this.$confirm('是否导出月卡续费明细?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-car/carinfo/month/renewal/list/export?${this.website.tokenHeader}=${getToken()}&current=${this.page.currentPage}&size=${this.page.pageSize}&empName=${this.empName}&plateNum=${this.plateNum}&carTypeId=${this.carTypeId}&createStartTime=${this.createDate[0] || ''}&createEndTime=${this.createDate[1] || ''}`
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
      this.createDate = [];
      // this.carTypeId = "";
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['empName'] = this.empName;
      params['plateNum'] = this.plateNum;
      params['createStartTime'] = this.createDate[0] || '';
      params['createEndTime'] = this.createDate[1] || '';
      // params['carTypeId'] = this.carTypeId;
      this.loading = true;
      getMonthCarRenewList(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
          d.records.forEach(v => {
            v.renewDate = v.startTime + '至' + v.endTime;
          });
          this.tableData = d.records;
        }
      }).catch(() => {
        this.loading = false;
      });
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
    ...mapGetters(['permission']),
    tableHeight() {
      return window.innerHeight - 264;
    },
    tableColumn() {
      return [
        // { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '车牌号码',
          field: 'plateNum',
          sortable: true,
          minWidth: 100
        },
        {
          title: '车类名称',
          field: 'carTypeName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '支付方式',
          field: 'payType',
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
          title: '续期金额',
          field: 'renewalTotalMoney',
          sortable: true,
          minWidth: 140
        },
        {
          title: '续费期间',
          field: 'renewDate',
          sortable: true,
          minWidth: 140
        },
        {
          title: '缴费时间',
          field: 'createTime',
          sortable: true,
          minWidth: 100
        },
        {
          title: '备注',
          field: 'shapeName',
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
