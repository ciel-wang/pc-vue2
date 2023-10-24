<template>
  <div>
    <el-dialog
      title="无卡充值名单审核"
      :visible.sync="dialogVisible"
      :modal-append-to-body="true"
      width="1100px"
      top="13vh"
      :lock-scroll="true"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :append-to-body="true"
      :before-close="handleClose">
      <div style="margin-bottom: 8px;">
        <el-input
          style="width: 160px;"
          v-model="empParam"
          size="small"
          placeholder="请输入学工号/姓名"
          @keyup.enter.native="search"></el-input>
        <el-input
          v-model="deptParam"
          size="small"
          placeholder="请输入部门/班级名称"
          style="width: 160px;margin: 0 10px;"
          @keyup.enter.native="search"></el-input>
        <el-select size="small" clearable v-model="empCategory" placeholder="人员分类" style="width: 160px;">
          <el-option v-for="item in empCategorys" :key="item.dictKey" :label="item.dictValue" :value="item.dictKey"></el-option>
        </el-select>
        <el-select v-model="exaState" clearable="true" size="small" placeholder="审核状态" style="width: 160px;margin: 0 10px;" >
          <el-option v-for="item in exaStats" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="reset">重置</el-button>
        <el-button type="primary" size="small" icon="el-icon-check" @click="auditRechargeMoney">确认充值</el-button>
        <el-button type="danger" icon="el-icon-close" size="small" @click="rejectAuditRechargeMoney">驳回充值</el-button>
      </div>
      <vxe-grid
        border
        resizable
        highlight-hover-row
        :height="460"
        ref="empCrud"
        size="mini"
        align="center"
        :highlight="true"
        :columns="empOptions"
        :loading="empLoading"
        :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
        :data="empData"
        :export-config="{}"
        :cell-class-name="cellClassName"
        @checkbox-change="selectionChange"
        @checkbox-all="selectionChange">
        <template #exaStateStr="{row}">
          <el-tag effect="dark" size="mini" type="info" v-if="row.exaState == 0">{{ row.exaStateStr }}</el-tag>
          <el-tag effect="dark" size="mini" type="primary" v-if="row.exaState == 1">{{ row.exaStateStr }}</el-tag>
          <el-tag effect="dark" size="mini" type="warning" v-if="row.exaState == 2">{{ row.exaStateStr }}</el-tag>
        </template>
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
    </el-dialog>

    <el-dialog title="审核" append-to-body :visible.sync="exaBox" width="555px">
        <div>
            <p>充值总金额：{{ rechargeSelectTotalMoney }}</p>
            <p>充值总人数：{{ rechargeSelectCount }}</p>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitAuditHandle">确 定</el-button>
            <el-button @click="exaBox = false">取 消</el-button>
        </div>
    </el-dialog>

    <el-dialog title="驳回原因" :modal-append-to-body="true" :append-to-body="true" :visible.sync="dialogRejectVisible">
      <el-form :model="rejectForm">
        <el-form-item label="备注" :label-width="formLabelWidth">
          <el-input type="textarea" :rows="4" v-model="rejectForm.name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="rejectAuditSubmitData">确 定</el-button>
        <el-button @click="dialogRejectVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { getEmpCategoryList } from '@/api/xf/xfdev';
import { rechargeAuditEmpList, rechargeAuditSubmitData, rechargeAuditRejectData } from '@/api/xf/recharge';
import { getDictCode } from "@/api/iot/teacher.js"

export default {
  name: 'emp-select',
  data() {
    return {
      rejectForm: { name: '' },
      empCategorys: [],
      exaState: 0,
      exaStats: [{ label: '未审核', value: 0 }, { label: '已审核', value: 1 }, { label: '已驳回', value: 2 }],
      empCategory: "",
      selectionList: [],
      empParam: "",
      dialogVisible: false,
      dialogRejectVisible: false,
      deptParam: "",
      empLoading: false,
      ids: '',
      empData: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      showColumn:false,
      exaBox:false,
      rechargeSelectTotalMoney:'0.00',
      rechargeSelectCount:0
    };
  },
  mounted() {
    getDictCode({keys:"studentCategory#userCategory"}).then(r => {
      let d = r.data.data
      d.studentCategory.forEach(v => {
        v.dictValue = v.dictValue + ' (学生)'
      })
      d.userCategory.forEach(v => {
        v.dictValue = v.dictValue + ' (教师)'
      })
      this.empCategorys = [...d.studentCategory,...d.userCategory]
    })
  },
  methods: {
    reset() {
      this.empCategory = '';
      this.empParam = '';
      this.deptParam = '';
      this.exaState = '';
      this.onLoad(this.page);
    },
    openDialog() {
      this.onLoad(this.page);
      this.dialogVisible = true;
    },
    onLoad(page, param = {}) {
      if (this.exaState == 2) {
        this.showColumn = true;
      } else {
        this.showColumn = false;
      }
      this.empLoading = true;
      if (this.empCategory) {
        param['empCategory'] = this.empCategory;
      }
      if (this.empParam) {
        param['empParam'] = this.empParam.trim();
      }
      if (this.deptParam) {
        param['deptParam'] = this.deptParam.trim();
      }
      param['exaState'] = this.exaState;
      rechargeAuditEmpList(this.page.currentPage, this.page.pageSize, param).then(res => {
        const data = res.data.data;
        data.records.forEach(v => {
          v.mngPercentMoney = v.mngPercentMoney*1+ '‰';
          if(v.empType == 1){
            v.deptName = v.className
          }
        });
        this.page.total = data.total;
        this.empData = data.records;
        this.empLoading = false;
        this.$emit('refresh');
      });
    },
    submitAuditHandle(){
      const loading = this.$loading({
        lock: true,
        text: '正在提交中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let rcIds = this.selectionList.map(v => v.rcId);
      rechargeAuditSubmitData({ rcIds: rcIds.join(',') }).then(res => {
        loading.close();
        if(res.data.code === 200){
          this.$message.success(res.data.msg);
          this.onLoad(this.page);
          this.$emit('refresh');
          this.exaBox = false;
        }else{
          this.$message.error(res.data.msg);
        }
      }).catch(() => loading.close());
    },
    auditRechargeMoney(form) {
      if (this.selectionList.length === 0) return this.$message.warning('请选择人员');
      let flag = false;
      for (let i = 0; i < this.selectionList.length; i++) {
        if (this.selectionList[i].exaState != 0) {
          flag = true;
        }
      }
      if (flag) return this.$message.warning('请选择未审核记录');
      let totalMoney = 0;
      this.selectionList.forEach(v => {
        totalMoney += parseFloat(v.rechargeActualMoney);
      });
      this.rechargeSelectTotalMoney = totalMoney.toFixed(2);
      this.rechargeSelectCount = this.selectionList.length;
      this.exaBox = true;
    },
    rejectAuditRechargeMoney() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择人员');
        return;
      }
      let flag = false;
      for (let i = 0; i < this.selectionList.length; i++) {
        if (this.selectionList[i].exaState != 0) {
          flag = true;
        }
      }
      if (flag) {
        this.$message.warning('请选择未审核记录');
        return;
      }
      this.rejectForm.name = '';
      this.dialogRejectVisible = true;
    },
    rejectAuditSubmitData() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择人员');
        return;
      }
      let rcIds = '';
      this.selectionList.forEach(v => {
        rcIds += v.rcId + ',';
      });
      rechargeAuditRejectData({
        rcIds: rcIds,
        remark: this.rejectForm.name
      }).then(res => {
        this.dialogRejectVisible = false;
        this.$message.success('驳回成功');
        this.onLoad(this.page);
      });
    },
    search() {
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
  },
  computed: {
    ...mapGetters(['colorName']),
    preRechargeoption() {
      return {
        column: [
          {
            label: '充值金额',
            prop: 'rechargeMoney',
            span: 24,
            align: 'center'
          },
          {
            label: '充值方式',
            span: 17,
            type: 'radio',
            dicData: [
              { label: '现金', value: 1 },
              { label: '微信', value: 2 },
              { label: '支付宝', value: 3 },
              { label: '其它', value: 4 },
            ],
            prop: 'rechargeType',
            align: 'center'
          },
          {
            label: '钱包',
            span: 10,
            prop: 'personalWellet',
            type: 'radio',
            dicData: [{ label: '个人钱包', value: 0 }],
            align: 'center'
          }
        ]
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
          title: '审核状态',
          field: 'exaStateStr',
          slots: {default:"exaStateStr"},
          sortable: true,
          width: 100,
        },
        {
          title: '预充值金额',
          field: 'planRechargeMoney',
          sortable: true,
          width: 120,
        },
        {
          title: '管理费',
          field: 'mngPercentMoney',
          sortable: true,
          width: 100,
        },
        {
          title: '实际充值金额',
          field: 'rechargeActualMoney',
          sortable: true,
          width: 120,
        },
        {
          title: '人员分类',
          field: 'empCategoryStr',
          sortable: true,
          width: 100,
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
          title: '提交人',
          field: 'submitEmpName',
          sortable: true,
          width: 100,
        },
        {
          title: '提交时间',
          field: 'submitTime',
          sortable: true,
          width: 150,
        },
        {
          title: '驳回理由',
          field: 'rejectRemark',
          width: 200,
          visible:this.showColumn
        }
      ]
    }
  },
};
</script>

<style scoped lang="scss">
.box {
  height: 800px;
  overflow: auto;
}

.el-scrollbar {
  height: 100%;
}

.box .el-scrollbar__wrap {
  overflow: scroll;
}

.button {
  margin: 0 -1px 0 0 !important;
  line-height: 20px !important;
}

.center_open::before {
  left: 7px !important;
}

.checkbox_true_full {
}
</style>
