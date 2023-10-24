<template>
  <el-dialog
    :title="this.sourceType == 'dorm' ? '请选择分配学生' : '请选择分配教师'"
    :visible.sync="empDialogVisible"
    width="1100px"
    top="5vh"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-row>
      <el-col :span="6">
        <el-card class="box-card" style="overflow:scroll;" :style="{ height: ztreeHeight + 'px' }">
          <gradeclass-ztree v-if="dormType == 1" ref="gradeclassZtreeRef" :isCheck="true" @onCheck="ztreeClick"></gradeclass-ztree>
          <dept-ztree v-else ref="deptZtreeRef" :isCheck="true" @onCheck="ztreeClick"></dept-ztree>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card class="box-card" style="margin-left: 10px;" :style="{ height: ztreeHeight + 'px' }">
          <div style="margin-bottom: 8px;">
            <el-input
              v-if="dormType == 1"
              size="small" clearable
              style="width: 160px;"
              @keyup.enter.native="search"
              v-model="moreParamQuery"
              placeholder="请输入学号/姓名"></el-input>
            <el-input
              v-else
              size="small" clearable
              @keyup.enter.native="search"
              style="width: 160px;"
              v-model="moreParamQuery"
              placeholder="请输入工号/姓名"></el-input>
            <el-select size="small" clearable v-model="empSex" placeholder="请选择性别" style="width: 150px;margin: 0 10px;">
              <el-option
                v-for="item in empSexDic"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
            <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
            <el-button type="primary" size="small" icon="el-icon-check" @click="empSubmit">提交</el-button>
          </div>
          <vxe-grid
            border
            resizable
            :height="tableHeight"
            ref="empCrud"
            size="mini"
            align="center"
            :columns="empOptions"
            :data="empData"
            :loading="loading"
            @checkbox-change="selectionChange"
            @checkbox-all="selectionChange"
            style="margin-top: 6px;"
          ></vxe-grid>
          <div class="page_class">
            <el-pagination
              @size-change="handleSizeChange2"
              @current-change="handleCurrentChange2"
              :current-page="empPage.currentPage"
              :page-sizes="[50, 100, 200, 500, 1000]"
              :page-size="empPage.pageSize"
              :background="true"
              :pagerCount="3"
              layout="total,sizes,pager,prev, next"
              :total="empPage.total"
              :hide-on-single-page="false"
            ></el-pagination>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { getSelectEmpList } from '@/api/dorm/dorm_checkin.js';
import gradeclassZtree from "@/components/gradeclass-ztree/index.vue"
import deptZtree from '@/components/dept-ztree/index.vue'
export default {
  props:{
    dormType:{
      type:Number,
      default:1
    }
  },
  components:{gradeclassZtree,deptZtree},
  data() {
    return {
      empDialogVisible: false,
      ztreeHeight: 0,
      tableHeight: 0,
      empData: [],
      loading: false,
      empPage: {
        pageSize: 50,
        currentPage: 1,
        total: 0
      },
      moreParamQuery: '',
      ancestors: '',
      selectionList: [],
      empSexDic:[
        {value:1,label:'男'},{value:2,label:"女"}
      ],
      empSex:"",
      sourceType:''
    };
  },
  mounted() {
    this.ztreeHeight = window.innerHeight - 246;
    this.tableHeight = window.innerHeight - 400;
  },
  methods: {
    openDialog(val) {
      this.sourceType = val;
      this.empDialogVisible = true;
      this.search();
    },
    empSubmit() {
      if (this.selectionList.length != 1) {
        this.$message.error('请选择一条数据');
        return;
      }
      this.$emit('getEmpInfo', this.selectionList);
      this.searchReset();
      this.empDialogVisible = false;
    },
    search(){
      this.empPage.currentPage = 1
      this.onLoad()
    },
    onLoad() {
      this.loading = true;
      let params = {};
      params['size'] = this.empPage.pageSize;
      params['current'] = this.empPage.currentPage;
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery.trim();
      }
      params['ancestors'] = this.ancestors;
      params['empSex'] = this.empSex;
      params['sourceType'] = 'NOUSEDORM'
      params['empType'] = this.dormType
      getSelectEmpList(params).then(res => {
        this.loading = false;
        if (res.data.code == 200) {
          let d = res.data.data;
          this.empPage.total = d.total;
          this.empData = d.records;
        }
      });
    },
    searchReset() {
      this.moreParamQuery = '';
      this.ancestors = '';
      this.selectionList = [];
      if(this.dormType == 1){
        this.$refs.gradeclassZtreeRef.getGradeclassZtreeInit();
      }else{
        this.$refs.deptZtreeRef.getDeptZtreeInit();
      }
      this.search();
    },
    ztreeClick(treeNode){
      let arr = []
      treeNode.forEach(v => {
        arr.push(v.valueStr)
      })
      this.ancestors = arr.join(',');
      this.search();
    },
    handleSizeChange2(val) {
      this.empPage.currentPage = 1;
      this.empPage.pageSize = val;
      this.onLoad();
    },
    handleCurrentChange2(val) {
      this.empPage.currentPage = val;
      this.onLoad();
    },
    selectionChange({ records }) {
      this.selectionList = records;
    },
    handleClose() {
      this.searchReset();
      this.empDialogVisible = false;
    }
  },
  computed: {
    empOptions() {
      return [
        { type: 'checkbox', width: 60 },
        {
          title: this.dormType == 1 ? '学号' : '工号',
          field: 'empCode',
          minWidth: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          minWidth: 100
        },
        {
          title: '性别',
          field: 'empSex',
          minWidth: 100,
          formatter:({cellValue}) => {
            return cellValue == 1 ? '男' : '女'
          }
        },
        {
          title: '年/班级名称',
          field: 'className',
          minWidth: 100,
          visible:this.dormType == 1 ? true : false
        },
        {
          title:"部门名称",
          field:"deptName",
          minWidth:100,
          visible:this.dormType == 2 ? true : false
        },
        {
          title: '学校名称',
          field: 'schoolName',
          minWidth: 100
        }
      ];
    }
  }
};
</script>

<style scoped>
>>> .el-dialog__body {
  padding: 10px;
}
>>> .el-card.is-always-shadow {
  border: 1px solid #ebeef5 !important;
}
</style>
