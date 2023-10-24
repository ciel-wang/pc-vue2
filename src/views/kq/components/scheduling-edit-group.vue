<template>
  <div>
    <el-row>
      <el-col :span="4" style="width: 150px;">
        <el-input size="small" clearable @keyup.enter.native="search" v-model="moreParamQuery" placeholder="请输入分组编号/名称"></el-input>
      </el-col>
      <el-col style="width: 250px;margin-left: 10px;">
        <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
        <el-button type="primary" size="small" icon="el-icon-check" @click="submit">提交</el-button>
      </el-col>
    </el-row>
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
import { classesgroupEmplist, classesgroupSelectlist } from '@/api/kq/classesgroup.js';
export default {
  data() {
    return {
      tabelData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight: '',
      selectionList: [],
      loading: false,
      moreParamQuery:""
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 280;
    this.search();
  },
  methods: {
    search() {
      this.page.currentPage = 1
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.moreParamQuery = ''
      this.search();
    },
    submit() {
      if (this.selectionList.length <= 0) {
        this.$message.error('请选择数据');
        return;
      }
      this.$emit('refreshPage', { ids: this.ids, type: 3 });
      this.$refs['crud'].clearCheckboxRow();
      this.selectionList = [];
    },
    onLoad() {
      this.loading = true;
      let params = {};
      params['current'] = this.page.currentPage;
      params['size'] = this.page.pageSize;
      params['moreParamQuery'] = this.moreParamQuery.trim()
      classesgroupSelectlist(params).then(r => {
        if (r.data.code == 200) {
          this.loading = false;
          let d = r.data.data;
          this.page.total = d.total;
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
        ids.push(ele.groupName);
      });
      return ids.join(',');
    },
    options() {
      return [
        { type: 'checkbox', width: 60 },
        {
          title: '分组名称',
          field: 'groupName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '分组总人数',
          field: 'count',
          sortable: true,
          minWidth: 100
        }
      ];
    }
  }
};
</script>

