<template>
  <el-dialog
    title="学生住宿明细"
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
          <dorm-ztree ref="dormZtreeRef" @onCheck="ztreeClick" :isCheck="true" :showStudentDorm="true"></dorm-ztree>
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
            <el-input
              size="small"
              style="width: 200px;margin-right: 10px;"
              clearable
              @keyup.enter.native="search"
              v-model="dormName"
              placeholder="请输入宿舍编号"></el-input>
            <el-select v-model="liveStatus" placeholder="请选择住宿状态" size="small" clearable style="width: 130px;margin-right: 10px;">
              <el-option
                v-for="item in liveStatusDic"
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
            resizable
            auto-resize
            :height="tableHeight"
            keep-source
            ref="xGrid"
            size="mini"
            align="center"
            show-overflow
            :highlight="true"
            :columns="tableColumn"
            :loading="loading"
            :data="tableData"
            :export-config="{}"
            :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
            @checkbox-change="checkboxChangeEvent"
            @checkbox-all="checkboxChangeEvent">
            <template #isAdmin="{row}">
              <i class="icon-xuanzhong" v-if="row.isAdmin == 1" :style="{ color: colorName }"></i>
              <i class="icon-weixuanzhong" v-else></i>
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
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import dormZtree from "@/components/dorm-ztree/index.vue"
  import { getDormLiveData } from '@/api/dorm/dorm_checkin.js'

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
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        loading:false,
        tableData:[],
        dialogVisible:false,
        liveStatusDic:[
          {value:1,label:"住宿"},{value:2,label:"退宿"}
        ],
        liveStatus:"",
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
        params['liveEmpType'] = 1
        this.loading = true;
        getDormLiveData(params).then(r => {
          this.loading = false
          let d = r.data.data
          this.page.total = d.total
          this.tableData = d.records;
        }).catch(() => {
          this.loading = false
        })
      },
      searchReset(){
        this.dormName = ""
        this.moreParamQuery = ""
        this.ancestors = ""
        this.liveStatus = ""
        this.search()
        this.$refs.dormZtreeRef.getDormZtreeInit();
      },
      ztreeClick(val){
        let arr = []
        val.forEach(v => {
          let arr1 = v.valueStr.split('-')
          if(arr1[0] == 'FLOOR' && arr1[2] == 2){
            arr.push(v.valueStr)
          }
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
          window.open(
            `/api/iot-dorm/live/dorm/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&dormName=${this.dormName.trim()}&ancestors=${this.ancestors}&moreParamQuery=${this.moreParamQuery.trim()}&liveStatus=${this.liveStatus}&liveEmpType=1`
          );
        });
      }
    },
    computed:{
      ...mapGetters(['colorName']),
      ids(){
        let ids = []
        this.selectionList.forEach(v => {
          ids.push(v.id)
        })
        return ids.join(',')
      },
      tableColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:"学校名称",
            field:"schoolName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"楼栋名称",
            field:"floorName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"楼层名称",
            field:"floorLayerName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"宿舍编号",
            field:"dormName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:'学号',
            field:"empCode",
            sortable:true,
            minWidth:100,
          },
          {
            title:"姓名",
            field:"empName",
            sortable:true,
            minWidth:100
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
            title:"舍长",
            field:"isAdmin",
            sortable:true,
            minWidth:70,
            slots:{default:"isAdmin"}
          },
        ]
      }
    }
  }
</script>
