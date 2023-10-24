<template>
  <div class="login-body">
    <div id="particles-js">
      <div class="login_logo">
        <!-- <img src="/img/login-logo.png" width="100%" /> -->
      </div>
      <div class="login_img_left">
        <img src="/img/6.png" width="100%" />
      </div>
      <div class="login_body_right">
        <div class="tooltip_class">
          <div class="tooltip_div" @click="activeChange">
            <div class="tooltip_class_icon">
              <i v-if="activeName === 'user'" class="icon-font icon-erweimadenglu"></i>
              <i v-else class="icon-font icon-zhanghaodenglu"></i>
            </div>

            <div class="tooltip">
              {{activeName === 'user' ? '扫码登录' : '账号登录'}}
            </div>
          </div>
        </div>

        <div v-if="activeName === 'user'">
          <div class="login_right_title">{{ website.indexTitle }}</div>
          <userLogin></userLogin>
          <div class="login_right_v">版本号：V3.0</div>
        </div>

        <div v-if="activeName === 'erweima'" style="text-align: center;">
          <div class="login_right_title">扫码登录</div>
          <p class="login_right_subtitle">请使用Weland"AIoT移动端系统"</p>
          <p class="login_right_subtitle" style="margin-bottom: 10px;">在"我的"页面打开扫一扫</p>
          <vue-qr
            margin="0"
            :text="qrcode"
            :size="200"
            :logoSrc="logo"
            :logoScale="0.2">
          </vue-qr>
          <div
            style="color: #00aabc;text-align: right;padding: 10px;cursor: pointer;"
            @click="getQr">刷新</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import VueQr from 'vue-qr'
  import userLogin from "./userlogin";
  import codeLogin from "./codelogin";
  import thirdLogin from "./thirdlogin";
  import {mapGetters} from "vuex";
  import {dateFormat} from "@/util/date";
  import {validatenull} from "@/util/validate";
  import topLang from "@/page/index/top/top-lang";
  import topColor from "@/page/index/top/top-color";
  import {getQueryString, getTopUrl} from "@/util/util";
  import particlesConfig from "./particles.json";
  import { reqQr, reqQrState, reqSsoInfo } from "@/api/user";
  import website from '../../config/website';
  require('particles.js');

  export default {
    name: "login",
    components: {
      userLogin,
      codeLogin,
      thirdLogin,
      topLang,
      topColor,
      VueQr
    },
    data() {
      return {
        time: "",
        activeName: "user",
        socialForm: {
          tenantId: "000000",
          source: "",
          code: "",
          state: "",
        },
        qrcode:"123456789",
        logo:'',
        timer:null
      };
    },
    watch: {
      $route() {
        this.handleLogin();
      }
    },
    created() {
      this.handleLogin();
      this.getTime();
    },
    mounted() {
      window.particlesJS("particles-js", particlesConfig);
    },
    computed: {
      ...mapGetters(["website", "tagWel"])
    },
    methods: {
      activeChange(){
        this.activeName = this.activeName === 'user' ? 'erweima' : 'user';
        if(this.activeName === 'erweima'){
          this.getQr()
        }else{
          clearTimeout(this.timer)
        }
      },
      getQr(){
        reqQr().then(r => {
          if(r.data.code === 200){
            this.qrcode = r.data.data;
            this.getQrState()
          }
        })
      },
      getQrState(){
        reqQrState(this.qrcode).then(r => {
          if(r.data.code === 200){
            let d = r.data.data;
            if(d.isExpire) return this.$message.error("请刷新二维码");
            if(d.qrToken){
              const loading = this.$loading({
                lock: true,
                text: '登录中,请稍后。。。',
                spinner: "el-icon-loading"
              });
              this.$store.dispatch("LoginByUsername", {tenantId:'000000',username:d.qrToken,password:'',type:'qr',key:'',code:''}).then(() => {
                this.$router.push({path: this.tagWel.value});
                loading.close();
              }).catch(() => {
                loading.close();
              });
            }else{
              if(this.timer) clearTimeout(this.timer);
              this.timer = setTimeout(() => {
                this.getQrState()
              },2000)
            }
          }
        })
      },
      getTime() {
        setInterval(() => {
          this.time = dateFormat(new Date());
        }, 1000);
      },
      handleLogin() {
        const topUrl = getTopUrl();
        let ssoToken = getQueryString('ssoToken');
        if(ssoToken){
          const loading = this.$loading({
            lock: true,
            text: '登录中,请稍后。。。',
            spinner: "el-icon-loading"
          });
          this.$store.dispatch("LoginByUsername", {tenantId:'000000',username:ssoToken,password:'123456',type:'sso',key:'',code:''}).then(() => {
            this.$router.push({path: this.tagWel.value});
            loading.close();
          }).catch((err) => {
            loading.close();
          });
          return;
        }
        const redirectUrl = "/oauth/redirect/";
        if(process.env.VUE_APP_ISSSO == 1){
          let ticket = getQueryString("ticket");
          let url = window.location.href.split('?')[0];
          if(!ticket){
            location.href = `${website.ssoSeviceUrl}/sso/auth?client=iot-service&redirect=${url}`;
          }else{
            this.$store.dispatch("LoginByUsername", {tenantId:'',username:'',password:'',type:'',key:'',code:'',ticket}).then((e) => {
              let url = window.location.href.split('?')[0];
              location.href = url;
            }).catch((e) => {
              setTimeout(() => {
                location.href = `${website.ssoSeviceUrl}/sso/auth?client=iot-service&redirect=${url}`;
              },3000)
            });
          }
          return;
        }
        reqSsoInfo().then(r => {
          if(r.data.data.ssoAuth2Enable === "true"){
            location.href = r.data.data.ssoAuth2CodeRedirectUrl;
          }
        })
        this.socialForm.source = getQueryString("source");
        this.socialForm.code = getQueryString("code");
        this.socialForm.state = getQueryString("state");
        if (validatenull(this.socialForm.source) && topUrl.includes(redirectUrl)) {
          let source = topUrl.split("?")[0];
          source = source.split(redirectUrl)[1];
          this.socialForm.source = source;
        }
        if (!validatenull(this.socialForm.source) && !validatenull(this.socialForm.code) && !validatenull(this.socialForm.state)) {
          const loading = this.$loading({
            lock: true,
            text: '第三方系统登录中,请稍后。。。',
            spinner: "el-icon-loading"
          });
          this.$store.dispatch("LoginBySocial", this.socialForm).then(() => {
            window.location.href = topUrl.split(redirectUrl)[0];
            this.$router.push({path: this.tagWel.value});
            loading.close();
          }).catch(() => {
            loading.close();
          });
        }
      }
    }
  };
</script>

<style lang="scss">
  @import "@/styles/login.scss";
</style>
