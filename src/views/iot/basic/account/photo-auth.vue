<template>
  <div>
    <el-dialog
      title="照片审核"
      :visible.sync="dialogVisible"
      :modal-append-to-body="true"
      width="1100px"
      top="5vh"
      :lock-scroll="true"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :append-to-body="true">
      <div style="margin-bottom: 8px;">
        <el-input
          placeholder="输入学工号/姓名"
          @keyup.enter.native="search"
          v-model.trim="moreParamQuery"
          size="small" clearable
          style="width: 150px;margin-right: 10px;"
        ></el-input>
        <el-select
          size="small" clearable
          v-model="StateStr"
          placeholder="请选择审核状态"
          style="width: 150px;margin-right: 10px;">
          <el-option v-for="item in StateList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-select size="small" clearable v-model="verifyState" placeholder="请选择校验状态" style="width: 150px;margin-right: 10px;">
          <el-option label="待验证" value="1"></el-option>
          <el-option label="验证中" value="2"></el-option>
          <el-option label="验证成功" value="3"></el-option>
          <el-option label="验证失败" value="4"></el-option>
          <el-option label="验证中断" value="5"></el-option>
        </el-select>
        <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
        <el-button type="primary" size="small" icon="el-icon-check" @click="agree">同意</el-button>
        <el-button type="danger" size="small" @click="reject">拒绝</el-button>
      </div>
      <vxe-grid
        border
        resizable
        auto-resize
        highlight-hover-row
        height="600"
        ref="crud"
        size="mini"
        align="center"
        :highlight="true"
        :columns="tableColumn"
        :loading="loading"
        :data="tableData"
        @checkbox-change="checkboxChangeEvent"
        @checkbox-all="checkboxChangeEvent">
        <template #afterFaceUrl="{ row }">
          <img 
            :src="row.staticPrefix + row.afterFaceUrl+'?time='+ new Date().getTime()" 
            v-if="row.afterFaceUrl" 
            width="30px" height="30px" 
            @click="openPreview(row.staticPrefix + row.afterFaceUrl+'?time='+ new Date().getTime())" />
        </template>

        <template #beforeFaceUrl="{ row }">
          <img 
            :src="row.staticPrefix + row.beforeFaceUrl+'?time='+ new Date().getTime()" 
            v-if="row.beforeFaceUrl" 
            width="30px" height="30px"  
            @click="openPreview(row.staticPrefix + row.beforeFaceUrl+'?time='+ new Date().getTime())" />
        </template>

        <template #auditStatus="{row}">
          <el-tag effect="dark" size="mini" type="warning" v-if="row.auditStatus == 0">待审批</el-tag>
          <el-tag effect="dark" size="mini" v-if="row.auditStatus == 1">已同意</el-tag>
          <el-tag effect="dark" size="mini" type="danger" v-if="row.auditStatus == 2">已拒绝</el-tag>
        </template>
        <template #verifyState="{row}">
          <el-tag size="mini" type="warning" v-if="row.verifyState == 1">待验证</el-tag>
          <el-tag size="mini" v-if="row.verifyState == 2">验证中</el-tag>
          <el-tag size="mini" type="success" v-if="row.verifyState == 3">验证成功</el-tag>
          <el-tag size="mini" type="danger" v-if="row.verifyState == 4">验证失败</el-tag>
          <el-tag size="mini" type="info" v-if="row.verifyState == 5">验证中断</el-tag>
        </template>
      </vxe-grid>
      <div class="page_class">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page.currentPage"
          :page-sizes="[20, 50, 100, 500,1000]"
          :page-size="page.pageSize"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="page.total"
          :hide-on-single-page="false">
        </el-pagination>
      </div>
    </el-dialog>

    <el-dialog
      title="拒绝"
      :visible.sync="rejectDialogVisible"
      width="31%"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form
        ref="rejectFormRef"
        :option="rejectOption"
        v-model="rejectForm"
        @submit="rejectSubmit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="rejectDialogVisible = false" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </div>
</template>

<script>
  import { getPhotoList,agreePhotoAuth,rejectPhotoAuth } from '@/api/iot/account.js'

  export default{
    data(){
      return{
        dialogVisible:false,
        moreParamQuery:"",
        StateStr:"",
        StateList:[
          {value:0,label:"待审批"},{value:1,label:"已同意"},{value:2,label:"已拒绝"}
        ],
        verifyState:"",
        selectionList:[],
        loading:false,
        tableData:[],
        page:{
          pageSize:20,
          currentPage:1,
          total:0
        },
        rejectDialogVisible:false,
        rejectForm:{},
      }
    },
    mounted() {
      this.search()
    },
    methods:{
      openDialog(){
        this.dialogVisible = true;
        this.moreParamQuery = "";
        this.selectionList = [];
        this.onLoad()
      },
      agree(){
        if(this.selectionList.length == 0){
          this.$message.warning('请选择至少一条数据')
          return;
        }
        let flag = this.selectionList.some(v => v.auditStatus != 0)
        if(flag){
          this.$message.warning("请选择待审批状态的数据")
          return;
        }
        agreePhotoAuth({ids:this.ids}).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.onLoad()
            this.$emit('refeshPage')
            this.dialogVisible = false;
          }else{
            this.$message.error(r.data.msg)
          }
        })
      },
      reject(){
        if(this.selectionList.length == 0){
          this.$message.warning('请选择至少一条数据')
          return;
        }
        let flag = this.selectionList.some(v => v.auditStatus != 0)
        if(flag){
          this.$message.warning("请选择待审批状态的数据")
          return;
        }
        this.rejectDialogVisible = true;
        this.rejectForm.rejectCause = "";
      },
      rejectSubmit(form,done){
        rejectPhotoAuth({ids:this.ids,rejectCause:form.rejectCause}).then(r => {
          done()
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.onLoad()
            this.rejectDialogVisible = false
          }else{
            this.$message.error(r.data.msg)
          }
        }).catch(() => {
          done()
        })
      },
      onLoad(){
        let params = {}
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['moreParamQuery'] = this.moreParamQuery;
        params['auditStatus'] = this.StateStr;
        params['verifyState'] = this.verifyState;
        this.loading = true;
        getPhotoList(params).then(r => {
          this.loading = false;
          if(r.data.code == 200){
            let d = r.data.data;
            this.page.total = d.total;
            this.tableData = d.records;
          }
        }).catch(() => {
          this.loading = false;
        })
      },
      search(){
        this.selectionList = []
        this.page.currentPage = 1;
        this.onLoad()
      },
      searchReset(){
        this.moreParamQuery = "";
        this.StateStr = "";
        this.verifyState = "";
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
      openPreview(url) {
        let arr = [{ thumbUrl: url, url: url }];
        this.$ImagePreview(arr, 0);
      },
    },
    computed:{
      ids(){
        let ids = this.selectionList.map(v => v.id)
        return ids.join(',')
      },
      rejectOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"拒绝原因",
              prop:"rejectCause",
              span:24,
              rules:[{
                required:true,
                message:"请输入拒绝原因",
                trigger:"blur"
              }],
            }
          ]
        }
      },
      tableColumn(){
        return [
          { type: 'checkbox', width: 70,fixed:"left" },
          {
            title:"学工号",
            field:"empCode",
            sortable: true,
            minWidth: 100,
            fixed:"left",
          },
          {
            title:"姓名",
            field:"empName",
            sortable: true,
            minWidth: 100,
            fixed:"left",
          },
          {
            title:"更新后照片",
            field:"afterFaceUrl",
            sortable: true,
            minWidth: 100,
            slots:{default:'afterFaceUrl'}
          },
          {
            title:"更新前照片",
            field:"beforeFaceUrl",
            sortable: true,
            minWidth: 100,
            slots:{default:'beforeFaceUrl'}
          },
          {
            title: '校验状态',
            field: 'verifyState',
            sortable: true,
            minWidth: 100,
            slots: { default: 'verifyState' }
          },
          {
            title:"审核状态",
            field:"auditStatus",
            sortable: true,
            minWidth: 100,
            slots:{default:'auditStatus'}
          },
          {
            title:"审核人",
            field:"auditEmpName",
            sortable: true,
            minWidth: 100
          },
          {
            title:"审核时间",
            field:"auditTime",
            sortable: true,
            minWidth: 140
          },
          {
            title:"拒绝原因",
            field:"rejectCause",
            sortable: true,
            minWidth: 100
          }
        ]
      }
    }
  }
</script>
