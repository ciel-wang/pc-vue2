<template>
  <el-dialog
    title="学生调换记录"
    :visible.sync="dialogVisible"
    top="5vh"
    width="80%"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-row>
      <el-col class="col-real-pos" :span="arrowCfg['left']">
        <i
          :style="arrowCfgStyleCommon"
          @click="leftClick"
          v-if="arrowCfg['left'] == 4"
          :class="arrowCfgClassLeftName"></i>
        <el-card class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }" :body-style="{padding:'0'}">
          <gradeclass-ztree  @onCheck="ztreeClick" ref="ztree" :isCheck="true"></gradeclass-ztree>
        </el-card>
      </el-col>
      <el-col :span="arrowCfg['right']">
        <i
          :style="arrowCfgStyleCommon"
          @click="rightClick"
          v-if="arrowCfg['right'] == 24"
          :class="arrowCfgClassRightName"></i>
        <basic-container style="padding: 0 0 0 6px !important;">
          <div style="margin-bottom: 8px;">
            <el-input
              size="small"
              style="width: 200px;margin-right: 10px;"
              clearable
              @keyup.enter.native="search"
              v-model="moreParamQuery"
              placeholder="请输入学号/姓名">
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
            :columns="tableColumn"
            :loading="loading"
            :data="tableData"
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
              :page-sizes="[30, 50, 100, 500,1000,3000]"
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
  </el-dialog>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import { getDormLiveData, exchangeRecordDorm } from '@/api/dorm/dorm_checkin.js'
  import gradeclassZtree from '@/components/gradeclass-ztree/index.vue'

  export default{
    components:{ gradeclassZtree },
    data(){
      return{
        ztreeHeight:0,
        tableHeight:0,
        moreParamQuery:"",
        ancestors:"",
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        loading:false,
        tableData:[],
        dialogVisible:false,
        selectionList:[]
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-232;
      this.tableHeight=window.innerHeight-360;
    },
    methods:{
      openDialog(val){
        this.dialogVisible = true;
      },
      search(){
        this.page.currentPage = 1
        this.selectionList = []
        this.onLoad()
      },
      onLoad(){
        let params = {}
        params["size"] = this.page.pageSize
        params['current'] = this.page.currentPage
        params['moreParamQuery'] = this.moreParamQuery.trim()
        params['ancestors'] = this.ancestors;
        params['liveEmpType'] = 1
        this.loading = true;
        exchangeRecordDorm(params).then(r => {
          this.loading = false
          let d = r.data.data
          this.page.total = d.total
          this.tableData = d.records;
        }).catch(() => {
          this.loading = false
        })
      },
      searchReset(){
        this.moreParamQuery = ""
        this.ancestors = ""
        this.search()
        this.$refs.ztree.getGradeclassZtreeInit();
      },
      ztreeClick(val){
        let arr = []
        val.forEach(v => {
          if(v.valueStr.startsWith('GS-1')){
            arr.push(v.valueStr)
          }
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
        this.$confirm("是否导出调换明细?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-dorm/log/exchange/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&ancestors=${this.ancestors}&moreParamQuery=${this.moreParamQuery.trim()}&liveEmpType=1`
          );
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
      tableColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:'学号',
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
            title:"年/班级",
            field:"className",
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
      }
    }
  }
</script>

