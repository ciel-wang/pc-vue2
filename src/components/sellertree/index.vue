<template>
  <vue-magic-tree :setting="setting"
                  :nodes="nodes"
                  @onClick="onClick"
                  @onCreated="handleCreated"
    />
</template>

<script>
  import {sellerTree} from '@/api/xf/seller';
  import VueMagicTree from 'vue-magic-tree';
  import {mapGetters} from 'vuex';
  export default{
    name:'iot-ztree',
    props:{
    },
    components: {
      VueMagicTree
     },
     created() {

     },
     mounted(){
       this.initSellerTree();
     },
     computed: {
       ...mapGetters(['colorName'])
       },
     data(){
       return {
         nodes:[],
         setting: {
           edit: {
             enable: false,
             drag: {
               isMove: false
             },
             showRemoveBtn: false,
             showRenameBtn: false
           },
           check: {
             enable: false
           },
           data: {
             simpleData: {
               enable: true,
               pIdKey: 'parentId'
             },
             // 设置图标库(采用iconfont class形式)
             iconMap: {
                 0: 'icon-xiaoyuan',
                 1: 'icon-xf-seller',
             },
             // 设置对应每个节点的节点类型，与数据中customType对应(25行)
             key: {
               nodeType: 'customType'
             }
           },
           view: {
             // 开启图标显示功能
             showIcon: true
           }
         }
       };
     },
     methods:{
       initSellerTree(){
         sellerTree().then(res => {
           //申明一个数组
           var arr = [];
           //对返回的数据类型进行转换
           this.transTreeData(res.data.data,arr);
           this.nodes = arr;
         });
       },
       //递归调用，对数据进行处理
       transTreeData(datas,arr){
         if(datas.length){
            for(var i=0;i<datas.length;i++){
              let data = datas[i];
              var parentId = data.treePid;
              var customType = 0;
              if(data.valueStr.startsWith("SCHOOL")){
                customType = 0
              }else{
                customType = 1
              }
               arr.push({'id':data.treeCid,'parentId':parentId,'name':data.label,'customType':customType,open: false,valueStr:data.valueStr});
              if(data.children){
                this.transTreeData(data.children,arr);
              }
            }
         }
       },
       //递归调用，对数据进行处理
       transTreeAreaData(datas,arr){
         if(datas.length){
            for(var i=0;i<datas.length;i++){
              let data = datas[i];
              var parentId = data.parentId;
               arr.push({'id':data.value,'parentId':parentId,'name':data.label,'customType':'3',open: true});
              if(data.children){
                this.transTreeAreaData(data.children,arr);
              }
            }
         }
       },
       onClick: function(evt, treeId, treeNode) {
         document.getElementById(treeNode.tId+'_span').style='color:'+this.colorName;
         // document.getElementById(treeNode.tId+'_ico').style='color:'+this.colorName;

        // var treeObj = $.fn.zTree.getZTreeObj(treeId);
        // var nodes = treeObj.getSelectedNodes();
        // if (nodes.length>0) {
        //     var node = nodes[0].getParentNode();
        //     if(node){
        //         treeObj.expandNode(nodes, true, false, true);
        //     }
        // 	treeObj.expandNode(nodes[0], true, false, true);
        // }

         //修改名称
         let cls = document.getElementsByClassName('node_name');
         for(let i=0;i<cls.length;i++){
           if(cls[i].id != treeNode.tId+'_span'){
             cls[i].style='color:#555555';
           }
         }

         //修改图标
         // var cls = document.getElementsByClassName('iconfont');
         // for(var i=0;i<cls.length;i++){
         //   if(cls[i].id != treeNode.tId+'_ico'){
         //     // cls[i].style='color:#555555';
         //   }
         // }
         this.$emit('click',treeNode);
       },
       onCheck(evt, treeId, treeNode){

       }
     }
  };
</script>

<style scoped>
  .button{
    margin: 0 -1px 0 0 !important;
    line-height: 20px !important;
  }

  .center_open::before{
    left : 7px !important;
  }
    /deep/
    .el-card{
        height: 100vh !important;
    }
</style>
