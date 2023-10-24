<template>
  <basic-container>
    <div class="box">
      <avue-crud
        :option="option"
        :table-loading="loading"
        :data="data"
        ref="crud"
        v-model="form"
        :permission="permissionList"
        :before-open="beforeOpen"
        @row-del="rowDel"
        @row-update="rowUpdate"
        @row-save="rowSave"
        @search-change="searchChange"
        @search-reset="searchReset"
        @selection-change="selectionChange"
        @current-change="currentChange"
        @size-change="sizeChange"
        @refresh-change="refreshChange"
        @on-load="onLoad">
        <template slot="menuLeft">
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            v-if="permission.role_delete"
            plain
            @click="handleDelete">删 除</el-button>
          <el-button
            size="small"
            icon="el-icon-setting"
            @click="handleRole"
            v-if="userInfo.role_name.includes('admin')"
            plain>权限设置</el-button>
          <el-button
            size="small"
            icon="el-icon-setting"
            @click="handleReportAuth"
            v-if="userInfo.role_name.includes('admin')"
            plain>报表权限设置</el-button>
        </template>
      </avue-crud>
      <el-dialog title="角色权限配置" append-to-body :visible.sync="box" width="666px" top="5vh">
        <el-tabs type="border-card" style="height: 500px;overflow: auto;">
          <el-tab-pane label="菜单权限">
            <el-tree
              :data="menuGrantList"
              show-checkbox
              node-key="id"
              ref="treeMenu"
              :default-checked-keys="menuTreeObj"
              :props="props"></el-tree>
          </el-tab-pane>
          <!-- <el-tab-pane label="部门权限">
            <el-tree
              :data="deptGrantList"
              show-checkbox
              node-key="value"
              ref="treeDeptScope"
              :default-checked-keys="deptTreeObj"></el-tree>
          </el-tab-pane> -->
          <el-tab-pane label="设备权限(门禁)">
            <el-tree
              :data="devGrantList"
              show-checkbox
              node-key="valueStr"
              ref="treeDevScope"
              :default-checked-keys="devTreeObj"></el-tree>
          </el-tab-pane>
          <el-tab-pane label="设备权限(消费)">
            <el-tree
              :data="xfDevGrantList"
              show-checkbox
              node-key="valueStr"
              ref="treeXfDevScope"
              :default-checked-keys="xfDevTreeObj"></el-tree>
          </el-tab-pane>
          <el-tab-pane label="设备权限(车辆)">
            <el-tree
              :data="carDevGrantList"
              show-checkbox node-key="value"
              ref="treeCarDevScope"
              :default-checked-keys="carDevTreeObj"></el-tree>
          </el-tab-pane>
          <el-tab-pane label="APP管理权限">
            <el-tree :data="appGrantList" show-checkbox node-key="value" ref="treeAppScope" :default-checked-keys="appTreeObj"></el-tree>
          </el-tab-pane>
        </el-tabs>

        <span slot="footer" class="dialog-footer">
          <el-button @click="box = false">取 消</el-button>
          <el-button type="primary" @click="submit">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog title="报表权限配置" top="5vh" append-to-body :visible.sync="reportShow" width="1000px">
        <div class="u-m-b-8">
          <el-input
            size="small" clearable
            style="width: 200px;margin-right: 10px;"
            @keyup.enter.native="search"
            v-model.trim="name"
            placeholder="请输入报表名称">
          </el-input>
          <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
        </div>
        <vxe-table
          auto-resize
          border
          ref="reportTable"
          highlight-hover-column
          highlight-current-column
          highlight-hover-row
          show-overflow
          size="mini"
          :height="500"
          align="center"
          :data="reportData"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
          <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
          <vxe-table-column title="报表名称" minWidth="70" field="name"></vxe-table-column>
          <vxe-table-column title="创建人" minWidth="70" field="createUser"></vxe-table-column>
          <vxe-table-column title="创建时间" minWidth="70" field="createTime"></vxe-table-column>
          <vxe-table-column title="修改人" minWidth="70" field="updateUser"></vxe-table-column>
          <vxe-table-column title="修改时间" minWidth="70" field="updateTime"></vxe-table-column>
        </vxe-table>
        <span slot="footer" class="dialog-footer">
          <el-button @click="reportShow = false" :disabled="reportDisabled">取 消</el-button>
          <el-button type="primary" @click="reportSubmit" :disabled="reportDisabled">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </basic-container>
</template>

<script>
import { add, getList, getRole, getRoleTree, grant, grantTree, remove, update, getDeptList, getRoleDeptTree, getRoleDevTree, getRealSellerXfDevTreeData, getAppmenuTree, getRoleAppList, reqReportList, sendReport } from '@/api/system/role';
import { getAreaAllEquipmentTree } from '@/api/iot/access/icauth';
import {sellerDevZtreeData} from '@/api/xf/seller';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getDevZtreeData } from '@/api/parking/area.js'

export default {
  data() {
    return {
      form: {},
      box: false,
      props: {
        label: 'title',
        value: 'key'
      },
      xfDevGrantList: [],
      xfDevTreeObj: [],
      deptGrantList: [],
      deptTreeObj: [],
      devGrantList: [],
      devTreeObj: [],
      menuGrantList: [],
      dataScopeGrantList: [],
      apiScopeGrantList: [],
      menuTreeObj: [],
      dataScopeTreeObj: [],
      apiScopeTreeObj: [],
      selectionList: [],
      query: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      data: [],
      tableHeight:0,
      appGrantList:[],
      appTreeObj:[],
      carDevGrantList:[],
      carDevTreeObj:[],
      reportData:[],
      selectionList2:[],
      reportShow:false,
      reportDisabled:false,
      name:""
    };
  },
  mounted() {
    this.tableHeight=window.innerHeight-280;
  },
  created() {
    // getDeptList().then(res => {
    //   this.deptGrantList = res.data.data;
    // });
    sellerDevZtreeData().then(res => {
      this.xfDevGrantList = res.data.data;
    });
    getAreaAllEquipmentTree().then(res => {
      this.devGrantList = this.dgArea(res.data.data);
    });
    getAppmenuTree().then(r => {
      this.appGrantList = r.data;
    });
    getDevZtreeData().then(r => {
      this.carDevGrantList = this.dgArea(r.data.data)
    })
  },
  methods: {
    search(){
      this.selectionList2 = [];
      this.initReportData();
    },
    reportSubmit(){
      this.reportDisabled = true;
      let reportIds = this.selectionList2.map(v => v.id);
      sendReport({roleIds:[this.selectionList[0].id],reportIds}).then(r => {
        this.reportDisabled = false;
        if(r.data.code === 200){
          this.$message.success(r.data.msg);
          this.reportShow = false;
        }else{
          this.$message.error(r.data.msg);
        }
      }).catch(() => this.reportDisabled = false)
    },
    // 获取报表列表数据
    initReportData(){
      reqReportList({roleId:this.selectionList[0].id,name:this.name}).then(r => {
        let d = r.data.data;
        this.reportData = d.reports;
        let rows = d.reports.filter(item => d.roleUseReportIds.some(id => id === item.id ))
        this.$refs.reportTable.setCheckboxRow(rows,true);
      })
    },
    handleReportAuth(){
      if(this.selectionList.length != 1) return this.$message.warning("请选择一条数据");
      this.reportShow = true;
      this.selectionList2 = [];
      this.initReportData();
    },
    checkboxChangeEvent({ records }){
      this.selectionList2 = records;
    },
    dgArea(area) {
      area.forEach(v => {
        v.value = v.valueStr;
        if (v.children) {
          this.dgArea(v.children);
        }
      });
      return area;
    },
    initData() {
      getRoleTree().then(res => {
        const column = this.findObject(this.option.column, 'parentId');
        column.dicData = res.data.data;
      });
    },
    submit() {
      const menuList = this.$refs.treeMenu.getCheckedKeys();
      // const deptScopeIds = this.$refs.treeDeptScope.getCheckedKeys();
      const devDoorIds = this.$refs.treeDevScope.getCheckedKeys();
      const xfDevScopeIds = this.$refs.treeXfDevScope.getCheckedKeys();
      const appMenuIds = this.$refs.treeAppScope.getCheckedKeys();
      const carDevIdsArr = this.$refs.treeCarDevScope.getCheckedKeys();
      let devDoorIdsArr = [];
      devDoorIds.forEach(v => {
        let item = v.split('-');
        if(item[0] == 'D' || item[0] == 'E'){
          devDoorIdsArr.push(v)
        }
      })
      let xfDevScopeIdsArr = [];
      xfDevScopeIds.forEach(v => {
        let item = v.split('-');
        if(item[0] == 'D'){
          xfDevScopeIdsArr.push(v)
        }
      })
      let carDevIds = carDevIdsArr.filter(v => v.startsWith('CDEV'))
      let params = {}
      params['roleIds'] = this.idsArray;
      params['menuIds'] = menuList;
      params['devDoorIds'] = devDoorIdsArr;
      params['xfDevScopeIds'] = xfDevScopeIdsArr;
      params['appMenuIds'] = appMenuIds;
      params['carDevIds'] = carDevIds;
      grant(params).then(() => {
        this.box = false;
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
        this.onLoad(this.page);
      });
    },
    rowSave(row, done, loading) {
      add(row).then(() => {
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
        done();
      },
      error => {
        window.console.log(error);
        loading();
      });
    },
    rowUpdate(row, index, done, loading) {
      update(row).then(() => {
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
        done();
      },
      error => {
        window.console.log(error);
        loading();
      });
    },
    rowDel(row) {
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return remove(row.id);
      }).then(() => {
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
      });
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      for (let v in params) {
        params[v] = params[v].trim();
      }
      this.query = params;
      this.page.currentPage = 1;
      this.onLoad(this.page, params);
      done();
    },
    selectionChange(list) {
      this.selectionList = list;
    },
    selectionClear() {
      this.selectionList = [];
      this.$refs.crud.toggleSelection();
    },
    beforeOpen(done, type) {
      if (['add', 'edit'].includes(type)) {
        this.initData();
      }
      done();
    },
    handleRole() {
      if (this.selectionList.length !== 1) {
        this.$message.warning('只能选择一条数据');
        return;
      }
      this.menuTreeObj = [];
      this.dataScopeTreeObj = [];
      this.apiScopeTreeObj = [];
      this.devTreeObj = [];
      this.xfDevTreeObj = [];
      this.appTreeObj = [];
      this.carDevTreeObj = [];
      grantTree().then(res => {
        this.menuGrantList = res.data.data.menu;
        this.dataScopeGrantList = res.data.data.dataScope;
        this.apiScopeGrantList = res.data.data.apiScope;
        getRole(this.ids).then(res => {
          this.menuTreeObj = res.data.data.menu;
          this.dataScopeTreeObj = res.data.data.dataScope;
          this.apiScopeTreeObj = res.data.data.apiScope;
          this.box = true;
        });
      });
      // getDeptList().then(res => {
      //   this.deptGrantList = res.data.data;
      // });
      this.deptTreeObj = [];
      getRoleDeptTree(this.selectionList[0].id).then(res => {
        let arr = [];
        res.data.data.forEach(v => {
          arr.push(v.deptId);
        });
        this.deptTreeObj = arr;
        this.$forceUpdate();
      });
      if (this.$refs.treeDevScope) {
        this.$refs.treeDevScope.setCheckedKeys([]);
      }
      if (this.$refs.treeXfDevScope) {
        this.$refs.treeXfDevScope.setCheckedKeys([]);
      }
      if (this.$refs.treeCarDevScope) {
        this.$refs.treeCarDevScope.setCheckedKeys([]);
      }
      getRoleDevTree(this.selectionList[0].id).then(res => {
        this.devTreeObj = res.data.data.mjDevs;
        this.xfDevTreeObj = res.data.data.xfDevs;
        this.carDevTreeObj = res.data.data.carDevs;
        this.$forceUpdate();
      });
      if (this.$refs.treeAppScope) {
        this.$refs.treeAppScope.setCheckedKeys([]);
      }
      getRoleAppList({ roleId: this.selectionList[0].id }).then(r => {
        this.appTreeObj = r.data.data;
        this.$forceUpdate();
      });
    },
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return remove(this.ids);
      }).then(() => {
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
        this.$refs.crud.toggleSelection();
      });
    },
    currentChange(currentPage) {
      this.page.currentPage = currentPage;
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize;
    },
    refreshChange() {
      this.onLoad(this.page, this.query);
    },
    onLoad(page, params = {}) {
      this.loading = true;
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        this.data = res.data.data;
        this.loading = false;
        this.selectionClear();
      });
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'permission']),
    permissionList() {
      return {
        addBtn: this.vaildData(this.permission.role_add, false),
        viewBtn: this.vaildData(this.permission.role_view, false),
        delBtn: this.vaildData(this.permission.role_delete, false),
        editBtn: this.vaildData(this.permission.role_edit, false)
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    idsArray() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids;
    },
    option(){
      return{
        height: this.tableHeight,
        tip: false,
        simplePage: true,
        searchShow: true,
        searchMenuSpan: 6,
        tree: true,
        border: true,
        index: true,
        indexLabel: '序号',
        indexWidth: 70,
        selection: true,
        viewBtn: true,
        dialogWidth: 900,
        dialogClickModal: false,
        align: 'center',
        column: [
          {
            label: '角色名称',
            prop: 'roleName',
            search: true,
            span: 24,
            rules: [{
              required: true,
              message: '请输入角色名称',
              trigger: 'blur'
            }]
          },
          {
            label: '所属租户',
            prop: 'tenantId',
            type: 'tree',
            dicUrl: '/api/blade-system/tenant/select',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: website.tenantMode,
            span: 24,
            props: {
              label: 'tenantName',
              value: 'tenantId'
            },
            hide: !website.tenantMode,
            search: website.tenantMode,
            rules: [{
              required: true,
              message: '请输入所属租户',
              trigger: 'click'
            }]
          },
          {
            label: '角色别名',
            prop: 'roleAlias',
            search: true,
            span: 24,
            rules: [{
              required: true,
              message: '请输入角色别名',
              trigger: 'blur'
            }]
          },
          {
            label: '上级角色',
            prop: 'parentId',
            dicData: [],
            type: 'tree',
            hide: true,
            span: 24,
            props: {
              label: 'title'
            },
            rules: [{
              required: false,
              message: '请选择上级角色',
              trigger: 'click'
            }]
          },
          {
            label: '角色排序',
            prop: 'sort',
            type: 'number',
            span: 24,
            rules: [{
              required: true,
              message: '请输入角色排序',
              trigger: 'blur'
            }]
          }
        ],
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.box {
  height: 100%;
}

</style>
