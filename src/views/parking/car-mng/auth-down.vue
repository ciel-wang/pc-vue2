<template>
  <el-dialog
    title="权限下载"
    :visible.sync="dialogVisible"
    width="30%"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { authDowm } from '@/api/parking/car.js';

export default {
  props: {
    devZtreeDic: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      form: { eventType: 1 },
      carInfoIds: '',
      carType: 0
    };
  },
  methods: {
    openDialog(ids, carType) {
      this.carInfoIds = ids.join(',');
      this.carType = carType;
      this.form.eventType = 1;
      this.dialogVisible = true;
    },
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          let devIdsArr = [...this.form.devIds];
          let arr2 = [],
            form = {};
          devIdsArr.forEach(v => {
            if (v.startsWith('CDEV')) {
              let arr = v.split('-');
              arr2.push(arr[1]);
            }
          });
          form['devIds'] = arr2.join(',');
          form['enableTime'] = this.form.vaildDate[0];
          form['overdueTime'] = this.form.vaildDate[1];
          form['carInfoIds'] = this.carInfoIds;
          form['eventType'] = this.form.eventType;
          authDowm(form).then(r => {
            done();
            if (r.data.code == 200) {
              this.$message.success(r.data.msg);
              this.handleClose();
            } else {
              this.$message.error(r.data.msg);
            }
          }).catch(() => {
            done();
          });
        }
      });
    },
    handleClose() {
      this.$refs.formRef.resetForm();
      this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        submitText: '保存',
        labelWidth: 120,
        column: [
          {
            label: '权限设置',
            prop: 'eventType',
            type: 'radio',
            dicData: [{ label: '有权', value: 1 }, { label: '删除', value: 2 }, { label: '黑名单', value: 3 }],
            rules: [
              {
                required: true,
                message: '请选择权限',
                trigger: 'change'
              }
            ],
            span: 24,
            control: (val, form) => {
              if (val == 1 && this.carType != 2) {
                return {
                  vaildDate: { display: true }
                };
              } else {
                return {
                  vaildDate: { display: false }
                };
              }
            }
          },
          {
            label: '有效期',
            prop: 'vaildDate',
            type: 'datetimerange',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间',
            rules: [
              {
                required: true,
                message: '请选择有效期',
                trigger: 'change'
              }
            ],
            span: 20
          },
          {
            label: '选择设备',
            prop: 'devIds',
            type: 'tree',
            multiple: true,
            dicData: this.devZtreeDic,
            span: 20,
            rules: [
              {
                required: true,
                message: '请选择设备',
                trigger: 'change'
              }
            ],
            props: {
              value: 'valueStr'
            }
          }
        ]
      };
    }
  }
};
</script>

<style></style>
