<template>
  <el-dialog title="设置密码"
             append-to-body
             :visible.sync="boxShow"
             width="30%">
    <avue-form :option="option" v-model="obj" @submit="submit" >
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="boxShow = false" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
  import {updateFacePwd} from "@/api/iot/access/face";
  export default {
    name:'set-pwd',
      data() {
        return {
          boxShow:false,
          obj:{
            name:'张三',
          },
          option:{
            submitText:"保存",
            emptyBtn:false,
            labelWidth:150,
            column:[
              {
                label:'设备序列号',
                prop:'devSn',
                readonly:true,
                span:24,
              },
              {
                label:'设备旧密码',
                prop:'devPwd',
                span:24,
              },
              {
                label:'设备新密码',
                prop:'newDevPwd',
                rules: [{
                  required: true,
                  message: "请输入设备新密码",
                  trigger: "blur"
                }],
                span:24,
              },
            ]
          },
        };
      },
      methods: {
        showSetPwdBox(row){
          this.obj = row;
          this.boxShow = true;
        },
        submit(form,done){
          updateFacePwd({"devId":form.id,"newDevPwd":form.newDevPwd,"devPwd":form.devPwd}).then(res=>{
            done()
            if(res.data.code == 200){
              this.$message.success('修改成功');
              this.boxShow = false;
              this.$emit("updatePage")
            }else{
              this.$message.warning(res.data.msg);
            }
          }).catch(() => done())
        }
      }
  }
</script>

<style>
</style>
