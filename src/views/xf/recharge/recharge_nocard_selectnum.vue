<template>
  <el-row>
      <el-col span="4"><el-radio @change="clickSelect"  v-model="selectAmount"  :label="50">50元</el-radio></el-col>
      <el-col span="4"><el-radio @change="clickSelect"  v-model="selectAmount" :label="100">100元</el-radio></el-col>
      <el-col span="4"><el-radio @change="clickSelect"  v-model="selectAmount" :label="150">150元</el-radio></el-col>
      <el-col span="4"><el-radio @change="clickSelect"  v-model="selectAmount" :label="200">200元</el-radio></el-col>
      <el-col span="4"><el-radio @change="clickSelect"  v-model="selectAmount" :label="250">250元</el-radio></el-col>
      <el-col span="4"><el-radio @change="clickSelect"  v-model="selectAmount" :label="300">300元</el-radio></el-col>
  </el-row>

</template>

<script>

  export default{
    data(){
      return {
          selectAmount:0,
      }
    },
    methods:{
        clickSelect(){
            this.$parent.column.event.click(this.selectAmount)
        }
    },
  }
</script>

<style>
</style>
