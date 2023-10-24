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
        <el-button type="primary" size="small" v-if="permission.access_controller_equipment_ic_auto_search_btn" @click="handleAutoSearch">自动搜索</el-button>
        <el-button type="primary" size="small" v-if="permission.access_controller_equipment_ic_add_btn" @click="handleAddIcCard">手动添加</el-button>

        <el-button
          type="primary" size="small"
          icon="el-icon-edit"
          v-if="permission.access_controller_equipment_ic_edit_btn"
          @click="handleUpdateRow">编辑</el-button>
        <el-button
          type="danger" size="small"
          icon="el-icon-delete"
          v-if="permission.access_controller_equipment_ic_del_btn"
          @click="handleDeleteIcCard">删除</el-button>
        <el-button
          type="primary" size="small"
          v-if="permission.access_controller_equipment_ic_door_area_btn"
          @click="handleSetEquipmentDoor">门区设置</el-button>
        <!-- <el-button
          type="primary" size="small"
          v-if="permission.access_controller_equipment_ic_read_time_btn"
          @click="handleReadTime">读取时间</el-button> -->
        <el-button
          type="primary" size="small"
          v-if="permission.access_controller_equipment_ic_sync_time_btn"
          @click="handleSynchronizeTime">同步时间</el-button>
        <el-button
          type="primary" size="small"
          v-if="permission.access_controller_equipment_ic_setip_btn" @click="handleSetEquipmentIp">设置控制器IP</el-button>
        <el-button
          type="primary" size="small"
          v-if="permission.access_controller_equipment_ic_setip_btn" @click="handleSetServiceIp">设置服务器IP</el-button>
        <el-button
          type="primary" size="small"
          icon="el-icon-download"
          v-if="permission.access_controller_equipment_ic_export_btn"
          @click="handleExport">导出</el-button>

        <el-dropdown @command="handleCommand" style="margin-left: 10px;">
          <el-button size="small" type="primary">
            更多
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="timestepStrategy" v-if="permission.ic_timestepStrategy_btn">时段策略</el-dropdown-item>
            <el-dropdown-item command="downloadStrategyBtn" v-if="permission.ic_downtimestepStrategy_btn">策略下载</el-dropdown-item>
            <el-dropdown-item command="cleanTimeStepAuthBtn" v-if="permission.ic_cleartimestepAuth_btn">清空时段权限</el-dropdown-item>
            <el-dropdown-item command="cleanAuthBtn" v-if="permission.access_controller_equipment_ic_clean_auth_btn">清空设备权限</el-dropdown-item>
            <el-dropdown-item command="devLog" v-if="permission.access_controller_equipment_ic_devlog_btn">设备日志</el-dropdown-item>
            <el-dropdown-item command="offline" v-if="permission.ic_offline_btn">离线控制</el-dropdown-item>
            <el-dropdown-item command="online" v-if="permission.ic_online_btn">在线控制</el-dropdown-item>
            <el-dropdown-item command="timedTask" v-if="permission.ic_addtimedtask_btn">定时任务</el-dropdown-item>
            <el-dropdown-item command="clearTimedTask" v-if="permission.ic_cleartimedtask_btn">清除定时任务</el-dropdown-item>
            <el-dropdown-item command="repairUpdateData" v-if="permission.ic_repairUpdateData_btn">重新上报</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      <template #onlineState="{row}">
        <el-tag effect="dark" size="mini" type="primary" v-if="row.onlineState == true">在线</el-tag>
        <el-tag effect="dark" size="mini" type="info" v-else>离线</el-tag>
      </template>

      <template #devState="{row}">
        <i class="icon-xuanzhong" v-if="row.devState" :style="{color: colorName}"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>

      <template #entityId="{row}">
        <el-tag
          v-for="(item,i) in row.entityId && row.entityId.split(',')" :key="i"
          size="mini" type="primary" class="u-m-r-4 u-m-b-4">{{ item }}</el-tag>
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

    <el-dialog :title="title" append-to-body :visible.sync="updateDataRowBox" width="850px">
      <avue-form ref="equipmentRef" :option="updateDataRowOption" v-model="updateDataRow" @submit="updateEquipmentData">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="updateDataRowBox = false" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>

    <el-dialog title="门区设置" append-to-body :visible.sync="equipmentDoorBox" width="1200px">
      <avue-crud :data="data" :option="equipmentDoorOption" v-model="user">
        <template slot="name1" slot-scope="scope">
          <el-input v-model="name['name_' + scope.row.index]" placeholder="请输入名称" maxlength="10"></el-input>
        </template>
        <template slot="position1" slot-scope="scope">
          <el-input v-model="position['position_' + scope.row.index]" placeholder="请输入安装位置" maxlength="10"></el-input>
        </template>
        <template slot="keepTime1" slot-scope="scope">
          <el-select v-model="keepTime['keepTime_' + scope.row.index]" placeholder="请选择">
            <el-option v-for="item in keepTimeOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
        <template slot="isStart1" slot-scope="scope">
          <el-checkbox v-model="isStart['isStart_' + scope.row.index]"></el-checkbox>
        </template>
        <template slot="attendance1" slot-scope="scope">
          <el-checkbox v-model="attendance['attendance_' + scope.row.index]"></el-checkbox>
        </template>
        <template slot="direction1" slot-scope="scope">
          <el-radio-group v-model="direction['direction_' + scope.row.index]" size="mini">
            <el-radio-button label="进"></el-radio-button>
            <el-radio-button label="出"></el-radio-button>
          </el-radio-group>
        </template>
        <template slot="outType1" slot-scope="scope">
          <el-radio-group v-model="outType['outType_' + scope.row.index]" size="mini">
            <el-radio-button label="常开"></el-radio-button>
            <el-radio-button label="常闭"></el-radio-button>
            <el-radio-button label="自动"></el-radio-button>
          </el-radio-group>
        </template>
      </avue-crud>
      <div style="text-align: center;">
        <el-button type="primary" icon="el-icon-check" size="small" @click="handleDoorData">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="重新上报"
      append-to-body
      :visible.sync="repairUpdateShow"
      width="450px"
      :wrapperClosable="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form
        ref="repairUpdateRef"
        :option="repairUpdateOption"
        v-model="repairUpdateForm"
        @submit="repairUpdateSubmit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="repairUpdateShow = false" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>

    <dev-log ref="devlogref"></dev-log>
    <timestepStrategy ref="timestepStrategyRef"></timestepStrategy>
    <timestepStrategy ref="timestepStrategyRef"></timestepStrategy>
    <download-strategy ref="downloadStrategyRef" @refeshPage="searchR"></download-strategy>
    <timed-task ref="timedTaskRef"></timed-task>
  </basic-container>
</template>

<script>
import {
  autoSearch,
  getList,
  readTime,
  synchronizeTime,
  getIcCardById,
  updateIcCard,
  removeDevByIds,
  setEquipmentIp,setServerIp,
  setDoorArea,
  getDoorArea,
  cleanEquitmentAuth,
  cleanIcTimestepAuth,cleanTimedTask, sendCtrlmode, sendRepairData
} from '@/api/iot/access/ic';
import devLog from '../components/dev-log.vue';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getAreaTree } from '@/api/iot/access/area';
import timestepStrategy from './timestep-strategy.vue'
import downloadStrategy from './download-strategy.vue'
import timedTask from './timed-task.vue'

export default {
  components: { devLog, timestepStrategy, downloadStrategy, timedTask },
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
      updateDataRow: {},
      updateDataRowBox: false,
      equipmentDoorBox: false,
      data: [{ index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }],
      user: {},
      keepTimeOption: [{ label: 0, value: 0 }, { label: 1, value: 1 }, { label: 3, value: 3 }, { label: 5, value: 5 }, { label: 10, value: 10 }],
      outType: { outType_1: '自动', outType_2: '自动', outType_3: '自动', outType_4: '自动' },
      direction: { direction_1: '', direction_2: '', direction_3: '', direction_4: '' },
      attendance: { attendance_1: false, attendance_2: false, attendance_3: false, attendance_4: false },
      isStart: { isStart_1: false, isStart_2: false, isStart_3: false, isStart_4: false },
      keepTime: { keepTime_1: 0, keepTime_2: 0, keepTime_3: 0, keepTime_4: 0 },
      name: { name_1: '', name_2: '', name_3: '', name_4: '' },
      position: { position_1: '', position_2: '', position_3: '', position_4: '' },
      treeData: [],
      title: '添加',
      websock:null,
      intervalIndex:null,
      repairUpdateShow:false,
      repairUpdateForm:{}
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 254;
    this.search();
    getAreaTree().then(r => {
      this.treeData = r.data.data;
    });
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
    repairUpdateSubmit(form,done){
      let { start, end } = this.repairUpdateForm;
      if(end <= start) {
        this.$message.warning("结束索引号需大于开始索引号");
        done();
        return;
      }
      let { devSn } = this.selectionList[0];
      sendRepairData({ devSn, start, end}).then(r => {
        done();
        if(r.data.code == 200){
            this.$message.success(r.data.msg);
            this.$refs.repairUpdateRef.resetForm();
            this.$refs.repairUpdateRef.clearValidate();
            this.repairUpdateShow = false;
        }else{
            this.$message.error(r.data.msg);
        }
      }).catch(() => done());
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
      this.intervalIndex = setInterval(() => {
        if ($this.websock.readyState != $this.websock.OPEN) {
          if (this.intervalIndex > 0) {
            clearInterval(this.intervalIndex);
          }
        } else {
          this.websock.send(JSON.stringify({ type: 1, token: getToken() }));
        }
      }, 3000);
    },
    websockMessage(e) {
      try{
        var jsonData = JSON.parse(e.data);
        if(jsonData.type != 1) return;
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
    handleReadTime() {
      readTime({ devSn: '' }).then(res => {
        this.$message({
          message: '设备时间读取成功',
          type: 'success'
        });
        this.search();
      });
    },
    handleSynchronizeTime() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      synchronizeTime({ devSn: this.selectionList[0].devSn }).then(res => {
        this.$message({
          message: '设备时间读取成功',
          type: 'success'
        });
        this.search();
      });
    },
    handleSetEquipmentIp() {
      if (this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
      let devSn = this.selectionList.map(v => v.devSn).join(',');
      setEquipmentIp({ devSn }).then(res => {
        this.$message({
          message: '设置成功，请自动搜索',
          type: 'success'
        });
        this.search();
      });
    },
    handleSetServiceIp(){
      if (this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
      let devSn = this.selectionList.map(v => v.devSn).join(',');
      setServerIp({ devSn }).then(r => {
        if(r.data.code == 200){
          this.$message.success(r.data.msg);
          this.onLoad(this.page);
        }else{
          this.$message.error(r.data.msg)
        }
      })
    },
    handleAutoSearch() {
      autoSearch().then(res => {
        this.$message({
          message: '搜索设备已完成',
          type: 'success'
        });
        this.search();
      });
    },
    handleAddIcCard() {
      this.title = '添加';
      this.updateDataRowBox = true;
      this.$nextTick(() => {
        this.$refs.equipmentRef.resetForm();
      });
    },
    updateEquipmentData(cur, done) {
      this.$refs.equipmentRef.validate((vaild, done) => {
        if (vaild) {
          let devAreaId = this.updateDataRow.devAreaId;
          if (!devAreaId || !devAreaId.startsWith('A')) {
            this.$message.error('请选择区域');
            this.updateDataRow.devAreaId = '';
            done();
            return;
          } else {
            this.updateDataRow.devAreaId = devAreaId.split('-')[1];
          }
          if(this.title === '添加') delete this.updateDataRow.id;
          updateIcCard(this.updateDataRow).then(res => {
            this.updateDataRowBox = false;
            this.search();
            done();
          }).catch(() => done());
        } else {
          done();
        }
      });
    },
    handleUpdateRow() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      var row = this.selectionList[0];
      getIcCardById(row.id).then(res => {
        let data = res.data.data;
        this.updateDataRow = data;
        this.updateDataRow.isAutoAuth = this.updateDataRow.isAutoAuth == true ? 1 : 0;
        this.updateDataRow.devAreaId = data.ancestors;
      });
      this.title = '编辑';
      this.updateDataRowBox = true;
    },
    handleDeleteIcCard() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeDevByIds(this.ids);
      }).then(() => {
        this.search();
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      });
    },
    handleSetEquipmentDoor() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      getDoorArea({ devSn: this.selectionList[0].devSn }).then(res => {
        let data = res.data.data;
        this.attendance.attendance_1 = data.attendance_1;
        this.attendance.attendance_2 = data.attendance_2;
        this.attendance.attendance_3 = data.attendance_3;
        this.attendance.attendance_4 = data.attendance_4;

        this.name.name_1 = data.name_1;
        this.name.name_2 = data.name_2;
        this.name.name_3 = data.name_3;
        this.name.name_4 = data.name_4;

        this.isStart.isStart_1 = data.isStart_1;
        this.isStart.isStart_2 = data.isStart_2;
        this.isStart.isStart_3 = data.isStart_3;
        this.isStart.isStart_4 = data.isStart_4;

        this.position.position_1 = data.position_1;
        this.position.position_2 = data.position_2;
        this.position.position_3 = data.position_3;
        this.position.position_4 = data.position_4;

        this.outType.outType_1 = data.outType_1;
        this.outType.outType_2 = data.outType_2;
        this.outType.outType_3 = data.outType_3;
        this.outType.outType_4 = data.outType_4;

        this.direction.direction_1 = data.direction_1;
        this.direction.direction_2 = data.direction_2;
        this.direction.direction_3 = data.direction_3;
        this.direction.direction_4 = data.direction_4;

        this.keepTime.keepTime_1 = data.keepTime_1;
        this.keepTime.keepTime_2 = data.keepTime_2;
        this.keepTime.keepTime_3 = data.keepTime_3;
        this.keepTime.keepTime_4 = data.keepTime_4;
      });
      this.equipmentDoorBox = true;
    },
    handleDoorData() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择1条数据');
        return;
      }
      var param = {
        ...this.outType,
        ...this.direction,
        ...this.attendance,
        ...this.isStart,
        ...this.keepTime,
        ...this.name,
        ...this.position,
        devSn: this.selectionList[0].devSn
      };
      setDoorArea(param).then(res => {
        this.$message({
          message: '设置成功，请自动搜索',
          type: 'success'
        });
        this.search();
        this.equipmentDoorBox = false;
        this.cleanDoorAreaData();
      });
    },
    cleanDoorAreaData() {
      for (let i in this.direction) {
        this.direction[i] = '';
      }
      for (let i in this.isStart) {
        this.isStart[i] = false;
      }
      for (let i in this.outType) {
        this.outType[i] = '';
      }
      for (let i in this.attendance) {
        this.attendance[i] = false;
      }
      for (let i in this.name) {
        this.name[i] = '';
      }
      for (let i in this.keepTime) {
        this.keepTime[i] = 0;
      }
    },
    handleCommand(v) {
      if (v == 'devLog') {
        this.$refs.devlogref.openDialog('1');
      }
      if (v == 'cleanAuthBtn') {
        this.handleCleanEquipmentAuth();
      }
      if(v === 'timestepStrategy'){
        this.$refs.timestepStrategyRef.openDialog();
      }
      if(v == 'downloadStrategyBtn'){
          if(this.selectionList.length == 0) return this.$message.warning('请选择至少一条数据');
        this.$refs.downloadStrategyRef.openDialog('IC',{devIds:this.ids})
      }
      if (v == 'cleanTimeStepAuthBtn') {
        if(this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
        cleanIcTimestepAuth({devIds:this.ids.split(',')}).then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.onLoad(this.page);
          }else{
            this.$message.error(r.data.msg)
          }
        })
      }
      if(v === 'timedTask'){
        if(this.selectionList.length != 1) return this.$message.warning('请选择一条数据');
        this.$refs.timedTaskRef.openDialog(this.selectionList[0].id);
      }
      if(v === "clearTimedTask"){
        if(this.selectionList.length == 0) return this.$message.warning('请选择至少一条数据');
        cleanTimedTask({ devIds:this.ids.split(',') }).then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
          }else{
            this.$message.error(r.data.msg);
          }
        })
      }
      if (v == 'offline') {
        this.handleCtrlmode(v)
      }
      if (v == 'online') {
        this.handleCtrlmode(v)
      }
      if(v === 'repairUpdateData'){
        if(this.selectionList.length != 1) return this.$message.warning('请选择一条数据');
        this.repairUpdateShow = true;
        this.$nextTick(() => {
          this.$refs.repairUpdateRef.resetForm();
          this.$refs.repairUpdateRef.clearValidate();
        })
      }
    },
    handleCtrlmode(type){
      if (this.selectionList.length !== 1) return this.$message.warning('请选择1条数据');
      let params = {
        id:this.selectionList[0].id,
        ctrlMode:type
      }
      sendCtrlmode(params).then(r => {
        if(r.data.code === 200){
          this.$message.success(r.data.msg);
          this.onLoad(this.page);
        }else{
          this.$message.error(r.data.msg)
        }
      })
    },
    handleCleanEquipmentAuth() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      cleanEquitmentAuth({ devSn: this.selectionList[0].devSn }).then(res => {
        this.$message({
          message: '设备权限清空成功',
          type: 'success'
        });
        this.search();
      });
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    onLoad() {
      this.loading = true;
      let params = {};
      if (this.devQuery) {
        params['devQuery'] = this.devQuery;
      }
      if (this.devIp) {
        params['devIp'] = this.devIp;
      }
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      getList(params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          v.onlineState = v.onLineState;
        })
        this.tableData = data.records;
        this.loading = false;
      });
    },
    handleExport() {
      this.$confirm('是否导出IC设备管理?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = '';
        if (this.selectionList.length > 0) {
          this.selectionList.forEach(v => {
            ids = ids + ',' + v.uid;
          });
        }
        ids = ids.substring(1, ids.length);
        window.open(`/api/iot-basic/access/ic/export-ic?${this.website.tokenHeader}=${getToken()}&name=${this.search.name}&ip=${this.search.ip}&ids=${ids}`);
      });
    },
    searchReset() {
      this.devQuery = '';
      this.devIp = '';
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
    ...mapGetters(['permission','colorName']),
    ids() {
      let ids = this.selectionList.map(v => v.id);
      return ids.join(',');
    },
    equipmentDoorOption() {
      return {
        labelWidth: 130,
        menuPosition: 'right',
        menu: false,
        addBtn: false,
        refreshBtn: false,
        searchBtn: false,
        columnBtn: false,
        column: [
          {
            label: '编号',
            prop: 'index',
            minWidth: 40,
            span: 6
          },
          {
            label: '门区名称',
            prop: 'name1',
            minWidth: 130,
            slot: true,
            span: 6
          },
          {
            label: '安装位置',
            prop: 'position1',
            minWidth: 130,
            slot: true,
            span: 6
          },
          {
            label: '启用',
            prop: 'isStart1',
            minWidth: 50,
            slot: true,
            span: 3
          },
          {
            label: '考勤',
            slot: true,
            minWidth: 50,
            prop: 'attendance1',
            span: 3
          },
          {
            label: '进出方向',
            slot: true,
            prop: 'direction1',
            span: 6
          },
          {
            label: '继电器输出类型',
            slot: true,
            prop: 'outType1',
            minWidth: 120,
            span: 8
          },
          {
            label: '开锁保持时间(秒)',
            slot: true,
            prop: 'keepTime1',
            span: 6
          }
        ]
      };
    },
    updateDataRowOption() {
      return {
        labelWidth: 100,
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '设备编号',
            prop: 'devCode',
            rules: [{
              required: true,
              message: '请输入设备编号',
              trigger: 'blur'
            }],
            maxlength: 20
          },
          {
            label: '服务器IP',
            prop: 'serverIp',
            maxlength: 20
          },
          {
            label: '设备名称',
            prop: 'devName',
            rules: [{
              required: true,
              message: '请输入设备名称',
              trigger: 'blur'
            }],
            maxlength: 20
          },
          {
            label: '服务器端口',
            prop: 'serverPort',
            type: 'number',
            maxlength: 10
          },
          {
            label: '设备端口',
            prop: 'devPort',
            type: 'number',
            rules: [{
              required: true,
              message: '请输入设备端口',
              trigger: 'blur'
            }],
            maxlength: 10
          },
          {
            label: '子网掩码',
            prop: 'devSubnetMask',
            rules: [{
              required: true,
              message: '请输入子网掩码',
              trigger: 'blur'
            }],
            maxlength: 20
          },
          {
            label: '设备IP',
            prop: 'devIp',
            rules: [{
              required: true,
              message: '请输入设备IP',
              trigger: 'blur'
            }],
            maxlength: 20
          },
          {
            label: '设备MAC',
            prop: 'devMac',
            maxlength: 20
          },
          {
            label: '设备网关',
            prop: 'devGateway',
            rules: [{
              required: true,
              message: '请输入设备网关:',
              trigger: 'blur'
            }],
            maxlength: 20
          },
          {
            label: '区域选择',
            prop: 'devAreaId',
            dicData: this.treeData,
            type: 'tree',
            props: {
              value: 'valueStr'
            },
            rules: [{
              required: true,
              message: '请选择区域',
              trigger: 'blur'
            }]
          },
          {
            label: '设备序列号',
            prop: 'devSn',
            rules: [{
              required: true,
              message: '请输入设备序列号',
              trigger: 'blur'
            }],
            maxlength: 20
          },
          {
            label: '读卡类型',
            prop: 'devReadCardType',
            rules: [{
              required: true,
              message: '请选择读卡类型',
              trigger: 'blur'
            }],
            type:'select',
            dicData:[
              {value:1,label:'物理卡号'},{value:2,label:'卡序列号'}
            ]
          },
          {
            label:"是否启用",
            prop:'devState',
            type:'radio',
            dicData:[
              {value:1,label:"是"},
              {value:0,label:"否"}
            ],
          },
          {
            label: '备注',
            prop: 'remarks',
            maxlength: 99
          }
        ]
      };
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '设备状态',
          field: 'onlineState',
          sortable: true,
          minWidth: 100,
          fixed: 'left',
          slots: { default: 'onlineState' }
        },
        {
          title: '设备编号',
          field: 'devCode',
          sortable: true,
          minWidth: 100,
          fixed: 'left'
        },
        {
          title: '所属区域',
          field: 'areaName',
          minWidth: 100,
          sortable: true
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
          minWidth: 120
        },
        {
          title: '设备IP',
          field: 'devIp',
          sortable: true,
          minWidth: 100
        },
        {
          title: '子网掩码',
          field: 'devSubnetMask',
          sortable: true,
          minWidth: 100,
          visible: false
        },
        {
          title: '设备网关',
          field: 'devGateway',
          sortable: true,
          visible: false,
          minWidth: 100
        },
        {
          title: '设备MAC',
          field: 'devMac',
          sortable: true,
          minWidth: 140,
          visible: false
        },
        {
          title: '设备端口',
          field: 'devPort',
          sortable: true,
          minWidth: 100,
          visible: false
        },
        {
          title: '设备权限数',
          field: 'authCount',
          sortable: true,
          minWidth: 120
        },
        {
          title: '上传记录数',
          field: 'authUploadCount',
          sortable: true,
          minWidth: 120
        },
        {
          title: '设备上次在线时间',
          field: 'devCurrTime',
          sortable: true,
          minWidth: 150
        },
        {
          title: '是否启用',
          field: 'devState',
          sortable: true,
          minWidth: 100,
          slots:{default:'devState'}
        },
        {
          title: '策略查看',
          field: 'entityId',
          minWidth: 100,
          sortable: true,
          slots:{default:'entityId'}
        },
        {
          title: '服务器IP',
          field: 'serverIp',
          sortable: true,
          visible: false,
          minWidth: 150
        },
        {
          title: '服务器端口',
          field: 'serverPort',
          sortable: true,
          visible: false,
          minWidth: 150
        },
        {
          title: '设备版本号',
          field: 'version',
          sortable: true,
          minWidth: 150,
          visible: false
        }
      ];
    },
    repairUpdateOption(){
      return{
        emptyBtn: false,
        submitText: '保存',
        column:[
          {
            label: '开始索引号',
            prop: 'start',
            type:"number",
            controls:false,
            precision:0,
            min:0,
            rules: [{
              required: true,
              message: '请输入开始索引号',
              trigger: 'blur'
            }],
            span:24
          },
          {
            label: '结束索引号',
            prop: 'end',
            type:"number",
            controls:false,
            precision:0,
            min:0,
            rules: [{
              required: true,
              message: '请输入结束索引号',
              trigger: 'blur'
            }],
            span:24
          }
        ]
      }
    }
  }
};
</script>
