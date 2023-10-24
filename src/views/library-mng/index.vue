<template>
  <el-row class="library_class">
    <el-col span="18" style="height: 100%;">
      <div class="bg">
        <secondary-menu :id="id"></secondary-menu>
      </div>
    </el-col>

    <el-col span="6" style="height: 100%;">
      <div style="height: 100%;">
        <el-card style="height: 49%;margin: 0 0 10px 10px;" :body-style="{height:'80%'}">
          <ul>
            <li>
              <svg class="svg_class" aria-hidden="true">
                <use xlink:href="#icon-guancangfenxi" />
              </svg>
            </li>
            <li>
              <avue-count-up style="color: #069368;" :decimals="0" :end="carrierBookTotal"></avue-count-up>
              <p>馆藏总数（本）</p>
            </li>
          </ul>
          <ul style="margin: 30px 0;">
            <li>
              <svg class="svg_class" aria-hidden="true">
                <use xlink:href="#icon-jieyueshu" />
              </svg>
            </li>
            <li>
              <avue-count-up style="color: #FF9200;" :decimals="0" :end="borrowTotal"></avue-count-up>
              <p>借阅总数（本）</p>
            </li>
          </ul>
          <ol>
            <li>
              <span>今日借阅</span>
              <div id="echarts1" style="height: 100%;width: 100%;"></div>
            </li>
            <li>
              <span>当月借阅</span>
              <div id="echarts2" style="height: 100%;width: 100%;"></div>
            </li>
            <li>
              <span>年度借阅</span>
              <div id="echarts3" style="height: 100%;width: 100%;"></div>
            </li>
          </ol>
        </el-card>
        <el-card style="height: 49%;margin: 0 0 10px 10px;" :body-style="{height:'80%',padding:'10px 0 0',width:'100%'}">
          <div slot="header" class="cardHeader">年度热门借阅占比</div>
          <div id="echarts4" style="height: 100%;width: 100%;"></div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {mapGetters} from "vuex";
  import secondaryMenu from '@/components/secondary-menu/index.vue'
  import * as echarts from 'echarts';
  import { getIndexData } from '@/api/library-mng/book-room-mng'

  export default{
    components:{secondaryMenu},
    data(){
      return{
        carrierBookTotal:0,
        borrowTotal:0,
        myChart1:null,
        myChart2:null,
        myChart3:null,
        myChart4:null
      }
    },
    created() {
      this.id = this.$route.query.id;
    },
    mounted() {
      this.myChart1 = echarts.init(document.getElementById('echarts1'))
      this.myChart2 = echarts.init(document.getElementById('echarts2'))
      this.myChart3 = echarts.init(document.getElementById('echarts3'))
      this.myChart4 = echarts.init(document.getElementById('echarts4'))
      this.initData()
    },
    methods:{
      initData(){
        getIndexData().then(r => {
          if(r.data.code === 200){
            let d = r.data.data;
            let {borrowTotal,carrierBookTotal,currDayBorrowTotal,currMonthBorrowTotal,currYearBorrowTotal,bookGroupTops} = d;
            this.borrowTotal = borrowTotal;
            this.carrierBookTotal = carrierBookTotal;
            this.getEcharts('echarts1',currDayBorrowTotal,'#FF0000');
            this.getEcharts('echarts2',currMonthBorrowTotal,'#FF9200');
            this.getEcharts('echarts3',currYearBorrowTotal,'#00FFFF');
            let arr4 = bookGroupTops.map(v => ({value:v.totalCount,name:v.typeName}))
            this.getEcharts4(arr4)
          }
        })
      },
      getEcharts(id,data,color){
        let option = {
          series: [
            {
              type: 'gauge',
              startAngle: 90,
              endAngle: -270,
              itemStyle: { color },
              progress: {
                show: true,
                overlap: false,
                roundCap: false,
                clip: false,
                width: 10
              },
              axisLine: {
                lineStyle: { width: 10 }
              },
              pointer: { show: false },
              splitLine: { show: false },
              axisTick: { show: false },
              axisLabel: { show: false },
              title: { show: false },
              data: [{
                value: data,
              }],
              detail: {
                valueAnimation: true,
                offsetCenter: ['0%', '0%'],
                fontSize: 14,
              },
              radius: '100%'
            }
          ]
        }
        id === 'echarts1' && this.myChart1.setOption(option);
        id === 'echarts2' && this.myChart2.setOption(option);
        id === 'echarts3' && this.myChart3.setOption(option);
      },
      getEcharts4(data){
        this.myChart4.setOption({
          tooltip: { trigger: 'item' },
          legend: { show:false },
          series: [{
            type: 'pie',
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: { borderRadius: 8 },
            color: ["#FF9200", "#00CFFF",'#00FFFF',"#00729F","#FF0000"],
            radius: ['20%', '70%'],
            hoverAnimation:true,
            data: data
          }],
        });
      },
    },
    computed:{

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
  .library_class{
    height: 99%;
    ul,li{list-style: none;margin-top: 0;}
    ul{
      display: flex;align-items: center;
      span{
        font-size: 26px;font-weight: 600;
      }
      p{margin: 0;font-size: 14px;}
    }
    ol{
      margin-top: 20px;text-align: center;
      display: flex;align-items: center;justify-content: space-around;padding: 0;
    }
    .svg_class{
      width: 40px;height: 40px;fill: currentColor;overflow: hidden;margin-right: 10px;vertical-align: sub;
    }
  }
</style>
