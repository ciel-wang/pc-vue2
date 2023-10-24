<template>
  <basic-container>
    <div>LICENSE:</div>
    <div>
      <span style="background-color: #F2F2F2;padding: 2px 10px;">{{ code }}</span>
    </div>
    <div style="margin-bottom: 10px;">KEY:</div>
    <el-upload 
      class="upload-demo" 
      ref="upload" 
      :action="action" 
      :auto-upload="false" 
      :on-success="handleSuccess">
      <el-button slot="trigger" size="small" type="primary">选择授权文件</el-button>
      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传至服务器</el-button>
    </el-upload>
  </basic-container>
</template>

<script>
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { resetRouter } from '@/router/router';
import { getTopUrl } from '@/util/util';
import { getGrantCode } from '@/api/system/other.js';

export default {
  data() {
    return {
      code: '',
      action: `/api/iot-basic/grant/upload/license?${this.website.tokenHeader}=${getToken()}`
    };
  },
  mounted() {
    getGrantCode().then(r => {
      if (r.data.code === 200) {
        this.code = r.data.data;
      }
    });
  },
  methods: {
    submitUpload() {
      this.$refs.upload.submit();
    },
    handleSuccess(res) {
      if (res.code === 200) {
        this.$message.success('授权文件上传成功，3s后将自动退出系统，请重新登录！');
        setTimeout(() => {
          this.$store.dispatch('LogOut').then(() => {
            resetRouter();
            let loginUrl = getTopUrl().split('?')[0] + '#/login';
            window.location.href = loginUrl;
          });
        }, 3000);
      } else {
        this.$message.error(res.msg);
        this.$refs.upload.clearFiles();
      }
    }
  }
};
</script>

<style scoped>
div {
  margin-bottom: 10px;
}
.basic-container,
>>> .basic-container__card {
  height: 98%;
}
</style>
