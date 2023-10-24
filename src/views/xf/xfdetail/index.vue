<template>
  <!-- 第一步-->
  <basic-container>
    <vxe-grid
      border
      resizable
      highlight-hover-row
      :height="tableHeight"
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      show-footer
      class="mytable-footer"
      :footer-method="footerMethod"
      :footer-row-class-name="footerRowClass"
      :columns="options"
      :loading="loading"
      :checkbox-config="{checkField:'checked'}"
      :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="data"
      :export-config="{}"
      :cell-class-name="cellClassName"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #toolbar_buttons>
        <el-date-picker
          v-model="accTransTime"
          size="small"
          :clearable="false"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00','23:59:59']"
          style="width: 330px;"></el-date-picker>
        <el-input
          style="width: 160px;margin: 0 10px;"
          v-model="moreQueryParam"
          size="small" clearable
          placeholder="请输入学工号/姓名"
          @keyup.enter.native="search"></el-input>
        <el-input
          v-model="deptParamQuery"
          size="small" clearable
          placeholder="请输入部门名称"
          style="width: 160px;"
          @keyup.enter.native="search"></el-input>
        <el-input
          v-model="devSn" size="small" clearable
          placeholder="请输入设备编号"
          style="width: 150px;margin: 0 10px;"
          @keyup.enter.native="search"></el-input>
        <el-select size="small" clearable v-model="mealTypeNum" placeholder="请选择餐类" style="width: 150px;margin-right: 10px;">
          <el-option v-for="item in mealTypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
        <el-button
          type="primary"
          size="small"
          style="margin-right: 10px;"
          icon="el-icon-download"
          v-if="permissionList.exportBtn"
          @click="handleExport">导出</el-button>
        <el-checkbox v-model="isShowRefund" @change="ShowRefundChange">仅显示多扣纠错</el-checkbox>
      </template>
      <template #payMode="{row}">
        <el-tag effect="dark" size="mini" v-if="row.payMode == 0">脸</el-tag>
        <el-tag effect="dark" size="mini" type="success" v-if="row.payMode == 1">码</el-tag>
        <el-tag effect="dark" size="mini" type="danger" v-if="row.payMode == 2">卡</el-tag>
        <el-tag effect="dark" size="mini" type="info" v-if="row.payMode == 3">取餐码</el-tag>
        <el-tag effect="dark" size="mini" type="warning" v-if="row.payMode == 5">码透传</el-tag>
        <el-tag effect="dark" size="mini" type="warning" v-if="row.payMode == 6">卡透传</el-tag>
        <el-tag effect="dark" size="mini" type="danger" v-if="row.payMode == '多扣纠错退款'">{{ row.payMode }}</el-tag>
      </template>
      <template #captureUrl="{row}">
        <img width="30px" height="30px" v-if="row.payMode == 0 && row.captureUrl" :src="row.captureUrl" @click="openPreview(row.captureUrl)" />
      </template>
    </vxe-grid>
    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[30, 50, 100, 500,1000]"
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
import moment from 'moment';
import { mapGetters } from 'vuex';
import { getXfDetailQueryList } from '@/api/xf/xfdetails';
import website from '@/config/website';
import { getToken } from '@/util/auth';
export default {
  data() {
    return {
      selectionList: [],
      mealTypeNum: '',
      deptParamQuery: "",
      mealTypes: [
        { label: '早餐', value: 0 },
        { label: '午餐', value: 1 },
        { label: '晚餐', value: 2 },
        { label: '夜宵', value: 3 },
        { label: '其他', value: 4 },
      ],
      accTransTime: null,
      moreQueryParam: '',
      loading: false,
      ids: '',
      data: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      devSn: '',
      isShowRefund: false
    };
  },

  mounted() {
    let monthLastDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    let monthStartDay = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    this.accTransTime = [monthStartDay, monthLastDay];
    this.onLoad(this.page);
  },
  methods: {
    ShowRefundChange(v) {
      this.isShowRefund = v;
      this.onLoad();
    },
    reset() {
      this.moreQueryParam = '';
      this.deptParamQuery = '';
      this.page.currentPage = 1;
      this.mealTypeNum = '';
      this.devSn = '';
      let monthLastDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      let monthStartDay = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.accTransTime = [monthStartDay, monthLastDay];
      this.onLoad(this.page);
    },
    onLoad(page, params = {}) {
      this.loading = true;
      params['moreParamQuery'] = this.moreQueryParam.trim();
      params['deptParamQuery'] = this.deptParamQuery.trim();
      params['mealTypeNum'] = this.mealTypeNum;
      params['isShowRefund'] = this.isShowRefund;
      if (this.devSn) {
        params['devSn'] = this.devSn.trim();
      }
      if (this.accTransTime) {
        params['accTransStartTime'] = this.accTransTime[0];
        params['accTransEndTime'] = this.accTransTime[1];
      }
      if (this.order) {
        params['sortField'] = 'xfOutMoney';
        params['sortType'] = this.order;
      }
      getXfDetailQueryList(this.page.currentPage, this.page.pageSize, params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          let extContent = v.extContent && JSON.parse(v.extContent) || {};
          v.payMode = extContent?.payMode;
          v.captureUrl = extContent?.captureUrl;
          v.oprtUserAccount = extContent?.oprtUserAccount;
          let walletseq = [];
          extContent.walletseq && extContent.walletseq.split(',').forEach(v => {
            if(v == 0) walletseq.push('个人钱包');
            if(v == 1) walletseq.push('补贴钱包1');
            if(v == 2) walletseq.push('补贴钱包2');
            if(v == 3) walletseq.push('补贴钱包3');
          })
          v.walletseq = walletseq.join('->')
          if (v.personalWallet > 0 && v.accTransType == 4) v.personalWallet = '-' + v.personalWallet;
          if (v.subsidy1Wallet > 0 && v.accTransType == 4) v.subsidy1Wallet = '-' + v.subsidy1Wallet;
          if (v.subsidy2Wallet > 0 && v.accTransType == 4) v.subsidy2Wallet = '-' + v.subsidy2Wallet;
          if (v.subsidy3Wallet > 0 && v.accTransType == 4) v.subsidy3Wallet = '-' + v.subsidy3Wallet;
          if (v.xfOutMoney > 0) v.xfOutMoney = '-' + v.xfOutMoney;
          if (v.accTransType == 7) {
            v.xfOutMoney = v.xfInMoney;
            v.personalWallet = v.personalWallet;
            v.subsidy1Wallet = v.subsidy1Wallet;
            v.subsidy2Wallet = v.subsidy2Wallet;
            v.subsidy3Wallet = v.subsidy3Wallet;
            v.payMode = '多扣纠错退款';
          }
          if(v.empType == 1){
            v.deptName = v.className
          }
          v.checked = false
        });
        this.data = data.records;
        this.loading = false;
      });
    },
    search() {
      let param = {};
      this.selectionList = []
      this.page.currentPage = 1
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
    cellClassName({ row, rowIndex, column, columnIndex }){
      if(column.property === "xfOutMoney"){
        return row.xfOutMoney.startsWith('-') ? 'txtred' : row.xfOutMoney != '0.00' ? 'txtgreen' : ''
      }
      if(column.property === "personalWallet"){
        return row.personalWallet.startsWith('-') ? 'txtred' : row.personalWallet != '0.00' ? 'txtgreen' : ''
      }
      if(column.property === "subsidy1Wallet"){
        return row.subsidy1Wallet.startsWith('-') ? 'txtred' : row.subsidy1Wallet != '0.00' ? 'txtgreen' : ''
      }
      if(column.property === "subsidy2Wallet"){
        return row.subsidy2Wallet.startsWith('-') ? 'txtred' : row.subsidy2Wallet != '0.00' ? 'txtgreen' : ''
      }
      if(column.property === "subsidy3Wallet"){
        return row.subsidy3Wallet.startsWith('-') ? 'txtred' : row.subsidy3Wallet != '0.00' ? 'txtgreen' : ''
      }
    },
    handleExport() {
      this.$confirm('是否导出消费明细?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = this.selectionList.map(v => v.accId).join(',');
        let mealTypeNum = this.mealTypeNum;
        let accTransStartTime = '';
        let accTransEndTime = '';
        if (this.accTransTime) {
          accTransStartTime = this.accTransTime[0];
          accTransEndTime = this.accTransTime[1];
        }
        let deptParamQuery = this.deptParamQuery;
        if (deptParamQuery !== null) {
          deptParamQuery = deptParamQuery.trim();
        }
        window.open(
          `/api/iot-xf/xfdetail/query/list/export?current=${this.page.currentPage}&size=${this.page.pageSize}&accTransStartTime=${accTransStartTime}&accTransEndTime=${accTransEndTime}&${this.website.tokenHeader}=${getToken()}&ids=${ids}&moreParamQuery=${this.moreQueryParam.trim()}&mealTypeNum=${mealTypeNum}&deptParamQuery=${deptParamQuery}&isShowRefund=${this.isShowRefund}&devSn=${this.devSn.trim()}`
        );
      });
    },
    openPreview(url) {
      let arr = [{ thumbUrl: url, url: url }];
      this.$ImagePreview(arr, 0);
    },
    sumNum(list, field) {
      let count = 0;
      list.forEach(item => {
        count += Number(item[field]);
      });
      return count.toFixed(2);
    },
    footerMethod({ columns, data }) {
      const footerData = [
        columns.map((column, _columnIndex) => {
          if (_columnIndex === 0) {
            return '总计';
          }
          if (['xfOutMoney'].includes(column.property)) {
            return this.sumNum(data, 'xfOutMoney');
          }
          if (['personalWallet'].includes(column.property)) {
            return this.sumNum(data, 'personalWallet');
          }
          if (['subsidy1Wallet'].includes(column.property)) {
            return this.sumNum(data, 'subsidy1Wallet');
          }
          if (['subsidy2Wallet'].includes(column.property)) {
            return this.sumNum(data, 'subsidy2Wallet');
          }
          if (['subsidy3Wallet'].includes(column.property)) {
            return this.sumNum(data, 'subsidy3Wallet');
          }
          return null;
        })
      ];
      return footerData;
    },
    footerRowClass({ $rowIndex }) {
      if ($rowIndex == 0) {
        return 'row-bgcolor';
      }
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'permission', 'btnicon']),
    permissionList() {
      return {
        exportBtn: this.vaildData(this.permission.xfdetail_export_btn, false)
      };
    },
    tableHeight() {
      return window.innerHeight - 230
    },
    options() {
      return [
        { type: 'checkbox', width: 70 ,fixed:"left"},
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '设备编号',
          field: 'devCode',
          sortable: true,
          fixed: 'left',
          minWidth: 100,
        },
        {
          title: '设备名称',
          field: 'devName',
          sortable: true,
          minWidth: 100,
          fixed: 'left',
        },
        {
          title: '交易时间',
          field: 'transTime',
          sortable: true,
          width: 150,
        },
        {
          title: '餐段',
          field: 'mealTypeName',
          sortable: true,
          width: 100,
        },
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          width: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          width: 100,
        },
        {
          title: '消费金额',
          field: 'xfOutMoney',
          sortable: true,
          width: 100,
        },
        {
          title: '承包商',
          field: 'sellerName',
          minWidth: 130,
        },
        {
          title: '扣款金额',
          field: 'Wallet',
          children: [
            {
              title: '个人钱包',
              field: 'personalWallet',
              sortable: true,
              width: 100,
            },
            {
              title: '补贴钱包1',
              field: 'subsidy1Wallet',
              sortable: true,
              width: 100,
            },
            {
              title: '补贴钱包2',
              field: 'subsidy2Wallet',
              sortable: true,
              width: 100,
            },
            {
              title: '补贴钱包3',
              field: 'subsidy3Wallet',
              sortable: true,
              width: 100,
            }
          ]
        },
        {
          title: '支付方式',
          field: 'payMode',
          sortable: true,
          width: 110,
          slots: {default:"payMode"}
        },
        {
          title: '部门/班级名称',
          field: 'deptName',
          sortable: true,
          minWidth: 160,
        },
        {
          title: '学校名称',
          field: 'schoolName',
          minWidth: 100,
          sortable: true,
        },
        {
          title: '照片',
          field: 'captureUrl',
          width: 130,
          slots: {default:"captureUrl"},
          sortable: true,
        },
        {
          title: '消费时间',
          field: 'exchangeTime',
          sortable: true,
          width: 150,
        },
        {
          title:"扣款顺序",
          field:"walletseq",
          width: 150,
          visible:false
        },
        {
          title:"操作员",
          field:"oprtUserAccount",
          width: 100,
          visible:false
        }
      ]
    }
  },
};
</script>

<style lang="scss" scoped>
.el-scrollbar {
  height: 100%;
}
.center_open::before {
  left: 7px !important;
}

/deep/.el-checkbox__label {
  padding-left: 4px !important;
}
/deep/.vxe-body--column.txtred {
  color: #dd0a00;
  font-weight: 600;
}
/deep/.vxe-body--column.txtgreen {
  color: #008755;
  font-weight: 600;
}
/deep/.mytable-footer .row-bgcolor {
  background-color: #ccc;
  color: #000;
  font-weight: 600;
}
</style>
