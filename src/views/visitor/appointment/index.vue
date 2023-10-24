<template>
  <basic-container>
    <div>
      <el-date-picker
        v-model="appointmentTime"
        size="small" :clearable="false"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="datetimerange"
        range-separator="至"
        start-placeholder="到访开始日期"
        end-placeholder="到访结束日期"
        :default-time="['00:00:00','23:59:59']"
        style="overflow: hidden;width: 330px;"
      ></el-date-picker>
      <el-input
        style="width: 160px;margin: 0 10px;"
        size="small" clearable
        @keyup.enter.native="searchR"
        v-model="visitorNoValue"
        placeholder="请输入预约单号"></el-input>
      <el-input
        style="width: 200px;"
        size="small" clearable
        @keyup.enter.native="searchR"
        v-model="moreParamQuery"
        placeholder="来访人姓名/手机号/身份证号/单位"></el-input>
      <el-input
        style="width: 160px;margin: 0 10px;"
        size="small" clearable
        @keyup.enter.native="searchR"
        v-model="targetEmpNameQuery"
        placeholder="被访员工姓名"></el-input>
      <el-select size="small" clearable v-model="visitorState" placeholder="访问状态" style="width: 100px;margin-right: 10px;">
        <el-option v-for="item in visitorStateData" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select
        size="small"
        clearable
        v-model="receiptsType"
        placeholder="单据类型"
        style="width: 100px;margin-right: 10px;">
        <el-option
          v-for="item in receiptsTypeDic"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="searchR">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
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
      :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
      :data="appointmentData"
      :export-config="{}"
      :checkbox-config="{checkField:'checked'}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #toolbar_buttons>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.visitor_appoint_block_btn">添加黑名单</el-button>
        <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.visitor_appoint_export_btn">导出</el-button>
        <el-button
          type="danger"
          size="small"
          @click="handleCancel"
          v-if="permission.visitor_appointment_canclestate_btn"
          >撤销单据</el-button>
      </template>
      <template #visitorImgUrl1="{row}">
        <el-tooltip class="item" effect="dark" content="预约照片" placement="top-end">
          <img
            v-if="row.visitorImgUrl2"
            width="30px"
            height="30px"
            :src="row.visitorImgUrl2"
            style="margin-right: 5px;"
            @click="openPreview(row.visitorImgUrl2)"/>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="抓拍照片" placement="top-start">
          <img v-if="row.visitorImgUrl1" width="30px" height="30px" :src="row.visitorImgUrl1" @click="openPreview(row.visitorImgUrl1)" />
        </el-tooltip>
      </template>
      <template #goodsImgs="{row}">
        <img
          v-for="(item,index) in row.goodsImgs" :key="'goodsimg'+index"
          width="30px"
          height="30px"
          :src="row.staticPrefix + item + '?' + new Date().getTime()"
          style="margin-right: 5px;"
          @click="openPreview(row.staticPrefix + item + '?' + new Date().getTime())" />
      </template>
      
      <template #visitorState="{row}">
        <el-tag
            effect="dark"
            size="mini"
            type="success"
            v-if="row.visitorState == '8'"
            style="background-color: #67c23a;border-color: #67c23a;"
            >邀请中</el-tag>
        <el-tag
            effect="dark"
            size="mini"
            type="warning"
            v-if="row.visitorState == '1'"
            style="background-color: #e6a23c;border-color: #e6a23c;"
            >待审核</el-tag>
        <el-tag
            effect="dark"
            size="mini"
            type="info"
            v-if="row.visitorState == '2'"
            style="background-color: #909399;border-color: #909399;"
            >已撤销</el-tag>
        <el-tag
            effect="dark"
            size="mini"
            v-if="row.visitorState == '3'"
            style="background-color: #548E39;border-color: #548E39;"
            >已同意</el-tag>
        <el-tag
            effect="dark"
            size="mini"
            type="danger"
            v-if="row.visitorState == '4'"
            style="background-color: #FF4009;border-color: #FF4009;"
            >已拒绝</el-tag>
        <el-tag
            effect="dark"
            size="mini"
            v-if="row.visitorState == '5'"
            style="background-color: #2A88DA;border-color: #2A88DA;"
            >访问中</el-tag>
        <el-tag
            effect="dark"
            size="mini"
            type="danger"
            style="background-color: #CF2127;border-color: #CF2127;"
            v-if="row.visitorState == '6'"
            >已结束</el-tag>
        <el-tag
            effect="dark"
            size="mini"
            type="info"
            style="background-color: #E96A20;border-color: #E96A20;"
            v-if="row.visitorState == '71' || row.visitorState == 72"
            >已超时</el-tag>
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

    <el-dialog title="添加黑名单" width="30%" append-to-body :visible.sync="blacklistVisible" :before-close="handleEsc">
      <avue-form :option="blacklistOption" ref="blacklistRef" v-model="blacklistForm" @submit="handleBlacklist">
        <template slot="menuForm">
          <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </basic-container>
</template>

<script>
import moment from 'moment'
import { getAppointmentList, blacklistAdd,cancelState } from '@/api/visitor/appointment.js';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';

export default {
  data() {
    return {
      tableHeight: 0,
      appointmentData: [],
      appointmentTime: [],
      moreParamQuery: '',
      visitorNoValue: '',
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      loading: false,
      selectionList: [],
      visitorState: 1,
      visitorStateData: [
        {value:8,label:"邀请中"},
        { value: 1, label: '待审核' },
        { value: 2, label: '已撤销' },
        { value: 3, label: '已同意' },
        { value: 4, label: '已拒绝' },
        { value: 5, label: '访问中' },
        { value: 6, label: '已结束' },
        { value: 7, label: '已超时' }
      ],
      blacklistVisible: false,
      blacklistForm: {},
      targetEmpNameQuery: '',
      receiptsTypeDic:[
        {value:1,label:'预约单据'},
        {value:2,label:'邀约单据'}
      ],
      receiptsType:""
    };
  },
  mounted() {
    let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
    let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
    this.appointmentTime = [start,end]
    this.tableHeight = window.innerHeight - 264;
    this.searchR();
  },
  methods: {
    // 加载数据
    onLoad(page, params = {}) {
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery.trim();
      }
      if (this.visitorNoValue) {
        params['visitorNo'] = this.visitorNoValue.trim();
      }
      if (Array.isArray(this.appointmentTime) && this.appointmentTime.length) {
        params['appointmentStartTime'] = this.appointmentTime[0];
        params['appointmentEndTime'] = this.appointmentTime[1];
      }
      if (this.visitorState) {
        params['visitorState'] = this.visitorState;
      }
      if (this.targetEmpNameQuery) {
        params['targetEmpName'] = this.targetEmpNameQuery.trim();
      }
      this.loading = true;
      getAppointmentList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        let data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          let obj = v.extJson ? JSON.parse(v.extJson) : {};
          v.visitorCompany = v.receiptsType == 2 ? obj.visitorCompany : v.visitorCompany
          v.goodsImgs = obj.visitorGoodImgs ? obj.visitorGoodImgs.split(',') : [];
          v.visitorGoods = obj.visitorGoods;
          v.tourCode = obj.tourCode || '';
          v.healthCode = obj.healthCode || '';
          v.sourceAddress = obj.sourceAddress || '';
          v.visitorArea = v.areaName + '-' + v.positionName;
          v.certificateType = obj.certificateType || '';
          v.visitorSex = obj.visitorSex
          v.checked = false
        })
        let records = data.records;
        this.appointmentData = records;
        this.loading = false;
      }).catch(() => this.loading = false);
    },
    searchR() {
      this.selectionList = []
      this.page.currentPage = 1
      this.onLoad(this.page);
    },
    searchReset() {
      let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
      let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      this.appointmentTime = [start,end]
      this.moreParamQuery = '';
      this.visitorState = 1;
      this.targetEmpNameQuery = '';
      this.visitorNoValue = "";
      this.receiptsType = "";
      this.searchR();
    },
    openPreview(url) {
      let arr = [{ thumbUrl: url, url: url }];
      this.$ImagePreview(arr, 0);
    },
    // 导出数据
    handleExport() {
      this.$confirm('是否导出预约记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let appointmentStartTime ='',appointmentEndTime = ""
        if(Array.isArray(this.appointmentTime) && this.appointmentTime.length){
          appointmentStartTime = this.appointmentTime[0]
          appointmentEndTime = this.appointmentTime[1]
        }
        window.open(`/api/iot-visitor/appointment/export?current=${this.page.currentPage}&size=${this.page.pageSize}&${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&moreParamQuery=${this.moreParamQuery.trim()}&visitorState=${this.visitorState}&targetEmpName=${this.targetEmpNameQuery.trim()}&visitorNo=${this.visitorNoValue}&appointmentStartTime=${appointmentStartTime}&appointmentEndTime=${appointmentEndTime}&receiptsType=${this.receiptsType}`);
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
    // 添加黑名单
    handleAdd() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择一条数据');
        return;
      }
      this.blacklistVisible = true;
    },
    handleBlacklist(form, done) {
      this.$refs.blacklistRef.validate((vaild, done) => {
        if (vaild) {
          blacklistAdd({ cause: form.cause, appointmentIds: this.ids }).then(res => {
            if (res.data.code == 200) {
              this.$message.success(res.data.msg);
              this.handleEsc();
              this.searchR();
            } else {
              this.$message.error(res.data.msg);
            }
            done();
          }).catch(() => done());
        }
      });
    },
    handleEsc() {
      this.blacklistForm = {};
      this.blacklistForm.cause = '';
      this.$refs.blacklistRef.clearValidate();
      this.blacklistVisible = false;
    },
    handleCancel(){
      if (this.selectionList.length === 0) return this.$message.warning("请选择至少一条数据");
      let arr = [...this.selectionList];
      let flag = [2,5,6,7].some(v => {
        return arr.some(i => v == i);
      })
      if(flag) return this.$message.warning("请选择访问状态为邀请中、待审核、已同意、已拒绝的单据");
      let appointmentIds = this.selectionList.map(v => v.visitorId)
      cancelState({appointmentIds}).then(r => {
        if(r.data.code === 200){
          this.$message.success(r.data.msg);
          this.onLoad(this.page);
          this.selectionList = [];
        }else{
          this.$message.error(r.data.msg);
        }
      })
    }
  },
  computed: {
    ...mapGetters(['permission']),
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
            },
            {
              title: "证件编号",
              field: "visitorCertificateCode",
              sortable: true,
              minWidth: 140,
            },
            {
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
          title: "预约单号",
          field: "visitorNo",
          sortable: true,
          minWidth: 150,
          visible:true
        },
        {
          title: '到访日期',
          field: 'appointmentTime',
          sortable: true,
          minWidth: 140,
        },
        {
          title: '离访日期',
          field: 'appointLevalTime',
          sortable: true,
          minWidth: 140,
        },
        {
          title: "到访区域",
          field: "visitorArea",
          sortable: true,
          minWidth: 130,
        },
        {
          title: '来访事由',
          field: 'visitorCause',
          sortable: true,
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
          title: '拒绝原因',
          field: 'rejectCause',
          sortable: true,
          minWidth: 100,
          visible:false
        },
        {
          title: '预约方式',
          field: 'appointmentMode',
          sortable: true,
          minWidth: 100,
        },
        {
          title:"携带物品",
          field:"goods",
          children:[
            {
              title: "详情",
              field: "visitorGoods",
              sortable: true,
              minWidth: 130,
            },
            {
              title: "图片",
              field: "goodsImgs",
              sortable: true,
              minWidth: 130,
              slots:{default:'goodsImgs'},
            }
          ]
        },
        {
          title: "单据类型",
          field: "receiptsType",
          sortable: true,
          minWidth: 100,
          formatter:({ cellValue})=> {
            return cellValue == 1 ? '预约单据' : cellValue == 2 ? '邀约单据' : ''
          }
        },
        {
          title: '访客照片',
          field: 'visitorImgUrl1',
          sortable: true,
          minWidth: 100,
          slots: {default:"visitorImgUrl1"},
        }
      ]
    },
    blacklistOption() {
      return {
        submitText: '确定',
        emptyBtn: false,
        column: [
          {
            label: '理由',
            prop: 'cause',
            span: 20,
            rules: [
              {
                required: true,
                message: '请输入加入黑名单的原因',
                trigger: 'blur'
              }
            ],
            maxlength:100
          }
        ]
      };
    }
  }
};
</script>
