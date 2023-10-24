<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i
        :style="arrowCfgStyleCommon"
        @click="leftClick"
        v-if="arrowCfg['left'] == 4"
        :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <booksCategoryZtree ref="booksCategoryZtreeRef" @onClick="ztreeClick"></booksCategoryZtree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i
        :style="arrowCfgStyleCommon"
        @click="rightClick"
        v-if="arrowCfg['right'] == 24"
        :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div>
          <el-input
            size="small"
            style="width: 200px;margin-right: 10px;"
            clearable
            @keyup.enter.native="search"
            v-model="typeName"
            placeholder="请输入类别名称">
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
            v-if="permission.library_category_add_btn">
            添加</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit"
            v-if="permission.library_category_edit_btn">
            编辑</el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete"
            v-if="permission.library_category_del_btn"
            >删除</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-upload2"
            @click="handleImportInfo"
            v-if="permission.library_category_import_btn"
            >导入</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-download"
            @click="handleExport"
            v-if="permission.library_category_export_btn"
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
          <vxe-table-column type="checkbox" width="100" fixed="left"></vxe-table-column>
          <vxe-table-column title="序号" type="seq" width="100"></vxe-table-column>
          <vxe-table-column title="书刊类别编码" minWidth="100" field="typeCode"></vxe-table-column>
          <vxe-table-column title="书刊类别名称" minWidth="100" field="typeName"></vxe-table-column>
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
      </basic-container>

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
          @submit="submit">
          <template slot-scope="scope" slot="menuForm">
            <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
          </template>

          <template slot="parentId">
            <vxe-pulldown ref="xDown" style="width: 100%;">
              <template #default>
                <el-input v-model="form.parentBookTypeName" readonly placeholder="请选择 上一级目录" size="small">
                  <el-button slot="append" icon="el-icon-search" @click="searchZtreeNode"></el-button>
                </el-input>
              </template>
              <template #dropdown>
                <div class="my-dropdown1">
                  <booksCategoryZtree ref="booksCategoryZtreeRef2" :isShowIcon="false" @onClick="selectParentId"></booksCategoryZtree>
                </div>
              </template>
            </vxe-pulldown>
          </template>
        </avue-form>
      </el-dialog>

      <importInfo ref="importInfoRef" @refeshPage="searchReset"></importInfo>
    </el-col>
  </el-row>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import importInfo from '@/views/iot/components/teacher-import-info.vue'
  import booksCategoryZtree from '../books-category-ztree.vue'
  import { getBookCategoryDic, getBookCategoryList, addBookCategory, getBookCategoryDetails, updateBookCategory, removeBookCategory } from '@/api/library-mng/books-categories.js'

  export default{
    components:{ importInfo, booksCategoryZtree },
    data(){
      return{
        ztreeHeight:0,
        tableHeight:0,
        typeName:"",
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
        btnType:"add",
        booksCategoryDic:[],
        parentId:"",
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.tableHeight=window.innerHeight-236-77;
      this.search()
    },
    activated() {
      getBookCategoryDic().then(r => {
        this.booksCategoryDic = r.data;
      })
    },
    methods:{
      searchZtreeNode(){
        this.$refs.xDown.showPanel()
      },
      selectParentId(treeNode){
        this.form.parentId = treeNode.value;
        this.form.parentBookTypeName = treeNode.label;
        this.$refs.xDown.hidePanel();
      },
      submit(form,done){
        if(this.btnType === 'edit'){
          updateBookCategory(form).then(r => {
            done();
            if(r.data.code === 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.search()
              this.$refs.booksCategoryZtreeRef.cancelSelect();
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch(() => done())
        }else{
          addBookCategory(form).then(r => {
            done();
            if(r.data.code === 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.search()
              this.$refs.booksCategoryZtreeRef.cancelSelect();
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
        if ( this.selectionList.length !== 1) {
          this.$message.warning("请选择一条数据");
          return;
        }
        this.btnType = "edit";
        this.dialogTitle = "编辑"
        getBookCategoryDetails({id:this.selectionList[0].id}).then(r => {
          if(r.data.code === 200){
            let form = r.data.data;
            this.form = {...form};
            this.dialogVisible = true;
          }
        })
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
          return removeBookCategory({ids:this.ids.split(',')});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
            this.$refs.booksCategoryZtreeRef.cancelSelect();
          }
        })
      },
      search(){
        this.page.currentPage = 1;
        this.selectionList = [];
        this.onLoad();
      },
      searchReset(){
        this.typeName = "";
        this.parentId = "";
        this.$refs.booksCategoryZtreeRef.cancelSelect();
        this.search();
      },
      ztreeClick(treeNode){
        this.parentId = treeNode.value;
        this.search()
      },
      onLoad(){
        let params = {}
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['typeName'] = this.typeName;
        params['parentId'] = this.parentId;
        this.loading = true
        getBookCategoryList(params).then(r => {
          this.loading = false;
          if(r.data.code === 200){
            let d = r.data.data;
            this.page.total = d.total;
            this.tableData = d.records;
          }
        }).catch(() => this.loading = false)
      },
      handleImportInfo(){
        this.$refs.importInfoRef.openDialog('booksCategories');
      },
      handleExport(){
        this.$confirm("是否导出书刊类别?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-library/booktype/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&typeName=${this.typeName.trim()}&parentId=${this.parentId}`
          );
        });
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
      treeLoad(node,resolve){
        const isChild = node.data.isChild || false;
        const parentId = node.data.value || 0;
        getBookCategoryDic({parentId}).then(r => {
          resolve(r.data.map(ele => {
            return Object.assign(ele, {
              leaf: ele.isChild
            })
          }));
        })
      }
    },
    computed:{
      ...mapGetters(['permission']),
      ids() {
        let ids = this.selectionList.map(v => v.id);
        return ids.join(",");
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          labelWidth:130,
          column:[
            {
              label:"上一级目录",
              prop:"parentId",
              span:24,
              type:'tree',
              lazy:true,
              props:{isLeaf:'isChild'},
              dicData:[],
              dicUrl:`/api/iot-library/booktype/tree?parentId={{key}}`,
              treeLoad: (node, resolve)=> this.treeLoad(node,resolve)
            },
            {
              label:"书刊类别编码",
              prop:"typeCode",
              rules:[{
                required:true,
                message:"请输入书刊类别编码",
                trigger:"blur"
              }],
              span:24,
              maxlength:100
            },
            {
              label:"书刊类别名称",
              prop:"typeName",
              rules:[{
                required:true,
                message:"请输入书刊类别名称",
                trigger:"blur"
              }],
              span:24,
              maxlength:100
            },
          ]
        }
      }
    }
  }
</script>

<style scoped>
  .my-dropdown1 {
    height: 200px;
    width: 100%;
    overflow: auto;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    background-color: #fff;
  }
  >>>.vxe-pulldown--panel{
    width: 100%;
    padding: 0;
  }
</style>
