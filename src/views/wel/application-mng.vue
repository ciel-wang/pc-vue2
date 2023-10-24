<template>
  <el-dialog
    class="application_page"
    :visible.sync="dialogVisible"
    width="1200px"
    top="5vh"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template slot="title">
      <div class="flexBetween" style="width: 95%;">
        <div>
          <span style="margin-right: 10px;">应用管理</span>
          <el-tag closable type="warning" v-show="tagShow" @close="tagShow = false">
            <i class="el-icon-warning"></i>
            应用管理最多添加21个模块，超出部分请先移除后再添加
          </el-tag>
        </div>
        <div>
          <el-button
            type="text" size="mini"
            v-show="!submitShow"
            @click=" submitShow = !submitShow; tagShow = true; ">管理</el-button>
          <el-button
            type="text" size="mini"
            v-show="submitShow"
            @click="dialogVisible = false">取消</el-button>
          <el-button
            type="text" size="mini"
            v-show="submitShow"
            @click="submit"
            :disabled="submitDisabled">保存</el-button>
        </div>
      </div>
    </template>
    <div v-for="item in menu" :key="item.id" style="border-top: 8px solid #eee;padding: 0 20px;">
      <h4>{{ item.name }}</h4>
      <ul>
        <li v-for="obj in item.children" :key="obj.id" >
          <span>{{ obj.name }}</span>
          <div style="position: absolute;top: -21px;right: -6px;z-index: 100;" v-show="submitShow">
            <i
              class="el-icon-circle-plus icon"
              style="color: rgba(42, 130, 228, 1);"
              v-show="!isExist(obj)"
              @click="handleAdd(obj)"></i>
            <i
              class="el-icon-remove icon"
              style="color: rgba(252, 0, 0, 1);"
              v-show="isExist(obj)"
              @click="handleRemove(obj)"></i>
          </div>
        </li>
      </ul>
    </div>
  </el-dialog>
</template>

<script>
import { sendCustomMenu } from '@/api/wel/index.js';

export default {
  data() {
    return {
      dialogVisible: false,
      submitShow: false,
      customMenu: [],
      menu: [],
      submitDisabled: false,
      tagShow: false
    };
  },
  methods: {
    openDialog(menu = [], customMenu = []) {
      this.dialogVisible = true;
      this.submitShow = false;
      this.submitDisabled = false;
      this.tagShow = false;
      this.menu = menu;
      this.customMenu = customMenu;
    },
    isExist(item) {
      let index = this.customMenu.findIndex(v => v.id === item.id);
      return index < 0 ? false : true;
    },
    handleAdd(item) {
      if (this.customMenu.length < 21) {
        this.customMenu.push(item);
      } else {
        this.$message.warning('便捷导航最多添加21个模块，请先移除后再添加');
      }
    },
    handleRemove(item) {
      let arr = this.customMenu.filter(v => v.id != item.id);
      this.customMenu = arr;
    },
    submit() {
      let ids = this.customMenu.map(v => v.id);
      this.submitDisabled = true;
      sendCustomMenu({ menuIds: ids }).then(r => {
        this.submitDisabled = false;
        if (r.data.code === 200) {
          this.$message.success(r.data.msg);
          this.$emit('refeshPage');
          this.dialogVisible = false;
        } else {
          this.$message.error(r.data.msg);
        }
      }).catch(() => (this.submitDisabled = false));
    }
  }
};
</script>

<style lang="scss">
.application_page {
  .el-dialog__body {
    padding: 30px 0;
  }
  ul,li,ol,li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  ul {
    display: flex;
    flex-wrap: wrap;
    color: #fff;
    font-size: 14px;
    li {
      width: 100px;
      height: 40px;
      margin: 0 22px 10px 0;
      border-radius: 5px;
      text-align: center;
      line-height: 40px;
      position: relative;
      background-color: #409EFF;
    }
  }
  .icon {
    cursor: pointer;
    font-size: 18px !important;
  }
}
</style>
