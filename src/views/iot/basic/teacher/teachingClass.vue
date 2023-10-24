<template>
  <el-dialog
    title="管理班级"
    :visible.sync="dialogVisible"
    :width="selectedDisplay == 'none' ? '780px' : '1280px'"
    top="5vh"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-row>
      <el-col :span="selectedDisplay == 'none' ? 24 : 15" style="border: 1px solid #E8E8E8;">
        <div class="headerTitle">备选</div>
        <el-row>
          <el-col span="8" style="padding: 5px 2px 0;">
            <div style="margin-right: 8px;overflow: auto;box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);padding: 10px 5px;" :style="{ height: ztreeHeight + 'px' }">
              <gradeclass-ztree ref="gradeclassZtreeRef" isCheck @onCheck="gradeclassZtreeClick"></gradeclass-ztree>
            </div>
          </el-col>
          <el-col span="16" style="padding: 5px 2px 0 0;">
            <div style="box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);padding: 10px 5px;">
              <el-input
                size="small" clearable
                @keyup.enter.native="search"
                v-model="moreParamQuery1"
                style="width: 150px;margin-right: 10px;"
                placeholder="请输入班级名称"></el-input>
              <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
              <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset1">重置</el-button>
              <el-button type="primary" size="small" icon="el-icon-check" @click="submit">提交</el-button>
              <vxe-grid
                border
                resizable
                highlight-hover-row
                :height="tableHeight"
                ref="crud1"
                size="mini"
                align="center"
                :columns="options1"
                :data="data1"
                :loading="loading"
                @checkbox-change="selectChange1"
                @checkbox-all="selectChange1"
                style="margin-top: 6px;"
              ></vxe-grid>
              <div class="page_class">
                <el-pagination
                  @size-change="handleSizeChange1"
                  @current-change="handleCurrentChange1"
                  :current-page="page1.currentPage"
                  :page-sizes="[30, 50, 100, 500,1000,3000]"
                  :page-size="page1.pageSize"
                  :background="true"
                  :pagerCount="3"
                  layout="total,sizes,pager,prev, next"
                  :total="page1.total"
                  :hide-on-single-page="false"
                ></el-pagination>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="selectedDisplay == 'none' ? 0 : 9" style="border: 1px solid #E8E8E8;" :style="{ display: selectedDisplay }">
        <div class="headerTitle">已选</div>
        <div style="padding: 5px 2px 0 0;margin-bottom: 8px;">
          <div style="margin-left: 8px;box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);padding: 10px 5px;">
            <el-input
              size="small" clearable
              @keyup.enter.native="selectedData"
              v-model="moreParamQuery2"
              style="width: 150px;margin-right: 10px;"
              placeholder="请输入班级名称"
            ></el-input>
            <el-button type="primary" size="small" icon="el-icon-search" @click="selectedData">搜索</el-button>
            <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset2">重置</el-button>
            <el-button type="primary" size="small" icon="el-icon-check" @click="handleDelet">删除</el-button>
            <vxe-grid
              border
              resizable
              :height="tableHeight"
              ref="crud2"
              size="mini"
              align="center"
              :columns="options2"
              :data="data2"
              :loading="loading"
              @checkbox-change="selectChange2"
              @checkbox-all="selectChange2"
              style="margin-top: 6px;"
            ></vxe-grid>
            <div class="page_class">
              <el-pagination
                @size-change="handleSizeChange2"
                @current-change="handleCurrentChange2"
                :current-page="page2.currentPage"
                :page-sizes="[30, 50, 100, 500,1000,3000]"
                :page-size="page2.pageSize"
                :background="true"
                :pagerCount="3"
                layout="total,sizes,pager,prev, next"
                :total="page2.total"
                :hide-on-single-page="false"
              ></el-pagination>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import gradeclassZtree from "@/components/gradeclass-ztree/index.vue"
import { gradeclassList, reqTeacherGradeclass, updateTeacherGradeclass } from "@/api/iot/teacher.js"

export default {
  components: { gradeclassZtree },
  data() {
    return {
      dialogVisible: false,
      data1: [],
      data2: [],
      form1: {},
      form2: {},
      loading: false,
      page1: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      page2: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      selectionList1: [],
      selectionList2: [],
      tableHeight: 0,
      ztreeHeight: 0,
      moreParamQuery2: '',
      moreParamQuery1: '',
      selectedDisplay: 'block',
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 349-13;
    this.ztreeHeight = window.innerHeight - 246;
  },
  methods: {
    openDialog(id) {
      this.dialogVisible = true;
      this.id = id;
      let ids = id.split(',');
      if (ids.length == 1) {
        this.selectedDisplay = 'block';
        this.selectedData();
      } else {
        this.selectedDisplay = 'none';
      }
      this.onLoad()
    },
    handleClose() {
      this.dialogVisible = false;
      this.moreParamQuery1 = '';
      this.moreParamQuery2 = '';
      this.data1 = [];
      this.data2 = [];
      this.$refs.gradeclassZtreeRef.getGradeclassZtreeInit()
    },
    submit() {
      if (this.selectionList1.length == 0) return this.$message.warning('请选择数据');
      let classIds = this.selectionList1.map(v => v.classId);
      const loading = this.$loading({
        lock: true,
        text: '正在提交中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      updateTeacherGradeclass({ empId: this.id, classIds,oprtType:1 }).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          let arr = this.id.split(',');
          if (arr.length == 1) {
            this.selectedData();
          }
          this.onLoad();
          this.$emit('refreshPage');
        } else {
          this.$message.error(r.data.msg);
        }
        loading.close();
      });
    },
    handleDelet() {
      if (this.selectionList2.length == 0) return this.$message.warning('请选择数据');
      let classIds = this.selectionList2.map(v => v.classId);
      const loading = this.$loading({
        lock: true,
        text: '正在提交中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return updateTeacherGradeclass({ empId: this.id, classIds,oprtType:0 });
      }).then(r => {
        loading.close();
        this.selectedData();
        this.onLoad();
        this.$message.success(r.data.msg);
        this.$emit('refreshPage');
      });
    },
    selectedData(){
      this.page2.currentPage = 1
      this.selectionList2 = []
      this.initdata()
    },
    initdata() {
      let params = {};
      params['size'] = this.page2.pageSize;
      params['current'] = this.page2.currentPage;
      params['id'] = this.id;
      if (this.moreParamQuery2) {
        params['moreParamQuery'] = this.moreParamQuery2.trim();
      }
      this.loading = true;
      reqTeacherGradeclass(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page2.total = d.total;
          this.data2 = d.records;
        }
      }).catch(() => this.loading = false);
    },
    search(){
      this.page1.currentPage = 1
      this.selectionList1 = []
      this.onLoad()
    },
    onLoad() {
      let params = {};
      params['current'] = this.page1.currentPage;
      params['size'] = this.page1.pageSize;
      params['ancestors'] = this.ancestors;
      if (this.moreParamQuery1) {
        params['moreParamQuery'] = this.moreParamQuery1.trim();
      }
      params['id'] = this.id;
      gradeclassList(params).then(r => {
        if (r.data.code == 200) {
          this.loading = false;
          let d = r.data.data;
          this.page1.total = d.total;
          this.data1 = d.records;
        }
      }).catch(() => this.loading = false);
    },
    gradeclassZtreeClick(nodeZtree){
      let arr = nodeZtree.map(v => v.valueStr)
      this.ancestors = arr.join(',');
      this.onLoad();
    },
    handleSizeChange1(val) {
      this.page1.currentPage = 1;
      this.page1.pageSize = val;
      this.onLoad();
    },
    handleCurrentChange1(val) {
      this.page1.currentPage = val;
      this.onLoad();
    },
    handleSizeChange2(val) {
      this.page2.currentPage = 1;
      this.page2.pageSize = val;
      this.initdata();
    },
    handleCurrentChange2(val) {
      this.page2.currentPage = val;
      this.initdata();
    },
    selectChange1({ records }) {
      this.selectionList1 = records;
    },
    selectChange2({ records }) {
      this.selectionList2 = records;
    },
    searchReset1() {
      this.moreParamQuery1 = '';
      this.onLoad();
    },
    searchReset2() {
      this.moreParamQuery2 = '';
      this.selectedData();
    },
  },
  computed: {
    ...mapGetters(['colorName']),
    options1() {
      return [
        { type: 'checkbox', width: 60 },
        {
          title: '学校名称',
          field: 'schoolName',
          minWidth: 70,
        },
        {
          title: '年级',
          field: 'gradeName',
          minWidth: 70,
        },
        {
          title: '班级',
          field: 'className',
          minWidth: 70,
        }
      ];
    },
    options2() {
      return [
        { type: 'checkbox', width: 60 },
        {
          title: '学校名称',
          field: 'schoolName',
          minWidth: 70,
        },
        {
          title: '年级',
          field: 'gradeName',
          minWidth: 70,
        },
        {
          title: '班级',
          field: 'className',
          minWidth: 70,
        }
      ];
    }
  }
};
</script>

<style scoped>
.headerTitle {
  padding: 10px 0;
  text-align: center;
  border-bottom: 1px solid #e8e8e8;
}
>>> .el-dialog__body {
  padding: 20px;
}
</style>
