<template>
  <el-row style="height: 99%;">
    <el-col span="18" style="height: 100%;">
      <div class="bg">
        <secondary-menu :id="id"></secondary-menu>
      </div>
    </el-col>

    <el-col span="6" style="height: 100%;">
      <div style="height: 100%;">
        <el-card style="height: 20%;margin: 0 0 10px 10px;" :body-style="{padding:'0',height:'80%'}">
          <div slot="header" class="cardHeader">宿舍总览</div>
          <el-row class="rightTop">
            <el-col :span="8">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-sushelou" />
              </svg>
              <p>宿舍楼(栋)</p>
              <avue-count-up decimals="0" :end="dormitoryObj.floorCount"></avue-count-up>
            </el-col>
            <el-col :span="8">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-susheguanli" />
              </svg>
              <p>宿舍房间(间)</p>
              <avue-count-up decimals="0" :end="dormitoryObj.dormCount"></avue-count-up>
            </el-col>
            <el-col :span="8">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-syzongrenshu" />
              </svg>
              <p>内宿人数(人)</p>
              <avue-count-up decimals="0" :end="dormitoryObj.innerStuCount"></avue-count-up>
            </el-col>
          </el-row>
        </el-card>
        <el-card style="height: 45%;margin: 0 0 10px 10px;" :body-style="{padding:'10px 20px',height:'84%'}">
          <div slot="header" class="cardHeader">报修单统计</div>
          <vxe-table
            auto-resize
            ref="xTable"
            size="mini"
            height="100%"
            align="center"
            :data="tableData">
            <vxe-table-column title="日期" minWidth="100" field="repairDateTime"></vxe-table-column>
            <vxe-table-column title="宿舍编号" minWidth="70" field="repairNum"></vxe-table-column>
            <vxe-table-column title="报修物品" minWidth="70" field="repairContent"></vxe-table-column>
            <vxe-table-column title="报修人" minWidth="70" field="repairEmpName"></vxe-table-column>
          </vxe-table>
        </el-card>
        <el-card style="height: 30%;margin: 0 0 10px 10px;" :body-style="{height:'72%'}">
          <div slot="header" class="cardHeader">今日归寝情况</div>
          <el-row class="rightTop">
            <el-col :span="6">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-yingdaozongcishu3" />
              </svg>
              <p>应归</p>
              <span>
                <avue-count-up decimals="0" :end="toDayDormStatisticsData.totalLiveEmpCount"></avue-count-up>
                <span class="ren">人</span>
              </span>
            </el-col>
            <el-col :span="6">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-shidaozongcishu1" />
              </svg>
              <p>实归</p>
              <span>
                <avue-count-up decimals="0" :end="toDayDormStatisticsData.realInEmpCount"></avue-count-up>
                <span class="ren">人</span>
              </span>
            </el-col>
            <el-col :span="6">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-qingjia1" />
              </svg>
              <p>请假</p>
              <span>
                <avue-count-up decimals="0" :end="toDayDormStatisticsData.qjTotalCount"></avue-count-up>
                <span class="ren">人</span>
              </span>
            </el-col>
            <el-col :span="6">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-chidao1" />
              </svg>
              <p>晚归</p>
              <span>
                <avue-count-up decimals="0" :end="toDayDormStatisticsData.wgStudentCount"></avue-count-up>
                <span class="ren">人</span>
              </span>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {mapGetters} from "vuex";
  import secondaryMenu from '@/components/secondary-menu/index.vue'
  import { getIndexData } from "@/api/dorm/dorm_mng.js"

  export default{
    components:{secondaryMenu},
    data(){
      return{
        id:"",
        dormitoryObj:{dormCount:0,floorCount:0,innerStuCount:0,total:0},
        toDayDormStatisticsData:{totalLiveEmpCount:0,realInEmpCount:0,qjTotalCount:0,wgStudentCount:0},
        tableData:[]
      }
    },
    created() {
      this.id = this.$route.query.id;
    },
    activated() {
      getIndexData().then(r => {
        let d = r.data.data;
        let {dormCount = 0,floorCount = 0,innerStuCount = 0,total = 0} = d;
        let {totalLiveEmpCount = 0,realInEmpCount = 0,qjTotalCount = 0,wgStudentCount = 0} = d.toDayDormStatisticsData
        this.dormitoryObj = {dormCount,floorCount,innerStuCount,total};
        this.toDayDormStatisticsData = {totalLiveEmpCount,realInEmpCount,qjTotalCount,wgStudentCount}
        d.dormRepairs.forEach(v => {
          v.repairNum = v?.floorName + '-' + v.repairNum;
          v.repairDateTime = v.repairDateTime.substr(5)
        })
        this.tableData = d.dormRepairs
      })
    },
    methods:{

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
      background-image: url(/img/4.png) !important;
      background-size: 100%;
      background-position: bottom;
      background-repeat: no-repeat;
    }
  }
  .icon{
    width: 36px;
    height: 36px;
    fill: currentColor;
    overflow: hidden;
  }
  .rightTop{
    display: flex;
    align-items: center;
    height: 100%;
    text-align: center;
    p{
      margin: 8px 0;
      font-size: 14px;
    }
    span{
      font-weight: 600;
      .ren{
        font-weight: 400;
        font-size: 14px;
      }
    }
  }
</style>
