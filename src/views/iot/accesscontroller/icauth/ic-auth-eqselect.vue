<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <basic-container style="padding: 0 !important;">
        <div style="overflow: auto;" :style="{height:ztreeHeight+'px'}">
          <dev-ztree ref="devZtreeRef" :isCheck="true" @onCheck="onChecKEq" :type="1"></dev-ztree>
        </div>
      </basic-container>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container style="padding: 0 0 0 6px !important;">
        <div style="margin-bottom: 8px;">
          <el-input
            size="mini"
            style="width: 200px;margin-right: 10px;"
            v-model="devParamQuery"
            clearable
            placeholder="请输入设备编号/名称"
            @keyup.enter.native="onLoad"></el-input>
          <el-input
            size="mini"
            style="width: 200px;margin-right: 10px;"
            v-model="doorName"
            clearable
            placeholder="请输入门区名称"
            @keyup.enter.native="onLoad"></el-input>
          <el-button type="primary"
                     size="mini"
                     icon="el-icon-search"
                     @click="onLoad">搜索
          </el-button>
          <el-button type="default"
                     size="mini"
                     icon="el-icon-refresh"
                     @click="reset">重置
          </el-button>
        </div>
        <vxe-grid
          border
          resizable
          auto-resize
          highlight-hover-row
          :height="tableHeight"
          ref="deptCrud"
          size="mini"
          align="center"
          :columns="equipmentOptions"
          :data="eqdata"
          :loading="loading"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
        </vxe-grid>
        <div class="page_class">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page.currentPage"
            :page-sizes="[50, 100,200, 500,1000]"
            :page-size="page.pageSize"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="page.total"
            :hide-on-single-page="false">
          </el-pagination>
        </div>
     </basic-container>
    </el-col>
  </el-row>
</template>

<script>
  import { getDevAreaDoorDetails} from "@/api/iot/access/icauth";
  import {mapGetters} from "vuex";
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  import devZtree from "@/components/devztree/index.vue"
  import { isDevIc } from "@/util/trans.js"

  export default {
    name:'eq-select',
    components: { devZtree},
    data() {
      return {
        search:'',
        loading:false,
        eqdata:[],
        page:{
          pageSize: 3000,
          currentPage: 1,
          total: 0
        },
        tableHeight:0,
        ztreeHeight:0,
        devParamQuery:"",
        doorName:""
      }
    },
    computed: {
      ...mapGetters(["colorName"]),
      equipmentOptions(){
        return [
          { type: 'checkbox', width: 70},
          {type:"seq",title:"序号",width:70},
          {
            title: "设备编号",
            field: "devCode",
            minWidth:100,
            sortable:true,
          },
          {
            title: "设备名称",
            field: "devName",
            sortable:true,
            minWidth:100,
          },
          {
            title: "门区",
            field: "doorName",
            sortable:true,
            minWidth:100,
          },
          {
            title: "安装位置",
            field: "position",
            sortable:true,
            minWidth:100,
          },
          {
            title: "设备IP",
            field: "devIp",
            sortable:true,
            minWidth:140,
          },
        ]
      },
    },
    mounted(){
      this.tableHeight=window.innerHeight-413+36;
      this.ztreeHeight=window.innerHeight-263;
      this.onLoad()
    },
    methods: {
      onChecKEq(ztreeNode){
        let ids = ztreeNode.filter(v => v.valueStr.startsWith('D')).map(v => v.value);
        this.onLoad({"doorIds":ids.join(',')})
      },
      onLoad(params = {}){
        params['doorName'] = this.doorName.trim()
        params['devParamQuery'] = this.devParamQuery.trim()
        params["devType"] = 1;
        getDevAreaDoorDetails(params).then(res=>{
          var data = res.data.data;
          this.eqdata = data;
        });
      },
      reset(){
        this.doorName = ""
        this.devParamQuery = ""
        this.onLoad()
        this.$refs.devZtreeRef.initEquipmentTreeData();
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
      selectionChange({records}){
        this.$emit("changeTreeData",records)
      },
    }
  };
</script>

<style scoped="scoped">
  .center_open::before{
    left : 7px !important;
  }
  >>>.el-card__body{
    padding: 20px 20px 0 !important;
  }
  >>>.vxe-table--render-default .vxe-table--body, >>>.vxe-table--render-default .vxe-table--footer, >>>.vxe-table--render-default .vxe-table--header{
    width: 100% !important;
  }
  .right_arw_icn{
    left: 6px !important;
  }
</style>
