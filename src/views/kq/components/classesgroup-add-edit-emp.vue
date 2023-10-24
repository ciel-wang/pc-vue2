<template>
  <div>
    <div style="margin-bottom: 8px;">
      <el-input
        style="width: 150px;"
        size="small" clearable
        @keyup.enter.native="search"
        v-model="moreParamQuery"
        placeholder="请输入学工号/姓名"></el-input>
      <el-input
        style="width: 150px;margin: 0 10px;"
        size="small" clearable
        @keyup.enter.native="search"
        v-model="deptName"
        placeholder="请输入部门编号/名称"></el-input>
      <el-select size="small" clearable v-model="empCategory" placeholder="人员分类" style="width: 150px;">
        <el-option v-for="item in userCategoryDict" :key="item.dictKey" :label="item.dictValue" :value="item.dictKey"></el-option>
      </el-select>
      <el-select size="small" clearable v-model="empStatus" placeholder="人员状态" style="margin:0 10px;width: 150px;">
        <el-option v-for="item in userStatus" :key="item.dictKey" :label="item.dictValue" :value="item.dictKey"></el-option>
      </el-select>
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
import { classesgroupEmplist } from '@/api/kq/classesgroup.js';
import { getDictCode } from "@/api/iot/teacher.js"
export default {
  data() {
    return {
      form: {},
      moreParamQuery: '',
      deptName: '',
      tabelData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight: '',
      selectionList: [],
      loading: false,
      empCategory: '',
      userCategoryDict: [],
      empStatus: '',
      userStatus: [],
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 280;
    getDictCode({keys:"studentStatus#studentCategory#userStatus#userCategory"}).then(r => {
      let d = r.data.data
      d.studentCategory.forEach(v => {
        v.dictValue = v.dictValue + ' (学生)'
      })
      d.studentStatus.forEach(v => {
        v.dictValue = v.dictValue + ' (学生)'
      })
      d.userCategory.forEach(v => {
        v.dictValue = v.dictValue + ' (教师)'
      })
      d.userStatus.forEach(v => {
        v.dictValue = v.dictValue + ' (教师)'
      })
      this.userCategoryDict = [...d.studentCategory,...d.userCategory]
      this.userStatus = [...d.studentStatus,...d.userStatus]
    })
    this.onLoad();
  },
  methods: {
    search() {
      this.page.currentPage = 1
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.moreParamQuery = '';
      this.deptName = '';
      this.empCategory = '';
      this.empStatus = '';
      this.search();
    },
    submit() {
      if (this.selectionList.length <= 0) {
        this.$message.error('请选择数据');
        return;
      }
      this.$emit('refreshPage', { ids: this.ids, type: 1, empNames: this.empNames });
      this.$refs['crud'].clearCheckboxRow();
      this.selectionList = [];
      this.moreParamQuery = '';
      this.deptName = '';
      this.empCategory = '';
      this.empStatus = '';
    },
    onLoad() {
      this.loading = true;
      let params = {};
      params['current'] = this.page.currentPage;
      params['size'] = this.page.pageSize;
      params['empCategory'] = this.empCategory;
      params['empStatus'] = this.empStatus;
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery.trim();
      }
      if (this.deptName) {
        params['deptName'] = this.deptName.trim();
      }
      classesgroupEmplist(params).then(r => {
        if (r.data.code == 200) {
          this.loading = false;
          let d = r.data.data;

          this.page.total = d.total;
          d.records.forEach(v => {
            v.deptName = v.empType == 1 ? v.className : v.deptName
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
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    empNames() {
      let empNames = [];
      this.selectionList.forEach(ele => {
        empNames.push(ele.empName);
      });
      return empNames.join(',');
    },
    options() {
      return [
        { type: 'checkbox', width: 60 },
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          minWidth: 100
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '部门名称',
          field: 'deptName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          minWidth: 100
        },
      ];
    }
  }
};
</script>

