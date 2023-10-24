<template>
  <basic-container style="height: 99%;">
    <el-alert
      :title='`会计期间上月${startDate && startDate.substr(3,2)}-本月${endDate && endDate.substr(3,2)}日，请采集完当前期间数据后再进行期间统计、结算。`'
      type="warning" show-icon
      style="width: 50%;"></el-alert>
    <h2>当前会计期间：{{ currMonth }}月【{{ startDate }}-{{ endDate }}】</h2>
    <div class="tips">
      <p>期间统计：将当前会计期间内的所有收支情况进行总结、核算；</p>
      <p>期间结算：将当前会计期间内已总结、核算的所有收支情况进行锁定；</p>
      <p>期间回滚：数据处理错误，将上一次结算期间数据恢复到未结算状态。</p>
    </div>
    <div style="margin: 10px 0;">
      <el-date-picker
        v-model="monthNum"
        type="month"
        placeholder="选择月"
        size="small" :clearable="false"
        format="yyyy-MM"
        valueFormat="yyyy-MM"
        style="margin-right: 10px;"></el-date-picker>
      <el-button type="primary" icon="el-icon-search" size="small" @click="search">查询</el-button>
      <el-button icon="el-icon-refresh" size="small" @click="searchReset">重置</el-button>
      <span v-show="state" style="margin-left: 10px;color: red;">正在统计中</span>
      <span class="ani_dot" v-show="state">...</span>
    </div>
    <vxe-table
      border
      resizable
      ref="crud"
      size="mini"
      auto-resize
      show-overflow
      highlight-hover-row
      align="center"
      :loading="loading"
      :data="tableData">
      <vxe-table-column title="会计期间" minWidth="100" field="monthNum"></vxe-table-column>
      <vxe-table-column title="期初金额" minWidth="100" field="firstMoney"></vxe-table-column>
      <vxe-table-column title="收入" minWidth="100" field="inMoney"></vxe-table-column>
      <vxe-table-column title="支出" minWidth="100" field="outMoney"></vxe-table-column>
      <vxe-table-column title="期末金额" minWidth="100" field="lastMoney"></vxe-table-column>
      <vxe-table-column title="状态" minWidth="100" field="lockState">
        <template #default="{row}">
          <el-tag effect="dark" size="mini" v-if="row.lockState == 1">已结算</el-tag>
          <el-tag effect="dark" size="mini" type="warning" v-if="row.lockState == 0">未结算</el-tag>
        </template>
      </vxe-table-column>
    </vxe-table>
    <div style="margin-top: 70px;text-align: center;">
      <el-button type="primary" size="small" @click="handleStatistics" :disabled="btnDisabled || state == 1">期间统计</el-button>
      <el-button type="primary" size="small" @click="handleSettle" :disabled="btnDisabled || state == 1">期间结算</el-button>
      <el-button size="small" @click="handleRollback" :disabled="btnDisabled || state == 1">期间回滚</el-button>
    </div>
  </basic-container>
</template>

<script>
  import moment from 'moment';
  import website from '@/config/website.js';
  import { getToken } from '@/util/auth';
  import { reqTableData, reqPeriodInfo, sendPeriodStatic, sendPeriodSettle, sendPeriodRollback} from '@/api/xf/accounts-period-colse.js'

  export default{
    data(){
      return{
        monthNum:"",
        loading:false,
        tableData:[],
        endDate:"",
        startDate:"",
        btnDisabled:false,
        currMonth:"",
        websock: null,
        timer:null,
        state:0
      }
    },
    activated() {
      this.initData();
      this.websock = null;
      this.initWebSocket()
    },
    deactivated(){
      clearInterval(this.timer);
      this.websock.close();
      this.websock = null;
    },
    methods:{
      initWebSocket(){
        let url = website.websocketUrl;
        this.websock = new WebSocket(url); // 监听打开
        this.websock.onopen = this.websockOpen; // 监听关闭
        this.websock.onclose = this.websockClose; //监听异常
        this.websock.onerror = this.websockError; //监听服务器发送的消息
        this.websock.onmessage = this.websockMessage;
      },
      websockOpen() {
        let $this = this;
        let token = getToken();
        let param3 = { type: 11, token: token };
        this.websock.send(JSON.stringify(param3));
        this.timer = setInterval(() => {
            this.websock.send(JSON.stringify(param3));
        },3000)
      },
      websockMessage(e) {
        let data = e.data == 'successfully' ? '{}' : e.data;
        let jsonData = JSON.parse(data);
        this.state = jsonData.state;
      },
      initData(){
        reqPeriodInfo().then(r => {
          let d = r.data.data;
          this.startDate = moment(d.startDate).format('MM月DD日');
          this.endDate = moment(d.endDate).format('MM月DD日');
          let currMonth = d.currMonth+'';
          this.currMonth = `${currMonth.substr(0,4)}-${currMonth.substr(4,2)}`
          this.monthNum = this.currMonth;
          this.search()
        })
      },
      handleStatistics(){
        this.state = 1;
        this.btnDisabled = true;
        sendPeriodStatic().then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg)
          }else{
            this.$message.error(r.data.msg)
          }
          this.btnDisabled = false;
        }).catch(() => this.btnDisabled = false)
      },
      handleSettle(){
        this.btnDisabled = true;
        sendPeriodSettle().then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg)
          }else{
            this.$message.error(r.data.msg);
            this.initData();
          }
          this.btnDisabled = false;
        }).catch(() => this.btnDisabled = false)
      },
      handleRollback(){
        this.btnDisabled = true;
        sendPeriodRollback().then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.initData();
          }else{
            this.$message.error(r.data.msg)
          }
          this.btnDisabled = false;
        }).catch(() => this.btnDisabled = false)
      },
      search(){
        let monthNum = this.monthNum.replace(/-/g, "");
        reqTableData({monthNum}).then(r => {
          let d = r.data.data;
          let monthNum2 = d.monthNum ? d.monthNum+'' : '';
          d.monthNum = monthNum2 ? `${monthNum2.substr(0,4)}-${monthNum2.substr(4,2)}` : ''
          this.tableData = [d];
        })
      },
      searchReset(){
        this.monthNum = "";
        this.search()
      },
    }
  }
</script>

<style scoped>
  >>>.basic-container:first-child{height: 100% !important;}
  >>>.el-card{height: 100% !important;}
  .tips{
    padding: 10px 15px;
    background: #f5f6f7;
    line-height: 10px;
    color: #666;
    font-size: 12px;
  }
  @-webkit-keyframes dot {
    0% { width: 0; margin-right: 1.5em; }
    33% { width: .5em; margin-right: 1em; }
    66% { width: 1em; margin-right: .5em; }
    100% { width: 1.5em; margin-right: 0;}
  }
  @keyframes dot {
    0% { width: 0; margin-right: 1.5em; }
    33% { width: .5em; margin-right: 1em; }
    66% { width: 1em; margin-right: .5em; }
    100% { width: 1.5em; margin-right: 0;}
  }
  .ani_dot {
    display: inline-block;
    width: 1.5em;
    vertical-align: baseline;
    overflow: hidden;
    font-family: simsun;
    margin-bottom: -6px;
    margin-left: 3px;
    color: red;
    animation: dot 3s infinite step-start;
    -webkit-animation: dot 3s infinite step-start;
  }
</style>
