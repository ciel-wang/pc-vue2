<template>
  <el-dialog
    title="教师/访客住宿明细"
    :visible.sync="dialogVisible"
    top="5vh"
    width="80%"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="内部人员" name="1">
        <el-row>
          <el-col class="col-real-pos" :span="arrowCfg['left']">
            <i
              :style="arrowCfgStyleCommon"
              @click="leftClick"
              v-if="arrowCfg['left'] == 4"
              :class="arrowCfgClassLeftName"></i>
            <el-card class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }" :body-style="{padding:'0'}">
              <dorm-ztree ref="dormZtreeRef" @onCheck="ztreeClick" :isCheck="true"></dorm-ztree>
            </el-card>
          </el-col>
          <el-col :span="arrowCfg['right']">
            <i
              :style="arrowCfgStyleCommon"
              @click="rightClick"
              v-if="arrowCfg['right'] == 24"
              :class="arrowCfgClassRightName"></i>
            <basic-container style="padding: 0 0 0 6px !important;width: 99%;">
              <div style="margin-bottom: 8px;">
                <el-input
                  size="small"
                  style="width: 200px;margin-right: 10px;"
                  clearable
                  @keyup.enter.native="search"
                  v-model="moreParamQuery"
                  placeholder="请输入工号/姓名">
                </el-input>
                <el-input
                  size="small"
                  style="width: 200px;margin-right: 10px;"
                  clearable
                  @keyup.enter.native="search"
                  v-model="dormName"
                  placeholder="请输入宿舍编号"></el-input>
                <el-select v-model="liveStatus" placeholder="请选择入住状态" size="small" clearable style="width: 130px;margin-right: 10px;">
                  <el-option
                    v-for="item in liveStatusDic"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <el-select v-model="orderStatus" placeholder="请选择订单状态" size="small" clearable style="width: 130px;margin-right: 10px;">
                  <el-option
                    v-for="item in orderStatusDic"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-search"
                  @click="search">
                  搜索</el-button>
                <el-button
                  type="default"
                  size="small"
                  icon="el-icon-refresh"
                  @click="searchReset">
                  重置</el-button>
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-download"
                  @click="handleExport"
                  >导出</el-button>
              </div>
              <vxe-grid
                border
                v-show="activeName == 1"
                resizable
                auto-resize
                :sync-resize="activeName"
                :height="tableHeight"
                keep-source
                ref="xGrid"
                size="mini"
                align="center"
                :highlight="true"
                :columns="empColumn"
                :loading="loading"
                :data="empData"
                :export-config="{}"
                :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
                @checkbox-change="checkboxChangeEvent"
                @checkbox-all="checkboxChangeEvent">
                <template #costStatus="{row}">
                  <el-tag type="info" size="mini" effect="dark" v-if="row.costStatus == 0">待支付</el-tag>
                  <el-tag effect="dark" size="mini" type="success" v-if="row.costStatus == 1">已完成</el-tag>
                </template>
              </vxe-grid>
              <div class="page_class">
                <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="page.currentPage"
                  :page-sizes="[20, 50, 100, 500,1000]"
                  :page-size="page.pageSize"
                  :background="true"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="page.total"
                  :hide-on-single-page="false">
                </el-pagination>
              </div>
            </basic-container>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="外来访客" name="2">
        <el-row>
          <el-col class="col-real-pos" :span="arrowCfg['left']">
            <i
              :style="arrowCfgStyleCommon"
              @click="leftClick"
              v-if="arrowCfg['left'] == 4"
              :class="arrowCfgClassLeftName"></i>
            <el-card class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }" :body-style="{padding:'0'}">
              <dorm-ztree ref="dormZtreeRef" @onCheck="ztreeClick" :isCheck="true"></dorm-ztree>
            </el-card>
          </el-col>
          <el-col :span="arrowCfg['right']">
            <i
              :style="arrowCfgStyleCommon"
              @click="rightClick"
              v-if="arrowCfg['right'] == 24"
              :class="arrowCfgClassRightName"></i>
            <basic-container style="padding: 0 0 0 6px !important;width: 99%;">
              <div style="margin-bottom: 8px;">
                <el-input
                  size="small"
                  style="width: 200px;margin-right: 10px;"
                  clearable
                  @keyup.enter.native="search"
                  v-model="moreParamQuery"
                  placeholder="请输入姓名/手机号/身份证号">
                </el-input>
                <el-input
                  size="small"
                  style="width: 200px;margin-right: 10px;"
                  clearable
                  @keyup.enter.native="search"
                  v-model="dormName"
                  placeholder="请输入宿舍编号"></el-input>
                <el-select v-model="liveStatus" placeholder="请选择入住状态" size="small" clearable style="width: 130px;margin-right: 10px;">
                  <el-option
                    v-for="item in liveStatusDic"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <el-select v-model="orderStatus" placeholder="请选择订单状态" size="small" clearable style="width: 130px;margin-right: 10px;">
                  <el-option
                    v-for="item in orderStatusDic"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-search"
                  @click="search">
                  搜索</el-button>
                <el-button
                  type="default"
                  size="small"
                  icon="el-icon-refresh"
                  @click="searchReset">
                  重置</el-button>
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-download"
                  @click="handleExport"
                  >导出</el-button>
              </div>
              <vxe-grid
                v-show="activeName == 2"
                border
                resizable
                auto-resize
                :sync-resize="activeName"
                :height="tableHeight"
                keep-source
                ref="xGrid"
                size="mini"
                align="center"
                :highlight="true"
                :columns="visitorColumn"
                :loading="loading"
                :data="visitorData"
                :export-config="{}"
                :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
                @checkbox-change="checkboxChangeEvent"
                @checkbox-all="checkboxChangeEvent">
                <template #costStatus="{row}">
                  <el-tag type="info" size="mini" effect="dark" v-if="row.costStatus == 0">待支付</el-tag>
                  <el-tag effect="dark" size="mini" type="success" v-if="row.costStatus == 1">已完成</el-tag>
                </template>
              </vxe-grid>
              <div class="page_class">
                <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="page.currentPage"
                  :page-sizes="[20, 50, 100, 500,1000]"
                  :page-size="page.pageSize"
                  :background="true"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="page.total"
                  :hide-on-single-page="false">
                </el-pagination>
              </div>
            </basic-container>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import dormZtree from "@/components/dorm-ztree/index.vue"
  import { getDormLiveData } from '@/api/dorm/dorm_checkin.js'
  import { getApartmentLive } from '@/api/dorm/apartment_manage.js'

  export default{
    components:{ dormZtree },
    data(){
      return{
        ztreeHeight:0,
        tableHeight:0,
        dormName:'',
        moreParamQuery:"",
        ancestors:"",
        page:{
          pageSize: 20,
          currentPage: 1,
          total: 0
        },
        loading:false,
        empData:[],
        visitorData:[],
        dialogVisible:false,
        liveStatusDic:[
          {value:1,label:"住宿"},{value:2,label:"退宿"},{value:3,label:"预定"}
        ],
        liveStatus:"",
        activeName:'1',
        orderStatusDic:[
          {value:false,label:"待支付"},{value:true,label:"已完成"}
        ],
        orderStatus:"",
        selectionList:[]
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-284;
      this.tableHeight=window.innerHeight-360-52;
    },
    methods:{
      openDialog(val){
        this.dialogVisible = true;
        this.search()
        this.activeName = '1'
      },
      handleClick(){
        this.page.total = 0
        this.page.currentPage = 1
        this.page.pageSize = 20
        this.searchReset()
      },
      search(){
        this.page.currentPage = 1;
        this.onLoad()
      },
      onLoad(){
        let params = {}
        params["size"] = this.page.pageSize
        params['current'] = this.page.currentPage
        params['dormName'] = this.dormName.trim()
        params['moreParamQuery'] = this.moreParamQuery.trim()
        params['ancestors'] = this.ancestors;
        params['liveStatus'] = this.liveStatus;
        params['costStatus'] = this.orderStatus;
        this.loading = true;
        if(this.activeName == 1){
          params['liveEmpType'] = 2
          getDormLiveData(params).then(r => {
            this.loading = false
            let d = r.data.data
            this.page.total = d.total
            d.records.forEach(v => {
              v.percent = v.betweenDays ? (v.costMoney * v.betweenDays - v.realCostMoney).toFixed(2) : ''
            })
            this.empData = d.records;
          }).catch(() => {
            this.loading = false
          })
        }else{
          params['liveEmpType'] = 3
          getApartmentLive(params).then(r => {
            this.loading = false
            let d = r.data.data
            this.page.total = d.total
            d.records.forEach(v => {
              v.percent = v.betweenDays ? (v.costMoney * v.betweenDays - v.realCostMoney).toFixed(2) : ''
            })
            this.visitorData = d.records;
          }).catch(() => {
            this.loading = false
          })
        }
      },
      searchReset(){
        this.dormName = ""
        this.moreParamQuery = ""
        this.ancestors = ""
        this.orderStatus = ""
        this.liveStatus = ""
        this.selectionList = []
        this.search()
        this.$refs.dormZtreeRef.getDormZtreeInit();
      },
      ztreeClick(val){
        let arr = []
        val.forEach(v => {
          arr.push(v.valueStr)
        })
        this.ancestors = arr.join(',')
        this.search()
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
      checkboxChangeEvent({records}){
        this.selectionList = records
      },
      handleExport(){
        this.$confirm("是否导出住宿明细?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          if(this.activeName == 1){
            window.open(
              `/api/iot-dorm/live/dorm/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&dormName=${this.dormName.trim()}&ancestors=${this.ancestors}&moreParamQuery=${this.moreParamQuery.trim()}&liveEmpType=2`
            );
          }else{
            window.open(
              `/api/iot-dorm/live/apartment/visitor/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids1}&current=${this.page.currentPage}&size=${this.page.pageSize}&dormName=${this.dormName.trim()}&ancestors=${this.ancestors}&moreParamQuery=${this.moreParamQuery.trim()}&liveEmpType=3`
            );
          }
        });
      },
    },
    computed:{
      ids(){
        let arr = []
        this.selectionList.forEach(v => {
          arr.push(v.id)
        })
        return arr.join(',')
      },
      ids1(){
        let arr = []
        this.selectionList.forEach(v => {
          arr.push(v.liveId)
        })
        return arr.join(',')
      },
      empColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:"宿舍编号",
            field:"dormName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:'工号',
            field:"empCode",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"姓名",
            field:"empName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"部门名称",
            field:"deptName",
            sortable:true,
            minWidth:100,
          },
          {
            title:"性别",
            field:"empSex",
            sortable:true,
            minWidth:70,
            formatter:({ cellValue })=>{
              return cellValue == 1 ? '男' : "女"
            },
          },
          {
            title:"订单状态",
            field:"costStatus",
            sortable:true,
            minWidth:100,
            slots:{default:"costStatus"}
          },
          {
            title:"单价",
            field:"costMoney",
            sortable:true,
            minWidth:100
          },
          {
            title:"入住天数",
            field:"betweenDays",
            sortable:true,
            minWidth:100
          },
          {
            title:"入住折扣",
            field:"percent",
            sortable:true,
            minWidth:100
          },
          {
            title:"总费用",
            field:"realCostMoney",
            sortable:true,
            minWidth:100
          },
          {
            title:"入住日期",
            field:"entryTime",
            sortable:true,
            minWidth:130
          },
          {
            title:"退宿日期",
            field:"leaveTime",
            sortable:true,
            minWidth:130
          },
          {
            title:"床号",
            field:"badNum",
            sortable:true,
            minWidth:70
          },
          {
            title:"柜号",
            field:"cabinetNum",
            sortable:true,
            minWidth:70
          },
          {
            title:"学校名称",
            field:"schoolName",
            sortable:true,
            minWidth:100,
          },
          {
            title:"楼栋名称",
            field:"floorName",
            sortable:true,
            minWidth:100,
          },
          {
            title:"楼层名称",
            field:"floorLayerName",
            sortable:true,
            minWidth:100,
          },
        ]
      },
      visitorColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:"宿舍编号",
            field:"dormName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"姓名",
            field:"visitorName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"手机号码",
            field:"visitorPhone",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"身份证号",
            field:"visitorIdCardNo",
            sortable:true,
            minWidth:100
          },
          {
            title:"性别",
            field:"visitorSex",
            sortable:true,
            minWidth:70,
            formatter:({ cellValue })=>{
              return cellValue == 1 ? '男' : "女"
            },
          },
          {
            title:"订单状态",
            field:"costStatus",
            sortable:true,
            minWidth:100,
            slots:{default:"costStatus"}
          },
          {
            title:"单价",
            field:"costMoney",
            sortable:true,
            minWidth:100
          },
          {
            title:"入住天数",
            field:"betweenDays",
            sortable:true,
            minWidth:100
          },
          {
            title:"入住折扣",
            field:"percent",
            sortable:true,
            minWidth:100
          },
          {
            title:"总费用",
            field:"realCostMoney",
            sortable:true,
            minWidth:100
          },
          {
            title:"入住日期",
            field:"entryTime",
            sortable:true,
            minWidth:130
          },
          {
            title:"退宿日期",
            field:"leaveTime",
            sortable:true,
            minWidth:130
          },
          {
            title:"床号",
            field:"badNum",
            sortable:true,
            minWidth:70
          },
          {
            title:"柜号",
            field:"cabinetNum",
            sortable:true,
            minWidth:70
          },
          {
            title:"学校名称",
            field:"schoolName",
            sortable:true,
            minWidth:100,
          },
          {
            title:"楼栋名称",
            field:"floorName",
            sortable:true,
            minWidth:100,
          },
          {
            title:"楼层名称",
            field:"floorLayerName",
            sortable:true,
            minWidth:100,
          },
        ]
      },
    }
  }
</script>

<style scoped="scoped">
  >>>.el-dialog__body{
    padding: 0 20px 20px;
  }
</style>
