<template>
  <div style="height: 99%;" class="reportBody">
    <el-tabs v-model="activeName" @tab-click="tabsClick">
      <el-tab-pane label="内部人员" name="1">
        <el-row>
          <el-col class="col-real-pos" :span="arrowCfg['left']">
            <i
              :style="arrowCfgStyleCommon"
              @click="leftClick"
              v-if="arrowCfg['left'] == 4"
              :class="arrowCfgClassLeftName"></i>
            <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
              <dorm-ztree ref="dormZtreeRef" @onCheck="ztreeClick" :isCheck="true" :stype="false"></dorm-ztree>
            </div>
          </el-col>
          <el-col :span="arrowCfg['right']">
            <i
              :style="arrowCfgStyleCommon"
              @click="rightClick"
              v-if="arrowCfg['right'] == 24"
              :class="arrowCfgClassRightName"></i>
            <basic-container style="padding: 0 0 10px 6px;">
              <div style="margin-bottom: 8px;">
                <el-input
                  size="small"
                  style="width: 200px;"
                  clearable
                  @keyup.enter.native="search"
                  v-model="moreParamQuery"
                  placeholder="请输入学工号/姓名">
                </el-input>
                <el-date-picker
                  v-model="accTransTime"
                  size="small"
                  :clearable="false"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :default-time="['00:00:00','23:59:59']"
                  style="width: 330px;margin: 0 10px;"></el-date-picker>
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
                  v-if="permissionList.empExportBtn"
                  >导出</el-button>
              </div>
              <vxe-grid
                v-show="activeName == 1"
                :sync-resize="activeName"
                border
                auto-resize
                resizable
                :height="tableHeight"
                ref="empCrud"
                size="mini"
                align="center"
                :highlight="true"
                :columns="empOptions"
                :loading="loading"
                :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
                :data="empData"
                @checkbox-change="selectionChange"
                @checkbox-all="selectionChange">
                <template #devType="{row}">
                  <img
                    v-if="isDevAi(row.devType) && row.empFaceurl"
                    width="30px" height="30px"
                    :src="row.empFaceurl + '?' + new Date().getTime()"
                    @click="openPreview(row.empFaceurl + '?' + new Date().getTime())" />
                  <div v-else>{{ row.cardNum }}</div>
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
      </el-tab-pane>

      <el-tab-pane label="外来访客" name="2">
        <basic-container style="padding: 0 0 10px 0;">
          <div style="margin-bottom: 8px;">
            <el-input
              size="small"
              style="width: 200px;"
              clearable
              @keyup.enter.native="search"
              v-model="moreParamQuery"
              placeholder="请输入姓名/手机号码/身份证号">
            </el-input>
            <el-date-picker
              v-model="accTransTime"
              size="small"
              :clearable="false"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00','23:59:59']"
              style="width: 330px;margin: 0 10px;"></el-date-picker>
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
              v-if="permissionList.visitorExportBtn"
              >导出</el-button>
          </div>
          <vxe-grid
            v-show="activeName == 2"
            :sync-resize="activeName"
            border
            auto-resize
            resizable
            :height="tableHeight"
            ref="visitorCrud"
            size="mini"
            align="center"
            :highlight="true"
            :columns="visitorOptions"
            :loading="loading"
            :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
            :data="visitorData"
            @checkbox-change="selectionChange"
            @checkbox-all="selectionChange">
            <template #devType="{row}">
              <img
                v-if="isDevAi(row.devType) && row.empFaceurl"
                width="30px" height="30px"
                :src="row.empFaceurl + '?' + new Date().getTime()"
                @click="openPreview(row.empFaceurl + '?' + new Date().getTime())" />
              <div v-else>{{ row.cardNum }}</div>
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
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import moment from 'moment'
  import dormZtree from "@/components/dorm-ztree/index.vue"
  import { getInOutData } from '@/api/dorm/dorm_mng.js'
  import { isDevAi, isDevIc } from '@/util/trans.js'

  export default{
    components:{ dormZtree },
    data(){
      return{
        activeName:'1',
        ztreeHeight:0,
        tableHeight:0,
        moreParamQuery:'',
        accTransTime:[],
        loading:false,
        empData:[],
        page:{
          pageSize:30,
          currentPage:1,
          total:0
        },
        visitorData:[],
        selectionList:[],
        ancestors:""
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146-79;
      this.tableHeight=window.innerHeight-236-79-40;
      this.search()
      let monthLastDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      let monthStartDay = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.accTransTime = [monthStartDay, monthLastDay];
    },
    methods:{
      isDevAi,
      isDevIc,
      search(){
        this.page.currentPage = 1
        this.onLoad()
      },
      onLoad(){
        let params = {}
        params['startTime'] = this.accTransTime[0]
        params['endTime'] = this.accTransTime[1]
        params['moreParamQuery'] = this.moreParamQuery.trim()
        params['size'] = this.page.pageSize
        params['current'] = this.page.currentPage
        if(this.activeName == 1){
          params['personType'] = 1
          params['ancestors'] = this.ancestors
        }else{
          params['personType'] = 2
        }
        this.loading = true;
        getInOutData(params).then(r => {
          this.loading = false
          if(r.data.code == 200){
            let d = r.data.data;
            this.page.total = d.total;
            d.records.forEach(v => {
              if(v.className || v.deptName){
                v.deptName = v.empType == 1 ? v.className : v.deptName;
              }
            })
            if(this.activeName == 1){
              this.empData = d.records;
            }else{
              this.visitorData = d.records;
            }
          }
        }).catch(() => {
          this.loading = false;
        })
      },
      searchReset(){
        this.moreParamQuery = ""
        let monthLastDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        let monthStartDay = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
        this.accTransTime = [monthStartDay, monthLastDay];
        this.ancestors = ""
        this.search()
      },
      tabsClick(){
        this.page = {
          pageSize:20,
          currentPage:1,
          total:0
        }
        this.searchReset()
      },
      ztreeClick(val){
        let arr = []
        val.forEach(v => {
          let s = v.valueStr.split('-')
          if(s[0] == 'FLOOR' && s[2] == 2){
            arr.push(v.valueStr)
          }
        })
        this.ancestors = arr.join(',')
        this.search()
      },
      selectionChange({records}){
        this.selectionList = records;
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
        this.$confirm("是否导出进出记录?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let personType = this.activeName == 1 ? 1 : 2;
          let startTime = '',endTime = '';
          if(this.accTransTime.length){
            startTime = this.accTransTime[0]
            endTime = this.accTransTime[1]
          }
          window.open(
            `/api/iot-dorm/inout/list/export?${this.website.tokenHeader}=${getToken()}&current=${this.page.currentPage}&size=${this.page.pageSize}&moreParamQuery=${this.moreParamQuery.trim()}&ancestors=${this.ancestors}&startTime=${startTime}&endTime=${endTime}&personType=${personType}&ids=${this.ids}`
          );
        });
      },
      openPreview(url){
        let arr = [
          { thumbUrl:url, url:url },
        ];
        this.$ImagePreview(arr,0);
      },
    },
    computed:{
      ...mapGetters(['permission']),
      permissionList() {
        return {
          empExportBtn: this.vaildData(this.permission.dorm_emp_inout_inner_export_btn, false),
          visitorExportBtn: this.vaildData(this.permission.dorm_emp_inout_visitor_export_btn, false)
        };
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      empOptions(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title: '学工号',
            field: 'empCode',
            sortable: true,
            fixed: "left",
            minWidth: 100,
          },
          {
            title: '姓名',
            field: 'empName',
            fixed: "left",
            sortable: true,
            minWidth: 100,
          },
          {
            title: '部门/班级名称',
            field: 'deptName',
            sortable: true,
            minWidth: 100,
          },
          {
            title:"进出方向",
            field:"doorDirection",
            sortable:true,
            minWidth:100,
            formatter:({ cellValue })=>{
              return cellValue == 2 ? '出' : "进"
            },
          },
          {
            title:"识别方式",
            field:"devType",
            sortable:true,
            minWidth:100,
            slots:{default:"devType"}
          },
          {
            title:"进出时间",
            field:"swipeTime",
            sortable:true,
            minWidth:130
          },
          {
            title:"宿舍编号",
            field:"dormName",
            sortable:true,
            minWidth:100
          },
          {
            title:"设备名称",
            field:"devName",
            sortable:true,
            minWidth:100
          },
          {
            title:'门区名称',
            field:"doorName",
            sortable:true,
            minWidth:100
          },
          {
            title:"学校名称",
            field:"schoolName",
            sortable:true,
            minWidth:100
          }
        ]
      },
      visitorOptions(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title: '姓名',
            field: 'visitorName',
            fixed: "left",
            sortable: true,
            minWidth: 100,
          },
          {
            title: '手机号码',
            field: 'visitorPhone',
            sortable: true,
            minWidth: 100,
          },
          {
            title: '身份证号',
            field: 'visitorIdCardNo',
            sortable: true,
            minWidth: 130,
          },
          {
            title:"进出方向",
            field:"doorDirection",
            sortable:true,
            minWidth:100,
            formatter:({ cellValue })=>{
              return cellValue == 2 ? '出' : "进"
            },
          },
          {
            title:"识别方式",
            field:"devType",
            sortable:true,
            minWidth:100,
            slots:{default:"devType"}
          },
          {
            title:"进出时间",
            field:"swipeTime",
            sortable:true,
            minWidth:130
          },
          {
            title:"宿舍编号",
            field:"dormName",
            sortable:true,
            minWidth:100
          },
          {
            title:"设备名称",
            field:"devName",
            sortable:true,
            minWidth:100
          },
          {
            title:'门区名称',
            field:"doorName",
            sortable:true,
            minWidth:100
          }
        ]
      }
    }
  }
</script>

<style scoped="scoped" lang="scss">
  .reportBody{
    /deep/.el-tabs__header{
      background-color: #fff;
      padding: 20px;
      margin-bottom: 10px;
    }
  }
</style>
