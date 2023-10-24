<template>
  <basic-container>
    <div style="margin-bottom: 8px;">
      <el-date-picker
        v-model="accTransTime"
        size="small"
        :clearable="false"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-time="['00:00:00','23:59:59']"
        style="width: 330px;"></el-date-picker>
      <el-input
        style="width: 160px;margin: 0 10px;"
        v-model="empName"
        size="small" clearable
        placeholder="请输入学工号/姓名"
        @keyup.enter.native="search"></el-input>
      <el-input
        v-model="deptParamQuery"
        size="small" clearable
        placeholder="请输入部门名称"
        style="width: 160px;"
        @keyup.enter.native="search"></el-input>
      <el-input
        v-model="devName" 
        size="small" clearable
        placeholder="请输入设备编号"
        style="width: 150px;margin: 0 10px;"
        @keyup.enter.native="search"></el-input>
      <el-select size="small" clearable v-model="recordType" placeholder="请选择交易类型" style="width: 150px;margin-right: 10px;">
        <el-option v-for="item in recordTypeDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
      <el-button
        type="primary"
        size="small"
        style="margin-right: 10px;"
        icon="el-icon-download"
        v-if="permission.energy_xfdetails_exportBtn"
        @click="handleExport">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      highlight-hover-row
      ref="crud"
      size="mini"
      align="center"
      highlight
      :height="tableHeight"
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="data"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #recordType="{row}">
        <el-tag effect="dark" size="mini" type="warning" v-if="row.recordType == 1">消费</el-tag>
        <el-tag effect="dark" size="mini" type="success" v-if="row.recordType == 2">转入</el-tag>
        <el-tag effect="dark" size="mini" v-if="row.recordType == 3">充值</el-tag>
        <el-tag effect="dark" size="mini" type="danger" v-if="row.recordType == 4">退款</el-tag>
        <el-tag effect="dark" size="mini" type="success" v-if="row.recordType == 5">加款</el-tag>
        <el-tag effect="dark" size="mini" type="success" v-if="row.recordType == 6">转出</el-tag>
      </template>
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
import moment from 'moment';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { reqEnergyxfDetails } from '@/api/energy-mng/index.js'

export default {
  data() {
    return {
      accTransTime: [],
      empName: '',
      deptParamQuery: "",
      devName: '',
      recordType: '',
      recordTypeDic:[
        {value:2,label:"转入"},
        {value:3,label:"充值"},
        {value:4,label:"退款"},
        {value:5,label:"加款"},
        {value:1,label:"消费"},
        {value:6,label:"转出"}
      ],
      loading: false,
      data: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      selectionList: []
    };
  },

  mounted() {
    let monthLastDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    let monthStartDay = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    this.accTransTime = [monthStartDay, monthLastDay];
    this.onLoad();
  },
  methods: {
    search() {
      this.selectionList = []
      this.page.currentPage = 1
      this.onLoad();
    },
    reset() {
      this.empName = '';
      this.deptParamQuery = '';
      this.recordType = '';
      this.devName = '';
      let monthLastDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      let monthStartDay = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.accTransTime = [monthStartDay, monthLastDay];
      this.search();
    },
    onLoad(params = {}) {
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['empName'] = this.empName;
      params['deptParamQuery'] = this.deptParamQuery;
      params['devName'] = this.devName;
      params['recordType'] = this.recordType;
      if (this.accTransTime) {
        params['startDateTime'] = this.accTransTime[0];
        params['endDateTime'] = this.accTransTime[1];
      }
      this.loading = true;
      reqEnergyxfDetails(params).then(r => {
        this.loading = false;
        if(r.data.code === 200){
          let d = r.data.data;
          this.page.total = d.total;
          this.data = d.records;
        }
      }).catch(() => this.loading = false)
    },
    selectionChange({records}) {
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
      this.$confirm('是否导出交易明细?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let startDateTime = "",endDateTime = '';
        if (this.accTransTime) {
          startDateTime = this.accTransTime[0];
          endDateTime = this.accTransTime[1];
        }
        window.open(
          `/api/iot-sdctrl/data/list/export?current=${this.page.currentPage}&size=${this.page.pageSize}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&${website.tokenHeader}=${getToken()}&ids=${this.ids}&empName=${this.empName}&recordType=${this.recordType}&deptParamQuery=${this.deptParamQuery}&devName=${this.devName}`
        );
      });
    },
    sumNum(list, field) {
      let count = 0;
      list.forEach(item => count += Number(item[field]));
      return count.toFixed(2);
    },
    footerMethod({ columns, data }) {
      const footerData = [
        columns.map((column, _columnIndex) => {
          if (_columnIndex === 0) {
            return '总计';
          }
          if (['xfOutMoney'].includes(column.property)) {
            return this.sumNum(data, 'xfOutMoney');
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
    ...mapGetters(['permission']),
    tableHeight() {
      return window.innerHeight - 272;
    },
    ids(){
      let ids = this.selectionList.map(v => v.id);
      return ids.join(',')
    },
    options() {
      return [
        { type: 'checkbox', width: 70 ,fixed:"left"},
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '交易类型',
          field: 'recordType',
          sortable: true,
          minWidth: 110,
          slots: {default:"recordType"}
        },
        {
          title: '交易金额',
          field: 'useMoney',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '交易时间',
          field: 'swipeTime',
          sortable: true,
          minWidth: 150,
        },
        {
          title: '设备编号',
          field: 'devCode',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '设备名称',
          field: 'devName',
          sortable: true,
          minWidth: 100,
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
        }
      ]
    }
  },
};
</script>

<style lang="scss" scoped>
/deep/.mytable-footer .row-bgcolor {
  background-color: #ccc;
  color: #000;
  font-weight: 600;
}
</style>
