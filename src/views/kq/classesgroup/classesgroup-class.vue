<template>
  <div>
    <div>
      <el-input
        style="width: 200px;margin-right: 10px;"
        size="small" clearable
        @keyup.enter.native="search"
        v-model="moreParamQuery"
        placeholder="请输入班级名称"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.kq_classesgroup_class_edit_btn">编辑</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.kq_classesgroup_class_export_btn">导出</el-button>
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
      :data="tabelData"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #timeStepTimes="{row}">
        <div>
          <p style="margin: 0;" v-if="row.timeSteps1">上下班时间：{{ row.timeSteps1 }}</p>
          <p style="margin: 0;" v-if="row.timeSteps2">上下班时间：{{ row.timeSteps2 }}</p>
          <p style="margin: 0;" v-if="row.timeSteps3">上下班时间：{{ row.timeSteps3 }}</p>
        </div>
      </template>
      <template #weeks="{row}">
        <div style="text-align: left;">
          <div style="display: flex;flex-wrap: wrap;">出勤日：
            <span style="width: 48px;" v-for="(v, i) in row.workday" :key="i">
              <span>{{ weekdays[v - 1] }}</span>
              <span v-if="i != row.workday.length - 1">、</span>
            </span>
          </div>
          <div style="display: flex;flex-wrap: wrap;color: #999;">休息日：
            <div style="width: 48px;" v-for="(v, i) in row.dayoff" :key="i">
              <span>{{ weekdays[v - 1] }}</span>
              <span v-if="i != row.dayoff.length - 1">、</span>
            </div>
          </div>
        </div>
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
    <el-drawer
      title="编辑"
      :visible.sync="dialogVisible"
      size="480px"
      :before-close="escForm"
      append-to-body
      :wrapperClosable="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form ref="formRef" :option="editOption" v-model="editForm" @submit="submit" @error="error">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="escForm" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import { getClassPageData, classPageUpdata } from '@/api/kq/classesgroup.js';
import { schedulSelectData } from '@/api/kq/scheduling.js';
import { getToken } from '@/util/auth';
export default {
  props:['activeName'],
  data() {
    return {
      moreParamQuery: '',
      loading: false,
      tabelData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight: '',
      selectionList: [],
      dialogVisible: false,
      editForm: { isAuto: false },
      classesTimeData: [],
      holidayData: [],
      weekdays: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天']
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 367;
    schedulSelectData().then(r => {
      if (r.data.code == 200) {
        let c = r.data.data.classesTimeList;
        let h = r.data.data.holidayList;
        this.classesTimeData = [];
        c.forEach(v => {
          this.classesTimeData.push({
            value: v.classesTimeNum,
            label: v.classesTimeName
          });
        });
        this.holidayData = [];
        h.forEach(v => {
          this.holidayData.push({
            value: v.id,
            label: v.holidayName
          });
        });
      }
    });
    this.onLoad();
  },
  methods: {
    handleEdit() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      if (this.selectionList.length == 1) {
        this.dialogVisible = true;
        this.editForm = this.selectionList[0];
        this.editForm['isAuto'] = false;
      } else {
        this.dialogVisible = true;
        this.editForm = { isAuto: false };
      }
    },
    submit(form, done) {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          this.editForm['classIds'] = this.ids;
          classPageUpdata(this.editForm).then(r => {
            if (r.data.code == 200) {
              this.$message.success(r.data.msg);
              this.editForm = {};
              this.$refs['formRef'].clearValidate();
              this.$refs['formRef'].resetForm();
              this.dialogVisible = false;
              this.onLoad();
            } else {
              this.$message.error(r.data.msg);
            }
            done();
          }).catch(() => {
            done()
          });
        } else {
          done();
        }
      });
    },
    search() {
      this.selectionList = []
      this.page.currentPage = 1
      this.onLoad();
    },
    searchReset() {
      this.moreParamQuery = '';
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['moreParamQuery'] = this.moreParamQuery.trim();
      this.loading = true;
      getClassPageData(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
          let arr1 = [1, 2, 3, 4, 5, 6, 7];
          d.records.forEach(v => {
            let arr = v.timeSteps.split('#');
            v.timeSteps1 = arr[0];
            v.timeSteps2 = arr[1];
            v.timeSteps3 = arr[2];
            v.dayoff = [];
            v.workday = [];
            arr1.forEach(i => {
              if (v.weeks.includes(i)) {
                v.dayoff.push(i);
              } else {
                v.workday.push(i);
              }
            });
          });
          this.tabelData = d.records;
        }
      });
    },
    handleExport() {
      this.$confirm('是否导出班级分组?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-kq/classes/clazz/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&moreParamQuery=${this.moreParamQuery.trim()}&size=${this.page.pageSize}&current=${this.page.currentPage}`
        );
      });
    },
    escForm() {
      this.form = {};
      this.$refs['formRef'].clearValidate();
      this.$refs['formRef'].resetForm();
      this.dialogVisible = false;
    },
    selectionChange({records}) {
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
    },
  },
  computed: {
    ...mapGetters(['permission', 'btnicon', 'colorName']),
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.classId);
      });
      return ids.join(',');
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '年级名称',
          field: 'gradeName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '班级名称',
          field: 'className',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '学生人数',
          field: 'studentCount',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '考勤班次',
          field: 'classesTimeName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '考勤时间',
          field: 'timeStepTimes',
          sortable: true,
          minWidth: 140,
          slots: {default:"timeStepTimes"}
        },
        {
          title: '假日方案',
          field: 'holiayName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '出勤日',
          field: 'weeks',
          sortable: true,
          minWidth: 160,
          slots: {default:"weeks"}
        }
      ]
    },
    editOption() {
      return {
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '考勤班次',
            prop: 'classesTimeNum',
            type: 'select',
            span: 24,
            dicData: this.classesTimeData,
            display: true
          },
          {
            label: '假日方案',
            prop: 'holidayId',
            type: 'select',
            span: 24,
            dicData: this.holidayData,
            display: true
          },
          {
            label: '是否排班',
            prop: 'isAuto',
            type: 'radio',
            span: 24,
            dicData: [
              {
                value: true,
                label: '是'
              },
              {
                value: false,
                label: '否'
              }
            ],
            display: true
          }
        ]
      };
    }
  }
};
</script>
