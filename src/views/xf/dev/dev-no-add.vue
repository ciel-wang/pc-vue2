<template>
  <el-dialog
    title="待添加设备"
    :visible.sync="dialogVisible"
    width="80%"
    :modal-append-to-body="true"
    :append-to-body="true"
    :close-on-press-escape="false"
    top="1vh"
    :close-on-click-modal="false"
    :before-close="handleClose">
    <vxe-grid
      border
      resizable
      highlight-hover-row
      :height="tableHeight"
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :toolbar-config="{slots: { buttons: 'toolbar_buttons' }}"
      :data="data"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #toolbar_buttons>
        <el-input 
          style="width: 150px;" 
          size="small" 
          v-model="moreQueryParam" 
          placeholder="请填写学工号/姓名"></el-input>
        <el-input 
          size="small" 
          style="width: 150px;margin: 0 10px;"
          v-model="devQuery" 
          placeholder="请填写设备编号/名称"></el-input>
        <el-select style="width: 150px;" v-model="downCon" clearable="true" size="small" placeholder="按介质搜索">
          <el-option 
            v-for="item in empAuths" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value"></el-option>
        </el-select>
        <el-select style="width: 150px;margin: 0 10px;" v-model="isAuth" clearable="true" size="small" placeholder="按权限搜索">
          <el-option 
            v-for="item in auths" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value"></el-option>
        </el-select>
        <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      </template>
    </vxe-grid>
    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[20, 50, 100,200, 500]"
        :page-size="page.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :hide-on-single-page="false">
      </el-pagination>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { geEmpAuthtListByDev } from '@/api/xf/xfdev';
import website from '@/config/website';
import { getToken } from '@/util/auth';

export default {
  data() {
    return {
      selectionList: [],
      dialogVisible: false,
      moreQueryParam: null,
      devQuery: null,
      loading: false,
      downCon: null,
      isAuth: null,
      data: [],
      page: {
        pageSize: 20,
        currentPage: 1,
        total: 0
      }
    };
  },
  computed: {
    ...mapGetters(['colorName']),
    options() {
      return [
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '设备编号',
          field: 'empCode',
          sortable: true,
          width: 100,
          fixed: 'left',
        },
        {
          title: '设备SN',
          field: 'empName',
          sortable: true,
          width: 100,
          fixed: 'left',
        },
        {
          title: '设备IP',
          field: 'devCode',
          sortable: true,
          width: 100,
        },
        {
          title: '设备MAC地址',
          field: 'devName',
          sortable: true,
        },
        {
          title: '最后一次心跳时间',
          field: 'isFaceAuth',
          sortable: true,
          width: 150,
        }
      ]
    }
  },
  mounted() {
    this.onLoad(this.page);
  },
  methods: {
    openDialog() {
      this.dialogVisible = true;
      this.data = [];
    },
    searchReset() {
      this.moreQueryParam = '';
      this.devQuery = ""
      this.downCon = ""
      this.isAuth = ""
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    onLoad(page, params = {}) {
      this.loading = true;
      if (this.moreQueryParam) {
        params['moreQueryParam'] = this.moreQueryParam;
      }
      if (this.devQuery) {
        params['devQuery'] = this.devQuery;
      }
      if (this.downCon) {
        params['downCon'] = this.downCon;
      }
      params['isAuth'] = this.isAuth;
      geEmpAuthtListByDev(this.page.currentPage, this.page.pageSize, params).then(res => {
        this.data = res.data.data.records;
        this.data.forEach(v => {
          v.isCardAuth = v.isCardAuth == 0 ? '无权' : '有权';
          v.isFaceAuth = v.isFaceAuth == 0 ? '无权' : '有权';
        });
        this.page.total = res.data.data.total;
        this.loading = false;
      });
    },
    search() {
      let param = {};
      this.onLoad(this.page, param);
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
  }
};
</script>

<style scoped lang="scss">
.el-scrollbar {
  height: 100%;
}
.center_open::before {
  left: 7px !important;
}
</style>
