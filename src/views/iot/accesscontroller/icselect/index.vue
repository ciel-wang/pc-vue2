<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <el-tabs type="border-card" style="width: 100%;" class="myopacity">
        <el-tab-pane label="部门树">
          <div class="ztreeStyle" :style="{height:ztreeHeight+'px'}">
            <account-ztree ref="accountZtreeRef" @click="accountztreeClick"></account-ztree>
          </div>
       </el-tab-pane>
        <el-tab-pane label="设备树">
          <div class="ztreeStyle" :style="{height:ztreeHeight+'px'}">
            <dev-ztree ref="devZtreeRef" isCheck @onCheck="devTreeClick"></dev-ztree>
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
            style="width: 160px;margin-right: 10px;"
            v-model="moreParamQuery"
            placeholder="请输入学工号/姓名"></el-input>
          <el-input
            size="small" clearable
            @keyup.enter.native="search"
            v-model="devParamQuery"
            style="width: 180px;margin-right: 10px;"
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
          :columns="icOption"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="eventData"
          :export-config="{}"
          :checkbox-config="{checkField:'checked'}"
          :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
          <template #toolbar_buttons>
            <el-button type="primary"
                       size="small"
                       icon="el-icon-download"
                       v-if="permission.access_controller_select_ic_export_btn"
                       @click="handleExport">导出
            </el-button>
          </template>
          <template #moreAuth="{row}">
            <el-tag effect="plain" size="mini" type="primary" v-if="row.door1 == true && row.door1Name">{{row.door1Name}}</el-tag>
            <el-tag effect="plain" size="mini" type="primary" style="margin-left:3px" v-if="row.door2 == true && row.door2Name">{{row.door2Name}}</el-tag>
            <el-tag effect="plain" size="mini" type="primary" style="margin-left:3px" v-if="row.door3 == true && row.door3Name">{{row.door3Name}}</el-tag>
            <el-tag effect="plain" size="mini" type="primary" style="margin-left:3px" v-if="row.door4 == true && row.door4Name">{{row.door4Name}}</el-tag>
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
  import {getList} from "@/api/iot/access/select";
  import accountZtree from "@/components/account-ztree/index.vue"
  import devZtree from "@/components/devztree/index.vue"
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
        ancestors:"",
        pDevIds:""
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-187;
      this.tableHeight=window.innerHeight-254;
      this.search()
    },
    methods:{
      handleExport() {
        this.$confirm("是否导出IC权限数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let ids = this.selectionList.map(v => v.uid).join(',');
          window.open(`/api/iot-basic/access/ic/export-ic?${website.tokenHeader}=${getToken()}&moreParamQuery=${this.moreParamQuery.trim()}&devParamQuery=${this.devParamQuery.trim()}&ids=${ids}&eventExecuteState=${this.eventExecuteState}&isAuth=${this.isAuth}&pDevIds=${this.pDevIds}&ancestors=${this.ancestors}`);
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
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        if(this.moreParamQuery) {
        	params["moreParamQuery"] = this.moreParamQuery.trim();
        }
        params["devParamQuery"] = this.devParamQuery.trim();
        params['ancestors'] = this.ancestors;
        params['eventExecuteState'] = this.eventExecuteState;
        params['isAuth'] = this.isAuth;
        params['pDevIds'] = this.pDevIds;
        getList(params).then(res=>{
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
            e.oprtUserName = extJson.oprtUserName;
            e.timeStep = extJson.timestepSeq;
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
        let arr = treeNode.filter(v => v.valueStr.startsWith('E')).map(v => v.value);
        this.pDevIds = arr.join(',')
        this.search()
      },
      searchReset(){
        this.moreParamQuery = ""
        this.devParamQuery = ""
        this.ancestors = ""
        this.eventExecuteState = "";
        this.isAuth = "";
        this.pDevIds = "";
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
      icOption(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title: "学工号",
            field: "empCode",
            sortable:true,
            fixed:"left",
            minWidth:100,
          },
          {
            title: "姓名",
            field: "empName",
            sortable:true,
            fixed:"left",
            minWidth:100,
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
            title: "人员类型",
            field: "personType",
            sortable:true,
            minWidth:100,
            visible:false,
            formatter:({ cellValue })=>{
              return cellValue == 1 ? '内部' : '外部'
            }
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
            title: "设备序列号",
            field: "devSn",
            sortable:true,
            minWidth:150,
            visible:false
          },
          {
            title: "物理卡号",
            field: "physicalCardNum",
            sortable:true,
            minWidth:100,
          },
          {
            title: "门区权限",
            field: "moreAuth",
            slots:{default:"moreAuth"},
            sortable:true,
            minWidth:150,
          },
          {
            title: "时段权限",
            field: "timeStep",
            sortable:true,
            minWidth:100,
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
