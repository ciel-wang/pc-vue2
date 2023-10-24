<template>
  <el-row style="height: 99%;">
    <el-col span="18" style="height: 100%;">
      <div class="bg">
        <secondary-menu :id="id"></secondary-menu>
      </div>
    </el-col>

    <el-col span="6" style="height: 100%;">
      <div style="height: 100%;">
        <el-card style="height: 30%;margin: 0 0 10px 10px;overflow: auto;" :body-style="{padding:'20px 0 0',height:'76%'}">
          <div slot="header" class="cardHeader">今日分餐统计</div>
          <div class="flexClass">
            <div class="item">
              <svg class="icon mr-8" aria-hidden="true">
                <use xlink:href="#icon-zuheduozhongxiaofeifangshizuhexiaofei" />
              </svg>
              <div>总消费
                <p>
                  <avue-count-up decimals="2" :end="obj.xftodayTotalAmount"></avue-count-up>
                </p>
              </div>
            </div>
            <div class="item">
              <svg class="icon mr-8" aria-hidden="true">
                <use xlink:href="#icon-zaocan" />
              </svg>
              <div>早餐
                <p>
                  <avue-count-up decimals="2" :end="obj.xftodayZcTotalAmount"></avue-count-up>
                </p>
              </div>
            </div>
            <div class="item">
              <svg class="icon mr-8" aria-hidden="true">
                <use xlink:href="#icon-wucan" />
              </svg>
              <div>午餐
                <p>
                  <avue-count-up decimals="2" :end="obj.xftodayWcTotalAmount"></avue-count-up>
                </p>
              </div>
            </div>
            <div class="item">
              <svg class="icon mr-8" aria-hidden="true">
                <use xlink:href="#icon-wancan" />
              </svg>
              <div>晚餐
                <p>
                  <avue-count-up decimals="2" :end="obj.xftodayWacTotalAmount"></avue-count-up>
                </p>
              </div>
            </div>
            <div class="item">
              <svg class="icon mr-8" aria-hidden="true">
                <use xlink:href="#icon-zhongcan" />
              </svg>
              <div>夜宵
                <p>
                  <avue-count-up decimals="2" :end="obj.xftodayYxTotalAmount"></avue-count-up>
                </p>
              </div>
            </div>
            <div class="item">
              <svg class="icon mr-8" aria-hidden="true">
                <use xlink:href="#icon-canyin" />
              </svg>
              <div>其他
                <p>
                  <avue-count-up decimals="2" :end="obj.xftodayQtTotalAmount"></avue-count-up>
                </p>
              </div>
            </div>
          </div>
        </el-card>
        <el-card style="height: 33%;margin: 0 0 10px 10px;overflow: auto;" :body-style="{padding:'5px 0',width:'100%',height:'84%'}">
          <div slot="header" class="cardHeader">当月商户消费统计</div>
          <div id="echarts" style="width: 80%;height: 100%;margin: 0 auto;"></div>
        </el-card>
        <el-card style="height: 32%;margin: 0 0 10px 10px;overflow: auto;" :body-style="{height:'79%',width:'100%',padding:'10px 0'}">
          <div slot="header" class="cardHeader">消费机状态监控</div>
          <div id="echarts2" style="width: 100%;height: 100%;"></div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {mapGetters} from "vuex";
  import secondaryMenu from '@/components/secondary-menu/index.vue'
  import { getXfData } from '@/api/xf/index.js'
  import * as echarts from 'echarts';
  export default{
    components:{secondaryMenu},
    data(){
      return{
        id:"",
        obj:{xftodayTotalAmount:0,totalDevCount:0,onlineTotalDevCount:0,xftodayZcTotalAmount:0,xftodayWcTotalAmount:0,xftodayWacTotalAmount:0,xftodayYxTotalAmount:0,xftodayQtTotalAmount:0},
        pieData:[],
        devCount:0,
        devArr:[]
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
        getXfData().then(r => {
          let d = r.data.data;
          this.obj = r.data.data;
          let arr = []
          d.sellerXfData.forEach(v => {
            arr.push({
              name:v.sellerName,
              value:v.totalAmount
            })
          })
          this.devCount = d.totalDevCount;
          this.devArr[0] = {name:"在线",value:d.onlineTotalDevCount}
          this.devArr[1] = {name:"离线",value:d.totalDevCount - d.onlineTotalDevCount}
          this.pieData = arr;
          this.getPie()
          this.getEcharts2()
        })
      },
      getEcharts2(){
        let myChart = echarts.init(document.getElementById('echarts2'));
        myChart.setOption({
          title:{
            text:`${this.devCount}台`,
            subtext:"设备总数",
            left:"center",
            top:"42%",
            subtextStyle:{
              color:"#999",
              fontSize:16
            }
          },
          tooltip: {
            trigger: 'item'
          },
          legend: {
            top: '2%',
            left: 'center'
          },
          series: [{
            color: ["#4f91f1", "#FB6260"],
            name: '消费机状态',
            type: 'pie',
            radius: ['55%', '65%'],
            label: {
              show: false,
              position: 'center'
            },
            labelLine: {
              show: false
            },
            hoverAnimation:true,
            data: this.devArr
          }],
        });
      },
      getPie(){
        var chartDom = document.getElementById('echarts');
        var myChart = echarts.init(chartDom);
        var option;
        option = {
          legend: {
            top: 'top',
          },
          toolbox: {
            show: true,
          },
          tooltip: {
            trigger: 'item'
          },
          series: [
            {
              name: '商户消费统计',
              type: 'pie',
              radius: ['45%', '55%'],
              roseType: 'radius',
              data: this.pieData
            }
          ]
        };
        option && myChart.setOption(option);
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
    .item{
      width: 50%;
      display: flex;
      justify-content: center;
      text-align: left;
      margin-bottom: 20px;
      div{
        width: 30%;
        font-size: 14px;
        p{
          margin: 2px 0;
          font-size: 16px;
          font-weight: 600;
        }
      }
    }
  }
  .firstItem{
    display: flex;
    justify-content: space-around;
    text-align: center;
    div{
      width: 33.3%;
      font-size: 14px;
      p{
        margin: 10px 0;
        font-size: 16px;
        font-weight: 600;
      }
      i{
        font-size: 26px;
      }
    }
  }
  .icon {
    width: 30px;
    height: 30px;
    fill: currentColor;
    overflow: hidden;
  }
  .mr-8{
    margin-right: 8px;
  }
  .mb-20{
    margin-bottom: 20px;
  }
</style>
