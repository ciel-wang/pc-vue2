<template>
  <basic-container>
    <div class="mbottom8">
      <el-input
        size="small" clearable
        style="width: 200px;margin-right: 10px;"
        @keyup.enter.native="search"
        v-model.trim="devName"
        placeholder="请输入设备名称">
      </el-input>
      <el-select size="small" clearable v-model="devType" placeholder="请选择设备类型" style="width: 150px;margin-right: 10px;">
        <el-option label="水控" :value="9"></el-option>
        <el-option label="电控" :value="10"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div class="mbottom8">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="handleAdd"
        v-if="permission.energy_dev_addBtn">添加</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-edit"
        @click="handleEdit"
        v-if="permission.energy_dev_editBtn">编辑</el-button>
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        @click="handleDelete"
        v-if="permission.energy_dev_delBtn">删除</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-download"
        @click="handleExport"
        v-if="permission.energy_dev_exportBtn">导出</el-button>
      <el-button
        type="primary"
        size="small"
        @click="handleSetCfg"
        v-if="permission.energy_dev_cfgBtn">工作参数</el-button>
      <el-dropdown @command="handleCommand">
        <el-button size="small" type="primary" style="margin-left: 10px;">
          更多<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="restartDev">重启设备</el-dropdown-item>
          <el-dropdown-item command="cleanAllCard">清除所有挂失卡</el-dropdown-item>
          <el-dropdown-item command="reqCard">获取设备数据</el-dropdown-item>
          <el-dropdown-item command="discountRate">折扣设置</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <vxe-table
      border
      stripe
      auto-resize
      resizable
      size="mini"
      highlight-hover-row
      align="center"
      :loading="loading"
      :height="tableHeight"
      :data="tableData"
      :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent">
      <vxe-column type="checkbox" width="70"></vxe-column>
      <vxe-column type="seq" title="序号" width="70"></vxe-column>
      <vxe-column title="设备状态" field="onLineState" minWidth="100">
        <template #default="{row}">
          <el-tag effect="dark" size="mini" type="info" v-if="row.onLineState == false">离线</el-tag>
          <el-tag effect="dark" size="mini" type="primary" v-if="row.onLineState == true">在线</el-tag>
        </template>
      </vxe-column>
      <vxe-column title="设备编号" field="devCode" minWidth="100"></vxe-column>
      <vxe-column title="设备名称" field="devName" minWidth="100"></vxe-column>
      <vxe-column title="设备类型" field="devType" minWidth="100">
        <template #default="{row}">
          <el-tag effect="dark" size="mini" v-if="row.devType == 9">水控</el-tag>
          <el-tag effect="dark" size="mini" type="success" v-if="row.devType == 10">电控</el-tag>
        </template>
      </vxe-column>
      <vxe-column title="设备IP" field="devIp" minWidth="100"></vxe-column>
      <vxe-column title="机号" field="devSeq" minWidth="100"></vxe-column>
      <vxe-column title="设备当前时间戳" field="devCurrTime" minWidth="120"></vxe-column>
      <vxe-column title="是否启用" field="devState" minWidth="100">
        <template #default="{row}">
          <i class="icon-xuanzhong" v-if="row.devState == 1" :style="{ color: colorName }"></i>
          <i class="icon-weixuanzhong" v-else></i>
        </template>
      </vxe-column>
      <vxe-column title="位置" field="remark" minWidth="100"></vxe-column>
      <vxe-column title="工作状态" field="workStatus" minWidth="100">
        <template #default="{row}">
          <el-tag effect="dark" size="mini" v-if="row.workStatus == 0">空闲中</el-tag>
          <el-tag effect="dark" size="mini" type="warning" v-if="row.workStatus == 16">实时模式扣费中</el-tag>
          <el-tag effect="dark" size="mini" type="danger" v-if="row.workStatus == 32">预扣费模式扣费中</el-tag>
        </template>
      </vxe-column>
      <vxe-column title="总时间(s)" field="totalTime" minWidth="100"></vxe-column>
      <vxe-column title="总流量(升)" field="totalLl" minWidth="100"></vxe-column>
      <vxe-column title="总金额(元)" field="totalMoney" minWidth="100"></vxe-column>
    </vxe-table>
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
        :hide-on-single-page="false"
      ></el-pagination>
    </div>

    <add-edit ref="addEditRef" @refeshPage="search"></add-edit>
    <cfg ref="cfgRef"></cfg>
    <discount-rate ref="discountRateRef" :empCategorys="empCategorys"></discount-rate>
  </basic-container>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import addEdit from './add-edit.vue';
  import discountRate from './discount-rate.vue';
  import cfg from './cfg.vue';
  import { reqEnergyDevList, reqEnergyDevDetails, removeEnergyDev, downloadDevCommand } from '@/api/energy-mng/index.js'
  import { getEmpCategoryList } from '@/api/xf/xfdev';
  import { getAppCfgList } from '@/api/app-manage/basicCfg.js';

  export default{
    components:{ addEdit, cfg, discountRate },
    data(){
      return{
        devName:"",
        devType:"",
        page: {
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        tableData:[],
        selectionList: [],
        loading: false,
        websock: null,
        timer:null,
        empCategorys: [],
        tableDataDefult:[]
      }
    },
    mounted() {
      this.search();
    },
    activated() {
      this.websock = null;
      this.initWebSocket();
      getEmpCategoryList().then(res => {
        let d = res.data.data.data;
        d.studentCategory.forEach(v => v.dictValue = v.dictValue+' (学生)')
        d.userCategory.forEach(v => v.dictValue = v.dictValue+' (教师)')
        let data = [...d.studentCategory,...d.userCategory];
        this.empCategorys = data;
        let arr = data.map(v => ({empCategory:v.dictKey,discount:100}));
        this.tableDataDefult = arr;
      })
    },
    deactivated() {
      clearInterval(this.timer)
      this.websock.close();
      this.websock = null;
    },
    methods:{
      initWebSocket() {
        let url = website.websocketUrl;
        this.websock = new WebSocket(url); // 监听打开
        this.websock.onopen = this.websockOpen; // 监听关闭
        this.websock.onmessage = this.websockMessage;
      },
      websockOpen() {
        this.websock.send(JSON.stringify({ type: 7, token: getToken() }));
        this.timer = setInterval(() => {
          this.websock.send(JSON.stringify({ type: 7, token: getToken() }));
        },3000)
      },
      websockMessage(e) {
        let data = e?.data;
        let array = []
        try{
          let d = data == 'successfully' ? {} : JSON.parse(data);
          array = Array.isArray(d) ? d : [];
        }catch{
          array = []
        }
        this.tableData.forEach(v => {
          if (array.length == 0) {
            v.onLineState = false;
            v.workStatus = 0;
          } else {
            let item = array.find(d => d.split('_')[0] == v.devIp);
            v.onLineState = item ? true : false;
            v.workStatus = Array.isArray(item) && item.length && item[0].split('_').length > 1 ? item[0].split('_')[1] : 0;
            // let item = array.find(d => d == v.devIp);
            // v.onLineState = item ? true : false;
            // v.workStatus = 0;
          }
        });
        this.$forceUpdate();
      },
      handleCommand(val){
        if(val === 'discountRate'){
          getAppCfgList().then(r => {
            if(r.data.code === 200){
              let data = r.data.data.SDCTRL_EMP_CATEGORY_ZK_JSON;
              data = JSON.parse(data);
              data = Array.isArray(data) && data.length ? data : this.tableDataDefult;
              this.$refs.discountRateRef.openDialog(data);
            }
          })
          return;
        }
        if (this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
        let action = "";
        if(val === 'restartDev') action = 3;
        if(val === 'cleanAllCard') action = 7;
        if(val === 'reqCard') action = 4;
        downloadDevCommand({ devIds:this.ids.split(','),action }).then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.onLoad();
          }else{
            this.$message.error(r.data.msg);
          }
        })
      },
      handleAdd(){
        this.$refs.addEditRef.openDialog();
      },
      handleEdit(){
        if (this.selectionList.length != 1) return this.$message.warning('请选择一条数据');
        reqEnergyDevDetails({ id:this.selectionList[0].devId }).then(r => {
          if(r.data.code === 200){
            let { id, devType, devName,devCode,devIp,devState,remark,backlightDuration } = r.data.data;
            let form = { id, devType, devName,devCode,devIp,devState,remark,backlightDuration };
            this.$refs.addEditRef.openDialog('edit',form);
          }
        })
      },
      handleSetCfg(){
        if (this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
        reqEnergyDevDetails({ id:this.selectionList[0].devId }).then(r => {
          if(r.data.code === 200){
            let { extJson } = r.data.data;
            let form = JSON.parse(extJson);
            form.devIds = this.ids.split(',');
            this.$refs.cfgRef.openDialog(form);
          }
        })
      },
      handleDelete(){
        if (this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
        this.$confirm('确定要删除选择的数据？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return removeEnergyDev({ ids: this.ids.split(',') });
        }).then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.onLoad();
          }else{
            this.$message.error(r.data.msg)
          }
        });
      },
      handleExport(){
        this.$confirm('是否导出节能设备?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          window.open(
            `/api/iot-sdctrl/dev/list/export?${website.tokenHeader}=${getToken()}&ids=${this.ids}&size=${this.page.pageSize}&current=${this.page.currentPage}&devName=${this.devName}&devType=${this.devType}`
          );
        });
      },
      search(){
        this.selectionList = [];
        this.page.currentPage = 1;
        this.onLoad();
      },
      searchReset(){
        this.devName = "";
        this.devType = "";
        this.search();
      },
      onLoad(){
        let params = {};
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['devName'] = this.devName;
        params['devType'] = this.devType;
        this.loading = true;
        reqEnergyDevList(params).then(r => {
          this.loading = false;
          if(r.data.code === 200){
            let d = r.data.data;
            this.page.total = d.total;
            d.records.forEach(v => {
              let json = JSON.parse(v.extJson);
              v.devSeq = json.devId;
              v.totalMoney = 0;
              v.totalTime = 0;
              v.totalLl = 0;
            })
            this.tableData = d.records;
          }
        }).catch(() => this.loading = false)
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
      }
    },
    computed:{
      ...mapGetters(['permission','colorName']),
      tableHeight(){
        return window.innerHeight - 302;
      },
      ids() {
        let ids = this.selectionList.map(v => v.devId);
        return ids.join(',');
      },
    }
  }
</script>

<style>
</style>
