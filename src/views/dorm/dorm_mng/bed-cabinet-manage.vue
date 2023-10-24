<template>
  <div>
    <el-dialog
      title="床/柜管理"
      :visible.sync="dialogVisible"
      top="5vh"
      width="40%"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div style="margin-bottom: 8px;">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="addDialogVisible = true;addEditTitle = '添加'">
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
      <vxe-grid
        border
        resizable
        auto-resize
        :height="tableHeight"
        keep-source
        ref="xGrid"
        size="mini"
        align="center"
        :highlight="true"
        :columns="tableColumn"
        :loading="loading"
        :data="tableData"
        :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
        :export-config="{}"
        @checkbox-change="checkboxChangeEvent"
        @checkbox-all="checkboxChangeEvent">
      </vxe-grid>
    </el-dialog>
    <el-dialog
      :title="addEditTitle"
      :visible.sync="addDialogVisible"
      width="30%"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form
        ref="formRef"
        :option="addEditOption"
        v-model="form"
        @submit="submit"
        @error="error">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="escClose" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </div>

</template>

<script>
  import { getBedCabinetTable, addBed, updateBed, removeBed} from "@/api/dorm/dorm_mng.js"

  export default{
    data(){
      return{
        dialogVisible:false,
        tableData:[],
        loading:false,
        selectionList:[],
        tableHeight:0,
        dormId:"",
        page:{
          pageSize:1000,
          currentPage:1,
          total:0
        },
        addEditTitle:"添加",
        addDialogVisible:false,
        form:{}
      }
    },
    mounted() {
      this.tableHeight=window.innerHeight-360;
    },
    methods:{
      submit(form,done){
        if(this.addEditTitle == "编辑"){
          updateBed(form).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.escClose()
              this.initData()
              done()
            }else{
              this.$message.error(r.data.msg)
              done()
            }
          })
        }else{
          form['dormId'] = this.dormId;
          addBed(form).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.escClose()
              this.initData()
              this.$emit('refeshPage')
              done()
            }else{
              this.$message.error(r.data.msg)
              done()
            }
          })
        }
      },
      escClose(){
        this.form = {}
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.addDialogVisible = false
      },
      handleEdit(){
        if (this.selectionList.length != 1) {
          this.$message.warning("请选择一条数据");
          return;
        }
        this.form = this.selectionList[0]
        this.addEditTitle = "编辑"
        this.addDialogVisible = true
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
          return removeBed({ids:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.initData();
            this.$emit('refeshPage')
          }
        })
      },
      openDialog(val){
        this.dormId = val.dormId;
        this.initData()
        this.dialogVisible = true;
      },
      initData(){
        this.loading = true
        getBedCabinetTable({size:1000,current:1,dormId:this.dormId}).then(r => {
          this.loading = false
          this.page.total = r.data.data.total;
          this.tableData = r.data.data.records;
        })
      },
      checkboxChangeEvent({records}){
        this.selectionList = records;
      }
    },
    computed:{
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label: "床号",
              prop: "badNum",
              span: 24,
              rules:[{
                required:true,
                message:"请输入床号",
                trigger:'blur'
              }],
            },
            {
              label: "柜号",
              prop: "cabinetNum",
              span: 24,
              rules:[{
                required:true,
                message:"请输入柜号",
                trigger:'blur'
              }],
            },
          ]
        }
      },
      tableColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:"床号",
            field:"badNum",
            sortable:true,
            minWidth:100,
          },
          {
            title:"柜号",
            field:"cabinetNum",
            sortable:true,
            minWidth:100,
          }
        ]
      }
    }
  }
</script>

<style>
</style>
