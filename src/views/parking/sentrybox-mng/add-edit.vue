<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="38%"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <avue-form ref="formRef" :option="addEditOption" v-model="form" @submit="submit">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>

      <template slot="cfg">
        <div>
          <el-checkbox v-model="form.isTemporaryInOut">临时车允许进出</el-checkbox>
          <el-checkbox v-model="form.isVisitorInOut">访客车允许进出</el-checkbox>
          <el-checkbox v-model="form.isLikeRecognition">模糊匹配</el-checkbox>
        </div>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { addSentry, updateSentry, addChannel, updateChannel, addDev, updateDev } from '@/api/parking/sentrybox.js';

export default {
  data() {
    return {
      title: '',
      dialogVisible: false,
      form: {},
      btnType: 'add',
      type: 1
    };
  },
  methods: {
    openDialog(type, btnType, form = { isTemporaryInOut: false, isVisitorInOut: false, isLikeRecognition: false }) {
      this.dialogVisible = true;
      this.type = type;
      this.btnType = btnType;
      this.form = form;
      if (type == 1 && btnType == 'add') {
        this.title = '添加岗亭';
      }
      if (type == 1 && btnType == 'edit') {
        this.title = '编辑岗亭';
      }
      if (type == 2 && btnType == 'add') {
        this.title = '添加通道';
        this.form.isTemporaryInOut = false;
        this.form.isVisitorInOut = false;
        this.form.isLikeRecognition = false;
      }
      if (type == 2 && btnType == 'edit') {
        this.title = '编辑通道';
      }
      if (type == 3 && btnType == 'add') {
        this.title = '添加设备';
      }
      if (type == 3 && btnType == 'edit') {
        this.title = '编辑设备';
      }
    },
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          if (this.type == 1 && this.btnType == 'add') {
            addSentry(this.form).then(r => {
              done();
              this.handleRes(r);
            }).catch(() => {
              done();
            });
          }
          if (this.type == 1 && this.btnType == 'edit') {
            updateSentry(this.form).then(r => {
              done();
              this.handleRes(r);
            }).catch(() => {
              done();
            });
          }
          if (this.type == 2 && this.btnType == 'add') {
            addChannel(this.form).then(r => {
              done();
              this.handleRes(r);
            }).catch(() => {
              done();
            });
          }
          if (this.type == 2 && this.btnType == 'edit') {
            updateChannel(this.form).then(r => {
              done();
              this.handleRes(r);
            }).catch(() => {
              done();
            });
          }
          if (this.type == 3 && this.btnType == 'add') {
            addDev(this.form).then(r => {
              done();
              this.handleRes(r);
            }).catch(() => {
              done();
            });
          }
          if (this.type == 3 && this.btnType == 'edit') {
            updateDev(this.form).then(r => {
              done();
              this.handleRes(r);
            }).catch(() => {
              done();
            });
          }
        }
      });
    },
    handleRes(r) {
      if (r.data.code == 200) {
        this.$message.success(r.data.msg);
        this.$emit('refeshPage', this.type);
        this.handleClose();
      } else {
        this.$message.error(r.data.msg);
      }
    },
    handleClose() {
      this.form = { isTemporaryInOut: false, isVisitorInOut: false, isLikeRecognition: false }
      this.$refs.formRef.resetForm();
      this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
    }
  },
  computed: {
    addEditOption() {
      return {
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '所属区域',
            prop: 'parkingAreaName',
            disabled: true,
            display: this.type == 1 ? true : false
          },
          {
            label: '岗亭编号',
            prop: 'sentryNum',
            rules: [
              {
                required: true,
                message: '请输入岗亭编号',
                trigger: 'blur'
              }
            ],
            display: this.type == 1 ? true : false,
            maxlength:20
          },
          {
            label: '岗亭名称',
            prop: 'sentryName',
            rules: [
              {
                required: true,
                message: '请输入岗亭名称',
                trigger: 'blur'
              }
            ],
            display: this.type == 1 ? true : false,
            maxlength:20
          },
          {
            label: '岗亭IP',
            prop: 'sentryIp',
            display: this.type == 1 ? true : false,
            maxlength:20
          },
          {
            label: '备注',
            prop: 'sentryDesc',
            display: this.type == 1 ? true : false,
            maxlength:99
          },
          {
            label: '所属岗亭',
            prop: 'sentryName',
            disabled: true,
            display: this.type == 2 ? true : false
          },
          {
            label: '通道编号',
            prop: 'channelNum',
            rules: [
              {
                required: true,
                message: '请输入通道编号',
                trigger: 'blur'
              }
            ],
            display: this.type == 2 ? true : false,
            maxlength:20
          },
          {
            label: '通道名称',
            prop: 'channelName',
            rules: [
              {
                required: true,
                message: '请输入通道名称',
                trigger: 'blur'
              }
            ],
            display: this.type == 2 ? true : false,
            maxlength:20
          },
          {
            label: '进出方向',
            prop: 'channelInOut',
            type: 'select',
            dicData: [{ value: 1, label: '进' }, { value: 2, label: '出' }],
            rules: [
              {
                required: true,
                message: '请选择进出方向',
                trigger: 'change'
              }
            ],
            display: this.type == 2 ? true : false
          },
          {
            label: '配置项',
            prop: 'cfg',
            formslot: true,
            display: this.type == 2 ? true : false,
            span: 24
          },
          {
            label: '所属通道',
            prop: 'channelName',
            disabled: true,
            display: this.type == 3 ? true : false
          },
          {
            label: '设备编号',
            prop: 'devCode',
            rules: [
              {
                required: true,
                message: '请输入设备编号',
                trigger: 'blur'
              }
            ],
            display: this.type == 3 ? true : false,
            maxlength:20
          },
          {
            label: '设备SN',
            prop: 'devSn',
            rules: [
              {
                required: true,
                message: '请输入设备SN',
                trigger: 'cahnge'
              }
            ],
            display: this.type == 3 ? true : false,
            maxlength:20
          },
          {
            label: '设备类型',
            prop: 'devType',
            type: 'select',
            dicData: [{ value: 1, label: 'IOT-THY2' }],
            rules: [
              {
                required: true,
                message: '请选择设备类型',
                trigger: 'cahnge'
              }
            ],
            display: this.type == 3 ? true : false
          }
        ]
      };
    }
  }
};
</script>

<style></style>
