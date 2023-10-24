<template>
  <basic-container>
    <el-tabs v-model="activeName" @tab-click="tabClick">
      <el-tab-pane label="部门分组" name="dept">
        <classesgroup-dept ref="classesgroupDeptRef" :activeName="activeName"></classesgroup-dept>
      </el-tab-pane>
      <el-tab-pane label="班级分组" name="class">
        <classesgroup-class ref="classesgroupClassRef" :activeName="activeName"></classesgroup-class>
      </el-tab-pane>
      <el-tab-pane label="考勤分组" name="kq">
        <classesgroup-kq ref="classesgroupKqRef" :activeName="activeName"></classesgroup-kq>
      </el-tab-pane>
    </el-tabs>
  </basic-container>
</template>

<script>
import classesgroupDept from './classesgroup-dept.vue';
import classesgroupKq from './classesgroup-kq.vue';
import classesgroupClass from "./classesgroup-class.vue"
export default {
  components: { classesgroupDept, classesgroupKq ,classesgroupClass},
  data() {
    return {
      activeName: 'dept'
    };
  },
  methods: {
    tabClick(v) {
      this.activeName = v.name;
    }
  }
};
</script>

<style scoped>

</style>
