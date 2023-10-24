<template>
  <el-dialog
    title="在线拍照上传"
    :visible.sync="dialogVisible"
    :modal-append-to-body="true"
    top="10vh"
    width="650px"
    :lock-scroll="true"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :append-to-body="true"
    :before-close="handleClose">
    <div
      style="line-height: 10px; padding-bottom: 10px; background: #f5f6f7; margin-bottom: 13px; padding-top: 5px; width: 100%; padding: 0 10px;display: flex;justify-content: space-between;align-items: center;box-sizing: border-box;">
      <div>
        <p>姓名：{{ currentEmpInfo.empName }}</p>
        <p>学工号：{{ currentEmpInfo.empCode }}</p>
        <p>部门/班级：{{ currentEmpInfo.gradeClasss || currentEmpInfo.deptName }}</p>
      </div>
      <div style="color: red;width: 40%;">{{ msg }}</div>
    </div>
    <div class="camera_outer">
      <video id="videoCamera" ref="video" :width="videoWidth" :height="videoHeight" autoplay></video>
      <canvas style="display: none" id="canvasCamera" :width="videoWidth" :height="videoHeight"></canvas>
      <div v-if="imgSrc" class="img_bg_camera"><img :src="imgSrc" alt="" class="tx_img" /></div>
      <img src="/img/faceframe.png" width="300" height="300" style="position: absolute;top: 0;left: 0;z-index: 1;" />
    </div>
    <div style="text-align: center;padding: 10px 0;">
      <el-button type="primary" size="small" :disabled="btnDisabled" @click="setImage">拍照</el-button>
      <el-button type="primary" size="small" :disabled="btnDisabled" @click="uploadPhone">上传照片</el-button>
      <el-button type="info" plain size="small" @click="handlderNext">下一个</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { base64Faceimg } from '@/api/iot/user.js';
export default {
  data() {
    return {
      videoWidth: 300,
      videoHeight: 300,
      imgSrc: '',
      thisCancas: null,
      thisContext: null,
      thisVideo: null,
      dialogVisible: false,
      selectionList:[],
      currentEmpInfo:{},
      msg:"",
      btnDisabled:false
    };
  },
  methods: {
    openDialog(selectionList) {
      this.selectionList = selectionList;
      this.currentEmpInfo = selectionList[0];
      this.imgSrc = "";
      this.dialogVisible = true;
      this.msg = "";
      this.btnDisabled = false;
      this.$nextTick(() => {
        this.getCompetence();
      })
    },
    handlderNext(){
      this.btnDisabled = false;
      this.msg = "";
      this.imgSrc = "";
      this.selectionList.shift();
      if(this.selectionList.length) this.currentEmpInfo = this.selectionList[0];
    },
    uploadPhone() {
      let params = {};
      if (!this.imgSrc) return this.$message.warning('请先拍照');
      let imgSrc = this.imgSrc.substr(23, this.imgSrc.length);
      params['content'] = imgSrc;
      params['empId'] = this.currentEmpInfo.id;
      const loading = this.$loading({
        lock: true,
        text: '正在提交中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      this.btnDisabled = true;
      base64Faceimg(params).then(res => {
        loading.close();
        if (res.data.code == 200) {
          this.msg = '上传成功！';
          if(this.selectionList.length === 1){
            this.imgSrc = '';
            this.$emit('refeshPage');
            this.stopNavigator();
            this.dialogVisible = false;
          }
        }
      }).catch(err => {
        this.msg = res.data.msg;
        this.imgSrc = "";
        this.btnDisabled = false;
        loading.close();
      });
    },
    // 调用权限（打开摄像头功能）
    getCompetence() {
      var _this = this;
      this.thisCancas = document.getElementById('canvasCamera');
      this.thisContext = this.thisCancas.getContext('2d');
      this.thisVideo = document.getElementById('videoCamera');
      // 旧版本浏览器可能根本不支持mediaDevices，我们首先设置一个空对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }
      // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
      // 使用getUserMedia，因为它会覆盖现有的属性。
      // 这里，如果缺少getUserMedia属性，就添加它。
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
          // 首先获取现存的getUserMedia(如果存在)
          var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;
          // 有些浏览器不支持，会返回错误信息
          // 保持接口一致
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
          }
          // 否则，使用Promise将调用包装到旧的navigator.getUserMedia
          return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }
      var constraints = {
        audio: false,
        video: {
          width: this.videoWidth,
          height: this.videoHeight,
          transform: 'scaleX(-1)'
        }
      };

      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        // 旧的浏览器可能没有srcObject
        if ('srcObject' in _this.thisVideo) {
          _this.thisVideo.srcObject = stream;
        } else {
          // 避免在新的浏览器中使用它，因为它正在被弃用。
          _this.thisVideo.src = window.URL.createObjectURL(stream);
        }
        _this.thisVideo.onloadedmetadata = function(e) {
          _this.thisVideo.play();
        };
      }).catch(err => {
        this.$message.warning('未检测到摄像头')
        setTimeout(() => {
          this.dialogVisible = false;
        }, 2000);
      });
    },
    //  绘制图片（拍照功能）
    setImage() {
      var _this = this;
      // 点击，canvas画图
      _this.thisContext.drawImage(_this.thisVideo, 0, 0, _this.videoWidth, _this.videoHeight);
      // 获取图片base64链接
      var image = this.thisCancas.toDataURL('image/jpeg', 1);
      _this.imgSrc = image;
    },
    // base64转文件
    dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(',');
      var mime = arr[0].match(/:(.*?);/)[1];
      var bstr = atob(arr[1]);
      var n = bstr.length;
      var u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    },
    // 关闭摄像头
    stopNavigator() {
      this.thisVideo.srcObject.getTracks()[0].stop();
    },
    handleClose(done) {
      if (this.thisVideo.srcObject) {
        this.stopNavigator();
        done();
      }
      done();
    }
  }
};
</script>
<style lang="scss" scoped>
.camera_outer {
  position: relative;
  overflow: hidden;
  background-size: 100%;
  video,
  canvas,
  .tx_img {
    -moz-transform: scaleX(-1);
    -webkit-transform: scaleX(-1);
    -o-transform: scaleX(-1);
    transform: scaleX(-1);
  }
  .btn_camera {
    position: absolute;
    bottom: 4px;
    left: 0;
    right: 0;
    height: 50px;
    background-color: rgba(0, 0, 0, 0.3);
    line-height: 50px;
    text-align: center;
    color: #ffffff;
  }
  .bg_r_img {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
  }
  .img_bg_camera {
    position: absolute;
    right: 0;
    top: 0;
    img {
      width: 300px;
      height: 300px;
    }
    .img_btn_camera {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      line-height: 50px;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.3);
      color: #ffffff;
      .loding_img {
        width: 50px;
        height: 50px;
      }
    }
  }
}
</style>
