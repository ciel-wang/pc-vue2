<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <el-tabs type="border-card" style="width: 100%;" @tab-click="ancestors = ''" class="myopacity">
        <el-tab-pane label="部门树">
          <div class="ztreeStyle" :style="{height:ztreeHeight+'px'}">
            <account-ztree ref="accountZtreeRef" @click="accountztreeClick"></account-ztree>
          </div>
       </el-tab-pane>
        <el-tab-pane label="设备树">
          <div class="ztreeStyle" :style="{height:ztreeHeight+'px'}">
            <dev-ztree ref="devZtreeRef" @onCheck="devTreeClick" :type="2" :isCheck="true"></dev-ztree>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div>
          <el-input
            size="small" clearable
            @keyup.enter.native="search"
             style="width: 200px;margin-right: 10px;"
            v-model="moreParamQuery"
            placeholder="请输入学工号/姓名"></el-input>
          <el-input
            size="small" clearable
            @keyup.enter.native="search"
            v-model="devParamQuery"
            style="width: 200px;margin-right: 10px;"
            placeholder="请输入设备编号/名称"></el-input>
          <el-select
            v-model="eventExecuteState"
            clearable size="small"
            placeholder="是否同步设备"
            style="width: 160px !important;margin-right: 10px;">
              <el-option
                  v-for="item in eventExecuteStateDic"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
          </el-select>
          <el-select
            v-model="isAuth"
            clearable size="small"
            placeholder="是否有权"
            style="width: 160px !important;margin-right: 10px;">
              <el-option label="是" :value="true"></el-option>
              <el-option label="否" :value="false"></el-option>
          </el-select>
          <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
          <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
        </div>
        <vxe-grid
          border
          resizable
          auto-resize
          highlight-hover-row
          :height="tableHeight"
          ref="xGrid"
          size="mini"
          align="center"
          :highlight="true"
          :columns="faceOption"
          :loading="loading"
          :checkbox-config="{checkField:'checked'}"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="eventData"
          :export-config="{}"
          :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
          <template #toolbar_buttons>
            <el-button type="primary"
                       size="small"
                       icon="el-icon-download"
                       v-if="permission.access_controller_select_ai_export_btn"
                       @click="handleExport">导出
            </el-button>
          </template>
          <template #moreAuth="{row}">
            <el-tag effect="plain" size="mini" type="primary" v-if="row.isCardAuth ">刷卡</el-tag>
            <el-tag effect="plain" size="mini" type="primary" v-if="row.isFaceAuth" style="margin-left:3px">刷脸</el-tag>
          </template>
          <template #eventExecuteState="{row}">
            <el-tag effect="dark" size="mini" type="warning" v-if="row.eventExecuteState == 0">未同步</el-tag>
            <el-tag effect="dark" size="mini" type="info" v-if="row.eventExecuteState == 1">同步中</el-tag>
            <el-tag effect="dark" size="mini" type="danger" v-if="row.eventExecuteState == 2">已失败</el-tag>
            <el-tag effect="dark" size="mini" type="primary" v-if="row.eventExecuteState == 3">已同步</el-tag>
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
  import {mapGetters} from "vuex";
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  import {eventStateTrans} from "@/util/trans";
  import {getAiList} from "@/api/iot/access/select";
  import accountZtree from "@/components/account-ztree/index.vue"
  import devZtree from "@/components/devztree/index.vue"
  let ancestors = "";
  export default{
    components:{accountZtree, devZtree},
    data(){
      return{
        moreParamQuery:"",
        devParamQuery:"",
        tableHeight:0,
        loading:false,
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        eventData:[],
        selectionList:[],
        eventExecuteStateDic:[
          {value:0,label:"未同步"},
          {value:1,label:"同步中"},
          {value:2,label:"已失败"},
          {value:3,label:"已同步"},
        ],
        eventExecuteState:"",
        isAuth:"",
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-187;
      this.tableHeight=window.innerHeight-254;
      this.search()
    },
    methods:{
      handleExport() {
        this.$confirm("是否导出AI权限数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let ids = this.selectionList.map(v => v.id).join(',');
          window.open(`/api/iot-basic/access/auth/select/ai/export?${website.tokenHeader}=${getToken()}&moreParamQuery=${this.moreParamQuery.trim()}&devParamQuery=${this.devParamQuery.trim()}&ids=${ids}&size=${this.page.pageSize}&current=${this.page.currentPage}&ancestors=${this.ancestors}&eventExecuteState=${this.eventExecuteState}&isAuth=${this.isAuth}`);
        });
      },
      search(){
        this.page.currentPage = 1
        this.selectionList = []
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
        params["devParamQuery"] = this.devParamQuery.trim();
        params['ancestors'] = this.ancestors;
        params['eventExecuteState'] = this.eventExecuteState;
        params['isAuth'] = this.isAuth;
        getAiList(params).then(res=>{
          const data = res.data.data;
          this.page.total = data.total;
          let records = data.records;
          records.forEach(e=>{
            e.isEffective = (e.isEffective ? "有效":"无效")
            e.equipmentExecuteState = eventStateTrans(e.equipmentExecuteState)
            if(e.empType == 1){
              e.deptName = e.className
            }
            let extJson = e.extJson ? JSON.parse(e.extJson) : {};
            e.vaildDate = extJson.vaildDate;
            e.strategyName = extJson.strategyName;
            e.oprtUserName = extJson.oprtUserName;
            e.checked = false
          })
          this.eventData = records;
          this.$forceUpdate()
          this.loading = false;
        }).catch(() => this.loading = false)
      },
      accountztreeClick(treeNode){
        this.ancestors = treeNode.valueStr;
        this.search()
      },
      devTreeClick(treeNode){
        let arr = []
        treeNode.forEach(v => {
          if(v.valueStr.startsWith('D') || v.valueStr.startsWith('E')){
            arr.push(v.valueStr)
          }
        })
        this.ancestors = arr.join(',')
        this.search()
      },
      searchReset(){
        this.moreParamQuery = ""
        this.devParamQuery = ""
        this.ancestors = ""
        this.eventExecuteState = "";
        this.isAuth = "";
        this.search()
        this.$refs.accountZtreeRef.getAccountZtreeInit();
        this.$refs.devZtreeRef.initEquipmentTreeData();
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
      faceOption(){
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
            title: "性别",
            field: "empSex",
            sortable:true,
            minWidth:100,
            visible:false,
            formatter:({ cellValue })=>{
              return cellValue == 1 ? '男' : '女'
            }
          },
          {
            title: "权限",
            field: "moreAuth",
            slots:{default:"moreAuth"},
            sortable:true,
            minWidth:100,
          },
          {
            title: "时段权限",
            field: "strategyName",
            sortable:true,
            minWidth:150,
          },
          {
            title: "是否同步设备",
            field: "eventExecuteState",
            sortable:true,
            minWidth:120,
            slots:{default:"eventExecuteState"},
          },
          {
            title: "有效期",
            field: "vaildDate",
            sortable:true,
            minWidth:140,
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
          }
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
