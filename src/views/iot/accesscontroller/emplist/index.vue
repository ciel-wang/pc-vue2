<template>
  <basic-container>
    <div style="margin-bottom: 8px;">
      <el-input
        style="width:200px;"
        placeholder="请输入方案编号/姓名"
        @keyup.enter.native="search"
        size="small"
        :clearable="true" v-model="searchForm"></el-input>
      <el-select size="small" clearable v-model="inOrOutStatus" placeholder="请选择是否在校" style="width: 150px;margin: 0 10px;">
        <el-option
          v-for="item in isOutArr"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select size="small" clearable v-model="empType" placeholder="请选择" style="width: 150px;margin-right: 10px;">
        <el-option
          v-for="item in empTypeArr"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-download"
        @click="handleExport">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      highlight-hover-row
      :height="tableHeight"
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="cusOptions"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="deptData"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #isOut="{row}">
        <el-tag effect="dark" size="mini" type="danger" v-if="row.isOut == '已离校'">{{row.isOut}}</el-tag>
        <el-tag effect="dark" size="mini" v-else>{{row.isOut}}</el-tag>
      </template>
    </vxe-grid>
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
</template>

<script>
import { getMonitorEmpList } from '@/api/iot/access/monitor';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import SchemaChild from './schema-child';
export default {
  components: { SchemaChild },
  name: 'app',
  data() {
    return {
      searchForm: '',
      loading: false,
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight: 0,
      inOrOutStatus:"",
      isOutArr:[
        {value:'IN',label:"在校"},{value:'OUT',label:"已离校"}
      ],
      selectionList:[],
      empType:1,
      empTypeArr:[
        {value:1,label:"学生"},{value:2,label:"教师"},{value:3,label:"访客"}
      ]
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 272;
    this.search();
  },
  methods: {
    searchReset() {
      this.searchForm = '';
      this.inOrOutStatus = ""
      this.empType = 1
      this.search();
    },
    search(){
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad(this.page)
    },
    onLoad(page, params = {}) {
      this.loading = true;
      params['moreParamQuery'] = this.searchForm.trim();
      params['inOrOutStatus'] = this.inOrOutStatus
      params['empType'] = this.empType;
      getMonitorEmpList(this.page.currentPage, this.page.pageSize, params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        let records = data.records;
        records.forEach(v => {
          v.isWrong = v.isWrong ? '异常' : '正常';
          v.isOut = v.isOut ? '已离校' : '在校';
          v.deptName = v.empType == 1 ? v.className : v.deptName;
        });
        this.deptData = records;
        this.loading = false;
      });
    },
    selectionChange({records}) {
      this.selectionList = records;
    },
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.onLoad(this.page);
    },
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.onLoad(this.page);
    },
    handleExport(){
      this.$confirm('是否导门禁进出记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-basic/dev/schema/mjdata/export?${this.website.tokenHeader}=${getToken()}&current=${this.page.currentPage}&size=${this.page.pageSize}&moreParamQuery=${this.searchForm.trim()}&inOrOutStatus=${this.inOrOutStatus}&ids=${this.ids}&empType=${this.empType}`
        );
      });
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'permission', 'colorName']),
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    cusOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '方案编号',
          field: 'schemaCode',
          sortable: true,
          fixed: "left",
          minWidth: 100,
        },
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          fixed: "left",
          minWidth: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          fixed: "left",
          minWidth: 100,
        },
        {
          title: '进校时间',
          field: 'inDate',
          sortable: true,
          minWidth: 140,
        },
        {
          title: '进校设备',
          field: 'inDevName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '进校门区',
          field: 'inDoorName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '离校时间',
          field: 'outDate',
          sortable: true,
          minWidth: 140,
        },
        {
          title: '离校设备',
          field: 'outDevName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '离校门区',
          field: 'outDoorName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '是否在校',
          field: 'isOut',
          sortable: true,
          minWidth: 100,
          slots:{default:'isOut'}
        },
        {
          title: '部门/班级名称',
          field: 'deptName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          minWidth: 100,
        }
      ]
    }
  },
};
</script>

<style lang="scss" scoped="scoped">
.el-scrollbar {
  height: 100%;
}
</style>
