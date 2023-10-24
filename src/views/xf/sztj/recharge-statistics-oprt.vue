<template>
  <div>
    <div style="margin-bottom: 8px;">
      <el-date-picker
        v-model="accTransTime"
        size="small"
        :clearable="false"
        value-format="yyyy-MM-dd"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 250px;"
      ></el-date-picker>
      <el-radio-group v-model="showType" size="small" style="margin: 0 10px;">
        <el-radio-button label="按时段统计"></el-radio-button>
        <el-radio-button label="按日统计"></el-radio-button>
      </el-radio-group>
      <el-input
        v-model="moreQueryParam"
        clearable
        size="small"
        placeholder="请输入操作员姓名"
        @keyup.enter.native="search"
        style="width: 160px;margin-right: 10px;"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button
        type="primary"
        size="small"
        v-if="permission.sztj_oprt_export_btn"
        @click="handleExport">导出</el-button>
    </div>
    <vxe-grid
      v-show="activeName == 'oprt'"
      :sync-resize="activeName"
      border
      resizable
      highlight-hover-row
      :height="tableHeight.height"
      ref="crud"
      size="mini"
      align="center"
      show-footer
      class="mytable-footer"
      :footer-method="footerMethod"
      :footer-row-class-name="footerRowClass"
      :highlight="true"
      :columns="options"
      :loading="loading"
      :checkbox-config="{checkField:'checked'}"
      :seq-config="{ startIndex: (page.currentPage - 1) * page.pageSize }"
      :data="data"
      :export-config="{}"
    ></vxe-grid>
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
        :hide-on-single-page="false"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';
import { getXfStatistticsList } from '@/api/xf/szdetails';
import website from '@/config/website';
import { getToken } from '@/util/auth';

export default {
  props:['activeName'],
  data() {
    return {
      showType: '按时段统计',
      accTransTime: '',
      selectionList: [],
      moreQueryParam: '',
      loading: false,
      ids: '',
      data: [],
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      }
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'permission', 'btnicon']),
    tableHeight() {
      return {
        height: window.innerHeight - 326
      };
    },
    options() {
      return [
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '收支日期',
          field: 'transTime',
          sortable: true,
          width: 150,
          fixed: 'left',
        },
        {
          title: '操作员',
          field: 'username',
          sortable: true,
          width: 100,
          fixed: 'left',
        },
        {
          title: '总收入',
          field: 'totalInMoney',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '总支出',
          field: 'totalOutMoney',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '净收入',
          field: 'inMoney',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '有卡充值',
          field: 'haveCardMoney',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '无卡充值',
          field: 'noCardMoney',
          sortable: true,
          width: 100,
        },
        {
          title: '第三方充值',
          field: 'totalInOtherMoney',
          sortable: true,
          width: 100,
        },
        {
          title: "第三方提现",
          field: "txOutMoney",
          sortable: true,
          width: 100,
        },
        {
          title: '管理费',
          field: 'mngMoney',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '补贴充值',
          field: 'totalMoney',
          children: [
            {
              title: '补贴钱包1',
              field: 'btSubsidy1Wallet',
              minWidth: 100,
              sortable: true,
            },
            {
              title: '补贴钱包2',
              field: 'btSubsidy2Wallet',
              minWidth: 100,
              sortable: true,
            },
            {
              title: '补贴钱包3',
              field: 'btSubsidy3Wallet',
              minWidth: 100,
              sortable: true,
            }
          ]
        },
        {
          title: '退款',
          field: 'totalMoney2',
          children: [
            {
              title: '个人钱包',
              field: 'tkPersonalWallet',
              minWidth: 100,
              sortable: true,
            },
            {
              title: '补贴钱包1',
              field: 'tkSubsidy1Wallet',
              minWidth: 100,
              sortable: true,
            },
            {
              title: '补贴钱包2',
              field: 'tkSubsidy2Wallet',
              minWidth: 100,
              sortable: true,
            },
            {
              title: '补贴钱包3',
              field: 'tkSubsidy3Wallet',
              minWidth: 100,
              sortable: true,
            }
          ]
        },
        {
          title: '补贴清零',
          field: 'btql',
          children: [
            {
              title: '补贴钱包1',
              field: 'btqlSubsidy1Wallet',
              minWidth: 100,
              sortable: true,
            },
            {
              title: '补贴钱包2',
              field: 'btqlSubsidy2Wallet',
              minWidth: 100,
              sortable: true,
            },
            {
              title: '补贴钱包3',
              field: 'btqlSubsidy3Wallet',
              minWidth: 100,
              sortable: true,
            }
          ]
        },
        {
          title: '节能钱包转出',
          field: 'zz',
          children: [
            {
              title: '个人钱包',
              field: 'zzPersonalWallet',
              minWidth: 100,
              sortable: true,
            },
            {
              title: '补贴钱包1',
              field: 'zzSubsidy1Wallet',
              minWidth: 100,
              sortable: true,
            },
            {
              title: '补贴钱包2',
              field: 'zzSubsidy2Wallet',
              minWidth: 100,
              sortable: true,
            },
            {
              title: '补贴钱包3',
              field: 'zzSubsidy3Wallet',
              minWidth: 100,
              sortable: true,
            }
          ]
        },
        {
          title: '节能钱包转入',
          children: [
            {
              title: '个人钱包',
              field: 'zrPersonalWallet',
              minWidth: 100,
            },
            {
              title: '补贴钱包1',
              field: 'zrSubsidy1Wallet',
              minWidth: 100,
            },
            {
              title: '补贴钱包2',
              field: 'zrSubsidy2Wallet',
              minWidth: 100,
            },
            {
              title: '补贴钱包3',
              field: 'zrSubsidy3Wallet',
              minWidth: 100,
            }
          ]
        }
      ]
    }
  },
  mounted() {
    let monthLastDay = moment().subtract(0, 'days').format('YYYY-MM-DD');
    let monthStartDay = moment().subtract(0, 'days').format('YYYY-MM-DD');
    this.accTransTime = [monthStartDay, monthLastDay];
    this.onLoad(this.page);
  },
  methods: {
    onLoad(page, params = {}) {
      this.loading = true;
      params['moreParamQuery'] = this.moreQueryParam.trim();
      params['showType'] = this.showType;
      if (this.accTransTime) {
        params['accTransStartTime'] = this.accTransTime[0];
        params['accTransEndTime'] = this.accTransTime[1];
      }
      getXfStatistticsList(this.page.currentPage, this.page.pageSize, params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => v.checked = false);
        this.data = data.records;
        this.loading = false;
      });
    },
    statisticsData() {
      this.$message({
        type: 'success',
        message: '数据正在统计中，请不要重复点击，等待统计完成'
      });
      // updateSellerXfStatistics().then(res => {
      //   this.$message({
      //     type: 'success',
      //     message: '数据统计成功'
      //   });
      // });
    },
    search() {
      this.onLoad(this.page);
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
      this.$confirm('是否导出当前收支统计信息?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = '';
        if (this.selectionList.length > 0) {
          this.selectionList.forEach(v => {
            ids = ids + ',' + v.id;
          });
        }
        ids = ids.substring(1, ids.length);
        let accTransStartTime = '';
        let accTransEndTime = '';
        if (this.accTransTime) {
          accTransStartTime = this.accTransTime[0];
          accTransEndTime = this.accTransTime[1];
        }
        let showType = this.showType;
        window.open(
          `/api/iot-xf/szstatistics/oprt/list/export?current=${this.page.currentPage}&size=${this.page.pageSize}&showType=${showType}&accTransStartTime=${accTransStartTime}&accTransEndTime=${accTransEndTime}&${this.website.tokenHeader}=${getToken()}&ids=${ids}&moreParamQuery=${this.moreQueryParam}`
        );
      });
    },
    sumNum(list, field) {
      let count = 0;
      list.forEach(item => {
        count += Number(item[field]);
      });
      return count.toFixed(2);
    },
    footerMethod({ columns, data }) {
      const footerData = [
        columns.map((column, _columnIndex) => {
          if (_columnIndex === 0) {
            return '总计';
          }
          if (['totalInMoney'].includes(column.property)) {
            return this.sumNum(data, 'totalInMoney');
          }
          if (['totalOutMoney'].includes(column.property)) {
            return this.sumNum(data, 'totalOutMoney');
          }
          if (['inMoney'].includes(column.property)) {
            return this.sumNum(data, 'inMoney');
          }
          if (['haveCardMoney'].includes(column.property)) {
            return this.sumNum(data, 'haveCardMoney');
          }
          if (['noCardMoney'].includes(column.property)) {
            return this.sumNum(data, 'noCardMoney');
          }
          if (['mngMoney'].includes(column.property)) {
            return this.sumNum(data, 'mngMoney');
          }
          if (['btSubsidy1Wallet'].includes(column.property)) {
            return this.sumNum(data, 'btSubsidy1Wallet');
          }
          if (['btSubsidy2Wallet'].includes(column.property)) {
            return this.sumNum(data, 'btSubsidy2Wallet');
          }
          if (['btSubsidy3Wallet'].includes(column.property)) {
            return this.sumNum(data, 'btSubsidy3Wallet');
          }
          if (['tkPersonalWallet'].includes(column.property)) {
            return this.sumNum(data, 'tkPersonalWallet');
          }
          if (['tkSubsidy1Wallet'].includes(column.property)) {
            return this.sumNum(data, 'tkSubsidy1Wallet');
          }
          if (['tkSubsidy2Wallet'].includes(column.property)) {
            return this.sumNum(data, 'tkSubsidy2Wallet');
          }
          if (['tkSubsidy3Wallet'].includes(column.property)) {
            return this.sumNum(data, 'tkSubsidy3Wallet');
          }
          if (['btqlSubsidy1Wallet'].includes(column.property)) {
            return this.sumNum(data, 'btqlSubsidy1Wallet');
          }
          if (['btqlSubsidy2Wallet'].includes(column.property)) {
            return this.sumNum(data, 'btqlSubsidy2Wallet');
          }
          if (['btqlSubsidy3Wallet'].includes(column.property)) {
            return this.sumNum(data, 'btqlSubsidy3Wallet');
          }
          if (['zzPersonalWallet'].includes(column.property)) {
            return this.sumNum(data, 'zzPersonalWallet');
          }
          if (['zzSubsidy1Wallet'].includes(column.property)) {
            return this.sumNum(data, 'zzSubsidy1Wallet');
          }
          if (['zzSubsidy2Wallet'].includes(column.property)) {
            return this.sumNum(data, 'zzSubsidy2Wallet');
          }
          if (['zzSubsidy3Wallet'].includes(column.property)) {
            return this.sumNum(data, 'zzSubsidy3Wallet');
          }
          if (['totalInOtherMoney'].includes(column.property)) {
            return this.sumNum(data, 'totalInOtherMoney');
          }
          if (['txOutMoney'].includes(column.property)) {
            return this.sumNum(data, 'txOutMoney');
          }
          if (['zrPersonalWallet'].includes(column.property)) {
            return this.sumNum(data, 'zrPersonalWallet');
          }
          if (['zrSubsidy1Wallet'].includes(column.property)) {
            return this.sumNum(data, 'zrSubsidy1Wallet');
          }
          if (['zrSubsidy2Wallet'].includes(column.property)) {
            return this.sumNum(data, 'zrSubsidy2Wallet');
          }
          if (['zrSubsidy3Wallet'].includes(column.property)) {
            return this.sumNum(data, 'zrSubsidy3Wallet');
          }
          return null;
        })
      ];
      return footerData;
    },
    footerRowClass({ $rowIndex }) {
      if ($rowIndex == 0) {
        return 'row-bgcolor';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.mytable-footer .row-bgcolor {
  background-color: #ccc;
  color: #000;
  font-weight: 600;
}
</style>
