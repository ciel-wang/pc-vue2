<template>
  <basic-container>
    <div class="mbottom8">
      <el-input
        style="width: 160px;margin-right: 10px;"
        size="small" clearable
        @keyup.enter.native="searchR"
        v-model="moreParamQuery"
        placeholder="请输入访客姓名"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="searchR">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="danger" size="small" icon="el-icon-close" @click="handleRemove" v-if="permission.visitor_black_export_btn">取消黑名单</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-upload2"
        @click="handlerImport"
        >导入黑名单</el-button>
    </div>
    <vxe-grid
      border
      resizable
      highlight-hover-row
      :height="tableHeight"
      ref="xGrid"
      size="mini"
      align="center"
      :highlight="true"
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="blacklistData"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
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

    <importInfo ref="importInfoRef" @refeshPage="searchR"></importInfo>
  </basic-container>
</template>

<script>
import { blacklistList, levelRemove } from '@/api/visitor/blacklist';
import { mapGetters } from 'vuex';
import importInfo from '@/views/iot/components/teacher-import-info.vue'

export default {
  components:{ importInfo },
  data() {
    return {
      tableHeight: 0,
      blacklistData: [],
      moreParamQuery: '',
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      loading: false,
      selectionList: []
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 272;
    this.onLoad(this.page);
  },
  methods: {
    handlerImport(){
      this.$refs.importInfoRef.openDialog("blackEmp")
    },
    // 加载数据
    onLoad(page, params = {}) {
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery.trim();
      }
      this.loading = true;
      blacklistList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        let data = res.data.data;
        this.page.total = data.total;
        let records = data.records;
        this.blacklistData = records;
        this.loading = false;
      });
    },
    searchR() {
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad(this.page);
    },
    // 重置
    searchReset() {
      this.moreParamQuery = '';
      this.searchR();
    },
    handleRemove() {
      if (this.selectionList.length === 0) return this.$message.warning('请至少选择一条数据');
      this.$confirm('确定将选择数据取消黑名单?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return levelRemove({ ids: this.ids });
      }).then((r) => {
        this.onLoad(this.page);
        this.$message.success(r.data.msg);
      });
    },
    // 表单选中变化时
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
  },
  computed: {
    ...mapGetters(['permission']),
    ids() {
      let ids = this.selectionList.map(v => v.id);
      return ids.join(',');
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '访客姓名',
          field: 'visitorName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '来访单位',
          field: 'companyName',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '手机号码',
          field: 'visitorPhone',
          sortable: true,
          minWidth: 100,
        },{
           title: "证件编号",
           field: "visitorCertificateCode",
           sortable: true,
           minWidth: 140,
        },
        {
          title: '操作时间',
          field: 'createTime',
          sortable: true,
          minWidth: 140,
        },
        {
          title: '操作员',
          field: 'oprtName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '加入黑名单原因',
          field: 'visitorCause',
          sortable: true,
          minWidth: 130,
        }
      ]
    }
  }
};
</script>
