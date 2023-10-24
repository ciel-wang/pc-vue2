<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="30%"
    :before-close="escForm"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit" @error="error">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="escForm" icon="el-icon-close">取消</el-button>
      </template>

      <template slot="visitorCauses">
        <el-select v-model="form.visitorCauses" multiple placeholder="请选择 访问事由" @remove-tag="removeTag">
          <el-option
            v-for="item in visitorCauseDic" :key="item.value"
            :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { addLine, updateLine, devmjList, reqVisitorCauses } from '@/api/visitor/line';
import {getTreeList} from '@/api/visitor/area';
export default {
  data() {
    return {
      dialogVisible: false,
      title: '',
      form: {},
      devNameData: [],
      positionIdDict:[],
      btnType:'add',
      visitorCauseDic:[]
    };
  },
  mounted() {
    this.initDevName();
  },
  methods: {
    removeTag(val){
      let index = this.visitorCauseDic.findIndex(v => v.value === val);
      if(index >= 0) return;
      this.visitorCauseDic.push({ value:val,label:val});
    },
    openDialog(details) {
      this.dialogVisible = true;
      getTreeList().then(r => {
        this.positionIdDict = r.data.data;
      })
      reqVisitorCauses().then(r => {
        let arr = r.data.data || [];
        this.visitorCauseDic = arr.map(v => ({ value:v,label:v }));
      })
      if (details) {
        this.title = '编辑线路';
        this.btnType = "edit";
        details.positionId = 'FA-2-' + details.positionId;
        this.form = details;
        this.form['devIds'] = details.devs;
        this.form.visitorCauses = details.visitorCauses && details.visitorCauses.split(',');
      } else {
        this.title = '添加线路';
        this.form.lineSeq = 0;
        this.btnType = "add";
      }
    },
    escForm() {
      this.$refs.formRef.resetForm();
      this.form = {};
      this.positionIdDict = [];
      this.dialogVisible = false;
    },
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          let { positionId, lineName, devIds, lineSeq, visitorCauses } = this.form;
          devIds = devIds.map(v => v+'');

          if(!positionId.startsWith('FA-2')){
            this.$message.error("请选择到位置");
            this.form.positionId = ""
            done();
            return
          }else{
            positionId = positionId.split('-')[2];
          }
          let devs = devIds.filter(v => v.indexOf(',') >= 0).join('#');

          visitorCauses = Array.isArray(visitorCauses) ? visitorCauses.join(',') : '';
          let form = { positionId, lineName, devs, lineSeq, visitorCauses };
          if (this.btnType === 'edit') {
            form.id = this.form.id;
            updateLine(form).then(res => {
              done();
              if (res.data.code == '200') {
                this.$message.success(res.data.msg);
                this.escForm();
                this.$emit('refreshPage');
              } else {
                this.$message.error(res.data.msg);
              }
            }).catch(() =>  done());
          } else {
            addLine(form).then(res => {
              done();
              if (res.data.code == '200') {
                this.$message.success(res.data.msg);
                this.escForm();
                this.$emit('refreshPage');
              } else {
                this.$message.error(res.data.msg);
              }
            }).catch(() => done());
          }
        }
      });
    },
    // 获取设备的下拉数据
    initDevName() {
      this.devNameData = [];
      devmjList().then(res => {
        let data = res.data.data;
        data.forEach(v => {
          if (v.children) {
            v.children.forEach(c => {
              c.value = v.value + ',' + c.value;
            });
          }
        });
        this.devNameData = data;
      });
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '区域位置',
            prop: 'positionId',
            type: 'tree',
            dicData: this.positionIdDict,
            rules: [{
              required: true,
              message: '请选择区域位置',
              trigger: 'blur'
            }],
            span: 24,
            props:{
              value:'valueStr',
            },
          },
          {
            label: '线路名称',
            span: 24,
            prop: 'lineName',
            rules: [{
              required: true,
              message: '请输入线路名称',
              trigger: 'blur'
            }],
            maxlength:20
          },
          {
            label: '门禁设备',
            span: 24,
            prop: 'devIds',
            type: 'tree',
            multiple: true,
            dicData: this.devNameData,
            rules: [{
              required: true,
              message: '请选择门禁设备',
              trigger: 'blur'
            }],
          },
          {
            label: '序号',
            span: 24,
            prop: 'lineSeq'
          },
          {
            label: "访问事由",
            prop: "visitorCauses",
            formslot:true,
            span: 24,
          }
        ]
      };
    }
  }
};
</script>