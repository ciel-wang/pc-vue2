<template>
  <el-row style="height: 99%;">
    <el-col :span="17" style="height: 100%;">
      <el-card>
        <div slot="header">
          <el-dropdown trigger="click" @command="changeParking">
            <span style="cursor: pointer;font-weight: 600;font-size: 18px;">
              {{ parkingName }}
              <i class="el-icon-setting"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="v" v-for="(v, i) in parkingDic" :key="i">{{ v.label }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <span style="float: right;">{{ nowDate }}</span>
        </div>
        <div class="topClass">
          <div>
            <avue-count-up class="fw600" :decimals="0" :end="obj.parkingSurplus"></avue-count-up>个
            <p>剩余车位</p>
          </div>
          <div>
            <avue-count-up class="fw600" :decimals="0" :end="obj.parkingIn"></avue-count-up>辆
            <p>在场车辆</p>
          </div>
          <div>
            <avue-count-up class="fw600" :decimals="0" :end="obj.parkingToDayIn"></avue-count-up>辆
            <p>今日入场车辆</p>
          </div>
          <div>
            <avue-count-up class="fw600" :decimals="0" :end="obj.parkingToDayOut"></avue-count-up>辆
            <p>今日出场车辆</p>
          </div>
        </div>
      </el-card>

      <el-row class="monitor_body">
        <el-col :span="9" style="height: 100%;">
          <el-card>
            <div slot="header" class="fw600">设备状态监控</div>
            <div id="devChart" style="width: 100%;height:260px;" />
            <div style="height: calc(100% - 330px);">
              <vxe-table auto-resize ref="xTable" size="mini" height="100%" align="center" :data="tableData">
                <vxe-table-column title="设备状态" minWidth="70" field="onlineStatus">
                  <template #default="{row}">
                    <el-tag effect="dark" size="mini" type="info" v-if="!row.onlineStatus">离线</el-tag>
                    <el-tag effect="dark" size="mini" type="primary" v-if="row.onlineStatus">在线</el-tag>
                  </template>
                </vxe-table-column>
                <vxe-table-column title="设备编号" minWidth="70" field="devCode"></vxe-table-column>
                <vxe-table-column title="设备名称" minWidth="80" field="devName"></vxe-table-column>
                <vxe-table-column title="所属通道" minWidth="70" field="channelName"></vxe-table-column>
              </vxe-table>
            </div>
          </el-card>
        </el-col>

        <el-col :span="15">
          <el-card style="margin-left: 8px;">
            <div class="monitor_body_middle_img">
              <div>
                <p>
                  <span class="inDot"></span>
                  <span>入场识别图片</span>
                </p>
                <img :src="inImgUrl" width="100%" />
              </div>
              <div>
                <p>
                  <span class="outDot"></span>
                  <span>出场识别图片</span>
                </p>
                <img :src="outImgUrl" width="100%" />
              </div>
            </div>
            <div class="monitor_body_middle_time">
              <p style="width: 100%;text-align: center;font-size: 26px;font-weight: 600;">
                <span>{{ plateNum }}</span>
                <span v-show="isCharge" style="color: red;margin-left: 20px;">{{ oughtMoney }}元</span>
              </p>
              <p style="width: 45%;">车辆类型：{{ carTypeName }}</p>
              <p style="width: 45%;">入场时间：{{ inTime }}</p>
              <p style="width: 45%;">出场时间：{{ outTime }}</p>
              <p style="width: 45%;">停车时长：{{ stopTime }}</p>
            </div>

            <div class="monitor_body_middle_wait">
              <div v-for="(v, i) in waitCarArr" :key="i" @click="processData(v)">
                <p style="font-size: 26px;">{{ v.in && v.in.plateNum }}</p>
                <p style="font-size: 12px;">通道：{{ v.inOutDirection == 1 ? '入' : '出' }}通道</p>
              </div>
            </div>

            <div class="monitor_body_middle_btn">
              <el-button round :disabled="btnDisabled" @click="cancelPass">取消放行</el-button>
              <el-button type="primary" round v-show="!isCharge" :disabled="btnDisabled" @click="confirmPass(3)">确认放行</el-button>
              <el-button type="primary" round v-show="isCharge" :disabled="btnDisabled" @click="confirmPass(1)">免费放行</el-button>
              <el-button type="primary" round v-show="isCharge" :disabled="btnDisabled" @click="confirmPass(2)">收费放行</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-col>
    <el-col :span="7" class="monitor_body" style="height: 100%;margin-top: 0;">
      <el-card :body-style="{ padding: '0px 16px 10px !important' }" style="margin-left: 8px;">
        <div slot="header" class="fw600">实时信息</div>
        <div class="monitor_body_right" v-for="(v, i) in carArr" :key="carArr.length - i">
          <div style="flex: 1;max-width: 260px !important;"><img :src="v.imgUrl" width="99%" /></div>
          <div style="width: 200px;">
            <div class="flexBetween" style="margin-bottom: 12px;">
              <h2 style="margin: 0">{{ v.plateNum }}</h2>
              <div>
                <span :class="v.inOutDirection == 1 ? 'inDot' : 'outDot'"></span>
                <span style="margin-left: 3px;">{{ v.inOutDirection == 1 ? '入' : '出' }}</span>
              </div>
            </div>
            <p>有效期至：{{ v.overdueTime }}</p>
            <p>车主姓名：{{ v.empName }}</p>
            <p>联系电话：{{ v.empPhone }}</p>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';
import website from '@/config/website.js';
import { getToken } from '@/util/auth';
import { datetimeToDurationTrans } from '@/util/trans.js';
import { getParkingList } from '@/api/parking/yard.js';
import { getMonitorData, openDev, cancelDev, chargeOpenDev, getWaitCarData } from '@/api/parking/car.js';
var echarts = require('echarts');

export default {
  data() {
    return {
      parkingName: '',
      parkingId: '',
      parkingDic: [],
      nowDate: moment().format('YYYY年MM月DD日 HH:mm:ss'),
      timer: null,
      devArr: [],
      devCount: 0,
      tableData: [],
      obj: { parkingIn: 0, parkingSurplus: 0, parkingToDayIn: 0, parkingToDayOut: 0 },
      websock: null,
      timer2: null,
      inImgUrl: '',
      outImgUrl: '',
      plateNum: '',
      inTime: '',
      outTime: '',
      stopTime: '',
      carArr: [],
      btnDisabled: true,
      inOutId: '',
      devSn: '',
      carTypeName: '',
      isCharge: false,
      oughtMoney: 0,
      waitCarArr: [],
      dataId: '',
      carAuthDevIds: [],
      waitTimer: null,
      devChart:null
    };
  },
  mounted() {
    this.devChart = echarts.init(document.getElementById('devChart'));
  },
  activated() {
    this.timer = setInterval(() => {
      this.nowDate = moment().format('YYYY年MM月DD日 HH:mm:ss');
    }, 1000);
    this.clearData();
    getParkingList().then(r => {
      let d = r.data.data.records;
      let arr = d.map(v => ({value: v.id,label: v.parkingName}));
      this.parkingDic = arr;
      this.parkingId = arr[0]?.value;
      this.parkingName = arr[0]?.label;
      this.initData();
      this.timer2 = setInterval(() => {
        this.initData();
      }, 5000);
      this.websock = null;
      this.initWebSocket();

      this.initWaitCarData();
      this.waitTimer = setInterval(() => {
        this.initWaitCarData();
      }, 2000);
    });
  },
  deactivated() {
    clearInterval(this.timer);
    clearInterval(this.timer2);
    clearInterval(this.waitTimer);
    this.websock.close();
    this.websock = null;
  },
  methods: {
    processData(data) {
      if (data.inOutDirection == 1) {
        this.btnDisabled = data?.in.confirmStatus == 2 ? false : true;
        this.isCharge = false;
        this.inOutId = data.in.inOutId;
        this.devSn = data.in.devSn;
        this.carTypeName = data?.in?.carTypeName;
      } else {
        this.btnDisabled = data?.out.confirmStatus == 2 ? false : true;
        this.isCharge = data?.out?.bills?.ougthMoney > 0 ? true : false;
        this.oughtMoney = data?.out?.bills?.ougthMoney || 0;

        this.inOutId = data.out.inOutId;
        this.devSn = data.out.devSn;
        this.carTypeName = data?.out?.carTypeName;
      }
      this.dataId = data.dataId;
      this.inImgUrl = data?.in?.imgUrl;
      this.outImgUrl = data.inOutDirection == 2 ? data?.out?.imgUrl : '';
      this.inTime = moment(data?.in?.inTime).format('YYYY-MM-DD HH:mm:ss') || '';
      this.outTime = data.inOutDirection == 2 ? moment(data?.out?.inTime).format('YYYY-MM-DD HH:mm:ss') : '';
      this.plateNum = data?.in?.plateNum;

      this.stopTime = '';
      if (data?.out?.inTime && data?.in?.inTime) {
        this.stopTime = datetimeToDurationTrans(data?.in?.inTime, data?.out?.inTime, false);
      }
    },
    initWaitCarData() {
      getWaitCarData().then(r => {
        if (r.data.code === 200) {
          let d = r.data.data;
          this.waitCarArr = d;
          if (this.waitCarArr.length && !this.dataId) {
            this.processData(this.waitCarArr[0]);
          }
          if (!d.length) {
            this.clearData();
          }
        }
      });
    },
    diffData() {
      let index = this.waitCarArr.findIndex(item => item.dataId === this.dataId);
      this.waitCarArr.splice(index, 1);
      if (this.waitCarArr.length) {
        this.processData(this.waitCarArr[0]);
      } else {
        this.dataId = '';
        this.clearData();
      }
    },
    confirmPass(val) {
      let index = this.waitCarArr.findIndex(item => item.dataId === this.dataId);
      if (index < 0) {
        this.$message.error('请重新选择');
        return;
      }
      if (val == 3) {
        openDev({ devSn: this.devSn, inOutId: this.inOutId, dataId: this.dataId }).then(r => {
          if (r.data.code == 200) {
            this.btnDisabled = true;
            this.$message.success(r.data.msg);
            this.diffData();
          } else {
            this.$message.error(r.data.msg);
          }
        });
      } else {
        chargeOpenDev({ inOutId: this.inOutId, permitType: val, dataId: this.dataId }).then(r => {
          if (r.data.code == 200) {
            this.btnDisabled = true;
            this.$message.success(r.data.msg);
            this.diffData();
          } else {
            this.$message.error(r.data.msg);
          }
        });
      }
    },
    cancelPass() {
      let index = this.waitCarArr.findIndex(item => item.dataId === this.dataId);
      if (index < 0) {
        this.$message.error('请重新选择');
        return;
      }
      cancelDev({ inOutId: this.inOutId, devSn: this.devSn, dataId: this.dataId }).then(r => {
        if (r.data.code == 200) {
          this.btnDisabled = true;
          this.$message.success(r.data.msg);
          this.diffData();
        } else {
          this.$message.error(r.data.msg);
        }
      });
    },
    changeParking(v) {
      this.parkingId = v.value;
      this.parkingName = v.label;
      this.tableData = [];
      this.clearData();
    },
    clearData() {
      this.dataId = '';
      this.inImgUrl = '';
      this.outImgUrl = '';
      this.inTime = '';
      this.outTime = '';
      this.stopTime = '';
      this.oughtMoney = '';
      this.plateNum = '';
      this.carTypeName = '';
      this.btnDisabled = true;
      this.isCharge = false;
    },
    initWebSocket() {
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
      let param3 = { type: 6, token: token };
      this.websock.send(JSON.stringify(param3));
    },
    websockMessage(e) {
      let data = e.data == 'successfully' ? '{}' : e.data;
      let jsonData = JSON.parse(data);
      if (jsonData.code == 400) return;
      console.log(jsonData.parkingId,this.parkingId,this.carAuthDevIds,jsonData.devId);
      if (jsonData.type == 6 && jsonData.parkingId == this.parkingId && this.carAuthDevIds.includes(jsonData.devId+'')) {
        let arr = [...this.carArr];
        if (jsonData.inOutDirection == 1) {
          arr.unshift({
            plateNum: jsonData?.in?.plateNum,
            empName: jsonData?.in?.empName,
            empPhone: jsonData?.in?.empPhone,
            imgUrl: jsonData?.in?.imgUrl,
            inOutDirection: jsonData.inOutDirection,
            overdueTime: jsonData.in.overdueTime ? moment(jsonData.in.overdueTime).format('YYYY-MM-DD') : ''
          });
        } else {
          arr.unshift({
            plateNum: jsonData?.out.plateNum,
            empName: jsonData?.out.empName,
            empPhone: jsonData?.out.empPhone,
            imgUrl: jsonData?.out.imgUrl,
            inOutDirection: jsonData.inOutDirection,
            overdueTime: jsonData.out.overdueTime ? moment(jsonData.out.overdueTime).format('YYYY-MM-DD') : ''
          });
        }
        if (arr.length > 20) {
          arr = arr.slice(0, 20);
        }
        this.carArr = [...arr];
        if (!this.waitCarArr.length) {
          this.processData(jsonData);
        }
        this.$forceUpdate();
      }
    },
    initData() {
      getMonitorData({ parkingId: this.parkingId }).then(r => {
        if (r.data.code == 200) {
          let d = r.data.data;
          this.obj = { ...d };
          this.carAuthDevIds = d.carAuthDevIds.split(',') || [];
          let online = d.devs.reduce((sum, item) => {
            return sum + item.onlineStatus;
          }, 0);
          this.tableData = d.devs;
          this.devArr = [{ name: '在线', value: online }, { name: '离线', value: d.devs.length - online }];
          this.getDevData();
        }
      });
    },
    getDevData() {
      this.devChart.setOption({
        title: {
          text: '设备总数',
          subtext: `${this.tableData.length}台`,
          left: 'center',
          top: '42%',
          subtextStyle: { color: '#999', fontSize: 16 }
        },
        tooltip: { trigger: 'item' },
        legend: { top: '1%', right: 'center' },
        series: [
          {
            color: ['#4f91f1', '#FB6260'],
            name: '',
            type: 'pie',
            radius: ['45%', '70%'],
            label: { show: false, position: 'center' },
            labelLine: { show: false },
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
            hoverAnimation: true,
            data: this.devArr
          }
        ]
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.topClass {
  display: flex;
  align-items: center;
  justify-content: space-around;
  text-align: center;
  span {
    font-size: 22px;
    margin-right: 6px;
  }
  &>div {
    width: 200px;
    padding: 16px 0 4px;
    background: url(/img/bg/parking-bg.svg) no-repeat center;
    background-size: 100% 100%;
    color: #fff;
  }
}
/deep/.el-card__header {
  padding: 11px 18px !important;
}
.monitor_body {
  margin-top: 8px;
  height: calc(100% - 200px);
  /deep/.el-col,
  /deep/.el-card.is-always-shadow {
    height: 100%;
  }
  /deep/.el-card__body {
    height: calc(100% - 70px);
    overflow: auto;
  }
  &_right {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px dashed #ccc;
    align-items: center;
    p {
      margin: 6px 0;
    }
  }
  &_middle_img {
    display: flex;
    justify-content: space-around;
    & > div {
      width: 40%;
      min-height: 120px;
      text-align: center;
      img {
        max-height: 220px;
        max-width: 320px;
        border-radius: 10px;
      }
    }
  }
  &_middle_plateNum {
    padding: 30px 20px 20px;
    text-align: center;
    font-size: 26px;
  }
  &_middle_time {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 0 30px;
    margin-top: 30px;
    p {
      margin: 8px 0;
    }
  }
  &_middle_wait {
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    align-items: center;
    height: 100px;
    & > div {
      flex: 0 0 140px;
      height: 48px;
      padding: 8px;
      text-align: center;
      margin-right: 10px;
      background: url(/img/bg/cpbg1.svg) no-repeat center;
      background-size: 100%;
      color: #fff;
      cursor: pointer;
      p {
        margin: 0;
      }
    }
  }
  &_middle_btn {
    margin-top: 30px;
    text-align: center;
  }
}
.inDot,
.outDot {
  width: 10px;
  height: 10px;
  background-color: #005814;
  border-radius: 10px;
  display: inline-block;
  margin-right: 3px;
}
.outDot {
  background-color: #ff882c;
}
</style>
