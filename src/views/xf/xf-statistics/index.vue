<template>
  <basic-container>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="按设备统计" name="dev" v-if="permission.xf_statistics_dev_auth">
        <xf-statistics-dev :activeName="activeName"></xf-statistics-dev>
      </el-tab-pane>
      <el-tab-pane label="按个人统计" name="person" v-if="permission.xf_statistics_person_auth">
        <xf-statistics-person :activeName="activeName"></xf-statistics-person>
      </el-tab-pane>
      <el-tab-pane label="按商户统计" name="seller" v-if="permission.xf_statistics_seller_auth">
        <xf-statistics-seller :activeName="activeName"></xf-statistics-seller>
      </el-tab-pane>
      <el-tab-pane label="按部门统计" name="dept" v-if="permission.xf_statistics_dept_auth">
        <xf-statistics-dept :activeName="activeName"></xf-statistics-dept>
      </el-tab-pane>
      <el-tab-pane label="按班级统计" name="class" v-if="permission.xf_statistics_class_auth">
        <xf-statistics-class :activeName="activeName"></xf-statistics-class>
      </el-tab-pane>
    </el-tabs>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import XfStatisticsDev from './xf-statistics-dev';
import XfStatisticsDept from './xf-statistics-dept';
import XfStatisticsPerson from './xf-statistics-person';
import XfStatisticsSeller from './xf-statistics-seller';
import XfStatisticsClass from './xf-statistics-class.vue'

export default {
  components: {
    XfStatisticsDev,
    XfStatisticsDept,
    XfStatisticsPerson,
    XfStatisticsSeller,
    XfStatisticsClass
  },
  data() {
    return {
      activeName: 'dev'
    };
  },
  watch: {},
  computed: {
    ...mapGetters(['permission']),
  },
  mounted() {
    if (!this.permission.xf_statistics_dev_auth) {
      this.activeName = 'person';
    }
    if (!this.permission.xf_statistics_dev_auth && !this.permission.xf_statistics_person_auth) {
      this.activeName = 'seller';
    }
    if (!this.permission.xf_statistics_dev_auth && !this.permission.xf_statistics_person_auth && !this.permission.xf_statistics_seller_auth) {
      this.activeName = 'dept';
    }
    if (!this.permission.xf_statistics_dev_auth && !this.permission.xf_statistics_person_auth && !this.permission.xf_statistics_seller_auth && !this.permission.xf_statistics_dept_auth) {
      this.activeName = 'class';
    }
  },
};
</script>

<style lang="scss" scoped>
.el-scrollbar {
  height: 100%;
}
</style>
