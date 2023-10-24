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
        <div class="mbottom8">
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
          <el-input
            size="small" clearable
            @keyup.enter.native="search"
            v-model="moreParamQuery"
            placeholder="请输入学工号/姓名"
            style="width: 160px;margin: 0 10px;"></el-input>
          <el-button
            type="primary" size="small"
            icon="el-icon-search"
            @click="search">搜索</el-button>
          <el-button
            type="default" size="small"
            icon="el-icon-refresh"
            @click="searchReset">重置</el-button>
          <el-button
            type="primary" size="small"
            icon="el-icon-download"
            @click="handleExport"
            v-if="permissionList.exportBtn">导出</el-button>
          <span class="colorBlock"></span>
          <span>节假日</span>
          <span class="colorBlock" style="background-color: #B4EA9D;"></span>
          <span>休息日</span>
        </div>
        <vxe-table
          border
          auto-resize
          ref="xTable"
          align="center"
          size="mini"
           highlight-hover-row
          highlight-hover-column
          highlight-current-column
          :loading="loading"
          :height="tableHeight"
          :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
          :cell-class-name="cellClassName"
          :data="tableData">
          <vxe-table-column title="序号" type="seq" width="70" fixed="left"></vxe-table-column>
          <vxe-table-column title="学工号" width="70" field="empCode" fixed="left"></vxe-table-column>
          <vxe-table-column title="姓名" width="70" field="empName" fixed="left"></vxe-table-column>
          <vxe-table-column title="部门/班级名称" width="120" field="deptName" fixed="left"></vxe-table-column>
          <vxe-table-column title="学校名称" width="100" field="schoolName"></vxe-table-column>
          <vxe-table-column
            v-for="v in tableList"
            :key="v.key"
            :type="v.type"
            :field="v.field"
            :width="v.width"
            :title="v.title"
            min-width="80">
            <template #default="{row,column}">
              <div v-if="row[column.property]">
                <p v-if="row[column.property].worktimeMinute">班：{{row[column.property].worktimeMinute}}H</p>
                <p v-if="row[column.property].absenteeismMinute">旷：{{row[column.property].absenteeismMinute}}H</p>
                <p v-if="row[column.property].overtimeMinute">加：{{row[column.property].overtimeMinute}}H</p>
                <p v-if="row[column.property].dayMode != 1 && !row[column.property].overtimeMinute">休</p>
              </div>
            </template>
          </vxe-table-column>
          <vxe-table-colgroup title="加班">
            <vxe-table-column field="jbType" title="类型" width="100">
              <template #default="{ row }">
                <div v-for="(v,i) in row.jb" :key="'jbType'+i">{{ v.type }}</div>
              </template>
            </vxe-table-column>
            <vxe-table-column field="jbTime" title="工时" width="100">
              <template #default="{ row }">
                <div v-for="(v,i) in row.jb" :key="'jbTime'+i">{{ (v.minute / 60).toFixed(1) }}</div>
              </template>
            </vxe-table-column>
          </vxe-table-colgroup>

          <vxe-table-colgroup title="出差">
            <vxe-table-column field="ccType" title="类型" width="100">
              <template #default="{ row }">
                <div v-for="(v,i) in row.cc" :key="'ccType'+i">{{ v.type }}</div>
              </template>
            </vxe-table-column>
            <vxe-table-column field="ccTime" title="工时" width="100">
              <template #default="{ row }">
                <div v-for="(v,i) in row.cc" :key="'ccTime'+i">{{ (v.minute / 60).toFixed(1) }}</div>
              </template>
            </vxe-table-column>
          </vxe-table-colgroup>

          <vxe-table-colgroup title="请假">
            <vxe-table-column field="qjType" title="类型" width="100">
              <template #default="{ row }">
                <div v-for="(v,i) in row.qj" :key="'qjType'+i">{{ v.type }}</div>
              </template>
            </vxe-table-column>
            <vxe-table-column field="qjTime" title="工时" width="100">
              <template #default="{ row }">
                <div v-for="(v,i) in row.qj" :key="'qjTime'+i">{{ (v.minute / 60).toFixed(1) }}</div>
              </template>
            </vxe-table-column>
          </vxe-table-colgroup>

          <vxe-table-column title="应出勤天数" width="80" field="predictDays"></vxe-table-column>
          <vxe-table-column title="实际出勤天数" width="100" field="attendanceRate"></vxe-table-column>
        </vxe-table>
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
            :hide-on-single-page="false"
          ></el-pagination>
        </div>
      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
import moment from 'moment';
import { collectData } from '@/api/kq/daysts.js';
import { mapGetters } from 'vuex';
import accountZtree from "@/components/account-ztree/index.vue"
export default {
  components: { accountZtree },
  data() {
    return {
      moreParamQuery: '',
      dayDate: [],
      tableData: [],
      tableList: [],
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
  computed: {
    ...mapGetters(['permission', 'btnicon']),
    permissionList() {
      return {
        exportBtn: this.vaildData(this.permission.kq_table_export_btn, false)
      };
    }
  },
  mounted() {
    this.tableHeight = window.innerHeight - 272;
    this.ztreeHeight = window.innerHeight - 146;
    let start = moment().startOf('month').format('YYYY-MM-DD');
    let end = moment().endOf('month').format('YYYY-MM-DD');
    this.dayDate = [start, end];
    this.search();
  },
  methods: {
    search() {
      var startDate = '';
      var endDate = '';
      if (this.dayDate) {
        startDate = this.dayDate[0];
        endDate = this.dayDate[1];
      } else {
        startDate = moment().startOf('month').format('YYYY-MM-DD');
        endDate = moment().endOf('month').format('YYYY-MM-DD');
      }
      var sd = new Date(startDate).getTime(),
        ed = new Date(endDate).getTime(),
        timeDiff = ed - sd;
      var arr = [];
      let j = 4;
      for (var i = 0; i <= timeDiff; i += 86400000) {
        var v = new Date(sd + i);
        arr.push({
          key: j + 1,
          title: v.getMonth() * 1 + 1 + '-' + v.getDate(),
          field: moment(v).format('YYYY-MM-DD')
        });
      }
      if (arr.length > 34) {
        this.$message.error('查询时间不能超过31天');
        return;
      }
      this.tableList = arr;
      this.onLoad();
    },
    searchReset() {
      let start = moment().startOf('month').format('YYYY-MM-DD');
      let end = moment().endOf('month').format('YYYY-MM-DD');
      this.dayDate = [start, end];
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
      collectData(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
          d.records.forEach(v => {
            if(v.empType == 1 && v.gradeName){
              v.deptName = v.gradeName + v.className
            }
            v.days.forEach(j => {
              j.absenteeismMinute = j.absenteeismMinute ? (j.absenteeismMinute/60).toFixed(2) : 0;
              j.cdzttimeMinute = j.cdzttimeMinute ? (j.cdzttimeMinute/60).toFixed(2) : 0;
              j.worktimeMinute = j.worktimeMinute ? (j.worktimeMinute/60).toFixed(2) : 0;
              j.overtimeMinute = j.overtimeMinute ? (j.overtimeMinute/60).toFixed(2) : 0;
              v[j.dayDate] = j
              // if (j.dayMode == 1) {
              //   if (j.absenteeismMinute > 0) {
              //     v[j.dayDate] = '旷';
              //   } else if (j.cdzttimeMinute > 0) {
              //     v[j.dayDate] = '迟到';
              //   } else if (j.ccCount > 0) {
              //     v[j.dayDate] = '出差';
              //   } else if (j.qjCount > 0) {
              //     v[j.dayDate] = '请假';
              //   } else {
              //     v[j.dayDate] = '班';
              //   }
              // }
              // if (j.dayMode == 2) {
              //   v[j.dayDate] = '休';
              // }
            });
          });
          this.tableData = d.records;
          console.log(this.tableData);
        }
      });
    },
    onClick(treeNode) {
      this.deptParamQuery = treeNode.valueStr;
      this.page.currentPage = 1;
      this.onLoad();
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
      this.$refs.xTable.exportData({
        filename: '考勤表',
        type: 'csv',
        isHeader: true,
        columnFilterMethod: ({ column, $columnIndex }) => {
          if (column.type === 'checkbox') {
            return false;
          } else {
            return true;
          }
        }
      });
    },
    cellClassName({row, column }){
      let item = row[column.property];
      if(item && item.dayMode == 2){
        return 'cellclass2';
      }
      if(item && item.dayMode == 3){
        return 'cellclass3';
      }
    },
  }
};
</script>

<style scoped>
.box {
  height: 100%;
  overflow: auto;
}
p{margin: 0;}
>>>.vxe-body--column.cellclass2{
  background-color: #B4EA9D;
}
>>>.vxe-body--column.cellclass3{
  background-color: #FCE0B4;
}
.colorBlock{
  padding: 0 10px;
  background-color: #FCE0B4;
  border-radius: 4px;
  margin-left: 10px;
  margin-right: 2px;
}
</style>
