<template>
  <basic-container>
    <div class="mbottom8">
      <el-input
        size="small" clearable
        style="width: 200px;margin-right: 10px;"
        @keyup.enter.native="search"
        v-model.trim="devName"
        placeholder="请输入设备编号/名称">
      </el-input>
      <el-select size="small" clearable v-model="commandType" placeholder="请选择命令类型" style="width: 150px;margin-right: 10px;">
        <el-option
          v-for="item in commandTypeDict"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select size="small" clearable v-model="executeState" placeholder="请选择执行状态" style="width: 150px;margin-right: 10px;">
        <el-option label="未执行" :value="0"></el-option>
        <el-option label="执行中" :value="1"></el-option>
        <el-option label="执行成功" :value="2"></el-option>
        <el-option label="执行失败" :value="3"></el-option>
      </el-select>
      <el-select size="small" clearable v-model="devType" placeholder="请选择设备类型" style="width: 150px;margin-right: 10px;">
        <el-option label="水控" :value="9"></el-option>
        <el-option label="电控" :value="10"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="primary" size="small" icon="el-icon-search" @click="handlerRerun" v-if="permission.energy_log_rerunBtn">重新执行</el-button>
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
      <vxe-column title="设备编号" field="devCode" minWidth="100"></vxe-column>
      <vxe-column title="设备名称" field="devName" minWidth="100"></vxe-column>
      <vxe-column title="命令类型" field="commandType" minWidth="100" :formatter = "({cellValue}) => {
        let item = commandTypeDict.find(item => item.value === cellValue)
        return item ? item.label : ''
      }"></vxe-column>
      <vxe-column title="创建时间" field="createTime" minWidth="100"></vxe-column>
      <vxe-column title="执行时间" field="executeTime" minWidth="140"></vxe-column>
      <vxe-column title="执行状态" field="executeState" minWidth="140">
        <template #default="{row}">
          <el-tag effect="dark" size="mini" type="danger" v-if="row.executeState == 0" >未执行</el-tag>
          <el-tag effect="dark" size="mini" type="warning" v-if="row.executeState == 1" >执行中</el-tag>
          <el-tag effect="dark" size="mini" v-if="row.executeState == 2">执行成功</el-tag>
          <el-tag effect="dark" size="mini" type="info" v-if="row.executeState == 3">执行失败</el-tag>
        </template>
      </vxe-column>
      <vxe-column title="下载参数" field="extJson" minWidth="140" show-overflow></vxe-column>
      <vxe-column title="操作员" field="oprtUserName" minWidth="100"></vxe-column>
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
  </basic-container>
</template>

<script>
  import { mapGetters } from "vuex";
  import { reqEnergyDevLog, repeatExecute } from '@/api/energy-mng/index.js'

  export default{
    data(){
      return{
        devName:"",
        commandType:"",
        commandTypeDict:[
          {value:1,label:"下载初始化参数"},
          {value:2,label:"下载免费时间"},
          {value:3,label:"设备重启"},
          {value:4,label:"获取设备数据"},
          {value:5,label:"挂失卡"},
          {value:6,label:"解挂卡"},
          {value:7,label:"清除全部挂失卡"},
          {value:8,label:"设置背光时间"}
        ],
        executeState:"",
        devType:"",
        page: {
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        tableData:[],
        selectionList: [],
        loading: false,
      }
    },
    mounted() {
      this.search();
    },
    methods:{
      handlerRerun(){
        if (this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
        let flag = this.selectionList.some(v => ![5,6].includes(v.commandType));
        if(flag) return this.$message.warning("请选择命令类型为挂失卡和解挂卡的数据！");
        repeatExecute({ids:this.ids.split(',')}).then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.onLoad();
          }else{
            this.$message.error(r.data.msg);
          }
        })
      },
      search(){
        this.selectionList = [];
        this.page.currentPage = 1;
        this.onLoad();
      },
      searchReset(){
        this.devName = "";
        this.commandType = "";
        this.executeState = "";
        this.devType = "";
        this.search();
      },
      onLoad(params = {}){
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['devName'] = this.devName;
        params['commandType'] = this.commandType;
        params['executeState'] = this.executeState;
        params['devType'] = this.devType;
        this.loading = true;
        reqEnergyDevLog(params).then(r => {
          this.loading = false;
          if(r.data.code === 200){
            let d = r.data.data;
            this.page.total = d.total;
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
      ...mapGetters(['permission']),
      tableHeight(){
        return window.innerHeight - 272;
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
