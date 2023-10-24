<template>
  <basic-container>
    <el-tabs v-model="receiptType" @tab-click="tabClick">
      <div style="margin-bottom: 8px;">
        <el-date-picker
          v-model="receiptTime"
          size="small"
          value-format="yyyy-MM-dd"
          type="daterange"
          :clearable="false"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 250px;"></el-date-picker>
        <el-input
          style="width: 160px;margin:0 10px;"
          size="small" clearable
          @keyup.enter.native="search"
          v-model.trim="moreParamQuery"
          placeholder="请输入学工号/姓名"></el-input>
        <el-input
          style="width: 180px;margin-right: 10px;"
          size="small" clearable
          v-show="receiptType == 2"
          @keyup.enter.native="search"
          v-model.trim="togetherName"
          placeholder="请输入同行人编号/姓名"></el-input>
        <el-select size="small" clearable v-model="receiptStatus" placeholder="请选择单据状态" style="width: 150px;margin-right: 10px;">
          <el-option
            v-for="item in receiptStatusArr"
            :key="item.value"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>
        <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      </div>
      <el-tab-pane label="请假单" name="1">
        <div style="margin-bottom: 8px;">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permissionList.addBtnqj">添加</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permissionList.delBtnqj">删除</el-button>
          <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permissionList.exportBtnqj">导出</el-button>
          <el-button icon="el-icon-view" @click="rowView" size="small" type="primary">查看</el-button>
        </div>
        <vxe-grid
          v-show="receiptType == 1"
          :sync-resize="receiptType"
          border
          resizable
          highlight-hover-row
          :height="tableHeight"
          ref="leaveCrud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="leaveOptions"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="leaveData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #receiptStatus="{row}">
            <el-tag type="info" size="mini" effect="dark" v-if="row.receiptStatus == 1">待审批</el-tag>
            <el-tag effect="dark" size="mini" v-if="row.receiptStatus == 2">审批中</el-tag>
            <el-tag effect="dark" size="mini" type="success" v-if="row.receiptStatus == 3">已同意</el-tag>
            <el-tag effect="dark" size="mini" type="danger" v-if="row.receiptStatus == 4">已拒绝</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 5">已撤销</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 6">已超时</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 7">已作废</el-tag>
          </template>
          <template #isLeave="{row}">
            <i class="icon-xuanzhong" v-if="row.isLeave == 1" :style="{ color: colorName }"></i>
            <i class="icon-weixuanzhong" v-else></i>
          </template>
        </vxe-grid>
      </el-tab-pane>
      <el-tab-pane label="出差单" name="2">
        <div style="margin-bottom: 8px;">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permissionList.addBtncc">添加</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permissionList.delBtncc">删除</el-button>
          <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permissionList.exportBtncc">导出</el-button>
          <el-button icon="el-icon-view" @click="rowView" size="small" type="primary">查看</el-button>
        </div>
        <vxe-grid
          v-show="receiptType == 2"
          :sync-resize="receiptType"
          border
          resizable
          :height="tableHeight"
          ref="businessCrud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="businessOptions"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="businessData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #receiptStatus="{row}">
            <el-tag type="info" size="mini" effect="dark" v-if="row.receiptStatus == 1">待审批</el-tag>
            <el-tag effect="dark" size="mini" v-if="row.receiptStatus == 2">审批中</el-tag>
            <el-tag effect="dark" size="mini" type="success" v-if="row.receiptStatus == 3">已同意</el-tag>
            <el-tag effect="dark" size="mini" type="danger" v-if="row.receiptStatus == 4">已拒绝</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 5">已撤销</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 6">已超时</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 7">已作废</el-tag>
          </template>
        </vxe-grid>
      </el-tab-pane>
      <el-tab-pane label="加班单" name="3">
        <div style="margin-bottom: 8px;">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permissionList.addBtnjb">添加</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permissionList.delBtnjb">删除</el-button>
          <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permissionList.exportBtnjb">导出</el-button>
          <el-button icon="el-icon-view" @click="rowView" size="small" type="primary">查看</el-button>
        </div>
        <vxe-grid
          v-show="receiptType == 3"
          :sync-resize="receiptType"
          border
          resizable
          :height="tableHeight"
          ref="overtimeCrud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="overtimeOptions"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="overtimeData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #receiptStatus="{row}">
            <el-tag type="info" size="mini" effect="dark" v-if="row.receiptStatus == 1">待审批</el-tag>
            <el-tag effect="dark" size="mini" v-if="row.receiptStatus == 2">审批中</el-tag>
            <el-tag effect="dark" size="mini" type="success" v-if="row.receiptStatus == 3">已同意</el-tag>
            <el-tag effect="dark" size="mini" type="danger" v-if="row.receiptStatus == 4">已拒绝</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 5">已撤销</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 6">已超时</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 7">已作废</el-tag>
          </template>
        </vxe-grid>
      </el-tab-pane>
      <el-tab-pane label="补卡单" name="4">
        <div style="margin-bottom: 8px;">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permissionList.addBtnbk">添加</el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permissionList.delBtnbk">删除</el-button>
          <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permissionList.exportBtnbk">导出</el-button>
          <el-button icon="el-icon-view" @click="rowView" size="small" type="primary">查看</el-button>
        </div>
        <vxe-grid
          v-show="receiptType == 4"
          :sync-resize="receiptType"
          border
          resizable
          :height="tableHeight"
          ref="reissuecardCrud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="reissuecardOptions"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="reissuecardData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #receiptStatus="{row}">
            <el-tag type="info" size="mini" effect="dark" v-if="row.receiptStatus == 1">待审批</el-tag>
            <el-tag effect="dark" size="mini" v-if="row.receiptStatus == 2">审批中</el-tag>
            <el-tag effect="dark" size="mini" type="success" v-if="row.receiptStatus == 3">已同意</el-tag>
            <el-tag effect="dark" size="mini" type="danger" v-if="row.receiptStatus == 4">已拒绝</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 5">已撤销</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 6">已超时</el-tag>
            <el-tag effect="dark" size="mini" type="warning" v-if="row.receiptStatus == 7">已作废</el-tag>
          </template>
          <template #startTime="{row}">
            <div v-for="(v,i) in row.bkTimeSteps" :key="i">{{v}}</div>
          </template>
        </vxe-grid>
      </el-tab-pane>
    </el-tabs>
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
    <receipt-add-edit ref="receiptAddEditRef" @refreshPage="search"></receipt-add-edit>
    <receipt-view ref="receiptViewRef"></receipt-view>
  </basic-container>
</template>

<script>
import moment from 'moment';
import receiptAddEdit from '../components/receipt-add-edit.vue';
import { receiptList, receiptDetails, receiptRemove } from '@/api/kq/receipt.js';
import receiptView from '../components/receipt-view.vue';
import { getToken } from '@/util/auth';
import { mapGetters } from 'vuex';

export default {
  components: { receiptAddEdit, receiptView },
  data() {
    return {
      receiptType: '1',
      loading: false,
      leaveData: [],
      businessData: [],
      overtimeData: [],
      reissuecardData: [],
      tableHeight: '',
      moreParamQuery: '',
      selectionList: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      receiptTime:[],
      receiptStatus:"",
      receiptStatusArr:[
        // {value:1,label:"待审批"},
        {value:2,label:"审批中"},
        {value:3,label:"已同意"},
        {value:4,label:"已拒绝"},
        {value:5,label:"已撤销"},
        {value:7,label:"已作废"}
      ],
      togetherName:""
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 367;
    let start = moment().format('YYYY-MM-DD');
    let end = moment().format('YYYY-MM-DD');
    this.receiptTime = [start, end];
    this.onLoad();
  },
  methods: {
    handleAdd() {
      this.$refs.receiptAddEditRef.openDialog({ type: this.receiptType });
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
        return receiptRemove({ ids: this.ids });
      }).then(() => {
        this.onLoad();
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
      });
    },
    rowView() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      let row = this.selectionList[0];
      receiptDetails({ id: row.id }).then(r => {
        if (r.data.code == 200) {
          let d = r.data.data;
          this.$refs.receiptViewRef.openDialog({ type: this.receiptType, d: d });
        }
      });
    },
    handleExport() {
      this.$confirm('是否导出单据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let moreParamQuery = this.moreParamQuery;
        window.open(
          `/api/iot-kq/receipt/list/export?${this.website.tokenHeader}=${getToken()}&current=${this.page.currentPage}&ids=${this.ids}&moreParamQuery=${moreParamQuery}&size=${this.page.pageSize}&receiptType=${this.receiptType}&receiptStatus=${this.receiptStatus}&dayStartDateStr=${this.receiptTime[0] || ''}&dayEndDateStr=${this.receiptTime[1] || ''}&togetherName=${this.togetherName}`
        );
      });
    },
    onLoad() {
      this.loading = true;
      let params = {};
      params['current'] = this.page.currentPage;
      params['size'] = this.page.pageSize;
      params['receiptType'] = this.receiptType;
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery;
      }
      params['receiptStatus'] = this.receiptStatus;
      params['dayStartDateStr'] = this.receiptTime[0] || ''
      params['dayEndDateStr'] = this.receiptTime[1] || '';
      params['togetherName'] = this.togetherName;
      receiptList(params).then(r => {
        if (r.data.code == 200) {
          this.loading = false;
          let d = r.data.data;
          this.page.total = d.total;
          if(this.receiptType != 3){
            d.records.forEach(v => {
              v.dateRange = v.startTime + ' 至 ' + v.endTime;
              v.duration = (v.duration / 60).toFixed(1);
            });
          }else{
            d.records.forEach(v => {
              v.dateRange = v.startTime.substr(0,10) + ' 至 ' + v.endTime.substr(0,10);
              v.duration = (v.duration / 60).toFixed(1);
            });
          }
          if (this.receiptType == 1) {
            this.leaveData = d.records;
          }
          if (this.receiptType == 2) {
            this.businessData = d.records;
          }
          if (this.receiptType == 3) {
            this.overtimeData = d.records;
          }
          if (this.receiptType == 4) {
            this.reissuecardData = d.records;
          }
        }
      }).catch(() => this.loading = false);
    },
    tabClick(v) {
      this.page.total = 0
      this.page.pageSize = 20
      this.page.currentPage = 1;
      this.receiptType = v.name;
      this.searchReset();
    },
    search() {
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad();
    },
    selectionChange({records}) {
      this.selectionList = records;
    },
    searchReset() {
      this.moreParamQuery = '';
      this.receiptStatus = ""
      let start = moment().format('YYYY-MM-DD');
      let end = moment().format('YYYY-MM-DD');
      this.receiptTime = [start, end];
      this.search();
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
        addBtnqj: this.vaildData(this.permission.kq_receipt_qj_add_btn, false),
        delBtnqj: this.vaildData(this.permission.kq_receipt_qj_del_btn, false),
        editBtnqj: this.vaildData(this.permission.kq_receipt_qj_edit_btn, false),
        exportBtnqj: this.vaildData(this.permission.kq_receipt_qj_export_btn, false),

        addBtncc: this.vaildData(this.permission.kq_receipt_cc_add_btn, false),
        delBtncc: this.vaildData(this.permission.kq_receipt_cc_del_btn, false),
        editBtncc: this.vaildData(this.permission.kq_receipt_cc_edit_btn, false),
        exportBtncc: this.vaildData(this.permission.kq_receipt_cc_export_btn, false),

        addBtnjb: this.vaildData(this.permission.kq_receipt_jb_add_btn, false),
        delBtnjb: this.vaildData(this.permission.kq_receipt_jb_del_btn, false),
        editBtnjb: this.vaildData(this.permission.kq_receipt_jb_edit_btn, false),
        exportBtnjb: this.vaildData(this.permission.kq_receipt_jb_export_btn, false),

        addBtnbk: this.vaildData(this.permission.kq_receipt_bk_add_btn, false),
        delBtnbk: this.vaildData(this.permission.kq_receipt_bk_del_btn, false),
        editBtnbk: this.vaildData(this.permission.kq_receipt_bk_edit_btn, false),
        exportBtnbk: this.vaildData(this.permission.kq_receipt_bk_export_btn, false)
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    leaveOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '请假类型',
          field: 'roleName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '请假时间',
          field: 'dateRange',
          sortable: true,
          minWidth: 240,
        },
        {
          title: '请假时长(h)',
          field: 'duration',
          sortable: true,
          minWidth: 110,
        },
        {
          title:"是否离校",
          field:'isLeave',
          sortable:true,
          minWidth:100,
          slots:{default:"isLeave"}
        },{
          title:"外出去向",
          field:'leaveCause',
          sortable:true,
          minWidth:100
        },
        {
          title: '创建时间',
          field: 'createTime',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '单据状态',
          field: 'receiptStatus',
          sortable: true,
          minWidth: 100,
          slots: {default:"receiptStatus"}
        }
      ]
    },
    businessOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '出差类型',
          field: 'roleName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '出差时间',
          field: 'dateRange',
          sortable: true,
          minWidth: 230,
        },
        {
          title: '出差时长(h)',
          field: 'duration',
          sortable: true,
          minWidth: 110,
        },
        {
          title:"同行人",
          field: 'togetherNames',
          sortable: true,
          minWidth: 230
        },
        {
          title: '创建时间',
          field: 'createTime',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '单据状态',
          field: 'receiptStatus',
          sortable: true,
          minWidth: 100,
          slots: {default:"receiptStatus"}
        }
      ]
    },
    overtimeOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '加班类型',
          field: 'roleName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '加班时间',
          field: 'dateRange',
          sortable: true,
          minWidth: 230,
        },
        {
          title: '加班时长(h)',
          field: 'duration',
          sortable: true,
          minWidth: 110,
        },
        {
          title: '创建时间',
          field: 'createTime',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '单据状态',
          field: 'receiptStatus',
          sortable: true,
          minWidth: 100,
          slots: {default:"receiptStatus"}
        }
      ]
    },
    reissuecardOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '补卡类型',
          field: 'roleName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '补卡时间',
          field: 'startTime',
          sortable: true,
          minWidth: 120,
          slots: {default:"startTime"}
        },
        {
          title: '创建时间',
          field: 'createTime',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '单据状态',
          field: 'receiptStatus',
          sortable: true,
          minWidth: 100,
          slots: {default:"receiptStatus"}
        }
      ]
    }
  }
};
</script>
