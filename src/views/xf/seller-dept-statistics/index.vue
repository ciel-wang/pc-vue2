<template>
  <basic-container style="height: 100%;">
    <div style="margin-bottom: 8px;">
      <el-date-picker
        v-model="accTransTime"
        size="small"
        value-format="yyyy-MM-dd"
        type="daterange"
        :clearable="false"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 250px;"
      ></el-date-picker>
      <el-input 
        size="small" clearable
        @keyup.enter.native="onLoad" 
        v-model="moreParamQuery" 
        style="width: 200px;margin: 0 10px"
        placeholder="请输入商户名称"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="onLoad">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport">导出</el-button>
    </div>
    <div>
      <vxe-table
        border
        show-footer
        ref="xTable1"
        align="center"
        highlight-hover-row
        :height="tableHeight.height"
        size="mini"
        :show-overflow="false"
        :export-config="{}"
        :footer-method="footerMethod"
        :footer-span-method="footerColspanMethod"
        footer-row-class-name="footClass"
        :loading="loading"
        :data="tableData">
        <vxe-table-column type="seq" title="序号" width="60"></vxe-table-column>
        <vxe-table-column field="transTime" title="日期" cell-type="string"></vxe-table-column>
        <vxe-table-column field="sellerName" title="商户名称"></vxe-table-column>
        <vxe-table-column field="deptName" title="部门名称"></vxe-table-column>
        <vxe-table-column field="totalMoney" title="总消费" sortable sort-type="number" footer-align="center"></vxe-table-column>
        <vxe-table-column field="dkjcTotalMoney" title="多扣纠错金额" sortable sort-type="number" footer-align="center"></vxe-table-column>
        <vxe-table-column field="realTotalMoney" title="实际消费金额" sortable sort-type="number" footer-align="center"></vxe-table-column>
      </vxe-table>
    </div>
  </basic-container>
</template>

<script>
import { getDataList } from '@/api/xf/sellerdeptstatistics.js';
import moment from 'moment';
export default {
  data() {
    return {
      tableData: [],
      loading: false,
      accTransTime: [],
      moreParamQuery: ''
    };
  },
  mounted() {
    let start = moment().format('YYYY-MM-DD');
    let end = moment().format('YYYY-MM-DD');
    this.accTransTime = [start, end];
    this.onLoad();
  },
  methods: {
    onLoad() {
      this.loading = true;
      let params = {};
      params['accTransStartTime'] = this.accTransTime[0];
      params['accTransEndTime'] = this.accTransTime[1];
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery.trim();
      }
      getDataList(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          this.tableData = r.data.data;
        }
      }).catch(err => {
        this.loading = false;
      });
    },
    sumNum(list, field) {
      let count = 0;
      list.forEach(item => {
        count += Number(item[field]);
      });
      return count.toFixed(2);
    },
    footerMethod({ columns, data }) {
      const footerData = [
        columns.map((column, _columnIndex) => {
          if (_columnIndex === 0) {
            return '总计';
          }
          if (['realTotalMoney'].includes(column.property)) {
            return this.sumNum(data, 'realTotalMoney');
          }
          if (['dkjcTotalMoney'].includes(column.property)) {
            return this.sumNum(data, 'dkjcTotalMoney');
          }
          if (['totalMoney'].includes(column.property)) {
            return this.sumNum(data, 'totalMoney');
          }
          if (['sellerName', 'deptName'].includes(column.property)) {
            return '';
          }
          return null;
        })
      ];
      return footerData;
    },
    footerColspanMethod({ $rowIndex, _columnIndex }) {
      if ($rowIndex === 0) {
        if (_columnIndex === 1) {
          return {
            rowspan: 1,
            colspan: 1
          };
        }
      }
    },
    handleExport() {
      this.$refs.xTable1.exportData({
        filename: '统计',
        type: 'csv',
        isHeader: true,
        isFooter: true
      });
    },
    searchReset() {
      this.moreParamQuery = '';
      let start = moment().format('YYYY-MM-DD');
      let end = moment().format('YYYY-MM-DD');
      this.accTransTime = [start, end];
      this.onLoad();
    },
  },
  computed: {
    tableHeight() {
      return {
        height: window.innerHeight - 190
      };
    }
  }
};
</script>

<style>
.footClass {
  color: red;
  padding: 25px 0;
}
</style>
