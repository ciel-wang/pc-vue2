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
            style="width: 250px;margin-right: 10px;"
            clearable
            @keyup.enter.native="search"
            v-model.trim="bookName"
            placeholder="请输入书刊输入码/名称/ISBN/ISSN">
          </el-input>
          <el-select
            size="small" clearable
            v-model="carrierType"
            placeholder="请选择馆藏类型"
            style="width: 160px;margin-right: 10px;">
            <el-option
              v-for="item in carrierTypeArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"></el-option>
          </el-select>
          <el-input
            size="small"
            style="width: 200px;margin-right: 10px;"
            clearable
            @keyup.enter.native="search"
            v-model="publisherUnit"
            placeholder="请输入出版单位">
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
        <vxe-toolbar ref="xToolbar" custom>
          <template #buttons>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="handleAdd"
              v-if="permission.library_periodical_add_btn">
              添加</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="handleEdit"
              v-if="permission.library_periodical_edit_btn">
              编辑</el-button>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="handleDelete"
              v-if="permission.library_periodical_del_btn"
              >删除</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-upload2"
              @click="handleImportInfo"
              v-if="permission.library_periodical_import_btn"
              >导入</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              @click="handleExport"
              v-if="permission.library_periodical_export_btn"
              >导出</el-button>
          </template>
        </vxe-toolbar>
        <vxe-table
          border
          resizable
          ref="xTable"
          size="mini"
          auto-resize
          show-overflow
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
          <vxe-table-column title="序号" type="seq" width="100" fixed="left"></vxe-table-column>
          <vxe-table-column title="ISBN/ISSN" minWidth="160" fixed="left" field="bookIsbn"></vxe-table-column>
          <vxe-table-column title="书刊名称" minWidth="140" fixed="left" field="bookName"></vxe-table-column>
          <vxe-table-column title="输入码" minWidth="120" field="bookCode"></vxe-table-column>
          <vxe-table-column title="著者" minWidth="100" field="bookAuthor"></vxe-table-column>
          <vxe-table-column title="馆藏类型" minWidth="100" field="carrierType"></vxe-table-column>
          <vxe-table-column title="分类号" minWidth="100" field="typeCode"></vxe-table-column>
          <vxe-table-column title="分类名称" minWidth="100" field="typeName"></vxe-table-column>
          <vxe-table-column title="出版单位" minWidth="100" field="publisherUnit"></vxe-table-column>
          <vxe-table-column title="出版地" minWidth="100" field="publishAddr"></vxe-table-column>
          <vxe-table-column title="出版日期" minWidth="100" field="publishDate"></vxe-table-column>
          <vxe-table-column title="书刊定价" minWidth="100" field="pricing"></vxe-table-column>
          <vxe-table-column title="总册数" minWidth="100" field="totalCount"></vxe-table-column>
          <vxe-table-column title="借出册数" minWidth="100" field="lendCount"></vxe-table-column>
          <vxe-table-column title="剩余册数" minWidth="100" field="surplusCount"></vxe-table-column>
          <vxe-table-column title="主题词" minWidth="100" field="subject"></vxe-table-column>
          <vxe-table-column title="丛编名" minWidth="100" field="secondName"></vxe-table-column>
          <vxe-table-column title="书刊版次" minWidth="100" field="publishEdition"></vxe-table-column>
          <vxe-table-column title="书刊语言" minWidth="100" field="bookLanguage"></vxe-table-column>
          <vxe-table-column title="载体形态" minWidth="100" field="carrierMode"></vxe-table-column>
          <vxe-table-column title="附件" minWidth="100" field="bookAccessory"></vxe-table-column>
          <vxe-table-column title="CN刊号" minWidth="100" field="bookCn"></vxe-table-column>
          <vxe-table-column title="出版周期" minWidth="100" field="publishPeriod"></vxe-table-column>
          <vxe-table-column title="主办单位" minWidth="100" field="hostUnit"></vxe-table-column>
          <vxe-table-column title="备注" show-overflow minWidth="140" field="bookDesc"></vxe-table-column>
          <vxe-table-column title="登记日期" minWidth="150" field="createTime"></vxe-table-column>
          <vxe-table-column title="操作员" minWidth="120" field="createUser"></vxe-table-column>
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
  import { getBookMenuList, removeBookPeriodicals } from "@/api/library-mng/books-periodicals.js"
  import { getDictCode } from "@/api/iot/teacher.js"

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
        typeId:"",
        publisherUnit:"",
        carrierType:"",
        carrierTypeArr:[]
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
      getDictCode({keys:"lbCarrierType"}).then(r => {
        let d = r.data.data;
        let lbCarrierType = d.lbCarrierType.map(v => ({value:v.value,label:v.value}));
        this.carrierTypeArr = lbCarrierType;
      })
    },
    methods:{
      handleAdd(){
        this.$router.push({path:'/library-mng/books-periodical-info'})
      },
      handleEdit(){
        if ( this.selectionList.length !== 1) {
          this.$message.warning("请选择一条数据");
          return;
        }
        let bookIsbn = this.selectionList[0].bookIsbn;
        this.$router.push({path:'/library-mng/books-periodical-info',query: {bookIsbn}})
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
          return removeBookPeriodicals({ids:this.ids.split(',')});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }else{
            this.$message.error(res.data.msg)
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
        this.typeId = "";
        this.publisherUnit = "";
        this.carrierType = "";
        this.$refs.booksCategoryZtreeRef.cancelSelect();
        this.search();
      },
      ztreeClick(treeNode){
        this.typeId = treeNode.value;
        this.search();
      },
      onLoad(){
        let params = {}
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['bookName'] = this.bookName.toLocaleUpperCase();
        params['typeId'] = this.typeId;
        params['publisherUnit'] = this.publisherUnit;
        params['carrierType'] = this.carrierType;
        this.loading = true
        getBookMenuList(params).then(r => {
          this.loading = false;
          if(r.data.code === 200){
            let d = r.data.data;
            this.page.total = d.total;
            this.tableData = d.records;
          }
        }).catch(() => this.loading = false)
      },
      handleImportInfo(){
        this.$refs.importInfoRef.openDialog('booksPeriodicals');
      },
      handleExport(){
        this.$confirm("是否导出书刊目录?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-library/booklist/list/export?${website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&bookName=${this.bookName.toLocaleUpperCase()}&typeId=${this.typeId}&carrierType=${this.carrierType}&publisherUnit=${this.publisherUnit}`
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
      ids(){
        let ids = this.selectionList.map(v => v.id);
        return ids.join(",");
      }
    }
  }
</script>

<style>
</style>
