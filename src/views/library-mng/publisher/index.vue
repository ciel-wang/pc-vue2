<template>
  <basicContainer>
    <div>
      <el-input
        size="small"
        style="width: 200px;margin-right: 10px;"
        clearable
        @keyup.enter.native="search"
        v-model.trim="publisherName"
        placeholder="请输入单位名称">
      </el-input>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-search"
        @click="search">
        搜索</el-button>
      <el-button
        type="default"
        size="small"
        icon="el-icon-refresh"
        @click="searchReset">
        重置</el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="handleAdd"
        v-if="permission.library_publisher_add_btn">
        添加</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-edit"
        @click="handleEdit"
        v-if="permission.library_publisher_edit_btn">
        编辑</el-button>
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        @click="handleDelete"
        v-if="permission.library_publisher_del_btn"
        >删除</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-upload2"
        @click="handleImportInfo"
        v-if="permission.library_publisher_import_btn"
        >导入</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-download"
        @click="handleExport"
        v-if="permission.library_publisher_export_btn"
        >导出</el-button>
    </div>
    <vxe-table
      border
      resizable
      ref="xGrid"
      size="mini"
      auto-resize
      highlight-hover-row
      align="center"
      :height="tableHeight"
      :loading="loading"
      :export-config="{}"
      :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
      :data="tableData"
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent">
      <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
      <vxe-table-column title="序号" type="seq" width="70"></vxe-table-column>
      <vxe-table-column title="单位名称" minWidth="100" field="publisherName"></vxe-table-column>
      <vxe-table-column title="输入码" minWidth="100" field="publisherNameCode"></vxe-table-column>
      <vxe-table-column title="单位ISBN" minWidth="100" field="publisherIsbn"></vxe-table-column>
      <vxe-table-column title="出版地" minWidth="100" field="publisherAddr"></vxe-table-column>
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
        :hide-on-single-page="false">
      </el-pagination>
    </div>

    <el-drawer
      :title="dialogTitle"
      size="480px"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      append-to-body
      :modal-append-to-body="true"
      :wrapperClosable="false"
      :close-on-press-escape="false">
      <avue-form
        ref="formRef"
        :option="addEditOption"
        v-model="form"
        @submit="submit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-drawer>

    <importInfo ref="importInfoRef" @refeshPage="search"></importInfo>
  </basicContainer>
</template>

<script>
  import {mapGetters} from 'vuex';
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  import ChinesePY from '@/util/ChinesePY.js'
  import importInfo from '@/views/iot/components/teacher-import-info.vue'
  import { getPublisherList, addPublisher, updatePublisher, removePublisher, getPublisherDetails } from '@/api/library-mng/publisher.js'

  export default{
    components:{ importInfo },
    data(){
      return{
        publisherName:"",
        loading:false,
        tableData:[],
        selectionList:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        dialogTitle:"添加",
        dialogVisible:false,
        form:{},
        btnType:"add"
      }
    },
    mounted() {
      this.search()
    },
    methods:{
      submit(form,done){
        if(this.btnType === "add"){
          addPublisher(form).then(r => {
            done();
            if(r.data.code  === 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.search()
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch(() => done())
        }else{
          updatePublisher(form).then(r => {
            done();
            if(r.data.code  === 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.search()
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch(() => done())
        }
      },
      handleClose(){
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
      handleAdd(){
        this.btnType = "add";
        this.dialogTitle = "添加"
        this.dialogVisible = true;
      },
      handleEdit(){
        if ( this.selectionList.length !== 1) return this.$message.warning("请选择一条数据");
        this.btnType = "edit";
        this.dialogTitle = "编辑"
        getPublisherDetails({id:this.selectionList[0].id}).then(r => {
          if(r.data.code === 200){
            this.form = r.data.data;
            this.dialogVisible = true;
          }
        })
      },
      handleDelete(){
        if ( this.selectionList.length == 0) return this.$message.warning("请选择要删除的数据");
        this.$confirm("确定要删除选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return removePublisher({ids:this.ids.split(',')});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }
        })
      },
      search(){
        this.page.currentPage = 1;
        this.selectionList = [];
        this.onLoad();
      },
      searchReset(){
        this.publisherName = "";
        this.search();
      },
      onLoad(){
        let params = {}
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['publisherName'] = this.publisherName;
        this.loading = true;
        getPublisherList(params).then(r => {
          this.loading = false;
          if(r.data.code === 200){
            let d = r.data.data;
            this.page.total = d.total;
            this.tableData = d.records;
          }
        }).catch(() => this.loading = false)
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
      handleImportInfo(){
        this.$refs.importInfoRef.openDialog('publisher');
      },
      handleExport(){
        this.$confirm("是否导出出版单位?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-library/publisher-unit/list/export?${website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&publisherName=${this.publisherName}`
          );
        });
      },
    },
    computed:{
      ...mapGetters(['permission']),
      ids() {
        let ids = this.selectionList.map(v => v.id);
        return ids.join(",");
      },
      tableHeight(){
        return window.innerHeight-236-77;
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          labelWidth:130,
          column:[
            {
              label:"出版单位名称",
              prop:"publisherName",
              rules:[{
                required:true,
                message:"请输入出版单位名称",
                trigger:"blur"
              }],
              span:24,
              maxlength:20,
              change:({value})=>{
                let that = this;
                if(value){
                  that.form.publisherNameCode = ChinesePY.GetJP(value).toUpperCase();
                }
              }
            },
            {
              label:"输入码",
              prop:"publisherNameCode",
              rules:[{
                required:true,
                message:"请输入输入码",
                trigger:"blur"
              }],
              span:24,
              maxlength:99
            },
            {
              label:"出版单位ISBN",
              prop:"publisherIsbn",
              rules:[{
                required:true,
                message:"请输入出版单位ISBN",
                trigger:"blur"
              }],
              span:24,
              maxlength:20
            },
            {
              label:"出版地",
              prop:"publisherAddr",
              rules:[{
                required:true,
                message:"请输入出版地",
                trigger:"blur"
              }],
              span:24,
              maxlength:20
            }
          ]
        }
      }
    }
  }
</script>

<style>
</style>
