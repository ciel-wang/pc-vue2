<template>
  <basic-container>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <div style="margin-bottom: 8px;">
        <el-date-picker
          v-model="dayDate"
          type="month"
          size="small"
          :clearable="false"
          format="yyyy-MM"
          value-format="yyyy-MM-dd"
          placeholder="选择月"
          style="width: 200px;"
        ></el-date-picker>
        <el-input
          size="small" clearable
          @keyup.enter.native="search"
          v-model="moreParamQuery"
          style="width: 200px;margin: 0 10px;"
          :placeholder="activeName == 'first' ? '请输入学工号/姓名' : activeName == 'second' ? '请输入部门名称' : '请输入班级名称'"
        ></el-input>
        <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
        <el-button 
          type="primary" 
          size="small" 
          icon="el-icon-download" 
          @click="handleExport"
          v-if="(activeName == 'first' && permission.accounting_statistics_person_export_btn) 
          || (activeName == 'second' && permission.accounting_statistics_dept_export_btn) 
          || (activeName == 'class' && permission.accounting_statistics_class_export_btn)"
          >导出</el-button>
      </div>
      <el-tab-pane label="按人员统计" name="first" v-if="permission.accounting_statistics_person_btn">
        <vxe-grid
          class="mytable-footer"
          border
          resizable
          auto-resize
          highlight-hover-row
          :height="tableHeight"
          ref="xperson"
          size="mini"
          align="center"
          show-footer
          :footer-method="footerMethod"
          :footer-row-class-name="footerRowClass"
          :highlight="true"
          :columns="Column"
          :loading="loading"
          :checkbox-config="{checkField:'checked'}"
          :tooltip-config="{ showAll: true, contentMethod: showTooltipMethod }"
          :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
          :data="personTableData"
          :export-config="{}"
        ></vxe-grid>
        <div class="page_class">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page.currentPage"
            :page-sizes="[100, 500, 1000, 3000, 5000]"
            :page-size="page.pageSize"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="page.total"
          ></el-pagination>
        </div>
      </el-tab-pane>
      <el-tab-pane label="按部门统计" name="second" v-if="permission.accounting_statistics_dept_btn">
        <vxe-grid
          class="mytable-footer"
          border
          resizable
          auto-resize
          :height="tableHeight2"
          ref="xdept"
          size="mini"
          align="center"
          show-footer
          :footer-method="footerMethod"
          :footer-row-class-name="footerRowClass"
          :tooltip-config="{ showAll: true, contentMethod: showTooltipMethod }"
          :highlight="true"
          :columns="Column"
          :loading="loading"
          :data="deptTableData"
          :export-config="{}"
        ></vxe-grid>
      </el-tab-pane>
      <el-tab-pane label="按班级统计" name="class" v-if="permission.accounting_statistics_class_btn">
        <vxe-grid
          class="mytable-footer"
          border
          resizable
          auto-resize
          :height="tableHeight2"
          ref="xclass"
          size="mini"
          align="center"
          show-footer
          :footer-method="footerMethod"
          :footer-row-class-name="footerRowClass"
          :tooltip-config="{ showAll: true, contentMethod: showTooltipMethod }"
          :highlight="true"
          :columns="Column"
          :loading="loading"
          :data="classTableData"
          :export-config="{}"
        ></vxe-grid>
      </el-tab-pane>
    </el-tabs>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { initData, initDeptData, initClassData } from '@/api/xf/accounting-s.js';
import moment from 'moment';
export default {
  data() {
    return {
      activeName: 'first',
      tableHeight: 0,
      tableHeight2: 0,
      loading: false,
      page: {
        pageSize: 100,
        currentPage: 1,
        total: 0
      },
      personTableData: [],
      dayDate: '',
      moreParamQuery: '',
      deptTableData: [],
      empCodeVisible: true,
      empNameVisible: true,
      deptmoreParamQuery: '',
      noConsumeLastMonthBalance: 0,
      classTableData: []
    };
  },
  mounted() {
    if (!this.permission.accounting_statistics_person_btn) {
      this.activeName = 'second';
    }
    if (!this.permission.accounting_statistics_person_btn && !this.permission.accounting_statistics_dept_btn) {
      this.activeName = 'class';
    }
    this.tableHeight = window.innerHeight - 320;
    this.tableHeight2 = window.innerHeight - 245;
    this.dayDate = moment().startOf('month').format('YYYY-MM-DD');
    this.onLoad();
  },
  methods: {
    handleClick(v) {
      this.dayDate = moment().startOf('month').format('YYYY-MM-DD');
      this.moreParamQuery = '';
      this.page.pageSize = 100;
      this.page.currentPage = 1;
      this.page.total = 0;
      this.onLoad();
    },
    search() {
      this.page.currentPage = 1
      this.onLoad();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['moreParamQuery'] = this.moreParamQuery.trim();
      params['accTransStartTime'] = this.dayDate;
      this.loading = true;
      const startTime = Date.now();
      return new Promise((resolve, reject) => {
        if (this.activeName == 'first') {
          initData(params).then(r => {
            this.loading = false;
            if (r.data.code == 200) {
              let d = r.data.data.page;
              this.noConsumeLastMonthBalance = r.data.data.noConsumeLastMonthBalance;
              this.page.total = d.total;
              d.records.forEach(v => {
                v.netIncome = (v.inMoneyTotal - v.outMoneyTotal).toFixed(2);
                v.actualConsumption = (v.xfMoneyTotal - v.dkjcMoneyTotal).toFixed(2);
                v.deptName = v.empType == 1 ? v.className : v.deptName
                v.checked = false
              });
              resolve(d.records);
            } else {
              resolve();
            }
          }).catch(err => {
            this.loading = false;
          });
        } else if(this.activeName == 'second') {
          initDeptData(params).then(r => {
            this.loading = false;
            if (r.data.code == 200) {
              let d = r.data.data;
              this.noConsumeLastMonthBalance = r.data.data.noConsumeLastMonthBalance;
              d.dataList.forEach(v => {
                v.netIncome = (v.inMoneyTotal - v.outMoneyTotal).toFixed(2);
                v.actualConsumption = (v.xfMoneyTotal - v.dkjcMoneyTotal).toFixed(2);
                v.deptName = v.empType == 1 ? v.className : v.deptName
                v.lastBalanceMoney = (v.lastBalanceMoney*1 + (v.mngMoneyTotal*1 || 0)).toFixed(2)
              });
              resolve(d.dataList);
            } else {
              resolve();
            }
          }).catch(err => {
            this.loading = false;
          });
        }else{
          initClassData(params).then(r => {
            this.loading = false;
            if (r.data.code == 200) {
              let d = r.data.data;
              this.noConsumeLastMonthBalance = r.data.data.noConsumeLastMonthBalance || 0;
              d.dataList.forEach(v => {
                v.netIncome = (v.inMoneyTotal - v.outMoneyTotal).toFixed(2);
                v.actualConsumption = (v.xfMoneyTotal - v.dkjcMoneyTotal).toFixed(2);
                v.lastBalanceMoney = (v.lastBalanceMoney*1 + (v.mngMoneyTotal*1 || 0)).toFixed(2)
              });
              resolve(d.dataList);
            } else {
              resolve();
            }
          }).catch(err => {
            this.loading = false;
          });
        }
      }).then(data => {
        const xTable1 = this.$refs.xperson;
        const xTable2 = this.$refs.xdept;
        const xTable3 = this.$refs.xclass;
        if (xTable1 && this.activeName == 'first') {
          xTable1.reloadData(data).then(() => {
            this.loading = false;
          });
          return;
        }
        if (xTable1 && this.activeName == 'second') {
          xTable2.reloadData(data).then(() => {
            this.loading = false;
          });
          return;
        }
        xTable3.reloadData(data).then(() => {
          this.loading = false;
        });
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
          if (['firstBalanceMoney'].includes(column.property)) {
            return this.sumNum(data, 'firstBalanceMoney');
          }
          if (['inMoneyTotal'].includes(column.property)) {
            return this.sumNum(data, 'inMoneyTotal');
          }
          if (['outMoneyTotal'].includes(column.property)) {
            return this.sumNum(data, 'outMoneyTotal');
          }
          if (['netIncome'].includes(column.property)) {
            return this.sumNum(data, 'netIncome');
          }
          if (['xfMoneyTotal'].includes(column.property)) {
            return this.sumNum(data, 'xfMoneyTotal');
          }
          if (['dkjcMoneyTotal'].includes(column.property)) {
            return this.sumNum(data, 'dkjcMoneyTotal');
          }
          if (['actualConsumption'].includes(column.property)) {
            return this.sumNum(data, 'actualConsumption');
          }
          if (['lastBalanceMoney'].includes(column.property)) {
            return this.sumNum(data, 'lastBalanceMoney');
          }
          if (['schoolName'].includes(column.property)) {
            return this.noConsumeLastMonthBalance;
          }
          return null;
        })
      ];
      return footerData;
    },
    showTooltipMethod({ type, column, row, items, _columnIndex }) {
      const { property } = column;
      if (property == 'schoolName') {
        if (type === 'footer') {
          return '本月没有发生收、支活动的账户余额累计';
        }
      }
      return '';
    },
    handleExport() {
      this.$confirm('是否导出账务统计?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.activeName == 'first') {
          this.$refs.xperson.exportData({
            filename: '个人账务统计',
            type: 'csv',
            isHeader: true,
            isFooter: true
          });
          return;
        }
        if (this.activeName == 'second') {
          this.$refs.xdept.exportData({
            filename: '部门账务统计',
            type: 'csv',
            isHeader: true,
            isFooter: true
          });
          return;
        }
        this.$refs.xclass.exportData({
          filename: '班级账务统计',
          type: 'csv',
          isHeader: true,
          isFooter: true
        });
      });
    },
    searchReset() {
      this.moreParamQuery = '';
      this.dayDate = moment().startOf('month').format('YYYY-MM-DD');
      this.search();
    },
    footerRowClass({ $rowIndex }) {
      if ($rowIndex == 0) {
        return 'row-bgcolor';
      }
    }
  },
  computed: {
    ...mapGetters(['permission']),
    Column() {
      return [
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          minWidth: 90,
          fixed: 'left',
          visible:this.activeName == 'first' ? true : false
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100,
          fixed: 'left',
          visible:this.activeName == 'first' ? true : false
        },
        {
          title: '部门名称',
          field: 'deptName',
          sortable: true,
          minWidth: 150,
          fixed: 'left',
          visible:this.activeName != 'class' ? true : false
        },
        {
          title: '班级名称',
          field: 'className',
          sortable: true,
          minWidth: 150,
          fixed: 'left',
          visible:this.activeName == 'class' ? true : false
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          minWidth: 100,
          fixed: 'left'
        },
        {
          title: '期初余额',
          field: 'firstBalanceMoney',
          sortable: true,
          minWidth: 100,
          cellType: 'string'
        },
        {
          title: '总收入',
          children: [
            {
              title: '业务充值',
              field: 'inMoneyTotal',
              sortable: true,
              minWidth: 100
            },
            {
              title: '消费纠错',
              field: 'dkjcMoneyTotal',
              sortable: true,
              minWidth: 100
            }
          ]
        },
        {
          title: '总支出',
          children: [
            {
              title: '业务支出',
              field: 'outMoneyTotal',
              sortable: true,
              minWidth: 100
            },
            {
              title: '消费扣款',
              field: 'xfMoneyTotal',
              sortable: true,
              minWidth: 100
            }
          ]
        },
        {
          title: '期末余额',
          field: 'lastBalanceMoney',
          sortable: true,
          minWidth: 100
        }
      ];
    }
  }
};
</script>

<style scoped>
>>> .mytable-footer .row-bgcolor {
  background-color: #ccc;
  color: #000;
  font-weight: 600;
}
</style>
