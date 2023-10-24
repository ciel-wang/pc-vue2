<template>
  <el-row class="parking_class">
    <el-col span="18" style="height: 100%;">
      <div class="bg">
        <secondary-menu :id="id"></secondary-menu>
      </div>
    </el-col>

    <el-col span="6" style="height: 100%;">
      <div style="height: 100%;">
        <el-card style="height: 49%;margin: 0 0 10px 10px;" :body-style="{height:'80%'}">
          <div style="display: flex;align-items: center;margin-bottom: 30px;">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-tingchechang" />
            </svg>
            <div style="margin-left: 20px;">
              <avue-count-up style="font-size: 24px;font-weight: 600;" decimals="0" :end="parkingSpaceTotalCount"></avue-count-up>
              <p>总车位</p>
            </div>
          </div>
          <div class="cardHeader" style="margin-bottom: 30px;">进出车辆统计</div>
          <ol class="car_static_class">
            <li>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-jinru" />
              </svg>
            </li>
            <li>今日入场车辆</li>
            <li>
              <el-progress :stroke-width="20" :percentage="inCountPCT" color="#00EA8D" :format="() => ''"></el-progress>
            </li>
            <li class="fw600">{{inCount}}</li>
          </ol>
          <ol class="car_static_class">
            <li>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-chuhang" />
              </svg>
            </li>
            <li>今日离场车辆</li>
            <li>
              <el-progress :stroke-width="20" :percentage="outCountPCT" color="#FF9F00" :format="() => ''"></el-progress>
            </li>
            <li class="fw600">{{outCount}}</li>
          </ol>
          <ol class="car_static_class">
            <li>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-zaichang" />
              </svg>
            </li>
            <li>今日在场车辆</li>
            <li>
              <el-progress :stroke-width="20" :percentage="sceneCountPCT" color="#3897FF" :format="() => ''"></el-progress>
            </li>
            <li class="fw600">{{sceneCount}}</li>
          </ol>
        </el-card>

        <el-card style="height: 49%;margin: 0 0 10px 10px;" :body-style="{height:'80%',padding:'10px 0 0',width:'100%'}">
          <div slot="header" class="cardHeader">泊位使用率</div>
          <div id="echarts" style="width: 100%;height: 100%;"></div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {mapGetters} from "vuex";
  import secondaryMenu from '@/components/secondary-menu/index.vue'
  import * as echarts from 'echarts';
  import { reqIndexStatic } from '@/api/parking/yard.js'

  export default{
    components:{secondaryMenu},
    data(){
      return{
        myChart:null,
        parkingSpaceTotalCount:0,
        sceneCount:0,
        inCount:0,
        outCount:0,
        timer:null
      }
    },
    created() {
      this.id = this.$route.query.id;
    },
    mounted() {
      this.myChart = echarts.init(document.getElementById('echarts'));
    },
    activated() {
      this.initData();
    },
    deactivated() {
      clearTimeout(this.timer);
      this.timer = null;
    },
    methods:{
      initData(){
        reqIndexStatic().then(r => {
          let d = r.data.data;
          this.sceneCount = d.sceneCount || 0;
          this.parkingSpaceTotalCount = d.parkingSpaceTotalCount || 0;
          this.inCount = d.inCount || 0;
          this.outCount = d.outCount || 0;
          let data = [
            0,
            parseFloat((d.c1/d.parkingSpaceTotalCount).toFixed(1)),
            parseFloat((d.c2/d.parkingSpaceTotalCount).toFixed(1)),
            parseFloat((d.c3/d.parkingSpaceTotalCount).toFixed(1)),
            parseFloat((d.c4/d.parkingSpaceTotalCount).toFixed(1)),
            parseFloat((d.c5/d.parkingSpaceTotalCount).toFixed(1)),
            parseFloat((d.c6/d.parkingSpaceTotalCount).toFixed(1)),
          ];
          this.getEchartCfg(data);
          if(this.timer) clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.initData()
          },5000)
        })
      },
      getEchartCfg(data){
        let option = {
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [0, 4, 8, 12, 16, 20, 24],
            name: '小时'
          },
          yAxis: { type: 'value', name: '使用率' },
          series: [
            {
              data: data,
              type: 'line',
              color:"rgb(255, 158, 68)",
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgb(255, 158, 68)' },
                  { offset: 1, color: 'rgb(255, 70, 131)' }
                ])
              }
            }
          ]
        };
        option && this.myChart.setOption(option);
      },

    },
    computed:{
      sceneCountPCT(){
        let { sceneCount, parkingSpaceTotalCount} = this;
        return parkingSpaceTotalCount === 0 ? 0 : Math.round((sceneCount/parkingSpaceTotalCount)*100);
      },
      inCountPCT(){
        let { inCount, outCount} = this;
        let sum = inCount + outCount;
        return sum === 0 ? 0 : Math.round((inCount/sum)*100);
      },
      outCountPCT(){
        let { inCount, outCount} = this;
        let sum = inCount + outCount;
        return sum === 0 ? 0 : Math.round((outCount/sum)*100);
      }
    }
  }
</script>

<style scoped lang="scss">
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
  p{margin: 6px 0 0;}
  .parking_class{
    height: 99%;
  }
  .icon{
    width: 76px;
    height: 76px;
    fill: currentColor;
    overflow: hidden;
  }
  ol,li{list-style: none;padding: 0;}
  .car_static_class{
    display: flex;
    align-items: center;
    padding: 0 20px;
    .icon{width: 36px;height: 36px;}
    li{margin: 0 5px;}
    li:nth-child(2){
      font-size: 14px;
    }
    li:nth-child(3){
      flex: 1;
    }
  }
  /deep/.el-progress-bar{padding-right: 0;}
</style>
