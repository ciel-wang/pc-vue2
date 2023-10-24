<template>
  <el-dialog
    v-if="dialogVisible"
    :title="title"
    :visible.sync="dialogVisible"
    width="900px"
    :before-close="handleClose"
    append-to-body
    top="5vh"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false" >
    <avue-form ref="formRef" :defaults.sync="defaults" :option="option" v-model="form" @submit="submit">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
        <el-button @click="handleView" icon="el-icon-view" :loading="viewLoading">预览</el-button>
      </template>
      <template slot="textSql" slot-scope="scope">
        <div style="border: 1px solid #F0F2F5;" :style="{ height: display ? '200px' : '500px' }">
          <textarea id="myCm1" ref="myCm1" v-model="form.textSql"></textarea>
        </div>
      </template>
      <template slot="countSql" slot-scope="scope">
        <div style="border: 1px solid #F0F2F5;height: 200px;">
          <textarea id="myCm2" ref="myCm2" v-model="form.countSql"></textarea>
        </div>
      </template>
    </avue-form>
    <div style="padding: 0 15px;height: 500px;overflow: auto;" v-if="flag1">
      <pre id="div">{{ tabelData }}</pre>
    </div>
  </el-dialog>
</template>

<script>
import { cussqlUpdate, cussqlAdd, cussqlDataview } from '@/api/interface/interface.js';
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ambiance.css';
// import "codemirror/addon/hint/show-hint.css";
let CodeMirror = require('codemirror/lib/codemirror');
require('codemirror/mode/sql/sql');
// require("codemirror/addon/hint/sql-hint");

require('codemirror/mode/javascript/javascript');
// require("codemirror/addon/hint/javascript-hint");

// require("codemirror/addon/hint/show-hint");
require('codemirror/addon/selection/active-line.js');

export default {
  components: { codemirror },
  data() {
    return {
      title: '添加',
      dialogVisible: false,
      defaults: {},
      form: { countSql: '' },
      sqlNoDisabled: false,
      tabelData: {},
      viewLoading: false,
      sqlType: '',
      flag1: false,
      cmOptions: {
        tabSize: 4,
        theme: 'ambiance',
        lineNumbers: true,
        styleActiveLine: true,
        line: true,
        indentWithTabs: true,
        smartIndent: true,
        lineWrapping: true,
        autofocus: false,
        matchBrackets: true,
        lineWiseCopyCut: true,
        mode: 'text/x-mariadb',
        hintOptions: {
          completeSingle: false
        }
      },
      editor2: '',
      btnType: 'add',
      display: true
    };
  },
  watch: {
    'form.scriptType'(val) {
      if (val === 1) {
        this.cmOptions.mode = 'text/x-mariadb';
        this.display = true;
        this.$nextTick(() => {
          let that = this;
          let editor2 = CodeMirror.fromTextArea(document.getElementById('myCm2'), this.cmOptions);
          // editor2.on('inputRead', function () {
          //     editor2.showHint()
          // })
          editor2.on('cursorActivity', function() {
            let s = editor2.getValue();
            that.form.countSql = s;
          });
        });
      } else {
        this.cmOptions.mode = 'text/javascript';
        this.display = false;
      }
    }
  },
  methods: {
    openDialog(details) {
      this.dialogVisible = true;
      this.flag1 = false;
      this.sqlType = details.sqlType;
      this.viewLoading = false;
      if (details.details) {
        this.btnType = 'edit';
        this.title = '编辑';
        this.sqlNoDisabled = true;
        this.form = details.details;
      } else {
        this.btnType = 'add';
        this.title = '添加';
        this.sqlNoDisabled = false;
        this.form = { countSql: '' };
      }
      let that = this;
      this.$nextTick(() => {
        let editor1 = CodeMirror.fromTextArea(document.getElementById('myCm1'), this.cmOptions);
        // editor1.on('inputRead', function () {
        //     editor1.showHint()
        // })
        editor1.on('cursorActivity', function() {
          let s = editor1.getValue();
          that.form.textSql = s;
        });
      });
    },
    handleView() {
      this.viewLoading = true;
      cussqlDataview(this.form.sqlNo).then(r => {
        this.viewLoading = false;
        if (r.data.code == 200) {
          this.flag1 = true;
          this.tabelData = r.data;
        }
      }).catch(() => {
        this.viewLoading = false;
      });
    },
    submit(form, done) {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          if (this.btnType === 'edit') {
            this.form.sqlType = this.sqlType;
            cussqlUpdate(this.form).then(r => {
              if (r.data.code == 200) {
                this.$message.success(r.data.msg);
                this.$emit('refreshPage');
              } else {
                this.$message.error(r.data.msg);
              }
              done();
            }).catch(err => done());
          } else {
            this.form.sqlType = this.sqlType;
            cussqlAdd(this.form).then(r => {
              if (r.data.code == 200) {
                this.$message.success(r.data.msg);
                this.$emit('refreshPage');
              } else {
                this.$message.error(r.data.msg);
              }
              done();
            }).catch(err => done());
          }
        }
      });
    },
    handleClose() {
      this.tabelData = [];
      this.viewLoading = false;
      this.dialogVisible = false;
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '编号',
            prop: 'sqlNo',
            rules: [{
              required: true,
              message: '请输入编号',
              trigger: 'blur'
            }],
            span: 8,
            disabled: this.sqlNoDisabled
          },
          {
            label: '名称',
            prop: 'scriptName',
            rules: [{
              required: true,
              message: '请输入名称',
              trigger: 'blur'
            }],
            span: 8
          },
          {
            label: '类型',
            prop: 'scriptType',
            type: 'select',
            dicData: [{ value: 1, label: 'sql' }, { value: 2, label: 'js自定义' }],
            value: 1,
            span: 8
          },
          {
            label: this.display ? '查询SQL' : '自定义',
            prop: 'textSql',
            rules: [{
              required: true,
              message: '请输入' + this.display ? '查询SQL' : '自定义',
              trigger: 'blur'
            }],
            span: 24,
            formslot: true
          },
          {
            label: '统计SQL',
            prop: 'countSql',
            rules: [{
              required: true,
              message: '请输入统计SQL',
              trigger: 'blur'
            }],
            span: 24,
            formslot: true,
            display: this.display
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
>>> .CodeMirror {
  height: 100%;
}
</style>
