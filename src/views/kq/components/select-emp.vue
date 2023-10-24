<template>
  <el-dialog
    :title="title"
    :visible.sync="empDialogVisible"
    width="1100px"
    top="3vh"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-row>
      <el-col :span="6">
        <el-card class="box-card" style="overflow:scroll;" :style="{ height: ztreeHeight + 'px' }">
          <account-ztree ref="accountZtreeRef" @click="ztreeClick" v-show="ztree == 1"></account-ztree>
          <dept-ztree @click="ztreeClick" ref="ztree" v-show="ztree != 1"></dept-ztree>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card class="box-card" style="margin-left: 10px;" :style="{ height: ztreeHeight + 'px' }">
          <el-row width="800px">
            <el-col :span="4" style="width: 150px;">
              <el-input size="small" clearable @keyup.enter.native="search" v-model.trim="moreParamQuery" placeholder="请输入学工号/姓名"></el-input>
            </el-col>
            <el-col style="margin-left:10px" span="12">
              <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
              <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
              <el-button type="primary" size="small" icon="el-icon-check" @click="empSubmit">提交</el-button>
            </el-col>
          </el-row>
          <vxe-grid
            border
            resizable
            highlight-hover-row
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
              :page-sizes="[30, 50, 100, 500,1000,3000]"
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
import { classesgroupEmplist } from '@/api/kq/classesgroup.js';
import accountZtree from "@/components/account-ztree/index.vue"
import deptZtree from "@/components/dept-ztree/index.vue"

export default {
  components:{accountZtree, deptZtree},
  data() {
    return {
      empDialogVisible: false,
      ztreeHeight: 0,
      tableHeight: 0,
      empData: [],
      loading: false,
      empPage: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      moreParamQuery: '',
      ancestors: '',
      selectionList: [],
      ztree:1,
      title:'请选择'
    };
  },
  mounted() {
    this.ztreeHeight = window.innerHeight - 146;
    this.tableHeight = window.innerHeight - 280;
  },
  methods: {
    openDialog(v) {
      if(v.ztree){
        this.ztree = v.ztree
      }
      this.empDialogVisible = true;
      this.type = v.type;
      this.isAudit = v.isAudit;
      this.search();
      if(v.type == 'adminEmp'){
        this.title = "请选择管理员"
      }else if(v.type == 'mainTain'){
        this.title = '请选择维修工'
      }else if(v.type == 'empName'){
        this.title = '请选择提交人'
      }else if(v.type == 'duplicateEmp'){
        this.title = "请选择抄送人"
      }else if(v.type == 'receiptTogether'){
        this.title = "请选择同行人"
      }else if(v.type == 'typeroleAuth'){
        this.title = "请选择单据审批人"
      }else if(v.type == 'energyNocardRecharge'){
        this.title = "请选择充值人员"
      }else{
        this.title = "请选择"
      }
    },
    empSubmit() {
      if (this.type == 'empName' && this.isAudit && this.selectionList.length != 1) {
        return this.$message.error('请选择一条数据');
      } else if(this.selectionList.length <= 0){
        return this.$message.error('请选择一条数据');
      }
      this.$emit('refreshPage', this.selectionList);
      this.searchReset();
      this.empDialogVisible = false;
    },
    search(){
      this.empPage.currentPage = 1
      this.selectionList = []
      this.onLoad()
    },
    onLoad(params = {}) {
      this.loading = true;
      params['size'] = this.empPage.pageSize;
      params['current'] = this.empPage.currentPage;
      params['moreParamQuery'] = this.moreParamQuery;
      params['ancestors'] = this.ancestors;
      if(['adminEmp','mainTain','typeroleAuth'].includes(this.type) || this.ztree != 1){
        params['empType'] = 2
      }
      if(this.type === 'energyNocardRecharge') params['accountState'] = 1;
      classesgroupEmplist(params).then(res => {
        this.loading = false;
        if (res.data.code == 200) {
          let d = res.data.data;
          this.empPage.total = d.total;
          d.records.forEach(v => {
            if(v.empType == 1) v.deptName = v.className;
          })
          this.empData = d.records;
        }
      }).catch(() => this.loading = false);
    },
    searchReset() {
      this.moreParamQuery = '';
      this.ancestors = '';
      this.selectionList = [];
      if(this.ztree == 1){
        this.$refs.accountZtreeRef.getAccountZtreeInit();
      }else{
        this.$refs.ztree.getDeptZtreeInit();
      }
      this.search();
    },
    ztreeClick(treeNode){
      this.ancestors = treeNode.valueStr;
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
          title: '学工号',
          field: 'empCode',
          minWidth: 100
        },
        {
          title: '姓名',
          field: 'empName',
          minWidth: 100
        },
        {
          title: '部门/班级名称',
          field: 'deptName',
          minWidth: 120
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
