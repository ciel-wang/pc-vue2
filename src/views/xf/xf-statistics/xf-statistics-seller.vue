<template>
  <div>
    <div style="margin-bottom: 8px;">
      <el-select v-model="walletNum" clearable="true" size="small" placeholder="选择钱包" style="width: 160px;">
        <el-option v-for="item in walletLists" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-date-picker
        v-model="accTransTime"
        size="small"
        value-format="yyyy-MM-dd"
        type="daterange"
        :clearable="false"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
         style="width: 250px;margin: 0 10px;"
      ></el-date-picker>
      <el-input
        style="width: 200px;"
        v-model="moreQueryParam"
        :clearable="true"
        @keyup.enter.native="search"
        size="small"
        placeholder="请输入商户名称" />
      <el-radio-group v-model="showType" size="small" style="margin: 0 10px;">
        <el-radio-button label="按时段统计"></el-radio-button>
        <el-radio-button label="按日统计"></el-radio-button>
      </el-radio-group>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button type="primary" size="small" icon="" @click="handleExport" v-if="permission.statistics_seller_export_btn">导出</el-button>
    </div>
    <vxe-grid
      v-show="activeName == 'seller'"
      :sync-resize="activeName"
      border
      resizable
      highlight-hover-row
      :height="tableHeight.height"
      ref="crud"
      size="mini"
      align="center"
      :highlight="true"
      show-footer
      class="mytable-footer"
      :footer-method="footerMethod"
      :footer-row-class-name="footerRowClass"
      :columns="options"
      :loading="loading"
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
import { getXfStatisticsBySeller, updateSellerXfStatistics } from '@/api/xf/xfdetails';
import website from '@/config/website';
import { getToken } from '@/util/auth';

export default {
  props:['activeName'],
  data() {
    return {
      walletLists: [
        { label: '总资产', value: 100 },
        { label: '个人钱包', value: 0 },
        { label: '补贴钱包1', value: 1 },
        { label: '补贴钱包2', value: 2 },
        { label: '补贴钱包3', value: 3 }
      ],
      showType: '按时段统计',
      walletNum: 100,
      accTransTime: '',
      isDisabled: false,
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
    options() {
      return [
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '消费日期',
          field: 'transTime',
          sortable: true,
          minWidth: 150,
          fixed: 'left',
        },
        {
          title: '商户名称',
          field: 'entityName',
          sortable: true,
          fixed: 'left',
          minWidth: 100,
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '实际消费金额',
          field: 'realTotalMoney',
          width: 120,
          sortable: true,
        },
        {
          title: '多扣纠错金额',
          field: 'dkjcTotalMoney',
          width: 120,
          sortable: true,
        },
        {
          title: '总消费',
          field: 'totalMoney',
          sortable: true,
          width: 110,
        },
        {
          title: '总人数',
          field: 'personTotalCount',
          sortable: true,
          width: 110,
        },
        {
          title: '总次数',
          field: 'totalCount',
          sortable: true,
          width: 110,
        },
        {
          title: '早餐',
          field: 'SYS_1_totalCount',
          children: [
            {
              title: '人数 / 次数',
              field: 'SYS_MEAL_1',
              width: 110,
              sortable: true,
            },
            {
              title: '金额',
              field: 'SYS_MEAL_1_totalMoney',
              width: 100,
              sortable: true,
            }
          ]
        },
        {
          title: '午餐',
          field: 'SYS_2_totalCount',
          children: [
            {
              title: '人数 / 次数',
              field: 'SYS_MEAL_2',
              width: 110,
              sortable: true,
            },
            {
              title: '金额',
              field: 'SYS_MEAL_2_totalMoney',
              width: 100,
              sortable: true,
            }
          ]
        },
        {
          title: '晚餐',
          field: 'SYS_3_totalCount',
          children: [
            {
              title: '人数 / 次数',
              field: 'SYS_MEAL_3',
              width: 110,
              sortable: true,
            },
            {
              title: '金额',
              field: 'SYS_MEAL_3_totalMoney',
              width: 100,
              sortable: true,
            }
          ]
        },
        {
          title: '夜宵',
          field: 'SYS_4_totalCount',
          children: [
            {
              title: '人数 / 次数',
              field: 'SYS_MEAL_4',
              width: 110,
              sortable: true,
            },
            {
              title: '金额',
              field: 'SYS_MEAL_4_totalMoney',
              width: 100,
              sortable: true,
            }
          ]
        },
        {
          title: '其他',
          field: 'SYS_5_totalCount',
          children: [
            {
              title: '人数 / 次数',
              field: 'SYS_MEAL_5',
              width: 110,
              sortable: true,
            },
            {
              title: '金额',
              field: 'SYS_MEAL_5_totalMoney',
              width: 100,
              sortable: true,
            }
          ]
        }
      ]
    },
    tableHeight() {
      return {
        height: window.innerHeight - 326
      };
    }
  },
  mounted() {
    let monthLastDay = moment().format('YYYY-MM-DD');
    let monthStartDay = moment().format('YYYY-MM-DD');
    this.accTransTime = [monthStartDay, monthLastDay];
    this.onLoad(this.page);
  },
  methods: {
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
          if (['realTotalMoney'].includes(column.property)) {
            return this.sumNum(data, 'realTotalMoney');
          }
          if (['dkjcTotalMoney'].includes(column.property)) {
            return this.sumNum(data, 'dkjcTotalMoney');
          }
          if (['totalMoney'].includes(column.property)) {
            return this.sumNum(data, 'totalMoney');
          }
          if (['personTotalCount'].includes(column.property)) {
            return this.sumNum(data, 'personTotalCount');
          }
          if (['totalCount'].includes(column.property)) {
            return this.sumNum(data, 'totalCount');
          }
          if (['SYS_MEAL_1_totalMoney'].includes(column.property)) {
            return this.sumNum(data, 'SYS_MEAL_1_totalMoney');
          }
          if (['SYS_MEAL_2_totalMoney'].includes(column.property)) {
            return this.sumNum(data, 'SYS_MEAL_2_totalMoney');
          }
          if (['SYS_MEAL_3_totalMoney'].includes(column.property)) {
            return this.sumNum(data, 'SYS_MEAL_3_totalMoney');
          }
          if (['SYS_MEAL_4_totalMoney'].includes(column.property)) {
            return this.sumNum(data, 'SYS_MEAL_4_totalMoney');
          }
          if (['SYS_MEAL_5_totalMoney'].includes(column.property)) {
            return this.sumNum(data, 'SYS_MEAL_5_totalMoney');
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
    },
    onLoad(page, params = {}) {
      this.loading = true;
      params['moreParamQuery'] = this.moreQueryParam.trim();
      params['walletNum'] = this.walletNum;
      params['showType'] = this.showType;
      if (this.accTransTime) {
        params['accTransStartTime'] = this.accTransTime[0];
        params['accTransEndTime'] = this.accTransTime[1];
      }
      if (this.order) {
        params['sortField'] = 'totalMoney';
        params['sortType'] = this.order;
      }
      getXfStatisticsBySeller(this.page.currentPage, this.page.pageSize, params).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          v.SYS_MEAL_1 = v.SYS_MEAL_1_personCount + ' / ' + v.SYS_MEAL_1_totalCount;
          v.SYS_MEAL_2 = v.SYS_MEAL_2_personCount + ' / ' + v.SYS_MEAL_2_totalCount;
          v.SYS_MEAL_3 = v.SYS_MEAL_3_personCount + ' / ' + v.SYS_MEAL_3_totalCount;
          v.SYS_MEAL_4 = v.SYS_MEAL_4_personCount + ' / ' + v.SYS_MEAL_4_totalCount;
          v.SYS_MEAL_5 = v.SYS_MEAL_5_personCount + ' / ' + v.SYS_MEAL_5_totalCount;
          v.totalCount = v.totalCount * 1;
        });
        this.data = data.records;
        this.loading = false;
      });
    },
    statisticsData() {
      this.statisticsBtn = '统计中';
      this.isDisabled = true;
      this.$message({
        type: 'success',
        message: '数据正在统计中，请不要重复点击，等待统计完成'
      });
      let params = {};
      params['startTime'] = this.accTransTime[0];
      params['endTime'] = this.accTransTime[1];
      updateSellerXfStatistics(params).then(res => {
        this.$message({
          type: 'success',
          message: '数据统计成功'
        });
        this.isDisabled = false;
        this.statisticsBtn = '统计';
      });
    },
    search() {
      this.page.currentPage = 1
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
      this.$confirm('是否导出当前消费统计信息?', '提示', {
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
          `/api/iot-xf/xfstatistics/seller/list/export?current=${this.page.currentPage}&size=${this.page.pageSize}&walletNum=${this.walletNum}&showType=${showType}&accTransStartTime=${accTransStartTime}&accTransEndTime=${accTransEndTime}&${this.website.tokenHeader}=${getToken()}&ids=${ids}&moreParamQuery=${this.moreQueryParam.trim()}`
        );
      });
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
