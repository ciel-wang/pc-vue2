<template>
  <basic-container>
    <div class="mbottom8">
      <el-input
        size="small"
        style="width: 200px;margin-right: 10px;"
        clearable
        @keyup.enter.native="search"
        v-model.trim="empName"
        placeholder="请输入车主姓名/联系电话"
      ></el-input>
      <el-input
        size="small" style="width: 160px;margin-right: 10px;"
        clearable
        @keyup.enter.native="search"
        v-model.trim="plateNum"
        placeholder="请输入车牌号码"></el-input>
      <el-select
        size="small" clearable
        v-model="carTypeId"
        style="width: 160px;margin-right: 10px;"
        placeholder="请选择车辆类型">
        <el-option v-for="item in carTypeDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <avue-input-tree
        ref="tree"
        include-half-checked=""
        multiple
        v-model="ancestors"
        placeholder="请选择部门"
        type="tree"
        size="small"
        style="width: 160px;margin-right: 10px;"
        :dic="deptTreeDic"
      ></avue-input-tree>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div class="mbottom8">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.park_car_add_btn">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.park_car_edit_btn">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permission.park_car_del_btn">删除</el-button>
      <el-button type="primary" size="small" @click="handleCarMonth" v-if="permission.park_car_month_btn">月租车续期</el-button>
      <el-button type="primary" size="small" @click="$refs.carAuditRef.dialogVisible = true" v-if="permission.park_car_audit_btn">车牌更换审核</el-button>
      <el-button type="primary" size="small" icon="el-icon-upload2" @click="$refs.carImportRef.openDialog()" v-if="permission.park_car_import_btn">导入</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleAuthDown" v-if="permission.park_car_authdown_btn">权限下载</el-button>
      <el-button type="primary" size="small" @click="$refs.authSelectRef.dialogVisible = true" v-if="permission.park_car_authselect_btn">权限查询</el-button>
      <el-button type="primary" size="small" @click="$refs.eventSelectRef.dialogVisible = true" v-if="permission.park_car_event_btn">事件查询</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.park_car_export_btn">导出</el-button>
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

    <car-add-edit
      ref="carAddEditRef"
      @refeshPage="search"
      :carTypeDic="carTypeDic"
      :plateNumColorDic="plateNumColorDic"
      :carEmissionStandardDic="carEmissionStandardDic"
      :carFuelOliType="carFuelOliType"
      :carVehicleDic="carVehicleDic"
    ></car-add-edit>

    <car-import ref="carImportRef" @refeshPage="search"></car-import>
    <auth-down ref="authDownRef" :devZtreeDic="ztreeData"></auth-down>
    <event-select ref="eventSelectRef"></event-select>
    <auth-select ref="authSelectRef"></auth-select>
    <car-month-money ref="carMonthMoneyRef" @refeshPage="search"></car-month-money>
    <car-audit ref="carAuditRef" @refeshPage="search"></car-audit>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getCartypeList } from '@/api/parking/carclass.js';
import carAddEdit from './car-add-edit.vue';
import carImport from './car-import.vue';
import authDown from './auth-down.vue';
import eventSelect from './event-select.vue';
import authSelect from './auth-select.vue';
import carMonthMoney from './car-month-money.vue';
import carAudit from './car-audit.vue';
import {getDeptZtreeData} from "@/api/iot/dept";
import { getCarList, getCarDetails, removeCar, getCarMonthDetails } from '@/api/parking/car.js';
import { getDevZtreeData } from '@/api/parking/area.js';
import { getSelectlist } from '@/api/parking/vehicle.js';
import { getDictCode } from '@/api/iot/teacher.js'

export default {
  components: { carAddEdit, carImport, authDown, eventSelect, authSelect, carMonthMoney, carAudit },
  data() {
    return {
      plateNum: '',
      empName: '',
      carTypeId: '',
      carTypeDic: [],
      carStatus: '',
      carStatusDic: [],
      tableData: [],
      loading: false,
      selectionList: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      plateNumColorDic: [],
      carEmissionStandardDic: [],
      carFuelOliType: [],
      ztreeData: [],
      ancestors: '',
      deptTreeDic: [],
      carVehicleDic: []
    };
  },
  mounted() {
    this.onLoad();
  },
  activated() {
    getDictCode({ keys: 'carPlateNumColor#carEmissionStandard#carFuelOliType' }).then(r => {
      let arr = r.data.data?.carPlateNumColor.map(v => ({ value: v.key * 1, label: v.value }));
      let arr2 = r.data.data?.carEmissionStandard.map(v => ({ value: v.key * 1, label: v.value }));
      let arr3 = r.data.data.carFuelOliType.map(v => ({ value: v.key * 1, label: v.value }));
      this.carFuelOliType = arr3;
      this.carEmissionStandardDic = arr2;
      this.plateNumColorDic = arr;
    });
    getCartypeList().then(r => {
      let arr = r.data.data.map(v => ({value: v.id,label: v.typeName}));
      this.carTypeDic = arr;
    });
    getDevZtreeData().then(r => {
      this.ztreeData = r.data.data;
    });
    getDeptZtreeData().then(r => {
      this.deptTreeDic = r.data.data;
    });
    getSelectlist().then(r => {
      let arr = r.data.data.map(v => ({ value: v.key, label: v.value }));
      this.carVehicleDic = arr;
    });
  },
  methods: {
    handleCarMonth() {
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      if (this.selectionList[0].carTypeCategory != 2) {
        this.$message.warning('请选择月卡类车辆');
        return;
      }
      getCarMonthDetails({ carInfoId: this.selectionList[0].id }).then(r => {
        if (r.data.code == 200) {
          let d = r.data.data;
          d.carInfoId = this.selectionList[0].id;
          this.$refs.carMonthMoneyRef.openDialog(d);
        }
      });
    },
    handleAuthDown() {
      if (this.selectionList.length === 0) {
        this.$message.error('请至少选择一条数据');
        return;
      }
      let flag = this.selectionList.some(v => v.carTypeCategory != this.selectionList[0].carTypeCategory);
      if (flag) {
        this.$message.error('请选择同类型车辆');
        return;
      }
      this.$refs.authDownRef.openDialog(this.ids, this.selectionList[0].carTypeCategory);
    },
    handleAdd() {
      this.$refs.carAddEditRef.openDialog('add');
    },
    handleEdit() {
      if (this.selectionList.length != 1) {
        this.$message.error('请选择一条数据');
        return;
      }
      getCarDetails({ id: this.selectionList[0].id }).then(r => {
        if (r.data.code == 200) {
          let d = r.data.data;
          let form = { ...d.carExt, ...d };
          form.carTypeId = form.carTypeId * 1;
          this.$refs.carAddEditRef.openDialog('edit', form);
        }
      });
    },
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.error('请选择一条数据');
        return;
      }
      this.$confirm('确定要删除选择的数据？删除后系统将会自动取消该车辆进出权限，请谨慎操作！！！', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeCar({ ids: this.ids });
      }).then(res => {
        if (res.data.code == 200) {
          this.$message.success(res.data.msg);
          this.search();
        }
      });
    },
    handleExport() {
      this.$confirm('是否导出车辆管理?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-car/carinfo/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids.join(',')}&current=${this.page.currentPage}&size=${this.page.pageSize}&empName=${this.empName}&plateNum=${this.plateNum}&carTypeId=${this.carTypeId}&deptIds=${this.ancestors}`
        );
      });
    },
    search() {
      this.page.currentPage = 1;
      this.selectionList = [];
      this.onLoad();
    },
    searchReset() {
      this.empName = '';
      this.plateNum = '';
      this.carTypeId = '';
      this.ancestors = '';
      this.search();
    },
    onLoad() {
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      params['empName'] = this.empName;
      params['plateNum'] = this.plateNum;
      params['carTypeId'] = this.carTypeId;
      params['deptIds'] = this.ancestors;
      this.loading = true;
      getCarList(params).then(r => {
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
    ...mapGetters(['permission']),
    ids() {
      let ids = this.selectionList.map(v => v.id);
      return ids;
    },
    tableHeight() {
      return window.innerHeight - 305;
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '车牌号码',
          field: 'plateNum',
          sortable: true,
          minWidth: 100
        },
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
          title: '部门',
          field: 'deptName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '车辆类型',
          field: 'typeName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '车型类型',
          field: 'shapeName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '开始有效期',
          field: 'enableDate',
          sortable: true,
          minWidth: 100
        },
        {
          title: '结束有效期',
          field: 'overdueDate',
          sortable: true,
          minWidth: 100
        }
      ];
    }
  }
};
</script>

<style></style>
