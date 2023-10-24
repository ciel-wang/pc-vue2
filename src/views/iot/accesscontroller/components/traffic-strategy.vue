<template>
  <div>
    <el-dialog
      class="first"
      title="通行策略"
      append-to-body
      top="3vh"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="1280px">
      <el-row :gutter="10">
        <el-col :span="6">
          <div style="background-color: #fff;padding: 10px;height: 782px;">
            <div style="margin-bottom: 8px;">
              <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添加</el-button>
              <el-button type="danger" size="small" icon="el-icon-delete" @click="handleRemove">删除</el-button>
            </div>
            <vxe-table
              border
              stripe
              auto-resize
              resizable
              size="mini"
              highlight-hover-row
              align="center"
              height="695px"
              :data="leftTableData"
              @cell-click="leftTableClick"
              @checkbox-change="leftcheckboxChangeEvent"
              @checkbox-all="leftcheckboxChangeEvent">
              <vxe-column type="checkbox" width="60"></vxe-column>
              <vxe-column type="seq" title="序号" width="60"></vxe-column>
              <vxe-column field="strategyName" title="时段名称"></vxe-column>
            </vxe-table>
          </div>

        </el-col>

        <el-col :span="18">
          <div style="background-color: #fff;padding: 10px;">
            <p>通行时段详情</p>
            <div style="margin: 10px 0 10px 0;border-bottom: 1px solid #E6E6E6;padding-bottom: 10px;">
              <span>时段名称：</span>
              <el-input v-model="strategyName" size="small" style="width: 160px;" placeholder="请输入时段名称" maxlength="20"></el-input>
            </div>
            <div style="margin: 8px 0;">
              <el-button type="primary" size="small" icon="el-icon-edit" @click="timestepDialogVisible = true">编辑时段</el-button>
              <el-button type="danger" size="small" icon="el-icon-delete" @click="handleRest">恢复默认设置</el-button>
            </div>
            <vxe-table
              border
              stripe
              auto-resize
              resizable
              size="mini"
              highlight-hover-row
              align="center"
              :cell-class-name="cellClassName"
              :checkbox-config="{labelField: 'weeks'}"
              :data="rightTableData"
              @checkbox-change="checkboxChangeEvent"
              @checkbox-all="checkboxChangeEvent">
              <vxe-column type="checkbox" width="90" title="全选" align="left"></vxe-column>
              <vxe-column field="step1" title="时段1" minWidth="100"></vxe-column>
              <vxe-column field="step2" title="时段2" minWidth="100"></vxe-column>
              <vxe-column field="step3" title="时段3" minWidth="100"></vxe-column>
              <vxe-column field="step4" title="时段4" minWidth="100"></vxe-column>
              <vxe-column field="step5" title="时段5" minWidth="100"></vxe-column>
            </vxe-table>

            <div style="margin: 20px 0 8px 0;">
              <el-button type="primary" size="small" icon="el-icon-plus" @click="holidayDialogVisible = true;title='添加节日';">添加</el-button>
              <span>（时段重复时，节日时段优先应用）</span>
            </div>
            <vxe-table
              border
              stripe
              resizable
              auto-resize
              size="mini"
              highlight-hover-row
              align="center"
              height="221px"
              :data="holidayTableData">
              <vxe-column field="holidayName" title="节日名称"></vxe-column>
              <vxe-column field="holidayStartDate" title="开始日期"></vxe-column>
              <vxe-column field="holidayEndDate" title="结束日期"></vxe-column>
              <vxe-column title="操作">
                <template #default="{row}">
                  <el-button type="text" @click="holidayForm = row;holidayDialogVisible = true;title = '编辑节日'">编辑</el-button>
                  <el-button type="text" @click="handleDelectHoliday(row)">删除</el-button>
                </template>
              </vxe-column>
            </vxe-table>

            <div style="margin-top: 20px;text-align: center;">
              <el-button type="primary" size="small" icon="el-icon-check" @click="sendSubmit">提交</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-dialog>

    <el-dialog
      title="添加时段"
      append-to-body
      :visible.sync="timestepDialogVisible"
      :close-on-click-modal="false"
      :before-close="timestepClose"
      width="700px">
      <div style="display: flex;">
        <div style="flex: 3;border: 1px solid #E6E6E6;margin-right: 10px;padding: 10px;">
          <p>已选择</p>
          <el-checkbox-group v-model="checkList" style="display: flex;flex-direction: column;padding: 10px 20px;">
            <el-checkbox label="0">一</el-checkbox>
            <el-checkbox label="1">二</el-checkbox>
            <el-checkbox label="2">三</el-checkbox>
            <el-checkbox label="3">四</el-checkbox>
            <el-checkbox label="4">五</el-checkbox>
            <el-checkbox label="5">六</el-checkbox>
            <el-checkbox label="6">日</el-checkbox>
            <el-checkbox label="7">节假日</el-checkbox>
          </el-checkbox-group>
        </div>
        <div style="flex: 9;border: 1px solid #E6E6E6;padding: 10px;">
          <avue-form :option="option" v-model="timeForm" ref="timeFormRef">

          </avue-form>
        </div>
      </div>
      <div slot="footer" style="text-align: center;">
        <el-button type="primary" size="small" icon="el-icon-check" @click="timeFormSubmit">确定</el-button>
        <el-button size="small" icon="el-icon-close" @click="timestepClose">取消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="title"
      append-to-body
      :visible.sync="holidayDialogVisible"
      :close-on-click-modal="false"
      :before-close="holidayClose"
      width="30%">
      <avue-form :option="holidayOption" ref="holidayFormRef" v-model="holidayForm" @submit="holidaySubmit">
        <template slot="menuForm">
          <el-button size="small" icon="el-icon-close" @click="holidayClose">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </div>
</template>

<script>
  import { timeStrategySubmit, getTimeStrategysDic, getTimeStrategysDetails, devRemoveStrategy } from "@/api/iot/access/face";

  export default{
    data(){
      return{
        dialogVisible:false,
        leftTableData:[],
        rightTableData:[
          {weeks:'一',step1:'00:00:00-23:59:59'},
          {weeks:'二',step1:'00:00:00-23:59:59'},
          {weeks:'三',step1:'00:00:00-23:59:59'},
          {weeks:'四',step1:'00:00:00-23:59:59'},
          {weeks:'五',step1:'00:00:00-23:59:59'},
          {weeks:'六',step1:'00:00:00-23:59:59'},
          {weeks:'日',step1:'00:00:00-23:59:59'},
          {weeks:'节假日',step1:'00:00:00-23:59:59'}
        ],
        holidayTableData:[],
        strategyName:'',
        timestepDialogVisible:false,
        checkList:[],
        timeForm:{},
        title:"添加节日",
        holidayDialogVisible:false,
        holidayForm:{},
        form:{
          'monday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'tuesday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'wednesday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'thursday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'friday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'saturday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'sunday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'holiday':[{'startTime':'00:00:00','endTime':'23:59:59'}]
        },
        selectionList:[],
        btnType:'add',
        selectionList2:[]
      }
    },
    watch:{
      'timeForm.dynamic':{
        handler(val){
          if (val) {
            if (val.length > 5) {
              this.$message.warning('最多5个时间段');
              this.timeForm.dynamic.splice(5, this.timeForm.dynamic.length - 5);
            }
          }
        }
      }
    },
    mounted() {
      this.initData()
    },
    methods:{
      handleRemove(){
        if(this.selectionList2.length == 0){
          this.$message.warning('请选择至少一条数据');
          return;
        }
        this.$confirm("确定要删除策略？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let ids = []
          this.selectionList2.forEach(v => {
            ids.push(v.id)
          })
          return devRemoveStrategy({strategyIds:ids});
        }).then(r =>{
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.initData()
          }else{
            this.$message.error(r.data.msg)
          }
        })
      },
      leftTableClick({row,triggerCheckbox}){
        if(!triggerCheckbox){
          this.btnType = 'edit'
          this.selectionList = []
          getTimeStrategysDetails({id:row.id}).then(r => {
            let d = r.data.data
            this.form = d
            this.strategyName = d.strategyName;

            let holidayArr = [...d.holidays]
            holidayArr.forEach(v => {
              v.holidayStartDate = v.holidayStartDate.substring(0,10)
              v.holidayEndDate = v.holidayEndDate.substring(0,10)
            })
            this.holidayTableData = holidayArr;

            let weekArr = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday','holiday']
            let weeks = ['一','二','三','四','五','六','日','节假日'];
            let tableArr = []
            for(let v in d){
              weekArr.forEach((item,i) => {
                if(v == item){
                  tableArr[i] = {
                    weeks:weeks[i],
                    step1:d[v][0].startTime + '-' + d[v][0].endTime,
                    step2:d[v][1] ? d[v][1].startTime + '-' + d[v][1].endTime : '',
                    step3:d[v][2] ? d[v][2].startTime + '-' + d[v][2].endTime : '',
                    step4:d[v][3] ? d[v][3].startTime + '-' + d[v][3].endTime : '',
                    step5:d[v][4] ? d[v][4].startTime + '-' + d[v][4].endTime : '',
                  }
                }
              })
            }
            if(d.holidays.length){
              let arr2 = [...d.holidays[0].holidayPeriod]
              tableArr[7] = {
                weeks:'节假日',
                step1:arr2[0].startTime + '-' + arr2[0].endTime,
                step2:arr2[1] ? arr2[1].startTime + '-' + arr2[1].endTime : '',
                step3:arr2[2] ? arr2[2].startTime + '-' + arr2[2].endTime : '',
                step4:arr2[3] ? arr2[3].startTime + '-' + arr2[3].endTime : '',
                step5:arr2[4] ? arr2[4].startTime + '-' + arr2[4].endTime : '',
              }
              this.form.holiday = arr2
            }else{
              tableArr[7] = {
                weeks:"节假日",
                step1:'00:00:00-23:59:59',
                step2:'',
                step3:'',
                step4:'',
                step5:'',
              }
              this.form.holiday = [{startTime:'00:00:00',endTime:'23:59:59'}]
            }
            this.rightTableData = tableArr;
          })
        }
      },
      sendSubmit(){
        if(!this.strategyName){
          this.$message.warning('请填写时段名称')
          return;
        }
        if(this.flag){
          this.$message.warning('请添加时段')
          return;
        }
        let form = {...this.form}
        form['strategyName'] = this.strategyName.trim()
        let arr3 = JSON.parse(JSON.stringify(this.holidayTableData))
        arr3.forEach(v => {
          v.holidayEndDate = v.holidayEndDate.endsWith('T23:59:59') ? v.holidayEndDate : v.holidayEndDate + 'T23:59:59'
          v.holidayStartDate =v.holidayStartDate.endsWith('T00:00:00') ? v.holidayStartDate : v.holidayStartDate + 'T00:00:00'
          v.holidayPeriod = form.holiday;
        })
        form['holidays'] = arr3;
        if(this.btnType != 'edit'){
          form['id'] = 0
        }
        timeStrategySubmit(form).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.initData()
          }else{
            this.$message.error(r.data.msg)
          }
        })
      },
      handleRest(){
        if(this.selectionList.length == 0){
          this.$message.warning('请选择至少一条数据')
          return;
        }
        let arr1 = [...this.rightTableData]
        let arr = [...this.selectionList]
        arr.forEach(v => {
          if(v.weeks == '一'){
            this.form.monday = [{'startTime':'00:00:00','endTime':'23:59:59'}]
            arr1[0] = {weeks:'一',step1:'00:00:00-23:59:59'}
          }
          if(v.weeks == '二'){
            this.form.tuesday = [{'startTime':'00:00:00','endTime':'23:59:59'}]
            arr1[1] = {weeks:'二',step1:'00:00:00-23:59:59'}
          }
          if(v.weeks == '三'){
            this.form.wednesday = [{'startTime':'00:00:00','endTime':'23:59:59'}]
            arr1[2] = {weeks:'三',step1:'00:00:00-23:59:59'}
          }
          if(v.weeks == '四'){
            this.form.thursday = [{'startTime':'00:00:00','endTime':'23:59:59'}]
            arr1[3] = {weeks:'四',step1:'00:00:00-23:59:59'}
          }
          if(v.weeks == '五'){
            this.form.friday = [{'startTime':'00:00:00','endTime':'23:59:59'}]
            arr1[4] = {weeks:'五',step1:'00:00:00-23:59:59'}
          }
          if(v.weeks == '六'){
            this.form.saturday = [{'startTime':'00:00:00','endTime':'23:59:59'}]
            arr1[5] = {weeks:'六',step1:'00:00:00-23:59:59'}
          }
          if(v.weeks == '日'){
            this.form.sunday = [{'startTime':'00:00:00','endTime':'23:59:59'}]
            arr1[6] = {weeks:'日',step1:'00:00:00-23:59:59'}
          }
          if(v.weeks == '节假日'){
            this.form.holiday = [{'startTime':'00:00:00','endTime':'23:59:59'}]
            arr1[7] = {weeks:'节假日',step1:'00:00:00-23:59:59'}
          }
        })
        this.rightTableData = arr1
      },
      handleAdd(){
        this.btnType = 'add'
        this.resetData()
      },
      resetData(){
        this.strategyName = ""
        this.holidayTableData = []
        this.selectionList = []
        this.rightTableData = [
          {weeks:'一',step1:'00:00:00-23:59:59'},
          {weeks:'二',step1:'00:00:00-23:59:59'},
          {weeks:'三',step1:'00:00:00-23:59:59'},
          {weeks:'四',step1:'00:00:00-23:59:59'},
          {weeks:'五',step1:'00:00:00-23:59:59'},
          {weeks:'六',step1:'00:00:00-23:59:59'},
          {weeks:'日',step1:'00:00:00-23:59:59'},
          {weeks:'节假日',step1:'00:00:00-23:59:59'}
        ]
        this.form = {
          'monday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'tuesday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'wednesday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'thursday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'friday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'saturday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'sunday':[{'startTime':'00:00:00','endTime':'23:59:59'}],
          'holiday':[{'startTime':'00:00:00','endTime':'23:59:59'}]
        }
      },
      initData(){
        getTimeStrategysDic().then(r => {
          this.leftTableData = r.data.data;
        })
      },
      openDialog(){
        this.dialogVisible = true;
      },
      timeFormSubmit(){
        if(this.checkList.length == 0){
          this.$message.warning('请选择日期')
          return;
        }
        if(this.timeForm.dynamic.length == 0){
          this.$message.warning('请选择时段')
          return;
        }
        let weeks = ['一','二','三','四','五','六','日','节假日'];
        let weekArr = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday','holiday']
        let arr = [...this.checkList],arr2 = [...this.timeForm.dynamic],arr3 = [...this.rightTableData]
        let form = {...this.form}
        arr.forEach(v => {
          arr3[v] = {
            weeks:weeks[v],
            step1:arr2[0].startTime + '-' + arr2[0].endTime,
            step2:arr2[1] ? arr2[1].startTime + '-' + arr2[1].endTime : '',
            step3:arr2[2] ? arr2[2].startTime + '-' + arr2[2].endTime : '',
            step4:arr2[3] ? arr2[3].startTime + '-' + arr2[3].endTime : '',
            step5:arr2[4] ? arr2[4].startTime + '-' + arr2[4].endTime : '',
          }
          form[weekArr[v]] = arr2
        })
        this.form = form;
        this.rightTableData = arr3
        this.timestepClose()
      },
      timestepClose(){
        this.checkList = []
        this.timeForm = {}
        this.$refs.timeFormRef.resetForm()
        this.timestepDialogVisible = false
      },
      handleDelectHoliday(row){
        let arr = [...this.holidayTableData]
        arr.forEach((v,i) => {
          if(v.holidayName == row.holidayName){
            arr.splice(i,1)
          }
        })
        this.holidayTableData = arr
      },
      holidaySubmit(form,done){
        let arr = [...this.holidayTableData]

        let index = arr.findIndex(item => item.holidayName == form.holidayName)
        if(index != -1){
          arr[index] = form
        }else{
          arr.push(form)
        }
        this.holidayTableData = arr;
        done()
        this.holidayClose()
      },
      holidayClose(){
        this.$refs.holidayFormRef.resetForm()
        this.holidayDialogVisible = false
      },
      checkboxChangeEvent({records}){
        this.selectionList = records
      },
      leftcheckboxChangeEvent({records}){
        this.selectionList2 = records
      }
    },
    computed:{
      option(){
        return{
          emptyBtn:false,
          submitBtn:false,
          column:[
            {
              label: '请选择时段',
              prop: 'dynamic',
              type: 'dynamic',
              span:24,
              children:{
                align: 'center',
                headerAlign: 'center',
                column: [{
                  label: '开始时间',
                  prop: "startTime",
                  type:'time',
                  rules:[{
                    required:true,
                    message:"请选择开始时间",
                    trigger:"change"
                  }],
                  format:'HH:mm:ss',
                  valueFormat:'HH:mm:ss',
                }, {
                  label: '结束时间',
                  prop: "endTime",
                  type:'time',
                  rules:[{
                    required:true,
                    message:"请选择开始时间",
                    trigger:"change"
                  }],
                  format:'HH:mm:ss',
                  valueFormat:'HH:mm:ss',
                }]
              }
            }
          ]
        }
      },
      holidayOption(){
        return{
          emptyBtn:false,
          column:[
            {
              label:"节日名称",
              prop:"holidayName",
              span:24,
              rules:[{
                required:true,
                message:"请输入节日名称",
                trigger:"blur"
              }],
              maxlength:20
            },
            {
              label:"开始日期",
              prop:"holidayStartDate",
              span:24,
              rules:[{
                required:true,
                message:"请选择开始日期",
                trigger:"change"
              }],
              type:'date',
              format:'yyyy-MM-dd',
              valueFormat:'yyyy-MM-dd',
            },
            {
              label:"结束日期",
              prop:"holidayEndDate",
              span:24,
              rules:[{
                required:true,
                message:"请选择结束日期",
                trigger:"change"
              }],
              type:'date',
              format:'yyyy-MM-dd',
              valueFormat:'yyyy-MM-dd',
            }
          ]
        }
      }
    }
  }
</script>

<style scoped="scoped" lang="scss">
  .first /deep/.el-dialog__body{
    background-color: #E6E6E6;
    padding: 10px;
  }
  p{
    margin: 0;
  }
  /deep/.el-checkbox{
    margin-bottom: 10px;
  }
</style>
