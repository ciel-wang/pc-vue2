<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i
        :style="arrowCfgStyleCommon"
        @click="leftClick"
        v-if="arrowCfg['left'] == 4"
        :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <account-ztree ref="accountZtreeRef" @click="ztreeClick"></account-ztree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div style="margin-bottom: 8px;">
          <el-date-picker
            v-model="dayDate"
            size="small"
            :clearable="false"
            type="daterange"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 250px;"
            :picker-options="{
              disabledDate: time => {
                return time.getTime() > Date.now();
              }
            }"
            start-placeholder="开始日期"
            range-separator="至"
            end-placeholder="结束日期"></el-date-picker>
          <el-input
            size="small" clearable
            style="width: 200px;margin: 0 10px;"
            @keyup.enter.native="search"
            v-model="moreParamQuery"
            placeholder="请输入学工号/姓名"></el-input>
          <el-button
            type="primary"
            size="small"
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
          <el-button
            type="primary"
            size="small"
            v-if="permissionList.bkBtn"
            @click="handleAutoReissueCard"
            >智能补卡</el-button>
          <el-button
            type="primary" size="small"
            @click="handleReissueCard"
            v-if="permissionList.reissuecard">手工签卡</el-button>
          <el-tooltip effect="dark" content="该操作会根据选择范围将当前所有筛选结果进行锁定，锁定后考勤结果将不会重新分析，请谨慎操作！" placement="top">
            <el-button
              type="primary" size="small"
              @click="handleIsLock(true)"
              v-if="permissionList.lockBtn">锁定</el-button>
          </el-tooltip>

          <el-tooltip effect="dark" content="该操作会根据日期选择范围将当前所有筛选结果进行解锁，解锁后考勤结果会根据OA单据、补卡等改变考勤结果，请谨慎操作！" placement="top">
            <el-button
              type="primary" size="small"
              @click="handleIsLock(false)"
              v-if="permissionList.unlockBtn">解锁</el-button>
          </el-tooltip>
          <el-button
            type="primary" size="small"
            @click="kqdataAnalyseClick"
            v-if="permissionList.analyseBtn">考勤分析</el-button>
          <el-checkbox style="margin-left: 10px;" v-model="isErr" @change="checkboxChange">考勤异常</el-checkbox>
        </div>
        <vxe-grid
          border
          resizable
          auto-resize
          highlight-hover-row
          :height="tableHeight"
          ref="xGrid"
          size="mini"
          align="center"
          :highlight="true"
          :columns="tableColumn"
          :loading="loading"
          :row-class-name="rowClassName"
          :cell-class-name="cellClassName"
          :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
          :data="tableData"
          :export-config="{}"
          :mouse-config="{ area: true, extension: false }"
          :menu-config="{ header: { options: menuConfig, disabled: headerDisabled }, body: { options: menuConfig, disabled: bodyDisabled },visibleMethod:() => permission.kq_daysts_edit_btn }"
          @menu-click="contextMenuClickEvent"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent"
          @cell-area-selection-end="cellAreaSelectionEnd"
          @header-cell-area-selection="headerCellAreaSelection">
          <template #dayMode="{ row }">
            <el-tag
              effect="dark"
              type="danger"
              size="mini"
              v-if="row.predictOvertimeMinute">
              {{row.dayMode == 1 ? '平日加班' : row.dayMode == 2 ? '周日加班' : row.dayMode == 3 ? '假日加班' : ''}}
            </el-tag>
          </template>
          <template #leavetimeType="{ row }">
            <el-tag
              v-for="(v, i) in row.qj.type" :key="i"
              effect="dark"
              type="info" size="mini"
              style="margin-right: 2px;">{{ v }}</el-tag>
          </template>
          <template #overtimeType="{ row }">
            <el-tag
              v-for="(v, i) in row.jb.type" :key="i"
              effect="dark"
              type="danger"
              size="mini"
              style="margin-right: 2px;">{{ v }}</el-tag>
          </template>
          <template #evectionType="{ row }">
            <el-tag
              v-for="(v, i) in row.cc.type" :key="i"
              effect="dark"
              type="warning" size="mini"
              style="margin-right: 2px;">{{ v }}</el-tag>
          </template>
          <template #dayDate="{ row }">
            <div>
              <div>{{row.dayDate}} ( {{row.week}} )</div>
              <i
                class="icon-font icon-a-xiangqingpicixiangqingpandianxiangqing locked2"
                :style="{ color: colorName }"
                @click="handleView(row)"></i>
            </div>
          </template>
          <template #empCode="{ row }">
            <div>
              <div>{{row.empCode}}</div>
              <i v-if="row.isLocked == 1" class="icon-font icon-suoding locked" :style="{ color: colorName }"></i>
            </div>
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
            :hide-on-single-page="false"></el-pagination>
        </div>
        <el-dialog
          title="手工签卡"
          :visible.sync="dialogVisible"
          width="400px"
          :before-close="escForm"
          append-to-body
          :modal-append-to-body="true"
          :close-on-click-modal="false"
          :close-on-press-escape="false">
          <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
            <el-form-item size="mini" label="补卡时间" prop="time">
              <el-time-select
                v-model="form.time"
                placeholder="时间"
                style="width: 100%;"
                :picker-options="{ start: '00:00', step: '00:15', end: '23:45'}">
              </el-time-select>
            </el-form-item>

            <el-form-item size="mini" label="签卡原因" prop="remark">
              <el-input
                type="textarea"
                :rows="2"
                placeholder="请输入签卡原因"
                v-model="form.remark">
              </el-input>
            </el-form-item>

            <el-form-item style="text-align: center;width: 100%;">
              <el-button size="mini" type="primary" icon="el-icon-check" @click="submit" :disabled="btnDisabled">补卡</el-button>
              <el-button size="mini" icon="el-icon-close" @click="escForm" :disabled="btnDisabled">取消</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>

        <editClasstimeHoliday ref="editClasstimeHolidayRef2" :classesTimeData="classesTimeData" :jbDic="jbDic" :kqHolidayDic="kqHolidayDic" @refreshPage="onLoad"></editClasstimeHoliday>
        <daysKqDetails ref="daysKqDetailsRef"></daysKqDetails>
      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';
import accountZtree from "@/components/account-ztree/index.vue"
import daysKqDetails from './days-kq-details.vue'
import editClasstimeHoliday from '../scheduling/edit-classtime-holiday.vue'
import { schedulSelectData } from '@/api/kq/scheduling.js';
import { getDictCode } from "@/api/iot/teacher.js"
import { typeroleSelectlist } from "@/api/kq/receipt.js"
import { daystsList, kqdataAnalyse, islockUpdate, classWorkUpdate, reissueCard, autoReissueCard, getDaysDetails } from '@/api/kq/daysts.js';

export default {
  components: { accountZtree, editClasstimeHoliday, daysKqDetails },
  data() {
    return {
      moreParamQuery: '',
      tableData: [],
      loading: false,
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight: '',
      ztreeHeight: '',
      selectionList: [],
      dayDate: '',
      isErr: false,
      classesOptions: [],
      dialogVisible: false,
      menuConfig: [[{name:"编辑",code:"edit"}]],
      headerDisabled: false,
      bodyDisabled: false,
      deptParamQuery: '',
      form:{remark:"",time:""},
      rules:{
        time:[{required: true, message: '请选择签卡时间', trigger: 'change'}],
      },
      btnDisabled:false,
      classesTimeData:[],
      jbDic:[],
      kqHolidayDic:[],
      kqCustomColumnNameDic:[],
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 272;
    this.ztreeHeight = window.innerHeight - 146;
    let dayStartDateStr = moment().format('YYYY-MM-DD');
    let dayEndDateStr = moment().format('YYYY-MM-DD');
    this.dayDate = [dayStartDateStr, dayEndDateStr];
    this.onLoad();
  },
  activated() {
    schedulSelectData().then(r => {
      if (r.data.code == 200) {
        let c = r.data.data.classesTimeList;
        let arr = c.map(v => ({value: v.classesTimeNum,label: v.classesTimeName}))
        this.classesTimeData = [{value:'',label:"空班"},...arr];
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
  methods: {
    handleView(row){
      getDaysDetails({empId:row.empId,dayDate:row.dayDate}).then(r => {
        if(r.data.code === 200){
          let d = r.data.data;
          let form = {}
          form['dayDate'] = d.dayDate;
          form['dayMode'] = d.dayMode;
          form['isPkg'] = d.classesTimeInfo.isPkg;
          let classObj = {}
          if(d.classesTimeInfo.isPkg){
            form['classesTimeName'] = d.classesTimeInfo.classPkg.pkgName;
            form['classesTimeNum'] = d.classesTimeInfo.classPkg.pkgNum;
            d.classesTimeInfo.classTimes.forEach(item => {
              item.forEach(v => {
                if(classObj[v.classesTimeNum]){
                  classObj[v.classesTimeNum].push({
                    startWorkTime:v.startWorkTime.substr(0,5),
                    earlyAcrossDay:v.earlyAcrossDay,
                    endWorkTime:v.endWorkTime.substr(0,5),
                    nightAcrossDay:v.nightAcrossDay,
                    classesTimeName:v.classesTimeName
                  })
                }else{
                  classObj[v.classesTimeNum] = [{
                    startWorkTime:v.startWorkTime.substr(0,5),
                    earlyAcrossDay:v.earlyAcrossDay,
                    endWorkTime:v.endWorkTime.substr(0,5),
                    nightAcrossDay:v.nightAcrossDay,
                    classesTimeName:v.classesTimeName
                  }]
                }
              })
            })
          }else{
            form['classesTimeName'] = row.classesTimeName;
            form['classesTimeNum'] = row.classesTimeNo;
            d.classesTimeInfo.classTimes && d.classesTimeInfo.classTimes.forEach(v => {
              if(classObj[v.classesTimeNum]){
                classObj[v.classesTimeNum].push({
                  startWorkTime:v.startWorkTime.substr(0,5),
                  earlyAcrossDay:v.earlyAcrossDay,
                  endWorkTime:v.endWorkTime.substr(0,5),
                  nightAcrossDay:v.nightAcrossDay,
                  classesTimeName:v.classesTimeName
                })
              }else{
                classObj[v.classesTimeNum] = [{
                  startWorkTime:v.startWorkTime.substr(0,5),
                  earlyAcrossDay:v.earlyAcrossDay,
                  endWorkTime:v.endWorkTime.substr(0,5),
                  nightAcrossDay:v.nightAcrossDay,
                  classesTimeName:v.classesTimeName
                }]
              }
            })
          }
          form['classObj'] = classObj;
          form['receipts'] = d.receipts;
          let kqArr = {}
          d.kqMjDatas.forEach(v => {
            let date = moment(v.swipeTime).format('YYYY-MM-DD');
            let time = moment(v.swipeTime).format('HH:mm');
            if(kqArr[date]){
              kqArr[date].push({dataType:v.dataType,time})
            }else{
              kqArr[date] = [{dataType:v.dataType,time}]
            }
          })
          form['kqMjDatas'] = kqArr;
          this.$refs.daysKqDetailsRef.openDialog(form);
        }
      })
      this.$refs.xGrid.toggleCheckboxRow(row);
    },
    contextMenuClickEvent({ menu, row, column }) {
      let form = {}
      form['empDayDates'] = this.empIdArr;
      this.$refs.editClasstimeHolidayRef2.openDialog(form);
    },
    headerCellAreaSelection({ targetRows, column, $event }) {
      this.empIdArr = [];
      if (column.property == 'classesTimes') {
        this.headerDisabled = false;
        let arr = targetRows.map(v => ({empId:v.empId,dayDate:v.dayDate}))
        this.empIdArr = arr;
      } else {
        this.headerDisabled = true;
      }
      this.$refs.xGrid.scrollTo(0,0)
    },
    cellAreaSelectionEnd({ rows, cols, $event }) {
      if(rows.length === 1 && cols.length === 1 && cols[0].type === "checkbox") return;
      cols.map((column, _columnIndex) => {
        if (['classesTimes'].includes(column.property)) {
          return (this.bodyDisabled = false);
        } else {
          return (this.bodyDisabled = true);
        }
      });
      const xTable = this.$refs.xGrid;
      xTable.setCheckboxRow(rows,true);
      let arr = xTable.getCheckboxRecords();
      this.selectionList = arr;
      let arr2 = arr.map(v => ({empId:v.empId,dayDate:v.dayDate}));
      this.empIdArr = arr2;
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = []
      this.onLoad();
    },
    searchReset() {
      let dayStartDateStr = moment().format('YYYY-MM-DD');
      let dayEndDateStr = moment().format('YYYY-MM-DD');
      this.dayDate = [dayStartDateStr, dayEndDateStr];
      this.moreParamQuery = '';
      this.deptParamQuery = '';
      this.$refs.accountZtreeRef.getAccountZtreeInit();
      this.search();
    },
    kqdataAnalyseClick() {
      if (this.selectionList.length <= 0) {
        this.$message.error('请选择一条数据');
        return;
      }
      this.loading = true;
      kqdataAnalyse({emps:this.empIdArr}).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          this.onLoad();
        } else {
          this.$message.error(r.data.msg);
        }
        this.loading = false;
      }).catch(err => {
        this.loading = false;
      });
    },
    handleAutoReissueCard(){
      if(this.selectionList.length === 0){
        this.$message.error("请选择至少一条数据");
        return;
      }
      this.$confirm("确定要智能补卡?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(()=>{
        return autoReissueCard({emps:this.empIdArr})
      }).then(r => {
        if(r.data.code == 200){
          this.$message.success(r.data.msg);
          this.onLoad()
        }else{
          this.$message.error(r.data.msg)
        }
      })
    },
    handleReissueCard() {
      if (this.selectionList.length <= 0) {
        this.$message.error('请选择一条数据');
        return;
      }
      this.dialogVisible = true;
    },
    submit(){
      this.$refs.formRef.validate((valid) => {
        if(valid){
          this.btnDisabled = true;
          let form = {...this.form};
          form.emps = this.empIdArr;
          reissueCard(form).then(r => {
            this.btnDisabled = false;
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.onLoad()
              this.escForm()
            }else{
              this.$message.error(r.data.msg)
            }
          }).catch(() => this.btnDisabled = false)
        }
      })
    },
    escForm(){
      this.form = {remark:"",time:""}
      this.$refs['formRef'].resetFields();
      this.dialogVisible = false;
    },
    checkboxChange(v) {
      this.onLoad();
    },
    handleIsLock(v) {
      if (this.selectionList.length <= 0) {
        this.$message.error('请选择一条数据');
        return;
      }
      let params = {};
      params['emps'] = this.empIdArr;
      if (v) {
        params['isLock'] = true;
        this.$confirm('确定将选择数据锁定?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return islockUpdate(params);
        }).then(r => {
          if (r.data.code == 200) {
            this.$message.success(r.data.msg);
            this.onLoad();
          } else {
            this.$message.error(r.data.msg);
          }
        });
      } else {
        params['isLock'] = false;
        this.$confirm('确定将选择数据解锁?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return islockUpdate(params);
        }).then(r => {
          if (r.data.code == 200) {
            this.$message.success(r.data.msg);
            this.onLoad();
          } else {
            this.$message.error(r.data.msg);
          }
        });
      }
    },
    ztreeClick(treeNode) {
      this.deptParamQuery = treeNode.valueStr;
      this.page.currentPage = 1;
      this.onLoad();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery.trim();
      }
      params['dayStartDateStr'] = this.dayDate[0];
      params['dayEndDateStr'] = this.dayDate[1];
      params['isErr'] = this.isErr;
      params['deptParamQuery'] = this.deptParamQuery;
      this.loading = true;
      daystsList(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let data = r.data.data;
          this.page.total = data.total;
          let week = ["日",'一','二','三','四','五','六'];
          data.records.forEach(v => {
            if (v.worktimeMinute) {
              v.worktimeMinute = (v.worktimeMinute / 60).toFixed(2);
            }
            if (v.predictWorkTimeMinute) {
              v.predictWorkTimeMinute = (v.predictWorkTimeMinute / 60).toFixed(2);
            }
            if (v.absenteeismMinute) {
              v.absenteeismMinute = (v.absenteeismMinute / 60).toFixed(2);
            }
            if (v.qj) {
              v.leavetimeMinute = (v.qj.minute / 60).toFixed(2);
              v.qj.type = v.qj.type ? v.qj.type.split(',') : [];
            }
            if (v.cc) {
              v.evectionMinute = (v.cc.minute / 60).toFixed(2);
              v.cc.type = v.cc.type ? v.cc.type.split(',') : [];
            }
            if (v.jb) {
              v.overtimeMinute = (v.jb.minute / 60).toFixed(2);
              v.jb.type = v.jb.type ? v.jb.type.split(',') : [];
            }
            // if (v.dayMode == 1) {
            //   v.classesTimes = v.classesTimeName;
            // } else {
            //   v.classesTimes = '休息';
            // }
            v.classesTimes = v.classesTimeName;
            v.week = week[new Date(v.dayDate +' :00:00:00').getDay()]
            if(v.empType == 1){
              v.deptName = v.className
            }
            if(!v.classesTimeNo) return;
            // 如果班次存在
            for(let i = 1;i<4;i++){
              // 上班免卡情况
              if(v[`timestep${i}EarlyIsSignIn`]){
                // 非工作日并且下班卡不存在，上班卡和下班卡都不显示
                if(v.dayMode != 1 && !v[`timestep${i}EworkTime`]){
                  v[`timestep${i}SworkTime`] = "";
                  v[`timestep${i}EworkTime`] = "";
                }
                // 工作日并且下班卡为缺卡时，上下班卡都显示缺卡
                if(v.dayMode == 1 && v[`timestep${i}EworkTime`] === "缺卡"){
                  v[`timestep${i}SworkTime`] = "缺卡";
                  v[`timestep${i}EworkTime`] = "缺卡";
                }
                // 工作日并且下班卡不存在时，上下班卡都不显示
                if(v.dayMode == 1 && !v[`timestep${i}EworkTime`]){
                  v[`timestep${i}SworkTime`] = "";
                  v[`timestep${i}EworkTime`] = "";
                }
              }
              // 下班免卡情况
              if(v[`timestep${i}NightIsSignIn`]){
                // 非工作日并且上班卡不存在，上班卡和下班卡都不显示
                if(v.dayMode != 1 && !v[`timestep${i}SworkTime`]){
                  v[`timestep${i}SworkTime`] = "";
                  v[`timestep${i}EworkTime`] = "";
                }
                // 工作日并且上班卡为缺卡时，上下班卡都显示缺卡
                if(v.dayMode == 1 && v[`timestep${i}SworkTime`] === "缺卡"){
                  v[`timestep${i}SworkTime`] = "缺卡";
                  v[`timestep${i}EworkTime`] = "缺卡";
                }
                // 工作日并且上班卡不存在时，上下班卡都不显示
                if(v.dayMode == 1 && !v[`timestep${i}SworkTime`]){
                  v[`timestep${i}SworkTime`] = "";
                  v[`timestep${i}EworkTime`] = "";
                }
              }
            }
          });
          this.tableData = data.records;
        }
      }).catch(err => {
        this.loading = false;
      });
    },
    handleExport() {
      this.$refs.xGrid.exportData({
        filename: '每日汇总',
        type: 'csv',
        isHeader: true,
        columnFilterMethod: ({ column, $columnIndex }) => {
          return column.type === 'checkbox' ? false : true;
        }
      });
    },
    rowClassName({ row, rowIndex, $rowIndex }) {
      if (row.cdzttimeMinute > 0 || row.absenteeismMinute > 0) {
        return 'red';
      }
    },
    cellClassName({ row, rowIndex, column, columnIndex }) {
      if (column.property === 'classesTimes' || column.property === 'dayDate') {
        return row.dayMode == 2 ? 'cellclass2' : row.dayMode == 3 ? 'cellclass3' : ''
      }
    },
    checkboxChangeEvent({ records }) {
      let arr = records.map(v => ({empId:v.empId,dayDate:v.dayDate}));
      this.empIdArr = arr;
      this.selectionList = records;
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        return rowIndex%2 == 0 ? { rowspan:2, colspan:1 } : { rowspan:0, colspan:0 }
      }
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
    ...mapGetters(['permission', 'btnicon', 'colorName']),
    permissionList() {
      return {
        bkBtn: this.vaildData(this.permission.kq_daysts_every_day_bk_btn, false),
        lockBtn: this.vaildData(this.permission.kq_daysts_every_day_lock_btn, false),
        unlockBtn: this.vaildData(this.permission.kq_daysts_every_day_unlock_btn, false),
        analyseBtn: this.vaildData(this.permission.kq_daysts_every_day_analyse_btn, false),
        exportBtn: this.vaildData(this.permission.kq_daysts_every_day_export_btn, false),
        reissuecard:this.vaildData(this.permission.kq_daysts_every_day_reissuecard_btn, false)
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.empId);
      });
      return ids.join(',');
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 60, fixed: 'left' },
        { type: 'seq', title: '序号', width: 50, fixed: 'left' },
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          width: 90,
          fixed: 'left',
          slots: { default: 'empCode' },
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          width: 100,
          fixed: 'left'
        },
        {
          title: '日期',
          field: 'dayDate',
          sortable: true,
          minWidth: 140,
          cellType: 'string',
          slots: { default: 'dayDate' },
          fixed: 'left'
        },
        {
          title: '部门/班级名称',
          field: 'deptName',
          sortable: true,
          width: 120,
          fixed: 'left'
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          width: 100,
        },
        {
          title: '班次',
          field: 'classesTimes',
          sortable: true,
          minWidth: 100
        },
        {
          title: '时段1',
          children: [
            {
              title: '上班打卡',
              field: 'timestep1SworkTime',
              minWidth: 100
            },
            {
              title: '下班打卡',
              field: 'timestep1EworkTime',
              minWidth: 100
            }
          ]
        },
        {
          title: '时段2',
          children: [
            {
              title: '上班打卡',
              field: 'timestep2SworkTime',
              minWidth: 100
            },
            {
              title: '下班打卡',
              field: 'timestep2EworkTime',
              minWidth: 100
            }
          ]
        },
        {
          title: '时段3',
          children: [
            {
              title: '上班打卡',
              field: 'timestep3SworkTime',
              minWidth: 100
            },
            {
              title: '下班打卡',
              field: 'timestep3EworkTime',
              minWidth: 100
            }
          ]
        },
        {
          title:"正班工时",
          children:[
            {
              title:"应出勤工时(h)",
              field:"predictWorkTimeMinute",
              sortable: true,
              minWidth: 130,
              sortType:"number"
            },
            {
              title:"实际出勤工时(h)",
              field:"worktimeMinute",
              sortable: true,
              minWidth: 130,
              sortType:"number"
            }
          ]
        },
        // {
        //   title:"加班工时",
        //   children:[
        //     {
        //       title:"类型",
        //       field:"dayMode",
        //       sortable: true,
        //       minWidth: 130,
        //       sortType:"number",
        //       slots:{default:"dayMode"}
        //     },
        //     {
        //       title:"实际出勤工时(h)",
        //       field:"predictOvertimeMinute",
        //       sortable: true,
        //       minWidth: 130,
        //       sortType:"number"
        //     },
        //   ]
        // },
        {
          title: '加班单',
          children: [
            {
              title: '类型',
              field: 'overtimeType',
              minWidth: 130,
              slots: { default: 'overtimeType' }
            },
            {
              title: '工时',
              field: 'overtimeMinute',
              minWidth: 60
            }
          ]
        },
        {
          title: '出差单',
          children: [
            {
              title: '类型',
              field: 'evectionType',
              minWidth: 130,
              slots: { default: 'evectionType' }
            },
            {
              title: '工时',
              field: 'evectionMinute',
              minWidth: 60
            }
          ]
        },
        {
          title: '请假单',
          children: [
            {
              title: '类型',
              field: 'leavetimeType',
              minWidth: 130,
              slots: { default: 'leavetimeType' }
            },
            {
              title: '工时',
              field: 'leavetimeMinute',
              minWidth: 60
            }
          ]
        },
        {
          title: '旷工(h)',
          field: 'absenteeismMinute',
          sortable: true,
          minWidth: 100,
          sortType: 'number'
        },
        {
          title: '迟到早退(m)',
          field: 'cdzttimeMinute',
          sortable: true,
          minWidth: 110,
          sortType: 'number'
        }
      ];
    }
  }
};
</script>

<style scoped>
>>> .el-checkbox__label {
  padding-left: 4px;
}
>>> .vxe-pager.size--mini {
  height: 77px;
}
>>> .vxe-body--row.red {
  color: red;
}
>>> .vxe-body--row.defualt {
  color: #606266;
}
>>>.vxe-body--column.cellclass2{
  color: #55a630;
}
>>>.vxe-body--column.cellclass3{
  color: #ffa200;
}
>>> .vxe-body--column.cellclass {
  color: green;
}
.box {
  height: 100%;
  overflow: auto;
}
.locked{
  position: absolute;top: 0;right: 0;z-index: 2000;cursor: pointer;font-size: 22px !important;
}
.locked2{
  position: absolute;top: 0;right: 0;z-index: 2000;cursor: pointer;font-size: 22px !important;
}
</style>
