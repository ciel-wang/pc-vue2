<template>
  <basicContainer style="height: 100% !important;padding: 0 !important;">
    <div class="menuClass">
      <div v-for="(item,index) in menu" :key="index" v-if="item.parentId == id" @click="open(item)" class="item">
        <img :src="item.iconUrl" width="54px" />
        <div style="text-align: center;">{{item.name}}</div>
      </div>
    </div>
  </basicContainer>
</template>

<script>
  import {mapGetters} from "vuex";
  export default {
    name: "secondaryMenu",
    data() {
      return {

      };
    },
    props: {
      id:{
        type:String
      },
      width:{
        type:String,
        default:'70%'
      },
    },
    computed:{
      ...mapGetters([ "menu" ]),
    },
    methods: {
      open(item) {
        this.$router.$avueRouter.group = item.group;
        this.$router.$avueRouter.meta = item.meta;
        this.$router.push({
          path: this.$router.$avueRouter.getPath({
            name: item.name,
            src: item.path
          }, item.meta),
          query: item.query
        });
      }
    }
  }
</script>

<style scoped lang="scss">
  .menuClass{
    display: flex;
    flex-wrap: wrap;
    .item{
      text-align: center;
      background-color: #FFFFFF;
      width: 15.47%;
      min-width: 15.47%;
      border: 1px solid rgb(230,233,236);
      margin: 0 0.5% 10px;
      padding: 15px 0;
      img{
        cursor: pointer;
      }
    }
  }
  /deep/.basic-container__card{
    height: 100%;
  }
</style>
