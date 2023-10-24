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
            <dev-ztree ref="devZtreeRef" @onCheck="devTreeClick" :isCheck="true"></dev-ztree>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div>
          <el-input
            style="width: 150px;"
            size="small" clearable
            @keyup.enter.native="search"
            v-model="moreParamQuery"
            placeholder="请输入学工号/姓名"></el-input>
          <el-date-picker
            v-model="date"
            size="small"
            :clearable="false"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00','23:59:59']"
            style="width: 330px;margin: 0 10px;"></el-date-picker>
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
          :columns="tableColumn"
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
                       v-if="permission.access_controller_drecord_export_btn"
                       @click="handleExport">导出
            </el-button>
          </template>
          <template #inOutWay="{row}">
            <img
              v-if="isDevAi(row.devType) && row.empFaceurl"
              width="30px" height="30px"
              :src="row.empFaceurl + '?' + new Date().getTime()"
              @click="openPreview(row.empFaceurl + '?' + new Date().getTime())" />
            <div v-else>{{ row.cardNum }}</div>
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
  import accountZtree from "@/components/account-ztree/index.vue"
  import devZtree from "@/components/devztree/index.vue"
  import { getList, mjDataExport } from "@/api/iot/access/drecord";
  import {userStatusTrans,cardTypeTrans,documentTypeTrans,eventStateTrans} from "@/util/trans";
  import moment from "moment"
  import { isDevAi } from '@/util/trans.js'
  export default{
    components:{accountZtree, devZtree},
    data(){
      return{
        moreParamQuery:"",
        tableHeight:0,
        ztreeHeight:0,
        loading:false,
        eventData:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        selectionList:[],
        date:[],
        devAncestors:'',
        ancestors:'',
        currEquipmentId:'',
        currAreaId:""
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-187;
      this.tableHeight=window.innerHeight-254;
      let monthLastDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      let monthStartDay = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.date = [monthStartDay, monthLastDay];
      this.search()
    },
    methods:{
      isDevAi,
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
        if(this.moreParamQuery){
          params["moreParamQuery"] = this.moreParamQuery.trim();
        }
        if(this.date){
          params["startTime"] = this.date[0];
          params["endTime"] = this.date[1];
        }
        params["devAreaId"] = this.currAreaId;
        params["devId"] = this.currEquipmentId;
        params['ancestors'] = this.ancestors;
        params['devAncestors'] = this.devAncestors;
        getList(params).then(res=>{
          const data = res.data.data;
          this.page.total = data.total;
          let records = data.records;
          records.forEach(e=>{
            e.executeState = eventStateTrans(e.executeState)
            e.equipmentExecuteState = eventStateTrans(e.equipmentExecuteState)
            e.empState = userStatusTrans(e.empState)
            e.cardType  = cardTypeTrans(e.cardType)
            if(e.empType == 1){
              e.deptName = e.gradeName + e.className
            }
            e.checked = false
          })
          this.eventData = records;
          this.$forceUpdate()
          this.loading = false;
        })
      },
      searchReset() {
        this.currAreaId = '';
        this.currEquipmentId = ""
        this.ancestors = ""
        this.devAncestors = ''
        this.moreParamQuery = "";
        let monthLastDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        let monthStartDay = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
        this.date = [monthStartDay, monthLastDay];
        this.search();
        this.$refs.accountZtreeRef.getAccountZtreeInit();
        this.$refs.devZtreeRef.initEquipmentTreeData();
      },
      accountztreeClick(treeNode){
        this.ancestors = treeNode.valueStr;
        this.search()
      },
      devTreeClick(treeNode){
        let arr = []
        treeNode.forEach(v => {
          if((v.valueStr.startsWith('D') || v.valueStr.startsWith('E') && v.check_Child_State != 1)){
            arr.push(v.valueStr)
          }
        })
        this.devAncestors = arr.join(',')
        this.search()
      },
      openPreview(url){
        let arr = [
          { thumbUrl:url, url:url },
        ];
        this.$ImagePreview(arr,0);
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
      handleExport() {
        this.$confirm("是否导出进出记录?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let startTime = '',endTime =""
          if(this.date && this.date.length){
            startTime = this.date[0];
            endTime = this.date[1];
          }
          mjDataExport({
            moreParamQuery:this.moreParamQuery.trim(),
            devAreaId:this.currAreaId,
            ids:this.ids,
            devId:this.currEquipmentId,
            ancestors:this.ancestors,
            devAncestors:this.devAncestors,
            startTime,
            endTime
          }).then(r => {
            this.$w.downLoadFile(r.data,'门禁进出记录')
          })
        });
      },
    },
    computed:{
      ...mapGetters(["userInfo", "permission"]),
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
            title: "识别时间",
            field: "swipeTime",
            sortable:true,
            minWidth:150,
          },
          {
            title: "上报时间",
            field: "createTime",
            sortable:true,
            minWidth:150,
          },
          {
            title: "上报类型",
            field: "devType",
            sortable:true,
            minWidth:100,
            visible:false,
            formatter:({ cellValue, row })=>{
              return this.isDevAi(cellValue) && row.empFaceurl ? '刷脸' : '刷卡'
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
            sortable:true,
            minWidth:100,
          },
          {
            title: "设备序列号",
            field: "devSn",
            sortable:true,
            minWidth:100,
            visible:false
          },
          {
            title: "设备IP",
            field: "devIp",
            sortable:true,
            minWidth:120,
            visible:false
          },
          {
            title: "门区名称",
            field: "doorName",
            sortable:true,
            minWidth:100,
          },
          {
            title: "是否有权",
            field:"effectiveMsg",
            sortable:true,
            minWidth:100,
          },
          {
            title: "进出方向",
            field:"doorDirection",
            sortable:true,
            minWidth:100,
            formatter:({cellValue})=>{
              return cellValue == 1 ? '进' : '出'
            }
          },
          {
            title: "进出方式",
            field:"inOutWay",
            sortable:true,
            slots:{default:"inOutWay"},
            minWidth:140,
          },
          {
            title: '温度值(℃)',
            field: 'temperature',
            sortable: true,
            minWidth: 110,
          },
          {
            title: "部门/班级名称",
            field: "deptName",
            sortable:true,
            minWidth:140,
          },
          {
            title: "学校名称",
            field: "schoolName",
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
