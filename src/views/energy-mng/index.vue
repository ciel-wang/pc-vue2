<template>
  <el-row style="height: 99%;">
    <el-col span="18" style="height: 100%;position: relative;">
      <div class="bg">
        <secondary-menu :id="id"></secondary-menu>
      </div>
    </el-col>

    <el-col span="6" style="height: 100%;">
      <div style="height: 100%;">
        <el-card style="height: 25%;margin: 0 0 10px 10px;" :body-style="{padding:'0',height:'80%',position: 'relative'}">
          <div slot="header" class="cardHeader">水控设备分析</div>
          <ul class="ul_class">
            <li>
              <p>总数</p>
              <span>{{ obj.waterDevTotal }}</span>
            </li>
            <li>
              <p>异常数</p>
              <span>{{ obj.waterDevErrTotal }}</span>
            </li>
          </ul>
          <div id="waterEcharts" style="width: 200px;height:200px;position: absolute;top: 0;right: 0;"></div>
        </el-card>
        <el-card style="height: 25%;margin: 0 0 10px 10px;" :body-style="{padding:'0',height:'80%',position: 'relative'}">
          <div slot="header" class="cardHeader">电控设备分析</div>
          <ul class="ul_class">
            <li>
              <p>总数</p>
              <span>{{ obj.electricityDevTotal }}</span>
            </li>
            <li>
              <p>异常数</p>
              <span>{{ obj.electricityDevErrTotal }}</span>
            </li>
          </ul>
          <div id="electricityEcharts" style="width: 200px;height:200px;position: absolute;top: 0;right: 0;"></div>
        </el-card>
        <el-card style="height: 47%;margin: 0 0 10px 10px;" :body-style="{height:'80%',padding:'10px',width:'100%'}">
          <div slot="header" class="cardHeader">近一周水电汇总</div>
          <div style="width: calc(100% - 20px);height: 90%;">
            <vxe-table
              border
              stripe
              auto-resize
              resizable
              size="mini"
              highlight-hover-row
              align="center"
              height="100%"
              :data="tableData">
              <vxe-column title="日期" field="swipeTime" minWidth="100"></vxe-column>
              <vxe-column title="总人次" field="totalRecords" minWidth="100"></vxe-column>
              <vxe-column title="总金额" field="totalMoney" minWidth="100"></vxe-column>
            </vxe-table>
          </div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import * as echarts from 'echarts';
  import {mapGetters} from "vuex";
  import secondaryMenu from '@/components/secondary-menu/index.vue'
  import { reqIndexData } from '@/api/energy-mng/index.js'

  export default{
    components:{secondaryMenu},
    data(){
      return{
        id:"",
        obj:{
          electricityDevErrTotal:0, electricityDevTotal:0, waterDevErrTotal:0, waterDevTotal:0
        },
        tableData:[],
        waterEcharts:null,
        electricityEcharts:null,
        timer:null
      }
    },
    created() {
      this.id = this.$route.query.id;
    },
    mounted() {
      this.waterEcharts = echarts.init(document.getElementById('waterEcharts'));
      this.electricityEcharts = echarts.init(document.getElementById('electricityEcharts'));
    },
    activated() {
      this.initData()
      this.timer = setInterval(() => {
        this.initData()
      },5000)
    },
    deactivated() {
      clearInterval(this.timer)
    },
    methods:{
      initData(){
        reqIndexData().then(r => {
          if(r.data.code === 200){
            let d = r.data.data;
            let { electricityDevErrTotal, electricityDevTotal, waterDevErrTotal, waterDevTotal } = d;
            this.obj = {  electricityDevErrTotal, electricityDevTotal, waterDevErrTotal, waterDevTotal  };
            this.tableData = d.days7Data;
            let data1 = waterDevTotal ? parseFloat((waterDevTotal - waterDevErrTotal)*100/waterDevTotal) : 0;
            let data2 = electricityDevTotal ? parseFloat((electricityDevTotal - electricityDevErrTotal)*100/electricityDevTotal) : 0;
            this.getChart(this.waterEcharts,data1,'#58D9F9');
            this.getChart(this.electricityEcharts,data2,'#91cc75');
          }
        })
      },
      getChart(myChart,data,color){
        let option = {
          series: [{
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 0,
            itemStyle: {
              color,
              shadowColor: 'rgba(0,138,255,0.45)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            progress: { show: true, roundCap: true, width: 18 },
            axisLine: {
              roundCap: true,
              lineStyle: { width: 18 }
            },
            pointer: { show:false },
            axisTick: { show:false },
            splitLine: { show:false },
            axisLabel: { show:false },
            detail: {
              offsetCenter: [0, '-10%'],
              valueAnimation: true,
              formatter: function (value) {
                return '{value|' + value.toFixed(0) + '%}';
              },
              rich: {
                value: { fontSize: 30, fontWeight: 'bolder', color: '#777' }
              }
            },
            data:[data]
          }]
        }
        option && myChart.setOption(option);
      }
    },
    computed:{

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
  ul,li{list-style: none;padding: 0;margin: 0;}
  .ul_class{
    display: flex;
    width: 50%;
    height: 100%;
    align-items: center;
    justify-content: space-around;
    text-align: center;
    p{ margin: 0 0 10px;font-size: 14px;}
    span{
      font-weight: 600;
      font-size: 20px;
    }
  }
</style>
