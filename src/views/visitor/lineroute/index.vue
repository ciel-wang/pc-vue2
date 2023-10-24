<template>
  <div>
    <el-row>
      <!-- 左侧树部分 -->
      <el-col class="col-real-pos" :span="arrowCfg['left']">
        <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
        <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
          <area-ztree @click="onClick" ref="areaTree" v-bind:node="nodes"></area-ztree>
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
              v-model="lineNameValue"
              placeholder="请输入线路名称"></el-input>
            <el-button type="primary" size="small" icon="el-icon-search" @click="searchR">搜索</el-button>
            <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
          </div>
          <div style="margin: 8px 0;">
            <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.visitor_line_add_btn">添加</el-button>
            <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.visitor_line_edit_btn">编辑</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permission.visitor_line_del_btn">删 除</el-button>
            <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.visitor_line_export_btn">导出</el-button>
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
            :data="lineData"
            :export-config="{}"
            @checkbox-change="selectionChange"
            @checkbox-all="selectionChange">
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
          <line-add-edit ref="lineAddEditRef" @refreshPage="searchR"></line-add-edit>
        </basic-container>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getLineList, removeLine, getDetails } from '@/api/visitor/line';
import areaZtree from '../components/ztree';
import lineAddEdit from '../components/line-add-edit';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
export default {
  components: {
    areaZtree,
    lineAddEdit
  },
  data() {
    return {
      ztreeHeight: 0,
      tableHeight: 0,
      lineNameValue: '',
      lineData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      loading: false,
      selectionList: [],
      ancestors: '',
    };
  },
  mounted() {
    this.ztreeHeight = window.innerHeight - 146;
    this.tableHeight = window.innerHeight - 313;
    this.onLoad(this.page);
  },
  methods: {
    // 加载数据
    onLoad(page, params = {}) {
      if (this.lineNameValue) {
        params['lineName'] = this.lineNameValue.trim();
      }
      if (this.ancestors) {
        params['ancestors'] = this.ancestors;
      }
      this.loading = true;
      getLineList(this.page.currentPage, this.page.pageSize, Object.assign(params, this.query)).then(res => {
        let data = res.data.data;
        this.page.total = data.total;
        let records = data.records;
        records.forEach(v => {
          if (v.devs) {
            v.devs.forEach(d => {
              d += d;
            });
          }
          v.devs = v.devs.join(' | ');
        });
        this.lineData = records;
        this.loading = false;
      });
    },
    searchR() {
      this.selectionList = []
      this.page.currentPage = 1
      this.onLoad(this.page);
      this.$refs.areaTree.initAreaTree();
    },
    searchReset() {
      this.lineNameValue = '';
      this.ancestors = '';
      this.$refs.areaTree.initAreaTree();
      this.searchR()
    },
    // 添加数据
    handleAdd() {
      this.$refs.lineAddEditRef.openDialog();
    },
    // 编辑数据
    handleEdit() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条线路');
        return;
      }
      let id = this.selectionList[0].id;
      getDetails(id).then(res => {
        let details = res.data.data;
        this.$refs.lineAddEditRef.openDialog(details);
      });
    },
    // 删除数据
    handleDelete() {
      if (this.selectionList.length == 0) {
        this.$message.warning('请选择一条线路');
        return;
      }
      this.$confirm('删除后，该线路将不存在，无法预约！', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeLine({ ids: this.ids });
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
      this.$confirm('是否导出线路数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let lineName = '';
        if (this.lineNameValue) {
          lineName = this.lineNameValue.trim();
        }
        window.open(
          `/api/iot-visitor/line-route/export?${this.website.tokenHeader}=${getToken()}&lineName=${lineName}&current=${this.page.currentPage}&size=${this.page.pageSize}&ids=${this.ids}`
        );
      });
    },
    // 点击左侧节点树时
    onClick(treeNode) {
      this.ancestors = treeNode.valueStr;
      this.searchR()
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
    ids() {
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
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '区域名称',
          field: 'areaName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '位置名称',
          field: 'positionName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '线路名称',
          field: 'lineName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '线路设备',
          field: 'devs',
          sortable: true,
          minWidth: 100,
          align: 'left',
          sort: true
        },
        {
          title: "访问事由",
          field: "visitorCauses",
          sortable: true,
          minWidth: 100,
        },
        {
          title: '排序',
          field: 'lineSeq',
          sortable: true,
          minWidth: 100,
        }
      ]
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  height: 100%;
}
/deep/.basic-container .full-card {
  height: 820px;
  overflow: scroll;
}
/deep/.right_arw_icn{
  left: 6px !important;
}
</style>
