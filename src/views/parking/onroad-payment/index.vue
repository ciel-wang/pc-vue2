<template>
  <basic-container>
    <div class="mbottom8">
      <el-date-picker
        v-model="inDate"
        size="small"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        :clearable="false"
        range-separator="至"
        start-placeholder="入场开始时间"
        end-placeholder="入场结束时间"
        :default-time="['00:00:00','23:59:59']"
        style="width: 330px;margin-right: 10px;"
      ></el-date-picker>
      <el-date-picker
        v-model="outDate"
        size="small"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        :clearable="false"
        range-separator="至"
        start-placeholder="出场开始时间"
        end-placeholder="出场结束时间"
        :default-time="['00:00:00','23:59:59']"
        style="width: 330px;margin-right: 10px;"
      ></el-date-picker>
      <el-input 
        size="small" 
        style="width: 160px;margin-right: 10px;" 
        clearable 
        @keyup.enter.native="search" 
        v-model.trim="plateNum" 
        placeholder="请输入车牌号码"></el-input>
      <el-input 
        size="small" 
        style="width: 160px;margin-right: 10px;" 
        clearable 
        @keyup.enter.native="search" 
        v-model.trim="sentryName" 
        placeholder="请输入岗亭名称"></el-input>
      <el-select size="small" clearable v-model="rMoney" style="width: 160px;margin-right: 10px;" placeholder="请选择放行类型">
        <el-option v-for="item in rMoneyDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.park_onroad_export_btn">导出</el-button>
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
      :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }">
      <template #payStatus="{row}">
        <el-tag effect="dark" size="mini" type="danger" v-if="row.payStatus == 2">未支付</el-tag>
        <el-tag effect="dark" size="mini" type="primary" v-if="row.payStatus == 1">已支付</el-tag>
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
import { datetimeToDurationTrans } from '@/util/trans.js';
import { getOnroadPaymentList } from '@/api/parking/charge-rules.js';

export default {
  data() {
    return {
      inDate: [],
      outDate: [],
      plateNum: '',
      sentryName: '',
      rMoney: '',
      rMoneyDic: [{ value: 0, label: '免费放行' }, { value: 1, label: '收费放行' }],
      tableData: [],
      loading: false,
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      }
    };
  },
  methods: {
    handleExport() {
      this.$confirm('是否导出临停缴费明细?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-car/fee/bills/list/export?${this.website.tokenHeader}=${getToken()}&current=${this.page.currentPage}&size=${this.page.pageSize}&plateNum=${this.plateNum}&rMoney=${this.rMoney}&startInTime=${this.inDate[0] || ''}&endInTime=${this.inDate[1] || ''}&startOutTime=${this.outDate[0] || ''}&endOutTime=${this.outDate[1] || ''}&sentryName=${this.sentryName}`
        );
      });
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.plateNum = '';
      this.rMoney = '';
      this.sentryName = '';
      this.inDate = [];
      this.outDate = [];
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['plateNum'] = this.plateNum;
      params['rMoney'] = this.rMoney;
      params['startInTime'] = this.inDate[0] || '';
      params['endInTime'] = this.inDate[1] || '';
      params['startOutTime'] = this.outDate[0] || '';
      params['endOutTime'] = this.outDate[1] || '';
      params['sentryName'] = this.sentryName;
      this.loading = true;
      getOnroadPaymentList(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
          d.records.forEach(v => {
            v.stopDuration = datetimeToDurationTrans(v.inTime, v.outTime, false);
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
          title: '金额',
          field: 'ougthMoney',
          sortable: true,
          minWidth: 100
        },
        {
          title: '已付金额',
          field: 'realMoney',
          sortable: true,
          minWidth: 100
        },
        {
          title: '停车时长',
          field: 'stopDuration',
          sortable: true,
          minWidth: 100
        },
        {
          title: '入场时间',
          field: 'inTime',
          sortable: true,
          minWidth: 120
        },
        {
          title: '出场时间',
          field: 'outTime',
          sortable: true,
          minWidth: 120
        },
        {
          title: '放行类型',
          field: 'passType',
          sortable: true,
          minWidth: 100,
          formatter: ({ row }) => {
            return row.realMoney > 0 ? '收费放行' : '免费放行';
          }
        },
        {
          title: '支付状态',
          field: 'payStatus',
          sortable: true,
          minWidth: 100,
          slots: { default: 'payStatus' }
        },
        {
          title: '支付方式',
          field: 'payType',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            return cellValue == 1 ? '微信' : cellValue == 2 ? '支付宝' : '其他';
          }
        },
        {
          title: '支付时间',
          field: 'payTime',
          sortable: true,
          minWidth: 100
        },
        {
          title: '操作人',
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
