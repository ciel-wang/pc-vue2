<template>
  <el-dialog
    title="离线限额"
    :append-to-body="true"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
    width="600px">
    <avue-form ref="formRef" :option="option" v-model="obj" @submit="submit" @error="error">
      <template slot="menuForm">
        <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { getEmpCategoryList, faceSetDevParUnlineMaxXfMoney } from '@/api/xf/xfdev';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import rules from '@/util/numrules';
export default {
  name: 'emp-select',
  data() {
    return {
      moreQueryParam: '',
      data: [],
      currRows: [],
      obj: {},
      devCode: '',
      isVisible: false,
      option: {
        emptyBtn: false,
        submitText: '确定',
        labelWidth:140,
        column: []
      }
    };
  },
  computed: {
    ...mapGetters(['colorName'])
  },
  methods: {
    openDialog(devCodes) {
      this.devCode = devCodes;
      this.isVisible = true;
      this.onLoad();
    },
    //递归调用，对数据进行处理
    onLoad() {
      getEmpCategoryList().then(res => {
        let d = res.data.data.data;
        d.studentCategory.forEach(v => {
          v.dictValue = v.dictValue + ' (学生)'
        })
        d.userCategory.forEach(v => {
          v.dictValue = v.dictValue + ' (教师)'
        })
        this.data = [...d.studentCategory,...d.userCategory];
        let column = [];
        let obj = {};
        this.data.forEach(v => {
          column.push({
            label: v.dictValue,
            placeholder: '请填写最高限额（元）',
            prop: v.code + '_' + v.dictKey,
            append: '元',
            rules: rules.floatNum
          });
          obj[v.code + '_' + v.dictKey] = 0;
        });
        this.option['column'] = column;
        this.obj = obj;
        this.$forceUpdate();
      });
    },
    submit(form, done) {
      form['devCodes'] = this.devCode;
      faceSetDevParUnlineMaxXfMoney(form).then(res => {
        this.$message({
          type: 'success',
          message: res.data.msg
        });
        this.isVisible = false;
      });
      done();
    },
    handleEsc() {
      this.isVisible = false;
    }
  }
};
</script>

<style>
.el-scrollbar {
  height: 100%;
}
.center_open::before {
  left: 7px !important;
}
</style>
