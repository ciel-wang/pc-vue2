<template>
  <div>
    <el-dialog
      title="书刊架位管理"
      :visible.sync="dialogVisible"
      width="700px"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div class="mbottom8">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleAdd">
          添加</el-button>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-edit"
          @click="handleEdit">
          编辑</el-button>
        <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          @click="handleDelete"
          >删除</el-button>
      </div>
      <vxe-table
        border
        resizable
        ref="xGrid"
        size="mini"
        auto-resize
        highlight-hover-row
        align="center"
        :height="600"
        :data="tableData"
        @checkbox-change="checkboxChangeEvent"
        @checkbox-all="checkboxChangeEvent">
        <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
        <vxe-table-column title="序号" type="seq" width="100"></vxe-table-column>
        <vxe-table-column title="名称" minWidth="100" field="bookPeriodicalsNum"></vxe-table-column>
      </vxe-table>
    </el-dialog>
    <el-dialog
      :title="title"
      :visible.sync="addDialogVisible"
      width="30%"
      :before-close="escClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form
        ref="formRef"
        :option="addEditOption"
        v-model="form"
        @submit="submit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="escClose" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </div>

</template>

<script>
  import { getPeriodicalsList, sendPeriodicals, removePeriodicals } from '@/api/library-mng/book-room-mng'

  export default{
    data(){
      return{
        libraryId:0,
        dialogVisible:false,
        tableData:[],
        selectionList:[],
        title:"添加",
        addDialogVisible:false,
        form:{},
      }
    },
    methods:{
      openDialog(libraryId){
        this.libraryId = libraryId;
        this.form.libraryId = libraryId;
        this.dialogVisible = true;
        this.onLoad();
      },
      submit(form,done){
        sendPeriodicals(form).then(r => {
          done();
          if(r.data.code === 200){
            this.$message.success(r.data.msg)
            this.escClose();
            this.onLoad();
            this.$emit('refeshPage');
          }else{
            this.$message.error(r.data.msg);
          }
        }).catch(() => done())
      },
      handleAdd(){
        this.title = "添加";
        this.addDialogVisible = true;
      },
      handleEdit(){
        if ( this.selectionList.length !== 1) {
          this.$message.warning("请选择要删除的数据");
          return;
        }
        this.title = "编辑";
        this.form = this.selectionList[0];
        this.addDialogVisible = true;
      },
      handleDelete(){
        if ( this.selectionList.length == 0) {
          this.$message.warning("请选择要删除的数据");
          return;
        }
        this.$confirm("确定要删除选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return removePeriodicals({ids:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.onLoad();
            this.$emit('refeshPage');
          }
        })
      },
      onLoad(){
        getPeriodicalsList({libraryId:this.libraryId}).then(r => {
          if(r.data.code === 200){
            this.tableData = r.data.data;
          }
        })
      },
      checkboxChangeEvent({records}){
        this.selectionList = records;
      },
      escClose(){
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.addDialogVisible = false;
      }
    },
    computed:{
      ids() {
        return this.selectionList.map(v => v.id);
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"名称",
              prop:"bookPeriodicalsNum",
              rules:[{
                required:true,
                message:"请输入名称",
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
