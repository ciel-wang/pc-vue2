<template>
  <basic-container>
    <el-tabs v-model="roleType" @tab-click="tabClick">
      <el-tab-pane label="请假类型" name="1">
        <div style="margin-bottom: 8px;">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="add" v-if="permissionList.addBtnQj">添加</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit"
            v-if="permissionList.editBtnQj">
            编辑</el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete"
            v-if="permissionList.delBtnQj"
            >删除</el-button>
        </div>
        <vxe-grid
          v-show="roleType == 1"
          :sync-resize="roleType"
          border
          resizable
          highlight-hover-row
          :height="tableHeight"
          ref="leaveCrud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="leaveOptions"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="leaveData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #isPaid="{row}">
            <el-switch
              v-model="row.isPaid"
              :disabled="!permissionList.isPaidSwitch"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="isPaidChange(row)"
            ></el-switch>
          </template>
          <template #roleStatus="{row}">
            <el-switch
              v-model="row.roleStatus"
              :disabled="!permissionList.roleStatusQjSwitch"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="roleStatusChange(row)"
            ></el-switch>
          </template>
        </vxe-grid>
        <typerole-leave ref="typeroleLeaveRef" @refreshPage="onLoad"></typerole-leave>
      </el-tab-pane>
      <el-tab-pane label="出差类型" name="2">
        <div style="margin-bottom: 8px;">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="add" v-if="permissionList.addBtnCc">添加</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit"
            v-if="permissionList.editBtnCc">
            编辑</el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete"
            v-if="permissionList.delBtnCc"
            >删除</el-button>
        </div>
        <vxe-grid
          v-show="roleType == 2"
          :sync-resize="roleType"
          border
          resizable
          highlight-hover-row
          :height="tableHeight"
          ref="businessCrud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="businessOptions"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="businessData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #roleStatus="{row}">
            <el-switch
              v-model="row.roleStatus"
              :disabled="!permissionList.roleStatusCcSwitch"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="roleStatusChange(row)"
            ></el-switch>
          </template>
        </vxe-grid>
        <typerole-business ref="typeroleBusinessRef" @refreshPage="onLoad"></typerole-business>
      </el-tab-pane>
      <el-tab-pane label="加班类型" name="3">
        <div style="margin-bottom: 8px;">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="add" v-if="permissionList.addBtnJb">添加</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit"
            v-if="permissionList.editBtnJb">
            编辑</el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete"
            v-if="permissionList.delBtnJb"
            >删除</el-button>
        </div>
        <vxe-grid
          v-show="roleType == 3"
          :sync-resize="roleType"
          border
          resizable
          highlight-hover-row
          :height="tableHeight"
          ref="overtimeCrud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="overtimeOptions"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="overtimeData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #roleStatus="{row}">
            <el-switch
              v-model="row.roleStatus"
              :disabled="!permissionList.roleStatusJbSwitch"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="roleStatusChange(row)"
            ></el-switch>
          </template>
        </vxe-grid>
        <typerole-overtime ref="typeroleOvertimeRef" @refreshPage="onLoad"></typerole-overtime>
      </el-tab-pane>
      <el-tab-pane label="补卡类型" name="4">
        <div style="margin-bottom: 8px;">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="add" v-if="permissionList.addBtnBk">添加</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit"
            v-if="permissionList.editBtnBk">
            编辑</el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete"
            v-if="permissionList.delBtnBk"
            >删除</el-button>
        </div>
        <vxe-grid
          v-show="roleType == 4"
          :sync-resize="roleType"
          border
          resizable
          highlight-hover-row
          :height="tableHeight"
          ref="reissuecardCrud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="reissuecardOptions"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="reissuecardData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #roleStatus="{row}">
            <el-switch
              v-model="row.roleStatus"
              :disabled="!permissionList.roleStatusBkSwitch"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="roleStatusChange(row)"
            ></el-switch>
          </template>
        </vxe-grid>
        <typerole-reissuecard ref="typeroleReissuecardRef" @refreshPage="onLoad"></typerole-reissuecard>
      </el-tab-pane>
      <el-tab-pane label="单据审批权限" name="5">
        <div>
          <el-input
            size="small" clearable
            @keyup.enter.native="page.currentPage = 1;search()"
            v-model="moreParamQuery"
            style="width: 160px;"
            placeholder="请输入审核人"></el-input>
          <el-select size="small" clearable v-model="typeRoleType" placeholder="请选择单据类型" style="width: 160px;margin: 0 10px;">
            <el-option
              v-for="item in typeRoleTypeDict"
              :key="item.value"
              :label="item.label"
              :value="item.value"></el-option>
          </el-select>
          <el-button type="primary" size="small" icon="el-icon-search" @click="page.currentPage = 1;search()">搜索</el-button>
          <el-button type="default" size="small" icon="el-icon-refresh" @click="page.currentPage = 1;searchReset()">重置</el-button>
        </div>
        <div style="margin: 8px 0;">
          <el-button type="primary" size="small" icon="el-icon-plus" @click="add" v-if="permissionList.addBtnSh">添加</el-button>
          <el-button type="primary" size="small" @click="handleAudit" v-if="permissionList.auditBtn">审核范围</el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete"
            v-if="permissionList.addBtnSh"
            >删除</el-button>
        </div>
        <vxe-grid
          v-show="roleType == 5"
          :sync-resize="roleType"
          border
          resizable
          highlight-hover-row
          :height="tableHeight2"
          ref="crud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="options"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="Data"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #roleName="{row}">
            <el-tag effect="dark" size="mini" v-if="row.rolelType == 1">{{ row.roleName }}</el-tag>
            <el-tag type="success" effect="dark" size="mini" v-if="row.rolelType == 2">{{ row.roleName }}</el-tag>
            <el-tag type="warning" effect="dark" size="mini" v-if="row.rolelType == 3">{{ row.roleName }}</el-tag>
            <el-tag type="danger" effect="dark" size="mini" v-if="row.rolelType == 4">{{ row.roleName }}</el-tag>
          </template>
        </vxe-grid>
        <typerole-receipt ref="typeroleReceiptRef" @refreshPage="search"></typerole-receipt>
        <receipt-auditscope ref="receiptAuditscope" @refreshPage="search"></receipt-auditscope>
      </el-tab-pane>
    </el-tabs>
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
</template>

<script>
import { getTyperoleList, typeroleRemove, typeroleDetails, typeroleReceiptList, typeroleDelAuditemp, updateIspaid, updateRoleStatus } from '@/api/kq/typerole.js';
import typeroleReceipt from './typerole-receipt.vue';
import typeroleReissuecard from './typerole-reissuecard.vue';
import typeroleLeave from './typerole-leave.vue';
import typeroleBusiness from './typerole-business.vue';
import typeroleOvertime from './typerole-overtime.vue';
import receiptAuditscope from '../components/receipt-auditscope.vue';
import { mapGetters } from 'vuex';
export default {
  components: { typeroleReceipt, typeroleReissuecard, typeroleLeave, typeroleBusiness, typeroleOvertime, receiptAuditscope },
  data() {
    return {
      roleType: '1',
      loading: false,
      leaveData: [],
      businessData: [],
      overtimeData: [],
      reissuecardData: [],
      tableHeight: '',
      Data: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      tableHeight2: '',
      moreParamQuery: '',
      selectionList: [],
      typeRoleType: '',
      typeRoleTypeDict: [
        { value: 1, label: '请假' },
        { value: 2, label: '出差' },
        { value: 3, label: '加班' },
        { value: 4, label: '补卡' },
      ]
    };
  },
  mounted() {
    this.tableHeight = window.innerHeight - 326;
    this.tableHeight2 = window.innerHeight - 367;
    this.onLoad();
  },
  methods: {
    add() {
      if (this.roleType == 1) {
        this.$refs['typeroleLeaveRef'].openDialog();
      }
      if (this.roleType == 2) {
        this.$refs['typeroleBusinessRef'].openDialog();
      }
      if (this.roleType == 3) {
        this.$refs['typeroleOvertimeRef'].openDialog();
      }
      if (this.roleType == 4) {
        this.$refs['typeroleReissuecardRef'].openDialog();
      }
      if (this.roleType == 5) {
        this.$refs['typeroleReceiptRef'].openDialog();
      }
    },
    handleEdit(){
      if(this.selectionList.length != 1){
        this.$message.error("请选择一条数据");
        return;
      }
      let row = this.selectionList[0]
      typeroleDetails({ id: row.id }).then(r => {
        if (r.data.code == 200) {
          let d = r.data.data;
          let arr1 = [];
          if (d.ranks.length > 0) {
            let arr = d.ranks.split('#');
            arr.forEach(v => {
              let s = v.split(',')
              arr1.push({
                operator: s[0],
                limitDays: s[1],
                auditRank: s[2]
              });
            });
          }
          arr1.forEach(i => {
            if (i.operator == 1) {
              i.operator = '>';
            }
            if (i.auditRank == 1) {
              i.auditRank = '一级';
            }
            if (i.auditRank == 2) {
              i.auditRank = '二级';
            }
            if (i.auditRank == 3) {
              i.auditRank = '三级';
            }
          });
          d.id = row.id;
          d.ranks = arr1;
          if (this.roleType == 1) {
            this.$refs['typeroleLeaveRef'].openDialog(d);
          }
          if (this.roleType == 2) {
            this.$refs['typeroleBusinessRef'].openDialog(d);
          }
          if (this.roleType == 3) {
            this.$refs['typeroleOvertimeRef'].openDialog(d);
          }
          if (this.roleType == 4) {
            this.$refs['typeroleReissuecardRef'].openDialog(d);
          }
        }
      });
    },
    handleDelete() {
      if (this.selectionList.length == 0) {
        this.$message.warning('请选择一条数据');
        return;
      }
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if(this.roleType != 5){
          return typeroleRemove({ ids: this.ids, roleType: this.roleType });
        }
        return typeroleDelAuditemp({ ids: this.ids });
      }).then(r => {
        this.onLoad()
        this.search();
        this.$message({
          type: 'success',
          message: r.data.msg
        });
      });
    },
    handleAudit() {
      if (this.selectionList.length == 0) {
        this.$message.warning('请选择一条数据');
        return;
      }
      let id = [];
      this.selectionList.forEach(ele => {
        id.push(ele.id);
      });
      let ids = id.join(',');
      this.$refs['receiptAuditscope'].openDialog({ type: 'typerole', id: ids });
    },
    isPaidChange(v) {
      updateIspaid({ id: v.id, isPaid: v.isPaid }).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          this.onLoad();
        } else {
          this.$message.error(r.data.msg);
        }
      });
    },
    roleStatusChange(v) {
      updateRoleStatus({ id: v.id, roleStatus: v.roleStatus }).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          this.onLoad();
        } else {
          this.$message.error(r.data.msg);
        }
      });
    },
    tabClick(v) {
      this.page.total = 0
      this.page.pageSize = 20
      this.page.currentPage = 1
      if (v.name == 5) {
        this.search();
      } else {
        this.roleType = v.name;
        this.onLoad();
      }
    },
    search() {
      this.loading = true;
      let params = {};
      params['size'] = this.page.pageSize;
      params['current'] = this.page.currentPage;
      if (this.moreParamQuery) {
        params['moreParamQuery'] = this.moreParamQuery.trim();
      }
      params['typeRoleType'] = this.typeRoleType;
      typeroleReceiptList(params).then(r => {
        if (r.data.code == 200) {
          this.loading = false;
          let d = r.data.data;
          this.page.total = d.total;
          this.Data = d.records;
        }
      });
    },
    onLoad() {
      this.loading = true;
      let params = {};
      params['size'] = this.page.pageSize;
      params['curren'] = this.page.currentPage;
      params['roleType'] = this.roleType;
      getTyperoleList(params).then(res => {
        if (res.data.code == 200) {
          this.loading = false;
          let d = res.data.data;
          this.page.total = d.total * 1;
          d.records.forEach(v => {
            if (v.roleStatus == 1) {
              v.roleStatus = true;
            } else {
              v.roleStatus = false;
            }
            if (v.isPaid == 1) {
              v.isPaid = true;
            } else {
              v.isPaid = false;
            }
            if (v.LEAVETIME_MIN_MINUTE) {
              v.LEAVETIME = v.LEAVETIME_MIN_MINUTE;
            }
            if (v.LEAVETIME_MAX_MINUTE) {
              v.LEAVETIME = v.LEAVETIME + '-' + v.LEAVETIME_MAX_MINUTE;
            }
          });
          if(this.roleType == 1){
            this.leaveData = d.records
          }else if(this.roleType == 2){
            this.businessData = d.records;
          }else if(this.roleType == 3){
            this.overtimeData = d.records;
          }else if(this.roleType == 4){
            this.reissuecardData = d.records;
          }
        }
      });
    },
    selectionChange({records}) {
      this.selectionList = records;
    },
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      if(this.roleType != 5){
        this.onLoad()
      }else{
        this.search();
      }
    },
    handleCurrentChange(val) {
      this.page.currentPage = val;
      if(this.roleType != 5){
        this.onLoad()
      }else{
        this.search();
      }
    },
    searchReset() {
      this.moreParamQuery = '';
      this.typeRoleType = '';
      this.selectionList = [];
      this.search();
    }
  },
  computed: {
    ...mapGetters(['permission', 'btnicon']),
    permissionList() {
      return {
        addBtnQj: this.vaildData(this.permission.kq_typerole_qj_add_btn, false),
        delBtnQj: this.vaildData(this.permission.kq_typerole_qj_del_btn, false),
        editBtnQj: this.vaildData(this.permission.kq_typerole_qj_edit_btn, false),
        isPaidSwitch: this.vaildData(this.permission.kq_typerole_qj_is_kgs_btn, false),
        roleStatusQjSwitch: this.vaildData(this.permission.kq_typerole_qj_is_enabled_btn, false),

        addBtnCc: this.vaildData(this.permission.kq_typerole_cc_add_btn, false),
        delBtnCc: this.vaildData(this.permission.kq_typerole_cc_del_btn, false),
        editBtnCc: this.vaildData(this.permission.kq_typerole_cc_edit_btn, false),
        roleStatusCcSwitch: this.vaildData(this.permission.kq_typerole_cc_is_enabled_btn, false),
        addBtnJb: this.vaildData(this.permission.kq_typerole_jb_add_btn, false),
        delBtnJb: this.vaildData(this.permission.kq_typerole_jb_del_btn, false),
        editBtnJb: this.vaildData(this.permission.kq_typerole_jb_edit_btn, false),
        roleStatusJbSwitch: this.vaildData(this.permission.kq_typerole_jb_is_enabled_btn, false),
        addBtnBk: this.vaildData(this.permission.kq_typerole_bk_add_btn, false),
        delBtnBk: this.vaildData(this.permission.kq_typerole_bk_del_btn, false),
        editBtnBk: this.vaildData(this.permission.kq_typerole_bk_edit_btn, false),
        roleStatusBkSwitch: this.vaildData(this.permission.kq_typerole_bk_is_enabled_btn, false),
        addBtnSh: this.vaildData(this.permission.kq_typerole_receipt_auth_audit_add_btn, false),
        delBtnSh: this.vaildData(this.permission.kq_typerole_receipt_auth_audit_del_btn, false),
        auditBtn: this.vaildData(this.permission.kq_typerole_receipt_auth_audit_range_btn, false)
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    leaveOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '请假类型编号',
          field: 'roleNum',
          sortable: true,
          minWidth: 120
        },
        {
          title: '请假类型名称',
          field: 'roleName',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '请假时长范围(小时)',
          field: 'LEAVETIME',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '是否扣工时',
          field: 'isPaid',
          sortable: true,
          minWidth: 110,
          slots: {default:"isPaid"}
        },
        {
          title: '是否启用',
          field: 'roleStatus',
          sortable: true,
          minWidth: 110,
          slots: {default:"roleStatus"}
        },
        {
          title: '排序',
          field: 'roleSeq',
          sortable: true,
          minWidth: 100,
        }
      ]
    },
    businessOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '出差类型编号',
          field: 'roleNum',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '出差类型名称',
          field: 'roleName',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '是否启用',
          field: 'roleStatus',
          sortable: true,
          minWidth: 110,
          slots: {default:"roleStatus"}
        },
        {
          title: '排序',
          field: 'roleSeq',
          sortable: true,
          minWidth: 100,
        }
      ]
    },
    overtimeOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '加班类型编号',
          field: 'roleNum',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '加班类型名称',
          field: 'roleName',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '是否启用',
          field: 'roleStatus',
          sortable: true,
          minWidth: 110,
          slots: {default:"roleStatus"}
        },
        {
          title: '排序',
          field: 'roleSeq',
          sortable: true,
          minWidth: 100,
        }
      ]
    },
    reissuecardOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '补卡类型编号',
          field: 'roleNum',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '补卡类型名称',
          field: 'roleName',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '是否启用',
          field: 'roleStatus',
          sortable: true,
          minWidth: 110,
          slots: {default:"roleStatus"}
        },
        {
          title: '排序',
          field: 'roleSeq',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '每月最多允许补卡',
          field: 'BK_EMP_MONTH_BK_MAX_COUNT',
          minWidth: 120,
        }
      ]
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          minWidth: 120
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '类型',
          field: 'roleName',
          sortable: true,
          minWidth: 120,
          display: false,
          slots: {default:"roleName"}
        },
        {
          title: '人数',
          field: 'count',
          sortable: true,
          minWidth: 120,
        }
      ]
    }
  }
};
</script>
