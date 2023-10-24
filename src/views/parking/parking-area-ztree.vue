<template>
  <vue-magic-tree :setting="setting" :nodes="nodes" ref="ztreeRef" @onClick="onClick" @onCheck="onCheck" />
</template>

<script>
import VueMagicTree from 'vue-magic-tree';
import { getAreaZtreeData } from '@/api/parking/area.js';

export default {
  name: 'parking-area-ztree',
  props: {
    isCheck: {
      type: Boolean,
      default: false
    }
  },
  components: { VueMagicTree },
  mounted() {
    this.initParkingAreaZtreeData();
  },
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
            0: 'icon-tingche-tingchechangxinxi',
            1: 'icon-quyuxinxi-01',
            2: 'icon-shoufeimingxi_gangtingshoufeimingxi',
            3: 'icon-cheliangjinchuxinxi1',
            4: 'icon-shexiangtou'
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
  methods: {
    initParkingAreaZtreeData() {
      getAreaZtreeData().then(res => {
        var arr = [];
        this.transTreeData(res.data.data, arr);
        this.nodes = arr;
      });
    },
    transTreeData(datas, arr) {
      if (datas.length) {
        for (var i = 0; i < datas.length; i++) {
          let data = datas[i];
          var customType = data.valueStr.startsWith('CP') ? 0 : 1;
          arr.push({ id: data.treeCid, parentId: data.treePid, name: data.label, customType: customType, open: true, valueStr: data.valueStr, value: data.value });
          if (data.children) {
            this.transTreeData(data.children, arr);
          }
        }
      }
    },
    onClick: function(evt, treeId, treeNode) {
      this.treeDeptId = treeNode.id;
      // document.getElementById(treeNode.tId+"_span").style="color:"+this.colorName;
      // document.getElementById(treeNode.tId+"_ico").style="color:"+this.colorName;

      var treeObj = $.fn.zTree.getZTreeObj(treeId);
      var nodes = treeObj.getSelectedNodes();
      if (nodes.length > 0) {
        var node = nodes[0].getParentNode();
        if (node) {
          treeObj.expandNode(nodes, true, false, true);
        }
        treeObj.expandNode(nodes[0], true, false, true);
      }

      //修改名称
      let cls = document.getElementsByClassName('node_name');
      for (let i = 0; i < cls.length; i++) {
        if (cls[i].id != treeNode.tId + '_span') {
          cls[i].style = 'color:#555555';
        }
      }

      //修改图标
      // var cls = document.getElementsByClassName('iconfont');
      // for (var i = 0; i < cls.length; i++) {
      //   if (cls[i].id != treeNode.tId + '_ico') {
      //     // cls[i].style="color:#555555"
      //   }
      // }
      this.$emit('click', treeNode);
    },
    onCheck(evt, treeId, treeNode) {
      var checkedNodes = this.$refs.ztreeRef.ztreeObj.getCheckedNodes();
      let treeData = [];
      for (var n = 0; n < checkedNodes.length; n++) {
        treeData.push(checkedNodes[n]);
      }
      this.$emit('onCheck', treeData);
    }
  }
};
</script>

<style></style>
