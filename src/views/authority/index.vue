<template>
  <el-row style="height: 99%;">
    <el-col span="18" style="height: 100%;">
      <div class="bg">
        <secondary-menu :id="id"></secondary-menu>
      </div>
    </el-col>

    <el-col span="6" style="height: 100%;">
      <div style="height: 100%;">
        <basicContainer style="height: 33%;padding: 0 0 10px 10px;"></basicContainer>
        <basicContainer style="height: 33%;padding: 0 0 10px 10px;"></basicContainer>
        <basicContainer style="height: 33%;padding: 0 0 10px 10px;"></basicContainer>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {mapGetters} from "vuex";
  import secondaryMenu from '@/components/secondary-menu/index.vue'
  export default{
    components:{secondaryMenu},
    data(){
      return{
        id:"",
      }
    },
    created() {
      this.id = this.$route.query.id;
    },
  }
</script>

<style scoped="scoped" lang="scss">
  /deep/.basic-container__card{
    height: 100% !important;
  }
  .bg{
    width: 100%;
    height: 100%;
    /deep/.el-card{
      background-image: url(/img/3.png) !important;
      background-size: 103%;
      background-position: bottom;
      background-repeat: no-repeat;
    }
  }

</style>
