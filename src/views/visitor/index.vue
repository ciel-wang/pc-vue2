<template>
  <el-row style="height: 99%;">
    <el-col span="18" style="height: 100%;">
      <div class="bg">
        <secondary-menu :id="id"></secondary-menu>
      </div>
    </el-col>

    <el-col span="6" style="height: 100%;">
      <div style="height: 100%;">
        <el-card style="height: 20%;margin: 0 0 10px 10px;overflow: auto;">
          <div slot="header" class="cardHeader">今日访客来/离访情况</div>
          <div class="flexItem">
            <div style="border-right: 1px solid #E8E8E8;">
              <p>本月累计来访</p>
              <avue-count-up decimals="0" :end="monthComeToCount" class="fw600"></avue-count-up>
              <span style="font-size: 14px;">人</span>
            </div>
            <div>
              <p>
                <i class="iconfont icon-laifang" style="color: #f37a1f;"></i>
                <span style="margin: 0 20px;">今日来访</span>
                <avue-count-up decimals="0" :end="todayVisitCount" class="fw600"></avue-count-up>
              </p>
              <p>
                <i class="iconfont icon-likai" style="color: #1296db;"></i>
                <span style="margin: 0 20px;">今日离开</span>
                <avue-count-up decimals="0" :end="todayLeaveCount" class="fw600"></avue-count-up>
              </p>
            </div>
          </div>
        </el-card>
        <el-card style="height: 36%;margin: 0 0 10px 10px;" :body-style="{height:'80%'}">
          <div slot="header" class="cardHeader">超时未离访预警</div>
          <div style="height: 100%;">
            <vxe-grid
              resizable
              auto-resize
              height="100%"
              ref="xGrid"
              size="mini"
              align="center"
              :highlight="true"
              :columns="options"
              :loading="loading"
              :data="data">
            </vxe-grid>
          </div>
        </el-card>
        <el-card style="height: 40%;margin: 0 0 10px 10px;overflow: auto;" :body-style="{height:'78%',width:'100%',padding:'0'}">
          <div slot="header" class="cardHeader">被访事由分析</div>
          <div id="echarts" style="width: 100%;height:100%;"></div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {mapGetters} from "vuex";
  import secondaryMenu from '@/components/secondary-menu/index.vue'
  import { getInitData } from "@/api/visitor/index.js"
  import * as echarts from 'echarts';
  export default{
    components:{secondaryMenu},
    data(){
      return{
        id:"",
        data:[],
        loading:false,
        monthComeToCount:0,
        todayLeaveCount:0,
        todayVisitCount:0,
        echartsData:[],
        echartsName:[]
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
        getInitData().then(r => {
          let d = r.data.data
          this.data = d.timeOutNoLeaveData
          this.monthComeToCount = d.monthComeToCount;
          this.todayLeaveCount = d.todayLeaveCount;
          this.todayVisitCount = d.todayVisitCount;
          let arr1 = []
          let arr2 = [];
          const arrCopy = Array.from(d.causes);
          const maxCountObj = arrCopy.reduce((prev, current) => {
            return (prev.value > current.value) ? prev : current;
          });
          d.causes.forEach(v => {
            arr1.push({ name:v.name, max:maxCountObj.value })
            arr2.push(v.value)
          })
          this.echartsData = arr2;
          this.echartsName = arr1;
          this.setEcharts()
        })
      },
      setEcharts(){
        var myChart = echarts.init(document.getElementById('echarts'));
        var option;
        option = {
          radar: {
            center: ['50%', '55%'],
            indicator: this.echartsName
          },
          series: [{
            type: 'radar',
            data: [
              {value:this.echartsData}
            ]
          }]
        };
        option && myChart.setOption(option);
      },
    },
    computed:{
      options(){
        return[
          {
            title:"姓名",
            field:"visitorName",
            minWidth:80,
          },
          {
            title:"手机号码",
            field:"visitorPhone",
            minWidth:100,
          },
          {
            title:"被访人姓名",
            field:"targetVisitorEmpName",
            minWidth:90,
          },
          {
            title:"被访人手机号码",
            field:"targetVisitorEmpPhone",
            minWidth:110,
          },
        ]
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
      background-image: url(/img/5.png) !important;
      background-size: 100%;
      background-position: bottom;
      background-repeat: no-repeat;
    }
  }
  .flexItem{
    display: flex;
    justify-content: space-between;
    text-align: center;
    align-items: center;
    &>div{
      width: 49%;
      p{
        margin: 10px 0;
      }
      i{
        font-size: 24px;
      }
    }
    .rightItem{
      p,div{
        width: 70%;
      }
      div,i{
        float: left;
      }
    }
  }
</style>
