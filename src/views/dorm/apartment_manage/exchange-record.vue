<template>
  <el-dialog
    title="教师/访客调换记录"
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
            <el-card class="ztreeStyle" :style="{ height: ztreeHeight - 52 + 'px' }" :body-style="{padding:'0'}">
              <dept-ztree ref="ZtreeRef" @onCheck="ztreeClick" :isCheck="true"></dept-ztree>
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
                resizable
                auto-resize
                :height="tableHeight - 52"
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
        <div style="margin-bottom: 8px;">
          <el-input
            size="small"
            style="width: 200px;margin-right: 10px;"
            clearable
            @keyup.enter.native="search"
            v-model="moreParamQuery"
            placeholder="请输入姓名/身份证号/电话号码">
          </el-input>
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
          resizable
          auto-resize
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
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import { getDormLiveData, exchangeRecordDorm } from '@/api/dorm/dorm_checkin.js'
  import { getApartmentExchange } from '@/api/dorm/apartment_manage.js'
  import deptZtree from '@/components/dept-ztree/index.vue'

  export default{
    components:{ deptZtree },
    data(){
      return{
        ztreeHeight:0,
        tableHeight:0,
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
        selectionList:[],
        activeName:'1'
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-232;
      this.tableHeight=window.innerHeight-360;
    },
    methods:{
      openDialog(val){
        this.dialogVisible = true;
        this.search()
      },
      handleClick(){
        this.page.total = 0
        this.page.currentPage = 1
        this.page.pageSize = 20
        this.moreParamQuery = ""
        this.search()
      },
      search(){
        this.page.currentPage = 1;
        this.onLoad()
      },
      onLoad(){
        let params = {}
        params["size"] = this.page.pageSize
        params['current'] = this.page.currentPage
        params['moreParamQuery'] = this.moreParamQuery.trim()
        params['ancestors'] = this.ancestors;
        this.loading = true;
        if(this.activeName == 1){
          params['liveEmpType'] = 2
          exchangeRecordDorm(params).then(r => {
            this.loading = false
            let d = r.data.data
            this.page.total = d.total
            this.empData = d.records;
          }).catch(() => {
            this.loading = false
          })
        }else{
          params['liveEmpType'] = 3
          getApartmentExchange(params).then(r => {
            this.loading = false
            let d = r.data.data
            this.page.total = d.total
            this.visitorData = d.records;
          }).catch(() => {
            this.loading = false
          })
        }
      },
      searchReset(){
        this.moreParamQuery = ""
        this.ancestors = ""
        this.search()
        if(this.activeName == 1){
          this.$refs.ZtreeRef.getDeptZtreeInit();
        }
      },
      ztreeClick(val){
        let arr = []
        val.forEach(v => {
          arr.push(v.valueStr)
        })
        this.ancestors = arr.join(',')
        this.search()
      },
      checkboxChangeEvent({records}){
        this.selectionList = records
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
      handleExport(){
        let title = ""
        if(this.activeName == 1){
          title = "是否导出内部人员调换明细？"
        }else{
          title = "是否导出外来访客调换明细？"
        }
        this.$confirm(title, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          if(this.activeName == 1){
             // /log/apartment/exchange/list/export
            window.open(
              `/api/iot-dorm/log/exchange/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&ancestors=${this.ancestors}&moreParamQuery=${this.moreParamQuery.trim()}&liveEmpType=2`
            );
          }else{
            window.open(
              `/api/iot-dorm/log/apartment/exchange/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&moreParamQuery=${this.moreParamQuery.trim()}&liveEmpType=3`
            );
          }
        });
      }
    },
    computed:{
      ids(){
        let arr = []
        this.selectionList.forEach(v => {
          arr.push(v.id)
        })
        let ids = arr.join(',')
        return ids;
      },
      empColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
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
            title:"调换日期",
            field:"createTime",
            sortable:true,
            minWidth:130
          },
          {
            title:"调换前",
            children:[
              {
                title:"学校名称",
                field:"beforeSchoolName",
                minWidth:100,
                sortable:true,
              },
              {
                title:"楼栋名称",
                field:"beforeFloorName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"楼层名称",
                field:"beforeFloorLayerName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"宿舍编号",
                field:"beforeDormName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"床号",
                field:"beforeBadNum",
                sortable:true,
                minWidth:70
              },
              {
                title:"柜号",
                field:"beforeCabinetNum",
                sortable:true,
                minWidth:70
              },
            ]
          },
          {
            title:"调换后",
            children:[
              {
                title:"学校名称",
                field:"afterSchoolName",
                minWidth:100,
                sortable:true,
              },
              {
                title:"楼栋名称",
                field:"afterFloorName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"楼层名称",
                field:"afterFloorLayerName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"宿舍编号",
                field:"afterDormName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"床号",
                field:"afterBadNum",
                sortable:true,
                minWidth:70
              },
              {
                title:"柜号",
                field:"afterCabinetNum",
                sortable:true,
                minWidth:70
              },
            ]
          }
        ]
      },
      visitorColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
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
            minWidth:100,
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
            title:"调换日期",
            field:"createTime",
            sortable:true,
            minWidth:130
          },
          {
            title:"调换前",
            children:[
              {
                title:"学校名称",
                field:"beforeSchoolName",
                minWidth:100,
                sortable:true,
              },
              {
                title:"楼栋名称",
                field:"beforeFloorName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"楼层名称",
                field:"beforeFloorLayerName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"宿舍编号",
                field:"beforeDormName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"床号",
                field:"beforeBadNum",
                sortable:true,
                minWidth:70
              },
              {
                title:"柜号",
                field:"beforeCabinetNum",
                sortable:true,
                minWidth:70
              },
            ]
          },
          {
            title:"调换后",
            children:[
              {
                title:"学校名称",
                field:"afterSchoolName",
                minWidth:100,
                sortable:true,
              },
              {
                title:"楼栋名称",
                field:"afterFloorName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"楼层名称",
                field:"afterFloorLayerName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"宿舍编号",
                field:"afterDormName",
                sortable:true,
                minWidth:100,
              },
              {
                title:"床号",
                field:"afterBadNum",
                sortable:true,
                minWidth:70
              },
              {
                title:"柜号",
                field:"afterCabinetNum",
                sortable:true,
                minWidth:70
              },
            ]
          }
        ]
      }
    }
  }
</script>

<style scoped="scoped">
  >>>.el-dialog__body{
    padding: 0 20px 20px;
  }
</style>
