<template>
  <!-- 第一步-->
  <basic-container>
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
        style="width: 250px;"></el-date-picker>
      <el-input
        v-model="moreQueryParam"
        size="small" clearable
        placeholder="请输入学工号/姓名"
        style="width: 160px;margin: 0 10px;"
        @keyup.enter.native="search"></el-input>
      <el-input
        v-model="deptParamQuery"
        size="small" clearable
        placeholder="请输入部门/班级名称"
        style="width: 160px;"
        @keyup.enter.native="search"></el-input>
      <el-select size="small" clearable multiple v-model="accTransTypes" placeholder="请选择收支类型" style="width: 200px;margin: 0 10px;">
        <el-option
          v-for="item in accTransTypesArr"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-search" size="small" @click="search">搜索</el-button>
      <el-button icon="el-icon-refresh" size="small" @click="reset">重置</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-download"
        v-if="permissionList.exportBtn"
        @click="handleExport">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      highlight-hover-row
      :height="tableHeight.height"
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="options"
      :loading="loading"
      show-footer
      class="mytable-footer"
      :footer-method="footerMethod"
      :footer-row-class-name="footerRowClass"
      :checkbox-config="{checkField:'checked'}"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="data"
      :export-config="{}"
      :cell-class-name="cellClassName"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
    </vxe-grid>
    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[30, 50, 100, 500,1000]"
        :page-size="page.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :hide-on-single-page="false">
      </el-pagination>
    </div>
  </basic-container>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';
import { getSzDetailQueryList } from '@/api/xf/szdetails';
import website from '@/config/website';
import { getToken } from '@/util/auth';

export default {
  data() {
    return {
      selectionList: [],
      accTransTime: null,
      deptParamQuery: '',
      moreQueryParam: '',
      accTransTypes: '',
      accTransTypesArr: [
        { label: '有卡充值', value: 1 },
        { label: '无卡充值', value: 2 },
        { label: '补贴充值', value: 3 },
        { label: '微信支付', value: 11 },
        {label: "节能钱包转入",value: 15},
        { label: '第三方提现', value: 12 },
        { label: '个人钱包退款', value: 5 },
        { label: '销户', value: 6 },
        { label: '多扣纠错', value: 7 },
        { label: '补贴清零', value: 8 },
        { label: '节能钱包转出', value: 9 },
        { label: '补贴退款', value: 10 },
      ],
      loading: false,
      ids: '',
      data: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      }
    };
  },
  mounted() {
    let monthLastDay = moment().format('YYYY-MM-DD');
    let monthStartDay = moment().format('YYYY-MM-DD');
    this.accTransTime = [monthStartDay, monthLastDay];
    this.onLoad(this.page);
  },
  methods: {
    reset() {
      this.moreQueryParam = '';
      this.deptParamQuery = '';
      this.accTransTypes = '';
      this.page.currentPage = 1;
      let monthLastDay = moment().format('YYYY-MM-DD');
      let monthStartDay = moment().format('YYYY-MM-DD');
      this.accTransTime = [monthStartDay, monthLastDay];
      this.search();
    },
    onLoad(page, params = {}) {
      this.loading = true;
      params['moreParamQuery'] = this.moreQueryParam.trim();
      params['deptParamQuery'] = this.deptParamQuery.trim();
      if (this.accTransTypes.length) {
        params['accTransTypes'] = this.accTransTypes.join(',');
      }
      if (this.accTransTime) {
        params['accTransStartTime'] = this.accTransTime[0];
        params['accTransEndTime'] = this.accTransTime[1];
      }
      getSzDetailQueryList(this.page.currentPage, this.page.pageSize, params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          if (v.accTransType == 8) {
            v.payMode = '现金';
          }
          if (v.accTransType == 9) {
            v.payMode = '节能转出';
            v.accTransMoney = parseFloat(v.xfOutMoney) > 0 ? '-'+v.xfOutMoney : v.xfOutMoney;
          }
          if ([12,5,6,8,9,10].includes(v.accTransType)) {
            if (parseFloat(v.accTransMoney) > 0) v.accTransMoney = '-' + v.accTransMoney;
            if (parseFloat(v.personalWallet) > 0) v.personalWallet = '-' + v.personalWallet;
            if (parseFloat(v.subsidy1Wallet) > 0) v.subsidy1Wallet = '-' + v.subsidy1Wallet;
            if (parseFloat(v.subsidy2Wallet) > 0) v.subsidy2Wallet = '-' + v.subsidy2Wallet;
            if (parseFloat(v.subsidy3Wallet) > 0) v.subsidy3Wallet = '-' + v.subsidy3Wallet;
          }
          if(v.empType == 1){
            v.deptName = v.className
          }
          v.checked = false
        });
        this.data = data.records;
        this.loading = false;
      });
    },
    search() {
      let param = {};
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad(this.page, param);
    },
    selectionChange({records}) {
      this.selectionList = records;
    },
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.onLoad(this.page);
    },
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.onLoad(this.page);
    },
    handleExport() {
      this.$confirm('是否导出收支明细?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = '';
        if (this.selectionList.length > 0) {
          this.selectionList.forEach(v => {
            ids = ids + ',' + v.id;
          });
        }
        ids = ids.substring(1, ids.length);
        let accTransStartTime = '';
        let accTransEndTime = '';
        if (this.accTransTime) {
          accTransStartTime = this.accTransTime[0];
          accTransEndTime = this.accTransTime[1];
        }
        let deptParamQuery = this.deptParamQuery.trim();
        window.open(
          `/api/iot-xf/szdetail/query/list/export?current=${this.page.currentPage}&size=${this.page.pageSize}&accTransStartTime=${accTransStartTime}&accTransEndTime=${accTransEndTime}&${this.website.tokenHeader}=${getToken()}&ids=${ids}&moreParamQuery=${this.moreQueryParam.trim()}&deptParamQuery=${deptParamQuery}&accTransTypes=${this.accTransTypes}`
        );
      });
    },
    cellClassName({ row, rowIndex, column, columnIndex }){
      if(column.property === "accTransMoney"){
        return row.accTransMoney.startsWith('-') ? 'txtred' : row.accTransMoney != '0.00' ? 'txtgreen' : ''
      }
      if(column.property === "personalWallet"){
        return row.personalWallet.startsWith('-') ? 'txtred' : row.personalWallet != '0.00' ? 'txtgreen' : ''
      }
      if(column.property === "subsidy1Wallet"){
        return row.subsidy1Wallet.startsWith('-') ? 'txtred' : row.subsidy1Wallet != '0.00' ? 'txtgreen' : ''
      }
      if(column.property === "subsidy2Wallet"){
        return row.subsidy2Wallet.startsWith('-') ? 'txtred' : row.subsidy2Wallet != '0.00' ? 'txtgreen' : ''
      }
      if(column.property === "subsidy3Wallet"){
        return row.subsidy3Wallet.startsWith('-') ? 'txtred' : row.subsidy3Wallet != '0.00' ? 'txtgreen' : ''
      }
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
          if (['accTransMoney'].includes(column.property)) {
            return this.sumNum(data, 'accTransMoney');
          }
          if (['mngMoney'].includes(column.property)) {
            return this.sumNum(data, 'mngMoney');
          }
          if (['walletTotalMoney'].includes(column.property)) {
            return this.sumNum(data, 'walletTotalMoney');
          }
          if (['personalWallet'].includes(column.property)) {
            return this.sumNum(data, 'personalWallet');
          }
          if (['subsidy1Wallet'].includes(column.property)) {
            return this.sumNum(data, 'subsidy1Wallet');
          }
          if (['subsidy2Wallet'].includes(column.property)) {
            return this.sumNum(data, 'subsidy2Wallet');
          }
          if (['subsidy3Wallet'].includes(column.property)) {
            return this.sumNum(data, 'subsidy3Wallet');
          }
          return null;
        })
      ];
      return footerData;
    },
    footerRowClass({ $rowIndex }) {
      if ($rowIndex == 0) {
        return 'row-bgcolor';
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'permission', 'btnicon']),
    permissionList() {
      return {
        exportBtn: this.vaildData(this.permission.szmx_export_btn, false)
      };
    },
    tableHeight() {
      return {
        height: window.innerHeight - 272
      };
    },
    options() {
      return [
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          fixed: "left",
          minWidth: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          fixed: "left",
          sortable: true,
          minWidth: 100,
        },
        {
          title: '收支日期时间',
          field: 'transTime',
          sortable: true,
          width: 150,
        },
        {
          title: '收支类型',
          field: 'accTransType',
          sortable: true,
          width: 130,
          formatter: ({ cellValue }) => {
            let item = this.accTransTypesArr.find(item => item.value == cellValue)
            return item ? item.label : ''
          },
        },
        {
          title: '收支金额',
          field: 'accTransMoney',
          sortable: true,
          width: 120,
          slot: true
        },
        {
          title: '管理费',
          field: 'mngMoney',
          sortable: true,
          width: 100,
        },
        {
          title: '支付类型',
          field: 'payMode',
          sortable: true,
          width: 100,
        },
        {
          title: '收支金额',
          field: 'Wallet',
          children: [
            {
              title: '个人钱包',
              field: 'personalWallet',
              width: 130,
              slot: true,
              sortable: true,
            },
            {
              title: '补贴钱包1',
              field: 'subsidy1Wallet',
              width: 130,
              slot: true,
              sortable: true,
            },
            {
              title: '补贴钱包2',
              field: 'subsidy2Wallet',
              width: 130,
              slot: true,
              sortable: true,
            },
            {
              title: '补贴钱包3',
              field: 'subsidy3Wallet',
              width: 130,
              slot: true,
              sortable: true,
            }
          ]
        },
        {
          title: '部门/班级名称',
          field: 'deptName',
          sortable: true,
          minWidth: 160,
        },
        {
          title: '学校名称',
          field: 'schoolName',
          minWidth: 100,
          sortable: true,
        },
        {
          title: '操作员',
          field: 'oprtEmpName',
          sortable: true,
          minWidth: 100,
        }
      ]
    }
  },
};
</script>

<style lang="scss" scoped>
.el-scrollbar {
  height: 100%;
}
.center_open::before {
  left: 7px !important;
}
/deep/.vxe-body--column.txtred {
  color: #dd0a00;
  font-weight: 600;
}
/deep/.vxe-body--column.txtgreen {
  color: #008755;
  font-weight: 600;
}
/deep/.mytable-footer .row-bgcolor {
  background-color: #ccc;
  color: #000;
  font-weight: 600;
}
/deep/.el-select__tags{
  flex-wrap: nowrap;
  overflow: hidden;
}
</style>
