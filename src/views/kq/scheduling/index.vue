<template>
  <basic-container>
    <div style="margin-bottom: 8px;">
      <el-date-picker
        v-model="dayDate"
        size="small" :clearable="false"
        type="daterange"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        style="width: 220px;"
        start-placeholder="开始日期"
        range-separator="至"
        end-placeholder="结束日期"
      ></el-date-picker>
      <el-input
        size="small" clearable
        @keyup.enter.native="search"
        v-model="moreParamQuery"
        style="width: 160px;margin: 0 10px;"
        placeholder="请输入学工号/姓名"></el-input>
      <el-input
        size="small" clearable
        @keyup.enter.native="search"
        v-model="deptParamQuery"
        style="width: 160px;margin-right: 10px;"
        placeholder="请输入部门名称"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permissionList.exportBtn">导出</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permissionList.pbBtn">排班</el-button>
      <span class="colorBlock"></span>
      <span>节假日</span>
      <span class="colorBlock" style="background-color: #B4EA9D;"></span>
      <span>休息日</span>
    </div>
    <vxe-table
      border
      resizable
      ref="xTable"
      auto-resize
      highlight-hover-row
      show-overflow
      :height="tableHeight"
      :loading="loading"
      :export-config="{}"
      :mouse-config="{ area: permission.kq_scheduling_edit_btn, extension: true }"
      :area-config="{extendByCopy: true, extendByCalc: true,beforeExtendSetMethod}"
      :keyboard-config="{ isFNR:false,isClip:true }"
      :clip-config="{ beforePasteMethod,beforeCopyMethod }"
      :menu-config="{ header: { options: menuConfig }, body: { options: menuConfig },visibleMethod:() => permission.kq_scheduling_edit_btn }"
      @menu-click="contextMenuClickEvent"
      :seq-config="{ startIndex: (currentPage - 1) * pageSize }"
      align="center"
      :data="tableData"
      :cell-style="cellClassName"
      @cell-area-selection-end="cellAreaSelectionEnd"
      @header-cell-area-selection="headerCellAreaSelection">
      <vxe-table-column title="学工号" width="90" field="empCode" fixed="left"></vxe-table-column>
      <vxe-table-column title="姓名" width="90" field="empName" fixed="left"></vxe-table-column>
      <vxe-table-column title="部门/班级名称" width="100" field="deptName" fixed="left"></vxe-table-column>
      <vxe-table-column title="学校名称" width="100" field="schoolName" fixed="left"></vxe-table-column>
      <vxe-table-column v-for="v in tableList" :key="v.key" :type="v.type" :field="v.field" :width="v.width" min-width="60">
        <template #header>
          <div>{{ v.title }}</div>
          <div style="color: #999;">{{ v.day }}</div>
        </template>
      </vxe-table-column>
    </vxe-table>

    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[30, 50, 100, 500, 1000]"
        :page-size="pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :hide-on-single-page="false"
      ></el-pagination>
    </div>
    <scheduling-edit ref="schedulingEditRef" @refreshPage="search"  :holidayData="holidayData" :classesTimeData="classesTimeData"></scheduling-edit>
    <editClasstimeHoliday ref="editClasstimeHolidayRef" :classesTimeData="classesTimeData2" :jbDic="jbDic" :kqHolidayDic="kqHolidayDic" @refreshPage="search"></editClasstimeHoliday>

    <div id="tips" class="my_tips" :style="{display:tipDisplay,top:tipTop+'px',left:tipLeft+'px'}">
      修改可以右键试试
    </div>
  </basic-container>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';
import schedulingEdit from './scheduling-edit.vue';
import editClasstimeHoliday from './edit-classtime-holiday.vue'
import { schedulingListData, schedulSelectData, copyPaste } from '@/api/kq/scheduling.js';
import { getDictCode } from "@/api/iot/teacher.js"
import { typeroleSelectlist } from "@/api/kq/receipt.js"

export default {
  components: { schedulingEdit, editClasstimeHoliday },
  data() {
    return {
      dayDate: '',
      moreParamQuery: '',
      deptParamQuery: '',
      tableList: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      arr: [],
      menuConfig: [[
        {name:"编辑",code:"edit"},
        {name:"复制",code:"COPY_CELL"},
        {name:"粘贴",code:"PASTE_CELL"}
      ]],
      loading: false,
      filterName1: '',
      classesTimeData:[],
      classesTimeData2:[],
      holidayData:[],
      jbDic:[],
      kqHolidayDic:[],
      tipDisplay:'none',
      tipTop:0,
      tipLeft:0,
      timer:null,
      empIdArr:[],
      daysArr:[],
      sourceEmpInfos:[]
    };
  },
  mounted() {
    let dayEndDateStr = moment().endOf('month').format('YYYY-MM-DD');
    let dayStartDateStr = moment().startOf('month').format('YYYY-MM-DD');
    this.dayDate = [dayStartDateStr, dayEndDateStr];
    this.search();
    document.getElementById('tips').oncontextmenu = function(){return false;}
  },
  activated() {
    schedulSelectData().then(r => {
      if (r.data.code == 200) {
        let c = r.data.data.classesTimeList;
        let arr = c.map(v => ({value: v.classesTimeNum,label: v.classesTimeName}))
        this.classesTimeData = arr;
        this.classesTimeData2 = [{value:'',label:"空班"},...arr];

        let h = r.data.data.holidayList;
        let arr2 = h.map(v => ({value:v.id,label:v.holidayName}))
        this.holidayData = arr2;
      }
    });
    typeroleSelectlist({roleType:3}).then(r => {
      let d = r.data.data;
      let arr = d.map(v => ({value:v.id,label:v.roleName}))
      this.jbDic = arr;
    })
    getDictCode({ keys: 'kqHolidayNames' }).then(r => {
      let d = r.data.data.kqHolidayNames || []
      let arr = d.map(v => ({value:v.key,label:v.value}))
      this.kqHolidayDic = arr;
    })
  },
  computed: {
    ...mapGetters(['permission', 'btnicon']),
    permissionList() {
      return {
        exportBtn: this.vaildData(this.permission.kq_scheduling_export_btn, false),
        pbBtn: this.vaildData(this.permission.kq_scheduling_scheduling_btn, false)
      };
    },
    tableHeight() {
      return window.innerHeight - 272;
    }
  },
  methods: {
    // 复制之前方法，返回false阻止复制
    beforeCopyMethod({ targetAreas }){
      let { rows, cols } = targetAreas[0];
      let flag = cols.some(v => ['empCode','empName','deptName'].includes(v.property));
      if(flag) {
        this.$message.warning('请选择班次进行相关操作！');
        return false;
      }
      let arr = rows.map(v => cols.map(item => ({empId:v.empId,dayDate:item.property})));
      this.sourceEmpInfos = arr;
    },
    // 粘贴之前方法，返回false阻止粘贴
    beforePasteMethod({ currentAreas }){
      let sourceRows = this.sourceEmpInfos.length;
      let sourceCols = this.sourceEmpInfos[0].length;
      let { rows, cols } = currentAreas[0];
      let flag = cols.some(v => ['empCode','empName','deptName'].includes(v.property));
      if(flag) {
        this.$message.warning('请选择班次进行相关操作！');
        return false;
      }
      if(sourceRows > rows.length || sourceCols > cols.length){
        this.$message.warning('粘贴单元格的行与列必须大于等于复制单元格的行与列');
        return false;
      }
      let targetEmpInfos = rows.map(v => cols.map(item => ({empId:v.empId,dayDate:item.property})));
      copyPaste({ sourceEmpInfos:this.sourceEmpInfos, targetEmpInfos }).then(r => {
        if(r.data.code === 200){
          this.$message.success(r.data.msg);
          this.onLoad();
        }else{
          this.$message.error(r.data.msg);
        }
      })
      return false;
    },
    // 扩展区域前方法，返回false，阻止扩展行为
    beforeExtendSetMethod({ rows,cols, targetRows, targetCols, extendRows, extendCols }){
      let arr1 = rows.map(v => v.empId)
      this.empIdArr = arr1;
      let arr2 = cols.filter(v => !['empCode','empName','deptName'].includes(v.property)).map(v => v.property);
      this.daysArr = arr2;
      if(targetRows.length === 1 && targetCols.length === 1 && !['empCode','empName','deptName'].includes(targetCols[0].property)){
        let sourceEmpInfos = [[{empId:targetRows[0].empId,dayDate:targetCols[0].property}]];
        this.sourceEmpInfos = sourceEmpInfos;
        let arr = extendCols.filter(v => !['empCode','empName','deptName'].includes(v.property));
        let targetEmpInfos = extendRows.map(v => arr.map(item => ({empId:v.empId,dayDate:item.property})));
        copyPaste({ sourceEmpInfos:this.sourceEmpInfos, targetEmpInfos }).then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.onLoad();
          }else{
            this.$message.error(r.data.msg);
          }
        })
      }
      return false;
    },
    contextMenuClickEvent({ menu }) {
      if(menu.code === 'edit'){
        let form = {}
        form["empIds"] = [...this.empIdArr];
        form["dayDates"] = [...this.daysArr];
        this.$refs.editClasstimeHolidayRef.openDialog(form);
      }
    },
    headerCellAreaSelection({ targetRows, column }) {
      this.empIdArr = targetRows.map(v => v.empId);
      this.daysArr = [column.property];
    },
    cellAreaSelectionEnd({ rows,cols,$event }) {
      this.tipTop = $event.clientY - 10;
      this.tipLeft = $event.clientX - 10;
      this.tipDisplay = 'block';
      if(this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.tipDisplay = 'none';
      },3000)

      let arr1 = rows.map(v => v.empId)
      this.empIdArr = arr1;
      let arr2 = cols.filter(v => !['empCode','empName','deptName'].includes(v.property)).map(v => v.property);
      this.daysArr = arr2;
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      let item = row.days.find(v => v.dayDate === column.property);
      if(item && item.dayMode == 1){
        return {backgroundColor:'#fff'}
      }
      if(item && item.dayMode == 2){
        return {backgroundColor:'#B4EA9D'}
      }
      if(item && item.dayMode == 3){
        return {backgroundColor:'#FCE0B4'}
      }
    },
    handleEdit() {
      this.$refs['schedulingEditRef'].dialogVisible = true;
    },
    search() {
      this.tableList = []
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
      var week = ['日', '一', '二', '三', '四', '五', '六'];
      for (var i = 0; i <= timeDiff; i += 86400000) {
        var v = new Date(sd + i);
        arr.push({
          key: i + new Date(),
          title: v.getMonth() * 1 + 1 + '-' + v.getDate(),
          field: moment(v).format('YYYY-MM-DD'),
          day: week[v.getDay()]
        });
      }
      if (arr.length > 31) {
        this.$message.error('查询时间不能超过31天');
        return;
      }
      this.tableList = arr
      this.$nextTick(() => {
        this.$refs.xTable.refreshColumn()
      })
      this.currentPage = 1;
      this.onLoad();
    },
    searchReset() {
      let dayEndDateStr = moment().endOf("month").format("YYYY-MM-DD");
      let dayStartDateStr = moment().startOf("month").format("YYYY-MM-DD")
      this.dayDate = [dayStartDateStr,dayEndDateStr];
      this.moreParamQuery = '';
      this.deptParamQuery = ""
      this.search();
    },
    onLoad() {
      this.display = 'none';
      let params = {};
      params['size'] = this.pageSize;
      params['current'] = this.currentPage;
      params['moreParamQuery'] = this.moreParamQuery.trim();
      params['dayStartDateStr'] = this.dayDate[0];
      params['dayEndDateStr'] = this.dayDate[1];
      params['deptParamQuery'] = this.deptParamQuery.trim();
      this.loading = true;
      const startTime = Date.now();
      return new Promise(resolve => {
        schedulingListData(params).then(res => {
          this.loading = false;
          if (res.data.code == 200) {
            let d = res.data.data;
            this.total = d.total;
            d.records.forEach(v => {
              if(v.empType == 1){
                v.deptName = v.className
              }
              v.days.forEach((i, j) => {
                v[i.dayDate] = i.classesTimeName || '';
                // if (i.dayMode == 1) {
                //   v[i.dayDate] = i.classesTimeName;
                // } else {
                //   v[i.dayDate] = '休';
                // }
              });
            });
            resolve(d.records);
          }
        }).catch(err => {
          this.loading = false;
        });
      }).then(data => {
        const xTable = this.$refs.xTable;
        if (xTable) {
          this.$refs.xTable.reloadData(data).then(() => {
            console.log(`用时 ${Date.now() - startTime}毫秒`);
            this.loading = false;
          });
        }
      })
    },
    handleSizeChange(val) {
      this.currentPage = 1;
      this.pageSize = val;
      this.onLoad();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.onLoad();
    },
    handleExport() {
      this.$refs.xTable.exportData({
        filename: '排班管理',
        type: 'csv',
        isHeader: true,
        original:true
      });
    }
  }
};
</script>

<style scoped lang="scss">
/deep/ .vxe-table--render-default .vxe-cell {
  padding: 0;
}
/deep/ .vxe-table--render-default {
  font-size: 12px;
}
.colorBlock{
  padding: 0 10px;
  background-color: #FCE0B4;
  border-radius: 4px;
  margin-left: 10px;
  margin-right: 2px;
}
.my_tips{
  position: fixed;
  background-color: #000000;
  padding: 10px 20px;
  color: #fff;
  border-radius: 5px;
  z-index: 2002;
  transform: translate(-50%,-100%);
  font-size: 14px;
  &::after{
    content: "";
    position: absolute;
    bottom: -19px;
    left: 50%;
    border: 10px solid;
    border-color: #000 transparent transparent transparent;
    transform: translateX(-50%);
  }
}
</style>
