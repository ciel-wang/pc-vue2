<template>
  <div>
    <secondary-menu :id="id"></secondary-menu>
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

<style>
</style>
