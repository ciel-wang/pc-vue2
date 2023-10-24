<template>
  <basic-container>
    <avue-crud
      :option="option"
      :search.sync="search"
      :table-loading="loading"
      :data="data"
      ref="crud"
      v-model="form"
      :permission="permissionList"
      @row-del="rowDel"
      @row-update="rowUpdate"
      @row-save="rowSave"
      :before-open="beforeOpen"
      :page.sync="page"
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
          plain
          icon="el-icon-delete"
          v-if="permission.user_delete"
          @click="handleDelete">删 除</el-button>
        <el-button
          type="info"
          size="small"
          plain
          v-if="permission.user_role"
          icon="el-icon-user"
          @click="handleGrant">角色配置</el-button>
        <el-button
          size="small"
          plain
          v-if="permission.user_reset"
          icon="el-icon-refresh"
          @click="handleReset">密码重置</el-button>
        <el-button
          type="warning"
          size="small"
          plain
          v-if="userInfo.role_name.includes('admin')"
          icon="el-icon-download"
          @click="handleExport">导出</el-button>
        <el-button
          type="permary"
          size="small"
          plain
          @click="handleDeptAauth">部门权限</el-button>
      </template>
      <template slot-scope="{ row }" slot="tenantName">
        <el-tag>{{ row.tenantName }}</el-tag>
      </template>
      <template slot-scope="{ row }" slot="roleName">
        <el-tag>{{ row.roleName }}</el-tag>
      </template>
    </avue-crud>
    <el-dialog title="用户角色配置" append-to-body :visible.sync="roleBox" width="345px">
      <el-tree
        :data="roleGrantList"
        show-checkbox
        check-strictly
        default-expand-all
        node-key="id"
        ref="treeRole"
        :default-checked-keys="roleTreeObj"
        :props="props"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitRole">确 定</el-button>
        <el-button @click="roleBox = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog title="部门权限配置" append-to-body :visible.sync="deptAuthVisible" width="666px" top="8vh" :before-close="handleclose">
      <div style="height: 60vh;overflow: auto;">
        <el-tree
          :data="deptAuthList"
          show-checkbox
          default-expand-all
          node-key="valueStr"
          ref="deptAuthRef"
          :default-checked-keys="deptAuthArr"
          :props="{
            value:'valueStr'
          }"></el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" icon="el-icon-check" type="primary" @click="deptAuthSubmit">确 定</el-button>
        <el-button size="small" icon="el-icon-close" @click="handleclose">取 消</el-button>
      </span>
    </el-dialog>
  </basic-container>
</template>

<script>
import { getList, getUser, remove, update, add, grant, resetPassword , userDeptAuthDetails , userDeptAuthSubmit} from '@/api/system/user';
import { getDeptTree, getDeptLazyTree } from '@/api/system/dept';
import { getRoleTree } from '@/api/system/role';
import { getPostList } from '@/api/system/post';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import {getDeptZtreeData} from "@/api/iot/dept";
export default {
  data() {
    return {
      deptAuthVisible:false,
      deptAuthList:[],
      deptAuthArr:[],
      form: {},
      search: {realName:'',account:''},
      roleBox: false,
      excelBox: false,
      initFlag: true,
      selectionList: [],
      query: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      init: {
        roleTree: [],
        deptTree: []
      },
      props: {
        label: 'title',
        value: 'key'
      },
      roleGrantList: [],
      roleTreeObj: [],
      treeDeptId: '',
      treeData: [],
      treeOption: {
        nodeKey: 'id',
        lazy: true,
        treeLoad: function(node, resolve) {
          const parentId = node.level === 0 ? 0 : node.data.id;
          getDeptLazyTree(parentId).then(res => {
            resolve(
              res.data.data.map(item => {
                return {
                  ...item,
                  leaf: !item.hasChildren
                };
              })
            );
          });
        },
        addBtn: false,
        menu: false,
        size: 'small',
        props: {
          labelText: '标题',
          label: 'title',
          value: 'value',
          children: 'children'
        }
      },
      data: [],
      excelForm: {},
      excelOption: {
        submitBtn: false,
        emptyBtn: false,
        column: [
          {
            label: '模板上传',
            prop: 'excelFile',
            type: 'upload',
            drag: true,
            loadText: '模板上传中，请稍等',
            span: 24,
            propsHttp: {
              res: 'data'
            },
            tip: '请上传 .xls,.xlsx 标准格式文件',
            action: '/api/blade-user/import-user'
          },
          {
            label: '数据覆盖',
            prop: 'isCovered',
            type: 'switch',
            align: 'center',
            width: 80,
            dicData: [
              {
                label: '否',
                value: 0
              },
              {
                label: '是',
                value: 1
              }
            ],
            value: 0,
            slot: true,
            rules: [
              {
                required: true,
                message: '请选择是否覆盖',
                trigger: 'blur'
              }
            ]
          },
          {
            label: '模板下载',
            prop: 'excelTemplate',
            formslot: true,
            span: 24
          }
        ]
      },
      tableHeight:0
    };
  },
  watch: {
    'form.tenantId'() {
      if (this.form.tenantId !== '' && this.initFlag) {
        this.initData(this.form.tenantId);
      }
    },
    'excelForm.isCovered'() {
      if (this.excelForm.isCovered !== '') {
        const column = this.findObject(this.excelOption.column, 'excelFile');
        column.action = `/api/blade-user/import-user?isCovered=${this.excelForm.isCovered}`;
      }
    }
  },
  mounted() {
    // 非租户模式默认加载管理组数据
    if (!website.tenantMode) {
      this.initData(website.tenantId);
    }
    this.initDeptZtree()
    this.tableHeight=window.innerHeight-330;
  },
  computed: {
    ...mapGetters(['userInfo', 'permission']),
    permissionList() {
      return {
        addBtn: this.vaildData(this.permission.user_add, false),
        viewBtn: this.vaildData(this.permission.user_view, false),
        delBtn: this.vaildData(this.permission.user_delete, false),
        editBtn: this.vaildData(this.permission.user_edit, false)
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    option(){
      return{
        height: this.tableHeight,
        calcHeight: 80,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        border: true,
        index: true,
        indexLabel: '序号',
        indexWidth: 70,
        align: 'center',
        selection: true,
        viewBtn: true,
        dialogClickModal: false,
        addBtn:false,
        column: [
          {
            label: '登录账号',
            prop: 'account',
            search: true,
            display: false
          },
          {
            label: '用户姓名',
            prop: 'name',
            search: true,
            display: false
          },
          {
            label: '所属角色',
            prop: 'roleName',
            slot: true,
            minWidth: 110,
            display: false
          }
        ],
        group: [
          {
            label: '基础信息',
            prop: 'baseInfo',
            icon: 'el-icon-user-solid',
            column: [
              {
                label: '登录账号',
                prop: 'account',
                rules: [{
                  required: true,
                  message: '请输入登录账号',
                  trigger: 'blur'
                }],
                span: website.tenantMode ? 12 : 24
              },
              {
                label: '所属租户',
                prop: 'tenantId',
                type: 'tree',
                dicUrl: '/api/blade-system/tenant/select',
                props: {
                  label: 'tenantName',
                  value: 'tenantId'
                },
                hide: !website.tenantMode,
                addDisplay: website.tenantMode,
                editDisplay: website.tenantMode,
                viewDisplay: website.tenantMode,
                rules: [{
                  required: true,
                  message: '请输入所属租户',
                  trigger: 'click'
                }]
              },
              {
                label: '密码',
                prop: 'password',
                hide: true,
                editDisplay: false,
                viewDisplay: false,
                rules: [{
                  required: true,
                  validator: (rule, value, callback) => {
                    if (value === '') {
                      callback(new Error('请输入密码'));
                    } else {
                      callback();
                    }
                  },
                  trigger: 'blur'
                }]
              },
              {
                label: '确认密码',
                prop: 'password2',
                hide: true,
                editDisplay: false,
                viewDisplay: false,
                rules: [{
                  required: true,
                  validator: (rule, value, callback) => {
                    if (value === '') {
                      callback(new Error('请再次输入密码'));
                    } else if (value !== this.form.password) {
                      callback(new Error('两次输入密码不一致!'));
                    } else {
                      callback();
                    }
                  },
                  trigger: 'blur'
                }]
              }
            ]
          },
          {
            label: '详细信息',
            prop: 'detailInfo',
            icon: 'el-icon-s-order',
            column: [
              {
                label: '用户昵称',
                prop: 'name',
                hide: true,
                rules: [{
                  required: true,
                  message: '请输入用户昵称',
                  trigger: 'blur'
                }]
              },
              {
                label: '用户姓名',
                prop: 'realName',
                rules: [{
                  required: true,
                  message: '请输入用户姓名',
                  trigger: 'blur'
                },{
                  min: 2,
                  max: 5,
                  message: '姓名长度在2到5个字符'
                }]
              },
              {
                label: '手机号码',
                prop: 'phone',
                overHidden: true
              },
              {
                label: '账号状态',
                prop: 'statusName',
                hide: true,
                display: false
              }
            ]
          },
          {
            label: '职责信息',
            prop: 'dutyInfo',
            icon: 'el-icon-s-custom',
            column: [
              {
                label: '用户编号',
                prop: 'code'
              },
              {
                label: '所属角色',
                prop: 'roleId',
                multiple: true,
                type: 'tree',
                dicData: [],
                props: {
                  label: 'title'
                },
                checkStrictly: true,
                slot: true,
              }
            ]
          }
        ]
      }
    }
  },
  methods: {
    initDeptZtree(){
      getDeptZtreeData().then(r => {
        this.deptAuthList = r.data.data;
      })
    },
    handleDeptAauth(){
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      let empId = this.selectionList[0].empId;
      if(empId < 1){
        this.$message.warning("该条数据存在异常");
        return;
      }
      if (this.$refs.deptAuthRef) {
        this.$refs.deptAuthRef.setCheckedKeys([]);
      }
      userDeptAuthDetails({empId:empId}).then(r => {
        this.deptAuthArr = [];
        if(r.data.code == 200){
          this.deptAuthArr = r.data.data;
        }
      })
      this.deptAuthVisible = true;
    },
    deptAuthSubmit(){
      const deptIds = this.$refs.deptAuthRef.getCheckedKeys().join(',');
      let empId = this.selectionList[0].empId;
      userDeptAuthSubmit({empId:empId,deptIds:deptIds}).then(r => {
        if(r.data.code == 200){
          this.$message.success(r.data.msg);
          this.onLoad(this.page)
          this.deptAuthVisible = false;
        }
      })
    },
    handleclose(){
      this.deptAuthArr = [];
      this.deptAuthVisible = false;
    },
    nodeClick(data) {
      this.treeDeptId = data.id;
      this.page.currentPage = 1;
      this.onLoad(this.page);
    },
    initData(tenantId) {
      getRoleTree(tenantId).then(res => {
        const column = this.findObject(this.option.group, 'roleId');
        column.dicData = res.data.data;
      });
    },
    submitRole() {
      const roleList = this.$refs.treeRole.getCheckedKeys().join(',');
      grant(this.ids, roleList).then(() => {
        this.roleBox = false;
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
        this.onLoad(this.page);
      });
    },
    rowSave(row, done, loading) {
      row.roleId = row.roleId.join(',');
      add(row).then(() => {
        this.initFlag = false;
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
      row.roleId = row.roleId.join(',');
      update(row).then(res => {
        this.initFlag = false;
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
      this.treeDeptId = '';
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
    handleReset() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm('确定将选择账号密码重置为123456?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return resetPassword(this.ids);
      }).then(() => {
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
        this.$refs.crud.toggleSelection();
      });
    },
    handleGrant() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.roleTreeObj = [];
      if (this.selectionList.length === 1) {
        this.roleTreeObj = this.selectionList[0].roleId.split(',');
      }
      getRoleTree().then(res => {
        this.roleGrantList = res.data.data;
        this.roleBox = true;
      });
    },
    handleExport() {
      this.$confirm('是否导出用户数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(`/api/blade-user/export-user?${this.website.tokenHeader}=${getToken()}&account=${this.search.account.trim()}&realName=${this.search.realName.trim()}`);
      });
    },
    handleTemplate() {
      window.open(`/api/blade-user/export-template?${this.website.tokenHeader}=${getToken()}`);
    },
    beforeOpen(done, type) {
      if (['edit', 'view'].includes(type)) {
        getUser(this.form.id).then(res => {
          this.form = res.data.data;
          if (this.form.hasOwnProperty('roleId')) {
            this.form.roleId = this.form.roleId.split(',');
          }
        });
      }
      this.initFlag = true;
      done();
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
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query), this.treeDeptId).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
        this.selectionClear();
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.el-scrollbar {
  height: 100%;
}
.box .el-scrollbar__wrap {
  overflow: scroll;
}
/deep/ .basic-container .full-card {
  height: 830px;
  overflow: scroll;
  height: 100%;
}
/deep/.avue-crud__pagination{
  padding: 0;
}
</style>
