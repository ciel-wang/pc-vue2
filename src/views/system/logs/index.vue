<template>
  <!-- 第一步-->
  <basic-container>
    <div class="box">
      <avue-crud
        :option="options"
        :table-loading="loading"
        @selection-change="selectionChange"
        ref="crud"
        :data="data"
        :page.sync="page"
        @current-change="currentChange"
        @size-change="sizeChange"
      >
        <template slot="menuLeft">
          <div>
            <el-input style="width:160px;margin-right:10px;" v-model="oprtEmpName" size="small" placeholder="请输入操作员姓名" @keyup.enter.native="search"></el-input>
            <el-input style="width:160px;margin-right:10px;" v-model="title" size="small" placeholder="请输入标题" @keyup.enter.native="search"></el-input>
            <el-input style="width:160px;margin-right:10px;" v-model="remark" size="small" placeholder="请输入描述" @keyup.enter.native="search"></el-input>
            <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
            <el-button type="primary" size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
          </div>
        </template>
      </avue-crud>
    </div>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { getBizOprtLogList } from '@/api/system/logs';

export default {
  data() {
    return {
      rechargeWellet: true,
      title: '',
      remark: '',
      oprtEmpName: '',
      empCategory: null,
      selectionList: [],
      moreQueryParam: '',
      loading: false,
      ids: '',
      data: [],
      page: {
        pageSize: 10,
        pageSizes: [10, 30, 50, 100],
        currentPage: 1,
        total: 0
      }
    };
  },
  computed: {
    ...mapGetters(['colorName']),
    options() {
      return {
        height: window.innerHeight - 247,
        calcHeight: 80,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        indexLabel: '序号',
        refreshBtn: false,
        filterBtn: false,
        border: true,
        columnBtn: true,
        index: true,
        indexWidth: 70,
        align: 'center',
        selection: false,
        menu: false,
        viewBtn: false,
        emptyBtnText: '重置',
        addBtn: false,
        dialogClickModal: false,
        column: [
          {
            label: '模块',
            prop: 'module',
            sortable: true,
            width: 80,
            display: false
          },
          {
            label: '类型',
            prop: 'type',
            sortable: true,
            width: 80,
            display: false
          },
          {
            label: '标题',
            prop: 'title',
            sortable: true,
            width: 130,
            display: false
          },
          {
            label: '描述',
            prop: 'remark',
            sortable: true,
            display: false
          },
          {
            label: '操作对象',
            prop: 'entityName',
            sortable: true,
            width: 130,
            display: false
          },
          {
            label: '操作员',
            prop: 'username',
            sortable: true,
            width: 100,
            display: false
          },
          {
            label: '操作状态',
            prop: 'isSuccess',
            sortable: true,
            width: 100,
            display: false
          },
          {
            label: '操作时间',
            prop: 'createTime',
            sortable: true,
            width: 130,
            display: false
          },
          {
            label: '操作前数据',
            prop: 'beforeData',
            sortable: true,
            display: false,
            hide: true
          },
          {
            label: '操作后数据',
            prop: 'afterData',
            sortable: true,
            display: false,
            hide: true
          }
        ]
      };
    }
  },
  mounted() {
    this.onLoad(this.page);
  },
  methods: {
    reset() {
      this.title = '';
      this.oprtEmpName = '';
      this.remark = '';
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad(this.page);
    },
    onLoad(page, params = {}) {
      this.loading = true;
      if (this.remark) {
        params['remark'] = this.remark.trim();
      }
      if (this.oprtEmpName) {
        params['oprtEmpName'] = this.oprtEmpName.trim();
      }
      if (this.title) {
        params['title'] = this.title.trim();
      }
      getBizOprtLogList(this.page.currentPage, this.page.pageSize, params).then(res => {
        const data = res.data.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          if (v.type == 1) {
            v.type = '新增';
          } else if (v.type == 2) {
            v.type = '修改';
          } else if (v.type == 3) {
            v.type = '删除';
          } else if (v.type == 4) {
            v.type = '上传';
          } else if (v.type == 5) {
            v.type = '导出';
          }

          if (v.module == 1) {
            v.module = '基础资料';
          } else if (v.module == 2) {
            v.module = '门禁';
          } else if (v.module == 3) {
            v.module = '消费';
          } else if (v.module == 4) {
            v.module = '访客';
          } else if (v.module == 5) {
            v.module = '考勤';
          } else if (v.module == 6) {
            v.module = '会议';
          } else if (v.module == 7) {
            v.module = '车辆';
          }

          if (v.isSuccess == 1) {
            v.isSuccess = '成功';
          }
        });
        this.data = data.records;
        this.loading = false;
        this.selectionClear();
      }).catch(() => this.loading = false);
    },
    clearData() {
      this.selectionList = [];
      this.selectionClear();
      this.empData = [];
      this.$forceUpdate();
    },
    selectionChange(rows) {
      this.selectionList = rows;
    },
    selectionClear() {
      this.selectionList = [];
      this.$refs.crud.toggleSelection();
    },
    currentChange(currentPage) {
      this.page.currentPage = currentPage;
      this.onLoad(this.page);
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize;
      this.page.currentPage = 1;
      this.onLoad(this.page);
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  height: 800px;
  height: 100%;
  overflow: auto;
}

/deep/.el-table thead > tr > th:nth-child(1) > div {
  height: 26px !important;
}
</style>
