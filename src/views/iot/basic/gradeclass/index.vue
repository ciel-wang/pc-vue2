<template>
  <el-row>
    <el-col :span="12">
      <basic-container>
        <div class="u-m-b-8">
          <el-input
            size="small" clearable
            style="width: 200px;margin-right: 10px;"
            @keyup.enter.native="search('grade')"
            v-model.trim="gradeName"
            placeholder="请输入年级名称">
          </el-input>
          <el-button type="primary" size="small" icon="el-icon-search" @click="search('grade')">搜索</el-button>
          <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset('grade')">重置</el-button>
        </div>
        <div class="u-m-b-8">
          <el-button
            type="primary" size="small" icon="el-icon-plus"
            @click="handleAdd('grade')"
            v-if="permission.iot_gradeclass_add_btn">添加</el-button>
          <el-button
            type="primary" size="small" icon="el-icon-edit"
            @click="handleEdit('grade')"
            v-if="permission.iot_gradeclass_add_btn">编辑</el-button>
          <el-button
            type="danger" size="small" icon="el-icon-delete"
            @click="handleDelete('grade')"
            v-if="permission.iot_gradeclass_del_btn">删除</el-button>
          <el-button
            type="primary" size="small"
            v-if="permission.dept_syncdev_btn"
            @click="handlerRelatedDev('authDev')">关联权限设备</el-button>
          <!-- <el-button
              type="primary" size="small"
              v-if="permission.dept_synckqdev_btn"
              @click="handlerRelatedDev('kqDev')">关联考勤设备</el-button> -->
          <el-button
            type="primary" size="small"
            icon="el-icon-view"
            v-if="permission.dept_viewdev_btn"
            @click="handlerViewDev">查看设备</el-button>
          <el-button
            type="primary" size="small" icon="el-icon-download"
            @click="handleExport"
            v-if="permission.iot_gradeclass_export_btn">导出</el-button>
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
          :data="gradeData"
          @cell-click="gradeCellClick"
          @checkbox-change="checkboxChangeEvent1"
          @checkbox-all="checkboxChangeEvent1">
          <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
          <vxe-table-column title="序号" field="gcSeq" width="100" sortable></vxe-table-column>
          <vxe-table-column title="学校名称" minWidth="120" field="schoolName"></vxe-table-column>
          <vxe-table-column title="年级名称" minWidth="120" field="gradeName"></vxe-table-column>
        </vxe-table>
        <div class="page_class">
          <el-pagination
            @size-change="handleSizeChange('grade',$event)"
            @current-change="handleCurrentChange('grade',$event)"
            :current-page="page1.currentPage"
            :page-sizes="[30, 50, 100, 500,1000,3000]"
            :page-size="page1.pageSize"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="page1.total"
            :hide-on-single-page="false">
          </el-pagination>
        </div>
      </basic-container>
    </el-col>
    <el-col :span="12">
      <basic-container>
        <div class="u-m-b-8">
          <el-input
            size="small" clearable
            style="width: 200px;margin-right: 10px;"
            @keyup.enter.native="search('class')"
            v-model.trim="className"
            placeholder="请输入班级名称">
          </el-input>
          <el-button type="primary" size="small" icon="el-icon-search" @click="search('class')">搜索</el-button>
          <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset('class')">重置</el-button>
        </div>
        <div style="margin-bottom: 8px;">
          <el-button
            type="primary" size="small" icon="el-icon-plus"
            @click="handleAdd('class')"
            v-if="permission.iot_gradeclass_add_btn">添加</el-button>
          <el-button
            type="primary" size="small" icon="el-icon-edit"
            @click="handleEdit('class')"
            v-if="permission.iot_gradeclass_add_btn">编辑</el-button>
          <el-button
            type="danger" size="small" icon="el-icon-delete"
            @click="handleDelete('class')"
            v-if="permission.iot_gradeclass_del_btn">删除</el-button>
          <el-button
            type="primary" size="small"
            @click="handleAddClass"
            v-if="permission.iot_gradeclass_autoadd_btn">批量创建班级</el-button>
          <el-button
            type="primary" size="small"
            @click="handleClassTeacher"
            v-if="permission.iot_gradeclass_classteacher_btn">关联班主任</el-button>
          <el-button
            type="primary" size="small" icon="el-icon-upload2"
            @click="handleImport"
            v-if="permission.iot_gradeclass_export_btn">导入</el-button>
        </div>
        <vxe-table
          border
          resizable
          ref="xGrid"
          size="mini"
          auto-resize
          highlight-hover-row
          align="center"
          :loading="loading"
          :height="tableHeight"
          :export-config="{}"
          :data="classData"
          @checkbox-change="checkboxChangeEvent2"
          @checkbox-all="checkboxChangeEvent2">
          <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
          <vxe-table-column title="序号" field="gcSeq" width="100" sortable></vxe-table-column>
          <vxe-table-column title="班级名称" minWidth="120" field="className"></vxe-table-column>
          <vxe-table-column title="班主任" minWidth="120" field="classTeacher"></vxe-table-column>
        </vxe-table>
        <div class="page_class">
          <el-pagination
            @size-change="handleSizeChange('class',$event)"
            @current-change="handleCurrentChange('class',$event)"
            :current-page="page2.currentPage"
            :page-sizes="[30, 50, 100, 500,1000,3000]"
            :page-size="page2.pageSize"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="page2.total"
            :hide-on-single-page="false">
          </el-pagination>
        </div>

        <el-dialog
          :title="dialogTitle"
          :visible.sync="dialogVisible"
          width="30%"
          :before-close="handleClose"
          append-to-body
          :modal-append-to-body="true"
          :close-on-click-modal="false"
          :close-on-press-escape="false">
          <avue-form ref="formRef" :option="addEditOption" v-model="form" @submit="submit">
            <template slot-scope="scope" slot="menuForm">
              <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
            </template>
          </avue-form>
        </el-dialog>

        <el-dialog
          title="批量创建班级"
          :visible.sync="classDialogVisible"
          width="30%"
          :before-close="escClose"
          append-to-body
          :modal-append-to-body="true"
          :close-on-click-modal="false"
          :close-on-press-escape="false">
          <avue-form ref="classFormRef" :option="addClassOption" v-model="classForm" @submit="classSubmit">
            <template slot-scope="scope" slot="menuForm">
              <el-button @click="escClose" icon="el-icon-close">取消</el-button>
            </template>
          </avue-form>
        </el-dialog>

        <select-classteacher ref="selectClassteacherRef" @refeshPage="search"></select-classteacher>
        <teacher-import-info ref="teacherImportInfoRef" @refeshPage="search"></teacher-import-info>
        <RelatedDev ref="RelatedDevRef"></RelatedDev>
        <viewDeptDev ref="viewDeptDevRef"></viewDeptDev>

      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
  import gradeclassZtree from "@/components/gradeclass-ztree/index.vue"
  import {getGradeData, getClassData, gradeclassAdd, gradeclassUpdate, getSchoolGradeList, getGradeclassDetails, gradeclassRemove, autoAddClass, getClassTeacher} from "@/api/iot/gradeclass.js"
  import { getSchoolsZtreeData } from "@/api/iot/dept.js"
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import selectClassteacher from './select-classteacher.vue'
  import teacherImportInfo from "../../components/teacher-import-info.vue"
  import RelatedDev from '../dept/related-dev.vue'
  import viewDeptDev from '../dept/view-dept-dev.vue'

  export default{
    components:{gradeclassZtree, selectClassteacher, teacherImportInfo, RelatedDev, viewDeptDev},
    data(){
      return{
        gradeName:"",
        gradeData:[],
        selectionList1:[],
        page1:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        className:"",
        parentId:"",
        classData:[],
        selectionList2:[],
        page2:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        loading:false,

        dialogTitle:"添加",
        btnType:'add',
        dialogVisible:false,
        form:{},
        parentDeptData:[],
        gcNameLabel:'名称',
        classDialogVisible:false,
        classForm:{},
        schoolIdDic:[],
      }
    },
    mounted() {
      this.search('grade');
    },
    activated() {
      getSchoolsZtreeData().then(r => {
        this.schoolIdDic = r.data.data;
      })
    },
    watch:{
      'form.gctype':{
        handler(val){
          if(val == 1){
            this.display = false;
            this.gcNameLabel = "班级名称"
          }else{
            this.display = true;
            this.gcNameLabel = "年级名称"
          }
        }
      }
    },
    methods:{
      handlerViewDev(){
        if(this.selectionList1.length != 1) return this.$message.warning("请选择一条数据");
        this.$refs.viewDeptDevRef.openDialog(this.selectionList1[0].gradeId,2);
      },
      handlerRelatedDev(devType){
        if(this.selectionList1.length === 0) return this.$message.warning("请选择至少一条数据");
        let ids = this.selectionList1.map(v => v.gradeId);
        this.$refs.RelatedDevRef.openDialog(devType,'grade',[...new Set(ids)].join(','))
      },
      handleImport(){
        this.$refs.teacherImportInfoRef.openDialog('gradeclass');
      },
      handleClassTeacher(){
        if ( this.selectionList2.length != 1) return this.$message.warning("请选择一条数据");
        let classId = this.selectionList2[0].classId
        getClassTeacher({classId:classId}).then(r => {
          if(r.data.code == 200){
            let data = r.data.data;
            this.$refs.selectClassteacherRef.openDialog({classId:classId,data:data})
          }
        })
      },
      handleAddClass(){
        this.classDialogVisible = true;
      },
      classSubmit(form,done){
        this.$refs.classFormRef.validate((vaild, done) => {
          if (vaild) {
            autoAddClass(form).then(r => {
              if(r.data.code == 200){
                this.$message.success(r.data.msg)
                this.escClose()
                this.search('grade');
                if(this.parentId) this.search('class')
              }else{
                this.$message.error(r.data.msg);
              }
              done();
            }).catch(() => done())
          }
        })
      },
      submit(form,done){
        this.$refs.formRef.validate((vaild, done) => {
          if (!vaild) return;
          let { gctype } = form;
          if(this.btnType === 'add'){
            gradeclassAdd(form).then(r => {
              if(r.data.code == 200){
                this.$message.success(r.data.msg)
                this.handleClose()
                this.search(gctype == 2 ? 'grade' : 'class')
              }else{
                this.$message.error(r.data.msg);
              }
              done();
            }).catch(() => done())
          }else{
            gradeclassUpdate(form).then(r => {
              if(r.data.code == 200){
                this.$message.success(r.data.msg)
                this.handleClose()
                this.search(gctype == 2 ? 'grade' : 'class')
              }else{
                this.$message.error(r.data.msg);
              }
              done();
            }).catch(() => done())
          }
        })
      },
      handleClose(){
        this.form = {}
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
      escClose(){
        this.classForm = {}
        this.$refs.classFormRef.resetForm();
        this.$refs.classFormRef.clearValidate();
        this.classDialogVisible = false;
      },
      handleAdd(type){
        if(type === 'class'){
          if(!this.parentId) return this.$message.warning('请先选择年级');
          this.form.parentId = this.parentId;
        }
        this.dialogVisible = true;
        this.btnType = 'add';
        this.dialogTitle = type === 'grade' ? "添加年级" : '添加班级'
        this.form.gctype = type === 'grade' ? 2 : 1;
      },
      handleEdit(type){
        if(type === 'grade' && this.selectionList1.length != 1) return this.$message.warning("请选择要编辑的年级");
        if(type === 'class' && this.selectionList2.length != 1) return this.$message.warning("请选择要编辑的班级");
        let id = type === 'grade' ? this.selectionList1[0].gradeId : this.selectionList2[0].classId;
        getGradeclassDetails({ id }).then(r => {
          if(r.data.code == 200){
            this.dialogVisible = true;
            this.btnType = 'edit';
            this.dialogTitle = type === 'grade' ? "编辑年级" : '编辑班级';
            this.form = r.data.data;
          }
        })
      },
      handleDelete(type){
        if(type === 'grade' && this.selectionList1.length == 0) return this.$message.warning("请选择要删除的年级");
        if(type === 'class' && this.selectionList2.length == 0) return this.$message.warning("请选择要删除的班级");
        this.$confirm("确定要删除选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let ids = [];
          if(type === 'grade') ids = this.selectionList1.map(v => v.gradeId);
          if(type === 'class') ids = this.selectionList2.map(v => v.classId);
          return gradeclassRemove({ ids });
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.onLoad(type);
          }else{
            this.$message.error(res.data.msg);
          }
        });
      },
      gradeCellClick({ row }){
        this.parentId = row.gradeId;
        this.search('class')
      },
      search(type){
        if(type === 'grade'){
          this.page1.currentPage = 1;
          this.selectionList1 = [];
        }else{
          this.page2.currentPage = 1;
          this.selectionList2 = [];
        }
        this.onLoad(type)
      },
      searchReset(type){
        if(type === 'grade'){
          this.gradeName = ""
        }else{
          this.className = "";
        }
        this.search(type)
      },
      onLoad(type){
        if(type === 'grade'){
          let params = {};
          params["moreParamQuery"] = this.gradeName;
          params["current"] = this.page1.currentPage;
          params["size"] = this.page1.pageSize;
          this.loading = true;
          getGradeData(params).then(r => {
            this.loading = false;
            if(r.data.code == 200){
              let d = r.data.data;
              this.page1.total = d.total;
              this.gradeData = d.records;
            }
          }).catch(() => this.loading = false)
        }else{
          if(!this.parentId) return this.$message.warning('请先选择年级');
          let params = {};
          params["moreParamQuery"] = this.className;
          params["current"] = this.page2.currentPage;
          params["size"] = this.page2.pageSize;
          params["parentId"] = this.parentId;
          this.loading = true;
          getClassData(params).then(r => {
            this.loading = false;
            if(r.data.code == 200){
              let d = r.data.data;
              this.page2.total = d.total;
              this.classData = d.records;
            }
          }).catch(() => this.loading = false)
        }
      },
      handleExport(){
        this.$confirm("是否导出年/班级数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let ids = this.selectionList1.map(v => v.gradeId).join(',');
          window.open(
            `/api/iot-basic/grade/class/export?${website.tokenHeader}=${getToken()}&moreParamQuery=${this.gradeName}&ids=${ids}&current=${this.page1.currentPage}&size=${this.page1.pageSize}`
          );
        });
      },
      checkboxChangeEvent1({records}){
        this.selectionList1 = records;
      },
      checkboxChangeEvent2({records}){
        this.selectionList2 = records;
      },
      handleSizeChange(type,val) {
        if(type === 'grade'){
          this.page1.currentPage = 1;
          this.page1.pageSize = val;
          this.onLoad('grade');
        }
        if(type === 'class'){
          this.page2.currentPage = 1;
          this.page2.pageSize = val;
          this.onLoad('class');
        }
      },
      handleCurrentChange(type,val) {
        if(type === 'grade'){
          this.page1.currentPage = val;
          this.onLoad('grade');
        }
        if(type === 'class'){
          this.page2.currentPage = val;
          this.onLoad('class');
        }
      },
      getSchoolGradeInit(data){
        this.form.parentId = ""
        this.classForm.gradeId = ""
        this.parentDeptData = [];
        getSchoolGradeList({schoolId:data.value}).then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            d.forEach(v => {
              this.parentDeptData.push({
                value:v.id,
                label:v.gcName
              })
            })
          }
        })
      }
    },
    computed:{
      ...mapGetters(['permission']),
      tableHeight(){
        return window.innerHeight - 310;
      },
      addClassOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"选择学校",
              prop:"schoolId",
              type:'tree',
              rules:[{
                required:true,
                message:"请选择学校",
                trigger:'blur'
              }],
              span:24,
              dicData:this.schoolIdDic,
              props:{
                value:'value',
              },
              nodeClick:(data, node,ref)=>{
                this.getSchoolGradeInit(data);
              }
            },
            {
              label: "选择年级",
              prop: "gradeId",
              type:"select",
              rules: [{
                  required: true,
                  message: "请选择年级",
                  trigger: "click"
              }],
              dicData:this.parentDeptData,
              span: 24,
            },
            {
              label:"前缀",
              prop:"prefix",
              span:24,
              rules: [{
                  required: true,
                  message: "请输入前缀",
                  trigger: "blur"
              }],
              maxlength:10
            },
            {
              label:"班级数量",
              prop:"count",
              span:24,
              type:"number",
              minRows:1,
              maxRows:9999,
              controls:false,
              rules: [{
                required: true,
                message: "请输入班级数量",
                trigger: "blur"
              }],
            }
          ]
        }
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label: "类型",
              prop: "gctype",
              type:"select",
              rules: [{
                required: true,
                message: "请选择类型",
                trigger: "blur"
              }],
              dicData:[
                {value:1,label:"班级"},
                {value:2,label:"年级"}
              ],
              span: 24,
              display:false
            },
            {
              label:"所属学校",
              prop:'schoolId',
              type:'tree',
              rules:[{
                required:true,
                message:"请选择学校",
                trigger:'blur'
              }],
              span:24,
              dicData:this.schoolIdDic,
              props:{
                value:'value',
              },
              nodeClick:(data, node,ref)=>{
                if(this.form.gctype == 1){
                  this.getSchoolGradeInit(data);
                }
              },
              display:this.display
            },
            {
              label:this.gcNameLabel,
              prop:"gcName",
              rules:[{
                required:true,
                message:"请输入"+this.gcNameLabel,
                trigger:"blur"
              }],
              span:24,
              maxlength:20
            },
            {
              label:"序号",
              prop:'gcSeq',
              span:24
            }
          ]
        }
      }
    }
  }
</script>
