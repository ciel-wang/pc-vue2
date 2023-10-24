<template>
  <el-row>
    <el-row style="margin-left: 13px;">
      <transition-group name="fade">
        <el-col :span="6" v-for="(v, i) in dataList" :key="'realinfo'+i" :ref="'r' + i">
          <el-card class="box-card" id="ecard">
            <div class="box">
              <div class="b-img">
                <img width="50%" height="230px" :src="v.empSourcFaceUrl+'?time='+ new Date().getTime()" />
                <img width="50%" height="230px" :src="v.empFaceUrl+'?time='+ new Date().getTime()" />
              </div>
              <div class="b-txt">
                <span class="isAuth">{{ v.isEffective }}</span>
                <h1>{{ v.empName }}</h1>
                <p>
                  <span>学工号：</span>
                  <span>{{ v.empCode }}</span>
                </p>
                <p>
                  <span>部门名称：</span>
                  <span>{{ v.deptName }}</span>
                </p>
                <p>
                  <span>刷卡/脸时间：</span>
                  <span>{{ v.swipeTime }}</span>
                </p>
              </div>
            </div>
          </el-card>
        </el-col>
      </transition-group>
    </el-row>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import dangAnSvg from '/public/svg/danan.svg';
import faceSvg from '/public/svg/face.svg';

export default {
  name: 'monitor-realinfo',
  data() {
    return {
      dataList: []
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'permission'])
  },
  mounted() {
    this.initWebSocket();
  },
  methods: {
    initWebSocket() {
      let url = website.websocketUrl;
      // 创建websocket连接
      this.websock = new WebSocket(url); // 监听打开
      this.websock.onopen = this.websockOpen; // 监听关闭
      this.websock.onclose = this.websockClose; //监听异常
      this.websock.onerror = this.websockError; //监听服务器发送的消息
      this.websock.onmessage = this.websockMessage;
    },
    websockOpen() {
      //WEBSOCKET链接成功后发生消息进行身份验证，不验证后面收不到消息
      this.websock.send(JSON.stringify({ type: 3, token: getToken() }));
    },
    websockMessage(e) {
      console.log(e)
      let data = e.data;
      let jsonData = JSON.parse(data);
      console.log(jsonData)
      if (jsonData.type != 3) {
        return;
      }
      this.updateData(jsonData);
      this.$forceUpdate();
    },
    updateData(data) {
      data.isEffective = data.isEffective ? '有权' : '无权';
      if (data.devType == 1) {
        //说明是卡
        this.updateCardData(data);
      }
      if (data.devType == 2) {
        //说明是人脸
        this.updateFaceData(data);
      }
    },
    updateCardData(data) {
      if (data.empSourcFaceUrl.length < 10) {
        data.empSourcFaceUrl = dangAnSvg;
      }
      if (!data.empName) {
        data.empName = data.cardNum;
      }
      data.empFaceUrl = faceSvg;
      if (this.dataList.length < 8) {
        this.dataList.unshift(data);
      } else {
        this.dataList = this.dataList.slice(0, 7);
        // setTimeout(()=>{this.dataList.unshift(data)},1000)
        this.dataList.unshift(data);
      }
    },
    updateFaceData(data) {
      if (!data.empSourcFaceUrl) {
        data.empSourcFaceUrl = dangAnSvg;
      }
      if (!data.empFaceUrl) {
        data.empFaceUrl = faceSvg;
      }
      if (!data.empName) {
        data.empName = data.cardNum;
      }
      if (this.dataList.length < 8) {
        this.dataList.unshift(data);
      } else {
        this.dataList = this.dataList.slice(0, 7);
        this.dataList.unshift(data);
      }
    }
  },
  beforeDestroy() {
    this.websock.close();
  }
};
</script>

<style>
.box {
  width: 100%;
  height: 400px;
}
.box .b-img {
  width: 100%;
  height: 250px;
}
.b-txt {
  font-weight: 600;
  position: relative;
}
.box .b-txt p {
  line-height: 10px;
  font-size: 14px;
  color: #141414;
}
h1 {
  margin-top: 0px;
}
#ecard {
  background: #fff;
}

.isAuth {
  position: absolute;
  right: 0px;
}

/*  .fade-enter-active, .fade-leave-active {
      transition: opacity 2s;
    }
    .fade-enter, .fade-leave-to  {
      opacity: 0;
    } */

.fade-enter-active,
.fade-enter {
  animation-name: shutter-in-top;
  animation-duration: 1s;
  animation-timing-function: ease;
  animation-delay: 0s;
  animation-iteration-count: 1;
  animation-direction: normal;
  animation-fill-mode: none;
}
@keyframes shutter-in-top {
  0% {
    -webkit-transform: rotateX(-100deg);
    transform: rotateX(-100deg);
    -webkit-transform-origin: top;
    transform-origin: top;
    opacity: 0;
  }
  100% {
    -webkit-transform: rotateX(0deg);
    transform: rotateX(0deg);
    -webkit-transform-origin: top;
    transform-origin: top;
    opacity: 1;
  }
}

.fade-leave-active,
.fade-leave-to {
  animation-name: fade-out-right;
  animation-duration: 1s;
  animation-timing-function: ease;
  animation-delay: 0s;
  animation-iteration-count: 1;
  animation-direction: normal;
  animation-fill-mode: none;
}
@keyframes fade-out-right {
  0% {
    -webkit-transform: translateX(0);
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    -webkit-transform: translateX(50px);
    transform: translateX(50px);
    opacity: 0;
  }
}
</style>
