<template>
  <!-- 第一步-->
  <basic-container>
    <div style="margin-bottom: 8px;">
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
        style="width: 330px;"
      ></el-date-picker>
      <el-input
        v-model="moreQueryParam"
        size="small" clearable
        placeholder="请输入学工号/姓名"
        style="width: 160px;margin: 0 10px;"
        @keyup.enter.native="search"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
      <el-button
        type="primary"
        size="small"
        v-if="permissionList.errBtn"
        @click="refundMoney">更正扣款</el-button>
      <el-button
        type="primary"
        size="small"
        v-if="permissionList.readCardBtn"
        @click="readCard">读卡</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-download"
        @click="handleExport"
        v-if="permissionList.exportBtn"
        style="margin-right: 10px;">导出</el-button>
      <el-checkbox v-model="isShowRefund" @change="isShowRefundChange">仅显示退款</el-checkbox>
    </div>
    <vxe-grid
      border
      resizable
      highlight-hover-row
      :height="tableHeight"
      ref="empCrud"
      size="mini"
      align="center"
      show-footer
      class="mytable-footer"
      :footer-method="footerMethod"
      :footer-row-class-name="footerRowClass"
      :highlight="true"
      :columns="empOptions"
      :loading="empLoading"
      :checkbox-config="{checkField:'checked'}"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="empData"
      :export-config="{}"
      :cell-class-name="cellClassName"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #kkqb="{row}">
        <div v-if="row.kkArr.length">
          <el-tag
            v-for="(item,index) in row.kkArr" :key="index"
            effect="dark" size="mini" :type="row.labelType"
            >{{item.wseq == 1 ? '补贴钱包1' : item.wseq == 2 ? '补贴钱包2' : item.wseq == 3 ? '补贴钱包3' : item.wseq == 0 ? '个人钱包' : ''}}:{{ item.kk }}</el-tag>
        </div>
        <div v-else>
          <el-tag effect="dark" size="mini" :type="row.labelType" v-if="row.subsidy3Wallet != 0">补贴钱包3:{{row.subsidy3Wallet}}</el-tag>
          <el-tag effect="dark" size="mini" :type="row.labelType" v-if="row.subsidy2Wallet != 0">补贴钱包2:{{ row.subsidy2Wallet }}</el-tag>
          <el-tag effect="dark" size="mini" :type="row.labelType" v-if="row.subsidy1Wallet != 0">补贴钱包1:{{ row.subsidy1Wallet }}</el-tag>
          <el-tag effect="dark" size="mini" :type="row.labelType" v-if="row.personalWallet != 0">个人钱包:{{ row.personalWallet }}</el-tag>
        </div>
        <!-- <el-tag effect="dark" size="mini" :type="row.labelType" v-if="row.personalWallet != 0">
          个人钱包:{{ row.personalWallet }}</el-tag>
        <el-tag effect="dark" size="mini" :type="row.labelType" v-if="row.subsidy1Wallet != 0">
          补贴钱包1:{{ row.subsidy1Wallet }}</el-tag>
        <el-tag effect="dark" size="mini" :type="row.labelType" v-if="row.subsidy2Wallet != 0">
          补贴钱包2:{{ row.subsidy2Wallet }}</el-tag>
        <el-tag effect="dark" size="mini" :type="row.labelType" v-if="row.subsidy3Wallet != 0">
          补贴钱包3:{{ row.subsidy3Wallet }}</el-tag> -->
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

    <el-drawer
      title="更正扣款"
			size="480px"
      :visible.sync="drawer"
      :append-to-body="true"
      :wrapperClosable="false"
      :direction="direction"
      :before-close="handleEsc">
      <avue-form :option="errRecoveryOptions" v-model="errRecoveryObj" @submit="errRecoverySubmitData">
        <template slot="menuForm">
          <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-drawer>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getErrorRecoveryList, errorRecoverSubmit } from '@/api/xf/refund';
import { cardFunction } from '@/util/cardIssuer.js'

export default {
  data() {
    return {
      drawer: false,
      selectionList: [],
      moreQueryParam: '',
      accTransTime: '',
      isDisabled: true,
      labelType: 'success',
      empLoading: false,
      errRecoveryObj: {
        errRecoveryMoney: '',
        errRecoveryType: 1
      },
      ids: '',
      empData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      isShowRefund: false
    };
  },
  mounted() {
    let accTransStartTime = moment().startOf('days').format('YYYY-MM-DD HH:mm:ss');
    let accTransEndTime = moment().endOf('days').format('YYYY-MM-DD HH:mm:ss');
    this.accTransTime = [accTransStartTime, accTransEndTime];
    this.onLoad(this.page);
  },
  methods: {
    search() {
      this.page.currentPage = 1
      this.selectionList = [];
      this.onLoad(this.page);
    },
    reset() {
      this.moreQueryParam = '';
      let accTransStartTime = moment().startOf('days').format('YYYY-MM-DD HH:mm:ss');
      let accTransEndTime = moment().endOf('days').format('YYYY-MM-DD HH:mm:ss');
      this.accTransTime = [accTransStartTime, accTransEndTime];
      this.isShowRefund = false;
      this.search();
    },
    onLoad(page, params = {}) {
      this.empLoading = true;
      params['moreParamQuery'] = this.moreQueryParam.trim();
      if (this.accTransTime) {
        params['accTransStartTime'] = this.accTransTime[0];
        params['accTransEndTime'] = this.accTransTime[1];
      }
      params['isShowRefund'] = this.isShowRefund;
      getErrorRecoveryList(this.page.currentPage, this.page.pageSize, params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          if (v.refundMoney) {
            v.labelType = 'warning';
          } else {
            v.labelType = '';
            v.refundMoney = 0;
          }
          if(v.empType == 1) v.deptName = v.className;
          v.checked = false
          let extContent = v.extContent ? JSON.parse(v.extContent) : {};
          let kkArr = [];
          let walletseq = extContent.walletseq ? extContent.walletseq.split(',') : [];
          if(walletseq.length){
            walletseq.forEach(i => {
              let item = extContent.walletkq.find(obj => obj.wseq == i);
              if(item?.kq){
                kkArr.push({kk:item.kq,wseq:item.wseq});
                item.kq = 0;
              }
            })
            let item = extContent.walletkq.find(obj => obj.wseq == walletseq[walletseq.length-1]);
            if(item?.tz) kkArr.push({kk:item.tz,wseq:item.wseq});
          }
          v.kkArr = kkArr;
        });
        this.empData = data.records;
        this.empLoading = false;
      }).catch(() => {
        this.empLoading = false;
      });
    },
    readCard() {
			cardFunction({},'CardFindEmp').then(res => {
			  if (res) {
			    this.moreQueryParam = res+'';
			    this.onLoad(this.page);
			  }
			}).catch((err) => {
			  if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
			  this.$message.warning(err)
			})
    },
    refundMoney() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一个人进行退款操作');
        return;
      }
      this.errRecoveryObj.errRecoveryMoney = this.selectionList[0].xfOutMoney;
      this.drawer = true;
    },
    errRecoverySubmitData(form, done) {
      if (form.errRecoveryMoney.length == 0) {
        this.$message({
          type: 'warning',
          message: '请填写退款金额!'
        });
        done();
        return;
      }
      let params = {
        errRecoveryMoney: form.errRecoveryMoney,
        errRecoveryType: form.errRecoveryType,
        empId: this.selectionList[0].empId,
        accId: this.selectionList[0].accId
      };
      errorRecoverSubmit(params).then(res => {
        if (res.data.code == 200) {
          this.errRecoveryObj.errRecoveryType = 1;
          this.errRecoveryObj.errRecoveryMoney = '';
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: res.data.msg
          });
        }
      });
      this.errRecoveryObj.errRecoveryType = 1;
      this.$forceUpdate();
      this.drawer = false;
      done();
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
    handleEsc() {
      this.errRecoveryObj.errRecoveryType = 1;
      this.errRecoveryObj.errRecoveryMoney = '';
      this.drawer = false;
    },
    isShowRefundChange(e) {
      this.isShowRefund = e;
      this.onLoad(this.page);
    },
    handleExport() {
      this.$confirm('是否导出多扣纠错?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = '';
        if (this.selectionList.length > 0) {
          this.selectionList.forEach(v => {
            ids = ids + ',' + v.accId;
          });
        }
        let accTransStartTime = this.accTransTime[0];
        let accTransEndTime = this.accTransTime[1];
        window.open(
          `/api/iot-xf/error/recovery/export?current=${this.page.currentPage}&size=${this.page.pageSize}&accTransStartTime=${accTransStartTime}&accTransEndTime=${accTransEndTime}&${this.website.tokenHeader}=${getToken()}&ids=${ids}&moreParamQuery=${this.moreQueryParam.trim()}&isShowRefund=${this.isShowRefund}`
        );
      });
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
          if (['refundMoney'].includes(column.property)) {
            return this.sumNum(data, 'refundMoney');
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
        errBtn: this.vaildData(this.permission.error_recover_chargeback_btn, false),
        readCardBtn: this.vaildData(this.permission.error_recover_card_reading_btn, false),
        exportBtn: this.vaildData(this.permission.error_recover_export_btn, false)
      };
    },
    errRecoveryOptions() {
      return {
        submitText: '确定',
        emptyBtn: false,
        column: [
          {
            label: '更正类型',
            span: 17,
            type: 'radio',
            dicData: [{ label: '整笔退款', value: 1 }, { label: '部分退款', value: 2 }],
            prop: 'errRecoveryType',
            align: 'center',
            change: ({ value, column }) => {
              let that = this;
              if (value == 1) {
                that.isDisabled = true;
                if (that.selectionList.length) {
                  that.errRecoveryObj.errRecoveryMoney = that.selectionList[0].xfOutMoney;
                }
              } else {
                that.isDisabled = false;
              }
            }
          },
          {
            label: '更正金额',
            disabled: this.isDisabled,
            prop: 'errRecoveryMoney',
            span: 24,
            align: 'center',
            rules: [{
              validator: (rule, value, callback) => {
                let reg = /(^[0-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
                if (value == '') {
                  callback(new Error('请输入更正金额'));
                } else if (!reg.test(value)) {
                  callback(new Error('请输入大于0的数字'));
                } else {
                  callback();
                }
              },
              trigger: 'blur'
            }]
          }
        ]
      };
    },
    tableHeight() {
      return window.innerHeight - 272
    },
    empOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '学工号',
          field: 'empCode',
          fixed: 'left',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100,
          fixed: 'left',
        },
        {
          title: '消费时间',
          field: 'accTransTime',
          sortable: true,
          minWidth: 150,
        },
        {
          title: '消费金额',
          field: 'xfOutMoney',
          sortable: true,
          width: 130,
        },
        {
          title: '扣款钱包',
          field: 'kkqb',
          sortable: true,
          slots: {default:"kkqb"},
          width: 130,
        },
        {
          title: '退款金额',
          field: 'refundMoney',
          sortable: true,
          width: 130,
        },
        {
          title: '设备编号',
          field: 'devCode',
          sortable: true,
          width: 110
        },
        {
          title: '设备名称',
          field: 'devName',
          sortable: true,
          width: 110,
        },
        {
          title: '商户名称',
          field: 'sellerName',
          sortable: true,
          minWidth: 130,
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
          sortable: true,
          minWidth: 100,
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
  padding-left: 4px;
}
/deep/.mytable-footer .row-bgcolor {
  background-color: #ccc;
  color: #000;
  font-weight: 600;
}
</style>
