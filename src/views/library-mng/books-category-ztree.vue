<template>
  <vue-magic-tree :setting="setting" :nodes="nodes" ref="ztreeRef" @onClick="onClick" @onCheck="onCheck" />
</template>

<script>
import VueMagicTree from 'vue-magic-tree';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import {Base64} from 'js-base64';

export default {
  name: 'books-category-ztree',
  components: { VueMagicTree },
  props: {
    isCheck: {
      type: Boolean,
      default: false
    },
    isShowIcon:{type:Boolean,default:true}
  },
  data() {
    return {
      setting: {
        async:{
          enable: true,
          type: "get",
          url: "/api/iot-library/booktype/tree",
          headers:{
            'Authorization':`Basic ${Base64.encode(`${website.clientId}:${website.clientSecret}`)}`,
            'Blade-Auth':'bearer ' + getToken()
          },
          autoParam: ["value=parentId"],
          dataFilter: this.ajaxDataFilter
        },
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
            enable: false,
            pIdKey: 'treePid'
          },
          iconMap: {
            0: 'icon-grouping'
          },
          key: {
            nodeType: 'customType',
          }
        },
        view: {
          showIcon: this.isShowIcon
        }
      },
      nodes: []
    };
  },
  computed: {
    ...mapGetters(['colorName'])
  },
  methods: {
    cancelSelect(){
      this.$refs.ztreeRef.ztreeObj.reAsyncChildNodes(null,'refresh');
    },
    ajaxDataFilter(treeId, parentNode, childNodes){
      if (!childNodes) return null;
      for (var i=0, l=childNodes.length; i<l; i++) {
        childNodes[i].name = childNodes[i].label;
        childNodes[i].isParent = !childNodes[i].isChild;
        childNodes[i].customType = 0;
        delete childNodes[i].children
      }
      return childNodes;
    },
    onClick: function(evt, treeId, treeNode) {
      // document.getElementById(treeNode.tId + '_span').style = 'color:' + this.colorName;
      // document.getElementById(treeNode.tId + '_ico').style = 'color:' + this.colorName;
      //修改名称
      let cls = document.getElementsByClassName('node_name');
      for (let i = 0; i < cls.length; i++) {
        if (cls[i].id != treeNode.tId + '_span') {
          // cls[i].style="color:#555555"
        }
      }
      //修改图标
      // var cls = document.getElementsByClassName('iconfont');
      // for (var i = 0; i < cls.length; i++) {
      //   if (cls[i].id != treeNode.tId + '_ico') {
      //     // cls[i].style="color:#555555"
      //   }
      // }
      this.$emit('onClick', treeNode);
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
