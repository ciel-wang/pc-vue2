<template>
  <!-- 个人账户查询模块 -->
  <basic-container style="font-size:14px;">
    <div>
      <el-autocomplete
        style="width:200px"
        v-model="moreParamQuery"
        size="small"
        ref="searchInput"
        class="inline-input"
        :fetch-suggestions="querySearch"
        placeholder="请输入学工号/姓名"
        @select="search"></el-autocomplete>
      <el-date-picker
        style="margin-left:10px;width:230px"
        v-model="daterange"
        type="daterange"
        size="small"
        :clearable="false"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"></el-date-picker>
      <el-button
        size="small"
        type="primary"
        icon="el-icon-search"
        @click="search"
        style="margin-left:10px">查询</el-button>
      <el-button @click="handleExport" type="primary" icon="el-icon-download" size="small" v-if="permission.personmoney_export_btn">导出</el-button>
      <el-button
        style="float:right;margin-right:20px"
        type="primary"
        @click="detailClick"
        size="small">显示/隐藏图表</el-button>
    </div>

    <!-- 账户信息部分开始 -->
    <el-row style="margin-top:20px;font-size:12px" v-show="isShow">
      <!-- 账户信息部分 -->
      <el-col span="6">
        <el-card class="box-card" style="width:98%;height:275px;">
          <div slot="header" class="clearfix">
            <svg
              class="icon"
              aria-hidden="true"
              style="font-size:17px;vertical-align: -4px;margin-right: 4px;">
              <use xlink:href="#icon-yiliaohangyedeICON-" />
            </svg>
            <span>账户信息 {{ empInfo }}</span>
          </div>
          <el-col span="16" style="margin-left:10px;font-weight: 600;">
            <el-row>
              <el-col>
                账户号：{{accDetail.accountNum}}
              </el-col>
            </el-row>
            <el-row style="margin-top:8px">
              <el-col>账户状态：
                <el-tag
                  size="mini"
                  :type="accDetail.accountStateType"
                  v-if="accDetail.accountState.length >0">
                  {{accDetail.accountState}}
                </el-tag>
              </el-col>
            </el-row>
            <el-row style="margin-top:8px">
              <el-col>卡状态：
                <el-tag
                  size="mini"
                  :type="accDetail.cardStateType"
                  v-if="accDetail.cardState.length > 0"
                  effect="dark">{{ accDetail.cardState }}</el-tag>
              </el-col>
            </el-row>
            <el-row style="margin-top:8px;">
              <el-col>物理卡号：{{accDetail.physicalCardNum}}</el-col>
            </el-row>
            <el-row style="margin-top:8px;">
              <el-col>开户日期：{{accDetail.accountOpenTime}}</el-col>
            </el-row>
            <el-row style="margin-top:8px;">
              <el-col>部门名称：{{accDetail.deptName}}</el-col>
            </el-row>
            <el-row style="margin-top:8px;">
              <el-col>学校名称：{{accDetail.schoolName}}</el-col>
            </el-row>
          </el-col>
          <el-col span="7">
            <img
              width="80px"
              v-if="accDetail.empFaceUrl"
              style="margin-top: 16px;"
              height="100px"
              :src="accDetail.faceUrl+'?time='+ new Date().getTime()"/>
            <i
              class="iconfont icon-ren-account-photo"
              v-else
              style="font-size: 80px;color: #c0c4cc;"
              height="100px"/>
          </el-col>
        </el-card>
      </el-col>

      <el-col span="9">
        <!-- 账户余额部分 -->
        <el-row style="margin:0 7px 7px 0">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <svg
                class="icon"
                aria-hidden="true"
                style="font-size:16px;vertical-align: -3px;margin-right: 4px;">
                <use xlink:href="#icon-consumption" />
              </svg>
              <span>账户余额</span>
              <span style="margin-left:50px" class="txtred">￥
                <avue-count-up decimals="2" :end="accDetail.accountBalanceTotal"></avue-count-up>
              </span>
            </div>
            <el-row type="flex" justify="space-between" align="center">
              <el-col span="5">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.accountPersonalBalance"></avue-count-up>
                  </p>
                  <p class="itm-txt">个人钱包</p>
                </div>
              </el-col>
              <el-col span="5">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.accountSubsidy1Balance"></avue-count-up>
                  </p>
                  <p class="itm-txt">补贴1钱包</p>
                </div>
              </el-col>
              <el-col span="5">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.accountSubsidy2Balance" ></avue-count-up>
                  </p>
                  <p class="itm-txt">补贴2钱包</p>
                </div>
              </el-col>
              <el-col span="5">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.accountSubsidy3Balance" ></avue-count-up>
                  </p>
                  <p class="itm-txt">补贴3钱包</p>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-row>
        <!-- 收入统计部分 -->
        <el-row style="margin:0 7px 7px 0">
          <el-col :span="6">
            <div style="margin-right: 8px;">
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <svg
                    class="icon"
                    aria-hidden="true"
                    style="font-size:16px;vertical-align: -3px;margin-right: 4px;">
                    <use xlink:href="#icon-consumption" />
                  </svg>
                  <span>期初结余</span>
                </div>
                <el-row type="flex" justify="space-between" align="center">
                  <el-col :span="24">
                    <div class="itm">
                      <p class="itm-num">
                        <avue-count-up decimals="2" :end="accDetail.lastMonthBalance"></avue-count-up>
                      </p>
                      <p class="itm-txt">期初结余</p>
                    </div>
                  </el-col>
                </el-row>
              </el-card>
            </div>
          </el-col>
          <el-col :span="18">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <svg
                  class="icon"
                  aria-hidden="true"
                  style="font-size:16px;vertical-align: -3px;margin-right: 4px;">
                  <use xlink:href="#icon-consumption" />
                </svg>
                <span>收入统计</span>
                <span style="margin-left:50px" class="txtgreen">
                  ￥
                  <avue-count-up decimals="2" :end="sztjAmount"></avue-count-up>
                </span>
              </div>
              <el-row type="flex" justify="space-between" align="center">
                <el-col span="4">
                  <div class="itm">
                    <p class="itm-num">
                      <avue-count-up decimals="2" :end="accDetail.wkczAmount"></avue-count-up>
                    </p>
                    <p class="itm-txt">无卡充值</p>
                  </div>
                </el-col>
                <el-col span="4">
                  <div class="itm">
                    <p class="itm-num">
                      <avue-count-up decimals="2" :end="accDetail.sgczAmount"></avue-count-up>
                    </p>
                    <p class="itm-txt">手工充值</p>
                  </div>
                </el-col>
                <el-col span="4">
                  <div class="itm">
                    <p class="itm-num">
                      <avue-count-up decimals="2" :end="accDetail.btffAmount"></avue-count-up>
                    </p>
                    <p class="itm-txt">补贴发放</p>
                  </div>
                </el-col>
                <el-col span="4">
                  <div class="itm">
                      <p class="itm-num"><avue-count-up decimals="2" :end="accDetail.jnzrAmount"></avue-count-up></p>
                      <p class="itm-txt">节能转入</p>
                  </div>
                </el-col>
                <el-col span="4">
                  <div class="itm">
                    <p class="itm-num">
                      <avue-count-up decimals="2" :end="accDetail.dkjcAmount"></avue-count-up>
                    </p>
                    <p class="itm-txt">多扣纠错</p>
                  </div>
                </el-col>
                <el-col span="4">
                  <div class="itm">
                    <p class="itm-num">
                      <avue-count-up decimals="2" :end="accDetail.otherInAmount"></avue-count-up>
                    </p>
                    <p class="itm-txt">其他收入</p>
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <el-col span="9">
        <!-- 消费金额部分 -->
        <el-row style="margin-bottom:7px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <svg
                class="icon"
                aria-hidden="true"
                style="font-size:16px;vertical-align: -3px;margin-right: 4px;">
                <use xlink:href="#icon-consumption" />
              </svg>
              <span>消费金额</span>
              <span style="margin-left:50px" class="txtred">￥
                <avue-count-up decimals="2" :end="accDetail.xfTotalAmount"></avue-count-up>
              </span>
            </div>
            <el-row type="flex" justify="space-between" align="center">
              <el-col span="5">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.xfPersonalWalletAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">个人钱包</p>
                </div>
              </el-col>
              <el-col span="5">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.xfSubsidy1WalletAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">补贴1钱包</p>
                </div>
              </el-col>
              <el-col span="5">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.xfSubsidy2WalletAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">补贴2钱包</p>
                </div>
              </el-col>
              <el-col span="5">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.xfSubsidy3WalletAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">补贴3钱包</p>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-row>
        <!-- 支出统计部分 -->
        <el-row style="margin-bottom:7px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <svg
                class="icon"
                aria-hidden="true"
                style="font-size:16px;vertical-align: -3px;margin-right: 4px;" >
                <use xlink:href="#icon-consumption" />
              </svg>
              <span>支出统计</span>
              <span style="margin-left:50px" class="txtred">￥
                <avue-count-up decimals="2" :end="zctjAmount"></avue-count-up>
              </span>
            </div>
            <el-row type="flex" justify="space-between" align="center">
              <el-col span="4">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.xftjAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">消费</p>
                </div>
              </el-col>
              <el-col span="4">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.dsftxAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">提现</p>
                </div>
              </el-col>
              <el-col span="4">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.tkAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">个人钱包退款</p>
                </div>
              </el-col>
              <el-col span="4">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.xhtjAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">销户退款</p>
                </div>
              </el-col>
              <el-col span="4">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.bttkAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">补贴退款</p>
                </div>
              </el-col>
              <el-col span="4">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.xfglfAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">管理费</p>
                </div>
              </el-col>
              <el-col span="4">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.btqlTotalAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">补贴清零</p>
                </div>
              </el-col>
              <el-col span="4">
                <div class="itm">
                  <p class="itm-num">
                    <avue-count-up decimals="2" :end="accDetail.zzTotalAmount"></avue-count-up>
                  </p>
                  <p class="itm-txt">转账</p>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-row>
      </el-col>
    </el-row>
    <!-- 账户信息部分结束 -->

    <!-- 餐类统计部分开始 -->
    <el-row v-show="isShow">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <svg
            class="icon"
            aria-hidden="true"
            style="font-size:16px;vertical-align: -3px;margin-right: 4px;">
            <use xlink:href="#icon-zuheduozhongxiaofeifangshizuhexiaofei" />
          </svg>
          <span>餐类统计（金额/次数）</span>
        </div>
        <el-row type="flex" justify="space-around">
          <!-- 早餐 -->
          <el-col span="4" class="cltj_border">
            <el-row>
              <el-col
                span="10"
                style="border-right:1px solid #f0f2f5;padding:8px 0;margin-top:10px;font-size:28px">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-zaocan" />
                </svg>
              </el-col>
              <el-col span="14">
                <p>早餐</p>
                <p>
                  <avue-count-up decimals="2" :end="accDetail.zcAmount"></avue-count-up>/
                  <avue-count-up :end="accDetail.zcCount"></avue-count-up>
                </p>
              </el-col>
            </el-row>
          </el-col>
          <!-- 午餐 -->
          <el-col span="4" class="cltj_border">
            <el-row>
              <el-col
                span="10"
                style="border-right:1px solid #f0f2f5;padding:8px 0;margin-top:10px;font-size:28px">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-wucan" />
                </svg>
              </el-col>
              <el-col span="14">
                <p>午餐</p>
                <p>
                  <avue-count-up decimals="2" :end="accDetail.wcAmount"></avue-count-up>/
                  <avue-count-up :end="accDetail.wcCount"></avue-count-up>
                </p>
              </el-col>
            </el-row>
          </el-col>
          <!-- 晚餐 -->
          <el-col span="4" class="cltj_border">
            <el-row>
              <el-col
                span="10"
                style="border-right:1px solid #f0f2f5;padding:8px 0;margin-top:10px;font-size:28px">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-wancan" />
                </svg>
              </el-col>
              <el-col span="14">
                <p>晚餐</p>
                <p>
                  <avue-count-up decimals="2" :end="accDetail.wacAmount"></avue-count-up>/
                  <avue-count-up :end="accDetail.wacCount"></avue-count-up>
                </p>
              </el-col>
            </el-row>
          </el-col>
          <!-- 夜宵 -->
          <el-col span="4" class="cltj_border">
            <el-row>
              <el-col
                span="10"
                style="border-right:1px solid #f0f2f5;padding:8px 0;margin-top:10px;font-size:28px">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-zhongcan" />
                </svg>
              </el-col>
              <el-col span="14">
                <p>夜宵</p>
                <p>
                  <avue-count-up decimals="2" :end="accDetail.yxAmount"></avue-count-up>/
                  <avue-count-up :end="accDetail.yxCount"></avue-count-up>
                </p>
              </el-col>
            </el-row>
          </el-col>
          <!-- 其他 -->
          <el-col span="4" class="cltj_border">
            <el-row>
              <el-col
                span="10"
                style="border-right:1px solid #f0f2f5;padding:8px 0;margin-top:10px;font-size:28px">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-canyin" />
                </svg>
              </el-col>
              <el-col span="14">
                <p>其他</p>
                <p>
                  <avue-count-up decimals="2" :end="accDetail.qtAmount"></avue-count-up>/
                  <avue-count-up :end="accDetail.qtCount"></avue-count-up>
                </p>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-card>
    </el-row>
    <!--  -->

    <vxe-grid
      style="margin-top: 10px;"
      border
      resizable
      highlight-hover-row
      :height="tableHeight.height"
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="data"
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

    <el-dialog
      title="姓名重复,请根据编号选择"
      :append-to-body="true"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="empsVisible"
      width="1200px">
      <el-radio-group v-model="selectEmp">
        <el-radio :label="key.empCode" v-for="key in queryEmps" :key="key.empCode">{{ key.empName }} - {{ key.empCode }}</el-radio>
      </el-radio-group>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="empsVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="search">确 定</el-button>
      </span>
    </el-dialog>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from "moment";
import { getToken } from "@/util/auth";
import {
  getPersonalAccountDetails,
  getPersonalAccount
} from "@/api/xf/personal";
export default {
  data() {
    return {
      daterange: [],
      isShow: true,
      moreParamQuery: "",
      empsVisible: false,
      data: [],
      selectEmp: "",
      loading: false,
      sztjAmount: 0,
      zctjAmount: 0,
      accDetail: {
        faceUrl: "",
        accountNum: "",
        accountState: "",
        cardState: "",
        physicalCardNum: "",
        accountOpenTime: "",
        empFaceUrl: "",
        accountPersonalBalance: 0,
        accountBalanceTotal: 0,
        accontPersonalBalance: 0,
        accountSubsidy1Balance: 0,
        accountSubsidy2Balance: 0,
        accountSubsidy3Balance: 0,
        xfTotalAmount: 0,
        xfPersonalWalletAmount: 0,
        xfSubsidy1WalletAmount: 0,
        xfSubsidy2WalletAmount: 0,
        xfSubsidy3WalletAmount: 0,
        zcAmount: 0,
        zcCount: 0,
        wcAmount: 0,
        wcCount: 0,
        wacAmount: 0,
        wacCount: 0,
        yxAmount: 0,
        yxCount: 0,
        qtAmount: 0,
        qtCount: 0,
        lastMonthBalance:0,
        wkczAmount: 0,
        wkczCount: 0,
        sgczAmount: 0,
        sgczCount: 0,
        btffAmount: 0,
        jnzrAmount:0,
        btffCount: 0,
        tkAmount: 0,
        dsftxAmount:0,
        tkCount: 0,
        xfAmount: 0,
        xfCount: 0,
        xftjAmount: 0,
        xftjCount: 0,
        xhtjAmount: 0,
        xhtjCount: 0,
        dkjcAmount: 0,
        otherInAmount:0,
        dkjcCount: 0,
        bttkAmount: 0,
        bttkCount: 0,
        xfglfAmount: 0,
        xfglfCount: 0,
        accountStateType: "",
        cardStateType: "",
        btqlTotalAmount: 0,
        zzTotalAmount:0
      },
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      queryEmps: [],
      accTransTypesArr: [
        { label: '有卡充值', value: 1 },
        { label: '无卡充值', value: 2 },
        { label: '补贴充值', value: 3 },
        { label: '消费扣款', value: 4 },
        { label: '个人钱包退款', value: 5 },
        { label: '销户', value: 6 },
        { label: '多扣纠错退款', value: 7 },
        { label: '补贴清零', value: 8 },
        { label: '转账', value: 9 },
        { label: '补贴退款', value: 10 },
        { label: '微信充值', value: 11 },
        { label: '提现', value: 12 },
        { label: '节能钱包转入', value: 15 }
      ],
      selectionList:[]
    };
  },
  created() {
    let monthLastDay = moment(new Date()).endOf("month").format("YYYY-MM-DD");
    let monthStartDay = moment(new Date()).startOf("month").format("YYYY-MM-DD");
    this.daterange = [monthStartDay, monthLastDay];
  },
  methods: {
    querySearch(queryString, cb) {
      let empList = this.queryEmps;
      // 调用 callback 返回建议列表的数据
      if (empList && empList.length > 0) {
        let result = [];
        empList.forEach(emp => {
          result.push({
            value: emp["empName"] + " - " + emp["empCode"]
          });
        });
        cb(result);
        return;
      }
      cb([]);
    },
    detailClick() {
      this.isShow = !this.isShow;
    },
    search() {
      if (!this.moreParamQuery) {
        this.$message.warning("请输入学工号/姓名");
        return;
      }
      if (this.moreParamQuery.indexOf("-") != -1) {
        let empcode = this.moreParamQuery.split("-")[1].trim();
        this.moreParamQuery = empcode;
      }
      this.initAccountDetails();
      this.onLoad(this.page);
    },
    initAccountDetails() {
      let params = { moreParamQuery: this.moreParamQuery.trim() };
      if (this.daterange) {
        params["accTransStartTime"] = this.daterange[0];
        params["accTransEndTime"] = this.daterange[1];
      }
      getPersonalAccount(params).then(res => {
        let data = res.data.data;
        this.selectEmp = null;
        this.queryEmps = [];
        if (data.emps) {
          data.emps.forEach(e => {
            this.queryEmps.push(e);
          });
          this.$refs.searchInput.focus();
          return;
        }
        if(data.empType == 1){
          data.deptName = data.className
        }
        this.accDetail = res.data.data;
        this.accDetail.faceUrl = this.accDetail.prefix + this.accDetail.empFaceUrl;
        let jzstate = "";
        if (this.accDetail.empFaceUrl) {
          jzstate += "脸";
        }
        if (this.accDetail.cardState) {
          jzstate += ",卡";
        }
        if (this.accDetail.accountState == 0) {
          this.accDetail.accountState = "未启用";
          this.accDetail.accountStateType = "warning";
          this.accDetail.dark = "dark";
        }
        if (this.accDetail.accountState == 1) {
          this.accDetail.accountState = "启用";
        }
        if (this.accDetail.accountState == 2) {
          this.accDetail.accountState = "停用";
          this.accDetail.accountStateType = "info";
        }
        if (this.accDetail.cardState == 1) {
          this.accDetail.cardState = "未发卡";
          this.accDetail.cardStateType = "info";
        }
        if (this.accDetail.cardState == 2) {
          this.accDetail.cardState = "正常";
        }
        if (this.accDetail.cardState == 3) {
          this.accDetail.cardState = "报损";
          this.accDetail.cardStateType = "warning";
        }
        if (this.accDetail.cardState == 4) {
          this.accDetail.cardState = "挂失";
          this.accDetail.cardStateType = "warning";
        }
        if (this.accDetail.cardState == 5) {
          this.accDetail.cardState = "解挂";
          this.accDetail.cardStateType = "warning";
        }
        if (this.accDetail.cardState == 6) {
          this.accDetail.cardState = "退卡";
          this.accDetail.cardStateType = "warning";
        }
        this.sztjAmount =
          this.accDetail.wkczAmount * 1 +
          this.accDetail.sgczAmount * 1 +
          this.accDetail.btffAmount * 1 +
          this.accDetail.dkjcAmount * 1 +
          this.accDetail.jnzrAmount * 1 +
          this.accDetail.otherInAmount*1;
        this.zctjAmount =
          this.accDetail.bttkAmount * 1 +
          this.accDetail.xhtjAmount * 1 +
          this.accDetail.xftjAmount * 1 +
          this.accDetail.tkAmount * 1 +
          this.accDetail.dsftxAmount * 1 +
          this.accDetail.xfglfAmount * 1 +
          this.accDetail.btqlTotalAmount * 1 +
          this.accDetail.zzTotalAmount * 1;

        this.accDetail["jzstate"] = jzstate;
        this.$forceUpdate();
      });
    },
    onLoad(page, params = {}) {
      this.data = [];
      this.loading = true;
      params["moreParamQuery"] = this.moreParamQuery.trim();
      if (this.daterange) {
        params["accTransStartTime"] = this.daterange[0];
        params["accTransEndTime"] = this.daterange[1];
      }
      if (this.selectEmp) {
        let empCode = this.selectEmp.split("-")[1];
        params = { moreParamQuery: empCode.trim() };
      }
      getPersonalAccountDetails(
        this.page.currentPage,
        this.page.pageSize,
        params
      ).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          //有卡充值 无卡充值 收入金额 = 管理费 + 收入金额
          if (v.accTransType == "1" || v.accTransType == "2") {
            if (v.mngMoney) {
              v.inMoney = (parseFloat(v.inMoney) + parseFloat(v.mngMoney)).toFixed(2);
              v.outMoney = v.mngMoney;
            }
            if (parseFloat(v.mngMoney) > 0) {
              v.remark = "扣除管理费";
            } else {
              v.remark = v.accTransType;
            }
          }
          if (v.outMoney && v.outMoney > 0) {
            v.outMoney = "-" + v.outMoney;
          } else {
            v.outMoney = "-";
          }
          if (parseFloat(v.inMoney) == 0) {
            v.inMoney = "-";
          }
          if ([4,5,6,8,9,10,12].includes(v.accTransType)) {
            if (parseFloat(v.personalWallet) > 0) {
              v.personalWallet = "-" + v.personalWallet;
            } else if (v.personalWallet == "0.00") {
              v.personalWallet = "-";
            }
            if (parseFloat(v.subsidy1Wallet) > 0) {
              v.subsidy1Wallet = "-" + v.subsidy1Wallet;
            } else if (v.subsidy1Wallet == "0.00") {
              v.subsidy1Wallet = "-";
            }
            if (parseFloat(v.subsidy2Wallet) > 0) {
              v.subsidy2Wallet = "-" + v.subsidy2Wallet;
            } else if (v.subsidy2Wallet == "0.00") {
              v.subsidy2Wallet = "-";
            }
            if (parseFloat(v.subsidy3Wallet) > 0) {
              v.subsidy3Wallet = "-" + v.subsidy3Wallet;
            } else if (v.subsidy3Wallet == "0.00") {
              v.subsidy3Wallet = "-";
            }
          } else {
            if (parseFloat(v.personalWallet) == 0) {
              v.personalWallet = "-";
            }
            if (parseFloat(v.subsidy1Wallet) == 0) {
              v.subsidy1Wallet = "-";
            }
            if (parseFloat(v.subsidy2Wallet) == 0) {
              v.subsidy2Wallet = "-";
            }
            if (parseFloat(v.subsidy3Wallet) == 0) {
              v.subsidy3Wallet = "-";
            }
          }

        });
        this.data = data.records;
        this.loading = false;
        if (this.data.length != 0) {
          this.$message.success("查询成功");
        }
      });
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
    handleExport() {
      this.$confirm("是否导出个人账户信息?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let ids = "";
        if (this.selectionList.length > 0) {
          this.selectionList.forEach(v => {
            ids = ids + "," + v.id;
          });
        }
        ids = ids.substring(1, ids.length);
        let accTransStartTime = "";
        let accTransEndTime = "";
        if (this.daterange) {
          accTransStartTime = this.daterange[0];
          accTransEndTime = this.daterange[1];
        }
        window.open(
          `/api/iot-xf/personmoney/list/export?accTransStartTime=${accTransStartTime}&accTransEndTime=${accTransEndTime}&${this.website.tokenHeader}=${getToken()}&ids=${ids}&moreParamQuery=${this.moreParamQuery.trim()}`
        );
      });
    },
    cellClassName({ row, rowIndex, column, columnIndex }){
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
      if(column.property === 'inMoney'){
        return 'txtgreen'
      }
      if(column.property === 'outMoney'){
        return 'txtred'
      }
    },
  },
  computed: {
    ...mapGetters(['permission']),
    empInfo() {
      if (this.accDetail.empCode) {
        return ("【" + this.accDetail.empCode + " - " + this.accDetail.empName + "】");
      }
      return "";
    },
    tableHeight(){
    	return {
    		height:window.innerHeight-276
    	}
    },
    options() {
      return [
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: "日期时间",
          field: "accTransTime",
          sortable: true,
          minWidth: 130,
          fixed: "left",
        },
        {
          title: "交易类型",
          field: "accTransType",
          sortable: true,
          minWidth: 100,
          fixed: "left",
          formatter: ({ cellValue }) => {
            let item = this.accTransTypesArr.find(item => item.value === cellValue)
            return item ? item.label : ''
          },
        },
        {
          title: "收入金额",
          field: "inMoney",
          sortable: true,
          minWidth: 100,
        },
        {
          title: "支出金额",
          field: "outMoney",
          sortable: true,
          minWidth: 100,
        },
        {
          title: "账户余额",
          field: "accAfterMoney",
          sortable: true,
          minWidth: 100,
        },
        {
          title: "个人钱包",
          field: "personalWallet",
          sortable: true,
          minWidth: 100,
        },
        {
          title: "补贴1钱包",
          field: "subsidy1Wallet",
          sortable: true,
          minWidth: 100,
        },
        {
          title: "补贴2钱包",
          field: "subsidy2Wallet",
          sortable: true,
          minWidth: 100,
        },
        {
          title: "补贴3钱包",
          field: "subsidy3Wallet",
          sortable: true,
          minWidth: 100,
        },
        {
          title: "设备编号",
          field: "devCode",
          sortable: true,
          minWidth: 100,
        },
        {
          title: "设备名称",
          field: "devName",
          sortable: true,
          minWidth: 100,
        },
        {
          title: "交易备注",
          field: "remark",
          sortable: true,
          minWidth: 130,
        },
      ]
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  height: 820px;
  height: 100%;
}
/deep/.vxe-body--column.txtred {
  color: #dd0a00;
  font-weight: 600;
}
/deep/.vxe-body--column.txtgreen {
  color: #008755;
  font-weight: 600;
}
.txtred {
  color: #dd0a00;
  font-weight: 600;
}
.txtgreen {
  color: #008755;
  font-weight: 600;
}
.itm {
  line-height: 0px;
  margin: 0 auto;
  text-align: center;
}
.itm .itm-txt {
  line-height: 15px;
  font-size: 12px;
  margin-top: 14px;
}
.hrCls {
  border: 1px dashed #ebeef5;
}
/deep/ .el-card.is-always-shadow {
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.el-card__header span {
  font-size: 14px;
  font-weight: 600;
}
.cltj_border {
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-right: 20px;
  font-size: 12px;
}
.icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  overflow: hidden;
}
</style>
