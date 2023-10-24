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
          <div slot="header" class="cardHeader">校门口进出监控</div>
          <div class="firstItem">
            <div>
              <i class="iconfont icon-zaichangrenshu" style="color: #00994E;"></i>
              <p>
                <avue-count-up decimals="0" :end="obj.countRealTotal"></avue-count-up>
              </p>
              <span>在校人数(人)</span>
            </div>
            <div>
              <i class="iconfont icon-laifang" style="color: #FBF290;"></i>
              <p>
                <avue-count-up decimals="0" :end="obj.inCount"></avue-count-up>/
                <avue-count-up decimals="0" :end="obj.inCountTotal"></avue-count-up>
              </p>
              <span>入校人数(人/次)</span>
            </div>
            <div>
              <i class="iconfont icon-likai" style="color: #5C4270;"></i>
              <p>
                <avue-count-up decimals="0" :end="obj.outCount"></avue-count-up>/
                <avue-count-up decimals="0" :end="obj.outCountTotal"></avue-count-up>
              </p>
              <span>离校人数(人/次)</span>
            </div>
          </div>
        </el-card>
        <el-card style="height: 43%;margin: 0 0 10px 10px;overflow: auto;" :body-style="{height:'80%',width:'90%',padding:'10px 0'}">
          <div slot="header" class="cardHeader">校门口识别记录</div>
          <div id="echarts" style="width: 100%;height: 100%;"></div>
        </el-card>
        <el-card style="height: 33%;margin: 0 0 10px 10px;overflow: auto;" :body-style="{height:'80%',width:'90%',padding:'10px 0'}">
          <div slot="header" class="cardHeader">门禁设备状态监控</div>
          <div id="echarts2" style="width: 100%;height: 100%;"></div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {mapGetters} from "vuex";
  import secondaryMenu from '@/components/secondary-menu/index.vue'
  import { getInitData } from "@/api/iot/access/index.js"
  import * as echarts from 'echarts';
  export default{
    components:{secondaryMenu},
    data(){
      return{
        id:"",
        obj:{countRealTotal:0,inCount:0,outCount:0,totalDevCount:0,inCountTotal:0,outCountTotal:0},
        weekDay:[],
        student:[],
        teacher:[],
        stranger:[],
        devCount:0,
        devArr:[],
        myChart:null,
        myChart2:null
      }
    },
    created() {
      this.id = this.$route.query.id;
    },
    mounted() {
      this.myChart = echarts.init(document.getElementById('echarts'))
      this.myChart2 = echarts.init(document.getElementById('echarts2'))
    },
    activated() {
      this.InitData();
    },
    methods:{
      InitData(){
        getInitData().then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            this.obj = r.data.data;
            this.devCount = r.data.data.totalDevCount;
            this.devArr[0] = {name:"在线",value:d.onlineTotalDevCount}
            this.devArr[1] = {name:"离线",value:d.totalDevCount - d.onlineTotalDevCount}
            let student = []
            let teacher = []
            let stranger = []
            d.inOutData.forEach(v => {
              this.weekDay.push(v.date.substr(5,v.date.length))
              student.push(v.studentCount)
              teacher.push(v.teacherCount)
              stranger.push(v.strangerCount)
            })
            this.student = student;
            this.teacher = teacher;
            this.stranger = stranger;
            this.getEcharts()
            this.getEcharts2()
          }
        }).catch(() => {
          this.obj = {countRealTotal:0,inCount:0,outCount:0,totalDevCount:0,onlineTotalDevCount:0}
        })
      },
      getEcharts2(){
        this.myChart2.setOption({
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
            name: '',
            type: 'pie',
            radius: ['60%', '70%'],
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
      getEcharts(){
        var option;
        option = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['访客', '教师', '学生']
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: this.weekDay
          },
          yAxis: {
            type: 'value'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          series: [
            {
              name: '访客',
              type: 'line',
              data: this.stranger
            },
            {
              name: '教师',
              type: 'line',
              data: this.teacher
            },
            {
              name: '学生',
              type: 'line',
              data: this.student
            },
          ]
        }
        option && this.myChart.setOption(option);
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
      background-image: url(/img/4.png) !important;
      background-size: 100%;
      background-position: bottom;
      background-repeat: no-repeat;
    }
  }
  .firstItem{
    display: flex;
    justify-content: space-around;
    text-align: center;
    div{
      width: 33.3%;
      p{
        margin: 10px 0;
        font-weight: 600;
      }
      i{
        font-size: 26px;
      }
      span{
        font-size: 14px;
      }
    }
  }
  .icon {
    width: 26px;
    height: 26px;
    fill: currentColor;
    overflow: hidden;
  }
</style>
