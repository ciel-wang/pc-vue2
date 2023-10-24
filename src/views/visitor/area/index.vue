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
              v-model="areaNameValue"
              placeholder="请输入位置名称"></el-input>
            <el-button type="primary" size="small" icon="el-icon-search" @click="searchR">搜索</el-button>
            <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
          </div>
          <div style="margin: 8px 0;">
            <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.visitor_area_add_btn">添加</el-button>
            <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.visitor_area_edit_btn">编辑</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permission.visitor_area_del_btn">删 除</el-button>
            <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.visitor_area_export_btn">导出</el-button>
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
            :data="areaData"
            :export-config="{}"
            @checkbox-change="selectionChange"
            @checkbox-all="selectionChange">
            <template #carAuthSync="{row}">
              <el-tag effect="dark" size="mini" type="warning" v-if="row.carAuthSync == '1'">待审核</el-tag>
              <el-tag effect="dark" size="mini" v-if="row.carAuthSync == '3'">已审核</el-tag>
              <el-tag effect="dark" size="mini" v-if="row.carAuthSync == '5'">访问中</el-tag>
            </template>
            <template #isAutoDownAuth="{row}">
              <div v-if="row.areaType == 2">
                <i class="icon-xuanzhong" v-if="row.isAutoDownAuth" :style="{color: colorName}"></i>
                <i class="icon-weixuanzhong" v-else></i>
              </div>
            </template>
            <template #devNames="{row}">
              <el-tag size="mini"
                v-for="(item,i) in row.devNames && row.devNames.split(',')" :key="'devNames'+i"
                style="margin:0 4px 4px 0;">{{item}}</el-tag>
            </template>
            <template #carDevNames="{row}">
              <el-tag size="mini"
                v-for="(item,i) in row.carDevNames && row.carDevNames.split(',')" :key="'carDevNames'+i"
                style="margin:0 4px 4px 0;">{{item}}</el-tag>
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
          <area-add-eidt ref="areaAddEidtRef" @refreshPage="searchR" :schoolIdDic="schoolIdDic" :carDevZtreeData="carDevZtreeData"></area-add-eidt>
        </basic-container>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getTreeList, getAreaList, removeArea, companyList, getDetails } from '@/api/visitor/area';
import areaZtree from '../components/ztree.vue';
import areaAddEidt from '../components/area-add-eidt.vue';
import { getSchoolsZtreeData } from "@/api/iot/dept.js"
import { getDevZtreeData } from '@/api/parking/area.js'

export default {
  components: { areaZtree, areaAddEidt },
  data() {
    return {
      ztreeHeight: 0,
      tableHeight: 0,
      areaData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      loading: false,
      selectionList: [],
      areaName: '',
      ancestors: '',
      areaNameValue: '',
      schoolIdDic:[],
      carDevZtreeData:[],
    };
  },
  mounted() {
    this.ztreeHeight = window.innerHeight - 146;
    this.tableHeight = window.innerHeight - 313;
    this.onLoad();
  },
  activated() {
    getDevZtreeData().then(r => {
      this.carDevZtreeData = r.data.data
    })
    getSchoolsZtreeData().then(r => {
      this.schoolIdDic = r.data.data;
    })
  },
  methods: {
    // 加载数据
    onLoad(page, params = {}) {
      if (this.areaNameValue) {
        params['areaName'] = this.areaNameValue.trim();
      }
      this.loading = true;
      if (this.ancestors) {
        params['ancestors'] = this.ancestors;
      }
      getAreaList(this.page.currentPage, this.page.pageSize, Object.assign(params, this.query)).then(res => {
        let data = res.data.data;
        this.page.total = data.total;
        let records = data.records;
        this.areaData = records;
        this.loading = false;
      });
    },
    searchR() {
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad(this.page);
      this.$refs.areaTree.initAreaTree();
    },
    searchReset() {
      this.areaNameValue = '';
      this.ancestors = '';
      this.$refs.areaTree.initAreaTree();
      this.searchR();
    },
    // 添加数据
    handleAdd() {
      this.$refs.areaAddEidtRef.openDialog();
    },
    // 编辑数据
    handleEdit() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一个区域');
        return;
      }
      let id = this.selectionList[0].id;
      getDetails(id).then(res => {
        let details = res.data.data;
        this.$refs.areaAddEidtRef.openDialog(details);
      });
    },
    // 删除数据
    handleDelete() {
      if (this.selectionList.length == 0) {
        this.$message.warning('请选择一个区域');
        return;
      }
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeArea({ ids: this.ids });
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
      this.$confirm('是否导出区域数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = '';
        if (this.selectionList.length > 0) {
          this.selectionList.forEach((v, i) => {
            ids = ids + ',' + v.id;
          });
        }
        ids = ids.substring(1, ids.length);
        if (ids == 'undefined') {
          ids = '';
        }
        let areaName = '';
        if (this.areaNameValue) {
          areaName = this.areaNameValue.trim();
        }
        window.open(`/api/iot-visitor/area/export?${this.website.tokenHeader}=${getToken()}&areaName=${areaName}&ids=${ids}`);
      });
    },
    // 点击左侧节点树时
    onClick(treeNode) {
      this.ancestors = treeNode.valueStr;
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
    ...mapGetters(['permission','colorName']),
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
          field: 'parentName',
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
          title:"车辆设备",
          field:'carDevNames',
          sortable:true,
          minWidth:100,
          slots:{default:"carDevNames"}
        },{
          title:"车辆同步",
          field:"carAuthSync",
          sortable:true,
          minWidth:100,
          slots:{default:"carAuthSync"}
        },
        {
          title:"审批入园",
          field:"isAutoDownAuth",
          sortable:true,
          minWidth:100,
          slots:{default:"isAutoDownAuth"}
        },
        {
          title: '区域设备',
          field: 'devNames',
          sortable: true,
          minWidth: 100,
          slots:{default:"devNames"}
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
/deep/.avue-crud__pagination {
  height: 32px !important;
}
.right_arw_icn{
  left: 6px !important;
}
</style>
