<template>
  <div>
    <div style="margin-bottom: 8px;">
      <el-input
        style="width: 160px;margin-right: 10px;"
        size="small" clearable
        @keyup.enter.native="search"
        v-model="gcName"
        placeholder="请输入年/班级名称"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="primary" size="small" icon="el-icon-check" @click="submit">提交</el-button>
    </div>
    <vxe-grid
      border
      resizable
      highlight-hover-row
      :height="tableHeight"
      ref="crud"
      size="mini"
      align="center"
      :columns="options"
      :data="tabelData"
      :loading="loading"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange"
    ></vxe-grid>
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
        :hide-on-single-page="false"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { classKqList } from '@/api/kq/classesgroup.js';
export default {
  data() {
    return {
      gcName: '',
      tabelData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight: '',
      selectionList: [],
      loading: false
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 280;
    this.onLoad();
  },
  methods: {
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.gcName = '';
      this.search();
    },
    submit() {
      if (this.selectionList.length <= 0) {
        this.$message.error('请选择数据');
        return;
      }
      this.$emit('refreshPage', { ids: this.ids, type: 4, classNames: this.classNames });
      this.$refs['crud'].clearCheckboxRow();
      this.selectionList = [];
      this.gcName = '';
    },
    onLoad() {
      this.loading = true;
      let params = {};
      params['current'] = this.page.currentPage;
      params['size'] = this.page.pageSize;
      if (this.gcName) {
        params['gcName'] = this.gcName.trim();
      }
      classKqList(params).then(r => {
        if (r.data.code == 200) {
          this.loading = false;
          let d = r.data.data;
          this.page.total = d.total;
          d.records.forEach(v => {
            v.className = v.gradeName + v.className
          })
          this.tabelData = d.records;
        }
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
    selectionChange({ records }) {
      this.selectionList = records;
    }
  },
  computed: {
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.classId);
      });
      return ids.join(',');
    },
    classNames() {
      let classNames = [];
      this.selectionList.forEach(ele => {
        classNames.push(ele.className);
      });
      return classNames.join(',');
    },
    options() {
      return [
        { type: 'checkbox', width: 60 },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '班级名称',
          field: 'className',
          sortable: true,
          minWidth: 100
        },
        {
          title: '班级人数',
          field: 'empCount',
          sortable: true,
          minWidth: 100
        },
      ];
    }
  }
};
</script>
