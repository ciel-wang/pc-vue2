<template>
  <el-dialog
    :title="btnType === 'add' ? '添加设备' : '编辑设备'"
    :visible.sync="dialogVisible"
    width="480px"
    top="10vh"
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
  import { sendEnergyDevForm } from '@/api/energy-mng/index.js'

  export default{
    data(){
      return{
        btnType:"add",
        dialogVisible:false,
        form:{}
      }
    },
    methods:{
      openDialog(btnType = 'add',form = {}) {
        this.dialogVisible = true;
        this.btnType = btnType;
        if(btnType === 'add'){
          this.form.devState = 1;
        }else{
          this.form = form;
        }
      },
      submit(form, done){
        let { devCode, devName, devIp, devState, devType, remark } = form;
        let obj = { devCode, devName, devIp, devState, devType, remark };
        if(this.btnType === 'edit') obj.id = this.form.id;
        sendEnergyDevForm(obj).then(r => {
          done()
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.handleClose();
            this.$emit('refeshPage');
          }else{
            this.$message.error(r.data.msg);
          }
        }).catch(() => done())
      },
      handleClose(){
        this.$refs['formRef'].clearValidate();
        this.$refs['formRef'].resetForm();
        this.dialogVisible = false;
      }
    },
    computed:{
      option(){
        return{
          emptyBtn: false,
          submitText: '保存',
          column: [{
            label: '设备编号',
            prop: 'devCode',
            span: 24,
            rules: [{
              required: true,
              message: '请输入设备编号',
              trigger: 'blur'
            }],
            maxlength:20
          },{
            label: '设备名称',
            prop: 'devName',
            span: 24,
            rules: [{
              required: true,
              message: '请输入设备名称',
              trigger: 'blur'
            }],
            maxlength:20
          },{
            label: '设备类型',
            prop: 'devType',
            span: 24,
            type:"select",
            dicData:[
              {value:9,label:"水控"},
              {value:10,label:"电控"}
            ],
            rules: [{
              required: true,
              message: '请选择设备类型',
              trigger: 'blur'
            }],
          },{
            label: '设备IP',
            prop: 'devIp',
            span: 24,
            rules: [{
              required: true,
              message: '请输入设备IP',
              trigger: 'blur'
            }],
            maxlength:20
          },{
            label: '位置',
            prop: 'remark',
            span: 24,
            maxlength:50
          },{
            label: '是否启用',
            prop: 'devState',
            type:"radio",
            dicData:[
              {value:1,label:"是"},
              {value:0,label:"否"}
            ]
          }]
        }
      }
    }
  }
</script>

<style>
</style>
