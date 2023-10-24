<template>
  <vue-magic-tree :setting="setting"
                  :nodes="nodes"
                  @onClick="onClick"
                  @onCreated="handleCreated"
    />
</template>

<script>
  import {mjdataZtree} from '@/api/visitor/mjdata';
  import VueMagicTree from 'vue-magic-tree';
  import {mapGetters} from 'vuex';
  export default{
    name:'mjdata-ztree',
    props:{
    },
    components: { VueMagicTree },
     computed: { ...mapGetters(['colorName']) },
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
                 0: 'icon-xianlu',
                 1: 'icon-fk-quyuguanl',
                 2: 'icon-fk-weizhi',
                 3: 'icon-iot-accesscontroller-auth-ic',
                 4: 'icon-iot-accesscontroller-auth-ai'
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
     mounted(){
       this.initMjdataTree();
     },
     methods:{
       initMjdataTree(){
         mjdataZtree().then(res => {
           //申明一个数组
           var arr = [{'id':0,'parentId':-1,'name':"线路设备",'customType':0,open: false}];
           let datas = res.data.data;
           for(var i=0;i<datas.length;i++){
                let data = datas[i];
                 var parentId = 0;
                 if(data.devName == "MQ"){
                     data.customType = 3;
                 }else{
                     data.customType = 4;
                 }
                 arr.push({'id':data.devId,'parentId':parentId,'name':data.devName,'customType':data.customType,open: false});
            }
           //对返回的数据类型进行转换
           // this.transTreeData(res.data.data,arr);
           this.nodes = arr;
         });
       },
       //递归调用，对数据进行处理
       transTreeData(datas,arr){
         if(datas.length){
            for(var i=0;i<datas.length;i++){
              let data = datas[i];
              var parentId = 1;
              var customType = 1;
               arr.push({'id':data.devId,'parentId':parentId,'name':data.devName,'customType':customType,open: false});
              if(data.children){
                for(let j=0;j<data.children.length;j++){
                    let v=data.children[j];
                    v.parentId=2;
                }
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
               arr.push({'id':data.value,'parentId':parentId,'name':data.label,open: true});
              if(data.children){
                this.transTreeAreaData(data.children,arr);
              }
            }
         }
       },
       onClick: function(evt, treeId, treeNode) {
         this.treeDeptId = treeNode.id;
         document.getElementById(treeNode.tId+'_span').style='color:'+this.colorName;
         // document.getElementById(treeNode.tId+'_ico').style='color:'+this.colorName;

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
