<template>

  <basic-container>
    <el-tabs v-model="activeName"  @tab-click="handleClick">
      <el-tab-pane label="系统退款" name="tk" v-if="permission.xf_refund_tk">
        <div style="margin-bottom: 8px;">
          <el-input
            v-model="moreQueryParam"
            size="small" clearable
            placeholder="请输入学工号/姓名"
            style="width: 160px;"
            @keyup.enter.native="search"></el-input>
          <el-select style="width: 140px;margin: 0 10px;" size="small" clearable v-model="empState" placeholder="人员状态">
            <el-option v-for="item in userStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
          <el-button size="small" plain icon="el-icon-refresh" @click="reset">重置</el-button>
          <el-button
            type="primary"
            size="small"
            v-if="permission.refund_refund_btn"
            @click="refundMoney">退款</el-button>
          <el-button
            type="primary"
            size="small"
            v-if="permission.refund_card_reading_btn"
            @click="readCard">读卡</el-button>
        </div>
        <vxe-grid
          border
          resizable
          :height="tableHeight"
          ref="empCrud"
          size="mini"
          align="center"
          highlight-hover-row
          :highlight="true"
          :columns="empOptions"
          :loading="empLoading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="empData"
          :export-config="{}"
          :cell-class-name="cellClassName"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
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
      </el-tab-pane>

      <el-tab-pane label="第三方提现" name="tx" v-if="permission.xf_refund_tx">
        <div class="mbottom8">
          <el-input
            v-model.trim="empName"
            size="small" clearable
            placeholder="人员编号/姓名"
            @keyup.enter.native="search"
            style="width: 130px;margin-right: 10px;"></el-input>
          <el-input
            v-model.trim="deptName"
            size="small" clearable
            placeholder="部门编号/名称"
            @keyup.enter.native="search"
            style="width: 130px;margin-right: 10px;"></el-input>
          <el-input
            v-model.trim="orderNo"
            size="small" clearable
            placeholder="交易单号"
            @keyup.enter.native="search"
            style="width: 130px;margin-right: 10px;"></el-input>
          <el-tooltip content="创建时间" placement="top">
            <el-date-picker
              v-model="createTime"
              size="small"
              type="datetimerange"
              value-format="yyyy-MM-dd HH:mm:ss"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px;margin-right: 10px;"></el-date-picker>
          </el-tooltip>
          <el-tooltip content="审核时间" placement="top">
            <el-date-picker
              v-model="auditTime"
              size="small"
              type="datetimerange"
              value-format="yyyy-MM-dd HH:mm:ss"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px;margin-right: 10px;"></el-date-picker>
          </el-tooltip>
          <el-select v-model="status" clearable size="small" placeholder="单据状态" style="width: 100px;margin-right: 10px;">
            <el-option label="未审核" value="1"></el-option>
            <el-option label="未到账" value="2"></el-option>
            <el-option label="已到账" value="3"></el-option>
            <el-option label="已驳回" value="4"></el-option>
          </el-select>
          <el-select v-model="transactionStatus" clearable size="small" placeholder="交易状态" style="width: 100px;margin-right: 10px;">
            <el-option label="未开始" value="1"></el-option>
            <el-option label="交易中" value="2"></el-option>
            <el-option label="交易成功" value="3"></el-option>
            <el-option label="扣款失败" value="4"></el-option>
          </el-select>
          <el-select v-model="redpackStatus" clearable size="small" placeholder="红包状态" style="width: 100px;margin-right: 10px;">
            <el-option label="发放中" value="SENDING"></el-option>
            <el-option label="已发送待领取" value="SENT"></el-option>
            <el-option label="发送失败" value="FAILED"></el-option>
            <el-option label="已领取" value="RECEIVED"></el-option>
            <el-option label="退款中" value="RFUND_ING"></el-option>
            <el-option label="已退款" value="REFUND"></el-option>
          </el-select>
          <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
          <el-button size="small" plain icon="el-icon-refresh" @click="reset">重置</el-button>
        </div>
        <div class="mbottom8">
          <el-button
            type="primary" size="small"
            v-if="permission.xf_refund_tx_audit_btn"
            @click="handlerAudit">审核</el-button>
          <el-button
            v-if="permission.xf_refund_tx_auditall_btn"
            type="primary" size="small"
            @click="handlerAudit('all')">审核全部</el-button>
          <el-button
            v-if="permission.xf_refund_tx_reject_btn"
            type="danger" size="small"
            @click="handlerReject">拒绝</el-button>
          <el-button
            type="primary" size="small"
            icon="el-icon-download"
            v-if="permission.xf_refund_tx_export_btn"
            @click="handleExport">导出</el-button>
          <el-button
            type="primary" size="small"
            v-if="permission.xf_refund_tx_againmoney_btn"
            @click="handlerAgainMoney">重新发红包</el-button>
        </div>
        <vxe-table
          v-show="activeName == 'tx'"
          :sync-resize="activeName"
          border
          resizable
          ref="Crud2"
          auto-resize
          highlight-hover-row
          show-overflow
          size="mini"
          :height="tableHeight - 40"
          :loading="empLoading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          align="center"
          :data="txData"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
          <vxe-table-column title="序号" type="seq" width="70" fixed="left"></vxe-table-column>
          <vxe-table-column title="学工号" field="empCode" minWidth="100" fixed="left"></vxe-table-column>
          <vxe-table-column title="姓名" field="empName" minWidth="100" fixed="left"></vxe-table-column>
          <vxe-table-column title="提现金额" field="totalAmount" minWidth="100"></vxe-table-column>
          <vxe-table-column title="交易单号" field="orderNo" minWidth="140"></vxe-table-column>
          <vxe-table-column title="单据状态" field="status" minWidth="100">
            <template #default="{row}">
              <el-tag size="mini" type="info" v-if="row.status == '1'">未审核</el-tag>
              <el-tag size="mini" type="warning" v-if="row.status == '2'">未到账</el-tag>
              <el-tag size="mini" type="success" v-if="row.status == '3'">已到账</el-tag>
              <el-tag size="mini" type="danger" v-if="row.status == '4'">已驳回</el-tag>
            </template>
          </vxe-table-column>
          <vxe-table-column title="交易状态" field="transactionStatus" minWidth="100">
            <template #default="{row}">
              <el-tag effect="dark" size="mini" type="info" v-if="row.transactionStatus == '1'">未开始</el-tag>
              <el-tag effect="dark" size="mini" type="warning" v-if="row.transactionStatus == '2'">交易中</el-tag>
              <el-tag effect="dark" size="mini" type="success" v-if="row.transactionStatus == '3'">交易成功</el-tag>
              <el-tag effect="dark" size="mini" type="danger" v-if="row.transactionStatus == '4'">扣款失败</el-tag>
            </template>
          </vxe-table-column>
          <vxe-table-column title="红包状态" field="status2" minWidth="110">
            <template #default="{row}">
              <el-tag size="mini" v-if="row.status2 == 'SENDING'">发放中</el-tag>
              <el-tag size="mini" v-if="row.status2 == 'SENT'">已发送待领取</el-tag>
              <el-tag size="mini" type="danger" v-if="row.status2 == 'FAILED'">发送失败</el-tag>
              <el-tag size="mini" type="success" v-if="row.status2 == 'RECEIVED'">已领取</el-tag>
              <el-tag size="mini" type="danger" v-if="row.status2 == 'RFUND_ING'">退款中</el-tag>
              <el-tag size="mini" type="info" v-if="row.status2 == 'REFUND'">已退款</el-tag>
            </template>
          </vxe-table-column>
          <vxe-table-column title="创建时间" field="createTime" minWidth="140"></vxe-table-column>
          <vxe-table-column title="审核时间" field="auditTime" minWidth="140"></vxe-table-column>
          <vxe-table-column title="审核人" field="auditUserName" minWidth="100"></vxe-table-column>
          <vxe-table-column title="交易时间" field="realTransactionTime" minWidth="140"></vxe-table-column>
          <vxe-table-column title="失败原因" field="returnMsg" minWidth="100"></vxe-table-column>
          <vxe-table-column title="部门/班级名称" field="deptName" minWidth="100"></vxe-table-column>
          <vxe-table-column title="学校名称" field="schoolName" minWidth="130"></vxe-table-column>
        </vxe-table>
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
      </el-tab-pane>
    </el-tabs>

    <el-drawer
      title="退款"
			size="480px"
      :visible.sync="drawer"
      append-to-body
      :modal-append-to-body="true"
      :wrapperClosable="false"
      :before-close="handleEsc">
      <avue-form :option="preRechargeoption" v-model="refundObj" ref="refundRef" @submit="preRechargeSubmit" @error="error">
        <template slot="menuForm">
          <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-drawer>
  </basic-container>
</template>

<script>
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { mapGetters } from 'vuex';
import { getRefundEmpList, refundSubmit, reqWithdrawData, rejectWithdraw, auditWithdraw, againSendWithdraw } from '@/api/xf/refund';
import { getDictCode } from "@/api/iot/teacher.js"
import { cardFunction } from '@/util/cardIssuer.js'

export default {
  data() {
    return {
      activeName:'tk',
      drawer: false,
      RefundMoneyDisabled: false,
      selectionList: [],
      moreQueryParam: '',
      refundWalletSpan: 10,
      empLoading: false,
      refundObj: {
        personalWellet: 0,
        refundMode: '现金',
        refundMoney: '0'
      },
      walletData: [{ label: '个人钱包', value: 0 }],
      ids: '',
      empData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      empState: '',
      userStatus: [],
      refundTypeDisabled:false,
      empName:"",
      deptName:"",
      orderNo:"",
      createTime:[],
      auditTime:[],
      status:"1",
      transactionStatus:"",
      redpackStatus:'',
      txData:[],
    };
  },
  watch: {
    'refundObj.refundType': {
      handler(val) {
        this.refundWalletSpan = 10;
        if (val == 2) {
          let walletData = [{ label: '所有钱包', value: 0 }];
          this.walletData = walletData;
          this.RefundMoneyDisabled = true;
          this.refundObj.refundMoney = 0;
        } else if (val == 3) {
          let walletData = [{ label: '补贴钱包1', value: 1 }, { label: '补贴钱包2', value: 2 }, { label: '补贴钱包3', value: 3 }];
          this.walletData = walletData;
          this.RefundMoneyDisabled = false;
          this.refundObj.personalWellet = 1;
          this.refundWalletSpan = 24;
        } else {
          let walletData = [{ label: '个人钱包', value: 0 }];
          this.walletData = walletData;
          this.RefundMoneyDisabled = false;
          this.refundObj.personalWellet = 0;
        }
      },
      deep: true //true 深度监听
    }
  },
  mounted() {
    this.activeName = this.permission.xf_refund_tk ? 'tk' : 'tx';
    getDictCode({keys:'userStatus#studentStatus'}).then(res => {
      let d = res.data.data;
      this.userStatus = [];
      let arr = []
      d.studentStatus.forEach(v => {
        arr.push({ value:v.dictKey, label:v.dictValue + '(学生)' })
      })
      d.userStatus.forEach(v => {
        arr.push({ value:v.dictKey, label:v.dictValue + '(教师)' })
      })
      this.userStatus = arr;
    });
    this.onLoad(this.page);
  },
  methods: {
    handlerAgainMoney(){
      if(this.selectionList.length == 0) return this.$message.warning('请选择至少一条数据');
      let flag = this.selectionList.some(v => v.status2 != 'REFUND');
      if(flag) return this.$message.warning('请选择已退款的数据');
      this.$confirm('确定要重新发送红包？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: "warning"
      }).then(() => {
        let ids = this.selectionList.map(v => v.id);
        return againSendWithdraw({ ids })
      }).then(r => {
        if(r.data.code == 200){
          this.$message.success(r.data.msg);
          this.search()
        }else{
          this.$message.error(r.data.msg);
        }
      })
    },
    handlerAudit(type){
      if(type !== 'all' && this.selectionList.length != 1) return this.$message.warning('请选择一条数据');
      if(type === 'all' && this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
      let flag = this.selectionList.some(v => v.status != 1);
      if(type !== 'all' && flag) return this.$message.warning('请选择未审核的数据');
      this.$confirm("确定审核当前数据?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let auditType = 1;
        if(type === 'all') auditType = 0;
        let ids = this.selectionList.map(v => v.id);
        return auditWithdraw({ ids, auditType })
      }).then(r => {
        if(r.data.code == 200){
          this.$message.success(r.data.msg);
          this.search()
        }else{
          this.$message.error(r.data.msg);
        }
      })
    },
    handlerReject(){
      if(this.selectionList.length == 0) return this.$message.warning('请选择至少一条数据');
      let flag = this.selectionList.some(v => v.status != 1);
      if(flag) return this.$message.warning('请选择未审核的数据');
      this.$prompt('请输入拒绝原因', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator:(value) => {
          return value && value.trim() ? value.length <= 200 ? true : '拒绝原因最大200字' : '请输入拒绝原因'
        }
      }).then(({value}) => {
        let ids = this.selectionList.map(v => v.id);
        return rejectWithdraw({ ids, rejectCause:value })
      }).then(r => {
        if(r.data.code == 200){
          this.$message.success(r.data.msg);
          this.search()
        }else{
          this.$message.error(r.data.msg);
        }
      })
    },
    handleClick(){
      this.page.total = 0;
      this.page.pageSize = 30;
      this.page.currentPage = 1;
      this.selectionList = [];
      this.search();
    },
    search() {
      let param = {};
      this.selectionList = []
      this.page.currentPage = 1
      this.onLoad(this.page, param);
    },
    reset() {
      if(this.activeName === 'tk'){
        this.moreQueryParam = "";
        this.empState = "";
      }else{
        this.empName = "";
        this.auditTime = [];
        this.createTime = [];
        this.deptName = "";
        this.status = '1';
        this.redpackStatus = "";
        this.transactionStatus = "";
        this.orderNo = "";
      }
      this.search();
    },
    onLoad(page, params = {}) {
      this.empLoading = true;
      if(this.activeName == 'tk'){
        params['moreParamQuery'] = this.moreQueryParam.trim();
        params['empStatus'] = this.empState;
        getRefundEmpList(this.page.currentPage, this.page.pageSize, params).then(res => {
          const data = res.data.data;
          data.records.forEach(v => {
            v['mngpercentStr'] = v.mngpercent + '%';
            if(v.empType == 1){
              v.deptName = v.className
            }
          });
          this.page.total = data.total;
          this.empData = data.records;
          this.empLoading = false;
        });
      }else{
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params["empName"] = this.empName;
        params["deptName"] = this.deptName;
        params['status'] = this.status;
        params['transactionStatus'] = this.transactionStatus;
        params['redpackStatus'] = this.redpackStatus;
        params['orderNo'] = this.orderNo;
        params['createStartTime'] = this.createTime && this.createTime[0];
        params['createEndTime'] = this.createTime && this.createTime[1];
        params['auditStartTime'] = this.auditTime && this.auditTime[0];
        params['auditEndTime'] = this.auditTime && this.auditTime[1];
        reqWithdrawData(params).then(r => {
          this.empLoading = false;
          if(r.data.code == 200){
            let d = r.data.data;
            this.page.total = d.total;
            d.records.forEach(v => {
              let extJson = v.extJson && JSON.parse(v.extJson);
              if(!(v.status == 3 && v.transactionStatus == 3)){
                v.returnMsg = extJson?.wxResJson?.returnMsg || extJson?.rejectCause;
              }else{
                v.realTransactionTime = extJson?.wxResJson?.realTransactionTime
              }
              v.status2 = extJson?.queryWxRes?.status;
              // if(v.empType == 1){
              //   v.deptName = v.className
              // }
            })
            this.txData = d.records;
          }
        }).catch(() => this.empLoading = false);
      }
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
      if (this.selectionList.length != 1) return this.$message.warning("请选择一个人进行退款操作");
      this.refundTypeDisabled = false;
      let refundObj = {
        personalWellet: 0,
        refundMode: "现金",
        refundMoney: "0"
      };
      if(!this.permissionList.refundTypeTxSelect && this.permissionList.refundTypeXhSelect){
        refundObj["refundType"] = 2;
      }
      if(!this.permissionList.refundTypeTxSelect && !this.permissionList.refundTypeXhSelect && this.permissionList.refundTypeBtSelect){
        refundObj["refundType"] = 3;
      }
      if(this.permissionList.refundTypeTxSelect || (!this.permissionList.refundTypeTxSelect && !this.permissionList.refundTypeXhSelect && !this.permissionList.refundTypeBtSelect)){
        refundObj["refundType"] = 1;
      }
      if(this.selectionList[0].empStatus == 1007 && !this.permissionList.refundTypeXhSelect){
        this.$message.warn('账户已停用，请联系管理员')
        return;
      }
      // if(this.selectionList[0].empStatus == 1007 && this.permissionList.refundTypeXhSelect){
      //   refundObj['refundType'] = 2;
      //   this.refundTypeDisabled = true;
      // }
      this.refundObj = {...refundObj}
      this.drawer = true;
    },
    preRechargeSubmit(form, done) {
      if (form.refundMoney.length == 0) {
        this.$message({
          type: 'warning',
          message: '请填写退款金额!'
        });
        done();
        return;
      }
      let params = {
        refundMoney: form.refundMoney,
        empId: this.selectionList[0].empId,
        refundType: form.refundType,
        refundMode: form.refundMode,
        refundWallet: form.personalWellet
      };
      refundSubmit(params).then(res => {
        done();
        if (res.data.code == 200) {
          this.$message.success(res.data.msg)
          this.handleEsc();
          this.onLoad(this.page);
        }
      }).catch(err => {
        done();
        this.$refs['refundRef'].resetFields();
        this.onLoad(this.page);
      });
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
      this.$refs['refundRef'].resetFields();
      this.refundObj.refundMoney = "";
      this.drawer = false;
    },
    handleExport(){
      this.$confirm("是否导出第三方提现数据?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let ids = this.selectionList.map(v => v.id);
        let createStartTime = '',createEndTime = "",auditStartTime = "",auditEndTime = "";
        if(Array.isArray(this.createTime) && this.createTime.length){
          createStartTime = this.createTime[0];
          createEndTime = this.createTime[1]
        }
        if(Array.isArray(this.auditTime) && this.auditTime.length){
          auditStartTime = this.auditTime[0];
          auditEndTime = this.auditTime[1]
        }
        window.open(
          `/api/iot-basic/cash-withdrawal/export?current=${this.page.currentPage}&size=${this.page.pageSize}&${website.tokenHeader}=${getToken()}&empName=${this.empName}&ids=${ids}&status=${this.status}&orderNo=${this.orderNo}&createStartTime=${createStartTime}&createEndTime=${createEndTime}&auditStartTime=${auditStartTime}&auditEndTime=${auditEndTime}&transactionStatus=${this.transactionStatus}&deptName=${this.deptName}&redpackStatus=${this.redpackStatus}`
        );
      })
    },
  },
  computed: {
    ...mapGetters(['userInfo', 'permission', 'btnicon']),
    permissionList() {
      return {
        refundBtn: this.vaildData(this.permission.refund_refund_btn, false),
        readingCardBtn: this.vaildData(this.permission.refund_card_reading_btn, false),
        refundSubsidyWallet: this.vaildData(this.permission.refund_subsidy_wallet, true),
        refundTypeTxSelect: this.vaildData(this.permission.xf_refund_type_tx_select_auth_option, false),
        refundTypeXhSelect: this.vaildData(this.permission.xf_refund_type_xh_select_auth_option, false),
        refundTypeBtSelect: this.vaildData(this.permission.xf_refund_type_bt_select_auth_option, false)
      };
    },
    refundTypeDicData() {
      let arr = [];
      if (this.permissionList.refundTypeTxSelect) {
        arr.push({ label: '个人钱包退款', value: 1 });
      }
      if (this.permissionList.refundTypeXhSelect) {
        arr.push({ label: '销户退款', value: 2 });
      }
      if (this.permissionList.refundTypeBtSelect) {
        arr.push({ label: '补贴退款', value: 3 });
      }
      if (!this.permissionList.refundTypeTxSelect && !this.permissionList.refundTypeXhSelect && !this.permissionList.refundTypeBtSelect) {
        arr.push({ label: '个人钱包退款', value: 1 });
      }
      return arr;
    },
    tableHeight() {
      return window.innerHeight - 313
    },
    preRechargeoption() {
      return {
        submitText: '确定',
        emptyBtn: false,
        column: [
          {
            label: '退款类型',
            span: 24,
            type: 'select',
            dicData: this.refundTypeDicData,
            prop: 'refundType',
            align: 'center',
            disabled:this.refundTypeDisabled
          },
          {
            label: '退款金额',
            prop: 'refundMoney',
            span: 24,
            align: 'center',
            disabled: this.RefundMoneyDisabled,
            rules: [{
              validator: (rule, value, callback) => {
                let reg = /(^[0-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
                if (value == '' && this.refundObj.refundType != 2) {
                  callback(new Error('请输入退款金额'));
                } else if (!reg.test(value)) {
                  callback(new Error('请输入大于0的数字'));
                } else {
                  callback();
                }
              },
              trigger: 'blur'
            }]
          },
          {
            label: '退款方式',
            span: 24,
            type: 'select',
            dicData: [{ label: '现金', value: '现金' }, { label: '其它', value: '其它' }],
            prop: 'refundMode',
            align: 'center'
          },
          {
            label: '钱包',
            span: this.refundWalletSpan,
            prop: 'personalWellet',
            type: 'radio',
            dicData: this.walletData,
            align: 'center'
          }
        ]
      };
    },
    empOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          minWidth: 100,
          fixed: 'left',
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100,
          fixed: 'left',
        },
        {
          title: '人员状态',
          field: 'empStatusStr',
          sortable: true,
          width: 100,
        },
        {
          title: '钱包余额',
          field: 'Wallet',
          children: [
            {
              title: '个人钱包',
              field: 'personalWallet',
              width: 160,
              sortable: true,
            },
            {
              title: '补贴钱包1',
              field: 'subsidy1Wallet',
              width: 160,
              sortable: true,
            },
            {
              title: '补贴钱包2',
              field: 'subsidy2Wallet',
              width: 160,
              sortable: true,
            },
            {
              title: '补贴钱包3',
              field: 'subsidy3Wallet',
              width: 160,
              sortable: true,
            }
          ]
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
          minWidth: 160,
          sortable: true,
        }
      ]
    }
  },
};
</script>

<style lang="scss" scoped>
.box {
  height: 785px;
  height: 100%;
  overflow: auto;
}
.el-scrollbar {
  height: 100%;
}

/deep/.avue-crud__pagination {
  height: 32px !important;
}
.box .el-scrollbar__wrap {
  overflow: scroll;
}

.button {
  margin: 0 -1px 0 0 !important;
  line-height: 20px !important;
}

.center_open::before {
  left: 7px !important;
}

/deep/.el-table thead > tr > th:nth-child(2) > div {
  height: 26px !important;
}
</style>
