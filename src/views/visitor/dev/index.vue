<template>
  <basic-container>
    <div>
      <el-input 
        style="width: 150px;margin-right: 10px;" 
        size="small" clearable
        @keyup.enter.native="searchR" 
        v-model="devQuery" 
        placeholder="请输入设备名称"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="searchR">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.visitor_dev_add_btn">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.visitor_dev_edit_btn">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permission.visitor_dev_del_btn">删 除</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.visitor_dev_export_btn">导出</el-button>
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
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="devData"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #onlineState="{row}">
        <el-tag effect="dark" size="mini" type="primary" v-if="row.onlineState == true">在线</el-tag>
        <el-tag effect="dark" size="mini" type="info" v-else>离线</el-tag>
      </template>
      <template #devType="{row}">
        <div style="text-align:center">
          <span v-if="row['devType'] === 3">自助访客机</span>
          <span v-else-if="row['devType'] === 6">台式访客机</span>
        </div>
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
    <dev-add-edit ref="devAddEditRef" @refreshPage="searchR"></dev-add-edit>
  </basic-container>
</template>

<script>
import { getDevList, addDev, removeDev } from '@/api/visitor/dev';
import devAddEdit from '../components/dev-add-edit';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
export default {
  components: { devAddEdit },
  data() {
    return {
      tableHeight: 0,
      devData: [],
      devQuery: '',
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      loading: false,
      selectionList: [],
      websock: null,
      timer:null,
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 313;
    this.onLoad(this.page);
  },
  activated() {
    this.websock = null;
    this.initWebSocket();
  },
  deactivated() {
    clearInterval(this.timer)
    this.websock.close();
    this.websock = null;
  },
  methods: {
    initWebSocket() {
      let url = website.websocketUrl;
      this.websock = new WebSocket(url); // 监听打开
      this.websock.onopen = this.websockOpen; // 监听关闭
      this.websock.onmessage = this.websockMessage;
    },
    websockOpen() {
      this.websock.send(JSON.stringify({ type: 14, token: getToken() }));
      this.timer = setInterval(() => {
          this.websock.send(JSON.stringify({ type: 14, token: getToken() }));
      },3000)
    },
    websockMessage(e) {
      try{
        let data = e?.data;
        let array = data == 'successfully' ? {} : JSON.parse(data);
        this.devData.forEach(v => {
          if (array.length == 0) {
            v.onlineState = false;
          } else {
            let index = array.findIndex(d => d.devCode == v.devSn);
            v.onlineState = index >= 0 ? true : false;
          }
        });
        this.$forceUpdate();
      }catch(e){
        console.log(e);
      }
    },
    // 加载数据
    onLoad(page, params = {}) {
      if (this.devQuery) {
        params['devName'] = this.devQuery.trim();
      }
      this.loading = true;
      getDevList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        let data = res.data.data;
        this.page.total = data.total;
        this.devData = data.records;
        this.loading = false;
      });
    },
    searchR() {
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad(this.page);
    },
    // 重置
    searchReset() {
      this.devQuery = '';
      this.searchR();
    },
    // 添加数据
    handleAdd() {
      this.$refs.devAddEditRef.openDialog();
    },
    // 编辑数据
    handleEdit() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一个设备');
        return;
      }
      let details = this.selectionList[0];
      this.$refs.devAddEditRef.openDialog(details);
    },
    // 删除数据
    handleDelete() {
      if (this.selectionList.length == 0) {
        this.$message.warning('请选择一个设备');
        return;
      }
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeDev({ ids: this.ids });
      }).then(() => {
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      });
    },
    // 导出数据
    handleExport() {
      this.$confirm('是否导出设备数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = '';
        if (this.selectionList.length > 0) {
          this.selectionList.forEach((v, i) => {
            ids = ids + ',' + v.devId;
          });
        }
        ids = ids.substring(1, ids.length);
        if (ids == 'undefined') {
          ids = '';
        }
        let devName = '';
        if (this.devQuery) {
          devName = this.devQuery.trim();
        }
        window.open(
          `/api/iot-visitor/dev/export?current=${this.page.currentPage}&size=${this.page.pageSize}&${this.website.tokenHeader}=${getToken()}&devName=${devName}&ids=${ids}`
        );
      });
    },
    // 表单选中变化时
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
  },
  computed: {
    ...mapGetters(['permission','colorName']),
    ids() {
      let ids = this.selectionList.map(v => v.devId);
      return ids.join(",");
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: "设备状态",
          field: "onlineState",
          sortable: true,
          minWidth: 100,
          slots: {default:'onlineState'},
        },
        {
          title: '设备名称',
          field: 'devName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '设备序列号',
          field: 'devSn',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '设备类型',
          field: 'devType',
          slots: {default:"devType"},
          sortable: true,
          minWidth: 100,
        },
        {
          title:"设备当前时间戳",
          field:"devCurrTime",
          sortable: true,
          minWidth: 100,
        },
        {
          title: 'IP地址',
          field: 'devIp',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '位置',
          field: 'areaName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: "是否启用",
          field: "devState",
          sortable: true,
          minWidth: 100,
          slots: {default:'devState'}
        }
      ]
    }
  }
};
</script>
