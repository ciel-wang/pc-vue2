<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <div class="box">
        <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
          <account-ztree ref="accountZtreeRef" @click="onClick"></account-ztree>
        </div>
      </div>
    </el-col>

    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container>
        <el-row>
          <el-col :span="4" style="width: 250px;">
            <el-date-picker
              v-model="dayDate"
              size="small"
              :clearable="false"
              type="daterange"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 250px;"
              start-placeholder="开始日期"
              range-separator="至"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-col>
          <el-col :span="4" style="width: 200px;margin: 0 10px;">
            <el-input size="small" clearable @keyup.enter.native="search" v-model="moreParamQuery" placeholder="请输入学工号/姓名"></el-input>
          </el-col>
          <el-col span="6">
            <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
            <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
            <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permissionList.exportBtn">导出</el-button>
          </el-col>
        </el-row>

        <vxe-grid
          border
          resizable
          auto-resize
          highlight-hover-row
          :height="tableHeight"
          ref="xGrid"
          size="mini"
          align="center"
          :columns="tableColumn"
          :loading="loading"
          :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
          :data="tableData"
          :export-config="{}">
          <template #jbType="{ row }">
            <div v-for="(v, i) in row.jb" :key="i">{{ v.type }}</div>
          </template>
          <template #jbTime="{ row }">
            <div v-for="(v, i) in row.jb" :key="i">{{ (v.minute / 60).toFixed(1) }}</div>
          </template>
          <template #ccType="{ row }">
            <div v-for="(v, i) in row.cc" :key="i">{{ v.type }}</div>
          </template>
          <template #ccTime="{ row }">
            <div v-for="(v, i) in row.cc" :key="i">{{ (v.minute / 60).toFixed(1) }}</div>
          </template>
          <template #qjType="{ row }">
            <div v-for="(v, i) in row.qj" :key="i">{{ v.type }}</div>
          </template>
          <template #qjTime="{ row }">
            <div v-for="(v, i) in row.qj" :key="i">{{ (v.minute / 60).toFixed(1) }}</div>
          </template>
        </vxe-grid>

        <div class="page_class">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page.currentPage"
            :page-sizes="[30, 50, 100, 500, 1000]"
            :page-size="page.pageSize"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="page.total"
            :hide-on-single-page="false"
          ></el-pagination>
        </div>
      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
import moment from 'moment';
import { monthData } from '@/api/kq/daysts.js';
import { mapGetters } from 'vuex';
import accountZtree from "@/components/account-ztree/index.vue"
export default {
  components: { accountZtree },
  data() {
    return {
      moreParamQuery: '',
      dayDate: [],
      tableData: [],
      form: {},
      loading: false,
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight: '',
      ztreeHeight: '',
      selectionList: [],
      deptParamQuery: ''
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 272;
    this.ztreeHeight = window.innerHeight - 146;
    let start = moment().startOf('month').format('YYYY-MM-DD');
    let end = moment().endOf('month').format('YYYY-MM-DD');
    this.dayDate = [start, end];
    this.onLoad();
  },
  methods: {
    search() {
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad();
    },
    searchReset() {
      this.moreParamQuery = '';
      this.deptParamQuery = '';
      this.$refs.accountZtreeRef.getAccountZtreeInit();
      this.search();
    },
    onLoad() {
      let params = {};
      params['current'] = this.page.currentPage;
      params['size'] = this.page.pageSize;
      params['moreParamQuery'] = this.moreParamQuery.trim();
      params['dayStartDateStr'] = this.dayDate[0];
      params['dayEndDateStr'] = this.dayDate[1];
      params['deptParamQuery'] = this.deptParamQuery;
      this.loading = true;
      monthData(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
          d.records.forEach(v => {
            if(v.empType == 1){
              v.deptName = v.className
            }
            if (v.workTimeMinuteTotal) {
              v.workTimeMinuteTotal = (v.workTimeMinuteTotal / 60).toFixed(1);
            }
            if (v.absenteeismMinuteTotal) {
              v.absenteeismMinuteTotal = (v.absenteeismMinuteTotal / 60).toFixed(1);
            }
            if((v.attendanceRate || v.attendanceRate == 0) && (v.predictDays || v.predictDays == 0)){
              v.attendance = (v.attendanceRate/v.predictDays*100).toFixed(1) + '%'
            }
          });
          this.tableData = d.records;
        }
      }).catch(err => {
        this.loading = false;
      });
    },
    onClick(treeNode) {
      this.deptParamQuery = treeNode.valueStr;
      this.page.currentPage = 1;
      this.onLoad();
    },
    handleExport() {
      this.$refs.xGrid.exportData({
        filename: '每月汇总',
        type: 'csv',
        isHeader: true
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
    ...mapGetters(['permission', 'btnicon']),
    permissionList() {
      return {
        exportBtn: this.vaildData(this.permission.kq_daysts_every_month_export_btn, false)
      };
    },
    tableColumn() {
      return [
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          width: 100,
          fixed: 'left'
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          width: 100,
          fixed: 'left'
        },
        {
          title: '部门/班级名称',
          field: 'deptName',
          sortable: true,
          width: 120
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          width: 100
        },
        {
          title: '应出勤天数',
          field: 'predictDays',
          sortable: true,
          minWidth: 100
        },
        {
          title: '实际出勤天数',
          field: 'attendanceRate',
          sortable: true,
          minWidth: 110
        },
        {
          title: '出勤率',
          field: 'attendance',
          sortable: true,
          minWidth: 90
        },
        {
          title: '出勤工时(h)',
          field: 'workTimeMinuteTotal',
          sortable: true,
          minWidth: 110
        },
        {
          title: '加班',
          children: [
            {
              title: '类型',
              field: 'jbType',
              slots: { default: 'jbType' },
              minWidth: 70
            },
            {
              title: '工时',
              field: 'jbTime',
              slots: { default: 'jbTime' },
              minWidth: 70
            }
          ]
        },
        {
          title: '出差',
          children: [
            {
              title: '类型',
              field: 'ccType',
              slots: { default: 'ccType' },
              minWidth: 70
            },
            {
              title: '工时',
              field: 'ccTime',
              slots: { default: 'ccTime' },
              minWidth: 70
            }
          ]
        },
        {
          title: '请假',
          children: [
            {
              title: '类型',
              field: 'qjType',
              slots: { default: 'qjType' },
              minWidth: 70
            },
            {
              title: '工时',
              field: 'qjTime',
              slots: { default: 'qjTime' },
              minWidth: 70
            }
          ]
        },
        {
          title: '旷工(h)',
          field: 'absenteeismMinuteTotal',
          sortable: true,
          minWidth: 90
        },
        {
          title: '迟到早退分钟',
          field: 'cdzttimeMinute',
          sortable: true,
          minWidth: 110
        }
      ];
    }
  }
};
</script>
