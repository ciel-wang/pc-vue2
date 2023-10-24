<template>
  <basic-container>
    <el-tabs v-model="activeName">
      <el-tab-pane label="按操作员统计" name="oprt" v-if="permission.sztj_oprt_btn">
        <recharge-statistics-oprt :activeName="activeName"></recharge-statistics-oprt>
      </el-tab-pane>
      <el-tab-pane label="按部门统计" name="dept" v-if="permission.sztj_dept_btn">
        <recharge-statistics-dept ref="deptRef" :activeName="activeName"></recharge-statistics-dept>
      </el-tab-pane>
      <el-tab-pane label="按班级统计" name="class" v-if="permission.sztj_class_btn">
        <recharge-statistics-class ref="classRef" :activeName="activeName"></recharge-statistics-class>
      </el-tab-pane>
    </el-tabs>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { getXfDetailQueryList } from '@/api/xf/xfdetails';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import RechargeStatisticsDept from './recharge-statistics-dept';
import RechargeStatisticsClass from './recharge-statistics-class.vue';
import RechargeStatisticsOprt from './recharge-statistics-oprt';

export default {
  components: { RechargeStatisticsDept, RechargeStatisticsOprt, RechargeStatisticsClass },
  data() {
    return {
      activeName: 'oprt'
    };
  },
  mounted() {
    if (!this.permission.sztj_oprt_btn) {
      this.activeName = 'dept';
    }
    if (!this.permission.sztj_oprt_btn && !this.permission.sztj_dept_btn) {
      this.activeName = 'class';
    }
  },
  computed:{
    ...mapGetters([ 'permission']),
  }
};
</script>

<style lang="scss" scoped></style>
