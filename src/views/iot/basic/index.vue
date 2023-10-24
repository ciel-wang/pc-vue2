<template>
  <el-row style="height: 99%;">
    <el-col span="18" style="height: 100%;">
      <div class="bg">
        <secondary-menu :id="id"></secondary-menu>
      </div>
    </el-col>

    <el-col span="6" style="height: 100%;">
      <div style="height: 100%;">
        <el-card style="height: 26%;margin: 0 0 10px 10px;overflow: auto;" :body-style="{padding:'0',height:'80%'}">
          <div slot="header" class="cardHeader">平台用户</div>
          <div class="flexClass">
            <div>
              <i class="iconfont icon-xuexiao_jiaoshi" style="color: #1296db;"></i>
              <p>
                <avue-count-up decimals="0" :end="obj.teacherTotalCount"></avue-count-up>
              </p>
              <span>教师</span>
            </div>
            <div>
              <i class="iconfont icon-wodexuesheng" style="color: #0c9326;"></i>
              <p>
                <avue-count-up decimals="0" :end="obj.studentTotalCount"></avue-count-up>
              </p>
              <span>学生</span>
            </div>
            <div>
              <i class="iconfont icon-classes" style="color: #13227a;"></i>
              <p>
                <avue-count-up decimals="0" :end="obj.totalCount"></avue-count-up>
              </p>
              <span>总用户</span>
            </div>
          </div>
        </el-card>
        <el-card style="height: 36%;margin: 0 0 10px 10px;overflow: auto;">
          <div slot="header" class="cardHeader">介质总览</div>
          <div class="flexClass">
            <div class="mb-10">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-qiyongicon-" />
              </svg>
              <p>
                <avue-count-up decimals="0" :end="obj.accountState1Count"></avue-count-up>
              </p>
              <span>启用</span>
            </div>
            <div class="mb-10">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-weiqiyong" />
              </svg>
              <p>
                <avue-count-up decimals="0" :end="obj.accountState0Count"></avue-count-up>
              </p>
              <span>未启用</span>
            </div>
            <div class="mb-10">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-tingyong_line" />
              </svg>
              <p>
                <avue-count-up decimals="0" :end="obj.accountState2Count"></avue-count-up>
              </p>
              <span>停用</span>
            </div>
            <div>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-ka" />
              </svg>
              <p>
                <avue-count-up decimals="0" :end="obj.cardTotalCount"></avue-count-up>
              </p>
              <span>智能卡</span>
            </div>
            <div>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-renlianshibie1" />
              </svg>
              <p>
                <avue-count-up decimals="0" :end="obj.faceTotalCount"></avue-count-up>
              </p>
              <span>人脸</span>
            </div>
            <div>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-code" />
              </svg>
              <p>
                <avue-count-up decimals="0" :end="obj.qrcodeTotalCount"></avue-count-up>
              </p>
              <span>二维码</span>
            </div>
          </div>
        </el-card>
        <el-card style="height: 33%;margin: 0 0 10px 10px;overflow: auto;">
          <div slot="header" class="cardHeader">用户卡总览</div>
          <div style="margin-bottom: 30px;">
            <el-button size="mini" :type="activeName == '1' ? 'primary' : ''" @click="activeName = 1">今日</el-button>
            <el-button size="mini" :type="activeName == '2' ? 'primary' : ''" @click="activeName = 2">本周</el-button>
            <el-button size="mini" :type="activeName == '3' ? 'primary' : ''" @click="activeName = 3">本月</el-button>
          </div>
          <div class="flexClass">
            <div>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-tuika" />
              </svg>
              <p>
                <avue-count-up v-show="activeName == 1" decimals="0" :end="obj.todayTkTotalCount"></avue-count-up>
                <avue-count-up v-show="activeName == 2" decimals="0" :end="obj.weekTkTotalCount"></avue-count-up>
                <avue-count-up v-show="activeName == 3" decimals="0" :end="obj.monthTkTotalCount"></avue-count-up>
              </p>
              <span>退卡总量</span>
            </div>
            <div>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-guashi" />
              </svg>
              <p>
                <avue-count-up v-show="activeName == 1" decimals="0" :end="obj.todayGsTotalCount"></avue-count-up>
                <avue-count-up v-show="activeName == 2" decimals="0" :end="obj.weekGsTotalCount"></avue-count-up>
                <avue-count-up v-show="activeName == 3" decimals="0" :end="obj.monthGsTotalCount"></avue-count-up>
              </p>
              <span>挂失卡总量</span>
            </div>
            <div>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-kaika" />
              </svg>
              <p>
                <avue-count-up v-show="activeName == 1" decimals="0" :end="obj.todayKkTotalCount"></avue-count-up>
                <avue-count-up v-show="activeName == 2" decimals="0" :end="obj.weekKkTotalCount"></avue-count-up>
                <avue-count-up v-show="activeName == 3" decimals="0" :end="obj.monthKkTotalCount"></avue-count-up>
              </p>
              <span>开卡总量</span>
            </div>
          </div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {mapGetters} from "vuex";
  import secondaryMenu from '@/components/secondary-menu/index.vue'
  import { getIndexData } from "@/api/iot/user.js"
  export default{
    components:{secondaryMenu},
    data(){
      return{
        id:"",
        obj:{
          teacherTotalCount:0,
          studentTotalCount:0,
          totalCount:0,
          accountState1Count:0,
          accountState0Count:0,
          accountState2Count:0,
          cardTotalCount:0,
          faceTotalCount:0,
          qrcodeTotalCount:0,
          todayTkTotalCount:0,
          todayKkTotalCount:0,
          todayGsTotalCount:0,
          weekTkTotalCount:0,
          weekKkTotalCount:0,
          weekGsTotalCount:0,
          monthTkTotalCount:0,
          monthKkTotalCount:0,
          monthGsTotalCount:0
        },
        activeName:1
      }
    },
    created() {
      this.id = this.$route.query.id;
    },
    activated() {
      this.initData()
    },
    methods:{
      initData(){
        getIndexData().then(r => {
          this.obj = r.data.data;
        })
      }
    }
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
      background-size: 100%;
      background-position: bottom;
      background-repeat: no-repeat;
    }
  }
  .flexClass{
    display: flex;
    flex-wrap: wrap;
    text-align: center;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    div{
      width: 33%;
      p{
        margin: 5px 0;
        font-weight: 600;
      }
      i{
        font-size: 38px;
      }
      span{
        font-size: 14px;
      }
    }
  }
  .icon{
    width: 38px;
    height: 38px;
    fill: currentColor;
    overflow: hidden;
  }
  .mb-10{
    margin-bottom: 36px;
  }
</style>
