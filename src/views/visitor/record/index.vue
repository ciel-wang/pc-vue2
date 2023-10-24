<template>
  <basic-container>
    <div>
      <el-date-picker
        v-model="appointment"
        size="small" :clearable="false"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        range-separator="至"
        start-placeholder="入校开始日期"
        end-placeholder="入校结束日期"
        :default-time="['00:00:00','23:59:59']"
        style="overflow: hidden;width: 330px;"
      ></el-date-picker>
      <el-date-picker
        v-model="appointmentLeval"
        size="small"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        range-separator="至"
        start-placeholder="离校开始日期"
        end-placeholder="离校结束日期"
        :default-time="['00:00:00','23:59:59']"
        style="overflow: hidden;width: 330px;margin: 0 10px;"
      ></el-date-picker>
      <el-input
        style="width: 160px;"
        size="small" clearable
        @keyup.enter.native="searchR"
        v-model="moreParamQuery"
        placeholder="访客姓名/单位"></el-input>
      <el-select size="small" clearable v-model="visitorState" placeholder="访问状态" style="width: 160px;margin: 0 10px;">
        <el-option v-for="item in visitorStateData" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="searchR">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport">导出</el-button>
    </div>

    <permissquery ref="permissqueryRef" @refreshPage="searchR"></permissquery>
    <eventquery ref="eventqueryRef" @refreshPage="searchR"></eventquery>
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
      :data="recordData"
      :export-config="{}"
      :checkbox-config="{checkField:'checked'}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #toolbar_buttons>
        <el-button
          type="danger"
          size="small"
          v-if="permissionList.visitorRecordLeaveBtn"
          @click="handleRemove">离访</el-button>
        <el-button
          type="danger"
          size="small"
          v-if="permissionList.visitorRecordCancelpermissBtn"
          @click="handleAuth">取消权限</el-button>
        <el-button
          type="primary"
          size="small"
          v-if="permissionList.visitorRecordDownpermissBtn"
          @click="handleDownAuth">增加权限</el-button>
        <el-button
          type="primary"
          size="small"
          v-if="permissionList.visitorRecordPermissQueryBtn"
          @click="permissQueryClick">权限查询</el-button>
        <el-button
          type="primary"
          size="small"
          v-if="permission.visitor_record_eventquery_btn"
          @click="eventQueryClick"
          >事件查询</el-button>
      </template>
      <template #visitorImgUrl1="{row}">
        <el-tooltip class="item" effect="dark" content="预约照片" placement="top-end">
          <img
            v-if="row.visitorImgUrl2"
            width="30px"
            height="30px"
            :src="row.visitorImgUrl2"
            style="margin-right: 5px;"
            @click="openPreview(row.visitorImgUrl2)" />
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="抓拍照片" placement="top-start">
          <img v-if="row.visitorImgUrl1" width="30px" height="30px" :src="row.visitorImgUrl1" @click="openPreview(row.visitorImgUrl1)" />
        </el-tooltip>
      </template>
      <template #visitorState="{row}">
        <el-tag effect="dark" size="mini" type="" v-if="row.visitorState == '5' || row.visitorState == 7">入校</el-tag>
        <el-tag effect="dark" size="mini" type="danger" v-if="row.visitorState == '6'">离校</el-tag>
        <el-tag effect="dark" size="mini" type="warning" v-if="row.visitorState == '72'">超时未离访</el-tag>
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
  </basic-container>
</template>

<script>
import moment from 'moment'
import { getVisitorList , levelRemove, cancelAuth, downAuth } from '@/api/visitor/record';
import permissquery from '../components/permiss-query.vue';
import eventquery from "../components/eventquery.vue"
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';

export default{
  components: { permissquery, eventquery },
  data() {
    return {
      tableHeight: 0,
      recordData: [],
      moreParamQuery: '',
      appointment: [],
      appointmentLeval: [],
      visitorState: '',
      visitorStateData: [{ value: 5, label: '入校' }, { value: 6, label: '离校' },{value:72,label:"超时未离访"}],
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
    this.tableHeight = window.innerHeight - 264;
    let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
    let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
    this.appointment = [start,end]
    this.onLoad(this.page);
  },
  methods: {
    // 加载数据
    onLoad(page, params = {}) {
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery.trim();
      }
      if (Array.isArray(this.appointment) && this.appointment.length) {
        params['appointmentStartTime'] = this.appointment[0];
        params['appointmentEndTime'] = this.appointment[1];
      }
      if (Array.isArray(this.appointmentLeval) && this.appointmentLeval.length) {
        params['appointmentLevalStartTime'] = this.appointmentLeval[0];
        params['appointmentEndStartTime'] = this.appointmentLeval[1];
      }
      if (this.visitorState) {
        params['visitorState'] = this.visitorState;
      }
      this.loading = true;
      getVisitorList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        let data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          let obj = v.extJson ? JSON.parse(v.extJson) : {};
          v.visitorCompany = v.receiptType == 2 ? obj.visitorCompany : v.visitorCompany;
          v.sourceAddress = obj.sourceAddress || '';
          v.certificateType = obj.certificateType || '';
          v.visitorSex = obj.visitorSex
          v.checked = false
        })
        this.recordData = data.records;
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
      let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
      let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      this.appointment = [start,end]
      this.appointmentLeval = [];
      this.visitorState = '';
      this.searchR()
    },
    openPreview(url) {
      let arr = [
        {thumbUrl: url,url: url}
      ];
      this.$ImagePreview(arr, 0);
    },
    handleRemove() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请至少选择一条数据');
        return;
      }
      let flag = false;
      this.selectionList.forEach(v => {
        if (v.visitorState == "6") {
          flag = true;
        }
      });
      if (flag) {
        this.$message.warning("请勾选入校状态的数据");
        return;
      }
      this.$confirm('确定将选择数据离访?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return levelRemove({ ids: this.ids });
      }).then(() => {
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '离访成功!'
        });
      });
    },
    // 导出数据
    handleExport() {
      this.$confirm('是否导出来访记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let moreParamQuery = '';
        if (this.moreParamQuery) {
          moreParamQuery = this.moreParamQuery.trim();
        }
        let appointmentStartTime = '',appointmentEndTime = '',appointmentLevalStartTime = '',appointmentEndStartTime = ''
        if (Array.isArray(this.appointment) && this.appointment.length) {
          appointmentStartTime = this.appointment[0];
          appointmentEndTime = this.appointment[1];
        }
        if (Array.isArray(this.appointmentLeval) && this.appointmentLeval.length) {
          appointmentLevalStartTime = this.appointmentLeval[0];
          appointmentEndStartTime = this.appointmentLeval[1];
        }
        window.open(
          `/api/iot-visitor/appointment/visitor/export?current=${this.page.currentPage}&size=${this.page.pageSize}&${this.website.tokenHeader}=${getToken()}&moreParamQuery=${moreParamQuery}&appointmentStartTime=${appointmentStartTime}&appointmentEndTime=${appointmentEndTime}&appointmentLevalStartTime=${appointmentLevalStartTime}&appointmentEndStartTime=${appointmentEndStartTime}&visitorState=${this.visitorState}&ids=${this.ids}`
        );
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
    handleAuth() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请至少选择一条数据');
        return;
      }
      let flag = this.selectionList.some(v => {
        return v.visitorState == 5 || v.visitorState == 7
      })
      if(flag){
        this.$message.warning('请选择非入校状态的数据')
        return;
      }
      this.$confirm('确定将选择数据取消权限?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return cancelAuth({ ids: this.ids });
      }).then(() => {
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '事件生成成功!'
        });
      });
    },
    handleDownAuth() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请至少选择一条数据');
        return;
      }
      let flag = this.selectionList.some(v => {
        return v.visitorState != 5
      })
      if(flag){
        this.$message.warning('请选择入校状态的数据')
        return;
      }
      this.$confirm('确定将选择数据增加权限?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return downAuth({ ids: this.ids });
      }).then(() => {
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '事件生成成功!'
        });
      });
    },
    permissQueryClick() {
      this.$refs.permissqueryRef.dialogVisible = true;
    },
    eventQueryClick(){
      this.$refs.eventqueryRef.dialogVisible = true;
    }
  },
  computed: {
    ...mapGetters(['permission', 'btnicon']),
    permissionList() {
      return {
        visitorRecordLeaveBtn: this.vaildData(this.permission.visitor_record_leave_btn, false),
        visitorRecordCancelpermissBtn: this.vaildData(this.permission.visitor_record_cancelpermiss_btn, false),
        visitorRecordDownpermissBtn: this.vaildData(this.permission.visitor_record_downpermiss_btn, false),
        visitorRecordPermissQueryBtn: this.vaildData(this.permission.visitor_record_permissquery_btn, false),
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.visitorId);
      });
      return ids.join(',');
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '来访人员',
          fixed: "left",
          children: [
            {
              title: '姓名',
              field: 'visitorName',
              sortable: true,
              minWidth: 80,
            },
            {
              title: '来访单位',
              field: 'visitorCompany',
              sortable: true,
              minWidth: 120,
            },
            {
              title: '手机号码',
              field: 'visitorPhone',
              sortable: true,
              minWidth: 100,
            },
            {
               title: "证件类型",
               field: "certificateType",
               sortable: true,
               minWidth: 100,
            },{
               title: "证件编号",
               field: "visitorCertificateCode",
               sortable: true,
               minWidth: 140,
            },{
                title: "性别",
                field: "visitorSex",
                sortable: true,
                minWidth: 100,
                formatter:({ cellValue})=> cellValue == 1 ? '男' : cellValue == 2 ? '女' : '其他'
            },
            {
              title: '车牌号',
              field: 'visitorCarNum',
              sortable: true,
              minWidth: 100,
            },
            {
               title: "来源地",
               field: "sourceAddress",
               sortable: true,
               minWidth: 130,
            }
          ]
        },
        {
          title: '被访员工',
          children: [
            {
              title: '姓名',
              field: 'targetEmpName',
              sortable: true,
              minWidth: 80,
            },
            {
              title: '手机号码',
              field: 'targetEmpPhone',
              sortable: true,
              minWidth: 100,
            },
            {
              title: '部门名称',
              field: 'targetEmpDeptName',
              sortable: true,
              minWidth: 120,
            }
          ]
        },
        {
          title: '入校日期',
          field: 'realVisitorTime',
          sortable: true,
          minWidth: 140,
        },
        {
          title: '离校日期',
          field: 'realLevalTime',
          sortable: true,
          minWidth: 140,
        },
        {
          title: '来访事由',
          field: 'visitorCause',
          sortable: true,
          minWidth: 100,
        },
        {
          title:"访问线路",
          field: "lineRouteNames",
          minWidth: 100,
        },
        {
          title: '访问状态',
          field: 'visitorState',
          sortable: true,
          minWidth: 100,
          slots: {default:"visitorState"}
        },
        {
          title: '预约方式',
          field: 'appointmentMode',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '访客照片',
          field: 'visitorImgUrl1',
          sortable: true,
          minWidth: 100,
          slots: {default:"visitorImgUrl1"},
        }
      ]
    }
  }
};
</script>
