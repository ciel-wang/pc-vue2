<template>
    <el-row>
      <el-col class="col-real-pos" :span="arrowCfg['left']">
        <i
          :style="arrowCfgStyleCommon"
          @click="leftClick"
          v-if="arrowCfg['left'] == 4"
          :class="arrowCfgClassLeftName"></i>
        <div class="ztreeStyle" style="height: calc(100vh - 146px);">
          <dept-ztree @click="ztreeClick" ref="ztree" v-bind:node="nodes"></dept-ztree>
        </div>
      </el-col>
      <el-col :span="arrowCfg['right']">
        <i
          :style="arrowCfgStyleCommon"
          @click="rightClick"
          v-if="arrowCfg['right'] == 24"
          :class="arrowCfgClassRightName"></i>
        <basic-container>
          <div style="margin-bottom: 8px;">
            <el-input
              size="small" clearable
              style="width: 200px;margin-right: 10px;"
              @keyup.enter.native="search"
              v-model="moreParamQuery"
              placeholder="请输入部门编号/名称">
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
          <div style="margin-bottom: 8px;">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="handleAdd"
              v-if="permission.dept_add_btn">
              添加</el-button>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="handleDelete"
              v-if="permission.dept_del_btn"
              >删除</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-upload2"
              @click="handleImportInfo"
              v-if="permission.dept_important_btn"
              >导入</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              @click="handleExport"
              v-if="permission.dept_export_btn"
              >导出</el-button>
            <el-button
                type="primary" size="small"
                v-if="permission.dept_syncdev_btn"
                @click="handlerRelatedDev('authDev')">关联权限设备</el-button>
            <!-- <el-button
                type="primary" size="small"
                v-if="permission.dept_synckqdev_btn"
                @click="handlerRelatedDev('kqDev')">关联考勤设备</el-button> -->
          </div>
          <div style="height: calc(100vh - 313px);">
            <vxe-table
              border
              resizable
              ref="xTable"
              auto-resize
              highlight-hover-row
              show-overflow
              height="100%"
              size="mini"
              :loading="loading"
              :checkbox-config="{checkField:'checked'}"
              :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
              align="center"
              :data="tableData"
              @checkbox-change="checkboxChangeEvent"
              @checkbox-all="checkboxChangeEvent">
              <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
              <vxe-table-column title="序号" type="seq" width="70" fixed="left"></vxe-table-column>
              <vxe-table-column title="部门编号" minWidth="100" field="deptNo" fixed="left"></vxe-table-column>
              <vxe-table-column title="部门名称" minWidth="140" field="deptName" fixed="left"></vxe-table-column>
              <vxe-table-column title="父部门" minWidth="110" field="parentName"></vxe-table-column>
              <vxe-table-column title="操作" width="200" fixed="right" v-if="permission.dept_edit_btn || permission.dept_viewdev_btn">
                <template #default="{row}">
                  <el-button
                    type="text" size="small"
                    icon="el-icon-edit"
                    v-if="permission.dept_edit_btn"
                    @click="handlerEdit(row)">编辑</el-button>
                  <el-button
                    type="text" size="small"
                    icon="el-icon-view"
                    v-if="permission.dept_viewdev_btn"
                    @click="handlerViewDev(row)">查看设备</el-button>
                </template>
              </vxe-table-column>
            </vxe-table>
          </div>
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

          <el-dialog
            :title="dialogTitle"
            :visible.sync="dialogVisible"
            width="30%"
            :before-close="handleClose"
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
                <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
              </template>
            </avue-form>
          </el-dialog>

          <import-info ref="importInfoRef" @refeshPage="search"></import-info>
          <RelatedDev ref="RelatedDevRef"></RelatedDev>
          <viewDeptDev ref="viewDeptDevRef"></viewDeptDev>
        </basic-container>
      </el-col>
    </el-row>
</template>

<script>
  import deptZtree from "@/components/dept-ztree/index.vue"
  import {getDeptData, deptRemove, getDeptDetails, getDeptZtreeData, deptAdd, deptUpdate} from "@/api/iot/dept.js"
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import importInfo from "../../components/teacher-import-info.vue"
  import RelatedDev from './related-dev.vue'
  import viewDeptDev from './view-dept-dev.vue'

  export default{
    components:{ deptZtree, importInfo, RelatedDev, viewDeptDev },
    data(){
      return{
        nodes:[],
        ztreeHeight:0,
        tableHeight:0,
        moreParamQuery:"",
        loading:false,
        tableData:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        selectionList:[],
        dialogTitle:"添加部门",
        dialogVisible:false,
        form:{},
        parentDeptData:[],
        ancestors:""
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.tableHeight=window.innerHeight-313;
      this.search()
    },
    methods:{
      handlerViewDev(row){
        this.$refs.viewDeptDevRef.openDialog(row.id,1);
      },
      handlerRelatedDev(devType){
        if(this.selectionList.length === 0) return this.$message.warning("请选择至少一条数据");
        this.$refs.RelatedDevRef.openDialog(devType,'dept',this.ids)
      },
      handleImportInfo(){
        this.$refs.importInfoRef.openDialog('dept');
      },
      submit(form,done){
        this.$refs.formRef.validate((vaild, done) => {
          if (vaild) {
            if(this.dialogTitle == "编辑部门"){
              form['createTime'] = null;
              deptUpdate(form).then(r => {
                if(r.data.code == 200){
                  this.$message.success(r.data.msg)
                  this.handleClose()
                  this.onLoad()
                  this.$refs.ztree.getDeptZtreeInit();
                  done()
                }else{
                  this.$message.error(r.data.msg);
                  done();
                }
              }).catch(() => {
                done();
              })
            }else{
              deptAdd(form).then(r => {
                if(r.data.code == 200){
                  this.$message.success(r.data.msg)
                  this.handleClose()
                  this.search()
                  this.$refs.ztree.getDeptZtreeInit();
                  done()
                }else{
                  this.$message.error(r.data.msg);
                  done();
                }
              }).catch(() => {
                done();
              })
            }
          }
        })
      },
      handleClose(){
        this.form = {}
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
      handleAdd(){
        getDeptZtreeData().then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            this.parentDeptData = d
            this.dialogVisible = true;
            this.dialogTitle = "添加部门"
          }
        })
      },
      async handlerEdit(row){
        await getDeptZtreeData().then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            this.parentDeptData = d
          }
        })
        await getDeptDetails({id:row.id}).then(r => {
          if(r.data.code == 200){
            this.form = r.data.data;
          }
        })
        this.dialogVisible = true;
        this.dialogTitle = "编辑部门"
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
          return deptRemove({ids:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.onLoad();
            this.$refs.ztree.getDeptZtreeInit();
          }
        }).catch((error) => {
          console.log(error);
        });
      },
      ztreeClick(treeNode){
        this.ancestors = treeNode.valueStr;
        this.search()
      },
      search(){
        this.page.currentPage = 1
        this.selectionList = []
        this.onLoad()
      },
      onLoad(){
        let params = {}
        params["moreParamQuery"] = this.moreParamQuery.trim()
        params["current"] = this.page.currentPage;
        params["size"] = this.page.pageSize;
        params["ancestors"] = this.ancestors;
        this.loading = true;
        getDeptData(params).then(r => {
          this.loading = false;
          if(r.data.code == 200){
            let d = r.data.data;
            this.page.total = d.total;
            d.records.forEach(v => v.checked = false)
            this.tableData = d.records;
          }
        }).catch(() => {
          this.loading = false;
        })
      },
      searchReset(){
        this.moreParamQuery = ""
        this.ancestors = ""
        this.search()
        this.$refs.ztree.getDeptZtreeInit();
      },
      checkboxChangeEvent({records}){
        this.selectionList = records;
      },
      handleExport(){
        this.$confirm("是否导出部门数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-basic/dept/export?${this.website.tokenHeader}=${getToken()}&moreParamQuery=${this.moreParamQuery.trim()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&ancestors=${this.ancestors}`
          );
        });
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
              label: "部门编号",
              prop: "deptNo",
              rules: [{
                  required: true,
                  message: "请输入部门编号",
                  trigger: "blur"
              }],
              span: 24,
              maxlength:20
            },
            {
              label:"部门名称",
              prop:"deptName",
              rules:[{
                required:true,
                message:"请输入部门名称",
                trigger:"blur"
              }],
              span:24,
              maxlength:20
            },
            {
              label:"父部门",
              prop:"parentNo",
              type: "tree",
              dicData: this.parentDeptData,
              checkStrictly: true,
              multiple: false,
              rules:[{
                required:true,
                message:"请选择父部门",
                trigger:"blur"
              }],
              props:{
                value:'valueStr'
              },
              span:24
            }
          ]
        }
      },
      tableColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:"部门编号",
            field:"deptNo",
            sortable: true,
            minWidth: 100,
            fixed:"left",
          },
          {
            title:"部门名称",
            field:"deptName",
            sortable: true,
            minWidth: 140,
            fixed:"left",
          },
          {
            title:"父级部门",
            field:"parentName",
            sortable: true,
            minWidth: 110,
          },
        ]
      }
    }
  }

</script>
