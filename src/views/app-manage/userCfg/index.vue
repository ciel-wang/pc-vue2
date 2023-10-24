<template>
  <div style="height: 100%;margin: 0 10px;background-color: #fff;padding: 20px !important;width: calc(100% - 20px);">
    <div style="margin-bottom: 8px;">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete">删除</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      :height="tableHeight"
      keep-source
      ref="xGrid"
      size="mini"
      align="center"
      :highlight="true"
      :columns="tableColumn"
      :loading="loading"
      :data="tableData"
      :span-method="mergeRowMethod"
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent">
      <template #enable="{row}">
        <el-checkbox v-if="row.enable || row.enable == 0" @change="checkboxChange(row, 1)" v-model="row.enable"></el-checkbox>
      </template>

      <template #display="{row}">
        <el-checkbox v-if="row.display || row.display == 0" @change="checkboxChange(row, 2)" v-model="row.display"></el-checkbox>
      </template>
    </vxe-grid>

    <el-dialog
      :title="btnType === 'add' ? '添加' : '编辑'"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form ref="formRef" :option="addOption" v-model="form" @submit="submit" @error="error">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </div>
</template>

<script>
import { getTableList, getMunuSelect, add, remove, updateDisplay, updateEnable, getMunuDetails, update } from '@/api/app-manage/useCfg.js';
export default {
  data() {
    return {
      tableHeight: 0,
      loading: false,
      tableData: [],
      dialogVisible: false,
      menuDic: [],
      form: {},
      addDispaly: false,
      menuName: '',
      menuType: '',
      enable: '',
      selectionList: [],
      personSelectArr: [],
      manageSelectArr: [],
      btnType:'add',
    };
  },
  activated() {
    this.tableHeight = window.innerHeight - 206;
    this.onLoad();
    this.getMenuData();
  },
  methods: {
    getMenuData(){
      getMunuSelect().then(r => {
        this.menuDic = [];
        if (r.data.code == 200) {
          let d = r.data.data;
          let arr = d.map(v => ({value:v.id,label:v.menuName}));
          this.menuDic = [{ value: 0, label: '根目录' },...arr];
        }
      });
    },
    handleEdit(){
      if (this.selectionList.length !== 1) return this.$message.warning('请选择一条数据');
      this.btnType = 'edit';
      getMunuDetails({id:this.selectionList[0].id}).then(r => {
        if(r.data.code === 200){
          this.form = r.data.data;
          this.dialogVisible = true;
        }
      })
    },
    handleAdd() {
      this.btnType = 'add';
      this.dialogVisible = true;
      this.form = { menuType: 1, enable: false, parentId: 0 };
    },
    handleDelete() {
      if (this.selectionList.length == 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm("确定要删除选择的数据？", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return remove({ ids: this.ids })
      }).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          this.onLoad();
          this.getMenuData();
        } else {
          this.$message.error(r.data.msg);
        }
      })
    },
    checkboxChange(row, type) {
      if (type == 1) {
        updateEnable({ id: row.id }).then(r => {
          if (r.data.code == 200) {
            this.$message.success(r.data.msg);
          } else {
            this.$message.error(r.data.msg);
            this.onLoad();
          }
        });
      } else {
        updateDisplay({ id: row.id }).then(r => {
          if (r.data.code == 200) {
            this.$message.success(r.data.msg);
          } else {
            this.$message.error(r.data.msg);
            this.onLoad();
          }
        });
      }
    },
    submit(form, done) {
      if(this.btnType === 'add'){
        add(form).then(r => {
          done();
          if (r.data.code == 200) {
            this.$message.success(r.data.msg);
            this.handleClose();
            this.onLoad();
            this.getMenuData();
          } else {
            this.$message.error(r.data.msg);
          }
        }).catch(() => done());
      }else{
        update(form).then(r => {
          done();
          if (r.data.code == 200) {
            this.$message.success(r.data.msg);
            this.handleClose();
            this.onLoad();
            this.getMenuData();
          } else {
            this.$message.error(r.data.msg);
          }
        }).catch(() => done());
      }
    },
    onLoad() {
      let params = {};
      params['menuName'] = this.menuName;
      params['menuType'] = this.menuType;
      params['enable'] = this.enable;
      this.loading = true;
      getTableList(params).then(r => {
        if (r.data.code == 200) {
          this.loading = false;
          let d = r.data.data;
          let arr1 = [];
          d.forEach(item => {
            if (item.children && item.children.length) {
              item.children.forEach(v => {
                v.appName = item.menuName;
                v.menuName = `${v.menuName} ${v.menuKey}`;
                arr1.push(v);
              });
            }else{
              arr1.push({
                appName:item.menuName,
                id:item.id
              })
            }
          });
          this.tableData = arr1;
        } else {
          this.loading = false;
        }
      }).catch(() => {
        this.loading = false;
      });
    },
    checkboxChangeEvent({ records }) {
      this.selectionList = records;
    },
    handleClose() {
      this.$refs.formRef.resetForm();
      this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
    },
    mergeRowMethod({ row, _rowIndex, column, visibleData }) {
      const fields = ['appName'];
      const cellValue = row[column.property];
      if (cellValue && fields.includes(column.property)) {
        const prevRow = visibleData[_rowIndex - 1];
        let nextRow = visibleData[_rowIndex + 1];
        if (prevRow && prevRow[column.property] === cellValue) {
          return { rowspan: 0, colspan: 0 };
        } else {
          let countRowspan = 1;
          while (nextRow && nextRow[column.property] === cellValue) {
            nextRow = visibleData[++countRowspan + _rowIndex];
          }
          if (countRowspan > 1) {
            return { rowspan: countRowspan, colspan: 1 };
          }
        }
      }
    }
  },
  watch: {
    'form.parentId': {
      handler(val) {
        var menuKey = this.findObject(this.addOption.column, 'menuKey');
        if (val == 0) {
          menuKey.rules = [];
          this.addDispaly = false;
        } else {
          (menuKey.rules = [
            {
              required: true,
              message: '请输入key',
              trigger: 'blur'
            }
          ]),
            (this.addDispaly = true);
        }
      }
    }
  },
  computed: {
    ids(){
      let arr = []
      this.selectionList.forEach(v => {
        arr.push(v.id)
      })
      return arr.join(',')
    },
    addOption() {
      return {
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '上级模板',
            prop: 'parentId',
            type: 'select',
            rules: [{
              required: true,
              message: '请选择上级模板',
              trigger: 'change'
            }],
            dicData: this.menuDic,
            span: 24
          },
          {
            label: '应用类型',
            prop: 'menuType',
            type: 'radio',
            dicData: [{ value: 1, label: '个人应用' }, { value: 2, label: '管理应用' }],
            span: 24,
            display: this.addDispaly
          },
          {
            label: '是否启用',
            prop: 'enable',
            type: 'radio',
            dicData: [{ value: true, label: '是' }, { value: false, label: '否' }],
            span: 24,
            display: this.addDispaly
          },
          {
            label: '名称',
            prop: 'menuName',
            span: 24,
            rules: [{
              required: true,
              message: '请输入名称',
              trigger: 'blur'
            }]
          },
          {
            label: 'key',
            prop: 'menuKey',
            span: 24,
            display: this.addDispaly
          },
          {
            label: '关键字',
            prop: 'keyWord',
            span: 24,
            display: this.addDispaly
          },
          {
            label: '页面路径',
            prop: 'pagePath',
            span: 24,
            display: this.addDispaly
          },
          {
            label: '执行脚本',
            prop: 'executeScript',
            span: 24,
            display: this.addDispaly
          }
        ]
      };
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        {
          title: '模板名称',
          field: 'appName',
          width: 200
        },
        {
          title: '子模块',
          field: 'menuName',
          minWidth: 100
        },
        {
          title: '权限',
          field: 'enable',
          minWidth: 100,
          slots: { default: 'enable' }
        },
        {
          title: '图标显示',
          field: 'display',
          minWidth: 100,
          slots: { default: 'display' }
        },
        {
          title: '应用类型',
          field: 'menuType',
          minWidth: 100,
          formatter: ({ cellValue }) => {
            return cellValue == 1 ? '个人应用' : cellValue == 2 ? '管理应用' : '';
          }
        },
        {
          title: '关键字',
          field: 'keyWord',
          minWidth: 100
        }
      ];
    }
  }
};
</script>

<style>

</style>
