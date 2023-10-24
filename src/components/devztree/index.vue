<template>
  <vue-magic-tree
    :setting="equipmentSetting"
    :nodes="eqNodes"
    ref="devZtreeRef"
    @onClick="onClick"
    @onCheck="onCheck"
  />
</template>

<script>
  import VueMagicTree from 'vue-magic-tree'
  import { getAreaAllEquipmentTree} from "@/api/iot/access/icauth";
  import {mapGetters} from "vuex";
  import website from '@/config/website';
  import {getToken} from '@/util/auth';

  export default {
    name:'iot-dev-tree',
    components: {
      VueMagicTree, // 引入组件包
    },
    props:{
      isCheck:{
        type:Boolean,
        default:false
      },
      type:{
        type:[Number,String],
        default:""
      }
    },
    data() {
      return {
        eqdata:[],
        equipmentSetting: {
          edit: {
            enable: false,
            drag: {
              isMove: false
            },
            showRemoveBtn: false,
            showRenameBtn: false
          },
          check: {
            enable: this.isCheck,
          },
          data: {
            simpleData: {
              enable: true,
              pIdKey: "parentId"
            },
            // 设置图标库(采用iconfont class形式)
            iconMap: {
              0: 'icon-xiaoyuan',
              1: 'icon-quyu',
              2: 'icon-menjinguanli1',
              3: 'icon-iot-accesscontroller-auth-ai',
              4: 'icon-menqu',
            },
            // 设置对应每个节点的节点类型，与数据中customType对应(25行)
            key: {
              nodeType: 'customType'
            }
          },
          view: {
            // 开启图标显示功能
            showIcon: true,
          },
        },
        eqNodes:[],
      }
    },
    watch: {
    },
    computed: {
      ...mapGetters(["colorName"]),
    },
    mounted(){
      this.initEquipmentTreeData();
    },
    methods: {
      initEquipmentTreeData(){
        getAreaAllEquipmentTree().then(res=>{
          //申明一个数组
          var arr = [];
          //对返回的数据类型进行转换
          this.transTreeDataEq(res.data.data,arr)
          this.eqNodes = arr;
        });
      },
      //递归调用，对数据进行处理
      transTreeDataEq(datas,arr){
        if(datas.length){
           for(var i=0;i<datas.length;i++){
             let data = datas[i];
             var parentId = data.treePid
             var customType = 0;
             if(data.flag == "SCHOOL" || data.flag == 'XQ'){
               customType = 0
             }else if(data.flag == "area"){
               customType = 1
             }else if(data.flag == "equipment#1"){
               customType = 2
             }else if(data.flag == "equipment#2" || data.flag == 'equipment#7'){
               customType = 3
             }else if(data.flag == 'door'){
               customType = 4
             }
             if(this.type == '1'){
               let arr1 = data.valueStr.split('-')
               if(!(arr1[0] == 'E' && arr1[2] == 2)){
                 arr.push({"id":data.treeCid,"parentId":parentId,"name":data.label,customType:customType,open: false,valueStr:data.valueStr,value:data.value})
               }
             }else if(this.type == '2'){
               let arr1 = data.valueStr.split('-')
               if(!((arr1[0] == 'E' && arr1[2] == 1) || data.valueStr.startsWith('D'))){
                arr.push({"id":data.treeCid,"parentId":parentId,"name":data.label,customType:customType,open: false,valueStr:data.valueStr,value:data.value})
               }
             }else{
               arr.push({"id":data.treeCid,"parentId":parentId,"name":data.label,customType:customType,open: false,valueStr:data.valueStr,value:data.value})
             }
             if(data.children){
               this.transTreeDataEq(data.children,arr)
             }
           }
        }
      },
      onClick: function(evt, treeId, treeNode) {
        document.getElementById(treeNode.tId+"_span").style="color:"+this.colorName;
        document.getElementById(treeNode.tId+"_ico").style="color:"+this.colorName;
        //修改名称
        // var cls = document.getElementsByClassName("node_name")
        // for(let i=0;i<cls.length;i++){
        //   if(cls[i].id != treeNode.tId+"_span"){
            // cls[i].style="color:#555555"
          // }
        // }
        //修改图标
        // var cls = document.getElementsByClassName("iconfont")
        // for(let i=0;i<cls.length;i++){
          // if(cls[i].id != treeNode.tId+"_ico"){
            // cls[i].style="color:#555555"
          // }
        // }
        this.$emit("changeTreeData",treeNode)
      },
      onCheck(evt, treeId, treeNode){
        var checkedNodes = this.$refs.devZtreeRef.ztreeObj.getCheckedNodes();
        let treeData = [];
        for (var n = 0; n < checkedNodes.length; n++) {
          treeData.push(checkedNodes[n]);
        }
        this.$emit("onCheck",treeData)
      },
      checkAllSelect(nodes) {
        //判断该节点是否是全选
        var flag = true;
        var children = nodes.children;
        for (var i = 0; i < children.length; i++) {
          if (children[i].checked != true) {
            flag = false;
          }
        }
        return flag;
      }
    }
  };
</script>

<style>
  .box {
    height: 800px;
  }

  .el-scrollbar {
    height: 100%;
  }

  .box .el-scrollbar__wrap {
    overflow: scroll;
  }

  .button{
    margin: 0 -1px 0 0 !important;
    line-height: 20px !important;
  }

  .center_open::before{
    left : 7px !important;
  }

</style>
