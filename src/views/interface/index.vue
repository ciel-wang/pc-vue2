<template>
  <div style="height: 99%;">
    <div class="bg">
      <secondary-menu :id="id"></secondary-menu>
    </div>
  </div>
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
  .bg{
    width: 100%;
    height: 100%;
    /deep/.el-card{
      background-image: url(/img/2.png) !important;
      background-size: 100%;
      background-position: bottom;
      background-repeat: no-repeat;
    }
  }
</style>
