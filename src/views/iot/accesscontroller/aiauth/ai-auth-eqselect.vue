<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <basic-container style="padding: 0 !important;">
        <div style="overflow: auto;" :style="{height:ztreeHeight+'px'}">
          <dev-ztree ref="devZtreeRef" :isCheck="true" :type="2" @onCheck="onChecKEq"></dev-ztree>
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
          <el-select v-model="devType" placeholder="请选择设备类型" size="mini" style="width: 200px;margin-right: 10px;">
            <el-option
              v-for="item in devTypeDic"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
          @checkbox-all="selectionChange"
          style="margin-bottom: 8px;">
        </vxe-grid>
     </basic-container>
    </el-col>
  </el-row>
</template>

<script>
  import { getFaceDevList } from "@/api/iot/access/icauth";
  import {mapGetters} from "vuex";
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  import devZtree from "@/components/devztree/index.vue"
  import { isDevAi } from "@/util/trans.js"

  export default{
    name:'eq-select',
    components: { devZtree },
    data() {
      return {
        search:'',
        loading:false,
        eqdata:[],
        tableHeight:0,
        ztreeHeight:0,
        devParamQuery:"",
        devTypeDic:[
          {value:2,label:"IOT-Y"},{value:7,label:"IOT-H"}
        ],
        devType:7,
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
            title: "方向",
            field: "direction",
            sortable:true,
            minWidth:100,
          },
          {
            title: "设备IP",
            field: "devIp",
            minWidth:100,
            sortable:true,
          },
        ]
      },
    },
    mounted(){
      this.tableHeight=window.innerHeight-413+36+69;
      this.ztreeHeight=window.innerHeight-263;
      this.onLoad()
    },
    methods: {
      onLoad(params = {}){
        if(this.devParamQuery){
          params['devParamQuery'] = this.devParamQuery.trim()
        }
        if(this.devType){
          params['devType'] = this.devType;
        }
        getFaceDevList(params).then(res=>{
          var data = res.data.data;
          this.eqdata = data;
        });
      },
      reset(){
        this.devParamQuery = ""
        this.devType = 7
        this.onLoad();
        this.$refs.devZtreeRef.initEquipmentTreeData();
      },
      onChecKEq(ztreeNode){
        let ids = [];
        ztreeNode.forEach(v => {
          let arr = v.valueStr.split('-')
          if(isDevAi(arr[2]*1)){
            ids.push(arr[1])
          }
        })
        this.onLoad({"ids":ids.join(',')})
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
