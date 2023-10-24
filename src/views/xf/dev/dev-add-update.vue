<template>
  <!-- 添加编辑设备 -->
  <span>
    <el-button v-if="type == '1' && permission.dev_add_btn" type="primary" size="small" :icon="icon" @click="devAdd">添加</el-button>
    <el-dialog
      :title="digTitle"
      :append-to-body="true"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="isVisible"
      width="850px">
      <avue-form ref="formRef" :option="option" v-model="obj" @submit="submit" @error="error">
        <template slot="menuForm">
          <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </span>
</template>

<script>
import { addXfDev, getDetail, updateXfDev } from '@/api/xf/xfdev';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
export default {
  name: 'xf-dev-add-update',
  props: {
    type: {
      type: String,
      default: '1'
    },
    icon: {
      type: String
    },
    sellerData:{
      type:Array,
      default:() => []
    }
  },
  data() {
    return {
      isVisible: false,
      obj: {},
      digTitle: '',
      isDisabled: false,
      pData: [
        { value: 1, label: '刷脸', is4: false, is5: true },
        { value: 2, label: '刷卡', is4: true, is5: true },
        { value: 3, label: '刷码', is4: true, is5: true },
      ],
      payModeData: []
    };
  },
  mounted() {
    if (this.type == '1') {
      this.digTitle = '添加设备';
    } else if (this.type == '2') {
      this.digTitle = '编辑设备';
    }
  },
  methods: {
    devAdd(row, isEdit) {
      if (isEdit) {
        this.isDisabled = true;
        this.$nextTick(() => {
          getDetail({ id: row.devId }).then(res => {
            let data = res.data.data;
            this.obj = data;
            this.$forceUpdate();
            this.obj = data;
            this.isVisible = true;
          });
        });
      } else {
        this.isDisabled = false;
        this.obj.devState = 1;
        this.isVisible = true;
      }
    },
    submit(form, done) {
      let payMode = '';
      let dev = form.sellerId
      if(!dev.startsWith("SELLER")){
        this.$message.error("请选择商户")
        this.obj.sellerId = ""
        done();
        return;
      }else{
        form.sellerId = dev.split('-')[1]
      }
      if (this.type == '1') {
        addXfDev(form).then(res => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          });
          this.$emit('refreshPage');
          this.isVisible = false;
          done();
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate();
            this.$refs.formRef.resetForm();
          }
        }).catch(err => {
          done();
        });
      }
      if (this.type == '2') {
        updateXfDev(form).then(res => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          });
          this.$emit('refreshPage');
          this.isVisible = false;
          done();
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate();
            this.$refs.formRef.resetForm();
          }
        }).catch(err => {
          done();
        });
      }
      this.$emit('refreshPage');
    },
    handleEsc() {
      this.isVisible = false;
    }
  },
  computed: {
    ...mapGetters(['permission']),
    option() {
      return {
        submitText: '保存',
        emptyBtn: false,
        column: [
          {
            label: '设备编号',
            prop: 'devCode',
            disabled: this.isDisabled,
            rules: [{
              required: true,
              message: '请输入设备编号',
              trigger: 'blur'
            }],
            maxlength:20
          },
          {
            label: '设备名称',
            prop: 'devName',
            rules: [{
              required: true,
              message: '请输入设备名称',
              trigger: 'blur'
            }],
            maxlength:20
          },
          {
            label: '设备SN',
            prop: 'devSn',
            disabled: this.isDisabled,
            rules: [{
              required: true,
              message: '设备序列号',
              trigger: 'blur'
            }],
            maxlength:20
          },
          {
            label: '设备类型',
            prop: 'devType',
            type: 'select',
            rules: [{
              required: true,
              message: '请输入设备类型',
              trigger: 'blur'
            }],
            dicData: [{ value: 4, label: 'W-ICF01' }, { value: 5, label: 'W-ACF01' }]
          },
          {
            label: '隶属商户',
            prop: 'sellerId',
            type: 'tree',
            dicData: this.sellerData,
            rules: [{
              required: true,
              message: '请选择商户',
              trigger: 'blur'
            }],
            props:{
              value:"valueStr"
            }
          },
          {
            label: '下载类型',
            prop: 'devReadCardType',
            rules: [{
              required: true,
              message: '请选择下载类型',
              trigger: 'blur'
            }],
            type:'select',
            dicData:[
              {value:1,label:'物理卡号'},{value:2,label:'卡序列号'}
            ]
          },
          {
            label: '服务器IP',
            prop: 'serverIp',
            rules: [{
              required: false,
              message: '请输入服务器IP',
              trigger: 'blur'
            }],
            maxlength:20
          },
          {
            label:"是否启用",
            prop:'devState',
            type:'radio',
            dicData:[
              {value:1,label:"是"},
              {value:0,label:"否"}
            ]
          },
          {
            label: '备注',
            prop: 'remarks',
            maxlength:99
          }
        ]
      };
    }
  }
};
</script>

<style></style>
