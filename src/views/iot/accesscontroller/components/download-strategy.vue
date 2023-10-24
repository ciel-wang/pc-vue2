<template>
  <el-dialog
    title="策略下载"
    append-to-body
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :before-close="handleClose"
    width="30%">
    <avue-form :option="option" v-model="form" ref="form">
      <template slot="menuForm">
        <el-button icon="el-icon-plus" type="primary" @click="handleSubmit('ADD')">添加策略</el-button>
        <el-button icon="el-icon-delete" @click="handleSubmit('REMOVE')">删除策略</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
  import { getTimeStrategysDic, devDownStrategy } from "@/api/iot/access/face";

  export default{
    data(){
      return{
        dialogVisible:false,
        strategysDic:[],
        devIds:[],
        form:{}
      }
    },
    methods:{
      handleSubmit(val){
        this.$refs.form.validate((vaild,done)=>{
          if(vaild){
            if(val == 'ADD'){
              devDownStrategy({devIds:this.devIds,strategyIds:this.form.strategyIds,stype:'ADD'}).then(r => {
                if(r.data.code == 200){
                  this.$message.success(r.data.msg)
                  this.handleClose()
                  this.$emit('refeshPage')
                  done()
                }else{
                  this.$message.error(r.data.msg)
                  done()
                }
              }).catch(() => {
                done()
              })
            }else{
              this.$confirm("确定要删除策略？", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
              }).then(() => {
                return devDownStrategy({devIds:this.devIds,strategyIds:this.form.strategyIds,stype:'REMOVE'});
              }).then(r =>{
                if(r.data.code == 200){
                  this.$message.success(r.data.msg)
                  this.handleClose()
                  this.$emit('refeshPage')
                  done()
                }else{
                  this.$message.error(r.data.msg)
                  done()
                }
              }).catch(() => {
                done()
              })
            }
          }
        })
      },
      openDialog(val){
        this.dialogVisible = true;
        this.devIds = val.devIds.split(',')
        getTimeStrategysDic().then(r => {
          this.$nextTick(() => {
            this.strategysDic = r.data.data;
          })
        })
      },
      handleClose(){
        this.form.strategyIds = []
        this.dialogVisible = false
      }
    },
    computed:{
      option(){
        return{
          emptyBtn:false,
          submitBtn:false,
          column:[
            {
              label:"通行策略",
              prop:"strategyIds",
              type:'checkbox',
              dicData:this.strategysDic,
              rules:[{
                required: true,
                message: "请选择策略",
                trigger: "change"
              }],
              props:{
                value:'id',
                label:'strategyName'
              },
              span:24
            },
          ]
        }
      }
    }
  }
</script>

<style>
</style>
