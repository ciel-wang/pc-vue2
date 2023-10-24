<template>
  <basic-container>
    <div>
      <el-input
        size="small" clearable
        style="width: 200px;margin-right: 10px;"
        @keyup.enter.native="search"
        v-model="parkingName"
        placeholder="请输入车场编号/名称"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.yard_add_btn">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.yard_edit_btn">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permission.yard_del_btn">删除</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.yard_export_btn">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      :height="tableHeight"
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
      @checkbox-all="checkboxChangeEvent"
    ></vxe-grid>
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

    <el-dialog
      :title="btnType == 'add' ? '添加车场' : '编辑车场'"
      :visible.sync="dialogVisible"
      width="38%"
      :before-close="handleClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form ref="formRef" :option="addEditOption" v-model="form" @submit="submit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getParkingList, addParking, updateParking, removeParking } from '@/api/parking/yard.js';

export default {
  data() {
    return {
      parkingName: '',
      loading: false,
      tableData: [],
      selectionList: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      btnType: 'add',
      dialogVisible: false,
      form: { parkingAdminPhone: '' }
    };
  },
  mounted() {
    this.search();
  },
  watch: {
    'form.parkingAdminPhone': {
      handler(value) {
        value = value + '';
        if (value.length > 11) {
          this.form.parkingAdminPhone = value.substr(0, 11) * 1;
        }
      },
      deep: true
    }
  },
  methods: {
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          if (this.btnType == 'add') {
            addParking(this.form).then(r => {
              done();
              if (r.data.code == 200) {
                this.$message.success(r.data.msg);
                this.search();
                this.handleClose();
              } else {
                this.$message.error(r.data.msg);
              }
            }).catch(() => {
              done();
            });
          } else {
            updateParking(this.form).then(r => {
              done();
              if (r.data.code == 200) {
                this.$message.success(r.data.msg);
                this.search();
                this.handleClose();
              } else {
                this.$message.error(r.data.msg);
              }
            }).catch(() => {
              done();
            });
          }
        }
      });
    },
    handleClose() {
      this.$refs.formRef.resetForm();
      this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
    },
    handleAdd() {
      this.btnType = 'add';
      this.dialogVisible = true;
    },
    handleEdit() {
      if (this.selectionList.length != 1) {
        this.$message.error('请选择一条数据');
        return;
      }
      this.btnType = 'edit';
      this.form = this.selectionList[0];
      this.dialogVisible = true;
    },
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.error('请选择一条数据');
        return;
      }
      this.$confirm('确定要删除选择的数据？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeParking({ ids: this.ids });
      }).then(res => {
        if (res.data.code == 200) {
          this.$message.success(res.data.msg);
          this.search();
        }
      });
    },
    handleExport() {
      this.$confirm('是否导出车场管理?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-car/parking/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids.join(',')}&current=${this.page.currentPage}&size=${this.page.pageSize}&parkingName=${this.parkingName.trim()}`
        );
      });
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.parkingName = '';
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['parkingName'] = this.parkingName.trim();
      getParkingList(params).then(r => {
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
          this.tableData = d.records;
        }
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
    ...mapGetters(['permission']),
    ids() {
      let ids = this.selectionList.map(ele => ele.id);
      return ids;
    },
    tableHeight() {
      return window.innerHeight - 305;
    },
    addEditOption() {
      return {
        emptyBtn: false,
        submitText: '保存',
        labelWidth: 120,
        column: [
          {
            label: '车场编号',
            prop: 'parkingNum',
            rules: [
              {
                required: true,
                message: '请输入车场编号',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label: '车场名称',
            prop: 'parkingName',
            rules: [
              {
                required: true,
                message: '请输入车场名称',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label: '图片保存天数',
            prop: 'parkingImgValidDays',
            rules: [
              {
                required: true,
                message: '请输入图片保存天数',
                trigger: 'blur'
              }
            ],
            type: 'number',
            minRows: 1,
            maxRows:99999,
            precision: 0
          },
          {
            label: '联系人',
            prop: 'parkingAdminName',
            maxlength:12
          },
          {
            label: '联系电话',
            prop: 'parkingAdminPhone',
            controls: false,
            type: 'number',
            precision: 0,
            maxRows:19999999999
          }
        ]
      };
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '车场编号',
          field: 'parkingNum',
          sortable: true,
          minWidth: 100
        },
        {
          title: '车场名称',
          field: 'parkingName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '图片保存天数',
          field: 'parkingImgValidDays',
          sortable: true,
          minWidth: 120
        },
        {
          title: '联系人',
          field: 'parkingAdminName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '联系电话',
          field: 'parkingAdminPhone',
          sortable: true,
          minWidth: 100
        }
      ];
    }
  }
};
</script>

<style></style>
