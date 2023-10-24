<template>
  <el-dialog
    title="事件查询"
    :visible.sync="dialogVisible"
    top="5vh"
    width="80%"
    modal-append-to-body
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleClose">
    <div class="mbottom8">
      <el-input
        size="small" clearable
        v-model.trim="moreParamQuery"
        placeholder="请填写访客姓名"
        style="width: 160px;"
      ></el-input>
      <el-input
        size="small" clearable
        v-model.trim="devName"
        placeholder="请填写设备编号/名称"
        style="width: 160px;margin-left: 10px;"
      ></el-input>
      <el-select
        size="small" clearable
        v-model="devExecuteState"
        placeholder="请选择设备执行状态"
        style="width: 150px;margin: 0 10px;">
        <el-option
          v-for="item in devExecuteStateArr" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-search"
        @click="searchR">搜索
      </el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      :height="tableHeight"
      keep-source
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="option"
      :loading="loading"
      :data="eventData"
      :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }">
      <template #devExecuteState="{row}">
        <el-tag effect="dark" size="mini" type="danger" v-if="row.devExecuteState == 0">未执行</el-tag>
        <el-tag effect="dark" size="mini" v-if="row.devExecuteState == 1">执行中</el-tag>
        <el-tag effect="dark" size="mini" type="info" v-if="row.devExecuteState == 2">已失败</el-tag>
        <el-tag effect="dark" size="mini" type="success" v-if="row.devExecuteState == 3">已成功</el-tag>
      </template>
    </vxe-grid>
    <div style="min-height: 52px;text-align: right;padding-top: 25px;">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[30,50,100,500,1000,3000]"
        :page-size="page.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :hide-on-single-page="false"
      ></el-pagination>
    </div>
  </el-dialog>
</template>

<script>
  import {eventList} from "@/api/visitor/record.js"
  export default{
    data(){
      return{
        dialogVisible:false,
        eventData:[],
        loading:false,
        moreParamQuery:"",
        devName:"",
        page: {
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        devExecuteState:0,
        devExecuteStateArr:[
          {value:0,label:"未执行"},
          {value:1,label:"执行中"},
          {value:2,label:"已失败"},
          {value:3,label:"已成功"},
        ]
      }
    },
    mounted() {
      this.onLoad();
    },
    methods:{
      opendialog(){
        this.dialogVisible = true;
      },
      searchR(){
        this.page.currentPage = 1
        this.onLoad();
      },
      searchReset(){
        this.devExecuteState = 0;
        this.moreParamQuery = "";
        this.devName = "";
        this.searchR()
      },
      onLoad(){
        let params = {};
        params["moreParamQuery"] = this.moreParamQuery;
        params['devName'] = this.devName;
        params['devExecuteState'] = this.devExecuteState;
        this.loading = true;
        eventList(
          this.page.currentPage,
          this.page.pageSize,
          Object.assign(params, this.query)
        ).then(res => {
          let data = res.data.data;
          this.page.total = data.total;
          let records = data.records;
          records.forEach(v => {
            if(v.eventType == 'CARD_AUTH_CREATE' || v.eventType == 'FACE_AUTH_CREATE'){
              v.eventType = "增加权限"
            }
            if(v.eventType == 'FACE_AUTH_DELETE' || v.eventType == 'CARD_AUTH_DELETE'){
              v.eventType = "删除权限"
            }
          });
          this.eventData = records;
          this.loading = false;
        })
      },
      handleClose(done){
        this.dialogVisible = false;
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
      tableHeight(){
        return window.innerHeight-350
      },
      option(){
        return[
          { type: 'seq', title: '序号', width: 70, fixed: 'left' },
          {
              title:"访客姓名",
              field:"visitorName",
              minWidth: 80,
              fixed: 'left'
          },{
              title:"访客手机号",
              field:"visitorPhone",
              minWidth: 100,
              fixed: 'left'
          },{
              title:"设备编号",
              field:'devCode',
              minWidth: 80,
          },{
              title:"设备名称",
              field:"devName",
              minWidth: 100,
          },{
              title:"事件类型",
              field:"eventType",
              minWidth: 100,
          },{
              title:"创建时间",
              field:"createTime",
              minWidth: 140,
          },{
              title:"执行时间",
              field:"executeTime",
              minWidth: 140,
          },{
              title:'执行状态',
              field:"devExecuteState",
              minWidth: 100,
              slots:{default:'devExecuteState'}
          },{
              title:"执行结果",
              field:"devExecuteRes",
              minWidth: 140,
          },
          // {
          //     title:"有效期",
          //     field:"vaildDate",
          //     minWidth: 140,
          // }
        ]
      }
    }
  }
</script>
