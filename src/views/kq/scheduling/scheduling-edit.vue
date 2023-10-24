<template>
  <div>
    <el-drawer
      title="编辑排班"
      size="480px"
      :visible.sync="dialogVisible"
      append-to-body
      :before-close="handleClose"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form ref="formRef" :option="option" v-model="form" @submit="submit" @error="error">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-drawer>

    <el-dialog
      title="请选择"
      :visible.sync="nextDialogVisible"
      width="1000px"
      append-to-body
      top="3vh"
      :before-close="escForm"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="按人员" name="1">
          <classesgroup-add-edit-emp ref="classesgroupAddEditEmpRef" @refreshPage="getChildrenVal"></classesgroup-add-edit-emp>
        </el-tab-pane>
        <el-tab-pane label="按部门" name="2">
          <classesgroup-add-edit-dept ref="classesgroupAddEditDeptRef" @refreshPage="getChildrenVal"></classesgroup-add-edit-dept>
        </el-tab-pane>
        <el-tab-pane label="按分组" name="3">
          <scheduling-edit-group ref="schedulingEditGroupRef" @refreshPage="getChildrenVal"></scheduling-edit-group>
        </el-tab-pane>
        <el-tab-pane label="按班级" name="4">
          <scheduling-edit-class ref="schedulingEditClassRef" @refreshPage="getChildrenVal"></scheduling-edit-class>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import classesgroupAddEditEmp from '../components/classesgroup-add-edit-emp.vue';
import classesgroupAddEditDept from '../components/classesgroup-add-edit-dept.vue';
import schedulingEditGroup from '../components/scheduling-edit-group.vue';
import schedulingEditClass from '../components/scheduling-edit-class.vue'
import { schedulSelectData, schedulGenerateEdit } from '@/api/kq/scheduling.js';

export default {
  components: {classesgroupAddEditEmp,classesgroupAddEditDept,schedulingEditGroup,schedulingEditClass},
  props:{
    classesTimeData:{
      type:Array,
      default:() => []
    },
    holidayData:{
      type:Array,
      default:() => []
    }
  },
  data() {
    return {
      form: {},
      dialogVisible: false,
      nextDialogVisible: false,
      activeName: '1',
    };
  },
  methods: {
    submit(form, done) {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          this.form['startDate'] = this.form.dateranges[0];
          this.form['endDate'] = this.form.dateranges[1];
          schedulGenerateEdit(this.form).then(r => {
            if (r.data.code == 200) {
              this.$message.success(r.data.msg);
              this.form = {};
              this.$refs['formRef'].clearValidate();
              this.$refs['formRef'].resetForm();
              this.dialogVisible = false;
              this.$emit('refreshPage');
            } else {
              this.$message.error(r.data.msg);
            }
          });
          done();
        } else {
          done();
        }
      });
    },
    handleClose() {
      this.form = {};
      this.$refs['formRef'].clearValidate();
      this.$refs['formRef'].resetForm();
      this.dialogVisible = false;
    },
    escForm() {
      this.$refs['classesgroupAddEditEmpRef'].searchReset();
      this.$refs['classesgroupAddEditDeptRef'].searchReset();
      this.$refs['schedulingEditGroupRef'].searchReset();
      this.$refs['schedulingEditClassRef'].searchReset();
      this.activeName = '1';
      this.nextDialogVisible = false;
    },
    getChildrenVal(v) {
      this.activeName = '1';
      if (v.type == 1) {
        this.form.empIds = v.ids;
        this.form['applicatRange'] = v.empNames;
      } else if (v.type == 2) {
        this.form.deptIds = v.ids;
        this.form['applicatRange'] = v.deptNames;
      } else if (v.type == 3) {
        this.form.groupNames = v.ids;
        this.form['applicatRange'] = v.ids;
      }else{
        this.form.classIds = v.ids;
        this.form['applicatRange'] = v.classNames;
      }
      this.nextDialogVisible = false;
    },
    handleClick() {
      if (this.activeName == 1) {
        this.$refs['classesgroupAddEditEmpRef'].onLoad();
      }
      if (this.activeName == 2) {
        this.$refs['classesgroupAddEditDeptRef'].onLoad();
      }
      if (this.activeName == 3) {
        this.$refs['schedulingEditGroupRef'].onLoad();
      }
      if (this.activeName == 4) {
        this.$refs['schedulingEditClassRef'].onLoad();
      }
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '应用范围',
            prop: 'applicatRange',
            span: 24,
            rules: [
              {
                required: true,
                message: '请填写应用范围',
                trigger: 'change'
              }
            ],
            click: () => {
              let that = this;
              that.nextDialogVisible = true;
            }
          },
          {
            label: '班次名称',
            prop: 'classestimeNum',
            span: 24,
            type: 'select',
            filterable:true,
            dicData: this.classesTimeData,
            rules: [
              {
                required: true,
                message: '请选择班次名称',
                trigger: 'change'
              }
            ]
          },
          {
            label: '假日方案',
            prop: 'holidayId',
            span: 24,
            type: 'select',
            filterable:true,
            dicData: this.holidayData,
            rules: [
              {
                required: true,
                message: '请选择假日方案',
                trigger: 'change'
              }
            ]
          },
          {
            label: '日期范围',
            prop: 'dateranges',
            span: 24,
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            format: 'yyyy-MM-dd',
            valueFormat: 'yyyy-MM-dd'
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
>>> .avue-crud__menu {
  min-height: 0;
}
>>> .el-dialog__body {
  padding: 0px 20px 0;
}
</style>
