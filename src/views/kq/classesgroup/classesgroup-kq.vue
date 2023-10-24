<template>
  <div>
    <div>
      <el-input
        style="width: 200px;margin-right: 10px;"
        size="small" clearable
        @keyup.enter.native="search"
        v-model="moreParamQuery" placeholder="请输入分组名称"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permissionList.addBtn">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permissionList.editBtn">编辑</el-button>
      <el-button type="primary" size="small" @click="handleRange" v-if="permissionList.rangBtn">适用范围</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permissionList.delBtn">删除</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permissionList.exportBtn">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      :height="tableHeight"
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="tabelData"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #timeStepTimes="{row}">
        <div>
          <p style="margin: 0;" v-if="row.timeSteps1">上下班时间：{{ row.timeSteps1 }}</p>
          <p style="margin: 0;" v-if="row.timeSteps2">上下班时间：{{ row.timeSteps2 }}</p>
          <p style="margin: 0;" v-if="row.timeSteps3">上下班时间：{{ row.timeSteps3 }}</p>
        </div>
      </template>
      <template #weeks="{row}">
        <div style="text-align: left;">
          <div style="display: flex;flex-wrap: wrap;">出勤日：
            <span style="width: 48px;" v-for="(v, i) in row.workday" :key="i">
              <span>{{ weekdays[v - 1] }}</span>
              <span v-if="i != row.workday.length - 1">、</span>
            </span>
          </div>
          <div style="display: flex;flex-wrap: wrap;color: #999;">休息日：
            <div style="width: 48px;" v-for="(v, i) in row.dayoff" :key="i">
              <span>{{ weekdays[v - 1] }}</span>
              <span v-if="i != row.dayoff.length - 1">、</span>
            </div>
          </div>
        </div>
      </template>
      <template #isKq="{row}">
        <i class="icon-xuanzhong" v-if="row.isKq == 1" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
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
    <classesgroup-add-edit ref="classesgroupaddRef" @refreshPage="search"></classesgroup-add-edit>
    <receipt-auditscope ref="receiptAuditscopeRef" @refreshPage="search"></receipt-auditscope>
  </div>
</template>

<script>
import { getClassesgroupList, classesgroupRemove, classesgroupDetails } from '@/api/kq/classesgroup.js';
import classesgroupAddEdit from './classesgroup-add-edit.vue';
import receiptAuditscope from '../components/receipt-auditscope.vue';
import { mapGetters } from 'vuex';
import { getToken } from '@/util/auth';
export default {
  components: { classesgroupAddEdit, receiptAuditscope },
  props:['activeName'],
  data() {
    return {
      moreParamQuery: '',
      loading: false,
      tabelData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight: '',
      selectionList: [],
      weekdays: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天']
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 367;
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
      this.onLoad();
    },
    handleAdd() {
      this.$refs['classesgroupaddRef'].openDialog();
    },
    handleEdit() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      let id = this.selectionList[0].id;
      classesgroupDetails({ id: id }).then(r => {
        if (r.data.code == 200) {
          let d = r.data.data;
          d['id'] = id;
          this.$refs['classesgroupaddRef'].openDialog(d);
        }
      });
    },
    handleRange() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      let id = this.selectionList[0].id;
      this.$refs['receiptAuditscopeRef'].openDialog({ type: 'classesgroup', id: id });
    },
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return classesgroupRemove({ ids: this.ids });
      }).then(r => {
        if (r.data.code == 200) {
          this.onLoad();
          this.$message({
            type: 'success',
            message: '操作成功!'
          });
        }
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
      getClassesgroupList(params).then(r => {
        if (r.data.code == 200) {
          this.loading = false;
          let data = r.data.data;
          this.page.total = data.total;
          let arr1 = [1, 2, 3, 4, 5, 6, 7];
          data.records.forEach(v => {
            let arr = v.timeSteps.split('#');
            v.timeSteps1 = arr[0];
            v.timeSteps2 = arr[1];
            v.timeSteps3 = arr[2];
            v.dayoff = [];
            v.workday = [];
            arr1.forEach(i => {
              if (v.weeks.includes(i)) {
                v.dayoff.push(i);
              } else {
                v.workday.push(i);
              }
            });
          });
          this.tabelData = data.records;
        }
      });
    },
    handleExport() {
      this.$confirm('是否导出考勤分组?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-kq/classes/group/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&moreParamQuery=${this.moreParamQuery.trim()}&size=${this.page.pageSize}&current=${this.page.currentPage}`
        );
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
    ...mapGetters(['permission', 'btnicon', 'colorName']),
    permissionList() {
      return {
        addBtn: this.vaildData(this.permission.kq_classesgroup_add_btn, false),
        delBtn: this.vaildData(this.permission.kq_classesgroup_del_btn, false),
        editBtn: this.vaildData(this.permission.kq_classesgroup_edit_btn, false),
        exportBtn: this.vaildData(this.permission.kq_classesgroup_export_btn, false),
        rangBtn: this.vaildData(this.permission.kq_classesgroup_range_btn, false)
      };
    },
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
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '分组名称',
          field: 'groupName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '人数',
          field: 'count',
          sortable: true,
          minWidth: 90,
        },
        {
          title: '是否考勤',
          field: 'isKq',
          sortable: true,
          minWidth: 100,
          slots: {default:"isKq"}
        },
        {
          title: '考勤班次',
          field: 'classesTimeName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '考勤时间',
          field: 'timeStepTimes',
          sortable: true,
          minWidth: 120,
          slots: {default:"timeStepTimes"}
        },
        {
          title: '假日方案',
          field: 'holidayName',
          sortable: true,
          minWidth: 90,
        },
        {
          title: '出勤日',
          field: 'weeks',
          sortable: true,
          minWidth: 160,
          slots: {default:"weeks"}
        }
      ]
    }
  }
};
</script>
