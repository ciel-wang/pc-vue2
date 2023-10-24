<template>
  <div>
    <basic-container>
      <div class="mbottom8">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添 加</el-button>
        <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit">编 辑</el-button>
        <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEditJs">自定义规则</el-button>
        <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDel">删除</el-button>
      </div>
      <vxe-table
        border
        resizable
        ref="xGrid"
        size="mini"
        auto-resize
        highlight-hover-row
        align="center"
        :height="tableHeight"
        :data="tableData"
        @checkbox-change="checkboxChangeEvent"
        @checkbox-all="checkboxChangeEvent">
        <vxe-table-column width="70" type="checkbox"></vxe-table-column>
        <vxe-table-column title="编号" minWidth="100" field="ruleCode"></vxe-table-column>
        <vxe-table-column title="名称" minWidth="100" field="ruleName"></vxe-table-column>
        <vxe-table-column title="是否启用" minWidth="100" field="ruleEnable">
          <template #default="{row}">
            <i class="icon-xuanzhong" v-if="row.ruleEnable" :style="{color: colorName}"></i>
            <i class="icon-weixuanzhong" v-else></i>
          </template>
        </vxe-table-column>
        <vxe-table-column title="修改人" minWidth="140" field="updateUser"></vxe-table-column>
        <vxe-table-column title="修改时间" minWidth="140" field="updateTime"></vxe-table-column>
      </vxe-table>
    </basic-container>

    <el-dialog
      :title="btnType == 'add' ? '添加' : '编辑'"
      append-to-body :visible.sync="dialogVisible2"
      width="480px" :before-close="handleClose2"
      :close-on-click-modal="false">
      <avue-form ref="formRef2" v-model="form2" :option="option2" @submit="submit2">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="handleClose2" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>

    <el-dialog
      title="自定义规则" append-to-body
      :close-on-click-modal="false"
      :visible.sync="dialogVisible" width="90%"
      :before-close="handleClose" top="5vh">
      <el-row style="background-color: #fff;" :style="{height:tableHeight + 30 + 'px'}">
        <el-col :span="4" style="height: 100%;">
          <div style="height: 50%;box-sizing: border-box;" class="ztreeStyle">
            <jsTree ref="jsTreeRef"></jsTree>
          </div>
          <div style="height: 50%;border-top: 8px solid #f8f8f8;box-sizing: border-box;overflow: auto;">
            <h4 style="margin: 6px 0;">历史记录</h4>
            <p
              class="h_p"
              v-for="item in historyList" :key="item.id"
              @click="historyClick(item)">{{ item.version}} 【{{ item.update_user }}】</p>
          </div>
        </el-col>
        <el-col :span="15" style="height: 100%;">
          <div style="border-left: 8px solid #f8f8f8;border-right: 8px solid #f8f8f8;height: 100%;padding: 15px;box-sizing: border-box;" ref="monacoEditorRef"></div>
        </el-col>
        <el-col :span="5" style="height: 100%;">
          <div style="height: 50%;box-sizing: border-box;">
            <avue-form ref="formRef" v-model="form" :option="option" @submit="submit"></avue-form>
          </div>
          <div style="height: 50%;border-top: 8px solid #f8f8f8;box-sizing: border-box;overflow: auto;padding: 0 6px;">
            <h4 style="margin: 6px 0;">运行结果</h4>
            <pre v-show="errMsg">{{errMsg}}</pre>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { submitJsCode, getJsCodeDetails, addEditJsCode, getJsList, remove, getJsHistory, historyDetails } from '@/api/iot/access/custom-page.js'
  import jsTree from './js-tree.vue'

  export default{
    components:{ jsTree },
    data(){
      return{
        dialogVisible:false,
        monacoEditor:null,
        errMsg:"",
        form:{},
        tableData:[],
        selectionList:[],
        dialogVisible2:false,
        form2:{},
        btnType:"",
        historyList:[]
      }
    },
    activated() {
      this.search();
    },
    methods:{
      submit2(form,done){
        if(this.btnType === 'add') delete form.id;
        addEditJsCode(form).then(r => {
          done();
          if(r.data.code == 200){
            this.$message.success(r.data.msg);
            this.handleClose2();
            this.search();
          }else{
            this.$message.error(r.data.msg)
          }
        }).catch(() => done())
      },
      handleClose2(){
        this.$refs.formRef2.resetForm();
        this.$refs.formRef2.clearValidate();
        this.dialogVisible2 = false;
      },
      handleAdd(){
        this.btnType = 'add';
        this.dialogVisible2 = true;
      },
      handleEdit(){
        if(this.selectionList.length != 1) return this.$message.warning('请选择一条数据');
        this.btnType = 'edit';
        let item = this.selectionList[0];
        item.ruleEnable = item.ruleEnable ? 1 : 0;
        this.form2 = this.selectionList[0];
        this.dialogVisible2 = true;
      },
      handleDel(){
        if(this.selectionList.length == 0) return this.$message.warning('请选择至少一条数据');
        this.$confirm('确定将选择数据删除?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = this.selectionList.map(v => v.id);
          return remove({ ids });
        }).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg);
            this.search();
          }else{
            this.$message.error(r.data.msg);
          }
        });
      },
      handleEditJs(){
        if(this.selectionList.length != 1) return this.$message.warning('请选择一条数据');
        let { id } = this.selectionList[0];
        this.getJsHistoryList(id);
        getJsCodeDetails({ id }).then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            this.jsCode = d.jsCode;
            this.dialogVisible = true;
            this.form.id = id;
            this.$nextTick(() => this.initEdit())
          }
        })
      },
      getJsHistoryList(id){
        getJsHistory({ id }).then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            this.historyList = d;
          }
        })
      },
      historyClick(item){
        historyDetails({ id:item.id }).then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            this.jsCode = d.js_code;
            this.monacoEditor.setValue(d.js_code);
          }
        })
      },
      submit(form){
        this.$refs.formRef.validate((vaild, done) => {
          if(!vaild) return done();
          let { iotime, devSn, cardNum, empCode, id } = form;
          if(!cardNum && !empCode){
            this.$message.warning('请填写学工号或卡号!');
            done();
            return false;
          }
          let jsCode = this.monacoEditor.getValue();
          submitJsCode({ jsCode, iotime, devSn, cardNum, empCode, id }).then(r => {
            done();
            if(r.data.code == 200){
              this.$message.success(r.data.msg);
              this.errMsg = r.data.data;
              this.getJsHistoryList(id);
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch(err => {
            done();
            this.$message.error(err);
          })
        })
      },
      handleClose(){
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.monacoEditor.dispose();
        this.dialogVisible = false;
      },
      search(){
        getJsList().then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            this.tableData = d.records;
          }
        })
      },
      initEdit() {
        this.monacoEditor = monaco.editor.create(this.$refs.monacoEditorRef, {
          theme: "light", // 主题
          value: this.jsCode, // 默认显示的值
          language: 'javascript',
          folding: true, // 是否折叠
          foldingHighlight: true, // 折叠等高线
          foldingStrategy: "indentation", // 折叠方式  auto | indentation
          showFoldingControls: "always", // 是否一直显示折叠 always | mouseover
          disableLayerHinting: true, // 等宽优化
          emptySelectionClipboard: false, // 空选择剪切板
          selectionClipboard: false, // 选择剪切板
          automaticLayout: true, // 自动布局
          codeLens: false, // 代码镜头
          scrollBeyondLastLine: false, // 滚动完最后一行后再滚动一屏幕
          colorDecorators: true, // 颜色装饰器
          accessibilitySupport: "off", // 辅助功能支持  "auto" | "off" | "on"
          lineNumbers: "on", // 行号 取值： "on" | "off" | "relative" | "interval" | function
          lineNumbersMinChars: 5, // 行号最小字符   number
          enableSplitViewResizing: false,
          readOnly: false, //是否只读  取值 true | false
        });
      },
      checkboxChangeEvent({ records }) {
        this.selectionList = records;
      },
    },
    computed:{
      ...mapGetters(['permission','colorName']),
      tableHeight(){
        return window.innerHeight - 200
      },
      option2(){
        return{
          emptyBtn: false,
          submitText: '保存',
          column: [{
            label:'编号',
            prop:'ruleCode',
            span:24,
            rules: [{
              required: true,
              message: '请选择编号',
              trigger: 'blur'
            }],
          },{
            label:'名称',
            prop:'ruleName',
            span:24,
            rules: [{
              required: true,
              message: '请选择名称',
              trigger: 'blur'
            }],
          },{
            label:'是否启用',
            prop:'ruleEnable',
            span:24,
            type:'radio',
            dicData:[
              {value:1,label:"是"},
              {value:0,label:"否"}
            ],
            value:1
          }]
        }
      },
      option(){
        return{
          emptyBtn: false,
          submitText: '运行',
          column: [{
            label:'触发时间',
            prop:'iotime',
            type:'datetime',
            span:24,
            valueFormat:'yyyy-MM-dd HH:mm:ss',
            rules:[{
              required: true,
              message: '请输入触发时间',
              trigger: 'blur'
            }],
          },{
            label:'学工号',
            prop:'empCode',
            span:24,
          },{
            label:'卡号',
            prop:'cardNum',
            span:24,
          },{
            label:'设备SN',
            prop:'devSn',
            span:24,
          }]
        }
      }
    }
  }
</script>

<style lang="scss">
  .h_p{
    padding: 6px;
    cursor: pointer;
    margin: 0;
    &:hover{
      background-color: #f8f8f8;
    }
  }
</style>
