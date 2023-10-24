<template>
  <basic-container>
    <div>
      <el-input
        size="small"
        style="width: 200px;margin-right: 10px;"
        clearable
        @keyup.enter.native="search"
        v-model.trim="areaName"
        placeholder="请输入区域名称"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.park_area_add_btn">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.park_area_edit_btn">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permission.park_area_del_btn">删除</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.park_area_export_btn">导出</el-button>
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
      @checkbox-all="checkboxChangeEvent">
      <template #isCharge="{row}">
        <i class="icon-xuanzhong" v-if="row.isCharge" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>

      <template #isMoreCameraConfirm="{row}">
        <i class="icon-xuanzhong" v-if="row.isMoreCameraConfirm" :style="{ color: colorName }"></i>
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
      :title="btnType == 'add' ? '添加区域' : '编辑区域'"
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
import { getParkingList } from '@/api/parking/yard.js';
import { getAreaList, addArea, updateArea, getParkingArea, removeArea, getAreaDetails } from '@/api/parking/area.js';

export default {
  data() {
    return {
      areaName: '',
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
      form: { parentId: 0, isCharge: false, isMoreCameraConfirm: false },
      parkingDic: [],
      areaDic: []
    };
  },
  mounted() {
    this.search();
  },
  activated() {
    getParkingList().then(r => {
      let d = r.data.data.records;
      let arr = d.map(v => ({value: v.id,label: v.parkingName}));
      this.parkingDic = arr;
    });
  },
  methods: {
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          if (this.btnType === 'add') {
            addArea(this.form).then(r => {
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
            updateArea(this.form).then(r => {
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
      this.form = { parentId: 0, isCharge: false, isMoreCameraConfirm: false };
      this.dialogVisible = true;
    },
    handleEdit() {
      if (this.selectionList.length != 1) {
        this.$message.error('请选择一条数据');
        return;
      }
      this.btnType = 'edit';
      getAreaDetails({ id: this.selectionList[0].id }).then(r => {
        let d = r.data.data;
        d.isMoreCameraConfirm = d.isMoreCameraConfirm == 1 ? true : false;
        d.isCharge = d.isCharge == 1 ? true : false;
        this.form = d;
        this.dialogVisible = true;
      });
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
        return removeArea({ ids: this.ids });
      }).then(res => {
        if (res.data.code == 200) {
          this.$message.success(res.data.msg);
          this.search();
        }
      });
    },
    handleExport() {
      this.$confirm('是否导出区域管理?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-car/parking/area/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids.join(',')}&current=${this.page.currentPage}&size=${this.page.pageSize}&areaName=${this.areaName}`
        );
      });
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.areaName = '';
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['areaName'] = this.areaName;
      this.loading = true;
      getAreaList(params).then(r => {
        this.loading = false;
        if (r.data.code == 200) {
          let d = r.data.data;
          this.page.total = d.total;
          this.tableData = d.records;
        }
      }).catch(this.loading = false);
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
    },
    getParkingAreaData(value){
      getParkingArea({ parkingId: value, showLayer: 'area' }).then(r => {
        this.areaDic = r.data.data;
      });
    }
  },
  computed: {
    ...mapGetters(['permission', 'colorName']),
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids;
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
            label: '所属车场',
            prop: 'parkingId',
            type: 'select',
            dicData: this.parkingDic,
            rules: [
              {
                required: true,
                message: '请选择所属车场',
                trigger: 'blur'
              }
            ],
            change: ({ value }) => {
              let that = this;
              if (value) that.getParkingAreaData(value)
            }
          },
          {
            label: '所属上级区域',
            prop: 'parentId',
            type: 'tree',
            dicData: this.areaDic
          },
          {
            label: '区域编号',
            prop: 'areaNum',
            rules: [
              {
                required: true,
                message: '请输入区域编号',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label: '区域名称',
            prop: 'areaName',
            rules: [
              {
                required: true,
                message: '请输入区域名称',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label: '车位数量',
            prop: 'parkingSpace',
            rules: [
              {
                required: true,
                message: '请输入车位数量',
                trigger: 'blur'
              }
            ],
            type: 'number',
            minRows: 1,
            maxRows:9999,
            precision: 0
          },
          {
            label: '是否收费',
            prop: 'isCharge',
            type: 'select',
            dicData: [{ value: true, label: '是' }, { value: false, label: '否' }]
          },
          {
            label: '双摄像头是否等待',
            prop: 'isMoreCameraConfirm',
            type: 'select',
            dicData: [{ value: true, label: '是' }, { value: false, label: '否' }]
          },
          {
            label: '等待时间(秒)',
            prop: 'waitSecond',
            type: 'number',
            minRows: 1,
            precision: 0
          }
        ]
      };
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '区域编号',
          field: 'areaNum',
          sortable: true,
          minWidth: 100
        },
        {
          title: '区域名称',
          field: 'areaName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '车位数量',
          field: 'parkingSpace',
          sortable: true,
          minWidth: 100
        },
        {
          title: '是否收费',
          field: 'isCharge',
          sortable: true,
          minWidth: 100,
          slots: { default: 'isCharge' }
        },
        {
          title: '双摄像头是否等待',
          field: 'isMoreCameraConfirm',
          sortable: true,
          minWidth: 100,
          slots: { default: 'isMoreCameraConfirm' }
        },
        {
          title: '等待时间',
          field: 'waitSecond',
          sortable: true,
          minWidth: 100
        },
        {
          title: '所属车场',
          field: 'parkingName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '上级区域',
          field: 'parentAreaName',
          sortable: true,
          minWidth: 100
        }
      ];
    }
  }
};
</script>

<style></style>
