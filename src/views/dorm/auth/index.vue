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
              <account-ztree ref="accountZtreeRef" @onCheck="accountztreeClick" :isCheck="true"></account-ztree>
            </div>
          </el-col>
          <el-col :span="arrowCfg['right']">
            <i
              :style="arrowCfgStyleCommon"
              @click="rightClick"
              v-if="arrowCfg['right'] == 24"
              :class="arrowCfgClassRightName"></i>
            <basic-container style="padding: 0 0 10px 6px;">
              <div>
                <el-input
                  size="small" clearable
                  @keyup.enter.native="search"
                   style="width: 200px;margin-right: 10px;"
                  v-model="moreParamQuery"
                  placeholder="请输入学工号/姓名"></el-input>
                <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
                <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
              </div>
              <vxe-grid
                border
                resizable
                auto-resize
                :height="tableHeight"
                ref="xGrid"
                size="mini"
                align="center"
                :highlight="true"
                :columns="empOption"
                :loading="loading"
                :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
                :data="empData"
                :export-config="{}"
                :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
                @checkbox-change="checkboxChangeEvent"
                @checkbox-all="checkboxChangeEvent">
                <template #toolbar_buttons>
                  <el-button type="primary"
                             size="small"
                             icon="el-icon-download"
                             @click="handleExport"
                             v-if="permissionList.empExportBtn">导出
                  </el-button>
                </template>
                <template #doorAuth="{row}">
                  <el-tag
                    effect="plain"
                    size="mini"
                    type="primary"
                    class="tag_class"
                    v-if="row.door1 == 1 ">
                    {{row.door1Name}}</el-tag>
                  <el-tag
                    effect="plain"
                    size="mini"
                    type="primary"
                    class="tag_class"
                    v-if="row.door2 == 1"
                    style="margin: 0 3px">{{row.door2Name}}</el-tag>
                  <el-tag
                    effect="plain"
                    size="mini"
                    type="primary"
                    class="tag_class"
                    v-if="row.door3 == 1">{{row.door3Name}}</el-tag>
                  <el-tag
                    effect="plain"
                    size="mini"
                    type="primary"
                    class="tag_class"
                    v-if="row.door4 == 1"
                    style="margin: 0 3px">{{row.door4Name}}</el-tag>
                  <el-tag
                    effect="plain"
                    size="mini"
                    type="primary"
                    class="tag_class"
                    v-if="isDevAi(row.devType)"
                    style="margin-left:3px">{{row.door0Name}}</el-tag>
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
        <basic-container style="padding: 0 0 10px 0;">
          <div>
            <el-input
              size="small" clearable
              @keyup.enter.native="search"
              style="width: 200px;margin-right: 10px;"
              v-model="moreParamQuery"
              placeholder="请输入姓名/手机号码/身份证"></el-input>
            <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
            <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
          </div>
          <vxe-grid
            border
            resizable
            auto-resize
            :height="tableHeight"
            ref="xGrid"
            size="mini"
            align="center"
            :highlight="true"
            :columns="visitorOption"
            :loading="loading"
            :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
            :data="visitorData"
            :export-config="{}"
            :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
            @checkbox-change="checkboxChangeEvent"
            @checkbox-all="checkboxChangeEvent">
            <template #toolbar_buttons>
              <el-button type="primary"
                         size="small"
                         icon="el-icon-download"
                         @click="handleExport"
                         v-if="permissionList.visitorExportBtn">导出
              </el-button>
            </template>
            <template #doorAuth="{row}">
              <el-tag effect="plain" size="mini" type="primary" v-if="row.door1 == 1 ">{{row.door1Name}}</el-tag>
              <el-tag effect="plain" size="mini" type="primary" v-if="row.door2 == 1" style="margin: 0 3px">{{row.door2Name}}</el-tag>
              <el-tag effect="plain" size="mini" type="primary" v-if="row.door3 == 1">{{row.door3Name}}</el-tag>
              <el-tag effect="plain" size="mini" type="primary" v-if="row.door4 == 1" style="margin: 0 3px">{{row.door4Name}}</el-tag>
              <el-tag effect="plain" size="mini" type="primary" v-if="isDevAi(row.devType)" style="margin-left:3px">{{row.door0Name}}</el-tag>
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
  import {mapGetters} from "vuex";
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  import {eventStateTrans} from "@/util/trans";
  import {getAiList} from "@/api/iot/access/select";
  import accountZtree from "@/components/account-ztree/index.vue"
  import { getFloorDevDic } from "@/api/dorm/floor.js"
  import { getDormAuth, getVisitorDormAuth } from "@/api/dorm/maintain.js"
  import { isDevAi } from '@/util/trans.js'

  export default{
    components:{accountZtree},
    data(){
      return{
        moreParamQuery:"",
        tableHeight:0,
        loading:false,
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        empData:[],
        selectionList:[],
        floodDevDic:[],
        // doorIds:[],
        ancestors:"",
        visitorData:[],
        activeName:'1'
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146-79;
      this.tableHeight=window.innerHeight-264-79;
      this.search()
      getFloorDevDic().then(r => {
        this.floodDevDic = r.data.data
      })
    },
    methods:{
      isDevAi,
      tabsClick(){
        this.page = {
          pageSize:20,
          currentPage:1,
          total:0
        }
        this.searchReset()
      },
      handleExport() {
        this.$confirm("是否导出权限数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let ids = "";
          if(this.selectionList.length > 0) {
            this.selectionList.forEach((v)=>{
              ids = ids + "," + v.id
            })
          }
          ids = ids.substring(1,ids.length)
          if(this.activeName == 1){
            window.open(`/api/iot-dorm/auth/mjlist/export?${this.website.tokenHeader}=${getToken()}&moreParamQuery=${this.moreParamQuery.trim()}&ids=${ids}&ancestors=${this.ancestors}&size=${this.page.pageSize}&current=${this.page.currentPage}`);
          }else{
            window.open(`/api/iot-dorm/auth/visitor/mjlist/export?${this.website.tokenHeader}=${getToken()}&moreParamQuery=${this.moreParamQuery.trim()}&ids=${ids}&size=${this.page.pageSize}&current=${this.page.currentPage}`);
          }
        });
      },
      search(){
        this.page.currentPage = 1;
        this.onLoad()
      },
      onLoad(){
        this.loading = true;
        let params = {}
        params['size'] = this.page.pageSize
        params['current'] = this.page.currentPage
        if(this.moreParamQuery){
        	params["moreParamQuery"] = this.moreParamQuery.trim();
        }
        if(this.activeName == 1){
          params['ancestors'] = this.ancestors;
          getDormAuth(params).then(res=>{
            const data = res.data.data;
            this.page.total = data.total;
            data.records.forEach(e=>{
              if(e.empType == 1){
                e.deptName = e.className
              }
            })
            this.empData = data.records;
            this.$forceUpdate()
            this.loading = false;
          })
        }else{
          getVisitorDormAuth(params).then(res=>{
            const data = res.data.data;
            this.page.total = data.total;
            this.visitorData = data.records;
            this.$forceUpdate()
            this.loading = false;
          })
        }
      },
      accountztreeClick(treeNode){
        let arr = []
        treeNode.forEach(v => {
          let val = v.valueStr.split('-')
          if(val[0] == 'DEPT' || (val[0] == 'GS' && val[1] == 1)){
            arr.push(v.valueStr)
          }
        })
        this.ancestors = arr.join(',');
        this.search()
      },
      searchReset(){
        this.moreParamQuery = ""
        this.ancestors = ""
        this.selectionList = []
        this.search()
        if(this.activeName == 1){
          this.$refs.accountZtreeRef.getAccountZtreeInit();
        }
      },
      checkboxChangeEvent({records}){
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
    },
    computed:{
      ...mapGetters(["userInfo", "permission"]),
      permissionList() {
        return {
          empExportBtn: this.vaildData(this.permission.dorm_emp_auth_inner_export_btn, false),
          visitorExportBtn: this.vaildData(this.permission.dorm_emp_auth_visitor_export_btn, false)
        };
      },
      empOption(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title: "学工号",
            field: "empCode",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title: "姓名",
            field: "empName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title: "设备编号",
            field: "devCode",
            sortable:true,
            minWidth:100,
          },
          {
            title: "设备名称",
            field: "devName",
            minWidth:100,
            sortable:true,
          },
          {
            title:"门区权限",
            field:"doorAuth",
            sortable:true,
            minWidth:100,
            slots:{default:"doorAuth"}
          },
          {
            title: "有效期",
            field: "effectiveDate",
            sortable:true,
            minWidth:120,
          },
          {
            title: "部门/班级名称",
            field: "deptName",
            sortable:true,
            minWidth:100,
          },
          {
            title: "学校名称",
            field: "schoolName",
            sortable:true,
            minWidth:100,
          },
        ]
      },
      visitorOption(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title: "姓名",
            field: "visitorName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title: "手机号码",
            field: "visitorPhone",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title: "身份证号",
            field: "visitorIdCardNo",
            sortable:true,
            minWidth:100,
          },
          {
            title: "设备编号",
            field: "devCode",
            sortable:true,
            minWidth:100,
          },
          {
            title: "设备名称",
            field: "devName",
            minWidth:100,
            sortable:true,
          },
          {
            title:"门区权限",
            field:"doorAuth",
            sortable:true,
            minWidth:100,
            slots:{default:"doorAuth"}
          },
          {
            title: "有效期",
            field: "effectiveDate",
            sortable:true,
            minWidth:120,
          },
          {
            title: "学校名称",
            field: "schoolName",
            sortable:true,
            minWidth:100,
          },
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
  .tag_class{
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
