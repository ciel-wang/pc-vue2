<template>
  <el-dialog
    title="设备升级"
    :append-to-body="true"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
    width="480px">
    <div style="position: relative;">
      <el-upload
        ref="upload"
        :action="action"
        :data="{mode:'APK'}"
        :on-success="handleSuccess"
        :before-upload="handleBefore">
        <el-button size="small" type="primary">选择APK</el-button>
      </el-upload>
      <el-button style="position: absolute;left: 100px;top: 1px;" size="small" type="success" @click="submitUpdate">升级</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import website from '@/config/website';
  import { getToken } from '@/util/auth';
  import { sendDevUpgrade } from "@/api/xf/xfdev";

  export default{
    data(){
      return{
        isVisible:false,
        action: `/api/blade-basic/common/upload?${website.tokenHeader}=${getToken()}`,
        devIds:'',
        loading:''
      }
    },
    methods:{
      openDialog(devIds = ''){
        this.isVisible = true;
        this.devIds = devIds;
      },
      handleBefore(file){
        if(file.name.indexOf('.apk') < 0){
          this.$message.warning('请上传APK类型的文件');
          return false;
        }
        this.loading = this.$loading({
          lock: true,
          text: "正在上传中，请耐心等待...",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)"
        });
      },
      handleSuccess(res){
        this.loading.close();
        if(res.code === 200){
          this.$message.success(res.msg)
          this.apkUrl = res.data.absUrl;
        }else{
          this.$message.error(res.msg)
          this.$refs.upload.clearFiles()
        }
      },
      submitUpdate(){
        if(!this.apkUrl) return this.$message.warning('请先上传APK');
        sendDevUpgrade({ devIds:this.devIds.split(','),apkUrl:this.apkUrl }).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg);
            this.isVisible = false;
          }else{
            this.$message.error(r.data.msg);
          }
        })
      }
    }
  }
</script>
