<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="50%"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="escForm" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { addDev, updateDev } from '@/api/visitor/dev';
export default {
  data() {
    return {
      form: {},
      dialogVisible: false,
      title: '添加访客机',
      devTypeData: [
        { label: '自助访客机', value: 3 },
        { label: '台式访客机', value: 6 }
      ]
    };
  },
  methods: {
    openDialog(details) {
      this.dialogVisible = true;
      if (details) {
        this.title = '编辑访客机';
        this.form = details;
      } else {
        this.title = '添加访客机';
        this.form['devType'] = 6;
        this.form["devState"]=1;
      }
    },
    handleClose(done) {
      this.$refs.formRef.resetForm();
      this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
      done();
    },
    escForm() {
      this.$refs.formRef.resetForm();
      this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
    },
    submit(form, done) {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          for (let key in this.form) {
            if (!key.indexOf('$')) {
              delete this.form[key];
            }
          }
          if (this.form.devId) {
            this.form['id'] = this.form.devId;
            updateDev(this.form).then(res => {
              if (res.data.code == '200') {
                this.$message({
                  type: 'success',
                  message: '操作成功!'
                });
                this.$refs.formRef.resetForm();
                this.dialogVisible = false;
                this.$emit('refreshPage');
                done();
              } else {
                this.$message({
                  type: 'error',
                  message: '操作失败!'
                });
                done();
              }
            }).catch(err => {
              done();
            });
          } else {
            addDev(this.form).then(res => {
              if (res.data.code == '200') {
                this.$message({
                  type: 'success',
                  message: '操作成功!'
                });
                this.$refs.formRef.resetForm();
                this.dialogVisible = false;
                this.$emit('refreshPage');
                done();
              } else {
                this.$message({
                  type: 'error',
                  message: '操作失败!'
                });
                done();
              }
            }).catch(err => {
              done();
            });
          }
        }
      });
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '设备名称',
            prop: 'devName',
            rules: [
              {
                required: true,
                message: '请输入访客设备',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label: '设备序列号',
            labelWidth:130,
            prop: 'devSn',
            rules: [
              {
                required: true,
                message: '请输入设备序列号',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label: '设备类型',
            prop: 'devType',
            type: 'select',
            dicData: this.devTypeData,
            rules: [
              {
                required: true,
                message: '请选择设备类型',
                trigger: 'change'
              }
            ]
          },
          {
            label: 'IP地址',
            prop: 'devIp',
            maxlength:20
          },
          {
            label:"是否启用",
            prop:'devState',
            type:'radio',
            dicData:[
              {value:1,label:"是"},
              {value:0,label:"否"}
            ],
          }
        ]
      };
    }
  }
};
</script>

<style></style>
