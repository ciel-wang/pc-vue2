<template>
  <basic-container>
    <div class="mbottom8">
      <el-date-picker
        v-model="dayDate"
        size="small"
        :clearable="false"
        type="datetimerange"
        format="yyyy-MM-dd HH:mm:ss"
        value-format="yyyy-MM-dd HH:mm:ss"
        :default-time="['00:00:00', '23:59:59']"
        style="width: 340px;"
        start-placeholder="开始日期"
        range-separator="至"
        end-placeholder="结束日期"
      ></el-date-picker>
      <el-input
        size="small" clearable
        style="width: 200px;margin: 0 10px;"
        @keyup.enter.native="search"
        v-model="moreParamQuery"
        placeholder="请输入学工号/姓名"></el-input>
      <el-input
        size="small" clearable
        style="width: 200px;"
        @keyup.enter.native="search"
        v-model="deptParamQuery"
        placeholder="请输入部门/年级名称"></el-input>
      <el-input
        size="small" clearable
        style="width: 200px;margin: 0 10px;"
        @keyup.enter.native="search"
        v-model="devParamQuery"
        placeholder="请输入设备编号/名称"></el-input>
      <el-select v-model="dataType" placeholder="请选择卡点类型" size="small" clearable style="width: 160px;margin-right: 10px;">
        <el-option v-for="item in dataTypeDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="danger" size="small" @click="handleDelete">删除卡点</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      :height="tableHeight"
      ref="xGrid"
      size="mini"
      align="center"
      :highlight="true"
      :columns="tableColumn"
      :loading="loading"
      :checkbox-config="{checkField:'checked'}"
      :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
      :data="tableData"
      :export-config="{}"
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent"
    ></vxe-grid>

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
        :hide-on-single-page="false"
      ></el-pagination>
    </div>
  </basic-container>
</template>

<script>
import { kqMjdata, removeMjdata } from '@/api/kq/mjdata.js';
import moment from 'moment';
import { mapGetters } from 'vuex';
import { getToken } from '@/util/auth';

export default {
  data() {
    return {
      moreParamQuery: '',
      deptParamQuery: '',
      devParamQuery: '',
      tableData: [],
      loading: false,
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight: '',
      dayDate: '',
      dataType: '',
      dataTypeDic: [
        { value: 1, label: '原始记录' },
        { value: 2, label: '单据补卡' },
        { value: 3, label: '系统补卡' },
        { value: 5, label: '手工签卡' },
      ],
      selectionList: []
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 264;
    let dayStartDateStr = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    let dayEndDateStr = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    this.dayDate = [dayStartDateStr, dayEndDateStr];
    this.onLoad();
  },
  methods: {
    handleDelete() {
      if (this.selectionList.length === 0) {
        return this.$message.warning('请选择至少一条数据');
      }
      let index = this.selectionList.findIndex(v => v.dataType != 5);
      if (index >= 0) return this.$message.warning('请选择手工签卡的数据');
      let datas = this.selectionList.map(v => ({ id: v.id, swipeTime: v.swipeTime }));
      this.$confirm('确定删除当前数据卡点?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeMjdata({ datas });
      }).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          this.onLoad();
        } else {
          this.$message.error(r.data.msg);
        }
      });
    },
    search() {
      this.selectionList = [];
      this.page.currentPage = 1;
      this.onLoad();
    },
    searchReset() {
      let dayStartDateStr = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      let dayEndDateStr = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.dayDate = [dayStartDateStr, dayEndDateStr];
      this.moreParamQuery = '';
      this.deptParamQuery = '';
      this.devParamQuery = '';
      this.dataType = '';
      this.onLoad();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery.trim();
      }
      params['deptParamQuery'] = this.deptParamQuery.trim();
      params['devParamQuery'] = this.devParamQuery.trim();
      params['startTime'] = this.dayDate[0];
      params['endTime'] = this.dayDate[1];
      params['dataType'] = this.dataType;
      this.loading = true;
      kqMjdata(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let data = r.data.data;
          this.page.total = data.total;
          data.records.forEach(v => v.checked = false);
          this.tableData = data.records;
        }
      }).catch(err => {
        this.loading = false;
      });
    },
    handleExport() {
      this.$confirm('是否导出进出记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-kq/mjdata/export?${this.website.tokenHeader}=${getToken()}&current=${this.page.currentPage}&moreParamQuery=${this.moreParamQuery.trim()}&size=${this.page.pageSize}&deptParamQuery=${this.deptParamQuery.trim()}&devParamQuery=${this.devParamQuery.trim()}&startTime=${this.dayDate[0] || ''}&endTime=${this.dayDate[1] || ''}&dataType=${this.dataType}`
        );
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
        exportBtn: this.vaildData(this.permission.kq_daysts_every_day_export_btn, false)
      };
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 60, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          minWidth: 90,
          fixed: 'left'
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100,
          fixed: 'left'
        },
        {
          title: '区域名称',
          field: 'areaName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '门区名称',
          field: 'doorName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '设备编号',
          field: 'devCode',
          sortable: true,
          minWidth: 100
        },
        {
          title: '设备名称',
          field: 'devName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '刷卡/脸时间',
          field: 'swipeTime',
          sortable: true,
          minWidth: 140
        },
        {
          title: '上报时间',
          field: 'createTime',
          sortable: true,
          minWidth: 140
        },
        {
          title: '数据来源',
          field: 'dataType',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            cellValue = cellValue === 4 ? 3 : cellValue;
            let item = this.dataTypeDic.find(v => v.value === cellValue);
            return item ? item.label : '';
          }
        },
        {
          title: '部门/年级名称',
          field: 'deptName',
          sortable: true,
          minWidth: 160
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '备注',
          field: 'remark',
          sortable: true,
          minWidth: 100
        }
      ];
    }
  }
};
</script>
