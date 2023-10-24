<template>
  <el-row class="index_page" style="height: 99%;">
    <el-col span="18">
      <el-card class="u-height-22">
        <div slot="header" class="cardHeader">管理人数</div>
        <div class="u-flex u-row-around u-height-100">
          <div
            v-for="(v,i) in manageArr" :key="i+'m'"
            class="u-flex u-flex-column u-row-center u-text-center"
            style="width: 16.66%;">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="v.icon" />
            </svg>
            <p class="u-m-t-0">{{v.title}}</p>
            <span class="fw600 u-font-30">
              <avue-count-up decimals="0" :end="v.value"></avue-count-up>
            </span>
          </div>
        </div>
      </el-card>
      <div class="u-flex u-row-between u-m-t-8 u-height-35">
        <el-card class="u-m-r-4 u-width-50 u-height-100 menuCard">
          <div slot="header" class="cardHeader">常用应用
            <span style="float: right;color: rgba(0, 0, 0, .6);font-weight: 400;cursor: pointer;"
              @click="handlerAdd">
              全部应用<i class="el-icon-arrow-right"></i>
            </span>
          </div>
          <ul>
            <li
              v-for="item in myMenu" :key="item.id"
              @click="itemClick(item)">
              <img :src="item.iconUrl.startsWith('http') ? item.iconUrl : (userInfo.staticPrefix+item.iconUrl)" width="30px" height="30px">
              <p class="u-width-100 text_line_1">{{item.name}}</p>
            </li>
          </ul>
        </el-card>
        <el-card class="u-m-l-4 u-height-100" style="width: calc(50% - 8px);">
          <div slot="header" class="cardHeader">日活跃分析</div>
          <div class="u-flex u-height-100">
            <div id="weekDayId" class="u-width-100 u-height-98"></div>
          </div>
        </el-card>
      </div>
      <div class="u-flex u-row-between u-m-t-12" style="height: calc(43% - 20px);">
        <el-card class="u-m-r-4 u-width-50 u-height-100">
          <div slot="header" class="cardHeader">物联集控管理</div>
          <div class="u-flex u-p-10">
            <span class="color2">设备总数</span>
            <avue-count-up decimals="0" :end="devTotal" class="color1"></avue-count-up>
            <span class="color2 u-m-l-20">设备在线</span>
            <avue-count-up decimals="0" :end="devOnlineTotal" class="color1"></avue-count-up>
            <span class="color2 u-m-l-20">设备离线</span>
            <avue-count-up decimals="0" :end="devUnlineTotal" class="color1"></avue-count-up>
          </div>
          <div id="dev" style="width: 100%;height: calc(100% - 60px);"></div>
        </el-card>
        <el-card class="u-m-l-4 u-height-100" style="width: calc(50% - 8px);">
          <div slot="header" class="cardHeader">学生</div>
          <div id="stuCharts" class="u-width-100" style="height: calc(100% - 30px);"></div>
        </el-card>
      </div>
    </el-col>

    <el-col span="6">
      <el-card class="u-height-22 u-m-b-8 u-m-l-8" :body-style="{height:'100%'}">
        <div class="u-flex u-col-center u-height-100">
          <el-avatar :size="120" :src="currUserInfo.schoolLogo" style="flex: 0 0 120px;"></el-avatar>
          <div class="u-m-l-10" style="width: calc(100% - 130px);">
            <h2 class="u-m-0 u-font-20 text_line_1">{{ currUserInfo.schoolName }}</h2>
            <p class="fw600 u-font-16 u-m-b-0 text_line_1">{{ currUserInfo.empName }}【{{ currUserInfo.empCode }}】</p>
            <div>
              <i class="el-icon-star-on u-m-r-4 u-font-16" style="color: rgba(252, 151, 0, 1);vertical-align: middle;"></i>
              <span style="font-size: 12px;color: rgba(252, 151, 0, 1);">教职工</span>
            </div>
            <div class="color2 u-m-t-10 u-m-b-6 u-font-14 text_line_1">所在部门：{{ currUserInfo.deptName }}</div>
            <el-tag>
              <span class="u-font-12">管理班级</span>
              <span class="u-m-l-4 u-font-14">{{ currUserInfo.mngClassCount || 0}}</span>
            </el-tag>
            <el-tag class="u-m-l-10">
              <span class="u-font-12">管理学生</span>
              <span class="u-m-l-4 u-font-14">{{ currUserInfo.mngStudentCount || 0}}</span>
            </el-tag>
          </div>
        </div>
      </el-card>

      <el-card class="u-height-35 u-m-b-8 u-m-l-8">
        <div slot="header" class="cardHeader">学校概况</div>
        <div class="u-flex u-flex-column u-row-around u-height-100 u-width-100">
          <div class="u-flex u-row-around u-text-center u-width-100">
            <div class="right_center_item u-relative">
              <el-image src="/img/index/1.png" fit="cover" style="width: 100%;height: 100%;"></el-image>
              <div style="position: absolute;top: 5px;right: 20px;">
                <p class="color2">校区数</p>
                <avue-count-up class="u-font-26 fw600" decimals="0" :end="schoolInfo.schoolCount || 0"></avue-count-up>
              </div>
            </div>
            <div class="right_center_item u-relative">
              <el-image src="/img/index/2.png" fit="cover" style="width: 100%;height: 100%;"></el-image>
              <div style="position: absolute;top: 5px;right: 20px;">
                <p class="color2">年级数</p>
                <avue-count-up class="u-font-26 fw600" decimals="0" :end="schoolInfo.gradeCount || 0"></avue-count-up>
              </div>
            </div>
            <div class="right_center_item u-relative">
              <el-image src="/img/index/3.png" fit="cover" style="width: 100%;height: 100%;"></el-image>
              <div style="position: absolute;top: 5px;right: 20px;">
                <p class="color2">班级数</p>
                <avue-count-up class="u-font-26 fw600" decimals="0" :end="schoolInfo.classCount || 0"></avue-count-up>
              </div>
            </div>
          </div>
          <div class="u-flex u-row-around u-text-center u-width-100">
            <div class="item2 u-relative">
              <el-image src="/img/index/4.png" fit="cover" style="width: 100%;height: 100%;"></el-image>
              <div style="position: absolute;top: 10px;right: 30px;">
                <p class="color2">学生已绑定</p>
                <avue-count-up class="u-font-26 fw600" decimals="0" :end="schoolInfo.studentBindCount || 0"></avue-count-up>
              </div>
            </div>
            <div class="item2 u-relative">
              <el-image src="/img/index/5.png" fit="cover" style="width: 100%;height: 100%;"></el-image>
              <div style="position: absolute;top: 10px;right: 30px;">
                <p class="color2">教师已绑定</p>
                <avue-count-up class="u-font-26 fw600" decimals="0" :end="schoolInfo.teacherBindCount || 0"></avue-count-up>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card  class="u-m-b-8 u-m-l-8" style="height: calc(43% - 20px)">
        <div slot="header" class="cardHeader">教职工</div>
        <div id="teacher" class="u-height-98 u-width-100"></div>
      </el-card>
    </el-col>

    <application-mng ref="applicationMngRef" @refeshPage="initApplication"></application-mng>
  </el-row>
</template>

<script>
  import {mapGetters} from "vuex";
  import { getIndexList ,getTeacherList ,getStudentList, reqCustomMenu} from "@/api/wel/index.js"
  import * as echarts from 'echarts';
  import { getSchoolsZtreeData } from "@/api/iot/dept.js"
  import {setStore, getStore} from '@/util/store'
  import NProgress from 'nprogress';
  import { getRoutes } from '@/api/system/menu'
  import applicationMng from './application-mng.vue'

  export default{
    components:{ applicationMng },
    data(){
      return{
        manageArr:[
          {icon:"#icon-pingtaizongrenshu",title:"平台总人数",value:0},
          {icon:"#icon-xuesheng",title:"学生人数",value:0},
          {icon:"#icon-jiaoshi",title:"教师人数",value:0},
          {icon:"#icon-jiachang",title:"家长人数",value:0},
          {icon:"#icon-pingtaicaozuoyuan",title:"平台操作员",value:0},
          {icon:"#icon-fangke",title:"外来访客",value:0}
        ],
        devCharts:null,
        devTotal:0,
        devOnlineTotal:0,
        devUnlineTotal:0,
        teacherCharts:null,
        myMenu:[],
        menu:[],
        schoolInfo:{},
        currUserInfo:{},
        weekDayCharts:null,
        stuCharts:null
      }
    },
    mounted() {
      this.devCharts = echarts.init(document.getElementById('dev'));
      this.teacherCharts = echarts.init(document.getElementById('teacher'));
      this.weekDayCharts = echarts.init(document.getElementById('weekDayId'));
      this.stuCharts = echarts.init(document.getElementById('stuCharts'));
      this.initData()
      this.timer = setInterval(() => {
        this.initData()
      },5000)
      this.initMenu();
    },
    beforeDestroy() {
      if(this.timer)  {
        clearInterval(this.timer);
      }
    },
    methods:{
      handlerAdd(){
        this.$refs.applicationMngRef.openDialog(this.menu,this.myMenu);
      },
      async initMenu(){
        await getRoutes().then(r => {
          this.menu = r.data.data
        })
        await this.initApplication()
      },
      initApplication(){
        let arr = [], menuArr = [...this.menu];
        menuArr.forEach(v => {
          if(v.children){
            arr = [...arr,...v.children]
          }
        })
        reqCustomMenu().then(r => {
          if(!r.data.data.length){
            this.myMenu = arr.slice(0,21);
          }else{
            this.myMenu = r.data.data;
          }
        }).catch(() => this.myMenu = arr.slice(0,21))
      },
      itemClick(item){
        this.$router.push({
          path: this.$router.$avueRouter.getPath({
            name: item.name,src: item.path
          }, item.meta),
          query: item.query
        });
      },
      initData(){
        NProgress.done();
        getIndexList().then(r => {
          let d = r.data.data;
          let obj = d.basicInfo;
          let arr = [
            {icon:"#icon-pingtaizongrenshu",title:"平台总人数",value:obj.totalCount || 0},
            {icon:"#icon-xuesheng",title:"学生人数",value:obj.studentCount || 0},
            {icon:"#icon-jiaoshi",title:"教师人数",value:obj.teacherCount || 0},
            {icon:"#icon-jiachang",title:"家长人数",value:obj.parentCount || 0},
            {icon:"#icon-pingtaicaozuoyuan",title:"平台操作员",value:obj.oprtCount || 0},
            {icon:"#icon-fangke",title:"外来访客",value:obj.visitorCount || 0}
          ]
          this.manageArr = arr;
          let devObj = d.devOnlineInfo, devTotal = 0, devOnlineTotal = 0, devUnlineTotal = 0;
          for(let i in devObj){
            devObj[i].unline = devObj[i].total - devObj[i].online;
            devTotal += devObj[i].total*1;
            devOnlineTotal += devObj[i].online*1;
            devUnlineTotal += devObj[i].unline*1;
          }
          this.devTotal = devTotal;
          this.devOnlineTotal = devOnlineTotal;
          this.devUnlineTotal = devUnlineTotal;
          let devArr = [
            devObj.visitorDevs.total || 0,
            devObj.clDevs.total || 0,
            devObj.doorDevs.total || 0,
            devObj.kqDevs.total || 0,
            devObj.xfDevs.total || 0,
            devObj.skDevs.total || 0,
            devObj.dkDevs.total || 0,
            devObj.xcDevs.total || 0,
            devObj.qtDevs.total || 0
          ]
          this.initDevCharts('devCharts',[],devArr);
          let sum = d.empCateogryCount.reduce((pre,cur) => pre+=cur.ct*1,0);
          let teacherArr = d.empCateogryCount.map(v => ({
            value:v.ct,
            name:v.empCategoryName,
            pie:sum > 0 ? (v.ct * 100 / sum).toFixed(2) : 0
          }))
          if(teacherArr.length) teacherArr[0].selected = true;

          this.initTeacherPie(teacherArr);

          let schoolInfo = d.schoolInfo;
          schoolInfo.teaRatio = schoolInfo.teacherTotalCount == 0 ? 0 : Math.ceil(schoolInfo.teacherBindCount*100/schoolInfo.teacherTotalCount).toFixed(2);
          schoolInfo.stuRatio = schoolInfo.studentTotalCount == 0 ? 0 : Math.ceil(schoolInfo.studentBindCount*100/schoolInfo.studentTotalCount).toFixed(2);
          this.schoolInfo = schoolInfo;

          let currUserInfo = d.currUserInfo;
          currUserInfo.schoolLogo = d.staticPrefix + currUserInfo.schoolLogo;
          this.currUserInfo = currUserInfo;

          let weekX = [],weekD = [];
          d.weekActiveEmpData.forEach(v => {
            if(v.swipeTime) weekX.push(v.swipeTime.substr(5));
            weekD.push(v.empCount);
          })
          this.initLine('weekDayCharts',weekX,weekD);

          let stuX = [],stuD = [];
          d.studentGradeInfo.forEach(v => {
            stuX.push(v.gradeName);
            stuD.push(v.ct);
          });
          this.initDevCharts('stuCharts',stuX,stuD);
        })
      },
      initDevCharts(type,xAxis,data){
        let option = {
          color:['rgba(115, 192, 222, 1)'],
          legend: { show:false},
          grid: type === 'devCharts' ? { left: 20, right: 20, bottom: 40, top:20 } : {left: 10, right: 30, bottom: 50, top:20},
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          xAxis: [{
            type: 'category',
            axisTick: { show: false },
            data: type === 'devCharts' ? ['访客','车辆','门禁','考勤','消费','水控','电控','校车','其他'] : xAxis,
            axisLine:{show:true},
            axisLabel: { interval: 0, rotate: type !== 'devCharts' ? -30 : 0,width:90, overflow:'truncate' }
          }],
          yAxis:{show:false},
          series:[{
            name: type === 'stuCharts' ? '学生' : '设备',
            type: 'bar',
            barMaxWidth:16,
            itemStyle:{
              normal: {
                borderRadius:[16,16,0,0],
                color: new echarts.graphic.LinearGradient(
                  0, 0, 1, 0, // 渐变色的方向，从左到右
                  [
                    { offset: 0, color: 'rgba(19, 188, 179, 1)' },   // 左侧柱子的起始颜色
                    { offset: 1, color: 'rgba(192, 249, 246, 1)' }    // 右侧柱子的结束颜色
                  ]
                ),
              },
            },
            label: { show: true, position: 'top' },
            emphasis: { focus: 'series' },
            data
          }]
        }
        this[type].setOption(option);
      },
      initTeacherPie(data){
        let option = {
          legend: {
            right: 'right',top:'center',
            orient: 'vertical',show:true,
            icon: "circle",
            textStyle: {
              rich: {
                name: {
                  verticalAlign: "right",
                  align: "left",
                  fontSize: 13,
                  color: "#000",
                  width:60,
                  padding:[0,0,0,4]
                },
                value: {
                  padding: [0, 0, 0, 20],
                  color: "#000",
                  fontSize: 13,
                },
              },
            },
            formatter: function(name) {
              let item = data.find(v => v.name === name);
              return "{name|" + name + "}" + "{value|" + item.value + "}";
            },
          },
          tooltip:{show:true},
          series:[{
            type: 'pie',
            selectedMode: 'single',
            radius: ['30%','50%'],
            center: ['35%', '50%'],
            labelLine: { show: false },
            label: { show:false },
            data
          }]
        }
        this.teacherCharts.setOption(option);
      },
      initLine(type,xAxis = [],data = []){
        let option = {
          color: ['#80FFA5'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: { backgroundColor: '#6a7985' }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top:'10%',
            containLabel: true
          },
          xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: xAxis
          }],
          yAxis: [{ type: 'value',minInterval: 1}],
          series: [{
            name: type === 'weekDayCharts' ? '日活跃分析' : '',
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: { width: 1 },
            showSymbol: false,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(128, 255, 165)'
                },
                {
                  offset: 1,
                  color: 'rgb(1, 191, 236)'
                }
              ])
            },
            emphasis: { focus: 'series' },
            data: data
          }]
        }
        this[type].setOption(option);
      }
    },
    computed:{
      ...mapGetters(['userInfo'])
    }
  }
</script>

<style scoped="scoped" lang="scss">
  /deep/.basic-container__card{
    height: 100% !important;
  }
  .index_page{
    font-size: 14px;
    p{
      margin: 5px 0;
      font-size: 14px;
    }
    ul,li{
      list-style: none;margin: 0;padding: 0;
    }
    ul{
      padding-top: 10px;
      display: grid;grid-template-columns: repeat(auto-fill,100px);
      grid-gap: 10px;
      li{
        text-align: center;
        cursor: pointer;
      }
    }
    /deep/.el-col{ height: 100%;}
    /deep/.el-card__body{
      height: calc(100% - 35px);
      padding: 0 15px;
      overflow: auto;
    }
    .menuCard /deep/.el-card__body{
      overflow: hidden;
      &:hover{ overflow: auto;}
    }
    .icon{
      width: 80px;
      height: 80px;
      fill: currentColor;
      overflow: hidden;
    }
    .color2{
      color: rgba(16, 37, 103, 1);
    }
    .color1{
      color: #000;
      font-size: 18px;
      font-weight: 600;
      margin: 0 10px;
    }
    .right_center_item{
      width: 31%;
      height: 69px;
      font-size: 14px;
    }
    .item2{
      width: 47%;
      height: 81px;
      margin-top: 5px;
      font-size: 14px;
    }
    /deep/.el-avatar>img{
      width: 100%;
    }
  }
</style>
