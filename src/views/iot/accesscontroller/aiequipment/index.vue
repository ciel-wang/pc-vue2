<template>
  <basic-container>
    <div>
      <el-input
        style="width: 200px;"
        size="small" clearable
        @keyup.enter.native="search"
        v-model="devQuery"
        placeholder="请输入设备编号/名称"></el-input>
      <el-input
        style="width: 200px;margin: 0 10px;"
        size="small" clearable
        @keyup.enter.native="search"
        v-model="devIp"
        placeholder="请输入设备IP"></el-input>
      <el-select v-model="devType" placeholder="请选择设备类型" size="small" style="width: 200px;margin-right: 10px;" @change="devTypeChange">
        <el-option v-for="item in devTypeDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <vxe-grid
      border
      resizable
      highlight-hover-row
      :height="tableHeight"
      ref="xGrid"
      size="mini"
      align="center"
      :highlight="true"
      :columns="tableColumn"
      :loading="loading"
      :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
      :data="tableData"
      :export-config="{}"
      :toolbar-config="{ custom: true, slots: { buttons: 'toolbar_buttons' } }"
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent">
      <template #toolbar_buttons>
        <ai-add @updatePage="search"></ai-add>
        <el-button
          type="primary" size="small"
          icon="el-icon-edit"
          v-if="permission.access_controller_equipment_ai_edit_btn"
          @click="updateFace">编辑</el-button>
        <el-button
          type="danger" size="small"
          icon="el-icon-delete"
          v-if="permission.access_controller_equipment_ai_del_btn"
          @click="handleRemove">删除</el-button>
        <el-button
          type="primary" size="small"
          v-if="permission.access_controller_equipment_ai_set_pwd_btn"
          @click="updateFacePwd">设置密码</el-button>
        <el-button type="primary" size="small" v-if="permission.access_controller_equipment_ai_set_time_btn" @click="handleSetTime">设置时间</el-button>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-download"
          v-if="permission.access_controller_equipment_ai_export_btn"
          @click="handleExport">导出</el-button>

        <el-dropdown @command="handleCommand">
          <el-button size="small" type="primary" style="margin-left: 10px;">
            更多
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              command="trafficStrategyBtn"
              v-show="activeDevIndex == 7 && permission.access_controller_equipment_ai_traffic_btn">通行策略</el-dropdown-item>
            <el-dropdown-item
              command="downloadStrategyBtn"
              v-show="activeDevIndex == 7 && permission.access_controller_equipment_ai_download_btn">策略下载</el-dropdown-item>
            <el-dropdown-item
              command="setcfgBtn"
              v-show="activeDevIndex == 2 && permission.access_controller_equipment_ai_set_cfg_btn">基础配置</el-dropdown-item>
            <el-dropdown-item
              command="restartBtn"
              v-show="activeDevIndex == 2 && permission.access_controller_equipment_ai_restart_btn">设备重启</el-dropdown-item>
            <el-dropdown-item
              command="resetBtn"
              v-show="activeDevIndex == 2 && permission.access_controller_equipment_ai_reset_btn">设备重置</el-dropdown-item>
            <el-dropdown-item command="devLog" v-if="permission.access_controller_equipment_ai_devlog_btn">设备日志</el-dropdown-item>
            <el-dropdown-item command="errVoice">设置异常语音</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      <template #onlineState="{row}">
        <el-tag effect="dark" size="mini" type="info" v-if="row.onlineState == false">离线</el-tag>
        <el-tag effect="dark" size="mini" type="primary" v-if="row.onlineState == true">在线</el-tag>
      </template>
      <template #devState="{row}">
        <i class="icon-xuanzhong" v-if="row.devState" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>
    </vxe-grid>

    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[30, 50, 100, 500,1000,3000]"
        :page-size="page.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :hide-on-single-page="false"
      ></el-pagination>
    </div>

    <ai-update ref="faceUpdateRef" @updatePage="search"></ai-update>
    <set-pwd @updatePage="search" ref="setPwdRef"></set-pwd>
    <basic-cfg ref="basicCfgRef"></basic-cfg>
    <dev-log ref="devlogref"></dev-log>
    <traffic-strategy ref="trafficStrategyRef"></traffic-strategy>
    <download-strategy ref="downloadStrategyRef" @refeshPage="search"></download-strategy>
    <aiErrVoice ref="aiErrVoiceRef"></aiErrVoice>
  </basic-container>
</template>

<script>
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { mapGetters } from 'vuex';
import { getList, setTime, restartDev, resetDev, removeDev, updateErrVoice } from '@/api/iot/access/face';
import AiUpdate from '../components/ai-update.vue';
import AiAdd from '../components/ai-add.vue';
import SetPwd from '../components/ai-setpwd.vue';
import BasicCfg from '../components/basiccfg.vue';
import devLog from '../components/dev-log.vue';
import trafficStrategy from '../components/traffic-strategy.vue';
import downloadStrategy from '../components/download-strategy.vue';
import aiErrVoice from '../components/ai-error-voice.vue';

export default {
  components: { AiUpdate, AiAdd, SetPwd, BasicCfg, devLog, trafficStrategy, downloadStrategy, aiErrVoice },
  data() {
    return {
      devQuery: '',
      devIp: '',
      tableHeight: 0,
      loading: false,
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableData: [],
      selectionList: [],
      devTypeDic: [{ value: 2, label: 'IOT-Y' }, { value: 7, label: 'IOT-H' }],
      devType: 7,
      activeDevIndex: 7,
      websock:null,
      intervalIndex:null
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 254;
    this.search();
  },
  activated() {
    this.websock = null;
    this.initWebSocket();
  },
  deactivated() {
    clearInterval(this.intervalIndex);
    this.websock.close();
    this.websock = null;
  },
  methods: {
    devTypeChange(val) {
      this.activeDevIndex = val;
    },
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
      let $this = this;
      this.intervalIndex = setInterval(() => {
        if ($this.websock.readyState != $this.websock.OPEN) {
          if (this.intervalIndex > 0) {
            clearInterval(this.intervalIndex);
          }
        } else {
          this.websock.send(JSON.stringify({ type: 4, token: getToken() }));
        }
      }, 3000);
    },
    websockMessage(e) {
      try{
        var jsonData = JSON.parse(e.data);
        if(jsonData.type != 4) return;
        var array = Array.isArray(jsonData.data) ? jsonData.data : [];
        
        this.tableData.forEach(v => {
          if (array.length == 0) {
            v.onlineState = false;
          } else {
            let index = array.findIndex(d => d.name == v.devSn);
            v.onlineState = index >= 0 ? true : false;
          }
          this.$forceUpdate();
        });
      }catch(e){
        console.log(e);
      }
    },
    updateFace() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      var row = this.selectionList[0];
      this.$refs.faceUpdateRef.showAddBox(row);
    },
    handleRemove() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      removeDev({ ids: this.ids }).then(res => {
        if (res.data.code == 200) {
          this.$message.success('删除成功');
          this.search();
        }
      });
    },
    updateFacePwd() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择1条数据');
        return;
      }
      var row = this.selectionList[0];
      this.$refs.setPwdRef.showSetPwdBox(row);
    },
    handleSetTime() {
      if (this.selectionList.length == 0) {
        this.$message.warning('请至少选择一条数据');
        return;
      }
      setTime({ ids: this.ids }).then(res => {
        if (res.data.code == 200) {
          this.$message.success('设置成功');
        }
      });
    },
    handleExport() {
      this.$confirm('是否导出AI设备管理?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-basic/access/ic/export-ic?${this.website.tokenHeader}=${getToken()}&size=${this.page.pageSize}&current=${this.page.currentPage}&ids=${this.ids}&devName=${this.devQuery}&devIp=${this.devIp}&devType=${this.devType}`
        );
      });
    },
    handleCommand(v) {
      if(v == 'errVoice'){
        if(this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
        updateErrVoice({ ids:this.ids.split(',') }).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg);
          }else{
            this.$message.error(r.data.msg);
          }
        })
        // this.$refs.aiErrVoiceRef.openDialog(this.ids)
      }
      if (v == 'devLog') {
        this.$refs.devlogref.openDialog();
      }
      if (v == 'setcfgBtn') {
        this.updateBasicCfg();
      }
      if (v == 'resetBtn') {
        this.handleReset();
      }
      if (v == 'restartBtn') {
        this.handleRestart();
      }
      if (v == 'trafficStrategyBtn') {
        this.$refs.trafficStrategyRef.openDialog();
      }
      if (v == 'downloadStrategyBtn') {
        if (this.selectionList.length == 0) {
          this.$message.warning('请选择至少一条数据');
          return;
        }
        this.$refs.downloadStrategyRef.openDialog({ devIds: this.ids });
      }
    },
    updateBasicCfg() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择1条数据');
        return;
      }
      var row = this.selectionList[0];
      this.$refs.basicCfgRef.showAddBox(row);
    },
    handleRestart() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择1条数据');
        return;
      }
      restartDev({ ids: this.ids }).then(res => {
        if (res.data.code == 200) {
          this.$message.success('重启成功');
        }
      });
    },
    handleReset() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      resetDev({ ids: this.ids }).then(res => {
        if (res.data.code == 200) {
          this.$message.success('重置成功');
        }
      });
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    onLoad() {
      let params = {};
      this.loading = true;
      if (this.devQuery) {
        params['devQuery'] = this.devQuery;
      }
      if (this.devIp) {
        params['devIp'] = this.devIp;
      }
      params['devType'] = this.devType;
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      getList(params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        let records = data.records;
        this.tableData = records;
        this.loading = false;
      });
    },
    searchReset() {
      this.devQuery = '';
      this.devIp = '';
      this.devType = 7;
      this.search();
    },
    checkboxChangeEvent({ records }) {
      this.selectionList = records;
    },
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.onLoad();
    },
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.onLoad();
    }
  },
  computed: {
    ...mapGetters(['permission', 'colorName']),
    ids() {
      let ids = this.selectionList.map(v => v.id);
      return ids.join(',');
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '设备状态',
          field: 'onlineState',
          sortable: true,
          slots: { default: 'onlineState' },
          minWidth: 100,
          fixed: 'left'
        },
        {
          title: '设备编号',
          field: 'devCode',
          sortable: true,
          minWidth: 100,
          fixed: 'left'
        },
        {
          title: '设备名称',
          field: 'devName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '设备序列号',
          field: 'devSn',
          sortable: true,
          minWidth: 140
        },
        {
          title: '设备IP',
          field: 'devIp',
          sortable: true,
          minWidth: 100
        },
        {
          title: '设备端口',
          field: 'devPort',
          sortable: true,
          minWidth: 100,
          visible: false
        },
        {
          title: '设备当前时间戳',
          field: 'devCurrTime',
          sortable: true,
          minWidth: 150
        },
        {
          title: '门区编号',
          field: 'doorAreaCode',
          sortable: true,
          minWidth: 100,
          visible: false
        },
        {
          title: '门区名称',
          field: 'doorAreaName',
          sortable: true,
          minWidth: 140
        },
        {
          title: '设备密码',
          field: 'devPwd',
          sortable: true,
          minWidth: 100
        },
        {
          title: '设备当前注册人员数量',
          field: 'authCount',
          sortable: true,
          minWidth: 180,
          visible: this.devType != 7 ? true : false
        },
        {
          title: '设备当前注册照片数量',
          field: 'authUploadCount',
          sortable: true,
          minWidth: 180,
          visible: this.devType != 7 ? true : false
        },

        {
          title: '设备版本号',
          field: 'version',
          sortable: true,
          minWidth: 150,
          visible: false
        },
        {
          title: '进出方向',
          field: 'direction',
          sortable: true,
          minWidth: 100
        },
        {
          title: '是否启用',
          field: 'devState',
          minWidth: 100,
          sortable: true,
          slots: { default: 'devState' }
        },
        {
          title: '所属区域',
          field: 'areaName',
          minWidth: 100,
          sortable: true
        },
        {
          title: '通行策略',
          field: 'strategyName',
          sortable: true,
          minWidth: 100,
          visible: this.activeDevIndex == 7 ? true : false
        }
      ];
    }
  }
};
</script>
