<template>
  <div>
    <el-dialog
      title="固定资产管理"
      :visible.sync="assetDialogVisible"
      top="5vh"
      width="1000px"
      :before-close="escClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div>
        <el-input
          size="small"
          style="width: 200px;margin-right: 10px;"
          clearable
          @keyup.enter.native="search"
          v-model="moreParamQuery"
          placeholder="请输入宿舍编号">
        </el-input>
        <el-input
          size="small"
          style="width: 200px;margin-right: 10px;"
          clearable
          @keyup.enter.native="search"
          v-model="propertyName"
          placeholder="请输入资产编号/名称">
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
          icon="el-icon-edit"
          @click="handleEdit"
          v-if="permissionList.editBtn">
          编辑</el-button>
        <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          @click="handleDelete"
          v-if="permissionList.delBtn"
          >删除</el-button>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-download"
          @click="handleExport"
          v-if="permissionList.exportBtn"
          >导出</el-button>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-upload2"
          @click="handleAutoAssets"
          v-if="permissionList.importBtn"
          >导入</el-button>
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
        :export-config="{}"
        :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
        @checkbox-change="checkboxChangeEvent"
        @checkbox-all="checkboxChangeEvent">
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
      title="固定资产导入"
      :visible.sync="DialogVisible"
      width="40%"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form
        :option="excelOption"
        :upload-before="uploadBefore"
        :on-change="handleChangeExcelImport"
        v-model="excelForm"
        :upload-after="uploadExcelAfter">
        <template slot="excelTemplate">
          <div>
            <el-button type="primary" @click="handleTemplate">
              点击下载<i class="el-icon-download el-icon--right"></i>
            </el-button>
            <div v-if="importExcelErrors.length > 0" class="imerrText">
              <p v-for="(v,i) in importExcelErrors" :key="'importExcelErrors'+i">
                {{v}}
              </p>
            </div>
          </div>
        </template>
      </avue-form>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from "vuex";
  import { assetsTableList, assetsDetails, removeAssets} from "@/api/dorm/dorm_mng.js"
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  
  export default{
    data(){
      return{
        assetDialogVisible:false,
        tableHeight:0,
        moreParamQuery:"",
        propertyName:'',
        loading:false,
        tableData:[],
        page:{
          pageSize:20,
          currentPage:1,
          total:0
        },
        selectionList:[],
        DialogVisible:false,
        excelForm:{},
        action:"",
        importExcelErrors:[]
      }
    },
    mounted() {
      this.tableHeight=window.innerHeight-360;
      this.action = `/api/iot-dorm/property/import?${this.website.tokenHeader}=${getToken()}`
    },
    methods:{
      handleAutoAssets(){
        this.DialogVisible = true;
        this.importExcelErrors = [];
        this.excelForm = {}
      },
      handleTemplate() {
        window.open(`/api/iot-dorm/property/export-template?${this.website.tokenHeader}=${getToken()}`);
      },
      uploadBefore(file,done,loading){
        this.loadings = this.$loading({
          text:"正在导入中，请稍候...",
          background:"rgba(0, 0, 0, 0.8)"
        })
        loading = true;
        done();
      },
      handleChangeExcelImport(file, fileList){
        this.fileListExcelImport = [];
      },
      uploadExcelAfter(res, done, loading, column) {
        loading = false;
        this.loadings.close();
        if(res instanceof Array || res instanceof Error){
          this.importExcelErrors = res;
          setTimeout(()=>{
            this.$message.error("导入失败")
          },500)
        }else{
          this.importExcelErrors = [];
          this.DialogVisible = false;
          setTimeout(()=>{
            this.$message.success("导入成功")
            this.search()
          },500)
        }
        this.fileListExcelImport = [];
        done();
      },
      handleEdit(){
        if(this.selectionList.length != 1){
          this.$message.warning("请选择一条数据")
          return;
        }
        assetsDetails({id:this.selectionList[0].id}).then(r => {
          let form = r.data.data
          this.$emit('addEditAssets',{form:form,id:this.selectionList[0].id})
        })
      },
      search(){
        this.page.currentPage = 1
        this.onLoad()
      },
      onLoad(){
        let params = {}
        params['size'] = this.page.pageSize
        params['current'] = this.page.currentPage
        params['moreParamQuery'] = this.moreParamQuery.trim()
        params['propertyName'] = this.propertyName.trim()
        this.loading = true
        assetsTableList(params).then(r => {
          let d = r.data.data
          this.page.total = d.total
          this.tableData = d.records
          this.loading = false
        }).catch(() => {
          this.loading = false
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
          return removeAssets({ids:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }
        })
      },
      searchReset(){
        this.moreParamQuery = ""
        this.propertyName = ""
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
      handleExport(){
        this.$confirm("是否导出固定资产?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-dorm/property/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&moreParamQuery=${this.moreParamQuery.trim()}&propertyName=${this.propertyName.trim()}`
          );
        });
      }
    },
    computed:{
      ...mapGetters(['permission', 'btnicon', 'colorName']),
      permissionList() {
        return {
          editBtn: this.vaildData(this.permission.dorm_dorm_property_edit_btn, false),
          delBtn: this.vaildData(this.permission.dorm_dorm_property_delete_btn, false),
          exportBtn: this.vaildData(this.permission.dorm_dorm_property_export_btn, false),
          importBtn: this.vaildData(this.permission.dorm_dorm_property_import_btn, false),
        };
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      excelOption(){
        return {
        submitBtn: false,
        emptyBtn: false,
        column: [
          {
            label: '模板上传',
            prop: 'file',
            type: 'upload',
            drag: true,
            loadText: '模板上传中，请稍等',
            span: 24,
            propsHttp: {
              res: 'data'
            },
            action: this.action
          },
          {
            label: '模板下载',
            prop: 'excelTemplate',
            formslot: true,
            span: 24,
          }
        ]
       }
      },
      tableColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:"学校名称",
            field:"schoolName",
            sortable:true,
            minWidth:100,
          },
          {
            title:"宿舍编号",
            field:"dormName",
            sortable:true,
            minWidth:100,
          },
          {
            title:"资产编号",
            field:"propertyNum",
            sortable:true,
            minWidth:100,
          },
          {
            title:"物品名称",
            field:"propertyName",
            sortable:true,
            minWidth:100,
          },
          {
            title:"规格或型号",
            field:"propertyType",
            sortable:true,
            minWidth:100,
          },
          {
            title:"单位",
            field:"propertyUnit",
            sortable:true,
            minWidth:100,
          },
          {
            title:"数量",
            field:"propertyCount",
            sortable:true,
            minWidth:100,
          },
        ]
      },
    }
  }
</script>

<style scoped="scoped">
  .imerrText{
    width:100%;
    height:150px;
    border:1px solid #efefef;
    margin-top:10px;
    margin-top: 10px;
    overflow: auto;
    font-size: 14px;
    color: red;}
  .imerrText p{line-height:0px}
</style>
