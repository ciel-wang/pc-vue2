<template>
  <div class="avue-logo">
    <transition name="fade">
      <span v-if="keyCollapse"
            class="avue-logo_subtitle"
            key="0">
        {{website.logo}}
      </span>
    </transition>
    <transition-group name="fade">
      <template v-if="!keyCollapse">
        <span class="avue-logo_title" key="1" v-if="themeName == 'theme-hey' || themeName =='theme-cool' || themeName == 'theme-d2'">
          <img src="../../../public/logo2.png" width="85%" style="vertical-align: middle;" />
        </span>
        <span class="avue-logo_title" key="1" v-else>
          <img src="../../../public/logo.png" width="85%" style="vertical-align: middle;" />
        </span>

        <!-- <span class="avue-logo_title" key="1">1111{{website.indexTitle}} </span> -->
      </template>
    </transition-group>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "logo",
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["website", "keyCollapse",'themeName'])
  },
  methods: {}
};
</script>

<style lang="scss">
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-active {
  transition: opacity 2.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.avue-logo {
  position: fixed;
  top: 0;
  left: 0;
  width: 120px;
  height: 64px;
  line-height: 64px;
  background-color: #20222a;
  font-size: 20px;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.15);
  color: rgba(255, 255, 255, 0.8);
  z-index: 99;
  &_title {
    display: block;
    text-align: center;
    font-weight: 300;
    font-size: 20px;
  }
  &_subtitle {
    display: block;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
  }
}
</style>
