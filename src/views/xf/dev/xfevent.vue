
<template>
  <el-dialog
    title="事件查询"
    :visible.sync="dialogVisible"
    width="1200px"
    :modal-append-to-body="true"
    :append-to-body="true"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    top="1vh"
    :before-close="handleClose">
    <div style="margin-bottom: 8px;">
      <el-input
        size="small" clearable
        @keyup.enter.native="search"
        v-model="moreQueryParam"
        placeholder="请填写学工号/姓名"
        style="width: 160px;"></el-input>
      <el-input
        style="width: 180px;margin: 0 10px;"
        size="small" clearable
        @keyup.enter.native="search"
        v-model="devQuery"
        placeholder="请填写设备编号/名称"></el-input>
      <el-select v-model="executeState" size="small" clearable placeholder="执行状态" style="width: 160px;margin-right: 10px;">
        <el-option
          v-for="item in executeStates"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="primary" size="small" @click="repeatExecute">重新执行</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      height="600"
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="data"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #faceUrl="{row}">
        <img
          width="30px" height="30px"
          v-if="row.faceUrl.length>30"
          :src="row.faceUrl+'?time='+ new Date().getTime()"
          @click="openPreview(row.faceUrl+'?time='+ new Date().getTime())">
      </template>
      <template #downCon="{row}">
        <el-tag type="dark" size="mini" effect="dark"> {{ row.downCon }} </el-tag>
      </template>
      <template #executeState="{row}">
        <el-tag
          size="mini"
          type="danger"
          effect="dark"
          v-if="row.executeState == 0 && new Date().getTime() -new Date(row.createTime).getTime() >60 * 60 * 1000">未执行</el-tag>
        <el-tag
          size="mini"
          type="info"
          effect="dark"
          v-if="row.executeState == 0 && new Date().getTime() -new Date(row.createTime).getTime() <60 * 60 * 1000"
          >未执行</el-tag>
        <el-tag size="mini" type="danger" effect="dark" v-if="row.executeState == 1" >执行中</el-tag>
        <el-tag size="mini" type="danger" effect="dark" v-if="row.executeState == 2">失败</el-tag>
        <el-tag size="mini" type="" effect="dark" v-if="row.executeState == 3">成功</el-tag>
      </template>
    </vxe-grid>
    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[50, 100, 500, 1000, 3000]"
        :page-size="page.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :hide-on-single-page="false">
      </el-pagination>
    </div>
  </el-dialog>

</template>

<script>
  import {mapGetters} from "vuex";
  import {getSelectList,eventRepeatExecute} from '@/api/xf/event'
  import website from '@/config/website';
  import {getToken} from '@/util/auth';

  export default {
    data() {
      return {
        selectionList:[],
        executeState:0,
        executeStates:[
          {"label":"未执行",value:0},
          {"label":"执行中",value:1},
          {"label":"失败",value:2},
          {"label":"成功",value:3}
        ],
        executeRes:'',
        executeRess:[
          {"label":"失败",value:"2"},
          {"label":"成功",value:"1"}
        ],
        dialogVisible:false,
        moreQueryParam:'',
        devQuery:'',
        loading:false,
        data:[],
        page:{
          pageSize: 50,
          currentPage: 1,
          total: 0
        },
      }
    },
    computed: {
      ...mapGetters(["colorName"]),
      options(){
        return [
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title: "学工号",
            field: "empCode",
            fixed:'left',
            sortable:true,
            width:100,
          },
          {
            title: "姓名",
            field: "empName",
            sortable:true,
            fixed:'left',
            width:100,
          },
          {
            title: "人员分类",
            field: "empCategoryStr",
            sortable:true,
            width:100,
          },
          {
            title: "人脸相片",
            field: "faceUrl",
            sortable:true,
            slots:{default:'faceUrl'},
            width:100,
          },
          {
            title: "卡号",
            field: "cardSn",
            sortable:true,
            width:150,
          },
          {
            title: "设备编号",
            field: "devCode",
            sortable:true,
            width:100,
          },
          {
            title: "设备名称",
            field: "devName",
            sortable:true,
            width:100,
          },
          {
            title: "类型",
            field: "eventType",
            sortable:true,
            width:130,
            formatter:({ cellValue }) => {
              return cellValue === 'FACE_PERSON_DELETE' ? '删除权限' : cellValue === 'FACE_PERSON_CREATE' ? '修改权限' : ''
            }
          },
          {
            title: "下载内容",
            field: "downCon",
            sortable:true,
            slots:{default:'downCon'},
            width:130,
          },
          {
            title: "执行时间",
            field: "executeTime",
            sortable:true,
            width:130,
          },
          {
            title: "执行状态",
            field: "executeState",
            sortable:true,
            width:100,
            slots:{default:'executeState'},
          },
          {
            title: "执行结果",
            field: "executeRes",
            sortable:true,
            minWidth:100,
          },
          {
            title: "操作员",
            field: "oprtUserName",
            sortable:true,
            minWidth:100,
          }
        ]
      },
    },
    methods: {
      openDialog(){
        this.dialogVisible = true;
        this.search()
      },
      searchReset(){
        this.moreQueryParam = "";
        this.devQuery = "";
        this.executeRes = "";
        this.executeState = 0;
        this.search()
      },
      onLoad(){
        let params = {}
        this.loading = true;
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        if(this.moreQueryParam){
          params["moreQueryParam"] = this.moreQueryParam;
        }
        params['executeRes'] = this.executeRes;
        if(this.devQuery){
          params["devQuery"] = this.devQuery;
        }
        params["executeState"] = this.executeState;
        getSelectList(params).then(res=>{
          let d = res.data.data;
          this.page.total = res.data.data.total;
          d.records.forEach((v)=>{
            v.downCon = v.downCon.replace("1","脸");
            v.downCon = v.downCon.replace("2","卡");
            if(v.downCon.startsWith(",")){
              v.downCon = v.downCon.substring(1)
            }
            if(v.oprtType == 0){
              v.eventTypeStr = "增加权限";
            }else if(v.oprtType == 1){
              v.eventTypeStr = "取消权限";
            }else if(v.oprtType == 2){
              v.eventTypeStr = "离线挂失";
            }else if(v.oprtType == 3){
              v.eventTypeStr = "删除";
              if(!v.downCon){
                v.downCon = "人员信息"
              }
            }
            let extJson = v.extJson ? JSON.parse(v.extJson) : {};
            v.oprtUserName = extJson?.oprtUserName;
          })
          this.data = d.records;
          this.loading = false;
        })
      },
      repeatExecute(){
        if(this.selectionList.length == 0){
          this.$message.warning("请选择执行中的事件")
          return;
        }
        let evIds = "";
        let flag = false;
        this.selectionList.forEach((v)=>{
          if(v.executeState != 1){
            flag = true;
          }
          evIds += v.evId + ",";
        })

        if(flag){
          this.$message.warning("请选择执行中的事件")
          return;
        }
        eventRepeatExecute({"evIds":evIds}).then(res=>{
          this.onLoad();
          this.$message.success("执行成功")
        })
      },
      search(){
        this.selectionList = []
        this.page.currentPage = 1
        this.onLoad();
      },
      selectionChange({records}) {
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
      openPreview(url){
        let arr = [
           { thumbUrl:url, url:url },
        ];
         this.$ImagePreview(arr,0);
      },
      handleExport() {
        this.$confirm('是否导出事件查询数据?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = this.selectionList.map(v => v.evId);
          window.open(`/api/iot-xf/event/selectlist/export?${website.tokenHeader}=${getToken()}&ids=${ids.join(',')}&size=${this.page.pageSize}&current=${this.page.currentPage}&moreQueryParam=${this.moreQueryParam}&executeRes=${this.executeRes}&devQuery=${this.devQuery}&executeState=${this.executeState}`);
        });
      }
    }
  };
</script>
