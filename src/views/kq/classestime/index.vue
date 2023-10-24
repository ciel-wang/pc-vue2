<template>
  <basic-container>
    <div>
      <el-input 
        size="small" clearable
        style="width: 200px;margin-right: 10px;" 
        @keyup.enter.native="search" 
        v-model="moreParamQuery" 
        placeholder="请输入班次编号/名称"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permissionList.addBtn">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permissionList.editBtn">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permissionList.delBtn">删 除</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permissionList.exportBtn">导出</el-button>
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
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="classesTimeData"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #kqTime="{row}">
        <div>
          <div v-if="row.kqTime1">上下班时间：{{ row.kqTime1 }}</div>
          <div v-if="row.kqTime2">上下班时间：{{ row.kqTime2 }}</div>
          <div v-if="row.kqTime3">上下班时间：{{ row.kqTime3 }}</div>
        </div>
      </template>
    </vxe-grid>
    <div style="min-height: 52px;text-align: right;padding-top: 25px;">
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
    <classestime-add-edit ref="classestimeAddEditRef" @refreshPage="search"></classestime-add-edit>
  </basic-container>
</template>

<script>
import classestimeAddEdit from './classestime-add-edit.vue';
import { getClassestimeList, classestimeDetails, classestimeRemove } from '@/api/kq/classestime.js';
import { getToken } from '@/util/auth';
import { mapGetters } from 'vuex';
export default {
  components: { classestimeAddEdit },
  data() {
    return {
      moreParamQuery: '',
      classesTimeData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight: '',
      loading: false,
      selectionList: []
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 313;
    this.onLoad();
  },
  methods: {
    search() {
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad();
    },
    searchReset() {
      this.moreParamQuery = '';
      this.search();
    },
    handleAdd() {
      this.$refs['classestimeAddEditRef'].openDialog('add');
    },
    handleEdit() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一个要编辑的班次');
        return;
      }
      let id = this.selectionList[0].classesTimeNum;
      classestimeDetails({ classesTimeNum: id }).then(res => {
        if (res.data.code == 200) {
          let details = res.data.data;
          this.$refs['classestimeAddEditRef'].openDialog('edit',details);
        }
      });
    },
    handleDelete() {
      if (this.selectionList.length < 1) {
        this.$message.warning('请选择要删除的班次');
        return;
      }
      this.$confirm('确定要删除选择班次？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return classestimeRemove({ classesTimeNums: this.ids });
      }).then(res => {
        if (res.data.code == 200) {
          this.$message.success(res.data.msg);
          this.onLoad();
        }
      }).catch(error => {
        console.log(error);
      });
    },
    handleExport() {
      this.$confirm('是否导出班次管理数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(`/api/iot-kq/classestime/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}`);
      });
    },
    onLoad() {
      this.loading = true;
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery.trim();
      }
      getClassestimeList(params).then(res => {
        this.loading = false;
        if (res.data.code == 200) {
          let d = res.data.data;
          this.page.total = d.total;
          d.records.forEach(v => {
            let arr = v.timeSteps.split('#');
            v.kqTime1 = arr[0];
            v.kqTime2 = arr[1];
            v.kqTime3 = arr[2];
          });
          this.classesTimeData = d.records;
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
    ...mapGetters(['permission', 'btnicon']),
    permissionList() {
      return {
        addBtn: this.vaildData(this.permission.kq_classestime_add_btn, false),
        delBtn: this.vaildData(this.permission.kq_classestime_del_btn, false),
        editBtn: this.vaildData(this.permission.kq_classestime_edit_btn, false),
        exportBtn: this.vaildData(this.permission.kq_classestime_export_btn, false)
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.classesTimeNum);
      });
      return ids.join(',');
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '班次编号',
          field: 'classesTimeNum',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '班次名称',
          field: 'classesTimeName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '考勤时间',
          field: 'kqTime',
          sortable: true,
          minWidth: 100,
          slots: {default:"kqTime"}
        },
        {
          title: '排序',
          field: 'classesTimeSeq',
          sortable: true,
          minWidth: 100,
        }
      ]
    }
  }
};
</script>

<style scoped></style>
