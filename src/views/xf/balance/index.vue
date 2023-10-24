<template>
  <!-- 第一步-->
  <basic-container>
    <div style="margin-bottom: 8px;">
      <el-input
        style="width: 160px;"
        v-model="moreQueryParam"
        size="small" clearable
        placeholder="请输入学工号/姓名"
        @keyup.enter.native="search"></el-input>
      <el-input
        style="width: 160px;margin: 0 10px;"
        v-model="deptParamQuery"
        size="small" clearable
        placeholder="请输入部门名称"
         @keyup.enter.native="search"></el-input>
      <el-select style="width: 160px;margin-right: 10px;" v-model="empStates" size="small" clearable placeholder="请选择人员状态">
        <el-option v-for="item in userStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-download"
        v-if="permissionList.exportBtn"
        @click="handleExport">导出</el-button>
    </div>
    <vxe-grid
      border
      class="mytable-footer"
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
      :checkbox-config="{checkField:'checked'}"
      :footer-method="footerMethod"
      :footer-row-class-name="footerRowClass"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="data"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
    </vxe-grid>
    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[30, 50, 100, 500,1000,3000]"
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
import { mapGetters } from 'vuex';
import { getAccDetailsQueryBalanceList } from '@/api/xf/account';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getDictCode } from "@/api/iot/teacher.js"
export default {
  data() {
    return {
      deptParamQuery: '',
      empStates: '',
      selectionList: [],
      userStatus: [],
      moreQueryParam: '',
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
    this.onLoad(this.page);
    getDictCode({keys:'userStatus#studentStatus'}).then(res => {
      let d = res.data.data;
      this.userStatus = [];
      let arr = []
      d.studentStatus.forEach(v => {
        arr.push({
          value:v.dictKey,
          label:v.dictValue + '(学生)'
        })
      })
      d.userStatus.forEach(v => {
        arr.push({
          value:v.dictKey,
          label:v.dictValue + '(教师)'
        })
      })
      this.userStatus = arr;
    });
  },
  methods: {
    reset() {
      this.moreQueryParam = '';
      this.empStates = '';
      this.deptParamQuery = '';
      this.search();
    },
    onLoad(page, params = {}) {
      this.loading = true;
      params['moreParamQuery'] = this.moreQueryParam.trim();
      if (this.deptParamQuery) {
        params['deptParamQuery'] = this.deptParamQuery.trim();
      }
      if (this.empStates) {
        params['empState'] = this.empStates;
      }
      if (this.order) {
        params['sortField'] = 'accountBalance';
        params['sortType'] = this.order;
      }
      getAccDetailsQueryBalanceList(this.page.currentPage, this.page.pageSize, params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v =>{
          if(v.empType == 1){
            v.deptName = v.className
          }
          v.checked = false
        })
        this.data = data.records;
        this.loading = false;
      }).catch(() => {
        this.loading = false
      })
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
      this.$confirm('是否导出账户余额明细?', '提示', {
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
        if (this.daterange) {
          accTransStartTime = this.daterange[0];
          accTransEndTime = this.daterange[1];
        }
        window.open(
          `/api/iot-xf/accdetail/query/balance/list/export?current=${this.page.currentPage}&size=${this.page.pageSize}&accTransStartTime=${accTransStartTime}&accTransEndTime=${accTransEndTime}&${this.website.tokenHeader}=${getToken()}&ids=${ids}&moreParamQuery=${this.moreQueryParam.trim()}&deptParamQuery=${this.deptParamQuery.trim()}&empState=${this.empStates}`
        );
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
        exportBtn: this.vaildData(this.permission.account_balance_export_btn, false)
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
          fixed: 'left',
          minWidth: 130,
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          fixed: 'left',
          minWidth: 100,
        },
        {
          title: '账户余额',
          field: 'walletTotalMoney',
          sortable: true,
          minWidth: 130,
        },
        {
          title: '钱包余额',
          field: 'Wallet',
          children: [
            {
              title: '个人钱包',
              field: 'personalWallet',
              width: 160,
              sortable: true,
            },
            {
              title: '补贴钱包1',
              field: 'subsidy1Wallet',
              width: 160,
              sortable: true,
            },
            {
              title: '补贴钱包2',
              field: 'subsidy2Wallet',
              width: 160,
              sortable: true,
            },
            {
              title: '补贴钱包3',
              field: 'subsidy3Wallet',
              width: 160,
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
/deep/.mytable-footer .row-bgcolor {
  background-color: #ccc;
  color: #000;
  font-weight: 600;
}
</style>
