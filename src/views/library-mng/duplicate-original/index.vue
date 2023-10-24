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
            style="width: 240px;margin-right: 10px;"
            clearable
            @keyup.enter.native="search"
            v-model.trim="bookName"
            placeholder="请输入书刊条码/名称/ISBN/ISSN">
          </el-input>
          <el-select
            size="small" clearable
            v-model="bookState"
            placeholder="请选择书刊状态"
            style="width: 160px;margin-right: 10px;">
            <el-option
              v-for="item in bookStateArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"></el-option>
          </el-select>
          <avue-input-tree
            multiple
            v-model="bookPeriodicalsIds"
            placeholder="请选择所在架位"
            type="tree"
            size="small"
            style="width: 180px;margin-right: 10px;"
            :props="{value:'valueStr'}"
            :dic="libraryZtreeDic"></avue-input-tree>
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
        <vxe-toolbar ref="xToolbar" custom>
          <template #buttons>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="handleDelete"
              v-if="permission.library_duplicate_del_btn"
              >删除</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-upload2"
              @click="handleImportInfo"
              v-if="permission.library_duplicate_import_btn"
              >导入</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              @click="handleExport"
              v-if="permission.library_duplicate_export_btn"
              >导出</el-button>
          </template>
        </vxe-toolbar>
        <vxe-table
          border
          resizable
          ref="xTable"
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
          <vxe-table-column title="序号" type="seq" fixed="left" width="100"></vxe-table-column>
          <vxe-table-column title="书刊条码" minWidth="100" fixed="left" field="barCode"></vxe-table-column>
          <vxe-table-column title="书刊状态" minWidth="100" fixed="left" field="bookState">
            <template #default="{row}">
              <el-tag effect="dark" type="success" size="mini" v-if="row.bookState == 1">可借</el-tag>
              <el-tag effect="dark" type="warning" size="mini" v-if="row.bookState == 2">破损</el-tag>
              <el-tag effect="dark" type="warning" size="mini" v-if="row.bookState == 3">遗失</el-tag>
              <el-tag effect="dark" size="mini" v-if="row.bookState == 4">保留</el-tag>
              <el-tag effect="dark" type="info" size="mini" v-if="row.bookState == 5">注销</el-tag>
              <el-tag effect="dark" type="danger" size="mini" v-if="row.bookState == 6">借出</el-tag>
            </template>
          </vxe-table-column>
          <vxe-table-column title="索书号" minWidth="100" fixed="left" field="bookIndex"></vxe-table-column>
          <vxe-table-column title="所在书室" minWidth="100" field="libraryName"></vxe-table-column>
          <vxe-table-column title="书刊架位" minWidth="100" field="bookPeriodicalsNum"></vxe-table-column>
          <vxe-table-column title="卷册期信息" minWidth="100" field="reelBookInfo"></vxe-table-column>
          <vxe-table-column title="卷册期价格" minWidth="100" field="reelBookPrice"></vxe-table-column>
          <vxe-table-column title="ISBN/ISSN" minWidth="160" field="bookIsbn"></vxe-table-column>
          <vxe-table-column title="书刊名称" minWidth="140" field="bookName"></vxe-table-column>
          <vxe-table-column title="输入码" minWidth="120" field="bookCode"></vxe-table-column>
          <vxe-table-column title="著者" minWidth="100" field="bookAuthor"></vxe-table-column>
          <vxe-table-column title="馆藏类型" minWidth="100" field="carrierType"></vxe-table-column>
          <vxe-table-column title="分类号" minWidth="100" field="typeCode"></vxe-table-column>
          <vxe-table-column title="分类名称" minWidth="100" field="typeName"></vxe-table-column>
          <vxe-table-column title="出版单位" minWidth="100" field="publisherUnit"></vxe-table-column>
          <vxe-table-column title="出版地" minWidth="100" field="publishAddr"></vxe-table-column>
          <vxe-table-column title="出版日期" minWidth="100" field="publishDate"></vxe-table-column>
          <vxe-table-column title="书刊定价" minWidth="100" field="pricing"></vxe-table-column>
          <vxe-table-column title="主题词" minWidth="100" field="subject"></vxe-table-column>
          <vxe-table-column title="丛编名" minWidth="100" field="secondName"></vxe-table-column>
          <vxe-table-column title="书刊版次" minWidth="100" field="publishEdition"></vxe-table-column>
          <vxe-table-column title="书刊语言" minWidth="100" field="bookLanguage"></vxe-table-column>
          <vxe-table-column title="载体形态" minWidth="100" field="carrierMode"></vxe-table-column>
          <vxe-table-column title="附件" minWidth="100" field="bookAccessory"></vxe-table-column>
          <vxe-table-column title="CN刊号" minWidth="100" field="bookCn"></vxe-table-column>
          <vxe-table-column title="出版周期" minWidth="100" field="publishPeriod"></vxe-table-column>
          <vxe-table-column title="主办单位" minWidth="100" field="hostUnit"></vxe-table-column>
          <vxe-table-column title="内容简介" show-overflow minWidth="140" field="bookContent"></vxe-table-column>
          <vxe-table-column title="备注" show-overflow minWidth="140" field="bookDesc"></vxe-table-column>
          <vxe-table-column title="复本登记日期" minWidth="150" field="ectypeCreateTime"></vxe-table-column>
          <vxe-table-column title="复本操作员" minWidth="120" field="ectypeCreateUser"></vxe-table-column>
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

      <importInfo ref="importInfoRef" @refeshPage="search"></importInfo>
    </el-col>
  </el-row>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import booksCategoryZtree from '../books-category-ztree.vue'
  import importInfo from '@/views/iot/components/teacher-import-info.vue'
  import { removeBookDuplicate } from "@/api/library-mng/books-periodicals.js"
  import { getBookDuplicateList } from "@/api/library-mng/duplicate-original.js"
  import { getLibraryZtreeDic } from '@/api/library-mng/book-room-mng.js'

  export default{
    components:{ importInfo, booksCategoryZtree },
    data(){
      return{
        ztreeHeightL:0,
        tableHeight:0,
        bookName:"",
        loading:false,
        tableData:[],
        selectionList:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        bookState:"",
        bookStateArr:[
          {value:1,label:"可借"},
          {value:2,label:"破损"},
          {value:3,label:"遗失"},
          {value:4,label:"保留"},
          {value:5,label:"注销"},
          {value:6,label:"借出"}
        ],
        typeId:"",
        libraryZtreeDic:[],
        bookPeriodicalsIds:[]
      }
    },
    created () {
      this.$nextTick(() => {
        this.$refs.xTable.connect(this.$refs.xToolbar)
      })
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.tableHeight=window.innerHeight-236-77;
      this.search()
    },
    activated() {
      getLibraryZtreeDic({treeKey:'lb#lp'}).then(r => {
        this.libraryZtreeDic = r.data.data;
      })
    },
    methods:{
      handleDelete(){
        if ( this.selectionList.length == 0) {
          this.$message.warning("请选择要删除的数据");
          return;
        }
        let flag = this.selectionList.filter(v => v.bookState == 6);
        if(flag.length) return this.$message.warning("请选择非借出状态的数据！")
        this.$confirm("确定要删除选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return removeBookDuplicate({ids:this.ids.split(',')});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }else{
            this.$message.error(res.data.data)
          }
        })
      },
      search(){
        this.page.currentPage = 1;
        this.selectionList = [];
        this.onLoad();
      },
      searchReset(){
        this.bookName = "";
        this.bookState = "";
        this.typeId = "";
        this.bookPeriodicalsIds = [];
        this.$refs.booksCategoryZtreeRef.cancelSelect();
        this.search();
      },
      ztreeClick(treeNode){
        this.typeId = treeNode.value;
        this.search()
      },
      onLoad(){
        let params = {}
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['bookName'] = this.bookName.toLocaleUpperCase();
        params['bookState'] = this.bookState;
        params['typeId'] = this.typeId;
        let arr = this.bookPeriodicalsIds.filter(item => item.startsWith('lbp'));
        let arr2 = arr.map(v => v.split('-')[1]);
        params['bookPeriodicalsIds'] = arr2.join(',');
        this.loading = true
        getBookDuplicateList(params).then(r => {
          this.loading = false;
          if(r.data.code === 200){
            let d = r.data.data;
            this.page.total = d.total;
            this.tableData = d.records;
          }
        }).catch(() => this.loading = false)
      },
      handleImportInfo(){
        this.$refs.importInfoRef.openDialog('duplicateOriginal');
      },
      handleExport(){
        this.$confirm("是否导出复本列表?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let arr = this.bookPeriodicalsIds.filter(item => item.startsWith('lbp'));
          let arr2 = arr.map(v => v.split('-')[1]);
          window.open(
            `/api/iot-library/booklist-ectype/list/export?${website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&bookName=${this.bookName.toLocaleUpperCase()}&typeId=${this.typeId}&bookState=${this.bookState}&bookPeriodicalsIds=${arr2.join(',')}`
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
      }
    },
    computed:{
      ...mapGetters(['permission']),
      ids() {
        let ids = this.selectionList.map(v => v.id);
        return ids.join(",");
      }
    }
  }
</script>

<style>
</style>
