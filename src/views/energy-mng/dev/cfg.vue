<template>
  <el-dialog
    title="工作参数"
    :visible.sync="dialogVisible"
    width="700px"
    top="5vh"
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
  import { updateWorkparam } from '@/api/energy-mng/index.js'

  export default{
    data(){
      return{
        dialogVisible:false,
        form:{}
      }
    },
    methods:{
      openDialog(form = {}) {
        this.dialogVisible = true;
        this.form = form;
      },
      submit(form, done){
        let { devIds,screenTitle,kfMode,workMode,freeTime,offLineState,jsUnit,jsPreKfSecond,jsHotWaterRealKfSecond,jsHotWaterRealMoney,llPreKfSecond,llHotWaterRealKfSecond,llHotWaterRealMoney, backlightDuration } = form;
        let obj = { devIds };
        obj.param = { screenTitle,kfMode,workMode,freeTime,offLineState,jsUnit,jsPreKfSecond,jsHotWaterRealKfSecond,jsHotWaterRealMoney,llPreKfSecond,llHotWaterRealKfSecond,llHotWaterRealMoney, backlightDuration };
        updateWorkparam(obj).then(r => {
          done();
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.handleClose();
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
          labelWidth:120,
          size:'mini',
          column: [{
            label: '屏幕标题',
            prop: 'screenTitle',
            rules: [{
              required: true,
              message: '请输入屏幕标题',
              trigger: 'blur'
            }],
            maxlength:7
          },{
            label: '背光时间',
            prop: 'backlightDuration',
            placeholder:"背光时间最大值为864000",
            rules: [{
              required: true,
              message: '请输入背光时间',
              trigger: 'blur'
            }],
            type:'number',
            min:0,
            max:864000,
            precision:0,
            controls:false,
          },{
            label: '扣费选择',
            prop: 'kfMode',
            rules: [{
              required: true,
              message: '请选择扣费选择',
              trigger: 'blur'
            }],
            type:"select",
            dicData:[
              {value:0,label:"计时"},
              {value:1,label:"脉冲"}
            ]
          },{
            label: '脱机记账功能',
            prop: 'offLineState',
            rules: [{
              required: true,
              message: '请选择脱机记账功能',
              trigger: 'blur'
            }],
            type:"select",
            dicData:[
              {value:0,label:"开启"},
              {value:1,label:"关闭"}
            ]
          },{
            label: '工作模式',
            prop: 'workMode',
            rules: [{
              required: true,
              message: '请选择工作模式',
              trigger: 'blur'
            }],
            type:"select",
            dicData:[
              {value:0,label:"实时"},
              {value:1,label:"预扣费"}
            ]
          },{
            label: '脉冲单位(脉冲/升水)',
            prop: 'jsUnit',
            labelWidth:160,
            rules: [{
              required: true,
              message: '请输入脉冲单位',
              trigger: 'blur'
            }],
            type:'number',
            min:0,
            max:9999,
            precision:0,
            controls:false,
          },{
            label: '免费时间(秒)',
            prop: 'freeTime',
            placeholder:"免费时间最大值为65535",
            rules: [{
              required: true,
              message: '请输入免费时间',
              trigger: 'blur'
            }],
            type:'number',
            min:0,
            max:65535,
            precision:0,
            controls:false,
          }],
          group:[
            {
              label: '计时票价',
              prop: 'group1',
              collapse:this.form.kfMode == 1 ? true : false,
              column:[{
                label: '预扣费时间(秒)',
                prop: 'jsPreKfSecond',
                placeholder:"预扣费时间最大值为65535",
                rules: [{
                  required: true,
                  message: '请输入预扣费时间',
                  trigger: 'blur'
                }],
                type:'number',
                min:0,
                max:65535,
                precision:0,
                controls:false,
                row:true
              },{
                label:"一通道时间(秒)",
                prop:"jsHotWaterRealKfSecond",
                placeholder:"时间最大值为255秒",
                type:'number',
                min:0,
                max:255,
                precision:0,
                controls:false,
                rules: [{
                  required: true,
                  message: '请输入时间(秒)',
                  trigger: 'blur'
                }],
              },{
                label:"一通道金额(分)",
                prop:"jsHotWaterRealMoney",
                placeholder:"金额最大值为4294967295分",
                type:'number',
                min:0,
                max:4294967295,
                precision:0,
                controls:false,
                rules: [{
                  required: true,
                  message: '请输入金额(分)',
                  trigger: 'blur'
                }],
              }]
            },
            {
              label: '计量票价',
              prop: 'group2',
              collapse:this.form.kfMode == 2 ? true : false,
              column:[{
                label: '预扣费脉冲(秒)',
                prop: 'llPreKfSecond',
                placeholder:"预扣费脉冲最大值为65535",
                rules: [{
                  required: true,
                  message: '请输入预扣费脉冲',
                  trigger: 'blur'
                }],
                type:'number',
                min:0,
                max:65535,
                precision:0,
                controls:false,
                row:true
              },{
                label:"一通道脉冲",
                prop:"llHotWaterRealKfSecond",
                placeholder:"脉冲最大值为255",
                type:'number',
                min:0,
                max:255,
                precision:0,
                controls:false,
                rules: [{
                  required: true,
                  message: '请输入脉冲',
                  trigger: 'blur'
                }],
              },{
                label:"一通道金额(分)",
                prop:"llHotWaterRealMoney",
                placeholder:"金额最大值为4294967295分",
                type:'number',
                min:0,
                max:4294967295,
                precision:0,
                controls:false,
                rules: [{
                  required: true,
                  message: '请输入金额(分)',
                  trigger: 'blur'
                }],
              }]
            }
          ]
        }
      }
    }
  }
</script>

<style scoped>
  >>>.avue-group__header{
    height: 30px;
    line-height: 30px;
  }
</style>
