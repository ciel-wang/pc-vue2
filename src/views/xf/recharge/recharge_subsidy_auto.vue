<template>
  <el-row>
    <div class="tipcls">
      <p>注意：</p>
      <p>1.系统支持按全部人员或者按人员分类两种方式自动创建补贴名单，但是不允许同时启用；</p>
      <p>2.自动创建补贴仅允许每个人每个钱包在同一个月内创建一条自动充值名单，所以请合理安排充值金额；</p>
      <p>3.如需在自动充值完成之后调整补贴金额，当月可选择通过excel导入补贴进行补充充值，次月补贴可在次月充值计划日之前重新调整自动充值计划；</p>
      <p>4.充值计划日当天录入系统人员参与充值；</p>
      <p>5.充值金额执行时间为充值计划日当天00:00:00至23:59:59期间。</p>
    </div>
    <el-row style="margin-bottom: 10px;">
      <span style="font-size:12px;font-weight: 600;">充值方式：</span>
      <el-radio-group @change="change" v-model="type">
        <el-radio :label="1">全部人员</el-radio>
        <el-radio :label="2">按人员分类</el-radio>
      </el-radio-group>
      <el-button icon="el-icon-check" @click="submitData" size="medium" style="float:right" type="primary">提交</el-button>
    </el-row>

    <el-table :data="tableData" size="small" stripe border style="width: 100%;min-height: 180px;margin-bottom: 20px;overflow: auto;">
      <el-table-column align="center" label="人员分类" width="120px">
        <template slot-scope="scope">
          <span style="margin-left: 10px">{{ scope.row.empCategoryStr }}</span>
        </template>
      </el-table-column>

      <el-table-column label="补贴钱包1" align="center">
        <el-table-column label="充值类型" align="center" width="120">
          <template slot-scope="scope">
            <el-select size="mini" v-model="formObjs['rechargeType_' + scope.row.empCategory + '_walletNum_1']" placeholder="请选择">
              <el-option key="1" label="累加" value="1"></el-option>
              <el-option key="0" label="清零" value="0"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="补贴金额(元)" align="center" width="150">
          <template slot-scope="scope">
            <el-input style="width:100px" v-model="formObjs['rechargeAmount_' + scope.row.empCategory + '_walletNum_1']" size="mini" placeholder="补贴金额" />
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="补贴钱包2" align="center">
        <el-table-column label="充值类型" align="center" width="120">
          <template slot-scope="scope">
            <el-select size="mini" v-model="formObjs['rechargeType_' + scope.row.empCategory + '_walletNum_2']" placeholder="请选择">
              <el-option key="1" label="累加" value="1"></el-option>
              <el-option key="0" label="清零" value="0"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="补贴金额(元)" align="center" width="150">
          <template slot-scope="scope">
            <el-input style="width:100px" v-model="formObjs['rechargeAmount_' + scope.row.empCategory + '_walletNum_2']" size="mini" placeholder="补贴金额" />
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="补贴钱包3" align="center">
        <el-table-column label="充值类型" align="center" width="120">
          <template slot-scope="scope">
            <el-select size="mini" v-model="formObjs['rechargeType_' + scope.row.empCategory + '_walletNum_3']" placeholder="请选择">
              <el-option key="1" label="累加" value="1"></el-option>
              <el-option key="0" label="清零" value="0"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="补贴金额(元)" align="center" width="150">
          <template slot-scope="scope">
            <el-input style="width:100px" v-model="formObjs['rechargeAmount_' + scope.row.empCategory + '_walletNum_3']" size="mini" placeholder="补贴金额" />
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="充值计划" align="center" width="200">
        <template slot-scope="scope">
          每月
          <el-select size="mini" style="width:80px" v-model="formObjs['rechargePlanDate_' + scope.row.empCategory]" placeholder="请选择充值日期">
            <el-option v-for="item in days" :key="item" :label="item" :value="item"></el-option>
          </el-select>
          日
        </template>
      </el-table-column>
      <el-table-column label="是否启用" align="center">
        <template slot-scope="scope">
          <el-switch v-model="formObjs['isStart_' + scope.row.empCategory]" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
        </template>
      </el-table-column>
    </el-table>
  </el-row>
</template>

<script>
import { subsidyAutoRecharge, getSubsidyAutoRechargeData } from '@/api/xf/recharge';
import { getEmpCategoryList } from '@/api/xf/xfdev';
import moment from 'moment';

export default {
  data() {
    return {
      type: 1,
      formObjs: {
        isStart_0: false
      },
      tableData: [],
      empCategorys: []
    };
  },
  created() {
    if (this.type == 1) {
      this.tableData.push({ empCategory: 0, empCategoryStr: '全部' });
      this.loadCfgData(1);
    }
  },
  methods: {
    initEmpCategoryTable() {
      getEmpCategoryList().then(res => {
        let d = res.data.data.data;
        d.studentCategory.forEach(v => v.dictValue = v.dictValue+' (学生)')
        d.userCategory.forEach(v => v.dictValue = v.dictValue+' (教师)')
        let data = [...d.studentCategory,...d.userCategory]
        this.empCategorys = data;
        this.tableData = [];
        let p = {};
        data.forEach(e => {
          this.tableData.push({
            empCategory: e.dictKey,
            empCategoryStr: e.dictValue
          });
          let category = e.dictKey;
          this.$set(this.formObjs,'rechargeType_' + category + '_walletNum_1','1')
          this.$set(this.formObjs,'rechargeAmount_' + category + '_walletNum_1',100)
          this.$set(this.formObjs,'rechargeType_' + category + '_walletNum_2','1')
          this.$set(this.formObjs,'rechargeAmount_' + category + '_walletNum_2',100)
          this.$set(this.formObjs,'rechargeType_' + category + '_walletNum_3','1')
          this.$set(this.formObjs,'rechargeAmount_' + category + '_walletNum_3',100)
          this.$set(this.formObjs,'rechargePlanDate_' + category,'1')
          // p['rechargeType_' + category + '_walletNum_1'] = '1';
          // p['rechargeAmount_' + category + '_walletNum_1'] = 100;
          // p['rechargeType_' + category + '_walletNum_2'] = '1';
          // p['rechargeAmount_' + category + '_walletNum_2'] = 100;
          // p['rechargeType_' + category + '_walletNum_3'] = '1';
          // p['rechargeAmount_' + category + '_walletNum_3'] = 100;
          // p['rechargePlanDate_' + category] = 1;
        });
        // setTimeout(() => {
        //   this.formObjs = Object.assign({},this.formObjs,{...p})
        //   // this.formObjs = p;
        //   this.$forceUpdate();
        // }, 500);
      });
    },
    loadCfgData(type) {
      getSubsidyAutoRechargeData(type).then(res => {
        let data = res.data.data;
        let p = {};
        data.forEach(e => {
          let category = e.empCategory;
          p['rechargeType_' + category + '_walletNum_' + e.rechargeWallet] = e.rechargeType + '';
          p['rechargeAmount_' + category + '_walletNum_' + e.rechargeWallet] = e.rechargeAmount;
          p['rechargePlanDate_' + category] = e.rechargePlanDate;
          p['isStart_' + category] = e.rechargeIsStart;
        });
        if (JSON.stringify(p) == '{}') {
          p['rechargeType_0_walletNum_1'] = '1';
          p['rechargeAmount_0_walletNum_1'] = 100;
          p['rechargeType_0_walletNum_2'] = '1';
          p['rechargeAmount_0_walletNum_2'] = 100;
          p['rechargeType_0_walletNum_3'] = '1';
          p['rechargeAmount_0_walletNum_3'] = 100;
          p['rechargePlanDate_0'] = 1;
          p['isStart_0'] = false;
        }
        // this.formObjs = p;
        this.formObjs = Object.assign({},this.formObjs,{...p})
        this.$forceUpdate();
      });
    },
    change(val) {
      if (val == 2) {
        this.initEmpCategoryTable();
        this.loadCfgData(2);
      } else {
        this.tableData = [];
        this.tableData.push({ empCategory: 0, empCategoryStr: '全部' });
        this.loadCfgData(1);
      }
    },
    submitData() {
      let data = this.formObjs;
      if (this.type == 1) {
        //全部
        let isstart = 'isStart_0';
        let rechargeType_0_walletNum_1 = 'rechargeType_0_walletNum_1';
        let rechargeAmount_0_walletNum_1 = 'rechargeAmount_0_walletNum_1';
        let rechargeType_0_walletNum_2 = 'rechargeType_0_walletNum_2';
        let rechargeAmount_0_walletNum_2 = 'rechargeAmount_0_walletNum_2';
        let rechargeType_0_walletNum_3 = 'rechargeType_0_walletNum_3';
        let rechargeAmount_0_walletNum_3 = 'rechargeAmount_0_walletNum_3';
        let rechargePlanDate = 'rechargePlanDate_' + 0;

        if (!data[isstart]) {
          // this.$message.warning("请启用后在提交")
          // return;
        }
        if (!data[rechargeType_0_walletNum_1]) {
          this.$message.warning('补贴钱包1充值类型不能为空');
          return;
        }
        if (!data[rechargeAmount_0_walletNum_1]) {
          this.$message.warning('补贴钱包1充值金额不能为空');
          return;
        }
        if (!data[rechargeType_0_walletNum_2]) {
          this.$message.warning('补贴钱包2充值类型不能为空');
          return;
        }
        if (!data[rechargeAmount_0_walletNum_2]) {
          this.$message.warning('补贴钱包2充值金额不能为空');
          return;
        }
        if (!data[rechargeType_0_walletNum_3]) {
          this.$message.warning('补贴钱包3充值类型不能为空');
          return;
        }
        if (!data[rechargeAmount_0_walletNum_3]) {
          this.$message.warning('补贴钱包3充值金额不能为空');
          return;
        }
        if (!data[rechargePlanDate]) {
          this.$message.warning('充值日期不能为空');
          return;
        }
      }
      if (this.type == 2) {
        if (JSON.stringify(data) == '{}') {
          this.$message.warning('至至少开启1个在提交。');
          return;
        }
        //分类
        for (var key in data) {
          if (key.startsWith('isStart')) {
            let empCategory = key.split('_')[1];
            let isstart = 'isStart_' + empCategory;
            let rechargeType_walletNum_1 = 'rechargeType_' + empCategory + '_walletNum_1';
            let rechargeAmount_0_walletNum_1 = 'rechargeAmount_' + empCategory + '_walletNum_1';
            let rechargeType_0_walletNum_2 = 'rechargeType_' + empCategory + '_walletNum_2';
            let rechargeAmount_0_walletNum_2 = 'rechargeAmount_' + empCategory + '_walletNum_2';
            let rechargeType_0_walletNum_3 = 'rechargeType_' + empCategory + '_walletNum_3';
            let rechargeAmount_0_walletNum_3 = 'rechargeAmount_' + empCategory + '_walletNum_3';
            let rechargePlanDate = 'rechargePlanDate_' + empCategory;
            let empCategoryStr = '';
            this.empCategorys.forEach(e => {
              if (e.dictKey == empCategory) {
                empCategoryStr = e.dictValue;
              }
            });
            if (!data[isstart]) {
              // this.$message.warning(empCategoryStr+"请启用后在提交")
              //  return;
            }
            if (!data[rechargeType_walletNum_1]) {
              this.$message.warning(empCategoryStr + '补贴钱包1充值类型不能为空');
              return;
            }
            if (!data[rechargeAmount_0_walletNum_1]) {
              this.$message.warning(empCategoryStr + '补贴钱包2充值金额不能为空');
              return;
            }
            if (!data[rechargeType_0_walletNum_2]) {
              this.$message.warning(empCategoryStr + '补贴钱包1充值类型不能为空');
              return;
            }
            if (!data[rechargeAmount_0_walletNum_2]) {
              this.$message.warning(empCategoryStr + '补贴钱包2充值金额不能为空');
              return;
            }
            if (!data[rechargeType_0_walletNum_3]) {
              this.$message.warning(empCategoryStr + '补贴钱包3充值类型不能为空');
              return;
            }
            if (!data[rechargeAmount_0_walletNum_3]) {
              this.$message.warning(empCategoryStr + '补贴钱包3充值金额不能为空');
              return;
            }
            if (!data[rechargePlanDate]) {
              this.$message.warning(empCategoryStr + '充值日期不能为空');
              return;
            }
          }
        }
      }
      subsidyAutoRecharge(this.formObjs).then(res => {
        this.$message.success(res.data.msg);
      });
    }
  },
  computed: {
    days() {
      let arr = [];
      for (var i = 1; i <= 28; i++) {
        arr.push(i);
      }
      return arr;
    }
  }
};
</script>

<style lang="scss" scoped>
.tipcls {
  font-size: 13px;
  line-height: 10px;
  background: #f5f6f7;
  padding: 20px;
  margin-top: 5px;
  color: #666;
  margin-bottom: 15px;
}
.tipcls > p ~ p {
  margin-left: 24px;
}

</style>
