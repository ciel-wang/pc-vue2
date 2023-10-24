<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <basic-container style="padding: 0 !important;">
        <div style="overflow: auto;" :style="{height:ztreeHeight+'px'}">
          <account-ztree v-show="radio == 1" ref="accountZtreeRef" :isCheck="true" @onCheck="onCheckDept"></account-ztree>
          <dept-ztree v-show="radio == 2" ref="deptZtreeRef" :isCheck="true" @onCheck="onCheckDept"></dept-ztree>
          <gradeclass-ztree v-show="radio == 3" ref="gradeclassZtreeRef" :isCheck="true" @onCheck="onCheckDept"></gradeclass-ztree>
        </div>
      </basic-container>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container style="padding: 0 0 0 6px !important;">
        <div>
          <el-input
            v-show="radio == 1"
            size="mini"
            style="width: 200px;margin-right: 10px;"
            v-model="moreQueryParam"
            clearable
            placeholder="请输入学工号/姓名"
            @keyup.enter.native="search"></el-input>
          <el-select
            size="mini" clearable
            v-show="radio == 1"
            style="margin-right:10px;width: 160px;"
            v-model="empCategory"
            placeholder="请选择人员分类">
            <el-option v-for="item in userCategoryDict" :key="item.dictKey" :label="item.dictValue" :value="item.dictKey"></el-option>
          </el-select>
          <el-input
            v-show="radio == 2"
            size="mini"
            style="width: 200px;margin-right: 10px;"
            v-model="deptNameOrNo"
            clearable
            placeholder="请输入部门名称"
            @keyup.enter.native="search"></el-input>
          <el-input
            v-show="radio == 3"
            size="mini"
            style="width: 200px;margin-right: 10px;"
            v-model="moreParamQuery"
            clearable
            placeholder="请输入年/班级名称"
            @keyup.enter.native="search"></el-input>
          <el-button type="primary" size="mini" icon="el-icon-search" @click="search">搜索</el-button>
          <el-button type="default" size="mini" icon="el-icon-refresh" @click="reset">重置</el-button>
          <el-button type="primary" size="mini" @click="handleQuerySearch">粘贴查询</el-button>
        </div>
        <div style="margin: 8px 0;">
          <el-radio-group v-model="radio" @change="radioChange">
            <el-radio label="1">按个人</el-radio>
            <el-radio label="2">按部门</el-radio>
            <el-radio label="3">按年/班级</el-radio>
          </el-radio-group>
        </div>
        <vxe-grid
          v-show="radio == 1"
          border
          resizable
          highlight-hover-row
          auto-resize
          :sync-resize="radio"
          :height="tableHeight"
          ref="empCrud"
          size="mini"
          align="center"
          :columns="empOptions"
          :data="empData"
          :loading="empLoading"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
        </vxe-grid>
        <vxe-grid
          v-show="radio == 2"
          border
          resizable
          auto-resize
          :sync-resize="radio"
          :height="tableHeight"
          ref="deptCrud"
          size="mini"
          align="center"
          :columns="deptOptions"
          :data="deptData"
          :loading="empLoading"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
        </vxe-grid>
        <vxe-grid
          v-show="radio == 3"
          border
          resizable
          auto-resize
          :sync-resize="radio"
          :height="tableHeight"
          ref="gradeclassCrud"
          size="mini"
          align="center"
          :columns="gradeclassOptions"
          :data="gradeclassData"
          :loading="empLoading"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
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

        <pasteSearch ref="pasteSearchRef" @getQuery="getQuery"></pasteSearch>
      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
  import { getAreaEquipmentTree,getList,authDown,deptGetList} from "@/api/iot/access/icauth";
  import { getEventGradeclassList } from "@/api/xf/event.js"
  import {mapGetters} from "vuex";
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  import accountZtree from "@/components/account-ztree/index.vue"
  import deptZtree from "@/components/dept-ztree/index.vue"
  import gradeclassZtree from "@/components/gradeclass-ztree/index.vue"
  import pasteSearch from '@/components/paste-search.vue'
  import { getDictCode } from "@/api/iot/teacher.js"

  export default{
    components:{accountZtree,deptZtree,gradeclassZtree,pasteSearch},
    data(){
      return{
        moreQueryParam:'',
        deptNameOrNo:"",
        empSearch:'',
        empLoading:false,
        empData:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        tableHeight:0,
        ztreeHeight:0,
        radio:'1',
        deptData:[],
        ancestors:'',
        gradeclassData:[],
        moreParamQuery:"",
        queryFieldContent:"",
        queryFieldType:"",
        empCategory: '',
        userCategoryDict: [],
      }
    },
    mounted(){
      this.tableHeight=window.innerHeight-406;
      this.ztreeHeight=window.innerHeight-263;
      getDictCode({keys:"studentCategory#userCategory"}).then(r => {
        let d = r.data.data
        d.studentCategory.forEach(v => {
          v.dictValue = v.dictValue + ' (学生)'
        })
        d.userCategory.forEach(v => {
          v.dictValue = v.dictValue + ' (教师)'
        })
        this.userCategoryDict = [...d.studentCategory,...d.userCategory]
      })
      this.onLoad(this.page);
    },
    methods: {
      getQuery(queryFieldType,queryFieldContent){
        this.queryFieldContent = queryFieldContent;
        this.queryFieldType = queryFieldType;
        this.search();
      },
      handleQuerySearch(){
        this.$refs.pasteSearchRef.openDialog();
      },
      radioChange(v){
        this.$refs.accountZtreeRef.getAccountZtreeInit();
        this.$refs.deptZtreeRef.getDeptZtreeInit();
        this.$refs.gradeclassZtreeRef.getGradeclassZtreeInit();
        this.ancestors = ""
        this.page.pageSize = 50;
        this.page.currentPage = 1;
        this.page.total = 0;
        this.radio = v;
        this.onLoad(this.page);
      },
      onCheckDept(treeNode){
        let arr = treeNode;
        let ids = ""
        for(var i=0;i<arr.length;i++){
          if(this.radio != 3){
            if(arr[i].valueStr.startsWith('DEPT') || arr[i].valueStr.startsWith('GS-1')){
              ids = ids + arr[i].valueStr + ','
            }
          }else{
            if(arr[i].valueStr.startsWith("GS")){
              let arr1 = arr[i].valueStr.split('-')
              ids = ids + arr1.slice(-1)[0] + ',';
            }
          }
        }
        if(ids.length > 0){
          ids = ids.substring(0,ids.length-1)
        }else{
          ids = "";
        }
        this.ancestors = ids;
        this.onLoad(this.page);
      },
      onLoad(page, params = {}){
        params["type"] = 1;//区分ic还是ai
        this.empLoading = true;
        params['queryFieldContent'] = this.queryFieldContent;
        params['queryFieldType'] = this.queryFieldType;
        if(this.radio == 1){
          params['moreQueryParam'] = this.moreQueryParam.trim();
          params["ancestors"] = this.ancestors;
          params['empCategory'] = this.empCategory;
          getList(this.page.currentPage, this.page.pageSize, Object.assign(params, this.query)).then(res=>{
            this.deptData = [];
            this.gradeclassData = [];
            const data = res.data.data;
            this.page.total = data.total;
            data.records.forEach(v => {
              if(v.cardType == 1){
                  v.cardType = '一类卡'
              }
              if(v.cardType == 2){
                  v.cardType = '二类卡'
              }
              if(v.cardType == 3){
                  v.cardType = '三类卡'
              }
              if(v.cardType == 4){
                  v.cardType = '四类卡'
              }
              if(v.cardType == 5){
                  v.cardType = '五类卡'
              }
              if(v.cardType == 6){
                  v.cardType = '六类卡'
              }
              if(v.className){
                v.deptName = v.className;
              }
            })
            this.empData = data.records;
            this.$refs.empCrud.clearCheckboxRow();
            this.empLoading = false;
          })
        }else if(this.radio == 2){
          params["deptNameOrNo"] = this.deptNameOrNo.trim();
          params["ancestors"] = this.ancestors;
          deptGetList(this.page.currentPage, this.page.pageSize,Object.assign(params, this.query)).then(res => {
            this.empData = [];
            this.gradeclassData = [];
            let data = res.data.data;
            this.page.total = data.total;
            this.deptData = data.records;
            this.empLoading = false;
            this.$nextTick(()=>{
              this.$refs.deptCrud.clearCheckboxRow();
            })
          })
        }else{
          params['moreParamQuery'] = this.moreParamQuery.trim()
          params['size'] = this.page.pageSize
          params['current'] = this.page.currentPage;
          params['ids'] = this.ancestors;
          getEventGradeclassList(params).then(res => {
            this.empData = []
            this.deptData = []
            const data = res.data.data;
            this.page.total = data.total;
            this.gradeclassData = data.records;
            this.empLoading = false;
            this.$nextTick(()=>{
              this.$refs.gradeclassCrud.clearCheckboxRow();
            })
          })
        }
      },
      search(){
        this.page.currentPage = 1
        this.onLoad(this.page);
      },
      reset(){
        this.$refs.accountZtreeRef.getAccountZtreeInit();
        this.$refs.deptZtreeRef.getDeptZtreeInit();
        this.$refs.gradeclassZtreeRef.getGradeclassZtreeInit();
        this.moreQueryParam = "";
        this.deptNameOrNo = "";
        this.moreParamQuery = "";
        this.ancestors = "";
        this.queryFieldContent = "";
        this.queryFieldType = "";
        this.empCategory = "";
        this.onLoad(this.page);
      },
      selectionChange({records}){
        this.$emit("changeTreeData",records)
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
    computed: {
      ...mapGetters(["colorName"]),
      empOptions(){
        return [
          { type: 'checkbox', width: 60},
          {
            title: "学工号",
            field: "empCode",
            sortable:true,
            minWidth:100,
          },
          {
            title: "姓名",
            field: "empName",
            sortable:true,
            minWidth:100,
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
          {
            title: "人员分类",
            field: "empCategoryStr",
            sortable:true,
            minWidth:100,
          },
          {
            title: "物理卡号",
            field: "physicalCardNum",
            sortable:true,
            minWidth:100,
          },
          {
            title: "卡片状态",
            field: "cardState",
            sortable:true,
            minWidth:100,
          },
          {
            title: "卡片类型",
            field: "cardType",
            sortable:true,
            minWidth:100,
          },
        ]
      },
      deptOptions(){
        return [
          { type: 'checkbox', width: 60},
          {
            title: "部门名称",
            field: "deptName",
            sortable:true,
            minWidth:140,
          },
          {
            title: "学校名称",
            field: "schoolName",
            sortable:true,
            minWidth:140,
          },
          {
            title: "总人数",
            field: "allEmpCount",
            sortable:true,
            minWidth:140,
          },
          {
            title: "实际上传人数",
            field: "usableEmpCount",
            sortable:true,
            minWidth:140,
          }
        ]
      },
      gradeclassOptions(){
        return [
          { type: 'checkbox', width: 60},
          {
            title: "年/班级名称",
            field: "gcName",
            sortable:true,
            minWidth:100,
          },{
            title: "学校名称",
            field: "schoolName",
            sortable:true,
            minWidth:140,
          },
          {
            title: "总人数",
            field: "totalCount",
            sortable:true,
            minWidth:140,
          },
          {
            title: "实际上传人数",
            field: "realCount",
            sortable:true,
            minWidth:140,
          }
        ]
      }
    },
  }
</script>

<style scoped="">
  >>>.el-radio{
    margin-right: 10px;
  }
  >>>.el-card__body{
    padding: 20px 20px 0 !important;
  }
  .right_arw_icn{
    left: 6px !important;
  }
</style>
