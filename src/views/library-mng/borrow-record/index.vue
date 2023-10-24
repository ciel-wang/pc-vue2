<template>
  <basicContainer>
    <div class="mbottom8">
      <el-input
        size="small" clearable
        style="width: 160px;margin-right:10px;"
        @keyup.enter.native="search"
        v-model="empName"
        placeholder="请输入学工号/姓名"></el-input>
      <el-date-picker
        v-model="dayDate"
        size="small"
        clearable
        type="daterange"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        style="width: 250px;margin-right: 10px;"
        start-placeholder="借出开始日期"
        range-separator="至"
        end-placeholder="借出结束日期"></el-date-picker>
        <el-date-picker
          v-model="dayDate2"
          size="small"
          clearable
          type="daterange"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          style="width: 250px;margin-right: 10px;"
          start-placeholder="应还开始日期"
          range-separator="至"
          end-placeholder="应还结束日期"></el-date-picker>
        <el-select
          size="small" clearable
          v-model="expireState"
          placeholder="请选择状态"
          style="width: 160px;margin-right: 10px;">
          <el-option
            v-for="item in expireStateArr"
            :key="item.value"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>
        <el-select
          size="small" clearable
          v-model="borrowState"
          placeholder="请选择是否归还"
          style="width: 160px;margin-right: 10px;">
          <el-option
            v-for="item in borrowStateArr"
            :key="item.value"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>
        <el-input
          size="small" clearable
          style="width: 200px;margin-right: 10px;"
          @keyup.enter.native="search"
          v-model="bookName"
          placeholder="请输入书刊输入码/名称"></el-input>
        <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div class="mbottom8">
      <el-button
        type="primary"
        size="small"
        @click="handleReturn"
        v-if="permission.library_borrow_record_return_btn">
        归还</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-download"
        @click="handleExport"
        v-if="permission.library_borrow_record_export_btn"
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
      <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
      <vxe-table-column title="序号" type="seq" fixed="left" width="70"></vxe-table-column>
      <vxe-table-column title="借出时间" minWidth="100" fixed="left" field="borrowStartDate"></vxe-table-column>
      <vxe-table-column title="应还日期" minWidth="100" fixed="left" field="borrowEndDate"></vxe-table-column>
      <vxe-table-column title="逾期天数" minWidth="100" fixed="left" field="overdueDays"></vxe-table-column>
      <vxe-table-column title="是否归还" minWidth="100" field="borrowState">
        <template #default="{row}">
          <i class="icon-xuanzhong" v-if="row.borrowState == 2" :style="{ color: colorName }"></i>
          <i class="icon-weixuanzhong" v-else></i>
        </template>
      </vxe-table-column>
      <vxe-table-column title="书刊名称" minWidth="140" fixed="left" field="bookName"></vxe-table-column>
      <vxe-table-column title="书刊输入码" minWidth="120" field="bookCode"></vxe-table-column>
      <vxe-table-column title="馆藏类型" minWidth="100" field="carrierType"></vxe-table-column>
      <vxe-table-column title="分类号" minWidth="100" field="typeCode"></vxe-table-column>
      <vxe-table-column title="分类名称" minWidth="100" field="typeName"></vxe-table-column>
      <vxe-table-column title="书刊条码" minWidth="100" field="barCode"></vxe-table-column>
      <vxe-table-column title="索书号" minWidth="100" field="bookIndex"></vxe-table-column>
      <vxe-table-column title="书刊定价" minWidth="100" field="pricing"></vxe-table-column>
      <vxe-table-column title="卷册期价格" minWidth="100" field="reelBookPrice"></vxe-table-column>
      <vxe-table-column title="学工号" minWidth="100" field="empCode"></vxe-table-column>
      <vxe-table-column title="读者姓名" minWidth="100" field="empName"></vxe-table-column>
      <vxe-table-column title="读者证卡" minWidth="100" field="physicalCardNum"></vxe-table-column>
      <vxe-table-column title="读者类别" minWidth="100" field="readerGroupName"></vxe-table-column>
      <vxe-table-column title="部门/班级编号" minWidth="100" field="deptNo"></vxe-table-column>
      <vxe-table-column title="部门/班级名称" minWidth="100" field="deptName"></vxe-table-column>
      <vxe-table-column title="已续借次数" minWidth="100" field="continueBorrowCount"></vxe-table-column>
      <vxe-table-column title="续借日期" minWidth="100" field="continueBorrowDate"></vxe-table-column>
      <vxe-table-column title="归还时间" minWidth="140" field="bookReturnDate"></vxe-table-column>
      <vxe-table-column title="归还操作员" minWidth="100" field="bookReturnOprtUser"></vxe-table-column>
      <vxe-table-column title="借出操作员" minWidth="100" field="createUser"></vxe-table-column>
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
  </basicContainer>
</template>

<script>
  import moment from 'moment'
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import { mapGetters } from 'vuex';
  import { getEmpBookList, sendReturnBook } from '@/api/library-mng/emp-books.js'

  export default{
    data(){
      return{
        empName:"",
        bookName:"",
        dayDate:[],
        dayDate2:[],
        expireState:"",
        expireStateArr:[
          {value:1,label:"到期"},
          {value:2,label:"逾期"}
        ],
        loading:false,
        tableData:[],
        selectionList:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        borrowStateArr:[
          {value:1,label:"否"},
          {value:2,label:"是"}
        ],
        borrowState:1
      }
    },
    mounted() {
      this.dayDate2 = [moment().format('YYYY-MM-DD'),moment().format('YYYY-MM-DD')]
    },
    methods:{
      handleReturn(){
        if ( this.selectionList.length === 0) return this.$message.warning("请选择至少一条数据");
        sendReturnBook({ids:this.ids.split(',')}).then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.onLoad()
          }else{
            this.$message.error(r.data.msg);
          }
        })
      },
      handleExport(){
        this.$confirm("是否导出借阅记录?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-library/borrow-data/list/export?${website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&empName=${this.empName}&bookName=${this.bookName.toLocaleUpperCase()}&borrowStartDate_StartDate=${this.dayDate && this.dayDate[0] || ''}&borrowStartDate_EndDate=${this.dayDate && this.dayDate[1] || ''}&borrowEndDate_StartDate=${this.dayDate2 && this.dayDate2[0] || ''}&borrowEndDate_EndDate=${this.dayDate2 && this.dayDate2[1] || ''}&borrowState=${this.borrowState}&expireState=${this.expireState}`
          );
        });
      },
      search(){
        this.page.currentPage = 1;
        this.selectionList = [];
        this.onLoad();
      },
      searchReset(){
        this.empName = "";
        this.bookName = "";
        this.dayDate = [];
        this.dayDate2 = [];
        this.borrowState = 1;
        this.expireState = "";
        this.search();
      },
      onLoad(){
        let params = {}
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['empName'] = this.empName;
        params['bookName'] = this.bookName.toLocaleUpperCase();
        params['borrowStartDate_StartDate'] = this.dayDate && this.dayDate[0] || '';
        params['borrowStartDate_EndDate'] = this.dayDate && this.dayDate[1] || '';
        params['borrowEndDate_StartDate'] = this.dayDate2 && this.dayDate2[0] || '';
        params['borrowEndDate_EndDate'] = this.dayDate2 && this.dayDate2[1] || '';
        params['borrowState'] = this.borrowState;
        params['expireState'] = this.expireState;
        this.loading = true;
        getEmpBookList(params).then(r => {
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
      ...mapGetters(['permission','colorName']),
      ids() {
        let ids = this.selectionList.map(v => v.id);
        return ids.join(",");
      },
      tableHeight(){
        return window.innerHeight-236-77;
      }
    }
  }
</script>

<style>
</style>
