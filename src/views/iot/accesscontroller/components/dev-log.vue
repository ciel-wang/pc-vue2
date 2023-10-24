<template>
  <el-dialog title="设备日志" append-to-body top="5vh" :visible.sync="boxShow" width="70%">
    <div style="margin: 10px 0 8px;">
      <el-input
        size="small"
        @keyup.enter.native="search"
        v-model="devQuery"
        style="width: 160px;margin-right: 10px;"
        placeholder="请输入设备编号/名称"></el-input>
      <el-select
        size="small"
        clearable
        v-model="commandType"
        style="width: 160px;margin-right: 10px;"
        placeholder="请选择命令类型">
        <el-option
          v-for="item in commandTypeDict"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select
        size="small"
        clearable
        v-model="executeState"
        style="width: 160px;margin-right: 10px;"
        placeholder="请选择执行状态">
        <el-option
          v-for="item in executeStateDict"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select
        size="small"
        clearable
        v-model="devExecuteState"
        style="width: 160px;margin-right: 10px;"
        placeholder="请选择设备返回状态">
        <el-option
          v-for="item in devExecuteStateDict"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select v-model="devType" placeholder="请选择设备类型" size="small" style="width: 160px;margin-right: 10px;">
        <el-option
          v-for="item in devTypeDic"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-search"
        @click="search">搜索</el-button>
      <el-button
        type="default"
        size="small"
        icon="el-icon-refresh"
        @click="searchReset">重置</el-button>
    </div>
    <vxe-grid
      border
      resizable
      :height="tableHeight"
      ref="xGrid"
      size="mini"
      align="center"
      :highlight="true"
      :columns="option"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="devlogData"
      :export-config="{}">
        <template #executeState="{row}">
          <el-tag effect="dark" size="mini" type="warning" v-if="row.executeState == '未执行'" >
            {{ row.executeState }}</el-tag>
          <el-tag effect="dark" size="mini" v-if="row.executeState == '执行成功'" >
            {{ row.executeState }}</el-tag>
          <el-tag effect="dark" size="mini" type="danger" v-if="row.executeState == '执行失败'">
            {{ row.executeState }}</el-tag>
        </template>
        <template #devExecuteState="{row}">
          <el-tag effect="dark" size="mini" type="warning" v-if="row.devExecuteState == '未执行'">
            {{ row.devExecuteState }}</el-tag>
          <el-tag effect="dark" size="mini" v-if="row.devExecuteState == '执行成功'">
            {{ row.devExecuteState }}</el-tag>
          <el-tag effect="dark" size="mini" type="danger" v-if="row.devExecuteState == '执行失败'" >
            {{ row.devExecuteState }}</el-tag>
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
          :hide-on-single-page="false">
        </el-pagination>
      </div>
    </el-dialog>
</template>

<script>
  import {devcommandList} from "@/api/iot/access/ic.js"
  export default{
    data(){
      return{
        boxShow:false,
        form:{},
        devlogData:[],
        loading:false,
        page: {
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        devQuery:'',
        commandType:"",
        commandTypeDict:[],
        executeState:"",
        executeStateDict:[
          {value:'0',label:'未执行'},
          {value:'1',label:'执行成功'},
          {value:'2',label:'执行失败'},
        ],
        devExecuteStateDict:[
          {value:'0',label:'未执行'},
          {value:'1',label:'执行成功'},
          {value:'2',label:'执行失败'},
        ],
        devExecuteState:"",
        tableHeight:'',
        devTypeDic:[
          {value:2,label:"IOT-Y"},{value:7,label:"IOT-H"},{value:1,label:'IOT-W'}
        ],
        devType:7,
      }
    },
    mounted() {
      this.tableHeight = window.innerHeight-270;
      this.onLoad();
    },
    watch:{
      devType:{
          handler(v){
            if (v == 1) {
              this.commandTypeDict = [
                { value: 'CARD_SCAN_NETWORK_AUTO_ADD_DEV', label: '添加设备' },
                { value: 'CARD_READ_TIME', label: '读取设备时间' },
                { value: 'CARD_SETIP', label: '设置IP' },
                { value: 'CARD_CLEAN_AUTH', label: '清空设备权限' },
                { value: 'CARD_SET_DOOR', label: '门区设置' },
                { value: 'CARD_AUTO_SEARCH', label: '搜索设备' },
                { value: 'CARD_SYNC_TIME', label: '同步时间' },
                { value: 'CARD_REMOTE_OPENDOOR', label: '远程开门' },
                { value: 'CARD_OPENDOOR_ONLINE_CTRL', label: '在线控制开门' },
                { value: 'CARD_OPENDOOR_OFFLINE_CTRL', label: '离线控制开门' },
                { value: 'CARD_DOWN_TIMESTEP', label: '下载时段' },
                { value: 'CARD_CLEAN_TIMESTEP', label: '清空时段' },
                { value: 'CARD_CTRL_TASK',label: '控制器定时任务'},
                { value: 'CARD_CLEAN_CTRL_TASK',label: '控制器清空首卡定时任务'},
                { value: 'CARD_SET_SERVER_IP',label: '设置控制器服务器Ip'}
              ];
            } else {
              this.commandTypeDict = [
                { value: 'FACE_SET_PWD', label: '设置密码' },
                { value: 'FACE_SET_TIME', label: '设置时间' },
                { value: 'FACE_DEV_RESTART', label: '设备重启' },
                { value: 'FACE_DEV_RESET', label: '设备重置' },
                { value: 'FACE_SET_CFG', label: '设置参数' },
                { value: 'FACE_REMOTE_OPENDOOR', label: '远程开门' },
                { value: 'FACE_SET_HEARTBEAT', label: '设置心跳地址' },
                { value: 'FACE_SET_IDENTIFY', label: '设置回调地址' },

                { value: '7FACE_GET_DEV_INFO', label: '获取设备' },
                { value: '7FACE_SET_NET_PARAMS', label: '设置网络参数' },
                { value: '7FACE_SET_SUBSCRIBE_DATA', label: '订阅数据' },
                { value: '7FACE_SET_DEV_PASSWORD', label: '设置密码' },
                { value: '7FACE_RESTART_DEV', label: '设备重启' },
                { value: '7FACE_DOWN_STRATEGY', label: '下载策略' },
                { value: '7FACE_REMOVE_STRATEGY', label: '删除策略' },
                { value: '7FACE_UNBIND_EMP_STRATEGY', label: '解绑策略' },
                { value: '7FACE_BIND_EMP_STRATEGY', label: '绑定策略' },
                { value: '7FACE_BIND_SET_AUDIO_NO_AUTH', label: '设置错误语音'}
              ];
            }
          },
        deep:true,
        immediate:true
      }
    },
    methods:{
      openDialog(v){
        this.boxShow = true;
        if(v == 1){
          this.devType = 1
        }else{
          this.devType = 7
        }
        this.search();
      },
      search(){
        this.page.currentPage = 1
        this.onLoad();
      },
      searchReset(){
        this.devQuery = "";
        this.commandType = "";
        this.executeState = "";
        this.devExecuteState = "";
        this.devType = 7
        this.search();
      },
      onLoad(){
        this.loading = true;
        let params = {};
        params["current"] = this.page.currentPage;
        params["size"] = this.page.pageSize;
        params["devType"] = this.devType;
        if(this.devQuery){
          params["devQuery"] = this.devQuery.trim();
        }
        if(this.commandType){
          params["commandType"] = this.commandType;
        }
        if(this.executeState){
          params["executeState"] = this.executeState;
        }
        if(this.devExecuteState){
          params["devExecuteState"] = this.devExecuteState;
        }
        devcommandList(params).then(res => {
          if(res.data.code == 200){
            this.loading = false;
            let data = res.data.data;
            this.page.total = data.total;
            data.records.forEach(v => {
              if(v.executeState == 0){
                v.executeState = "未执行"
              }
              if(v.executeState == 1){
                v.executeState = "执行成功"
              }
              if(v.executeState == 2){
                v.executeState = "执行失败"
              }
              if(v.devExecuteState == 0){
                v.devExecuteState = "未执行"
              }
              if(v.devExecuteState == 1){
                v.devExecuteState = "执行成功"
              }
              if(v.devExecuteState == 2){
                v.devExecuteState = "执行失败"
              }
            })
            this.devlogData = data.records;
          }
        })
      },
      handleSizeChange(val) {
        this.page.currentPage = 1;
        this.page.pageSize = val;
        this.onLoad();
      },
      handleCurrentChange(val) {
        this.page.currentPage = val;
        this.onLoad();
      },
    },
    computed:{
      option(){
        return[
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:'设备编号',
            field:'devCode',
            sortable:true,
            fixed:"left",
            minWidth:100,
          },
          {
            title:'设备名称',
            field:'devName',
            sortable:true,
            fixed:"left",
            minWidth:100,
          },
          {
            title:'命令类型',
            field:'commandType',
            sortable:true,
            minWidth:100,
            formatter:({cellValue}) => {
              let item = this.commandTypeDict.find(item => item.value === cellValue)
              return item ? item.label : ''
            }
          },
          {
            title:'创建时间',
            field:'createTime',
            sortable:true,
            minWidth:140,
          },
          {
            title:'执行时间',
            field:'executeTime',
            sortable:true,
            minWidth:140,
          },
          {
            title:'执行状态',
            field:'executeState',
            sortable:true,
            slot:true,
            minWidth:100,
          },
          {
            title:'设备返回状态',
            field:'devExecuteState',
            sortable:true,
            slot:true,
            minWidth:120,
          },
          {
            title:'设备返回结果',
            field:'devExecuteRes',
            sortable:true,
            minWidth:300,
          },
          {
            title:'异常结果',
            field:'errText',
            sortable:true,
            minWidth:100,
          },
        ]
      }
    }
  }
</script>

