<template>
  <el-dialog title="设置错误语音" append-to-body :visible.sync="boxShow" width="580px" :before-close="handleClose">
    <avue-upload :action="action" :propsHttp="{ res: 'data',url:'absUrl',name:'absUrl' }" v-model="audioPath2" :limit="1" accept=".wav" :upload-after="uploadAfter"></avue-upload>
    <div class="el-upload__tip">只能上传wav文件，且不超过1M</div>
    <div class="u-m-t-30 u-text-center">
      <el-button type="primary" icon="el-icon-check" :disabled="audioPath ? false : true" @click="submit">提交</el-button>
      <el-button icon="el-icon-close" @click="handleClose">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  import { updateErrVoice } from '@/api/iot/access/face';

  export default{
    data(){
      return{
        boxShow:false,
        action:"",
        audioPath2:[],
        audioPath:'',
        ids:''
      }
    },
    methods:{
      openDialog(ids = ''){
        this.action = `/api/iot-basic/common/upload?${website.tokenHeader}=${getToken()}&mode=DEV_AUDIO_NOAUTH`;
        this.boxShow = true;
        this.audioPath = "";
        this.ids = ids;
      },
      uploadAfter(res,done){
        this.audioPath = res.absUrl;
        done();
      },
      submit(){
        if(!this.audioPath) return this.$message.warning('请先上传音频文件！');
        const loading = this.$loading({
          lock: true,
          text: '正在提交中，请耐心等待...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        updateErrVoice({ ids:this.ids.split(','), audioPath:this.audioPath }).then(r => {
          loading.close();
          if(r.data.code == 200){
            this.$message.success(r.data.msg);
            this.handleClose();
          }else{
            this.$message.error(r.data.msg);
          }
        }).catch(() => loading.close())
      },
      handleClose(){
        this.audioPath2 = [];
        this.audioPath = "";
        this.boxShow = false;
      }
    }
  }
</script>

<style>
</style>
