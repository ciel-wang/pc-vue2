<template>
  <div>
    <avue-form :option="option" v-model="obj" @submit="submit" @error="error">
      <template slot-scope="scope" slot="menuForm">
        <el-row style="width:100%;text-align: center;">
          <el-button v-if="permission.have_card_auth__read_iccard_btn" icon="el-icon-search" @click="readCard">读卡</el-button>
          <el-button
            type="primary"
            @click="submit(done)"
            style="margin-left:20px"
            icon="el-icon-check"
            v-if="permission.have_card_auth__submit_recharge_btn">充值</el-button>
        </el-row>
      </template>
    </avue-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getRechargeReadCardCipher } from '@/api/iot/account';
import { getRechargePersonInfo, haveCardRechargeSubmitData } from '@/api/xf/recharge';
import { cardFunction } from '@/util/cardIssuer.js';

export default {
  data() {
    return {
      currEmpId: null,
      obj: {
        personalWellet: 0,
        rechargeType: '现金'
      },
      handingFee: ''
    };
  },
  methods: {
    submit(form, done) {
      if (!this.permission.have_card_auth__submit_recharge_btn) {
        this.$message.warning('无权限')
        return;
      }
      if (!this.currEmpId) {
        this.$message.warning('请先读卡')
        return;
      }
      if (this.obj.rechargeMoney == 0 || this.obj.rechargeMoney == '0') {
        this.$message.warning('请填写充值金额')
        return;
      }
      cardFunction({},'CardFindEmp').then(data => {
        if (data && data == this.obj.cardNum) {
          haveCardRechargeSubmitData(this.obj).then(res => {
            if (res.data.code == 200) {
              this.$message.success('充值成功')
              this.obj.rechargeMoney = '';
              this.obj['personalWallet'] = (res.data.data.personalWallet * 1).toFixed(2);
              this.$forceUpdate();
            } else {
              this.$message.warning(res.data.msg)
            }
          });
        }else{
          this.$message.warning('卡片信息与充值人员信息不同，请重新新读卡');
          return;
        }
      }).catch((err) => {
        if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
        this.$message.warning(err)
      })
    },
    readCard() {
      cardFunction({},'CardFindEmp').then(res => {
        if (res) {
          getRechargePersonInfo({ cardNum: res }).then(r => {
            this.handingFee = r.data.data.handingFee;
            this.currEmpId = r.data.data.empId;
            this.obj = r.data.data;
            this.obj.rechargeMoney = null;
            this.$forceUpdate();
          });
        }
      }).catch((err) => {
        if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
        this.$message.warning(err)
      })
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'permission']),
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
                prop: 'cardNum',
                span: 6,
                readonly: true,
                placeholder: '请读卡'
              },
              {
                label: '个人钱包',
                prop: 'personalWallet',
                span: 6,
                readonly: true,
                placeholder: '请读卡'
              },
              {
                label: '补贴钱包1',
                prop: 'subsidy1Wallet',
                span: 6,
                readonly: true,
                placeholder: '请读卡'
              },
              {
                label: '补贴钱包2',
                prop: 'subsidy2Wallet',
                span: 6,
                readonly: true,
                placeholder: '请读卡'
              },
              {
                label: '补贴钱包3',
                prop: 'subsidy3Wallet',
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
                }
              },
              {
                label: '充值金额',
                prop: 'rechargeMoney',
                span: 6,
                row: true,
                type: 'number',
                precision: 2,
                change: val => {
                  let that = this;
                  if (val.value != 'undefined') {
                    that.obj.mngMoney = (val.value * that.handingFee) / 1000;
                  }
                }
              },
              {
                label: '管理费',
                prop: 'mngMoney',
                append: '元',
                span: 6,
                row: true,
                readonly: true,
                placeholder: '自动计算'
              },
              {
                label: '充值方式',
                prop: 'rechargeType',
                row: true,
                type: 'radio',
                dicData: [
                  { label: '现金', value: '现金' },
                  { label: '微信', value: '微信' },
                  { label: '支付宝', value: '支付宝' },
                  { label: '其他', value: '其他' }
                ],
                span: 24,
              },
              {
                label: '充值钱包',
                prop: 'personalWellet',
                type: 'radio',
                dicData: [{ label: '个人钱包', value: 0 }],
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
</style>
