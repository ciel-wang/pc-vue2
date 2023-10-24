<template>
  <el-row style="height: 100%;">
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <parking-area-ztree ref="parkingAreaZtreeRef" @click="ztreeClick"></parking-area-ztree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']" style="height: 100%;">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container style="height: 100%;">
        <div style="height: 33.3%;">
          <div class="div">岗亭管理</div>
          <div style="margin: 8px 0;">
            <el-button 
              type="primary" 
              :disabled="sentryAddDisa" 
              size="small" icon="el-icon-plus" 
              v-if="permission.sentrybox_add_btn"
              @click="handleAdd(1)">添加</el-button>
            <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit(1)" v-if="permission.sentrybox_edit_btn">编辑</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(1)" v-if="permission.sentrybox_del_btn">删除</el-button>
          </div>
          <div style="height: calc(100% - 100px);">
            <vxe-table
              border
              ref="xTable1"
              auto-resize
              highlight-hover-row
              highlight-hover-column
              highlight-current-column
              size="mini"
              height="100%"
              align="center"
              :data="tableData1"
              @cell-click="cellClick($event, 2)">
              <vxe-table-column type="checkbox" width="70"></vxe-table-column>
              <vxe-table-column title="岗亭编号" minWidth="100" field="sentryNum"></vxe-table-column>
              <vxe-table-column title="岗亭名称" minWidth="100" field="sentryName"></vxe-table-column>
              <vxe-table-column title="岗亭IP" minWidth="100" field="sentryIp"></vxe-table-column>
              <vxe-table-column title="备注" minWidth="100" field="sentryDesc"></vxe-table-column>
            </vxe-table>
          </div>
        </div>

        <div style="height: 33.3%;">
          <div class="div">通道管理</div>
          <div style="margin: 8px 0;">
            <el-button 
              type="primary" :disabled="channelAddDisa" 
              size="small" icon="el-icon-plus" 
              v-if="permission.park_channel_add_btn"
              @click="handleAdd(2)">添加</el-button>
            <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit(2)" v-if="permission.park_channel_add_btn">编辑</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(2)" v-if="permission.park_channel_add_btn">删除</el-button>
          </div>
          <div style="height: calc(100% - 100px);">
            <vxe-table
              border
              ref="xTable2"
              auto-resize
              highlight-hover-row
              highlight-hover-column
              highlight-current-column
              size="mini"
              align="center"
              height="100%"
              :data="tableData2"
              @cell-click="cellClick($event, 3)">
              <vxe-table-column type="checkbox" width="70"></vxe-table-column>
              <vxe-table-column title="通道编号" minWidth="100" field="channelNum"></vxe-table-column>
              <vxe-table-column title="通道名称" minWidth="100" field="channelName"></vxe-table-column>
              <vxe-table-column
                title="进出方向"
                minWidth="100"
                field="channelInOut"
                :formatter="({ cellValue }) => cellValue == 1 ? '进' : '出'"
              ></vxe-table-column>
              <vxe-table-column title="临时车是否允许进出" minWidth="130" field="isTemporaryInOut">
                <template #default="{row}">
                  <i class="icon-xuanzhong" v-if="row.isTemporaryInOut" :style="{ color: colorName }"></i>
                  <i class="icon-weixuanzhong" v-else></i>
                </template>
              </vxe-table-column>
              <vxe-table-column title="访客车是否允许进出" minWidth="130" field="isVisitorInOut">
                <template #default="{row}">
                  <i class="icon-xuanzhong" v-if="row.isVisitorInOut" :style="{ color: colorName }"></i>
                  <i class="icon-weixuanzhong" v-else></i>
                </template>
              </vxe-table-column>
              <vxe-table-column title="是否开启模糊识别" minWidth="130" field="isLikeRecognition">
                <template #default="{row}">
                  <i class="icon-xuanzhong" v-if="row.isLikeRecognition" :style="{ color: colorName }"></i>
                  <i class="icon-weixuanzhong" v-else></i>
                </template>
              </vxe-table-column>
            </vxe-table>
          </div>
        </div>

        <div style="height: 33.3%;">
          <div class="div">设备管理</div>
          <div style="margin: 8px 0;">
            <el-button
              type="primary" 
              :disabled="devAddDisa" 
              size="small" 
              icon="el-icon-plus" 
              v-if="permission.park_dev_add_btn"
              @click="handleAdd(3)">添加</el-button>
            <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit(3)" v-if="permission.park_dev_edit_btn">编辑</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(3)" v-if="permission.park_dev_del_btn">删除</el-button>
          </div>
          <div style="height: calc(100% - 120px);">
            <vxe-table
              border
              ref="xTable3"
              auto-resize
              highlight-hover-row
              highlight-hover-column
              highlight-current-column
              size="mini"
              height="100%"
              align="center"
              :data="tableData3"
              @checkbox-change="checkboxChangeEvent"
              @checkbox-all="checkboxChangeEvent">
              <vxe-table-column type="checkbox" width="70"></vxe-table-column>
              <vxe-table-column title="设备状态" minWidth="100" field="onlineState">
                <template #default="{row}">
                  <el-tag effect="dark" size="mini" type="info" v-if="!row.onlineState">离线</el-tag>
                  <el-tag effect="dark" size="mini" type="primary" v-if="row.onlineState">在线</el-tag>
                </template>
              </vxe-table-column>
              <vxe-table-column title="设备编号" minWidth="100" field="devCode"></vxe-table-column>
              <vxe-table-column title="设备名称" minWidth="100" field="devName"></vxe-table-column>
              <vxe-table-column
                title="设备类型"
                minWidth="100"
                field="devType"
                :formatter="({ cellValue }) => 'IOT-THY2'"
              ></vxe-table-column>
              <vxe-table-column title="设备SN" minWidth="100" field="devSn"></vxe-table-column>
              <vxe-table-column title="设备IP" minWidth="130" field="devIp"></vxe-table-column>
            </vxe-table>
          </div>
        </div>

        <add-edit ref="addEditRef" @refeshPage="refeshPage"></add-edit>
      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex';
import parkingAreaZtree from '../parking-area-ztree.vue';
import { getSentryList, removeSentry, getChannelList, removeChannel, getDevList, removeDev, detailsSentry, detailsChannel, detailsDev } from '@/api/parking/sentrybox.js';
import addEdit from './add-edit.vue';

export default {
  components: { parkingAreaZtree, addEdit },
  data() {
    return {
      tableData1: [],
      tableData2: [],
      tableData3: [],
      selectionList: [],
      sentryAddDisa: true,
      channelAddDisa: true,
      devAddDisa: true,
      parkingAreaId: '',
      parkingAreaName: '',
      sentryId: '',
      sentryName: '',
      channelId: '',
      channelName: '',
      timer: null
    };
  },
  activated() {
    if (this.channelId) {
      this.onLoad(3);
    }
  },
  deactivated() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    refeshPage(type) {
      this.selectionList = [];
      this.onLoad(type);
    },
    handleAdd(type) {
      let form = {};
      if (type == 1) {
        form.parkingAreaName = this.parkingAreaName;
        form.parkingAreaId = this.parkingAreaId;
      }
      if (type == 2) {
        form.sentryId = this.sentryId;
        form.sentryName = this.sentryName;
      }
      if (type == 3) {
        form.channelName = this.channelName;
        form.channelId = this.channelId;
      }
      this.$refs.addEditRef.openDialog(type, 'add', form);
    },
    handleEdit(type) {
      let list = this.$refs['xTable' + type].getCheckboxRecords();
      if (list.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      if (type == 1) {
        detailsSentry({ id: list[0].id }).then(r => {
          let form = r.data.data;
          this.$refs.addEditRef.openDialog(type, 'edit', form);
        });
      }
      if (type == 2) {
        detailsChannel({ id: list[0].id }).then(r => {
          let form = r.data.data;
          this.$refs.addEditRef.openDialog(type, 'edit', form);
        });
      }
      if (type == 3) {
        detailsDev({ id: list[0].id }).then(r => {
          let form = r.data.data;
          this.$refs.addEditRef.openDialog(type, 'edit', form);
        });
      }
    },
    handleDelete(type) {
      let list = this.$refs['xTable' + type].getCheckboxRecords();
      if (list.length == 0) {
        this.$message.warning('请至少选择一条数据');
        return;
      }
      let ids = list.map(item => {
        return item.id;
      });
      this.$confirm('确定要删除选择的数据？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (type == 1) {
          return removeSentry({ ids });
        }
        if (type == 2) {
          return removeChannel({ ids });
        }
        return removeDev({ ids });
      }).then(res => {
        if (res.data.code == 200) {
          this.$message.success(res.data.msg);
          this.onLoad(type);
        }
      });
    },
    onLoad(type) {
      if (type == 1) {
        getSentryList({ parkingAreaId: this.parkingAreaId }).then(r => {
          if (r.data.code == 200) {
            let d = r.data.data;
            this.tableData1 = d;
          }
        });
      }
      if (type == 2) {
        getChannelList({ sentryId: this.sentryId }).then(r => {
          this.tableData2 = r.data.data || [];
        });
      }
      if (type == 3) {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
          this.onLoad(3);
        } else {
          this.initDev();
          this.timer = setInterval(() => {
            this.initDevStatus();
          }, 5000);
        }
      }
    },
    initDev() {
      getDevList({ channelId: this.channelId }).then(r => {
        this.tableData3 = r.data.data || [];
      });
    },
    initDevStatus() {
      getDevList({ channelId: this.channelId }).then(r => {
        let data = r.data.data || [];
        this.tableData3.forEach(v => {
          data.forEach(item => {
            if (v.id === item.id) {
              v.onlineState = item.onlineState;
            }
          });
        });
      });
    },
    cellClick({ row }, type) {
      if (type == 2) {
        this.channelAddDisa = false;
        this.sentryId = row.id;
        this.sentryName = row.sentryName;
        this.devAddDisa = true;
        this.clearData();
      }
      if (type == 3) {
        this.devAddDisa = false;
        this.channelId = row.id;
        this.channelName = row.channelName;
      }
      this.onLoad(type);
    },
    checkboxChangeEvent({ records }) {
      this.selectionList = records;
    },
    clearData() {
      this.tableData2 = [];
      this.tableData3 = [];
      this.channelId = '';
      clearInterval(this.timer);
    },
    ztreeClick(ztreeNode) {
      if (!ztreeNode.valueStr.startsWith('CA')) {
        this.$message.warning('请先选择区域');
        this.sentryAddDisa = true;
        return;
      }
      this.clearData();
      this.devAddDisa = true;
      this.channelAddDisa = true;
      this.sentryAddDisa = false;
      this.parkingAreaId = ztreeNode.value;
      this.parkingAreaName = ztreeNode.name;
      this.onLoad(1);
    }
  },
  computed: {
    ...mapGetters(['permission', 'colorName']),
    ztreeHeight() {
      return window.innerHeight - 146;
    }
  }
};
</script>

<style scoped lang="scss">
/deep/.basic-container .el-card {
  height: 100%;
  box-sizing: border-box;
  .el-card__body {
    height: calc(100% - 32px);
  }
}
.div {
  background-color: #b4bccc;
  padding: 8px;
  font-weight: 600;
}
</style>
