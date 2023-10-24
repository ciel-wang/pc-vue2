<template>
  <vue-magic-tree ref="libraryZtreeRef" :setting="setting" :nodes="nodes" @onClick="onClick" @onCheck="onCheck" />
</template>

<script>
import VueMagicTree from 'vue-magic-tree';
import { mapGetters } from 'vuex';
import { getLibraryZtreeDic } from '@/api/library-mng/book-room-mng.js'

export default {
  name: 'library-ztree',
  props: {
    isCheck: {
      type: Boolean,
      default: false
    },
    treeKey: {
      type: String,
      default: 'lb'
    },
  },
  components: { VueMagicTree },
  data() {
    return {
      nodes: [],
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
          enable: this.isCheck
        },
        data: {
          simpleData: {
            enable: true,
            pIdKey: 'parentId'
          },
          // 设置图标库(采用iconfont class形式)
          iconMap: {
            0: 'icon-xiaoyuan',
            1: 'icon-school-tushuguan',
            2: 'icon-louceng',
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
  mounted() {
    this.getLibraryZtreeInit();
  },
  computed: {
    ...mapGetters(['colorName'])
  },
  methods: {
    getLibraryZtreeInit() {
      getLibraryZtreeDic({treeKey:this.treeKey}).then(res => {
        var arr = [];
        this.transTreeData(res.data.data, arr);
        this.nodes = arr;
      });
    },
    //递归调用，对数据进行处理
    transTreeData(datas, arr) {
      if (datas.length) {
        for (var i = 0; i < datas.length; i++) {
          let data = datas[i];
          var customType = data.valueStr.startsWith('school') ? 0 : data.valueStr.startsWith('lb') ? 1 : 2;
          arr.push({ id: data.treeCid, parentId: data.treePid, name: data.label, customType, open: false, valueStr: data.valueStr,value:data.value});
          if (data.children) {
            this.transTreeData(data.children, arr);
          }
        }
      }
    },
    onClick: function(evt, treeId, treeNode) {
      let cls = document.getElementsByClassName("node_name")
      for(let i=0;i<cls.length;i++){
        if(cls[i].id != treeNode.tId+"_span"){
          cls[i].style="color:#555555"
        }
      }

      //修改图标
      // var cls = document.getElementsByClassName("iconfont")
      // for(var i=0;i<cls.length;i++){
      //   if(cls[i].id != treeNode.tId+"_ico"){
      //     // cls[i].style="color:#555555"
      //   }
      // }
      this.$emit('onClick', treeNode);
    },
    onCheck(evt, treeId, treeNode) {
      var checkedNodes = this.$refs.libraryZtreeRef.ztreeObj.getCheckedNodes();
      let treeData = [];
      for (var n = 0; n < checkedNodes.length; n++) {
        treeData.push(checkedNodes[n]);
      }
      this.$emit('onCheck', treeData);
    }
  }
};
</script>
