<template>
  <div class="dorm_panel myopacity">
    <el-row class="leftTop">
      <el-col :span="5">
        <div class="leftItem">
          <p>实时信息统计</p>
          <p>{{todayHours}}</p>
          <p>{{todayDate}}</p>
          <i class="iconfont icon-shezhi" @click="dialogVisible = true"></i>
        </div>
      </el-col>
      <el-col :span="14">
        <div class="flexAround" style="margin: 0 10px;">
          <div style="border-right: 1px solid #999;width: 33%;">
            <p>入住总人数</p>
            <p class="fw600 font20"><avue-count-up decimals="0" :end="obj.liveTotalCount"></avue-count-up></p>
            <p>请假：<avue-count-up decimals="0" :end="obj.qjCount"></avue-count-up></p>
          </div>
          <div style="width: 33%;">
            <p>宿舍内人数</p>
            <p class="fw600 font20"><avue-count-up decimals="0" :end="obj.inCount"></avue-count-up></p>
            <p><avue-count-up decimals="2" :end="obj.insideABR"></avue-count-up>%</p>
          </div>
          <div style="width: 33%;">
            <p>宿舍外人数</p>
            <p class="fw600 font20"><avue-count-up decimals="0" :end="obj.outCount"></avue-count-up></p>
            <p><avue-count-up decimals="2" :end="obj.outsideABR"></avue-count-up>%</p>
          </div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="leftItem" style="color: red;">
          <p>异常人数</p>
          <p class="fw600 font20"><avue-count-up decimals="0" :end="obj.errCount"></avue-count-up></p>
          <p><avue-count-up decimals="2" :end="obj.errCountABR"></avue-count-up>%</p>
        </div>
      </el-col>
    </el-row>

    <el-row class="bodyClass">
      <div>
        <div v-for="(v,i) in floorArr" :key="i+'floor'" class="flexAround" @click="floorItemClick(v)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-susheweihu" />
          </svg>
          <div>
            <p>{{v.floorName}}</p>
            <p>宿舍数量：{{v.dormCount}}间</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;宿舍内：{{v.empInCount}}人</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;宿舍外：{{v.empOutCount}}人</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;总人数：{{v.dormEmpTotalCount}}人</p>
          </div>
        </div>
      </div>
    </el-row>

    <el-dialog
      title="监控时段"
      :visible.sync="dialogVisible"
      width="40%"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div style="margin: 8px 0;">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleAdd"
          v-if="permissionList.addBtn">
          添加</el-button>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-edit"
          @click="handleEdit"
          v-if="permissionList.editBtn">
          编辑</el-button>
        <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          @click="handleDelete"
          v-if="permissionList.delBtn"
          >删除</el-button>
      </div>
      <vxe-table
        border
        auto-resize
        ref="tableRef"
        highlight-hover-column
        highlight-current-column
        size="mini"
        height="400px"
        align="center"
        :loading="loading"
        :data="tableData"
        @checkbox-change="checkboxChangeEvent1"
        @checkbox-all="checkboxChangeEvent1">
        <vxe-table-column width="50" type='checkbox'></vxe-table-column>
        <vxe-table-column title="开始时间" minWidth="70" field="startTime"></vxe-table-column>
        <vxe-table-column title="结束时间" minWidth="70" field="endTime"></vxe-table-column>
        <vxe-table-column title="类型" minWidth="70" field="inOrOut" :formatter="({ cellValue })=>{
          return cellValue == 1 ? '宿舍内' : cellValue == 2 ? '宿舍外' : ''
        }"></vxe-table-column>
        <vxe-table-column title="是否记异常" minWidth="70" field="isErrStatus" :formatter="({ cellValue })=>{
          return cellValue ? '是' : '否'
        }"></vxe-table-column>
        <vxe-table-column title="应用范围" minWidth="100" field="weeksLabel"></vxe-table-column>
        <vxe-table-column title="推送类型" minWidth="100" field="pushTypeLabel"></vxe-table-column>
      </vxe-table>
    </el-dialog>

    <el-dialog
      :title="addEditTitle"
      :visible.sync="editdialogVisible"
      width="30%"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="escClose">
      <avue-form
        ref="formRef"
        :option="option"
        v-model="addEditForm"
        @submit="submit"
        @error="error">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="escClose" icon="el-icon-close">取消</el-button>
        </template>
        <template slot="tips">
          <div>节假日以法定节假日为准，如需修改请联系管理员。</div>
        </template>
      </avue-form>
    </el-dialog>
  </div>
</template>

<script>
  import moment from 'moment'
  import { mapGetters } from 'vuex';
  import website from '@/config/website';
  import { getToken } from '@/util/auth';
  import { getPanelFloorInfo, getTimecfgData, addTimecfg, updateTimecfg, removeTimecfg } from '@/api/dorm/real_monitor.js'

  export default{
    data(){
      return{
        todayHours:moment().format('HH:mm:ss'),
        todayDate:moment().format("YYYY年MM月DD日"),
        timer:"",
        obj:{liveTotalCount:0,qjCount:0,inCount:0,insideABR:0,outCount:0,outsideABR:0,errCount:0,errCountABR:0},
        floorArr:[],
        dialogVisible:false,
        loading:false,
        tableData:[],
        selectionList:[],
        addEditTitle:"添加",
        editdialogVisible:false,
        addEditForm:{},
        timer1:""
      }
    },
    activated() {
      this.timer = setInterval(() => {
        this.initDate()
      },1000)
      this.initFloorList()
      this.search()
      this.timer1 = setInterval(() => {
        this.initFloorList()
      },5000)
    },
    deactivated() {
      clearInterval(this.timer)
      clearInterval(this.timer1)
      this.timer = null;
      this.timer1 = null;
    },
    methods:{
      submit(form,done){
        let form1 = {...this.addEditForm}
        form1['weeks'] = form1.weeks.join(',')
        form1['pushType'] = form1.pushType.join(',')
        if(this.btnType == 'edit'){
          updateTimecfg(form1).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.search()
              this.escClose()
              done()
            }else{
              this.$message.error(r.data.msg);
              done()
            }
          }).catch(() => {
            done()
          })
        }else{
          addTimecfg(form1).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.escClose()
              this.search()
              done()
            }else{
              this.$message.error(r.data.msg);
              done()
            }
          }).catch(() => {
            done()
          })
        }
      },
      handleAdd(){
        this.editdialogVisible = true
        this.addEditForm.inOrOut = 3
        this.addEditForm.isErrStatus = true
        this.btnType = 'add'
        this.addEditTitle = "添加"
      },
      handleEdit(){
        if(this.selectionList.length != 1){
          this.$message.warning("请选择一条数据")
          return;
        }
        this.addEditForm = this.selectionList[0]
        this.addEditForm.weeks = this.selectionList[0].weeks.split(',')
        this.addEditForm.pushType = this.selectionList[0].pushType.split(',')
        this.editdialogVisible = true;
        this.btnType = 'edit'
        this.addEditTitle = "编辑"
      },
      handleDelete(){
        if ( this.selectionList.length == 0) {
          this.$message.warning("请选择要删除的数据");
          return;
        }
        this.$confirm("确定要删除选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return removeTimecfg({ids:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }
        })
      },
      escClose(){
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.editdialogVisible = false
      },
      search(){
        getTimecfgData().then(r => {
          let arr = [{value:1,label:'星期一'},{value:2,label:'星期二'},{value:3,label:'星期三'},{value:4,label:'星期四'},{value:5,label:'星期五'},{value:6,label:'星期六'},{value:7,label:'星期天'},{value:8,label:'节假日'}]
          let pushTypeArr = [{value:'1',label:'学生'},{value:'2',label:'家长'},{value:'3',label:'教师'},{value:'4',label:'楼管'}]
          r.data.data.forEach(v => {
            let arr2 = v.weeks.split(','),arr3 = [],arr4 = v.pushType.split(','),arr5 = []
            let newList = arr.filter(item => arr2.some(x => x == item.value ))
            newList.forEach(i => {
              arr3.push(i.label)
            })
            let newList2 = pushTypeArr.filter(item => arr4.some(x => x == item.value ))
            newList2.forEach(j => {
              arr5.push(j.label)
            })
            v.weeksLabel = arr3
            v.pushTypeLabel = arr5
          })
          this.tableData = r.data.data;
        })
      },
      floorItemClick(val){
        this.$router.push({path:'/dorm/panel/panel_dorm',query: {floorId:val.floorId,name:val.floorName}})
      },
      initFloorList(){
        getPanelFloorInfo().then(r => {
          let d = r.data.data
          d.statisticsData.insideABR = (d.statisticsData.inCount / d.statisticsData.liveTotalCount)*100
          d.statisticsData.outsideABR = (d.statisticsData.outCount / d.statisticsData.liveTotalCount)*100
          d.statisticsData.qjCount = d.statisticsData.qjCount || 0
          d.statisticsData.errCountABR = (d.statisticsData.errCount / d.statisticsData.liveTotalCount)*100
          this.obj = d.statisticsData
          this.floorArr = d.floorList;
        })
      },
      checkboxChangeEvent1({records}){
        this.selectionList = records;
      },
      initDate(){
        this.todayDate = moment().format("YYYY年MM月DD日")
        this.todayHours = moment().format('HH:mm:ss')
      },
    },
    computed:{
      ...mapGetters(['permission']),
      permissionList() {
        return {
          addBtn: this.vaildData(this.permission.dorm_monitor_timestep_add_btn, false),
          editBtn: this.vaildData(this.permission.dorm_monitor_timestep_edit_btn, false),
          delBtn: this.vaildData(this.permission.dorm_monitor_timestep_delete_btn, false)
        };
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      option(){
        return{
          emptyBtn: false,
          submitText: "保存",
          labelWidth:120,
          column:[
            {
              label: "开始时间",
              prop: "startTime",
              span: 16,
              rules:[{
                required:true,
                message:"请选择开始时间",
                trigger:'change'
              }],
              type:"time",
              format:'HH:mm:ss',
              valueFormat:'HH:mm:ss',
            },
            {
              label: "结束时间",
              prop: "endTime",
              span: 16,
              rules:[{
                required:true,
                message:"请选择结束时间",
                trigger:'change'
              }],
              type:"time",
              format:'HH:mm:ss',
              valueFormat:'HH:mm:ss',
            },
            {
              label: "类型",
              prop: "inOrOut",
              span: 24,
              type:"radio",
              dicData:[
                {value:1,label:"宿舍内"},{value:2,label:"宿舍外"}
              ]
            },
            {
              label: "是否记异常",
              prop: "isErrStatus",
              span: 24,
              type:"radio",
              dicData:[
                {value:true,label:"是"},{value:false,label:"否"}
              ]
            },
            {
              label:'时段应用范围',
              prop:'weeks',
              type:'checkbox',
              span:24,
              dicData:[
                {value:'1',label:'星期一'},{value:'2',label:'星期二'},{value:'3',label:'星期三'},{value:'4',label:'星期四'},{value:'5',label:'星期五'},{value:'6',label:'星期六'},{value:'7',label:'星期天'},{value:'8',label:'节假日'}
              ]
            },
            {
              label:'推送类型',
              prop:'pushType',
              type:'checkbox',
              span:24,
              dicData:[
                {value:'1',label:'学生'},{value:'2',label:'家长'},{value:'3',label:'教师'},{value:'4',label:'楼管'}
              ]
            },
            {
              label:"备注",
              prop:'tips',
              span:24,
              formslot:true
            }
          ]
        }
      }
    }
  }

</script>

<style lang="scss" scoped="scoped">
  p{
    margin: 0;
  }
  .dorm_panel{
    padding: 0 10px;
    height: 99%;
    .leftTop{
      height: 102px;margin-bottom: 10px;text-align: center;
      .el-col{
        height: 100%;
        &>div{
          height: 100%;background-color: #fff;
        }
      }
      .leftItem{
        display: flex;flex-direction: column;align-items: center;justify-content: center;
        position: relative;
        i{
          position: absolute;bottom: 0;right: 6px;cursor: pointer;
        }
      }
      .font20{
        font-size: 20px;
      }
    }
    .bodyClass{
      height: calc(100% - 138px);
      padding: 20px 0 20px 20px;
      background-color: #fff;
      &>div{
        display: flex;
        flex-wrap: wrap;
        &>div{
          width: 13%;
          margin-right: 1.15%;
          margin-bottom: 10px;
          border: 1px solid #e8e8e8;
          padding: 8px 0;
          cursor: pointer;
          i{
            font-size: 66px !important;
          }
          p{
            font-size: 14px;
            margin: 2px 0;
            &:first-child{
              font-size: 16px;
              font-weight: 600;
              color: #0073EB;
            }
          }
        }
      }
    }
  }
  .icon{
    width: 50px;
    height: 50px;
    fill: currentColor;
    overflow: hidden;
  }
</style>
