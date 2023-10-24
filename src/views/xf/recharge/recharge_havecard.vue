<template>
  <!-- 无卡充值模块 -->
  <div>
    <div style="margin-bottom: 8px;">
      <el-input
        v-model="empParam"
        size="small" clearable
        placeholder="请输入学工号/姓名"
        style="width: 160px;"
        @keyup.enter.native="search"></el-input>
      <el-input
        v-model="deptParam"
        size="small" clearable
        placeholder="请输入部门/班级名称"
        style="width: 160px;margin: 0 10px;"
        @keyup.enter.native="search"></el-input>
      <el-select v-model="empCategory" size="small" clearable placeholder="请选择人员分类" style="width: 160px;margin-right: 10px;">
        <el-option
          v-for="item in empCategorys"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
      <el-button
        type="primary"
        size="small"
        v-if="permission.no_card_auth__pre_recharge"
        @click="preRechargeMoney">预充值</el-button>
      <el-button
        type="primary"
        size="small"
        v-if="permission.no_card_auth__audit"
        @click="auditRechargeMoney">审核</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-upload2"
        v-if="permission.no_card_auth__audit"
        @click="handlerImport">导入</el-button>
    </div>
    <vxe-grid
      v-show="activeName == 'noCard'"
      :sync-resize="activeName"
      border
      resizable
      highlight-hover-row
      :height="tableHeight.height"
      ref="empCrud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="empOptions"
      :loading="empLoading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="empData"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
    </vxe-grid>
    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[30,50,100,500,1000]"
        :page-size="page.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :hide-on-single-page="false">
      </el-pagination>
    </div>

    <el-drawer
      title="预充值"
      :visible.sync="drawer"
      :append-to-body="true"
      :wrapperClosable="false"
      :direction="direction"
      :before-close="handleEsc"
      size="480px">
      <div style="width:500px">
        <avue-form
          :option="preRechargeoption"
          v-model="preRechargeObj"
          ref="preRechargeRef"
          @submit="preRechargeSubmit"
          @error="error">
          <template slot="menuForm">
            <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
          </template>
        </avue-form>
      </div>
      <div v-if="preRechargeList.length > 0" class="imerrText">
        <p v-for="(v, i) in preRechargeList" :key="i">{{ v }}</p>
      </div>
    </el-drawer>
    <recharge-have-card-audit @refresh="search" ref="RechargeHaveCardAuditRef"></recharge-have-card-audit>
    <importInfo ref="importInfoRef" @refeshPage="search"></importInfo>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getEmpCategoryList } from '@/api/xf/xfdev';
import { getEmpList, preRechargeSubmitData } from '@/api/xf/recharge';
import RechargeHaveCardAudit from './recharge_havecard-audit';
import { getDictCode } from "@/api/iot/teacher.js"
import importInfo from '@/views/iot/components/teacher-import-info.vue'

export default {
  components: { RechargeHaveCardAudit, importInfo },
  props:['activeName'],
  data() {
    return {
      drawer: false,
      empCategorys: [{ label: '内部人员', value: 1 }, { label: '借调人员', value: 2 }],
      empCategory: '',
      selectionList: [],
      empParam: "",
      deptParam: "",
      empLoading: false,
      preRechargeObj: {
        personalWellet: 0,
        rechargeType: '现金'
      },
      ids: '',
      empData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      preRechargeList: []
    };
  },
  mounted() {
    this.initEmpCategory();
  },
  methods: {
    handlerImport(){
      this.$refs.importInfoRef.openDialog('recharge_havecard');
    },
    searchReset() {
      this.empParam = '';
      this.empCategory = '';
      this.deptParam = '';
      this.search();
    },
    initEmpCategory() {
      getDictCode({keys:"userCategory#studentCategory"}).then(res => {
        this.empCategorys = [];
        let data = res.data.data;
        let arr = []
        data.studentCategory.forEach(v => {
          arr.push({
            value:v.dictKey,
            label:v.dictValue + '(学生)'
          })
        })
        data.userCategory.forEach(v => {
          arr.push({
            value:v.dictKey,
            label:v.dictValue + '(教师)'
          })
        })
        this.empCategorys = arr;
      });
    },
    onLoad(page, params = {}) {
      if (this.empCategory) {
        params['empCategory'] = this.empCategory;
      }
      if (this.empParam) {
        params['empParam'] = this.empParam.trim();
      }
      if (this.deptParam) {
        params['deptParam'] = this.deptParam.trim();
      }
      this.empLoading = true;
      getEmpList(this.page.currentPage, this.page.pageSize, params).then(res => {
        const data = res.data.data;
        data.records.forEach(v => {
          v['mngpercentStr'] = v.mngpercent + '‰';
          if(v.empType == 1){
            v.deptName = v.className
          }
        });
        this.page.total = data.total;
        this.empData = data.records;
        this.empLoading = false;
      }).catch(() => {
        this.empLoading = false
      });
    },
    // 点击预充值按钮时
    preRechargeMoney() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择人员');
        return;
      }
      let flag = false;
      this.selectionList.forEach(v => {
        if (v.rechargeActulMoney) {
          flag = true;
        }
      });
      if (flag) {
        this.$message({
          type: 'warning',
          message: '请点击审核!'
        });
        return;
      }
      this.drawer = true;
      this.$nextTick(() => {
        this.$refs['preRechargeRef'].clearValidate();
      })
    },
    // 提交表单时
    preRechargeSubmit(form, done) {
      if (form.rechargeMoney.length == 0) {
        this.$message({
          type: 'warning',
          message: '请填写金额!'
        });
        done();
        return;
      }
      let empIds = '';
      let tmpData = [];
      this.selectionList.forEach(v => {
        empIds += v.empId + ',';
      });
      let params = {
        rechargeMoney: form.rechargeMoney,
        empIds: empIds,
        personalWellet: this.preRechargeObj.personalWellet,
        rechargeMode: this.preRechargeObj.rechargeType
      };
      preRechargeSubmitData(params).then(res => {
        if (!Array.isArray(res.data.data)) {
          let mngpercent = '';
          this.selectionList.forEach(v => {
            v['preRechargeMoney'] = form.rechargeMoney;
            let s1 = parseFloat(form.rechargeMoney);
            let s2 = parseFloat(v.mngpercent);
            v['rechargeActulMoney'] = (s1 - s1 * (s2 / 1000)).toFixed(2);
            tmpData.push(v);
            mngpercent = s2;
          });
          this.empData = tmpData;
          this.$forceUpdate();
          this.preRechargeObj.rechargeMoney = '';
          this.preRechargeList = '';
          this.drawer = false;
          this.$message({
            type: 'success',
            message: '提交成功，请点击审核进行审核!'
          });
        } else {
          this.$message({
            type: 'error',
            message: '提交失败!'
          });
          this.preRechargeList = res.data.data;
        }
        done();
      }).catch(e => {
        this.empLoading = false;
        done();
      });
    },
    search() {
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad(this.page);
    },
    auditRechargeMoney() {
      this.$refs.RechargeHaveCardAuditRef.openDialog();
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
    handleEsc() {
      this.preRechargeObj.rechargeMoney = '';
      this.preRechargeList = '';
      this.$refs['preRechargeRef'].clearValidate();
      this.drawer = false;
    },
  },
  computed: {
    ...mapGetters(['userInfo', 'permission', 'colorName', 'btnicon']),
    preRechargeoption() {
      return {
        submitText: '确定',
        emptyBtn: false,
        column: [
          {
            label: '充值金额',
            prop: 'rechargeMoney',
            span: 24,
            align: 'center',
            rules: [{
              validator: (rule, value, callback) => {
                if (value == '') {
                  callback(new Error('请填写充值金额'));
                } else if (value * 1 <= 0 || !/^[+-]?((\d*(\.\d{1,2})$)|(\d+$))/.test(value)) {
                  callback(new Error('请输入大于0并最多两位小数的充值金额'));
                } else {
                  callback();
                }
              },
              required: true,
              trigger: 'blur'
            }]
          },
          {
            label: '充值方式',
            span: 20,
            type: 'radio',
            dicData: [
              { label: '现金', value: '现金' },
              { label: '微信', value: '微信' },
              { label: '支付宝', value: '支付宝' },
              { label: '其它', value: '其它' },
            ],
            prop: 'rechargeType',
            align: 'center'
          },
          {
            label: '钱包',
            prop: 'personalWellet',
            type: 'radio',
            dicData: [{ label: '个人钱包', value: 0 }],
            align: 'center'
          }
        ]
      };
    },
    tableHeight() {
      return {
        height: window.innerHeight - 326
      };
    },
    empOptions() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '学工号',
          field: 'empCode',
          sortable: true,
          fixed: "left",
          minWidth: 100,
        },
        {
          title: '姓名',
          field: 'empName',
          sortable: true,
          fixed: "left",
          minWidth: 100,
        },
        {
          title: '预充值金额',
          field: 'preRechargeMoney',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '管理费',
          field: 'mngpercentStr',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '实际充值金额',
          field: 'rechargeActulMoney',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '个人钱包余额',
          field: 'personalWallet',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '人员分类',
          field: 'empCategoryStr',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '部门/班级名称',
          field: 'deptName',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          minWidth: 100,
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
.center_open::before {
  left: 7px !important;
}
/deep/ .el-tooltip {
  text-align: left !important;
}
.imerrText {
  width: 100%;
  height: calc(100% - 350px) !important;
  border: 1px solid #efefef;
  margin-top: 10px;
  margin-bottom: 10px;
  overflow: auto;
  font-size: 14px;
  color: red;
}
.imerrText p {
  line-height: 0px;
}
/deep/.basic-container .full-card {
  height: 100% !important;
}
</style>
