<template>
  <el-dialog
    title="审核全部"
    append-to-body
    :visible.sync="visible"
    :show-close="false"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    width="400px">
    <el-row>
      <el-col span="20" style="font-weight: 600;">充值人数：{{ noAuditRechargeInfo.noAuditUserCount }}</el-col>
    </el-row>
    <el-row>
      <el-col span="20" style="font-weight: 600;">充值条数：{{ noAuditRechargeInfo.noAuditTotalCount }}</el-col>
    </el-row>
    <el-row>
      <el-col span="20" style="font-weight: 600;">实际充值金额：{{ noAuditRechargeInfo.noAuditTotalMoney }}</el-col>
    </el-row>
    <el-row style="border-top:1px solid #F1F1F1;">
      <el-input style="width:300px;margin-top:20px;" v-model="userLoginPwd" size="mini" placeholder="请输入当前用户登录密码..."></el-input>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" type="primary" @click="submitAuditHandle" :disabled="sbtnDisabled">审核</el-button>
      <el-button size="small" @click="visible = false" :disabled="sbtnDisabled">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import md5 from 'js-md5'
import moment from 'moment';
import { getSubsidyAllInfo, subsidyAuditAllRecharge } from '@/api/xf/recharge';

export default{
  data() {
    return {
      visible: false,
      userLoginPwd: '',
      noAuditRechargeInfo: {
        noAuditTotalCount: 0,
        noAuditTotalMoney: 0,
        noAuditUserCount: 0
      },
      sbtnDisabled: false,
      conObj: {
        personCount: 0,
        totalAmount: 0
      },
      obj: {
        rechargeType: 1,
        rechargeWallet: 1,
        rechargeMode: '现金'
      },
      hidePwd: ''
    };
  },
  watch: {
    userLoginPwd: {
      handler(nval, oval) {
        let nn = '';
        for (let i = 0; i < nval.length; i++) {
          nn += '*';
        }
        if (nval.length - 1 == this.hidePwd.length) {
          //说明是增加
          if (nval.length >= 1) {
            this.hidePwd = this.hidePwd + oval.substring(nval.length - 1, nval.length);
          } else {
            this.hidePwd = nval;
          }
        } else {
          //说明是减少
          this.hidePwd = this.hidePwd.substring(0, this.hidePwd.length - 1);
        }
        this.userLoginPwd = nn;
      },
      deep: true
    }
  },
  methods: {
    openDialog() {
      this.visible = true;
      this.userLoginPwd = '';
      this.initAllRechargeInfo();
    },
    initAllRechargeInfo() {
      getSubsidyAllInfo().then(res => {
        this.noAuditRechargeInfo = res.data.data;
      });
    },
    submitAuditHandle() {
      if (this.userLoginPwd == '') {
        this.$message.warning('请输入用户登录密码');
        return;
      }
      const loading = this.$loading({
        lock: true,
        text: '正在审核中，请耐心等待，不要关闭当前界面...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      subsidyAuditAllRecharge({ userPwd: md5(this.hidePwd)}).then(res => {
        if (res.data.code == 200) {
          this.$message.success(res.data.msg);
          this.visible = false;
          this.hidePwd = '';
          this.noAuditRechargeInfo = {};
          loading.close();
          this.$emit('refreshData');
        }
      }).catch(err => {
        loading.close();
      });
    },
    handleEsc() {
      this.drawer = false;
    }
  }
};
</script>