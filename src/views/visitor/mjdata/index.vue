<template>
  <el-row>
    <!-- 左侧树部分 -->
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <mjdata-ztree @click="onClick" ref="mjdataTree" v-bind:node="nodes"></mjdata-ztree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div style="margin-bottom: 8px;">
          <el-date-picker
            v-model="datetimerangeArr"
            size="small"
            :clearable="false"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :default-time="['00:00:00','23:59:59']"
            style="width: 330px;"></el-date-picker>
          <el-input
            style="width: 200px;margin: 0 10px;"
            size="small" clearable
            @keyup.enter.native="searchR"
            v-model="visitorNameValue"
            placeholder="请输入访客姓名"></el-input>
          <el-button type="primary" size="small" icon="el-icon-search" @click="searchR">搜索</el-button>
          <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
          <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.visitor_mjdata_export_btn">导出</el-button>
        </div>
        <vxe-grid
          border
          resizable
          auto-resize
          highlight-hover-row
          :height="tableHeight"
          ref="xGrid"
          size="mini"
          align="center"
          :highlight="true"
          :columns="options"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="mjData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #inOutWay="{row}">
            <div v-if="!isDevAi(row.devType)">{{row.cardNum}}</div>
            <img
              v-else
              width="30px"
              height="30px"
              :src="row.empFaceUrl + '?' + new Date().getTime()"
              @click="openPreview(row.empFaceUrl + '?' + new Date().getTime())" />
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
      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
import moment from 'moment';
import { mjdataList } from '@/api/visitor/mjdata';
import mjdataZtree from '../components/mjdataztree';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { isDevAi } from "@/util/trans.js";

export default{
  components: { mjdataZtree },
  data() {
    return {
      ztreeHeight: 0,
      tableHeight: 0,
      mjData: [],
      visitorNameValue: '',
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      loading: false,
      cardNum: '',
      devId:'',
      datetimerangeArr:[],
      selectionList:[]
    };
  },
  mounted() {
    this.ztreeHeight = window.innerHeight - 146;
    this.tableHeight = window.innerHeight - 272;
    let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    this.datetimerangeArr = [start, end];
    this.onLoad();
  },
  methods: {
    isDevAi,
    // 加载数据
    onLoad(page, params = {}) {
      if (this.visitorNameValue) {
        params['visitorName'] = this.visitorNameValue.trim();
      }
      if (this.devId) {
        params['devId'] = this.devId;
      }
      params['startTime'] = this.datetimerangeArr[0]
      params['endTime'] = this.datetimerangeArr[1]
      this.loading = true;
      mjdataList(this.page.currentPage, this.page.pageSize, Object.assign(params, this.query)).then(res => {
        let data = res.data.data;
        this.page.total = data.total;
        let records = data.records;
        records.forEach(v => v.checked = false);
        this.mjData = records;
        this.loading = false;
      });
    },
    searchR() {
      this.selectionList = []
      this.page.currentPage = 1
      this.onLoad(this.page);
      this.$refs.mjdataTree.initMjdataTree();
    },
    searchReset() {
      this.visitorNameValue = '';
      this.devId = '';
      let start = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      let end = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      this.datetimerangeArr = [start, end];
      this.$refs.mjdataTree.initMjdataTree();
      this.searchR();
    },
    // 导出数据
    handleExport() {
      this.$confirm('是否导出进出数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(`/api/iot-visitor/mjdata/list/export?${this.website.tokenHeader}=${getToken()}&current=${this.page.currentPage}&size=${this.page.pageSize}&visitorName=${this.visitorNameValue.trim()}&devId=${this.devId}&startTime=${this.datetimerangeArr[0]}&endTime=${this.datetimerangeArr[1]}&ids=${this.ids}`);
      });
    },
    // 点击左侧节点树时
    onClick(treeNode) {
      if (treeNode.id == 1) {
        this.devId = '';
      } else {
        this.devId = treeNode.id;
      }
      this.searchR();
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
    ...mapGetters(['permission']),
    ids(){
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '访客姓名',
          field: 'visitorName',
          sortable: true,
          fixed: "left",
          minWidth: 100,
        },
        {
          title: '来访单位',
          field: 'visitorCompany',
          sortable: true,
          fixed: "left",
          minWidth: 100,
        },
        {
          title: '进出时间',
          field: 'swipeTime',
          sortable: true,
          minWidth: 140,
        },
        {
          title: '设备编号',
          field: 'devCode',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '设备名称',
          field: 'devName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '门区名称',
          field: 'devDoorName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '进出方式',
          field: 'inOutWay',
          sortable: true,
          minWidth: 100,
          slots: {default:"inOutWay"},
        },
        {
          title: '温度值(℃)',
          field: 'temperature',
          sortable: true,
          minWidth: 110,
        },
        {
          title: '进出方向',
          field: 'doorDirection',
          sortable: true,
          minWidth: 100,
        }
      ]
    }
  }
};
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
