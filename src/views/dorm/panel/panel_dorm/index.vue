<template>
  <div class="dorm_panel">
    <el-row class="leftTop">
      <el-col :span="5">
        <div class="leftItem myopacity">
          <p>实时信息统计</p>
          <p>{{todayHours}}</p>
          <p>{{todayDate}}</p>
        </div>
      </el-col>
      <el-col :span="14">
        <div class="flexAround myopacity" style="margin: 0 10px;">
          <div style="border-right: 1px solid #999;width: 33%;">
            <p>入住总人数</p>
            <p class="fw600"><avue-count-up decimals="0" :end="obj.liveTotalCount"></avue-count-up></p>
            <p>请假：<avue-count-up decimals="0" :end="obj.qjCount"></avue-count-up></p>
          </div>
          <div style="width: 33%;">
            <p>宿舍内人数</p>
            <p class="fw600"><avue-count-up decimals="0" :end="obj.inCount"></avue-count-up></p>
            <p><avue-count-up decimals="2" :end="obj.insideABR"></avue-count-up>%</p>
          </div>
          <div style="width: 33%;">
            <p>宿舍外人数</p>
            <p class="fw600"><avue-count-up decimals="0" :end="obj.outCount"></avue-count-up></p>
            <p><avue-count-up decimals="2" :end="obj.outsideABR"></avue-count-up>%</p>
          </div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="leftItem myopacity" style="color: red;">
          <p>异常人数</p>
          <p class="fw600 font20"><avue-count-up decimals="0" :end="obj.errCount"></avue-count-up></p>
          <p><avue-count-up decimals="2" :end="obj.abnormalABR"></avue-count-up>%</p>
        </div>
      </el-col>
    </el-row>

    <el-row class="bodyClass">
      <el-col :span="arrowLeft" class="body_left myopacity">
        <div>
          <div v-for="(v) in currentArr" :key="v.id" @click="ItemClick(v)">
            <el-card :body-style="{padding:'10px 0',display:'flex','justify-content': 'space-around','align-items': 'center'}">
              <p>
                <i class="iconfont icon-xueshengsushe" :class="[v.isErr ? 'errRed' : 'color23CC7F']"></i>
              </p>
              <div style="width: 54%;">
                <p class="text_line_1 fw600">{{v.dormName}}</p>
                <p>宿舍内：{{v.dormInCount}}人</p>
                <p>宿舍外：{{v.dormOutCount}}人</p>
                <p>请&nbsp;&nbsp;&nbsp;&nbsp;假：<b style="font-weight: 400;" :class="[v.qjCount ? 'errRed' : '']">{{v.qjCount}}人</b></p>
              </div>
            </el-card>
          </div>
        </div>
      </el-col>

      <el-col :span="arrowRight" class="body_right">
        <el-card shadow="never" :body-style="{padding:'10px',height:'88%'}">
          <div slot="header">
            <i class="icon-navicon" @click="arrowClick"></i>
            <el-radio-group v-model="radio" size="mini" @change="radioChange">
              <el-radio-button label="1">异常</el-radio-button>
              <el-radio-button label="2">请假</el-radio-button>
            </el-radio-group>
          </div>
          <div style="margin-bottom: 8px;">
            <el-input
              size="small"
              style="width: 150px;margin-right: 10px;"
              :style="{marginBottom:arrowRight == 24 ? 0 : '8px'}"
              clearable
              @keyup.enter.native="search"
              v-model="moreParamQuery"
              placeholder="请输入学号/姓名">
            </el-input>
            <el-input
              size="small"
              style="width: 140px;margin-right: 10px;"
              clearable
              @keyup.enter.native="search"
              v-model="dormName"
              placeholder="请输入宿舍编号"></el-input>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="search">
              搜索</el-button>
            <el-button
              type="default"
              size="small"
              icon="el-icon-refresh"
              @click="searchReset"
              v-show="arrowRight == 24">
              重置</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              @click="handleExport"
              v-show="arrowRight == 24">
              导出</el-button>
          </div>
          <vxe-grid
            border
            resizable
            auto-resize
            height="82%"
            keep-source
            ref="xGrid"
            size="mini"
            align="center"
            :highlight="true"
            :columns="tableColumn"
            :loading="loading"
            :data="tableData">
          </vxe-grid>
          <div class="page_class">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="page.currentPage"
              :page-sizes="[20, 50, 100, 500,1000]"
              :page-size="page2.pageSize"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="page2.total"
              :hide-on-single-page="false">
            </el-pagination>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import moment from 'moment'
  import { mapGetters } from 'vuex';
  import website from '@/config/website';
  import { getToken } from '@/util/auth';
  import { getPanelDormList, getOutStudents, getQjStudents } from '@/api/dorm/real_monitor.js'

  export default{
    data(){
      return{
        arrowLeft:18,
        arrowRight:6,
        todayHours:moment().format('HH:mm:ss'),
        todayDate:moment().format("YYYY年MM月DD日"),
        timer:"",
        obj:{liveTotalCount:0,qjCount:0,inCount:0,insideABR:0,outCount:0,outsideABR:0,errCount:0,abnormalABR:0},
        currentArr:[],
        radio:"1",
        tableData:[],
        loading:false,
        page:{
          pageSize:1000,
          currentPage:1,
          total:0,
          pageCount:0
        },
        floorId:"",
        moreParamQuery:"",
        dormName:"",
        page2:{
          pageSize:20,
          currentPage:1,
          total:0
        },
        dormId:""
      }
    },
    mounted() {
      this.floorId = this.$route.query.floorId;
      this.timer = ""
      this.timer1 = ""
      this.timer = setInterval(() => {
        this.initTime()
      },1000)
      this.initDormList()
      this.search()
      this.timer1 = setInterval(() => {
        this.initDormList()
        this.search()
      },5000)
    },
    watch:{
      '$route'(to,from){
        this.floorId = this.$route.query.floorId;
        this.initDormList()
        this.search()
      }
    },
    beforeDestroy() {
      clearInterval(this.timer)
      clearInterval(this.timer1)
    },
    methods:{
      ItemClick(e){
        this.dormId = e.id;
      },
      initDormList(){
        let params = {}
        params['size'] = this.page.pageSize
        params['current'] = this.page.currentPage
        params['floorId'] = this.floorId
        getPanelDormList(params).then(r => {
          let d = r.data.data
          this.page.total = d.dorms.total
          this.page.pageCount = Math.ceil(d.dorms.total/d.dorms.size)
          this.currentArr = d.dorms.records;
          d.statisticsData.insideABR = (d.statisticsData.inCount / d.statisticsData.liveTotalCount)*100
          d.statisticsData.outsideABR = (d.statisticsData.outCount / d.statisticsData.liveTotalCount)*100
          d.statisticsData.abnormalABR = (d.statisticsData.errCount / d.statisticsData.liveTotalCount)*100
          d.statisticsData.qjCount = d.statisticsData.qjCount || 0
          this.obj = d.statisticsData
        })
      },
      onLoad(){
        let params = {}
        params['size'] = this.page2.pageSize
        params['current'] = this.page2.currentPage
        params['floorId'] = this.floorId
        params['moreParamQuery'] = this.moreParamQuery.trim()
        params['dormName'] = this.dormName.trim();
        params['dormId'] = this.dormId;
        if(this.radio == 1){
          getOutStudents(params).then(r => {
            this.loading = false;
            let d = r.data.data;
            this.page2.total = d.total
            this.tableData = d.records;
          })
        }else{
          getQjStudents(params).then(r => {
            this.loading = false;
            let d = r.data.data;
            this.page2.total = d.total
            this.tableData = d.records;
          })
        }
      },
      search(){
        this.page2.currentPage = 1;
        this.onLoad()
      },
      searchReset(){
        this.moreParamQuery = ""
        this.dormName = "";
        this.dormId = "";
        this.search()
      },
      handleExport(){
        let title = this.radio == 1 ? '异常数据' : '请假数据'
        this.$confirm(`是否导出${title}?`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          if(this.radio == 1){
            window.open(
              `/api/iot-dorm/monitor/real/floor/outemps/export?${this.website.tokenHeader}=${getToken()}&current=${this.page2.currentPage}&size=${this.page2.pageSize}&floorId=${this.floorId}&moreParamQuery=${this.moreParamQuery.trim()}&dormName=${this.dormName.trim()}`
            );
          }else{
            window.open(
              `/api/iot-dorm/monitor/real/floor/qjemps/export?${this.website.tokenHeader}=${getToken()}&current=${this.page2.currentPage}&size=${this.page2.pageSize}&floorId=${this.floorId}&moreParamQuery=${this.moreParamQuery.trim()}&dormName=${this.dormName.trim()}`
            );
          }
        });
      },
      radioChange(){
        this.search()
      },
      initTime(){
        this.todayDate = moment().format("YYYY年MM月DD日")
        this.todayHours = moment().format('HH:mm:ss')
      },
      arrowClick(){
        if(this.arrowRight == 6){
          this.arrowRight = 24
          this.arrowLeft = 0
        }else{
          this.arrowRight = 6
          this.arrowLeft = 18
        }
      },
      handleSizeChange(val) {
        this.page2.currentPage = 1;
        this.page2.pageSize = val;
        this.onLoad();
      },
      handleCurrentChange(val) {
        this.page2.currentPage = val;
        this.onLoad();
      },
    },
    computed:{
      // ids(){
      //   let ids = []
      //   this.selectionList.forEach(v => {
      //     ids.push(v.id)
      //   })
      //   return ids.join(',')
      // },
      tableColumn(){
        return[
          {
            title:"宿舍",
            field:"dormName",
            minWidth:100,
          },
          {
            title:"学号",
            field:"empCode",
            minWidth:100,
          },
          {
            title:"姓名",
            field:"empName",
            minWidth:100,
          },
          {
            title:"年/班级",
            field:"className",
            minWidth:100,
          },
          {
            title:"班主任",
            children:[
              {
                title:"姓名",
                field:"teacherName",
                minWidth:100,
              },
              {
                title:"联系方式",
                field:"teacherPhone",
                minWidth:100,
              },
            ]
          },
          {
            title:"家长1",
            children:[
              {
                title:"姓名",
                field:"parentsName01",
                minWidth:100,
              },
              {
                title:"联系方式",
                field:"parentsPhone01",
                minWidth:100,
              },
            ]
          },
          {
            title:"家长2",
            children:[
              {
                title:"姓名",
                field:"parentsName11",
                minWidth:100,
              },
              {
                title:"联系方式",
                field:"parentsPhone11",
                minWidth:100,
              },
            ]
          },
          {
            title:"家长3",
            children:[
              {
                title:"姓名",
                field:"parentsName21",
                minWidth:100,
              },
              {
                title:"联系方式",
                field:"parentsPhone21",
                minWidth:100,
              },
            ]
          },
        ]
      }
    }
  }

</script>

<style lang="scss" scoped="scoped">
  p{
    margin: 0;
  }
  .errRed{
    color: red;
  }
  .color23CC7F{
    color: #23CC7F;
  }
  .dorm_panel{
    padding: 0 10px;
    height: 99%;
    .leftTop{
      height: 102px;margin-bottom: 10px;text-align: center;
      .el-col{
        height: 100%;
        &>div{
          height: 100%;background-color: #fff;
        }
      }
      .leftItem{
        display: flex;flex-direction: column;align-items: center;justify-content: center;
        position: relative;
        i{
          position: absolute;bottom: 0;right: 6px;cursor: pointer;
        }
      }
      .font20{
        font-size: 20px;
      }
    }
    .bodyClass{
      height: calc(100% - 138px);
      .el-col{
        height: 100%;
        overflow: hidden;
      }
      .body_left{
        background-color: #fff;
        height: 100%;
        overflow: auto;
        &>div{
          display: flex;
          flex-wrap: wrap;
          padding: 10px 0 10px 10px;
          align-items: flex-start;
          &>div{
            min-width: 150px;
            width: 13.5%;
            margin-right: 0.59%;
            margin-bottom: 8px;
            cursor: pointer;
          }
          .el-card{
            font-size: 14px;
            i{
              font-size: 40px !important;
              margin-bottom: 8px;
            }
            span{
              font-size: 14px;
              font-weight: 600;
              color: #0073EB;
            }
          }
        }
      }
      .body_right{
        .el-card{
          height: 100%;
          margin-left: 8px;
          i{
            font-size: 24px !important;
            cursor: pointer;
            vertical-align: middle;
            margin-right: 30px;
          }
        }
      }
    }
  }
</style>
