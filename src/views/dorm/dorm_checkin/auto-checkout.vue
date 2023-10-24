<template>
  <el-dialog
    title="批量退宿"
    :visible.sync="autoCheckoutVisible"
    width="50%"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleClose">
    <div style="margin-bottom: 8px;">
      <avue-input-tree
        ref="tree"
        include-half-checked=""
        multiple
        v-model="ancestors2"
        placeholder="请选择楼栋"
        type="tree"
        size="small"
        class="ztreeClass"
        style="width: 180px;height: 21px;"
        @keyup.enter.native="autoCheckoutList"
        :props="{value:'valueStr'}"
        :dic="dormIdDic"></avue-input-tree>
      <el-input
        size="small"
        style="width: 150px;margin: 0 10px;"
        clearable
        @keyup.enter.native="autoCheckoutList"
        v-model="dormName2"
        placeholder="请输入宿舍编号">
      </el-input>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-search"
        @click="autoCheckoutList">
        搜索</el-button>
      <el-button
        type="default"
        size="small"
        icon="el-icon-refresh"
        @click="autoCheckoutReset">
        重置</el-button>
      <el-button
        type="primary"
        size="small"
        @click="autoCheckout2">
        批量退宿</el-button>
    </div>
    <vxe-table
      border
      auto-resize
      ref="tableRef"
      highlight-hover-column
      highlight-current-column
      size="mini"
      height="500px"
      align="center"
      :loading="loading"
      :data="dormData"
      @checkbox-change="checkboxChangeEvent2"
      @checkbox-all="checkboxChangeEvent2">
      <vxe-table-column width="50" type='checkbox'></vxe-table-column>
      <vxe-table-column title="学校名称" minWidth="70" field="schoolName"></vxe-table-column>
      <vxe-table-column title="楼栋" minWidth="70" field="floorName"></vxe-table-column>
      <vxe-table-column title="楼层" minWidth="70" field="floorLayerName"></vxe-table-column>
      <vxe-table-column title="宿舍编号" minWidth="60" field="dormName"></vxe-table-column>
      <vxe-table-column title="床位数" minWidth="80" field="badCount"></vxe-table-column>
      <vxe-table-column title="实际入住人数" minWidth="100" field="realLiveCount"></vxe-table-column>
    </vxe-table>
    <div style="min-height: 52px;text-align: right;padding-top: 25px;">
      <el-pagination
        @size-change="handleSizeChange2"
        @current-change="handleCurrentChange2"
        :current-page="page2.currentPage"
        :page-sizes="[200, 400, 500,1000]"
        :page-size="page2.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page2.total"
        :hide-on-single-page="false">
      </el-pagination>
    </div>
  </el-dialog>
</template>

<script>
  import { getDormZtree } from "@/api/dorm/dorm_mng.js";
  import moment from 'moment'
  import { autoCheckoutData } from "@/api/dorm/dorm_checkin.js"

  export default{
    props:{
      dormType:{
        type:Number,
        default:1
      }
    },
    data(){
      return{
        autoCheckoutVisible:false,
        ancestors2:[],
        dormName2:"",
        loading:false,
        dormData:[],
        page2:{
          pageSize:100,
          currentPage:1,
          total:0
        },
        selectionList2:[],
        dormIdDic:[]
      }
    },
    methods:{
      openDialog(){
        this.autoCheckoutVisible = true
        this.selectionList2 = []
        this.autoCheckoutList();
        getDormZtree({stype:'DORM'}).then(r => {
          this.dormIdDic = r.data;
        })
      },
      trans(arr){
        for(let i = 0;i<arr.length;i++){
          let arr1 = arr[i].valueStr.split('-')
          if(arr1[0] == 'DORM' && arr1[2] == 2){
            arr.splice(i,1)
            i--;
          }
          if(arr[i] && arr[i].children){
            this.trans(arr[i].children)
          }
        }
      },
      autoCheckout2(){
        if (this.selectionList2.length == 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        let arr = []
        this.selectionList2.forEach(v => {
          arr.push(v.id)
        })
        let form = {}
        form['dormIds'] = arr.join(',')
        form['leaveDate'] = moment().format('yyyy-MM-DD');
        this.$emit('getAutoCheckoutData',form)
      },
      autoCheckoutList(){
        this.page2.currentPage = 1;
        this.onLoad()
      },
      onLoad(){
        let params = {}
        params['size'] = this.page2.pageSize
        params['current'] = this.page2.currentPage
        params['dormType'] = this.dormType;
        params['ancestors'] = this.ancestors2.join(',')
        params['dormName'] = this.dormName2
        this.loading = true;
        autoCheckoutData(params).then(r => {
          this.loading = false
          let d = r.data.data
          this.page2.total = d.total;
          this.dormData = d.records;
        })
      },
      autoCheckoutReset(){
        this.ancestors2 = []
        this.dormName2 = ""
        this.autoCheckoutList()
      },
      checkboxChangeEvent2({records}){
        this.selectionList2 = records;
      },
      handleSizeChange2(val) {
        this.page2.currentPage = 1;
        this.page2.pageSize = val;
        this.onLoad()
      },
      handleCurrentChange2(val) {
        this.page2.currentPage = val;
        this.onLoad()
      },
      handleClose(){
        this.ancestors2 = []
        this.dormName2 = ""
        this.autoCheckoutVisible = false
      }
    }
  }
</script>

<style lang="scss" scoped="scoped">
  .ztreeClass{
    height: 21px;
    /deep/.el-input--small /deep/.el-input__inner{
      height: 32px !important;
    }
    /deep/.el-select__tags{
      height: 100%;
      overflow: hidden;
    }
  }
</style>
