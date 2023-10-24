<template>
  <basic-container>
    <div class="mbottom8">
      <el-input size="small" clearable @keyup.enter.native="search" v-model="holidayName" placeholder="请输入假日方案名称" style="width: 200px;"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div class="mbottom8">
      <el-button type="primary" size="small" icon="el-icon-plus" v-if="permissionList.addBtn" @click="handleAdd">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" v-if="permissionList.editBtn" @click="handleEdit">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" v-if="permissionList.delBtn" @click="handleDelete">删除</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" v-if="permissionList.exportBtn" @click="handleExport">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      :height="tableHeight"
      keep-source
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="options"
      :loading="loading"
      :data="holidayData"
      :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent">
      <template #isDefault="{row}">
        <i class="icon-xuanzhong" v-if="row.isDefault" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>
      <template #isStatutory="{row}">
        <i class="icon-xuanzhong" v-if="row.isStatutory" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>
      <template #weeks="{row}">
        <div style="text-align: left;">
          <div style="display: flex;flex-wrap: wrap;">
            <span>出勤日：</span>
            <span style="width: 48px;" v-for="(v, i) in row.workday" :key="i">
              <span>{{ weekdays[v - 1] }}</span>
              <span v-if="i != row.workday.length - 1">、</span>
            </span>
          </div>
          <div style="display: flex;flex-wrap: wrap;color: #999;">
            <span>休息日：</span>
            <div style="width: 48px;" v-for="(v, i) in row.dayoff" :key="i">
              <span>{{ weekdays[v - 1] }}</span>
              <span v-if="i != row.dayoff.length - 1">、</span>
            </div>
          </div>
        </div>
      </template>
    </vxe-grid>
    <div style="min-height: 52px;text-align: right;">
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

    <holiday-add-edit ref="holidayaddeditref" @refreshPage="search" :kqHolidayDic="kqHolidayDic"></holiday-add-edit>
  </basic-container>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';
import { getToken } from '@/util/auth';
import website from "@/config/website";
import holidayAddEdit from './holiday-add-edit.vue';
import { getHolidayList, holidayDetails, holidayRemove } from '@/api/kq/holiday.js';
import { getDictCode } from "@/api/iot/teacher.js"

export default {
  components: { holidayAddEdit },
  data() {
    return {
      holidayName: '',
      holidayData: [],
      form: {},
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      weekdays: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'],
      selectionList: [],
      loading: false,
      kqHolidayDic: []
    };
  },
  mounted() {
    this.search();
  },
  activated() {
    getDictCode({ keys: 'kqHolidayNames' }).then(r => {
      let d = r.data.data.kqHolidayNames || [];
      let arr = d.map(v => ({ value: v.key, label: v.value }));
      this.kqHolidayDic = arr;
    });
  },
  methods: {
    search() {
      this.selectionList = [];
      this.page.currentPage = 1;
      this.onLoad();
    },
    searchReset() {
      this.holidayName = '';
      this.search();
    },
    handleAdd() {
      this.$refs['holidayaddeditref'].openDialog();
    },
    handleEdit() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一个假日方案');
        return;
      }
      let holidayNum = this.selectionList[0].id;
      holidayDetails({ id: holidayNum }).then(res => {
        if (res.data.code == 200) {
          let details = res.data.data;
          details['id'] = holidayNum;
          this.$refs['holidayaddeditref'].openDialog(details);
        }
      });
    },
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm('确定要删除选择的数据？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return holidayRemove({ ids: this.ids });
      }).then(() => {
        this.onLoad();
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
      });
    },
    handleExport() {
      this.$confirm('是否导出假日方案?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-kq/holiday/export?${website.tokenHeader}=${getToken()}&ids=${this.ids}&size=${this.page.pageSize}&current=${this.page.currentPage}&holidayName=${this.holidayName.trim()}`
        );
      });
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['holidayName'] = this.holidayName.trim();
      getHolidayList(params).then(res => {
        if (res.data.code == 200) {
          this.loading = false;
          let d = res.data.data;
          this.page.total = d.total;
          let arr = [1, 2, 3, 4, 5, 6, 7];
          d.records.forEach(v => {
            if (v.isDefault == 1) {
              v.isDefault = true;
            } else {
              v.isDefault = false;
            }
            if (v.isStatutory == 1) {
              v.isStatutory = true;
            } else {
              v.isStatutory = false;
            }
            if (v.startMonth) {
              v.Datemonth = v.startMonth.substr(0, 7) + ' 至 ' + v.endMonth.substr(0, 7);
            }
            v.dayoff = [];
            v.workday = [];
            arr.forEach(i => {
              if (v.weeks.includes(i)) {
                v.dayoff.push(i);
              } else {
                v.workday.push(i);
              }
            });
          });
          this.holidayData = d.records;
        }
      });
    },
    checkboxChangeEvent({ records }) {
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
    }
  },
  computed: {
    ...mapGetters(['permission', 'btnicon', 'colorName']),
    permissionList() {
      return {
        addBtn: this.vaildData(this.permission.kq_holiday_add_btn, false),
        delBtn: this.vaildData(this.permission.kq_holiday_del_btn, false),
        editBtn: this.vaildData(this.permission.kq_holiday_edit_btn, false),
        exportBtn: this.vaildData(this.permission.kq_holiday_export_btn, false)
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    tableHeight() {
      return window.innerHeight - 302;
    },
    options() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '方案编号',
          field: 'holidayNum',
          sortable: true,
          minWidth: 100
        },
        {
          title: '方案名称',
          field: 'holidayName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '是否默认',
          field: 'isDefault',
          sortable: true,
          minWidth: 100,
          slots: { default: 'isDefault' }
        },
        {
          title: '法定节假日排休',
          field: 'isStatutory',
          sortable: true,
          minWidth: 100,
          slots: { default: 'isStatutory' }
        },
        {
          title: '应用范围',
          field: 'Datemonth',
          sortable: true,
          minWidth: 100
        },
        {
          title: '出勤日',
          field: 'weeks',
          sortable: true,
          minWidth: 240,
          slots: { default: 'weeks' }
        }
      ];
    }
  }
};
</script>

<style scoped>
>>> .avue-crud__pagination {
  height: 32px !important;
}
>>> .avue-crud__menu {
  min-height: 0 !important;
}
</style>
