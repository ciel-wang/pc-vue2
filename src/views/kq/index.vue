<template>
  <el-row style="height: 99%;">
    <el-col span="18" style="height: 100%;">
      <div class="bg">
        <secondary-menu :id="id"></secondary-menu>
      </div>
    </el-col>

    <el-col span="6" style="height: 100%;">
      <div style="height: 100%;">
        <el-card style="height: 22%;margin: 0 0 10px 10px;" :body-style="{padding:'0',height:'80%'}">
          <div slot="header" class="cardHeader">考勤异常情况</div>
          <div class="flexClass">
            <div>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-chidao" />
              </svg>
              <p>
                <avue-count-up decimals="0" :end="obj.cdPersonCount"></avue-count-up>
              </p>
              <span>迟到</span>
            </div>
            <div>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-qingjia" />
              </svg>
              <p><avue-count-up decimals="0" :end="obj.qjPersonCount"></avue-count-up></p>
              <span>请假</span>
            </div>
            <div>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-jinggao" />
              </svg>
              <p><avue-count-up decimals="0" :end="obj.ycPersonCount"></avue-count-up></p>
              <span>异常</span>
            </div>
            <div>
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-qita" />
              </svg>
              <p><avue-count-up decimals="0" :end="obj.qtPersonCount"></avue-count-up></p>
              <span>其他</span>
            </div>
          </div>
        </el-card>
        <el-card style="height: 43%;margin: 0 0 10px 10px;" :body-style="{height:'80%'}">
          <div slot="header" class="cardHeader">今日班级考勤</div>
          <div id="echarts" style="height: 100%;width: 100%;">
          </div>
        </el-card>
        <el-card style="height: 30%;margin: 0 0 10px 10px;" :body-style="{height:'80%',padding:'10px 0 0',width:'100%'}">
          <div slot="header" class="cardHeader">今日入/离校情况</div>
          <div id="echarts2" style="width: 100%;height: 100%;"></div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {mapGetters} from "vuex";
  import secondaryMenu from '@/components/secondary-menu/index.vue'
  import { getIndexData } from "@/api/kq/daysts.js"
  import * as echarts from 'echarts';
  export default{
    components:{secondaryMenu},
    data(){
      return{
        id:"",
        data:[],
        obj:{
          cdPersonCount:0,
          qjPersonCount:0,
          ycPersonCount:0,
          qtPersonCount:0,
        },
        studentTotalCount:0,
        schoolArr:[],
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
      this.initData()
    },
    methods:{
      initData(){
        getIndexData().then(r => {
          let d = r.data.data;
          this.obj = d;
          this.studentTotalCount = d.studentTotalCount;
          this.schoolArr[0] = {value:d.inSchoolTotalCount,name:"总入校"}
          this.schoolArr[1] = {value:d.outSchoolTotalCount,name:"总离校"}
          this.getEcharts2()
          let arr = d.inData
          let arr2 = []
          let arr3 = []
          arr.forEach(v => {
            if(v.schoolName){
              arr2.push(v.schoolName)
            }
            if(v.gradeName){
              arr3.push(v.gradeName)
            }
          })
          let schoolNameArr = [...new Set(arr2)]
          let gradeNameArr = [...new Set(arr3)]
          let arr4 = []
          for(let i=0;i<schoolNameArr.length;i++){
            arr4.push({
              name: '未到/未识别',
              type: 'bar',
              barWidth: 10,
              stack: schoolNameArr[i],
              emphasis: {
                focus: 'series'
              },
              data:[]
            },{
              name: '到校',
              type: 'bar',
              barWidth: 10,
              stack: schoolNameArr[i],
              emphasis: {
                focus: 'series'
              },
              data:[]
            },{
              name: '总人数',
              type: 'line',
              // stack: schoolNameArr[i],
              emphasis: {
                focus: 'series'
              },
              data:[]
            })
          }
          arr.forEach(v => {
            arr4.forEach(item => {
              if(item.stack == v.schoolName){
                if(item.name == "未到/未识别"){
                  item.data.push({
                    name:v.schoolName,
                    value:v.totalCount - v.count,
                    schoolName:v.schoolName
                  })
                }else if(item.name == '到校'){
                  item.data.push({
                    name:v.schoolName,
                    value:v.count,
                    schoolName:v.schoolName
                  })
                }
              }
              if(item.name == "总人数"){
                item.data.push({
                  name:v.schoolName,
                  value:v.totalCount,
                  schoolName:v.schoolName
                })
              }
            })
          })
          console.log(schoolNameArr,gradeNameArr,arr4);
          this.getEcharts(schoolNameArr,gradeNameArr,arr4)
        })
      },
      getEcharts(schoolNameArr,gradeNameArr,seriesData){
        var option;
        option = {
          tooltip: {
            trigger: 'item',
            formatter: function(data){
              return data.name + '<br/>' + '<span style="display:inline-block;margin-right:5px;margin-bottom:2px;border-radius:10px;width:9px;height:9px;background-color:' + data.color + '"></span>' +data.seriesName + '：'+ data.value;
            }
          },
          legend: {
            data: ['到校', '未到/未识别']
          },
          xAxis: [
            {
              type: 'category',
              data: gradeNameArr,
            }
          ],
          yAxis: [ { type: 'value' } ],
          series:seriesData
        }
        option && this.myChart.setOption(option);
      },
      getEcharts2(){
        this.myChart2.setOption({
          title:{
            text:`${this.studentTotalCount}人`,
            subtext:"学生总数",
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
            data: this.schoolArr
          }],
        });
      },
    },
    computed:{
      options(){
        return[
          {
            title:"班级",
            field:"className",
            minWidth:80,
          },
          {
            title:"总人数",
            field:"totalCount",
            minWidth:100,
          },
          {
            title:"到校",
            field:"realToSchool",
            minWidth:90,
          },
          {
            title:"未到/未识别",
            field:"absent",
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
  .flexClass{
    display: flex;
    flex-wrap: wrap;
    text-align: center;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    div{
      width: 25%;
      p{
        margin: 5px 0;
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
  .firstItem{
    display: flex;
    justify-content: space-around;
    text-align: center;
    align-items: center;
    height: 100%;
    div{
      width: 33.3%;
      p{
        margin: 10px 0;
      }
      i{
        font-size: 26px;
      }
    }
  }
  .icon{
    width: 36px;
    height: 36px;
    fill: currentColor;
    overflow: hidden;
  }
</style>
