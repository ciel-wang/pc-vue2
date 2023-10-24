<template>
  <basic-container>
    <div style="margin-bottom: 8px;">
      <el-input
        size="small" clearable
        @keyup.enter.native="onLoad"
        v-model="name"
        placeholder="请输入菜单名称"
        style="width: 200px;margin-right: 10px;"></el-input>
      <el-input
        size="small" clearable
        @keyup.enter.native="onLoad"
        v-model="code"
        placeholder="请输入菜单编号"
        style="width: 200px;margin-right: 10px;"></el-input>
      <el-input
        size="small" clearable
        @keyup.enter.native="onLoad"
        v-model="alias"
        placeholder="请输入菜单别名"
        style="width: 200px;margin-right: 10px;"></el-input>
      <el-button type="primary" size="small" icon="el-icon-search" @click="onLoad">搜索</el-button>
      <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <vxe-table
      resizable
      border
      ref="xTable"
      auto-resize
      align="center"
      size="mini"
      :highlight="true"
      highlight-hover-row
      :tree-config="{ transform: true, rowField: 'id', parentField: 'parentId', iconOpen: 'el-icon-arrow-down', iconClose: 'el-icon-arrow-right', accordion: true }"
      :data="tableData"
      :loading="loading"
      :height="tableHeight">
      <vxe-column type="checkbox" width="70"></vxe-column>
      <vxe-column type="seq" title="序号" width="70"></vxe-column>
      <vxe-column field="name" title="菜单名称" align="left" tree-node></vxe-column>
      <vxe-column field="path" title="路由地址" align="left"></vxe-column>
      <vxe-column field="source" title="菜单图标">
        <template #default="{row}">
          <div style="text-align:center"><i :class="row.source" /></div>
        </template>
      </vxe-column>
      <vxe-column field="code" title="菜单编号"></vxe-column>
      <vxe-column field="alias" title="菜单别名"></vxe-column>
      <vxe-column field="sort" title="菜单排序"></vxe-column>
    </vxe-table>
  </basic-container>
</template>

<script>
import { getLazyList } from '@/api/system/menu';
export default {
  data() {
    return {
      name: '',
      code: '',
      alias: '',
      tableData: [],
      loading: false
    };
  },
  mounted() {
    this.onLoad();
  },
  methods: {
    searchReset() {
      this.name = '';
      this.code = '';
      this.alias = '';
      this.onLoad();
    },
    onLoad() {
      let params = {};
      params['name'] = this.name;
      params['code'] = this.code;
      params['alias'] = this.alias;
      this.loading = true;
      getLazyList(this.parentId, Object.assign(params)).then(res => {
        let arr = [];
        this.transTreeData(res.data.data, arr);
        this.tableData = arr;
        this.loading = false;
      });
    },
    transTreeData(datas, arr) {
      if (datas.length) {
        datas.forEach(v => {
          let { id,alias,category,categoryName,code,action,actionName,hasChildren,isDeleted,isOpen,isOpenName,name,
            parentId,parentName,path,remark,sort,source } = v;
          arr.push({ id,alias,category,categoryName,code,action,actionName,hasChildren,isDeleted,isOpen,isOpenName,name,
            parentId,parentName,path,remark,sort,source });
          if (v.children) {
            this.transTreeData(v.children, arr);
          }
        });
      }
    }
  },
  computed: {
    tableHeight() {
      return window.innerHeight - 228 + 41;
    }
  }
};
</script>
