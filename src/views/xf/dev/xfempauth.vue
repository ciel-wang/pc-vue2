<template>
  <el-dialog
    title="权限查询"
    :visible.sync="dialogVisible"
    width="1200px"
    :modal-append-to-body="true"
    :append-to-body="true"
    :close-on-press-escape="false"
    top="1vh"
    :close-on-click-modal="false"
    :before-close="handleClose">
    <div style="margin-bottom: 8px;">
      <el-input
        style="width: 160px;"
        @keyup.enter.native="search"
        size="small" clearable
        v-model="moreQueryParam"
        placeholder="请填写学工号/姓名"></el-input>
      <el-input
        style="width: 160px;margin: 0 10px;"
        @keyup.enter.native="search"
        size="small" clearable
        v-model="devQuery"
        placeholder="请填写设备编号/名称"></el-input>
      <el-select v-model="downCon" clearable size="small" placeholder="按介质搜索" style="width: 160px;">
        <el-option  v-for="item in empAuths" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select v-model="isAuth" clearable size="small" placeholder="按权限搜索" style="width: 160px;margin: 0 10px;">
        <el-option v-for="item in auths" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select v-model="eventExecuteState" clearable size="small" placeholder="是否同步设备" style="width: 160px !important;margin-right: 10px;">
        <el-option v-for="item in eventExecuteStateDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
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
      <template #eventExecuteState="{row}">
          <el-tag effect="dark" size="mini" type="info" v-if="row.eventExecuteState == 0">未同步</el-tag>
          <el-tag effect="dark" size="mini" type="success" v-if="row.eventExecuteState == 1">已同步</el-tag>
          <el-tag effect="dark" size="mini" type="danger" v-if="row.eventExecuteState == 2">已失败</el-tag>
      </template>
    </vxe-grid>
    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[50, 100, 500,1000,3000]"
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
  import {geEmpAuthtListByDev} from '@/api/xf/xfdev'
  import website from '@/config/website';
  import {getToken} from '@/util/auth';

  export default {
    data() {
      return {
        selectionList:[],
        empAuths:[
          {"label":"卡",value:1},
          {"label":"脸",value:2},
          {"label":"卡，脸",value:3},
        ],
        auths:[
          {"label":"有权",value:1},
          {"label":"无权",value:0},
        ],
        dialogVisible:false,
        moreQueryParam:'',
        devQuery:'',
        executeState:'',
        loading:false,
        downCon:'',
        isAuth:'',
        data:[],
        page:{
          pageSize: 50,
          currentPage: 1,
          total: 0
        },
        eventExecuteStateDic: [{ value: 0, label: '未同步' }, { value: 1, label: '已同步' }, { value: 2, label: '已失败' }],
        eventExecuteState: 2
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
            sortable:true,
            minWidth:100,
            fixed:'left',
          },
          {
            title: "姓名",
            field: "empName",
            sortable:true,
            minWidth:100,
            fixed:'left',
          },
          {
            title: "设备编号",
            field: "devCode",
            sortable:true,
            minWidth:100
          },
          {
            title: "设备名称",
            field: "devName",
            sortable:true,
            minWidth:100
          },
          {
            title: "人脸权限",
            field: "isFaceAuth",
            sortable:true,
            minWidth:100,
            formatter:({cellValue})=>{
              return cellValue == 0 ? '无权' : '有权'
            }
          },
          {
            title: "卡权限",
            field: "isCardAuth",
            sortable:true,
            minWidth:100,
            formatter:({cellValue})=>{
              return cellValue == 0 ? '无权' : '有权'
            }
          },
          {
            title: "有效期",
            field: "vaildDate",
            sortable:true,
            minWidth:100
          },
          {
            title: "是否同步设备",
            field: "eventExecuteState",
            sortable:true,
            minWidth:120,
            slots:{default:"eventExecuteState"}
          },
          {
            title: "部门名称",
            field: "deptName",
            sortable:true,
            minWidth:120
          },
          {
            title: "学校名称",
            field: "schoolName",
            sortable:true,
            minWidth:120
          },
          {
            title: "操作人",
            field: "oprtUserName",
            sortable:true,
            minWidth:120
          }
        ]
      },
    },
    methods: {
      openDialog(){
        this.dialogVisible = true;
        this.data = [];
        this.search()
      },
      searchReset(){
        this.moreQueryParam = "";
        this.devQuery = '';
        this.downCon = '';
        this.isAuth = '';
        this.eventExecuteState = 2;
        this.search()
      },
      search(){
        this.page.currentPage = 1
        this.selectionList = []
        this.onLoad();
      },
      onLoad(){
        this.loading = true;
        let params = {}
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        if(this.moreQueryParam){
          params["moreQueryParam"] = this.moreQueryParam;
        }
        if(this.devQuery){
          params["devQuery"] = this.devQuery;
        }
        if(this.downCon){
          params["downCon"] = this.downCon;
        }
        params['eventExecuteState'] = this.eventExecuteState;
        params["isAuth"] = this.isAuth;
        geEmpAuthtListByDev(params).then(res=>{
          res.data.data.records.forEach(v => {
            v.deptName = v.empType == 1 ? v.className : v.deptName
            let extJson = JSON.parse(v.extJson);
            v.oprtUserName = extJson?.oprtUserName;
            v.vaildDate = extJson.vaildDate;
          })
          this.data = res.data.data.records;
          this.page.total = res.data.data.total;
          this.loading = false;
        })
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
      handleExport(){
        this.$confirm('是否导出权限查询数据?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
          let ids = this.selectionList.map(v => v.id);
          window.open(
            `/api/iot-xf/empauth/selectauth/export?${website.tokenHeader}=${getToken()}&ids=${ids.join(',')}&size=${this.page.pageSize}&current=${this.page.currentPage}&moreQueryParam=${this.moreQueryParam}&downCon=${this.downCon}&devQuery=${this.devQuery}&eventExecuteState=${this.eventExecuteState}&isAuth=${this.isAuth}`
          );
        });
      }
    }
  };
</script>
