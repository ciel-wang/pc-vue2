<template>
  <el-drawer
    :title="title"
    :visible.sync="dialogVisible"
    size="480px"
    :before-close="escForm"
    append-to-body
    :wrapperClosable="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit" @error="error">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="escForm" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-drawer>
</template>

<script>
import { classesgroupAdd, classesgroupUpdate, getClassesDefault } from '@/api/kq/classesgroup.js';
import { schedulSelectData } from '@/api/kq/scheduling.js';
export default {
  data() {
    return {
      title: '添加考勤分组',
      dialogVisible: false,
      form: { isKq: true, isDefault: false },
      moreParamQuery: '',
      classesTimeData: [],
      holidayData: [],
      flag: false,
      ClassesDefault: ''
    };
  },
  mounted() {
    schedulSelectData().then(r => {
      if (r.data.code == 200) {
        let c = r.data.data.classesTimeList;
        let h = r.data.data.holidayList;
        this.classesTimeData = [];
        c.forEach(v => {
          this.classesTimeData.push({
            value: v.classesTimeNum,
            label: v.classesTimeName
          });
        });
        this.holidayData = [];
        h.forEach(v => {
          this.holidayData.push({
            value: v.id,
            label: v.holidayName
          });
        });
      }
    });
    getClassesDefault().then(r => {
      if (r.data.code == 200) {
        this.ClassesDefault = r.data.data.groupName;
      }
    });
  },
  methods: {
    openDialog(v) {
      this.dialogVisible = true;
      if (v) {
        this.title = '编辑考勤分组';
        this.form = v;
        this.flag = true;
      } else {
        this.title = '添加考勤分组';
        this.form = { isKq: true, isDefault: false };
        this.flag = false;
      }
    },
    submit(form, done) {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          if (this.flag) {
            classesgroupUpdate(this.form).then(r => {
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
							done();
            }).catch(() => {
							done();
						});
          } else {
            classesgroupAdd(this.form).then(r => {
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
							done();
            }).catch(() => {
							done();
						});
          }
          done();
        } else {
          done();
        }
      });
    },
    escForm() {
      this.form = {};
      this.$refs['formRef'].clearValidate();
      this.$refs['formRef'].resetForm();
      this.dialogVisible = false;
    }
  },
  watch: {
    'form.isKq': {
      handler(val) {
        var classes = this.findObject(this.option.column, 'classesTimeNum');
        var holidayName = this.findObject(this.option.column, 'holidayId');
        if (val) {
          classes.display = true;
          holidayName.display = true;
        } else {
          classes.display = false;
          holidayName.display = false;
        }
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
            label: '分组名称',
            prop: 'groupName',
            span: 24,
            rules: [{
              required: true,
              message: '请填写分组名称',
              trigger: 'blur'
            }],
            maxlength:20
          },
          {
            label: '是否考勤',
            prop: 'isKq',
            type: 'radio',
            span: 24,
            dicData: [
              {value: true,label: '是'},
              {value: false,label: '否'}
            ]
          },
          {
            label: '考勤班次',
            prop: 'classesTimeNum',
            type: 'select',
            span: 24,
            dicData: this.classesTimeData,
            display: true
          },
          {
            label: '假日方案',
            prop: 'holidayId',
            type: 'select',
            span: 24,
            dicData: this.holidayData,
            display: true
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
>>> .el-dialog__body {
  padding: 0px 20px 0;
}
</style>
