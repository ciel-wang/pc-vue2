<template>
  <el-drawer 
    :title="title" 
    :visible.sync="drawerVisible" 
    :before-close="handleClose" 
    append-to-body 
    size="480px"
    :modal-append-to-body="true" 
    :wrapperClosable="false">
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit" @error="error">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>

      <template slot-scope="scope" slot="empName">
        <div>
          <el-input v-model="form.empName" placeholder="请选择人员" :disabled="true">
            <el-button slot="append" icon="el-icon-search" @click="$refs['selectEmpRef'].openDialog({type:'typeroleAuth'})"></el-button>
          </el-input>
        </div>
      </template>
    </avue-form>
    <select-emp ref="selectEmpRef" @refreshPage="getEmpVal"></select-emp>
  </el-drawer>
</template>

<script>
import { checkboxData, typeroleAddAuditemp } from '@/api/kq/typerole.js';
import selectEmp from '../components/select-emp.vue';
export default {
  components: { selectEmp },
  data() {
    return {
      drawerVisible: false,
      form: {},
      title: '添加单据审批',
      qjDicdata: [],
      bkDicdata: [],
      ccDicdata: [],
      jbDicdata: []
    };
  },
  methods: {
    openDialog(details) {
      this.drawerVisible = true;
      checkboxData().then(r => {
        if (r.data.code == 200) {
          let d = r.data.data;
          this.qjDicdata = [];
          d.qj.forEach(v => {
            this.qjDicdata.push({
              value: v.id,
              label: v.roleName
            });
          });
          this.jbDicdata = [];
          d.jb.forEach(v => {
            this.jbDicdata.push({
              value: v.id,
              label: v.roleName
            });
          });
          this.ccDicdata = [];
          d.cc.forEach(v => {
            this.ccDicdata.push({
              value: v.id,
              label: v.roleName
            });
          });
          this.bkDicdata = [];
          d.bk.forEach(v => {
            this.bkDicdata.push({
              value: v.id,
              label: v.roleName
            });
          });
        }
      });
    },
    submit(form, done) {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          let ids = [...form.qj, ...form.cc, ...form.jb, ...form.bk];
          ids = ids.join(',');
          typeroleAddAuditemp({ auditEmpIds: form['empId'], typeRoleIds: ids }).then(r => {
            if (r.data.code == 200) {
              this.$message.success(r.data.msg);
              this.$emit('refreshPage');
              this.form = {};
              this.$refs['formRef'].clearValidate();
              this.$refs['formRef'].resetForm();
              this.drawerVisible = false;
              done();
            } else {
              this.$message.error(r.data.msg);
              done();
            }
          });
          done();
        }
      });
    },
    getEmpVal(v) {
      let d = v;
      this.form['empId'] = d[0].id;
      this.form['empName'] = d[0].empName;
    },
    handleClose() {
      this.drawerVisible = false;
      this.form = {};
      this.$refs['formRef'].clearValidate();
      this.$refs['formRef'].resetForm();
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        labelWidth: 110,
        column: [
          {
            label: '姓名',
            prop: 'empName',
            formslot: true,
            span: 24,
            rules: [
              {
                required: true,
                message: '请填写姓名',
                trigger: 'change'
              }
            ]
          },
          {
            label: '请假审批权限',
            prop: 'qj',
            span: 24,
            type: 'checkbox',
            dicData: this.qjDicdata
          },
          {
            label: '出差审批权限',
            prop: 'cc',
            span: 24,
            type: 'checkbox',
            dicData: this.ccDicdata
          },
          {
            label: '加班审批权限',
            prop: 'jb',
            span: 24,
            type: 'checkbox',
            dicData: this.jbDicdata
          },
          {
            label: '补卡审批权限',
            prop: 'bk',
            span: 24,
            type: 'checkbox',
            dicData: this.bkDicdata
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
>>> .el-form-item--mini.el-form-item,
>>> .el-form-item--small.el-form-item {
  margin-bottom: 10px !important;
}
</style>
