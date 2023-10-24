<template>
  <div>
    <vue-magic-tree :setting="setting" :nodes="nodes" ref="ztreeRef" @onClick="onClick" @onCheck="onCheck" @onRightClick="onRightClick" />
    <p v-show="menuShow" class="menu_class" :style="{top,left}" @click="copyNode">复制</p>
  </div>
</template>

<script>
import VueMagicTree from 'vue-magic-tree'
import { getJsTree } from '@/api/iot/access/custom-page.js'

export default {
    name: 'jscode-tree',
    components: { VueMagicTree },
    props: {
        isCheck: {
            type: Boolean,
            default: false
        }
    },
    mounted() {
        this.initJscodeTree()
    },
    data() {
        return {
            nodes: [],
            setting: {
                edit: {
                    enable: false,
                    drag: { isMove: false },
                    showRemoveBtn: false,
                    showRenameBtn: false
                },
                check: { enable: this.isCheck },
                data: {
                    simpleData: { enable: true, pIdKey: 'parentId' },
                    iconMap: {
                        0: 'icon-tingche-tingchechangxinxi',
                        1: 'icon-banci',
                    },
                    key: { nodeType: 'customType' }
                },
                view: { showIcon: true }
            },
            menuShow:false,
            top:0,
            left:0,
            treeNode:""
        };
    },
    watch: {
        menuShow(value) {
            if (value) {
                document.body.addEventListener('click', this.closeMenu)
            } else {
                document.body.removeEventListener('click', this.closeMenu)
            }
        }
    },
    methods:{
        initJscodeTree(){
            getJsTree().then(res => {
                var arr = [];
                this.transTreeData(res.data.data,arr)
                this.nodes = arr;
            })
        },
        transTreeData(datas,arr){
            if(datas.length){
                for(var i=0;i<datas.length;i++){
                    let data = datas[i];
                    let noR = data.valueStr ? false : true;
                    arr.push({"id":data.treeCid,"parentId":data.treePid,"name":data.valueStr+' '+data.label,"customType":1,open: false,valueStr:data.valueStr,noR})
                    if(data.children){
                        this.transTreeData(data.children,arr)
                    }
                }
            }
        },
        onClick: function(evt, treeId, treeNode) {
            this.menuShow = false

            //修改名称
            var cls = document.getElementsByClassName("node_name")
            for(var i=0;i<cls.length;i++){
                if(cls[i].id != treeNode.tId+"_span"){
                    cls[i].style="color:#555555"
                }
            }
            //修改图标
            this.$emit("click",treeNode)
        },
        onCheck(evt, treeId, treeNode){
            this.menuShow = false
            var checkedNodes = this.$refs.ztreeRef.ztreeObj.getCheckedNodes();
            let treeData = [];
            for (var n = 0; n < checkedNodes.length; n++) {
                treeData.push(checkedNodes[n]);
            }
            this.$emit("onCheck",treeData)
        },
        onRightClick(event, treeId, treeNode){
            if(treeNode && !treeNode.noR){
                this.$refs.ztreeRef.ztreeObj.selectNode(treeNode)
                this.treeNode = treeNode;
                this.showRMenu("node", event.clientX, event.clientY);
            }else{
                this.menuShow = false
            }
        },
        showRMenu(type, x, y){
            this.top = y+"px";
            this.left = x+"px";
            this.menuShow = true
        },
        copyNode(){
            this.$copyText(this.treeNode.valueStr).then(r => { })
            this.menuShow = false
        },
        closeMenu(){
            this.menuShow = false
        }
    }
};
</script>
<style scoped>
  .menu_class{
    position: fixed;z-index: 2000;
    padding: 20px;
    color: #000000;
    padding: 8px;
    background-color: #F8F8F8;
    width: 70px;
    text-align: center;
    cursor: pointer;
  }
  .menu_class:hover{
    background-color: #F2F2F2;
  }
</style>
