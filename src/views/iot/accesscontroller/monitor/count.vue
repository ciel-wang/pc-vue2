<template>
  <avue-data-tabs :option="option"></avue-data-tabs>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';

export default {
  name: 'monitor-count',
  data() {
    return {
      inCount: 0,
      outCount: 0,
      outCountTotal: 0,
      inCountTotal: 0,
      countRealTotal: 0,
      schemaCode: '',
      time: null
    };
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
      this.websock.send(JSON.stringify({ type: 5, token: getToken() }));
      this.pullMsgCount();
    },
    websockMessage(e) {
      let data = e.data;
      console.log(data)
      let jsonData = JSON.parse(data);
      if (jsonData.type != 5) {
        return;
      }
      this.inCount = jsonData.inCount;
      this.outCount = jsonData.outCount;
      this.outCountTotal = jsonData.outCountTotal;
      this.inCountTotal = jsonData.inCountTotal;
      this.countRealTotal = jsonData.countRealTotal;
      this.$forceUpdate();
    },
    updateSchemaCode(val) {
      this.schemaCode = val;
    },
    updateTimeStep(time) {
      this.time = time;
    },
    pullMsgCount() {
      let $this = this;
      let token = getToken();
      setInterval(() => {
        let param = { type: 5, schemaCode: this.schemaCode, token: token,};
        param = JSON.stringify(param);
        if (this.schemaCode.length != 0) {
          this.websock.send(param);
        }
      }, 1000);
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'permission']),
    option() {
      return {
        span: 4,
        data: [
          {
            title: '进场人次',
            subtitle: '实时',
            count: this.inCountTotal,
            allcount: 10222,
            text: '当前分类总记录数',
            color: 'rgb(27, 201, 142)'
          },
          {
            title: '进场人数',
            subtitle: '实时',
            count: this.inCount,
            allcount: 10222,
            text: '当前上传的附件数',
            color: 'rgb(230, 71, 88)'
          },
          {
            title: '出场人次',
            subtitle: '实时',
            count: this.outCountTotal,
            allcount: 10222,
            text: '评论次数',
            color: 'rgb(178, 159, 255)'
          },
          {
            title: '出场人数',
            subtitle: '实时',
            count: this.outCount,
            allcount: 10222,
            text: '评论次数',
            color: 'rgb(178, 159, 255)'
          },
          {
            title: '实际在场人数',
            subtitle: '实时',
            count: this.countRealTotal,
            allcount: 10222,
            text: '评论次数',
            color: 'rgb(178, 159, 255)'
          }
        ]
      };
    }
  },
  beforeDestroy() {
    this.websock.close()
  }
};
</script>

<style>
.avue-data-tabs .item {
  height: 100px !important;
}
</style>
