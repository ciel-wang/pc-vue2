<template>
  <el-dialog
    title="导出图片"
    :visible.sync="dialogVisible"
    :modal-append-to-body="true"
    top="30vh"
    width="480px"
    :lock-scroll="true"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
    :append-to-body="true">
    <span>是否优先导出原图：</span>
    <el-checkbox v-model="isPriorityOriginal"></el-checkbox>
    <p class="c909399 u-font-12">备注：由于原图较大，导出原图时一次最大导出200人。</p>
    <div class="u-text-center u-p-t-40">
      <el-button size="small" @click="handleExport" icon="el-icon-download" type="primary">导出</el-button>
      <el-button @click="dialogVisible = false" size="small" icon="el-icon-close">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import website from "@/config/website";
  import { getToken } from "@/util/auth";

  export default{
    data(){
      return{
        dialogVisible:false,
        isPriorityOriginal:true,
        ids:""
      }
    },
    methods:{
      openDialog(ids = ""){
        this.dialogVisible = true;
        this.isPriorityOriginal = true;
        this.ids = ids;
      },
      handleExport(){
        this.dialogVisible = false;
        window.open(`/api/iot-basic/user/batch/export-face-picture?${website.tokenHeader}=${getToken()}&ids=${this.ids}&isPriorityOriginal=${this.isPriorityOriginal ? 1 : 0}`);
      }
    }
  }
</script>

<style>
</style>
