<template>
  <basic-container>
    <div>
      <el-input
        style="width: 200px;margin-right: 10px;"
        size="small"
        @keyup.enter.native="search"
        v-model="sqlNo"
        placeholder="请输入编号"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete">删除</el-button>
      <el-button type="primary" size="small" icon="el-icon-upload2" @click="handleImport">导入</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      show-overflow="ellipsis"
      :height="tableHeight"
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="Data"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #textSql="{row}">
        <pre>{{ row.textSql }}</pre>
      </template>
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
    <report-add-edit ref="reportAddEditRef" @refreshPage="search"></report-add-edit>
    <importInfo ref="importInfoRef" @refeshPage="search"></importInfo>
    
  </basic-container>
</template>

<script>
import { cussqlList, cussqlUpdate, cussqlRrmove, cussqlAdd, cussqlDetails } from '@/api/interface/interface.js';
import reportAddEdit from '../report/report-add-edit.vue';
import importInfo from '@/views/iot/components/teacher-import-info.vue'
import website from '@/config/website';
import { getToken } from '@/util/auth';

export default {
  components: { reportAddEdit,importInfo },
  data() {
    return {
      sqlNo: '',
      Data: [],
      page: {
        pageSize: 20,
        currentPage: 1,
        total: 0
      },
      tableHeight: '',
      loading: false,
      selectionList: []
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 310;
    this.onLoad();
  },
  methods: {
    handleImport(){
      this.$refs.importInfoRef.openDialog('datavSql')
    },
    handleExport(){
      if(this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
      this.$confirm('是否导出大屏接口?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(`/api/iot-sql/cussql/export?${website.tokenHeader}=${getToken()}&ids=${this.ids}`);
      });
    },
    search() {
      this.selectionList = [];
      this.page.currentPage = 1;
      this.onLoad();
    },
    searchReset() {
      this.sqlNo = '';
      this.search();
    },
    handleAdd() {
      this.$refs.reportAddEditRef.openDialog({ sqlType: 2 });
    },
    handleEdit() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      cussqlDetails({id:this.selectionList[0].id}).then(r => {
        if(r.data.code === 200){
          let details = r.data.data;
          this.$refs.reportAddEditRef.openDialog({sqlType:2,details:details});
        }
      })
    },
    handleDelete() {
      if (this.selectionList.length < 1) {
        this.$message.warning('请选择要删除的班次');
        return;
      }
      this.$confirm('确定要删除这条数据？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return cussqlRrmove({ ids: this.ids });
      }).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          this.onLoad();
        } else {
          this.$message.error(r.data.msg);
        }
      });
    },
    onLoad() {
      this.loading = true;
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      if (this.sqlNo) {
        params['sqlNo'] = this.sqlNo.trim();
      }
      params['sqlType'] = 2;
      cussqlList(params).then(res => {
        this.loading = false;
        if (res.data.code == 200) {
          let d = res.data.data;
          this.page.total = d.total;
          this.Data = d.records;
        }
      });
    },
    selectionChange({records}) {
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
  computed: {
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        {
          title: '编号',
          field: 'sqlNo',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '名称',
          field: 'scriptName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: 'SQL',
          field: 'textSql',
          sortable: true,
          minWidth: 300,
          slots: {default:'textSql'},
          align: 'left'
        },
        {
          title: '统计SQL',
          field: 'countSql',
          sortable: true,
          minWidth: 300,
          visible:false,
          align: 'left'
        },
        {
          title: '添加时间',
          field: 'createTime',
          sortable: true,
          minWidth: 140,
        },
        {
          title: '更新人员姓名',
          field: 'updateUserName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '更新时间',
          field: 'updateTime',
          sortable: true,
          minWidth: 140,
        }
      ]
    }
  }
};
</script>
