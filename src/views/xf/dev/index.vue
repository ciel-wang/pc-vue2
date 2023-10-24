<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <seller-tree @click="onClick" ref="sellerTree"></seller-tree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div>
          <el-input
            style="width: 150px;margin-right: 10px;"
            size="small" clearable
            @keyup.enter.native="searchR"
            v-model.trim="devQuery"
            placeholder="请输入编号/名称"></el-input>
          <el-button type="primary" size="small" icon="el-icon-search" @click="searchR">搜索</el-button>
          <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
        </div>
        <vxe-grid
          border
          resizable
          auto-resize
          highlight-hover-row
          :height="tableHeight"
          ref="crud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="options"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
          :data="areaData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #toolbar_buttons>
            <xf-dev-add-or-update @refreshPage="searchR" type="1" icon="el-icon-plus" :sellerData="sellerData"></xf-dev-add-or-update>
            <xf-dev-add-or-update
              @refreshPage="searchR"
              ref="xfEditDevRef"
              type="2"
              :sellerData="sellerData"></xf-dev-add-or-update>
            <el-button
              type="primary"
              size="small"
              style="margin-left: 10px;"
              icon="el-icon-edit"
              v-if="permission.dev_edit_btn"
              @click="handleEdit">编辑</el-button>
            <el-button
              type="primary"
              size="small"
              v-if="permission.dev_time_step_btn"
              @click="handleSetMeal">餐段设置</el-button>
            <el-button
              type="primary"
              size="small"
              v-if="permission.dev_upload_information_btn"
              @click="handleDownPersonInfo">下载权限</el-button>
            <el-button
              type="danger"
              size="small"
              v-if="permission.dev_del_btn"
              @click="handleDelete">删 除</el-button>
            <el-button
              type="primary"
              size="small"
              style="margin-right: 10px;"
              v-if="permission.dev_export_btn"
              @click="handleExport">导出</el-button>
            <el-dropdown @command="handleCommand">
              <el-button size="small" type="primary">
                更多<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="dev_param" v-if="permission.dev_device_parameters_btn">设备参数</el-dropdown-item>
                <el-dropdown-item command="seller_param" v-if="permission.dev_consumption_parameters_btn">限额设置</el-dropdown-item>
                <el-dropdown-item command="unline_limit_param" v-if="permission.dev_offline_quota_btn">离线限额</el-dropdown-item>
                <el-dropdown-item command="event_select" v-if="permission.dev_event_query_btn">事件查询</el-dropdown-item>
                <el-dropdown-item command="auth_select" v-if="permission.dev_authority_query_btn">权限查询</el-dropdown-item>
                <el-dropdown-item command="dev_pre_event" v-if="permission.dev_pre_execute_event_btn">设备待执行事件</el-dropdown-item>
                <el-dropdown-item command="again_create_dev_event" v-if="permission.xfdev_again_create_dev_event">设备权限迁移</el-dropdown-item>
                <el-dropdown-item command="dev_readcard_cfg">设备读卡方式</el-dropdown-item>
                <el-dropdown-item command="dev_upgrade">设备升级</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
          <template #onLineState="{row}">
            <el-tag effect="dark" size="mini" type="info" v-if="row.onLineState == false">离线</el-tag>
            <el-tag effect="dark" size="mini" type="primary" v-if="row.onLineState == true">在线</el-tag>
          </template>
          <template #devState="{row}">
            <i class="icon-xuanzhong" v-if="row.devState" :style="{color: colorName}"></i>
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
            :hide-on-single-page="false">
          </el-pagination>
        </div>
        <xf-dev-down-person-category ref="xfDevDownPersonCategoryRef"></xf-dev-down-person-category>
        <XfFaceSetPar ref="xfFaceSetParRef"></XfFaceSetPar>
        <XfFaceSetParSeller ref="xfFaceSetParSellerRef"></XfFaceSetParSeller>
        <xf-dev-down-person-info ref="devDownPersonInfoRef"></xf-dev-down-person-info>
        <xf-dev-set-meal ref="xfDevSetMealRef"></xf-dev-set-meal>
        <xf-event ref="xfEventRef"></xf-event>
        <xf-emp-auth ref="xfEmpAuthRef"></xf-emp-auth>
        <xf-dev-event ref="xfDevEventRef"></xf-dev-event>
        <xf-dev-again-create-event ref="xfDevAgainCreateEventRef"></xf-dev-again-create-event>
        <dev-no-add-list ref="devNoAddListRef"></dev-no-add-list>
        <devReadcardCfg ref="devReadcardCfgRef"></devReadcardCfg>
        <devUpgrade ref="devUpgradeRef"></devUpgrade>
      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
import { getList, removeXfDev, xfDevExport } from '@/api/xf/xfdev';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import SellerTree from '@/components/sellertree/index';
import XfDevAddOrUpdate from './dev-add-update';
import XfDevSetMeal from './dev-set-meal';
import XfFaceSetPar from './dev-face-setpar';
import XfFaceSetParSeller from './dev-face-setpar-seller';
import XfDevDownPersonInfo from './dev-down-person-info';
import xfDevDownPersonCategory from './dev-down-person-category';
import xfDevAgainCreateEvent from './dev-again-create-event';
import xfDevEvent from './dev-event';
import XfEvent from './xfevent.vue';
import XfEmpAuth from './xfempauth.vue';
import DevNoAddList from './dev-no-add';
import {sellerTree} from '@/api/xf/seller';
import devReadcardCfg from './dev-readcard-cfg.vue'
import devUpgrade from './dev-upgrade.vue'

export default {
  components: {
    SellerTree,
    XfDevAddOrUpdate,
    XfDevSetMeal,
    XfFaceSetPar,
    XfFaceSetParSeller,
    XfDevDownPersonInfo,
    xfDevDownPersonCategory,
    xfDevAgainCreateEvent,
    XfEvent,
    XfEmpAuth,
    xfDevEvent,
    DevNoAddList,
    devReadcardCfg, devUpgrade
  },
  data() {
    return {
      intervalIndex: null,
      websock: null,
      areaData: [],
      ancestors: "",
      devQuery: '',
      selectionList: [],
      query: {},
      loading: false,
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      ztreeHeight: 0,
      tableHeight: 0,
      sellerData:[]
    };
  },
  computed: {
    ...mapGetters(['permission','colorName']),
    ids() {
      let ids = this.selectionList.map(v => v.devId);
      return ids.join(',');
    },
    devCodes() {
      let ids = [];
      this.areaData.forEach(ele => {
        if (ele.devType == 5) {
          ids.push(ele.devCode);
        }
      });
      return ids.join(',');
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '设备编号',
          field: 'devCode',
          sortable: true,
          fixed: "left",
          minWidth: 100,
        },
        {
          title: '设备名称',
          field: 'devName',
          sortable: true,
          minWidth: 100,
          fixed: "left",
        },
        {
          title: '设备状态',
          field: 'onLineState',
          sortable: true,
          slots: {default:"onLineState"},
          minWidth: 100,
        },
        {
          title: '设备当前时间',
          field: 'devCurrTime',
          sortable: true,
          minWidth: 130,
        },
        {
          title: '设备IP',
          field: 'devIp',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '远程服务器IP',
          field: 'serverIp',
          sortable: true,
          minWidth: 120,
          visible:false
        },
        {
          title: '服务器端口',
          field: 'serverPort',
          sortable: true,
          minWidth: 120,
          visible:false
        },
        {
          title: '版本号',
          field: 'version',
          sortable: true,
          minWidth: 100,
          visible:false
        },
        {
          title: '设备MAC',
          field: 'devMac',
          sortable: true,
          minWidth: 100,
          visible:false
        },
        {
          title: '设备SN',
          field: 'devSn',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '总人数',
          field: 'personCount',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '总照片数',
          field: 'faceCount',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '是否启用',
          field: 'devState',
          sortable: true,
          minWidth: 100,
          slots: {default:"devState"},
        },
        {
          title: '商户',
          field: 'sellerName',
          sortable: true,
          minWidth: 130,
        }
      ]
    }
  },
  mounted() {
    this.ztreeHeight = window.innerHeight - 146;
    this.tableHeight = window.innerHeight - 264;
    this.onLoad(this.page)
  },
  activated() {
    sellerTree().then(res => {
      this.sellerData = res.data.data;
    });
    this.websock = null;
    this.initWebSocket();
  },
  deactivated() {
    clearInterval(this.intervalIndex);
    this.websock.close();
    this.websock = null;
  },
  methods: {
    handleCommand(cmd) {
      if (cmd == 'dev_param') {
        if (this.selectionList.length === 0) return this.$message.warning('请选择一个设备');
        this.$refs.xfFaceSetParRef.openDialog(this.ids);
      } else if (cmd == 'seller_param') {
        if (this.selectionList.length === 0) return this.$message.warning('请选择一个设备');
        this.$refs.xfFaceSetParSellerRef.openDialog(this.ids);
      } else if (cmd == 'unline_limit_param') {
        if (this.selectionList.length == 0) return this.$message.warning('请选择一个设备');
        let ids = this.selectionList.map(v => v.devCode);
        this.$refs.xfDevDownPersonCategoryRef.openDialog(ids.join(','));
      } else if (cmd == 'event_select') {
        this.$refs.xfEventRef.openDialog();
      } else if (cmd == 'auth_select') {
        this.$refs.xfEmpAuthRef.openDialog();
      } else if (cmd == 'dev_pre_event') {
        this.$refs.xfDevEventRef.openDialog();
      } else if (cmd == 'again_create_dev_event') {
        if (this.selectionList.length != 1) return this.$message.warning('请选择一个设备');
        this.$refs.xfDevAgainCreateEventRef.openDialog(this.selectionList[0]);
      } else if (cmd == 'dev_no_add') {
        this.$refs.devNoAddListRef.openDialog();
      }else if(cmd == 'dev_readcard_cfg'){
        if(this.selectionList.length === 0) return this.$message.warning("请选择至少一条数据");
        this.$refs.devReadcardCfgRef.openDialog(this.ids);
      } else if(cmd === 'dev_upgrade'){
        if(this.selectionList.length === 0) return this.$message.warning("请选择至少一条数据");
        this.$refs.devUpgradeRef.openDialog(this.ids);
      }
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
      //WEBSOCKET链接成功后发生消息进行身份验证，不验证后面收不到消息
      this.intervalIndex = setInterval(() => {
        if (this.websock.readyState != this.websock.OPEN) {
          if (this.intervalIndex > 0) {
            clearInterval(this.intervalIndex);
          }
        } else {
          this.websock.send(JSON.stringify({ type: 10, devCodes: this.devCodes, token: getToken() }));
        }
      }, 1000);
    },
    websockMessage(e) {
      try{
        var jsonData = JSON.parse(e.data);
        if(jsonData.type != 10) return;
        var data = Array.isArray(jsonData.data) ? jsonData.data : [];
        this.areaData.forEach(v => {
          let item = data.find(f => v.devCode == f.devCode);
          v.onLineState = item ? item.online : false;
          let state = false;
          data.forEach(f => {
            if (v.devCode == f.devCode) {
              if (f.online == true) {
                state = true;
              }
            }
          });
          v.onLineState = state;
        });
        this.$forceUpdate();
      }catch(err){
        console.log(err)
      }
    },
    onClick(treeNode) {
      this.ancestors = treeNode.valueStr;
      this.onLoad(this.page);
    },
    handleEdit() {
      if (this.selectionList.length != 1) return this.$message.warning('请选择一个设备');
      this.$refs.xfEditDevRef.devAdd(this.selectionList[0], true);
    },
    handleSetMeal() {
      if (this.selectionList.length === 0) return this.$message.warning('请选择一个设备');
      this.$refs.xfDevSetMealRef.openDialog(this.ids);
    },
    onLoad(page, params = {}) {
      if (this.devQuery) {
        params['devQuery'] = this.devQuery;
      }
      if (this.ancestors) {
        params['ancestors'] = this.ancestors;
      }
      this.loading = true;
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        let data = res.data.data;
        this.page.total = data.total;
        let records = data.records;
        records.forEach(v => {
          v.onLineState = false;
        });
        this.areaData = records;
        this.loading = false;
      }).catch(() => this.loading = false);
    },
    searchReset() {
      this.devQuery = '';
      this.currParentId = 0;
      this.ancestors = "";
      this.searchR();
      this.$refs.sellerTree.initSellerTree();
    },
    searchR() {
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad(this.page);
    },
    selectionChange({records}) {
      this.selectionList = records;
    },
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.onLoad(this.page);
    },
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.onLoad(this.page);
    },
    handleDelete() {
      if (this.selectionList.length === 0) return this.$message.warning('请选择一个设备');
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeXfDev({ ids: this.ids });
      }).then(() => {
        this.$refs.sellerTree.initSellerTree();
        this.onLoad(this.page);
        this.$message.success('删除成功!')
      });
    },
    handleDownPersonInfo() {
      if (this.selectionList.length === 0) return this.$message.warning('请选择一个设备');
      let dt = this.selectionList[0].devType;
      let flag = false;
      this.selectionList.forEach(v => {
        if (dt != v.devType) {
          flag = true;
        }
      });
      if (flag) {
        this.$message({
          type: 'warning',
          message: '请选择同类设备!'
        });
        return;
      }
      this.$refs.devDownPersonInfoRef.openDialog(this.ids);
    },
    handleExport() {
      this.$confirm('是否导出消费设备?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          ids:this.selectionList.map(v => v.devId).join(','),
          devQuery:this.devQuery,
        }
        xfDevExport(params).then(r => {
          this.$w.downLoadFile(r.data,'消费设备')
        })
      });
    },
  }
}
</script>

<style lang="scss" scoped>
/deep/.basic-container .full-card {
  height: 820px;
  overflow: scroll;
}
/deep/.left_arw_icn {
  right: 0 !important;
}
</style>
