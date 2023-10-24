<template>
  <div>
    <el-dialog
      title="车牌更换审核"
      :visible.sync="dialogVisible"
      width="1100px"
      append-to-body
      top="5vh"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div class="mbottom8">
        <el-input
          size="small"
          style="width: 160px;margin-right: 10px;"
          clearable
          @keyup.enter.native="search"
          v-model.trim="empName"
          placeholder="请输入车主姓名/联系电话"
        ></el-input>
        <el-select 
          size="small" clearable 
          v-model="auditStatus" 
          style="width: 160px;margin-right: 10px;" 
          placeholder="请选择审核状态">
          <el-option v-for="item in auditStatusDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
        <el-button type="primary" size="small" @click="handleAgree">同意</el-button>
        <el-button type="danger" size="small" @click="handleReject">拒绝</el-button>
      </div>
      <vxe-grid
        border
        resizable
        auto-resize
        highlight-hover-row
        height="600"
        keep-source
        ref="xGrid"
        size="mini"
        align="center"
        :highlight="true"
        :columns="tableColumn"
        :loading="loading"
        :data="tableData"
        :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
        @checkbox-change="checkboxChangeEvent"
        @checkbox-all="checkboxChangeEvent">
        <template #auditStatus="{row}">
          <el-tag effect="dark" size="mini" type="warning" v-if="row.auditStatus == 1">待审批</el-tag>
          <el-tag effect="dark" size="mini" v-if="row.auditStatus == 2">已同意</el-tag>
          <el-tag effect="dark" size="mini" type="danger" v-if="row.auditStatus == 3">已拒绝</el-tag>
        </template>
      </vxe-grid>
      <div style="min-height: 52px;text-align: right;padding-top: 25px;">
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
    </el-dialog>

    <el-dialog
      title="拒绝"
      :visible.sync="rejectDialogVisible"
      width="31%"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form ref="rejectFormRef" :option="rejectOption" v-model="rejectForm" @submit="rejectSubmit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="rejectDialogVisible = false" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getCarAuditList, agreeCarChange, rejectCarChange } from '@/api/parking/car.js';

export default {
  data() {
    return {
      dialogVisible: false,
      empName: '',
      auditStatus: 1,
      auditStatusDic: [{ value: 1, label: '待审批' }, { value: 2, label: '已同意' }, { value: 3, label: '已拒绝' }],
      tableData: [],
      loading: false,
      selectionList: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      rejectDialogVisible: false,
      rejectForm: {}
    };
  },
  mounted() {
    this.onLoad();
  },
  methods: {
    handleAgree() {
      if (this.selectionList.length == 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      agreeCarChange({ ids: this.ids }).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          this.$emit('refeshPage');
          this.search();
        } else {
          this.$message.error(r.data.msg);
        }
      });
    },
    handleReject() {
      if (this.selectionList.length == 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      let flag = this.selectionList.some(v => v.auditStatus != 1);
      if (flag) {
        this.$message.warning('请选择待审批状态的数据');
        return;
      }
      this.rejectDialogVisible = true;
      this.rejectForm.rejectCause = '';
    },
    rejectSubmit(form, done) {
      rejectCarChange({ ids: this.ids, rejectCause: form.rejectCause }).then(r => {
        done();
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          this.rejectDialogVisible = false;
          this.search();
        } else {
          this.$message.error(r.data.msg);
        }
      }).catch(() => {
        done();
      });
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.empName = '';
      this.auditStatus = 1;
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['empName'] = this.empName;
      params['auditStatus'] = this.auditStatus;
      this.loading = true;
      getCarAuditList(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
          this.tableData = d.records;
        }
      }).catch(() => {
        this.loading = false;
      });
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
    ids() {
      let ids = this.selectionList.map(v => v.id);
      return ids.join(',');
    },
    rejectOption() {
      return {
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '拒绝原因',
            prop: 'rejectCause',
            span: 24,
            rules: [
              {
                required: true,
                message: '请输入拒绝原因',
                trigger: 'blur'
              }
            ]
          }
        ]
      };
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '车主姓名',
          field: 'empName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '联系电话',
          field: 'empPhone',
          sortable: true,
          minWidth: 100
        },
        {
          title: '车牌号码',
          children: [
            {
              title: '更换前',
              field: 'beforePlateNum',
              sortable: true,
              minWidth: 100
            },
            {
              title: '更换后',
              field: 'afterPlateNum',
              sortable: true,
              minWidth: 100
            }
          ]
        },
        {
          title: '审核状态',
          field: 'auditStatus',
          sortable: true,
          minWidth: 100,
          slots: { default: 'auditStatus' }
        },
        {
          title: '审核人',
          field: 'auditEmpName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '审核时间',
          field: 'auditTime',
          sortable: true,
          minWidth: 140
        },
        {
          title: '拒绝原因',
          field: 'rejectCause',
          sortable: true,
          minWidth: 100
        }
      ];
    }
  }
};
</script>

<style></style>
