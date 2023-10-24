<template>
  <basic-container>
    <div class="mbottom8">
      <el-input
        size="small" clearable
        style="width: 200px;margin-right: 10px;"
        @keyup.enter.native="search"
        v-model.trim="shapeName"
        placeholder="请输入车型名称"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div class="mbottom8">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.park_vehicle_add_btn">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.park_vehicle_edit_btn">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permission.park_vehicle_del_btn">删除</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.park_vehicle_export_btn">导出</el-button>
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
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent">
      <template #isDefault="{row}">
        <i class="icon-xuanzhong" v-if="row.isDefault" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
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

    <el-dialog
      title="车型设置"
      :visible.sync="dialogVisible"
      width="600px"
      :before-close="handleClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form ref="formRef" :option="addEditOption" v-model="form" @submit="submit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
        </template>

        <template slot="parkingSpace" style="display: flex;">
          <div style="display: flex;">
            <div style="width: 140px;margin-right: 4px;">
              <avue-input-number v-model="form.parkingSpace" placeholder="请输入车位数量" precision="0" :min-rows="0"></avue-input-number>
            </div>
            <span>0为不限制，否则超过该值后，禁止入场</span>
          </div>
        </template>

        <template slot="isDefault">
          <el-checkbox v-model="form.isDefault">默认使用此车型</el-checkbox>
        </template>
      </avue-form>
    </el-dialog>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getList, add, update, getDetails, remove } from '@/api/parking/vehicle.js';

export default {
  data() {
    return {
      shapeName: '',
      tableData: [],
      loading: false,
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      selectionList: [],
      dialogVisible: false,
      form: { isDefault: false },
      btnType: '',
      autoMatchPlateColorDic: [
        { value: 0, label: '无' },
        { value: 1, label: '蓝牌车' },
        { value: 2, label: '黄牌车' },
        { value: 3, label: '白牌车' },
        { value: 4, label: '黑牌车' },
        { value: 5, label: '绿牌车（新能源车）' }
      ]
    };
  },
  mounted() {
    this.search();
  },
  methods: {
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          if (this.btnType == 'add') {
            add(this.form).then(r => {
              done();
              if (r.data.code === 200) {
                this.$message.success(r.data.msg);
                this.handleClose();
                this.search();
              } else {
                this.$message.error(r.data.msg);
              }
            }).catch(() => done());
          } else {
            update(this.form).then(r => {
              done();
              if (r.data.code === 200) {
                this.$message.success(r.data.msg);
                this.handleClose();
                this.search();
              } else {
                this.$message.error(r.data.msg);
              }
            }).catch(() => done());
          }
        }
      });
    },
    handleAdd() {
      this.dialogVisible = true;
      this.btnType = 'add';
      this.form.isDefault = false;
      this.form.matchType = 1;
    },
    handleEdit() {
      if (this.ids.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      this.btnType = 'edit';
      getDetails({ id: this.selectionList[0].id }).then(r => {
        let d = r.data.data;
        this.form = d;
        this.dialogVisible = true;
      });
    },
    handleDelete() {
      if (this.ids.length == 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm('确定要删除选择的数据？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return remove({ ids: this.ids });
      }).then(res => {
        if (res.data.code == 200) {
          this.$message.success(res.data.msg);
          this.search();
        }
      });
    },
    handleExport() {
      this.$confirm('是否导出车型管理?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-car/carshape/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids.join(',')}&current=${this.page.currentPage}&size=${this.page.pageSize}&shapeName=${this.shapeName}`
        );
      });
    },
    handleClose() {
      this.$refs.formRef.resetForm();
      this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.shapeName = '';
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['shapeName'] = this.shapeName;
      this.loading = true;
      getList(params).then(r => {
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
    ...mapGetters(['permission', 'colorName']),
    ids() {
      let list = this.$refs.xGrid.getCheckboxRecords();
      return list.map(v => v.id);
    },
    tableHeight() {
      return window.innerHeight - 305;
    },
    addEditOption() {
      return {
        emptyBtn: false,
        submitText: '保存',
        labelWidth: 130,
        column: [
          {
            label: '车型名称',
            prop: 'shapeName',
            rules: [
              {
                required: true,
                message: '请输入车型名称',
                trigger: 'blur'
              }
            ],
            span: 12,
            maxlength:10
          },
          {
            label: '',
            prop: 'matchType',
            type: 'select',
            labelWidth: 10,
            dicData: [
              { value: 1, label: '车牌颜色匹配' }, 
              { value: 2, label: '车牌前缀匹配' }, 
              { value: 3, label: '自动匹配电动车' }, 
              { value: 4, label: '自动匹配混动车' },
            ],
            span: 10,
            control: (val, form) => {
              if (val == 1) {
                return {
                  autoMatchPlateColor: { display: true },
                  platePrefix: { display: false }
                };
              } else if (val == 2) {
                return {
                  autoMatchPlateColor: { display: false },
                  platePrefix: { display: true }
                };
              } else {
                return {
                  autoMatchPlateColor: { display: false },
                  platePrefix: { display: false }
                };
              }
            }
          },
          {
            label: '自动匹配车牌颜色',
            prop: 'autoMatchPlateColor',
            type: 'select',
            dicData: this.autoMatchPlateColorDic,
            row: true
          },
          {
            label: '车牌前缀匹配',
            prop: 'platePrefix',
            row: true
          },
          {
            label: '车位数量',
            prop: 'parkingSpace',
            formslot: true,
            span: 24
          },
          {
            label: '',
            prop: 'isDefault',
            formslot: true,
            labelWidth: 60
          }
        ]
      };
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '车型名称',
          field: 'shapeName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '自动匹配车牌颜色',
          field: 'autoMatchPlateColor',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            let item = this.autoMatchPlateColorDic.find(item => item.value === cellValue);
            return item ? item.label : '';
          }
        },
        {
          title: '车牌前缀匹配',
          field: 'platePrefix',
          sortable: true,
          minWidth: 100
        },
        {
          title: '车位数量',
          field: 'parkingSpace',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            return cellValue < 0 ? '' : cellValue;
          }
        },
        {
          title: '是否默认',
          field: 'isDefault',
          sortable: true,
          minWidth: 100,
          slots: { default: 'isDefault' }
        }
      ];
    }
  }
};
</script>

<style></style>
