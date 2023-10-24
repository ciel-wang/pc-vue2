<template>
  <!-- 补贴充值模块 -->
  <div>
    <div>
      <el-input
        v-model="empParam"
        size="small" clearable
        placeholder="学工号/姓名"
        style="width: 150px;"
        @keyup.enter.native="search"></el-input>
      <el-input
        v-model="deptParam"
        size="small" clearable
        placeholder="部门/班级名称"
        style="width: 150px;margin: 0 10px;"
        @keyup.enter.native="search"></el-input>
      <el-select v-model="walletNum" clearable size="small" placeholder="选择钱包" style="width: 110px;">
        <el-option v-for="item in walletLists" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select v-model="rechargeType" clearable size="small" placeholder="充值类型" style="width: 100px;margin: 0 10px;">
        <el-option v-for="item in rechargeTypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select v-model="exaState" clearable size="small" placeholder="状态" style="width: 100px;">
        <el-option v-for="item in auditStates" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-tooltip content="创建时间" placement="top">
        <el-date-picker
          v-model="createTime"
          size="small"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px;margin: 0 10px;"
        ></el-date-picker>
      </el-tooltip>
      <el-tooltip content="充值计划" placement="top">
        <el-date-picker
          v-model="planDate"
          type="daterange"
          size="small"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 220px;margin-right: 10px;"
        ></el-date-picker>
      </el-tooltip>
      <el-input
        v-model.trim="submitUserName"
        size="small" clearable
        placeholder="请输入创建人姓名"
        style="width: 150px;margin-right: 10px;"
        @keyup.enter.native="search"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button size="small" plain icon="el-icon-refresh" @click="searchRest">重置</el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button type="primary" size="small" @click="showHandSubsidyRechargeDialog" v-if="permission.subsidy_recharge_auth__add_btn">创建补贴</el-button>
      <el-button type="primary" size="small" @click="showImportDialog" v-if="permission.subsidy_recharge_auth__import_btn">导入补贴</el-button>
      <el-button type="primary" size="small" @click="handleExport" v-if="permission.subsidy_recharge_auth__export_btn">导出</el-button>
      <el-button type="danger" size="small" @click="deleteNoAudit" v-if="permission.subsidy_recharge_auth__del_btn">删除</el-button>
      <el-button type="primary" size="small" @click="showAuditDialog" v-if="permission.subsidy_recharge_auth__audit_btn">审核</el-button>
      <el-button type="primary" size="small" @click="showAuditAllDialog" v-if="permission.subsidy_recharge_auth__audit_all_btn">审核全部</el-button>
    </div>
    <vxe-grid
      v-show="activeName == 'subsidyCard'"
      :sync-resize="activeName"
      border
      resizable
      highlight-hover-row
      :height="tableHeight.height"
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="data"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #exaStateStr="{row}">
        <el-tag effect="dark" size="mini" type="info" v-if="row.exaStateStr == '未审核'">未审核</el-tag>
        <el-tag effect="dark" size="mini" type="warning" v-if="row.exaStateStr == '已驳回'">已驳回</el-tag>
        <el-tag effect="dark" size="mini" type="success" v-if="row.exaStateStr == '已完成'">已完成</el-tag>
        <el-tag effect="dark" size="mini" type="primary" v-if="row.exaStateStr == '已审核'">已审核</el-tag>
      </template>
    </vxe-grid>
    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[30, 50, 100, 500,1000]"
        :page-size="page.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :hide-on-single-page="false">
      </el-pagination>
    </div>

    <el-dialog title="审核" append-to-body :visible.sync="exaBox" width="300px">
      <div>
        <p>补贴总金额：{{ subsidySelectTotalMoney }}</p>
        <p>补贴总人数：{{ subsidySelectCount }}</p>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="submitAuditHandle">确 定</el-button>
        <el-button @click="exaBox = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 创建补贴 -->
    <recharge-subsidy-sg ref="rechargeSbusidySgRef" @refreshData="search"></recharge-subsidy-sg>
    <!-- 导入补贴 -->
    <recharge-subsidy-import ref="rechargeSbusidyImportRef" @refreshData="search"></recharge-subsidy-import>
    <!-- 审核全部 -->
    <recharge-subsidy-all ref="rechargeSubsidyAuditAllRef" @refreshData="search"></recharge-subsidy-all>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import RechargeSubsidySg from './recharge_subsidy_sg';
import RechargeSubsidyAll from './recharge_subsidy_audit_all';
import RechargeSubsidyImport from './recharge_subsidy_import';
import { getSubsidyList, subsidyAuditSubmit, subsidyRechargeDelete } from '@/api/xf/recharge';

export default {
  components: {
    RechargeSubsidyAll,
    RechargeSubsidySg,
    RechargeSubsidyImport
  },
  props:['activeName'],
  data() {
    return {
      subsidySelectTotalMoney: 0,
      subsidySelectCount: 0,
      selectionList: [],
      exaState: 0,
      auditStates: [
        {label: '未审核',value: 0},
        {label: '已审核',value: 1},
        {label: '已驳回',value: 2},
        {label: '已完成',value: 3}
      ],
      rechargeType: '',
      rechargeTypes: [
        {label: '累加',value: 2},
        {label: '清零',value: 1}
      ],
      walletNum: '',
      walletLists: [
        {label: '补贴钱包1',value: 1},
        {label: '补贴钱包2',value: 2},
        {label: '补贴钱包3',value: 3}
      ],
      empParam: '',
      deptParam: '',
      loading: false,
      exaBox: false,
      ids: '',
      data: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      createTime: "",
      planDate: "",
      submitUserName:""
    };
  },
  mounted() {
    let startPlanDate = '';
    let endPlanDate = '';
    let startCreateTime = '';
    let endCreateTime = '';
    this.planDate = [startPlanDate, endPlanDate];
    this.createTime = [startCreateTime, endCreateTime];
    this.submitUserName = this.userInfo.nick_name;
    this.search();
  },
  methods: {
    // 审核全部
    showAuditAllDialog() {
      this.$refs.rechargeSubsidyAuditAllRef.openDialog();
    },
    // 导入补贴
    showImportDialog() {
      this.$refs.rechargeSbusidyImportRef.openDialog();
      this.failureDate = moment().add(1, 'months').startOf('month').format('YYYY-MM-DD');
    },
    // 创建补贴
    showHandSubsidyRechargeDialog() {
      this.$refs.rechargeSbusidySgRef.openDialog();
    },
    deleteNoAudit() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择要删除的人员');
        return;
      }
      let flag = false;
      let ids = '';
      this.selectionList.forEach(e => {
        if (e.exaState != 0) {
          flag = true;
        }
        ids = ids + e.rcId + ',';
      });
      if (flag) {
        this.$message.warning('请选择未审核的人员');
        return;
      }
      let param = {};
      param['ids'] = ids;
      this.$confirm('确定选择删除补贴吗?', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        return subsidyRechargeDelete(param);
      }).then(() => {
        this.search();
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      });
    },
    // 审核
    showAuditDialog() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择要审核的人员');
        return;
      }
      let flag = false;
      this.selectionList.forEach(v => {
        if (v.exaState != 0) {
          flag = true;
        }
      });
      if (flag) {
        this.$message.warning('请选择未审核的人员');
        return;
      }
      let totalMoney = 0;
      this.selectionList.forEach(v => {
        totalMoney += parseFloat(v.planRechargeMoney);
      });
      this.subsidySelectTotalMoney = totalMoney;
      this.subsidySelectCount = this.selectionList.length;
      this.exaBox = true;
    },
    // 审核提交
    submitAuditHandle() {
      let rcIds = '';
      this.selectionList.forEach(v => {
        rcIds += v.rcId + ',';
      });
      subsidyAuditSubmit({rcIds: rcIds}).then(res => {
        if (res.data.code == 200) {
          this.exaBox = false;
          this.search();
        } else {
          this.$message.warning(res.data.msg);
        }
      });
    },
    onLoad(page, params = {}) {
      this.loading = true;
      if (this.empCategory) {
        params['empCategory'] = this.empCategory;
      }
      if (this.empParam) {
        params['empParam'] = this.empParam.trim();
      }
      if (this.deptParam) {
        params['deptParam'] = this.deptParam.trim();
      }
      if (this.walletNum) {
        params['walletNum'] = this.walletNum;
      }
      if (this.rechargeType) {
        params['rechargeType'] = parseInt(this.rechargeType - 1);
      }
      if (this.createTime) {
        params['startCreateTime'] = this.createTime[0];
        params['endCreateTime'] = this.createTime[1];
      }
      if (this.planDate) {
        params['startPlanDate'] = this.planDate[0];
        params['endPlanDate'] = this.planDate[1];
      }
      params['exaState'] = this.exaState;
      params['submitUserName'] = this.submitUserName;
      getSubsidyList(this.page.currentPage, this.page.pageSize, params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          v.planDate = v.planDate.substring(0, 11);
          v['walletName'] = '补贴钱包' + v.walletNum;
          let exaStateStr = '未充值';
          if (v.exaState == 0) {
            exaStateStr = '未审核';
            v.remark = '';
          }
          if (v.exaState == 1 && v.planState == 2) {
            exaStateStr = '已完成';
          }
          if (v.exaState == 1 && v.planState !== 2 && v.planState !== 0) {
            exaStateStr = '已审核';
            if (v.planState == 1) {
              v.remark = '计划未执行';
            } else if (v.planState == 3) {
              v.remark = '计划未到账';
            } else {
              v.remark = '补贴未到账';
            }
          }
          if (v.exaState == '2') {
            exaStateStr = '已驳回';
          }
          v.exaStateStr = exaStateStr;
          v.deptName = v.empType == 1 ? v.className : v.deptName
        });
        this.data = data.records;
        this.loading = false;
      });
    },
    searchRest() {
      this.empCategory = '';
      this.empParam = '';
      this.deptParam = '';
      this.walletNum = '';
      this.rechargeType = '';
      this.exaState = '';
      this.createTime = '';
      this.planDate = '';
      this.submitUserName = this.userInfo.nick_name;
      this.search();
    },
    search() {
      this.selectionList = []
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
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
    handleExport() {
      this.$confirm('是否导出补贴充值名单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = '';
        if (this.selectionList.length > 0) {
          this.selectionList.forEach(v => {
            ids = ids + ',' + v.rcId;
          });
        }
        ids = ids.substring(1, ids.length);
        let accTransStartTime = '';
        let accTransEndTime = '';
        if (this.accTransTime) {
          accTransStartTime = this.accTransTime[0];
          accTransEndTime = this.accTransTime[1];
        }
        let rechargeType = '';
        if (this.rechargeType) {
          rechargeType = parseInt(this.rechargeType - 1);
        }
        let startPlanDate = '';
        let endPlanDate = '';
        let startCreateTime = '';
        let endCreateTime = '';
        if (this.planDate) {
          startPlanDate = this.planDate[0];
          endPlanDate = this.planDate[1];
        }
        if (this.createTime) {
          startCreateTime = this.createTime[0];
          endCreateTime = this.createTime[1];
        }
        window.open(
          `/api/iot-xf/rechrage/subsidy/list/export?empCategory=${this.empCategory}&empParam=${this.empParam.trim()}&deptParam=${this.deptParam.trim()}&walletNum=${this.walletNum}&rechargeType=${this.rechargeType}&exaState=${this.exaState}&${this.website.tokenHeader}=${getToken()}&ids=${ids}&startPlanDate=${startPlanDate}&endPlanDate=${endPlanDate}&startCreateTime=${startCreateTime}&endCreateTime=${endCreateTime}&submitUserName=${this.submitUserName}`
        );
      });
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'permission', 'btnicon']),
    tableHeight() {
      return {
        height: window.innerHeight - 366
      };
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '充值计划',
          field: 'planDate',
          sortable: true,
          width: 100,
        },
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          width: 100,
          fixed: "left",
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          fixed: "left",
          width: 100,
        },
        {
          title: '充值金额',
          field: 'planRechargeMoney',
          sortable: true,
          width: 100,
        },
        {
          title: '状态',
          field: 'exaStateStr',
          sortable: true,
          slots: {default:"exaStateStr"},
          width: 100,
        },
        {
          title: '钱包名称',
          field: 'walletName',
          sortable: true,
          width: 100,
        },
        {
          title: '充值类型',
          field: 'rechargeType',
          sortable: true,
          width: 100,
          formatter:({ cellValue })=>{
            return cellValue == 0 ? '清零' : "累加"
          }
        },
        {
          title: '部门/班级名称',
          field: 'deptName',
          sortable: true,
          width: 120,
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          width: 100,
        },
        {
          title: '失效日期',
          field: 'failureDate',
          sortable: true,
          width: 100,
        },
        {
          title: '创建时间',
          field: 'submitTime',
          sortable: true,
          width: 150,
        },
        {
          title: '创建人',
          field: 'submitUserName',
          sortable: true,
          width: 100,
        },
        {
          title: '审核时间',
          field: 'exaDate',
          sortable: true,
          width: 150,
        },
        {
          title: '审核人',
          field: 'examUserName',
          sortable: true,
          width: 100,
          align: 'center',
          display: false
        },
        {
          title: '备注',
          field: 'remark',
          sortable: true,
          minWidth: 130,
        }
      ]
    }
  },
};
</script>

<style lang="scss" scoped>
.el-scrollbar {
  height: 100%;
}
.upload-err-text {
  line-height: 5px;
  color: red;
}
.imerrText {
  width: 100%;
  height: 150px;
  border: 1px solid #efefef;
  margin-top: 10px;
  margin-top: 10px;
  overflow: auto;
  font-size: 14px;
  color: red;
}
.imerrText p {
  line-height: 0px;
}
</style>
