<template>
	<el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <el-tabs type="border-card" style="width: 100%;">
        <el-tab-pane label="部门树">
          <div class="ztreeStyle" :style="{height:ztreeHeight+'px'}">
            <account-ztree ref="accountZtreeRef" @click="accountztreeClick"></account-ztree>
          </div>
       </el-tab-pane>
        <el-tab-pane label="设备树">
          <div class="ztreeStyle" :style="{height:ztreeHeight+'px'}">
            <dev-ztree ref="devZtreeRef" @changeTreeData="devTreeClick"></dev-ztree>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div>
          <el-date-picker
            v-model="accTransTime"
            size="small"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            :clearable="false"
            range-separator="至"
            start-placeholder="创建开始时间"
            end-placeholder="创建结束时间"
            :default-time="['00:00:00','23:59:59']"
            style="width: 330px;margin-right: 10px;"></el-date-picker>
          <el-input
            size="small" clearable
            @keyup.enter.native="search"
            style="width: 150px;"
            v-model="empName"
            placeholder="请输入学工号/姓名"></el-input>
          <el-select size="small" clearable v-model="devExecuteState" placeholder="请选择设备执行状态" style="width: 150px;margin: 0 10px;">
            <el-option
              v-for="item in devExecuteStateArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"></el-option>
          </el-select>
          <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
          <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
        </div>
        <vxe-grid
          border
          resizable
          highlight-hover-row
          :height="tableHeight"
          ref="xGrid"
          size="mini"
          align="center"
          :highlight="true"
          :columns="tableColumn"
          :loading="loading"
          :checkbox-config="{checkField:'checked'}"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="tableData"
          :export-config="{}"
          :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
          <template #toolbar_buttons>
            <el-button 
              type="danger" size="small" 
              v-if="permission.access_controller_eventselect_repeat_execute_btn" 
              @click="handleDelete">删除</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              v-if="permission.access_controller_eventselect_export_btn"
              @click="handleExport">导出</el-button>
          </template>

          <template #doorAuthNames="{row}">
            <el-tag effect="plain" size="mini" type="info" v-if="row.door1Name != ''">{{row.door1Name}}</el-tag>
            <el-tag effect="plain" size="mini" type="info" style="margin: 0 3px;" v-if="row.door2Name != ''" >{{row.door2Name}}</el-tag>
            <el-tag effect="plain" size="mini" type="info" v-if="row.door3Name != ''" >{{row.door3Name}}</el-tag>
            <el-tag effect="plain" size="mini" type="info" style="margin-left: 3px;" v-if="row.door4Name != ''" >{{row.door4Name}}</el-tag>
          </template>
          <template #devExecuteState="{row}">
              <el-tag effect="dark" size="mini" type="danger" v-if="row.devExecuteState == 0">未执行</el-tag>
              <el-tag effect="dark" size="mini" v-if="row.devExecuteState == 1">执行中</el-tag>
              <el-tag effect="dark" size="mini" type="info" v-if="row.devExecuteState == 2">已失败</el-tag>
              <el-tag effect="dark" size="mini" type="success" v-if="row.devExecuteState == 3">已成功</el-tag>
          </template>
          <template #executeState="{row}">
              <el-tag effect="dark" size="mini" type="danger" v-if="row.executeState == 0">未执行</el-tag>
              <el-tag effect="dark" size="mini" v-if="row.executeState == 1">执行中</el-tag>
              <el-tag effect="dark" size="mini" type="info" v-if="row.executeState == 2">已失败</el-tag>
              <el-tag effect="dark" size="mini" type="success" v-if="row.executeState == 3">已成功</el-tag>
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
</template>

<script>
  import moment from 'moment'
  import {mapGetters} from "vuex";
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  import {getList,remove} from "@/api/iot/access/event";
  import accountZtree from "@/components/account-ztree/index.vue"
  import devZtree from "@/components/devztree/index.vue"

  export default{
    components:{accountZtree, devZtree},
    data(){
      return{
        empName:"",
        ztreeHeight:0,
        tableHeight:0,
        loading:false,
        tableData:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        selectionList:[],
        ancestors:"",
        accTransTime:[],
        devExecuteState:"",
        devExecuteStateArr:[
          {value:0,label:"未执行"},
          {value:1,label:"执行中"},
          {value:2,label:"失败"},
          {value:3,label:"成功"},
        ]
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-187;
      this.tableHeight=window.innerHeight-254;
      let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
      let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      this.accTransTime = [start,end]
      this.search()
    },
    methods:{
      handleDelete(){
        if (this.selectionList.length === 0) return this.$message.warning('请至少选择1条数据');
        let flag = this.selectionList.some(v => v.devExecuteState == 3 || v.devExecuteState == 2);
        if(flag) return this.$message.warning('请选择未执行或执行中的数据');
        this.$confirm('确定要删除数据?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return remove({ids:this.ids.split(',')})
        }).then(r => {
          this.onLoad();
          this.$message.success(r.data.msg)
        });
      },
      search(){
        this.page.currentPage = 1
        this.selectionList = []
        this.onLoad()
      },
      onLoad(){
        let params = {}
        this.loading = true;
        if(this.empName){
          params["empName"] = this.empName.trim();
        }
        params['ancestors'] = this.ancestors;
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['startCreateTime'] = this.accTransTime[0]
        params['endCreateTime'] = this.accTransTime[1]
        params['devExecuteState'] = this.devExecuteState
        getList(params).then(res=>{
          const data = res.data.data;
          this.page.total = data.total;
          let records = data.records;
          records.forEach(e=>{
            if(e.empType == 1){
              e.deptName = e.className
            }
            e.oprtUserName = e.extJson ? JSON.parse(e.extJson).oprtUserName : ''
            e.checked = false
          })
          this.tableData = records;
          this.loading = false;
        }).catch(() => this.loading = false)
      },
      searchReset() {
        this.empName = "";
        this.ancestors = "";
        let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
        let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
        this.accTransTime = [start,end]
        this.devExecuteState = ""
        this.search();
        this.$refs.accountZtreeRef.getAccountZtreeInit();
        this.$refs.devZtreeRef.initEquipmentTreeData();
      },
      handleExport() {
        this.$confirm("是否导出事件查询数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let start = '',end = ''
          if(this.accTransTime.length){
            start = this.accTransTime[0]
            end = this.accTransTime[1]
          }
          window.open(`/api/iot-basic/access/event/list/export?${this.website.tokenHeader}=${getToken()}&empName=${this.empName.trim()}&ids=${this.ids}&ancestors=${this.ancestors}&size=${this.page.pageSize}&current=${this.page.currentPage}&devExecuteState=${this.devExecuteState}&endCreateTime=${end}&startCreateTime=${start}`);
        });
      },
      accountztreeClick(treeNode){
        this.ancestors = treeNode.valueStr;
        this.search()
      },
      devTreeClick(treeNode){
        this.ancestors = treeNode.valueStr;
        this.search()
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
      ...mapGetters(['permission']),
      ids() {
        let ids = this.selectionList.map(v => v.id);
        return ids.join(",");
      },
      tableColumn(){
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
            title: "门区权限",
            field: "doorAuthNames",
            slot:true,
            minWidth:160,
            slots:{default:'doorAuthNames'}
          },
          {
            title: "创建时间",
            field: "createTime",
            sortable:true,
            minWidth:140,
          },
          {
            title: "权限类型",
            field: "downType",
            sortable:true,
            minWidth:100,
            formatter:({ cellValue }) => {
                return cellValue == 1 ? '有权' : cellValue == 2 ? '无权' : cellValue == 3 ? '删除' : ''
            }
          },
          {
            title: "执行时间",
            field: "executeTime",
            sortable:true,
            minWidth:140,
          },
          {
            title: "执行状态",
            field: "executeState",
            sortable:true,
            minWidth:100,
            slots:{default:'executeState'}
          },
          {
            title: "设备执行状态",
            field: "devExecuteState",
            sortable:true,
            minWidth:110,
            slots:{default:'devExecuteState'}
          },
          {
            title: "设备执行结果",
            field: "devExecuteRes",
            sortable:true,
            minWidth:150,
          },
          {
            title: "部门/班级名称",
            field: "deptName",
            sortable:true,
            minWidth:120,
          },
          {
            title: "学校名称",
            field: "schoolName",
            sortable:true,
            minWidth:120,
          },
          {
            title: "操作员",
            field: "oprtUserName",
            sortable:true,
            minWidth:100,
          },
        ]
      }
    }
  }
</script>

<style scoped>
  >>>.el-tabs--border-card>.el-tabs__content{
    padding: 0;
  }
  >>>.el-tabs__item{
    text-align: center;
    width: 50% !important;
  }
  >>>.el-tabs__nav{
    width: 100% !important;
  }
</style>
