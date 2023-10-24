<template>
  <basic-container style="height: 100%;">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="有卡充值" name="havecardRecharge"></el-tab-pane>
      <el-tab-pane label="无卡充值" name="nocardRecharge">
        <nocard-recharge ref="nocardRechargeRef"></nocard-recharge>
      </el-tab-pane>
      <el-tab-pane label="退款" name="refund"></el-tab-pane>
      <avue-form ref="avueForm" :option="option" v-model="obj" @submit="submit" @error="error" v-if="activeName != 'nocardRecharge'">
        <template slot-scope="scope" slot="menuForm">
          <el-row style="width:100%;text-align: center;">
            <el-button v-if="permission.energy_wallet_readcardBtn" :disabled="btnLoading" icon="el-icon-search" @click="searchEmp">查找人</el-button>
            <el-button
              type="primary"
              @click="submit"
              icon="el-icon-check"
              :loading="btnLoading"
              v-if="permission.energy_wallet_rechargeBtn && activeName === 'havecardRecharge'">充值</el-button>
            <el-button
              type="primary"
              @click="submit"
              icon="el-icon-check"
              :loading="btnLoading"
              v-if="permission.energy_wallet_refundBtn && activeName === 'refund'">退款</el-button>
          </el-row>
        </template>
      </avue-form>
    </el-tabs>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { reqWalletAccinfo, sendWalletRecharge, sendWalletTransger, sendWalletRefund,sendWalletRefundToXf } from '@/api/energy-mng/index.js'
import { cardFunction } from '@/util/cardIssuer.js'
import { waterCardFunction } from '@/util/waterCardIssuer.js'
import nocardRecharge from './nocard-recharge.vue'

export default {
  components:{ nocardRecharge },
  data() {
    return {
      activeName:'havecardRecharge',
      obj: {
        rechargeWellet: 0,
        rechargeType: '现金',
        transferFromWallet:'0',
        transferToWallet:'0'
      },
      btnLoading:false
    };
  },
  methods: {
    handleClick(){
      if(this.activeName != 'nocardRecharge'){
        this.obj.rechargeType = "现金";
        this.obj.rechargeMoney = 0
      }
    },
    async handleRes(){
      let accountNum = this.obj.accountNum;
      await waterCardFunction({ accountNum },'recharge').then(r => {
        this.btnLoading = false;
        if(r == 0) this.$message.success('水电控写卡成功！');
      }).catch((err) => {
        this.btnLoading = false;
        if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
        this.$message.warning(err)
      })
      this.$nextTick(() => {
        this.obj = Object.assign({},{ rechargeWellet: 0, rechargeType: '现金', transferFromWallet:'0' });
      })
    },
    submit() {
      if (!this.obj.empId) return this.$message.warning('请先查找人');
      if (this.obj.rechargeMoney == 0) return this.$message.warning('请填写金额');
      this.btnLoading = true;
      if(this.activeName === 'havecardRecharge'){
        let { empId, rechargeMoney, rechargeType, transferFromWallet } = this.obj;
        if(rechargeType === "转入"){
          sendWalletTransger({ empId, transferFromWallet, transferMoney:rechargeMoney }).then(r => {
            this.btnLoading = false;
            if(r.data.code === 200){
              this.$message.success(r.data.msg);
              this.handleRes();
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch(() => this.btnLoading = false)
        }else{
          sendWalletRecharge({ empId, rechargeMoney, rechargeMode:rechargeType, transferFromWallet }).then(r => {
            this.btnLoading = false;
            if(r.data.code === 200){
              this.$message.success(r.data.msg);
              this.handleRes();
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch(() => this.btnLoading = false)
        }
      }else{
        let { empId, rechargeMoney, rechargeType, transferToWallet } = this.obj;
        if(rechargeType === '转出'){
          sendWalletRefundToXf({ empId,transferToWallet,transferMoney:rechargeMoney}).then(r => {
            this.btnLoading = false;
            if (r.data.code === 200) {
              this.$message.success(r.data.msg);
              this.handleRes();
            } else {
              this.$message.error(r.data.msg);
            }
          }).catch(() => (this.btnLoading = false));
          return;
        }
        sendWalletRefund({ empId, refundMoney:rechargeMoney, refundMode:rechargeType }).then(r => {
          this.btnLoading = false;
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.handleRes();
          }else{
            this.$message.error(r.data.msg);
          }
        }).catch(() => this.btnLoading = false)
      }
    },
    searchEmp(){
      cardFunction({},'CardFindEmp').then(res => {
        if (res) {
          reqWalletAccinfo({ physicalCardNum:res }).then(r => {
            if(r.data.code === 200){
              this.obj = r.data.data;
            }
          })
        }
      }).catch((err) => {
        if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
        this.$message.warning(err)
      })
    },
  },
  computed: {
    ...mapGetters(['permission']),
    option() {
      return {
        emptyBtn: false,
        submitBtn: false,
        group: [
          {
            label: '我的资产',
            arrow: false,
            collapse: true,
            column: [
              {
                label: '学工号',
                prop: 'empCode',
                span: 6,
                readonly: true,
                placeholder: '请读卡'
              },
              {
                label: '姓名',
                prop: 'empName',
                span: 6,
                readonly: true,
                placeholder: '请读卡'
              },
              {
                label: '账号',
                prop: 'accountNum',
                span: 6,
                readonly: true,
                placeholder: '请读卡'
              },
              {
                label: '物理卡号',
                prop: 'physicalCardNum',
                span: 6,
                readonly: true,
                placeholder: '请读卡'
              },
              {
                label: '节能钱包',
                prop: 'waterElectricityWallet',
                span: 6,
                readonly: true,
                placeholder: '请读卡'
              }
            ]
          },
          {
            label: '业务内容',
            arrow: false,
            collapse: true,
            display: true,
            column: [
              {
                label: '快捷充值',
                prop: 'selectAmount',
                type:'radio',
                dicData:[
                  {value:50,label:"50元"},
                  {value:100,label:"100元"},
                  {value:150,label:"150元"},
                  {value:200,label:"200元"},
                  {value:250,label:"250元"},
                  {value:300,label:"300元"}
                ],
                span: 24,
                change:({ value }) => {
                  let that = this;
                  that.obj.rechargeMoney = value;
                },
                display:this.activeName === 'havecardRecharge' ? true : false
              },
              {
                label: this.activeName === 'havecardRecharge' ? '充值金额' : '退款金额',
                prop: 'rechargeMoney',
                span: 6,
                type: 'number',
                precision: 2
              },
              {
                label: this.activeName === 'havecardRecharge' ? '充值方式' : '退款方式',
                prop: 'rechargeType',
                type: 'radio',
                dicData: this.activeName == 'havecardRecharge' ? [
                  { label: '现金', value: '现金' },
                  { label: '微信',  value: '微信' },
                  { label: '支付宝', value: '支付宝' },
                  { label: '转入', value: '转入' }
                ] : [
                  { label: '现金', value: '现金' },
                  { label:"转出", value:"转出"},
                  { label: '其他', value: '其他' }
                ],
                span: 24,
              },
              {
                label: '转出钱包',
                prop: 'transferFromWallet',
                type: 'radio',
                dicData: [
                  { label: '个人钱包', value: '0' },
                  { label: '补贴钱包1', value: '1' },
                  { label: '补贴钱包2', value: '2' },
                  { label: '补贴钱包3', value: '3' },
                ],
                display:this.activeName == 'havecardRecharge' && this.obj.rechargeType === '转入' ? true : false,
                span: 24,
              },
              {
                label: this.activeName === 'havecardRecharge' ? '充值钱包' : '退款钱包',
                prop: 'rechargeWellet',
                type: 'radio',
                dicData: [{ label: '节能钱包', value: 0 }]
              },
              {
                label:"转入钱包",
                prop:"transferToWallet",
                type: 'radio',
                dicData: [
                  { label: '个人钱包', value: '0' },
                  { label: '补贴钱包1', value: '1' },
                  { label: '补贴钱包2', value: '2' },
                  { label: '补贴钱包3', value: '3' }
                ],
                display: this.activeName != 'havecardRecharge' && this.obj.rechargeType === '转出' ? true : false,
                span: 24
              }
            ]
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
  >>>.avue-group__title{
    font-size: 13px;
  }
  >>>.el-form-item__label{
    font-size: 12px;
  }
  >>>.el-radio {
    margin-right: 30px !important;
  }
  >>>.el-radio__label{
    font-size: 12px;
  }
  >>>.el-form-item--small.el-form-item{
    margin-bottom: 12px;
  }
  >>>.basic-container__card{
    height: 99% !important;
    overflow: auto;
  }
</style>
