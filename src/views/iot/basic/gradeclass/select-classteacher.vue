<template>
  <el-dialog
    title="班级关联班主任"
    :visible.sync="empDialogVisible"
    width="800px"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <vxe-grid
      border
      resizable
      :height="tableHeight"
      ref="empCrud"
      size="mini"
      align="center"
      :columns="empOptions"
      :data="empData"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange"
    ></vxe-grid>
    <div slot="footer" class="dialog-footer" style="text-align: center;">
      <el-button type="primary" @click="submit" :loading="loading">提 交</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { setClassTeacher } from "@/api/iot/gradeclass.js"

  export default{
    data(){
      return{
        empDialogVisible:false,
        tableHeight:0,
        empData:[],
        loading:false,
        selectionList:[],
        classId:""
      }
    },
    methods:{
      submit(){
        if(this.selectionList.length != 1){
          this.$message.success("请选择一条数据")
          return;
        }
        let teacherId = this.selectionList[0].empId;
        this.loading = true
        setClassTeacher({classId:this.classId,teacherId:teacherId}).then(r => {
          this.loading = false
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.handleClose()
            this.$emit('refeshPage')
          }else{
            this.$message.error(r.data.msg)
          }
        }).catch(() => {
          this.loading = false
        })
      },
      openDialog({classId,data}){
        this.empDialogVisible = true;
        this.classId = classId;
        this.empData = data;
      },
      handleClose(){
        this.selectionList = []
        this.empData = []
        this.empDialogVisible = false;
      },
      selectionChange({ records }) {
        this.selectionList = records;
      },
    },
    computed: {
      empOptions() {
        return [
          { type: 'checkbox', width: 60 },
          {
            title: '工号',
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
            title:"部门名称",
            field:"deptName",
            minWidth:100,
          },
          {
            title: '学校名称',
            field: 'schoolName',
            minWidth: 100
          }
        ];
      }
    }
  }
</script>

<style>
</style>
