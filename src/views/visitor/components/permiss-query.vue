<template>
  <el-dialog
    title="权限查询"
    :visible.sync="dialogVisible"
    top="5vh"
    width="80%"
    modal-append-to-body
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <div class="mbottom8">
      <el-input
        size="small" clearable
        v-model.trim="moreParamQuery"
        placeholder="请填写访客姓名"
        style="width: 160px;margin-right: 10px;"></el-input>
      <el-select
        size="small" clearable
        v-model="eventExecuteState"
        placeholder="访问状态"
        style="width: 160px;margin-right: 10px;">
        <el-option label="未同步" :value="0"></el-option>
        <el-option label="同步中" :value="1"></el-option>
        <el-option label="已同步" :value="3"></el-option>
        <el-option label="已失败" :value="2"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="searchR">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-download"
        v-if="permission.visitor_record_auth_export_btn"
        @click="handleExport"
        >导出</el-button>
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
      :data="permissData"
      :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent">
      <template #authDoorNames="{row}">
        <el-tag
          effect="plain"
          size="mini"
          v-for="(v,i) in row.authDoorNamesArr"
          :key="i"
          style="margin-right: 6px;">{{ v }}</el-tag>
      </template>
      <template #auths="{row}">
        <el-tag
          effect="plain"
          size="mini"
          style="margin-right: 6px;" v-if="row.isFaceAUth">脸</el-tag>
        <el-tag
          effect="plain"
          size="mini"
          style="margin-right: 6px;" v-if="row.isCardAuth">卡</el-tag>
      </template>
      <template #syncDev="{row}">
        <el-tag type="danger" effect="dark" size="mini" v-if="row.eventExecuteState == 0">未同步</el-tag>
        <el-tag effect="dark" size="mini" v-if="row.eventExecuteState == 1">同步中</el-tag>
        <el-tag type="success" effect="dark" size="mini" v-if="row.eventExecuteState == 3">已同步</el-tag>
        <el-tag type="info" effect="dark" size="mini" v-if="row.eventExecuteState == 2">已失败</el-tag>
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
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import {devauthList} from "@/api/visitor/record.js"

  export default{
    data(){
      return{
        dialogVisible:false,
        permissData:[],
        loading:false,
        moreParamQuery:"",
        page: {
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        selectionList:[],
        eventExecuteState:""
      }
    },
    mounted() {
      this.onLoad();
    },
    methods:{
      opendialog(){
        this.dialogVisible = true;
      },
      searchReset(){
        this.moreParamQuery = "";
        this.eventExecuteState = "";
        this.searchR();
      },
      searchR(){
        this.selectionList = [];
        this.page.currentPage = 1
        this.onLoad();
      },
      onLoad(){
        let params = {};
        params["moreParamQuery"] = this.moreParamQuery;
        params['eventExecuteState'] = this.eventExecuteState;
        this.loading = true;
        devauthList(
          this.page.currentPage,
          this.page.pageSize,
          Object.assign(params, this.query)
        ).then(res => {
          let data = res.data.data;
          this.page.total = data.total;
          let records = data.records;
          records.forEach(v => {
            if(v.devType == 1){
              v.devType = "IC"
            }
            if(v.devType == 2 || v.devType == 7){
              v.devType = "AI"
            }
            if(v.authDoorNames){
              v.authDoorNamesArr = v.authDoorNames.split(",");
            }
            if(v.extJson){
                let date = JSON.parse(v.extJson);
                v.expirationDate = date.vaildDate;
                v.oprtUserName = date.oprtUserName;
            }
          })
          this.permissData = records;
          this.loading = false;
        })
      },
      checkboxChangeEvent({ records }) {
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
        this.$confirm("是否导出权限查询数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let ids = this.selectionList.map(v => v.id)
          window.open(
            `/api/iot-visitor/event/visitor/devauth/list/export?${website.tokenHeader}=${getToken()}&current=${this.page.currentPage}&size=${this.page.pageSize}&ids=${ids.join(',')}&moreParamQuery=${this.moreParamQuery}&eventExecuteState=${this.eventExecuteState}`
          );
        });
      },
    },
    computed:{
      ...mapGetters(["permission"]),
      tableHeight(){
          return window.innerHeight-350
      },
      option(){
        return[
          { type: 'checkbox', width: 70, fixed: 'left' },
          { type: 'seq', title: '序号', width: 70, fixed: 'left' },
          {
            title:"访客姓名",
            field:"visitorName",
            minWidth:100
          },{
            title:"访客手机号",
            field:"visitorPhone",
            minWidth:120
          },{
            title:"设备编号",
            field:'devCode',
            minWidth:100
          },{
            title:"设备名称",
            field:"devName",
            minWidth:100
          },{
            title:"同步到设备",
            field:"syncDev",
            minWidth:100,
            slots:{default:'syncDev'}
          },{
            title:"有效期",
            field:"expirationDate",
            minWidth:100
          },{
            title:"设备类型",
            field:"devType",
            minWidth:100
          },{
            title:"门区",
            field:"authDoorNames",
            minWidth:100,
            slots:{default:'authDoorNames'}
          },
          {
            title:"权限",
            field:"auths",
            minWidth:100,
            slots:{default:'auths'}
          },
          {
            title:"操作员",
            field:'oprtUserName',
            minWidth:100,
          }
        ]
      }
    }
  }
</script>
