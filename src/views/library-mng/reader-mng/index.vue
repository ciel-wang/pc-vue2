<template>
  <basicContainer>
    <div>
      <el-input
        size="small"
        style="width: 200px;margin-right: 10px;"
        clearable
        @keyup.enter.native="search"
        v-model="groupName"
        placeholder="请输入分组名称">
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
        v-if="permission.library_reader_add_btn">
        新增类别</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-edit"
        @click="handleEdit"
        v-if="permission.library_reader_edit_btn">
        编辑</el-button>
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        @click="handleDelete"
        v-if="permission.library_reader_del_btn"
        >删除</el-button>
      <el-button
        type="primary"
        size="small"
        @click="handleRange"
        v-if="permission.library_reader_range_btn">
        应用范围</el-button>
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
      :seq-config="{ startIndex: (currentPage - 1) * pageSize }"
      :data="tableData"
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent">
      <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
      <vxe-table-column title="读者类别" minWidth="100" field="groupName"></vxe-table-column>
      <vxe-table-column title="可借书数" minWidth="100" field="loanBookCount"></vxe-table-column>
      <vxe-table-column title="可借天数" minWidth="100" field="loanDayCount"></vxe-table-column>
      <vxe-table-column title="续借次数" minWidth="100" field="continueLoanCount"></vxe-table-column>
      <vxe-table-column title="续借天数" minWidth="100" field="continueLoanDayCount"></vxe-table-column>
      <vxe-table-column title="应用范围(人)" minWidth="100" field="empCount"></vxe-table-column>
      <vxe-table-column title="详情" minWidth="260" field="empNames">
        <template #default="{row}">
          <div>{{row.empCount > 10 ? row.empNames+' 等'+ row.empCount+'人' : row.empNames ? row.empNames : ''}}</div>
        </template>
      </vxe-table-column>
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

    <receiptAuditscope ref="receiptAuditscopeRef" @refreshPage="search"></receiptAuditscope>
  </basicContainer>
</template>

<script>
  import { mapGetters } from 'vuex';
  import receiptAuditscope from '@/views/kq/components/receipt-auditscope.vue';
  import { getReaderGroupList, addReaderGroup, updateReaderGroup, getReaderGroupDetails, removeReaderGroup } from '@/api/library-mng/reader-mng.js'

  export default{
    components:{ receiptAuditscope },
    data(){
      return{
        groupName:"",
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
          addReaderGroup(form).then(r => {
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
          updateReaderGroup(form).then(r => {
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
        getReaderGroupDetails({id:this.selectionList[0].id}).then(r => {
          if(r.data.code === 200){
            let form = r.data.data;
            this.form = {...form};
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
          return removeReaderGroup({ids:this.ids.split(',')});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }else{
            this.$message.error(res.data.msg);
          }
        })
      },
      handleRange(){
        if ( this.selectionList.length !== 1) return this.$message.warning("请选择一条数据");
        let id = this.selectionList[0].id;
        this.$refs['receiptAuditscopeRef'].openDialog({ type: 'readerMng', id: id });
      },
      search(){
        this.page.currentPage = 1;
        this.selectionList = [];
        this.onLoad();
      },
      searchReset(){
        this.groupName = "";
        this.search();
      },
      onLoad(){
        let params = {}
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['groupName'] = this.groupName;
        this.loading = true;
        getReaderGroupList(params).then(r => {
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
              label:"读者类别名称",
              prop:"groupName",
              rules:[{
                required:true,
                message:"请输入读者类别名称",
                trigger:"blur"
              }],
              span:24,
            },
            {
              label:"可借书数",
              prop:"loanBookCount",
              rules:[{
                required:true,
                message:"请输入可借书数",
                trigger:"blur"
              }],
              type:"number",
              precision:0,
              minRows:0,
              span:24,
            },
            {
              label:"可借天数",
              prop:"loanDayCount",
              rules:[{
                required:true,
                message:"请输入可借天数",
                trigger:"blur"
              }],
              type:"number",
              precision:0,
              minRows:0,
              span:24,
            },
            {
              label:"可续借次数",
              prop:"continueLoanCount",
              rules:[{
                required:true,
                message:"请输入可续借次数",
                trigger:"blur"
              }],
              type:"number",
              precision:0,
              minRows:0,
              span:24,
            },
            {
              label:"每次可续借天数",
              prop:"continueLoanDayCount",
              rules:[{
                required:true,
                message:"请输入每次可续借天数",
                trigger:"blur"
              }],
              type:"number",
              precision:0,
              minRows:0,
              span:24,
            },
          ]
        }
      }
    }
  }
</script>

<style>
</style>
