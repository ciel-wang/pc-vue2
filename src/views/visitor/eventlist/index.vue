<template>
	<el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{height:ztreeHeight+'px'}">
        <dev-ztree ref="devZtreeRef" @onCheck="devTreeClick" :isCheck="true"></dev-ztree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div style="margin-bottom: 8px;">
          <el-input
            size="small" clearable
            @keyup.enter.native="search"
            style="width: 180px;"
            v-model="moreParamQuery"
            placeholder="请输入访客姓名/手机号码/身份证号"></el-input>
          <el-select v-model="devExecuteState" size="small" clearable placeholder="请选择执行状态" style="width: 140px;margin: 0 10px;">
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-date-picker
            v-model="createTime"
            size="small"
            type="datetimerange"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="创建开始时间"
            end-placeholder="创建结束时间"
            :default-time="['00:00:00','23:59:59']"
            style="width: 330px;">
          </el-date-picker>
          <el-date-picker
            v-model="devExecuteTime"
            size="small"
            type="datetimerange"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="执行开始时间"
            end-placeholder="执行结束时间"
            :default-time="['00:00:00','23:59:59']"
            style="width: 330px;margin: 0 10px;">
          </el-date-picker>
          <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
          <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-download"
            v-if="permission.visitor_event_export_btn"
            @click="handleExport">导出</el-button>
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
          :columns="tableColumn"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="tableData"
          :export-config="{}"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
          <template #doorAuthNames="{row}">
            <el-tag effect="plain" size="mini" type="info" v-if="row.door1Name">{{row.door1Name}}</el-tag>
            <el-tag effect="plain" size="mini" type="info" style="margin: 0 3px;" v-if="row.door2Name" >{{row.door2Name}}</el-tag>
            <el-tag effect="plain" size="mini" type="info" v-if="row.door3Name" >{{row.door3Name}}</el-tag>
            <el-tag effect="plain" size="mini" type="info" style="margin-left: 3px;" v-if="row.door4Name" >{{row.door4Name}}</el-tag>
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
  import {getList} from "@/api/visitor/eventlist.js";
  import {eventStateTrans} from "@/util/trans";
  import devZtree from "@/components/devztree/index.vue"

  export default{
    components:{devZtree},
    data(){
      return{
        moreParamQuery:"",
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
        eventSourceTypeList:[
          {value:0,label:'手动下载'},
          {value:1,label:'账户启用'},
          {value:2,label:'账户停用'},
          {value:3,label:'发卡'},
          {value:4,label:'挂失'},
          {value:5,label:'解挂'},
          {value:6,label:'报损'},
          {value:7,label:'退卡'},
          {value:8,label:'补卡'},
        ],
        ancestors:"",
        statusList:[
          {value:0,label:"未执行"},
          {value:1,label:"执行中"},
          {value:2,label:"失败"},
          {value:3,label:"成功"}
        ],
        devExecuteState:0,
        createTime:"",
        devExecuteTime:""
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-124;
      this.tableHeight=window.innerHeight-273;
      let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
      let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      this.createTime = [start,end]
      this.search()
    },
    methods:{
      search(){
        this.page.currentPage = 1
        this.selectionList = []
        this.onLoad()
      },
      onLoad(){
        let params = {}
        this.loading = true;
        if(this.moreParamQuery){
          params["moreParamQuery"] = this.moreParamQuery.trim();
        }
        if(this.createTime){
          params["startCreateTime"] = this.createTime[0]
          params["endCreateTime"] = this.createTime[1]
        }
        if(this.devExecuteTime){
          params["startDevExecuteTime"] = this.devExecuteTime[0]
          params["endDevExecuteTime"] = this.devExecuteTime[1]
        }
        params['devExecuteState'] = this.devExecuteState;
        params['ancestors'] = this.ancestors;
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        getList(params).then(res=>{
          const data = res.data.data;
          this.page.total = data.total;
          let records = data.records;
          records.forEach(v=>{
            v.devExecuteState = eventStateTrans(v.devExecuteState)
            if(v.executeState == 0){
              v.executeState = "未执行"
            }else if(v.executeState == 1){
              v.executeState = "执行中"
            }else if(v.executeState == 2){
              v.executeState = "已失败"
            }else if(v.executeState == 3){
              v.executeState = "已成功"
            }
            if(v.eventType == 'CARD_AUTH_CREATE' || v.eventType == 'FACE_AUTH_CREATE'){
              v.eventType = "增加权限"
            }
            if(v.eventType == 'FACE_AUTH_DELETE' || v.eventType == 'CARD_AUTH_DELETE'){
              v.eventType = "删除权限"
            }
          })
          this.tableData = records;
          this.loading = false;
        })
      },
      searchReset() {
        this.page.currentPage = 1
        this.moreParamQuery = "";
        this.ancestors = "";
        let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
        let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
        this.createTime = [start,end]
        this.devExecuteTime = ""
        this.devExecuteState = ""
        this.search();
        this.$refs.devZtreeRef.initEquipmentTreeData();
      },
      handleExport() {
        this.$confirm("是否导出事件查询数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let startCreateTime = "",endCreateTime="",startDevExecuteTime="",endDevExecuteTime = "";
          if(this.createTime){
            startCreateTime = this.createTime[0]
            endCreateTime = this.createTime[1]
          }
          if(this.devExecuteTime){
            startDevExecuteTime = this.devExecuteTime[0]
            endDevExecuteTime = this.devExecuteTime[1]
          }
          window.open(`/api/iot-visitor/event/list/export?${this.website.tokenHeader}=${getToken()}&moreParamQuery=${this.moreParamQuery.trim()}&ids=${this.ids}&devExecuteState=${this.devExecuteState}&startCreateTime=${startCreateTime}&endCreateTime=${endCreateTime}&startDevExecuteTime=${startDevExecuteTime}&endDevExecuteTime=${endDevExecuteTime}&ancestors=${this.ancestors}&size=${this.page.pageSize}&current=${this.page.currentPage}`);
        });
      },
      devTreeClick(treeNode){
        let arr = []
        treeNode.forEach(v => {
          if(v.valueStr.startsWith('D') || v.valueStr.startsWith('E')){
            arr.push(v.valueStr)
          }
        })
        this.ancestors = arr.join(',');
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
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      tableColumn(){
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
            minWidth:140,
            slots:{default:'doorAuthNames'}
          },
          {
            title: "创建时间",
            field: "createTime",
            sortable:true,
            minWidth:140,
          },
          {
            title: "事件类型",
            field: "eventType",
            sortable:true,
            minWidth:100,
          },
          {
            title: "有效期",
            field: "vaildDate",
            sortable:true,
            minWidth:140,
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
          },
          {
            title: "设备执行状态",
            field: "devExecuteState",
            sortable:true,
            minWidth:110,
          },
          {
            title: "设备执行结果",
            field: "devExecuteRes",
            sortable:true,
            minWidth:150,
          },
          {
            title: "执行次数",
            field: "executeCount",
            sortable:true,
            minWidth:100,
          },
          {
            title: "身份证号",
            field: "visitorCertificateCode",
            sortable:true,
            minWidth:140,
          },
          {
            title: "手机号码",
            field: "visitorPhone",
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
