<template>
  <el-dialog
    title="设备参数"
    :append-to-body="true"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
    width="1000px">
    <avue-form ref="formRef" :option="option" v-model="obj" @submit="submit" @error="error">
      <template slot="menuForm">
        <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { faceSetParHardWare } from '@/api/xf/xfdev';
export default {
  name: 'xf-set-meal',
  data() {
    return {
      isVisible: false,
      obj: {
        disp_holding: 2,
        play_type: 0,
        qrcode_passtime: 30,
        off_line_consum_enable: true,
        consume_finish_voice_type: 1,
        consume_communication_out_time: 15,
        repeat_face_time: 10,
        live_test: true,
        light_work_mode: 0,
        depth_perception: 0,
        audio: 200,
        screen_brightness: 200,
        similar_enable: true,
        notice: '欢迎使用',
        admin_pwd: '11223344'
      },
      ids: {},
      sellerMode: [{ label: '单价', value: 0 }, { label: '定值', value: 1 }, { label: '计次', value: 3 }]
    };
  },
  methods: {
    openDialog(ids) {
      this.ids = ids;
      this.isVisible = true;
      let obj = {
        disp_holding: 2,
        play_type: 0,
        qrcode_passtime: 30,
        off_line_consum_enable: true,
        consume_finish_voice_type: 1,
        consume_communication_out_time: 15,
        repeat_face_time: 10,
        live_test: true,
        light_work_mode: 0,
        depth_perception: 0,
        audio: 200,
        screen_brightness: 200,
        similar_enable: true,
        notice: '欢迎使用',
        admin_pwd: '11223344'
      };
      this.obj = obj;
    },
    submit(form, done) {
      form['devIds'] = this.ids;
      faceSetParHardWare(form).then(res => {
        if (res.data.code == 200) {
          this.$message({
            type: 'success',
            message: res.data.msg
          });
        }
        this.isVisible = false;
      });
      done();
    },
    handleEsc() {
      this.isVisible = false;
    }
  },
  computed: {
    timeStepGrade() {
      let arr = [];
      for (let i = 1; i <= 15; i++) {
        arr.push({ label: i, value: i });
      }
      return arr;
    },
    option() {
      return {
        labelWidth: 160,
        emptyBtn: false,
        submitText: '确定',
        column: [
          {
            label: '消费结果显示时长',
            prop: 'disp_holding',
            type: 'select',
            dicData: [
              { label: '2秒', value: 2 },
              { label: '3秒', value: 3 },
              { label: '5秒', value: 5 },
              { label: '10秒', value: 10 },
            ],
            rules: [{
              required: true,
              message: '请输入消费结果显示时长',
              trigger: 'blur'
            }]
          },
          {
            label: '允许离线消费',
            prop: 'off_line_consum_enable',
            type: 'radio',
            dicData: [{ label: '开', value: true }, { label: '关', value: false }],
            rules: [{
              required: true,
              message: '请选择',
              trigger: 'blur'
            }]
          },
          {
            label: '二维码扫码通讯超时秒',
            prop: 'qrcode_passtime',
            rules: [{
              required: true,
              message: '请选择',
              trigger: 'blur'
            }]
          },
          {
            label: '活体开关',
            prop: 'live_test',
            type: 'radio',
            dicData: [{ label: '开', value: true }, { label: '关', value: false }],
            rules: [{
              required: true,
              message: '请选择',
              trigger: 'blur'
            }]
          },
          {
            label: '实时消费超时0-65535秒',
            prop: 'consume_communication_out_time',
            type: 'select',
            dicData: [{ label: '10秒', value: 10 }, { label: '15秒', value: 15 }, { label: '30秒', value: 30 }],
            rules: [{
              required: true,
              message: '请选择',
              trigger: 'blur'
            }]
          },
          {
            label: '补光灯',
            type: 'radio',
            prop: 'light_work_mode',
            dicData: [{ label: '自动', value: 0 }, { label: '打开', value: 1 }, { label: '关闭', value: 2 }],
            rules: [{
              required: true,
              message: '请选择',
              trigger: 'blur'
            }]
          },
          {
            label: '人脸自助机发布通知',
            prop: 'notice',
            rules: [{
              required: true,
              trigger: 'blur'
            }]
          },
          {
            label: '相似人员密码确认',
            prop: 'similar_enable',
            type: 'radio',
            dicData: [{ label: '开', value: true }, { label: '关', value: false }],
            rules: [{
              required: true,
              message: '请选择',
              trigger: 'blur'
            }]
          },
          {
            label: '识别距离',
            prop: 'depth_perception',
            type: 'select',
            dicData: [
              { label: '30CM', value: 4 },
              { label: '60CM', value: 0 },
              { label: '90CM', value: 1 },
              { label: '120CM', value: 2 },
            ],
            rules: [{
              required: true,
              message: '请选择',
              trigger: 'blur'
            }]
          },
          {
            label: '设备管理员密码',
            prop: 'admin_pwd',
            rules: [{
              required: true,
              trigger: 'blur'
            }]
          },
          {
            label: '亮度，范围1~200',
            prop: 'screen_brightness',
            rules: [{
              required: true,
              message: '请选择',
              trigger: 'blur'
            }]
          }
        ]
      };
    }
  }
};
</script>

<style></style>
