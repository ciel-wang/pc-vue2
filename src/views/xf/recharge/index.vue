<template>
  <basic-container style="height: 100%;">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="有卡充值" name="haveCard" v-if="permissionList.haveCardAuthBtn">
        <recharge-no-card :activeName="activeName"></recharge-no-card>
      </el-tab-pane>
      <el-tab-pane label="无卡充值" name="noCard" v-if="permissionList.noCardAuthBtn">
        <recharge-have-card :activeName="activeName"></recharge-have-card>
      </el-tab-pane>
      <el-tab-pane label="补贴充值" name="subsidyCard" v-if="permissionList.subsidyRechargeAuthBtn">
        <subsidy-recharge :activeName="activeName"></subsidy-recharge>
      </el-tab-pane>
      <el-tab-pane label="自动充值" name="subsidyCardAuto" v-if="permissionList.autoRechargeAuthBtn">
        <recharge-subsidy-auto :activeName="activeName"></recharge-subsidy-auto>
      </el-tab-pane>
    </el-tabs>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import RechargeHaveCard from './recharge_havecard';
import RechargeNoCard from './recharge_nocard';
import RechargeSubsidyAuto from './recharge_subsidy_auto';
import SubsidyRecharge from './subsidy';
export default {
  components: {
    RechargeHaveCard,
    RechargeNoCard,
    SubsidyRecharge,
    RechargeSubsidyAuto
  },
  data() {
    return {
      activeName: 'haveCard'
    };
  },
  mounted() {
    if (!this.permissionList.haveCardAuthBtn) {
      this.activeName = 'noCard';
    }
    if (!this.permissionList.haveCardAuthBtn && !this.permissionList.noCardAuthBtn) {
      this.activeName = 'subsidyCard';
    }
    if (!this.permissionList.haveCardAuthBtn && !this.permissionList.noCardAuthBtn && !this.permissionList.subsidyRechargeAuthBtn) {
      this.activeName = 'subsidyCardAuto';
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'permission']),
    permissionList() {
      return {
        subsidyRechargeAuthBtn: this.vaildData(this.permission.subsidy_recharge_auth, false),
        autoRechargeAuthBtn: this.vaildData(this.permission.auto_recharge_auth, false),
        haveCardAuthBtn: this.vaildData(this.permission.have_card_auth, false),
        noCardAuthBtn: this.vaildData(this.permission.no_card_auth, false)
      };
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.basic-container:first-child {
  height: 100% !important;
}
/deep/.basic-container{
  height: 100% !important;
}
/deep/.el-card{
  height: 99% !important;
  overflow: auto;
}
/deep/.el-tabs__content{
  overflow: auto !important;
}
</style>
