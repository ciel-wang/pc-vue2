<template>
  <div style="padding: 0 5px;">
    <el-row :gutter="10">
      <el-col :span="17">
        <el-card>
          <div class="colcardleft">
            <div>
              <p>在校人数（人）</p>
              <span class="numberColor">
                <avue-count-up decimals="0" :end="countRealTotal"></avue-count-up>
              </span>
            </div>
            <div>
              <p>入校人数</p>
              <span class="numberColor">
                <avue-count-up decimals="0" :end="inCount"></avue-count-up>
              </span>
            </div>
            <div>
              <p>离校人数</p>
              <span class="numberColor">
                <avue-count-up decimals="0" :end="outCount"></avue-count-up>
              </span>
            </div>
            <div>
              <p>入校人次</p>
              <span class="numberColor">
                <avue-count-up decimals="0" :end="inCountTotal"></avue-count-up>
              </span>
            </div>
            <div>
              <p>离校人次</p>
              <span class="numberColor">
                <avue-count-up decimals="0" :end="outCountTotal"></avue-count-up>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card>
          <div class="colcardright">
            <p>{{time}}</p>
            <span>{{day}} {{week}}</span>
          </div>
          <div class="colcardright">
            <el-select v-model="schemaCode" placeholder="请选择监控方案" style="width: 180px;">
              <el-option
                v-for="item in schemaArr"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="7">
        <el-card class="bg h300">
          <div slot="header" class="clearfix">设备状态监控</div>
          <div id="myChart2" style="width: 300px;height:300px;" />
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card>
          <div class="bg h300 phone">
            <div>
              <p style="margin: 0;">抓拍照</p>
              <div class="img">
                <img :src="catchPhone" width="250" height="250" />
              </div>
            </div>
            <div>
              <p style="margin: 0;">注册照</p>
              <div class="img">
                <img :src="idPhone" width="250" height="250" />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card>
          <div class="bg phone" style="height: 45px;">
            <div style="width: 25%;">远程开门</div>
            <avue-input-tree
              ref="tree"
              include-half-checked=""
              v-model="treeKey"
              placeholder="请选择"
              type="tree"
              style="width: 180px;"
              :props="{value:'valueStr'}"
              :dic="treeData"></avue-input-tree>
            <div style="width: 25%;font-size: 26px !important;cursor: pointer;" class="icon-font icon-yuanchengkaimen" @click="openDoor"></div>
          </div>
        </el-card>
        <el-card class="bg" style="min-height: 225px;margin-top: 10px;">
          <div slot="header">今日告警统计</div>
          <div class="phone" style="height: 191px;">
            <el-card style="width: 40%;padding: 10px 0;height: 106px;">
              <i class="icon-font icon-zhuapaijilu" style="font-size: 32px !important;"></i>
              <div style="margin: 10px 0;">抓拍人数</div>
              <span class="numberColor" style="color: #000000;">
                <avue-count-up decimals="0" :end="inCountTotal + outCountTotal"></avue-count-up>
              </span>
            </el-card>
            <div style="width: 40%;" @click="warningClick">
              <el-card style="padding: 10px 0;height: 106px;display: flex;flex-direction: column;justify-content: center;align-items: center;cursor: pointer;">
                <i class="icon-font icon-jinggao" style="font-size: 34px !important;"></i>
                <div style="margin: 10px 0;">告警人数</div>
                <!-- <span class="numberColor" style="color: red;opacity: 0;">
                  <avue-count-up decimals="0" :end="warningCount"></avue-count-up>
                </span> -->
              </el-card>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card :body-style="{height:height+'px'}">
      <div slot="header">通过人员抓拍
        <router-link style="float: right;color: #409EFF;" to="/iot/accesscontroller/emplist">查看更多</router-link>
      </div>
      <div class="phone foot">
        <div v-for="(v,i) in catchPhoneArr" :key="i+'c'">
          <div><img :src="v.faceUrl+'?time='+ new Date().getTime()" width="130" height="150" /><i class="icon-font"></i></div>
          <p>姓名：{{v.empName}}</p>
          <p>设备：{{v.devName}}</p>
          <p>时间：{{v.time}}</p>
        </div>
      </div>
    </el-card>

    <el-dialog title="设备监控" append-to-body :visible.sync="dialogVisible" :close-on-click-modal="false" width="1000px">
      <vxe-table
        border
        resizable
        ref="xGrid"
        size="mini"
        auto-resize
        highlight-hover-row
        align="center"
        :height="height + 300"
        :data="tableData">
        <vxe-table-column title="姓名" minWidth="100" field="empName">
          <template #default="{row}">
            <div>{{ row.empName }}<span class="u-m-l-4">{{ row.empType && (row.empType == 1 || row.empType == 2) ? row.empCode : ''}}</span></div>
          </template>
        </vxe-table-column>
        <vxe-table-column title="卡号" minWidth="100" field="cardNum">
          <template #default="{row}">
            <img
              :src="row.empFaceUrl+'?time='+ new Date().getTime()"
              v-if="row.empFaceUrl && row.empFaceUrl.length"
              width="30px" height="30px"
              style="border-radius: 50%;"
              @click="openPreview(row.empFaceUrl+'?time='+ new Date().getTime())" />
            <div v-else>{{ row.cardNum }}</div>
          </template>
        </vxe-table-column>
        <vxe-table-column title="权限" minWidth="100" field="isEffective">
          <template #default="{row}">
            <el-tag effect="dark" size="mini" type="success" v-if="row.isEffective == true">有权</el-tag>
            <el-tag effect="dark" size="mini" type="danger" v-if="row.isEffective == false">无权</el-tag>
          </template>
        </vxe-table-column>
        <vxe-table-column title="时间" minWidth="140" field="swipeTime"></vxe-table-column>
        <vxe-table-column title="设备名称" minWidth="100" field="devName"></vxe-table-column>
        <vxe-table-column title="设备SN" minWidth="100" field="devSn"></vxe-table-column>
        <vxe-table-column title="门区" minWidth="100" field="doorName"></vxe-table-column>
        <vxe-table-column title="人员类型" minWidth="100" field="personType">
          <template #default="{row}">
            <el-tag size="mini" type="primary" v-if="row.personType == 1 && row.empType == 1">学生</el-tag>
            <el-tag size="mini" type="success" v-if="row.personType == 1 && row.empType == 2">教职工</el-tag>
            <el-tag size="mini" type="danger" v-if="row.personType == 2">宿舍访客</el-tag>
            <el-tag size="mini" type="warning" v-if="row.personType == 3">访客</el-tag>
          </template>
        </vxe-table-column>
      </vxe-table>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import moment from "moment"
import {getSimpleMonitorSchemaList, openDoor} from "@/api/iot/access/monitor";
import { getAreaAllEquipmentTree} from "@/api/iot/access/icauth";
var echarts = require('echarts');
export default {
  data() {
    return {
      time:"",
      day:"",
      week:"",
      schemaCode:"",
      devCount:0,
      onlineTotalDevCount:0,
      catchPhone:"",
      idPhone:"",
      catchCount:0,
      warningCount:0,
      schemaArr:[],
      treeData:[],
      catchPhoneArr:[],
      countRealTotal:0,
      inCount:0,
      inCountTotal:0,
      outCount:0,
      outCountTotal:0,
      devArr:[],
      websock:null,
      daytimer:null,
      treeKey:"",
      isClose:false,
      dialogVisible:false,
      tableData:[]
    };
  },
  activated() {
    this.initData();
    this.websock = null;
    this.initWebSocket();
    this.initDayTime()
  },
  deactivated() {
    this.isClose = true;
    clearInterval(this.intervalIndex)
    clearInterval(this.daytimer)
    this.websock.close();
    if (this.websock && this.websock.readyState != this.websock.OPEN) {
        this.websock.close();
    }
    this.websock = null;
    this.daytimer = null;
  },
  computed:{
    height(){
      return window.innerHeight - 626;
    }
  },
  methods: {
    warningClick(){
      this.dialogVisible = true;
    },
    initWebSocket() {
      let url = website.websocketUrl;
      this.websock = new WebSocket(url); // 监听打开
      this.websock.onopen = this.websockOpen; // 监听关闭
      this.websock.onclose = () => {
          if(this.isClose) return;
          clearInterval(this.intervalIndex);
          this.websock = null;
          setTimeout(() => {
          	this.initWebSocket();
          },2000)
      }; //监听异常
      this.websock.onmessage = this.websockMessage;
    },
    websockOpen(){
      let $this = this;
      this.intervalIndex = setInterval(()=>{
        if($this.websock.readyState != $this.websock.OPEN){
          if(this.intervalIndex > 0){
            clearInterval(this.intervalIndex)
          }
        }else{
          let token = getToken();
          let param = { type: 5, schemaCode: this.schemaCode, token: token};
          this.websock.send(JSON.stringify(param));
        }
      },3000)
    },
    websockMessage(e) {
      let data = e.data;
      let jsonData = JSON.parse(data);
      if(jsonData.code == 400){
        this.devCount = 0;
        return;
      }
      if (jsonData.type == 3) {
        let arr = this.catchPhoneArr;
        arr.unshift({
          empName:jsonData.empName,
          devName:jsonData.devName,
          time:jsonData.swipeTime.substr(11,jsonData.swipeTime.length),
          faceUrl:jsonData.empFaceUrl
        })
        this.catchPhone = jsonData.empFaceUrl;
        this.idPhone = jsonData.empSourcFaceUrl;
        if(arr.length>9){
          arr = arr.slice(0,9)
        }
        this.catchPhoneArr = arr;

        let arr2 = [...this.tableData];
        arr2.unshift({
          empType:jsonData?.empType ? jsonData?.empType : '',
          empName:jsonData.empName || '',
          devName:jsonData.devName || '',
          swipeTime:jsonData.swipeTime || '',
          empFaceUrl:jsonData.empFaceUrl || '',
          cardNum:jsonData.cardNum || '',
          isEffective:jsonData.isEffective || '',
          devSn:jsonData.devSn || '',
          doorName:jsonData.doorName || '',
          personType:jsonData.personType || '',
          empCode:jsonData.empCode || '',
        })
        if(arr2.length > 1000){
          arr2 = arr2.slice(0,999)
        }
        console.log(arr2);
        this.tableData = arr2;
        this.$forceUpdate();
      }
      if(jsonData.type == 5){
        this.countRealTotal = jsonData.countRealTotal;
        this.inCount = jsonData.inCount;
        this.inCountTotal = jsonData.inCountTotal;
        this.outCount = jsonData.outCount;
        this.outCountTotal = jsonData.outCountTotal;
        this.warningCount = jsonData.strangerCount;
        if(!(this.devCount == jsonData.totalDevCount && this.onlineTotalDevCount == jsonData.onlineTotalDevCount)){
          this.devCount = jsonData.totalDevCount;
          this.onlineTotalDevCount = jsonData.onlineTotalDevCount
          let outDev = jsonData.totalDevCount - jsonData.onlineTotalDevCount;
          this.devArr = [
            {value:jsonData.onlineTotalDevCount,name:"在线"},
            {value:outDev,name:"离线"}
          ]
          this.getPie()
        }
        this.$forceUpdate();
      }
    },
    initData(){
      getSimpleMonitorSchemaList().then(r =>{
        this.schemaArr = []
        r.data.data.forEach(v => {
          this.schemaArr.push({
            value:v.schemaCode,
            label:v.schemaName
          })
        })
        this.schemaCode = this.schemaArr[0].value
      })
      getAreaAllEquipmentTree().then(r => {
        this.treeData = r.data.data
      })
    },
    initDayTime(){
      let arr =['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
      this.daytimer = setInterval(() => {
        this.time = moment().format("HH:mm:ss")
        this.day = moment().format("YYYY-MM-DD")
        this.week = arr[moment().weekday()]
      },1000)
    },
    getPie () {
      let myChart = echarts.init(document.getElementById('myChart2'));
      if(!myChart){
        return;
      }
      myChart.setOption({
        title:{
          text:"设备总数",
          subtext:`${this.devCount}台`,
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
          top: '5%',
          left: 'center'
        },
        series: [{
          color: ["#4f91f1", "#FB6260"],
          name: '',
          type: 'pie',
          radius: ['35%', '70%'],
          label: {
            show: false,
            position: 'center'
          },
          labelLine: {
            show: false
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2
          },
          hoverAnimation:true,
          data: this.devArr
        }],
      });
    },
    openDoor(){
      let v = this.treeKey;
      if(!v){
        this.$message.error("请先选择门区或设备");
        return;
      }
      let arr = v.split('-');
      if(arr[0] == 'D' || (arr[0] == 'E' && (arr[2] == 2 || arr[2] == 7))){
        openDoor({treeKey:v}).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg);
          }
        })
      }else{
        this.$message.error("请选择门区或设备");
        return;
      }
    },
    openPreview(url) {
      let arr = [{ thumbUrl: url, url: url }];
      this.$ImagePreview(arr, 0);
    },
  },
};
</script>

<style lang="scss" scoped>
.colcardleft{
  background-color: #fff;
  padding: 10px;
  height: 120px;
  align-items: center;
  display: flex;
  flex-direction: row;
  div{
    width: 20%;
    text-align: center;
    &:first-child{
      border-right: 1px solid #e8e8e8;
    }
  }
}
.colcardright{
  background-color: #fff;
  padding: 10px;
  height: 70px;
  box-sizing: border-box;
  text-align: center;
  p{
    margin: 0;
    font-weight: 600;
  }
}
.bg{
  background-color: #fff;
  padding: 10px;
}
.h300{
  height: 300px;
}
/deep/.el-card__body{
  padding: 0;
}
.phone{
  display: flex;
  justify-content: space-around;
  text-align: center;
  align-items: center;
  .img{
    border: 1px solid #E8E8E8;
    margin-top: 10px;
    height: 250px;
  }
}
.boxShadow{
  box-shadow:0 2px 12px 0 #EBEEF5
}
/deep/.el-card{
  border: none;
}
.foot{
  text-align: left;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 10px 5px;
  p{
    margin: 5px 0;
    width: 140px;
  }
  div{
    width: 140px;
  }
}
.numberColor{
  font-size: 24px;
  font-weight: 600;
  color: #0099FF;
}
</style>
