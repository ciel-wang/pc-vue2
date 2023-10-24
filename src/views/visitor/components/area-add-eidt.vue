<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="38%"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit" @error="error">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>
      <template slot-scope="scope" slot="areaType">
        <el-radio-group v-model="areaTypeRadio">
          <el-radio label="1">区域</el-radio>
          <el-radio label="2" :disabled="areaTypeRadioDisabled">位置</el-radio>
        </el-radio-group>
      </template>
      <template slot-scope="scope" slot="areaName">
        <el-select v-model="areaNameValue" placeholder="请选择区域名称" v-if="areaNameList.length > 0 && areaTypeRadio == '2'">
          <el-option v-for="item in areaNameList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input v-model="areaNameValue" placeholder="请输入区域名称" maxlength="20" v-else></el-input>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
import { areaList, devList, addArea, updateArea } from '@/api/visitor/area';
export default {
  props:['schoolIdDic','carDevZtreeData'],
  data() {
    return {
      dialogVisible: false,
      title: '',
      areaNameList: [],
      areaNameValue: '',
      form: {},
      areaTypeRadio: '2',
      devNameData: [],
      areaTypeRadioDisabled: true,
      schoolDisabled:false
    };
  },
  watch: {
    areaTypeRadio(val) {
      let posizitionName = this.findObject(this.option.column, 'posizitionName');
      let dev = this.findObject(this.option.column, 'devIds');
      let carDevIdArr = this.findObject(this.option.column, 'carDevIdArr');
      let carAuthSync = this.findObject(this.option.column, 'carAuthSync');
      let isAutoDownAuth = this.findObject(this.option.column, 'isAutoDownAuth');
      if (val == '2') {
        posizitionName.display = true;
        posizitionName.rules = [{
          required: true,
          message: '请输入位置',
          trigger: 'blur'
        }];
        dev.display = true;
        carDevIdArr.display = true;
        carAuthSync.display = true;
        isAutoDownAuth.display = true;
      } else {
        posizitionName.display = false;
        posizitionName.rules = [];
        dev.display = false;
        carDevIdArr.display = false;
        carAuthSync.display = false;
        isAutoDownAuth.display = false;
      }
    },
    immediate: true,
    deep:true
  },
  methods: {
    async openDialog(details) {
      if (details) {
        this.title = '编辑区域';
        if (details.areaType == '1') {
          this.areaTypeRadio = '1';
          this.areaTypeRadioDisabled = true;
          this.schoolDisabled = false;
          this.display = false;
          this.form = details;
          this.areaNameList = [];
          this.areaNameValue = details.areaName;
          this.dialogVisible = true;
        } else {
          await this.initDevName(details.id);
          await this.schoolIdSelectChange({value:details.schoolId});
          this.areaTypeRadio = '2';
          this.areaTypeRadioDisabled = false;
          this.schoolDisabled = true;
          this.display = true;
          this.form = details;
          this.form.carDevIdArr = details.carDevIds;
          this.areaNameValue = details.parentId;
          this.form.posizitionName = details.areaName;
          let devId = details.devIds.split(',');
          this.form['devIds'] = devId;
          this.dialogVisible = true;
        }
      } else {
        let id = 0;
        await this.initDevName(id);
        this.areaTypeRadio = '1';
        this.display = false;
        this.title = '添加区域';
        this.schoolDisabled = false;
        this.dialogVisible = true;
        this.form.isAutoDownAuth = true
      }
    },
    handleClose() {
      this.$refs.formRef.resetForm();
      this.devNameData = [];
      this.areaNameValue = '';
      this.dialogVisible = false;
    },
    submit(form, done) {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          let newForm = {}
          newForm['areaType'] = this.areaTypeRadio;
          newForm['deptId'] = this.form.deptId;
          newForm['schoolId'] = this.form.schoolId;
          if (this.areaTypeRadio == '1') {
            newForm['areaName'] = this.areaNameValue;
          } else {
            newForm['areaName'] = this.form.posizitionName;
            newForm['parentId'] = this.areaNameValue;
            newForm['devIds'] = this.form.devIds.join(',');
            newForm['carAuthSync'] = this.form.carAuthSync;
            let { carDevIdArr, isAutoDownAuth } = this.form
            let carDevIdsArr = []
            carDevIdArr.forEach(v => {
              if(v.startsWith('CDEV')){
                let arr = v.split('-')
                carDevIdsArr.push(arr[1])
              }
            })
            newForm['carDevIds'] = carDevIdsArr.join(',');
            newForm['isAutoDownAuth'] = isAutoDownAuth;
          }
          // 编辑区域提交时
          if (this.title == '编辑区域') {
            newForm['id'] = this.form.id
            updateArea(newForm).then(res => {
              done();
              if (res.data.code == '200') {
                this.$message.success(res.data.msg)
                this.handleClose()
                this.$emit('refreshPage');
              } else {
                this.$message.error(res.data.msg)
              }
            }).catch(() => done());
          } else {
            // 添加区域提交时
            addArea(newForm).then(res => {
              done();
              if (res.data.code == '200') {
                this.$message.success(res.data.msg)
                this.handleClose()
                this.$emit('refreshPage');
              } else {
                this.$message.error(res.data.msg)
              }
            }).catch(() => done());
          }
        }
      });
    },
    // 选择学校时区域的下拉列表
    schoolIdSelectChange(data) {
      let schoolId = data.value;
      this.areaNameList = [];
      areaList(schoolId).then(res => {
        let data = res.data.data;
        data.forEach(v => {
          this.areaNameList.push({
            label: v.areaName,
            value: v.areaId
          });
        });
        if (data.length <= 0) {
          this.areaTypeRadioDisabled = true;
        } else {
          if (this.title == '编辑区域' && this.areaTypeRadio == '1') {
            this.areaTypeRadioDisabled = true;
          } else {
            this.areaTypeRadioDisabled = false;
          }
        }
      });
    },
    // 获取访客设备下拉列表的位置
    initDevName(ids) {
      let devAreaId = ids;
      devList(devAreaId).then(res => {
        this.devNameData = [];
        let data = res.data.data;
        let arr = data.map(v => ({label: v.devName,value: v.devId}));
        this.devNameData = arr;
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
            label: '学校名称',
            prop: 'schoolId',
            type: 'tree',
            dicData: this.schoolIdDic,
            rules: [{
              required: true,
              message: '请输入学校名称',
              trigger: 'blur'
            }],
            props:{
              value:'value',
            },
            nodeClick:(data, node,ref)=>{
              this.schoolIdSelectChange(data);
            },
            disabled:this.schoolDisabled
          },
          {
            label: '类型',
            prop: 'areaType',
            type: 'radio',
            formslot: true
          },
          {
            label: '区域名称',
            prop: 'areaName',
            formslot: true
          },
          {
            label: '位置名称',
            prop: 'posizitionName',
            row: true,
            maxlength:20,
            display: this.display
          },
          {
            label: '访客设备',
            prop: 'devIds',
            type: 'tree',
            display: this.display,
            multiple: true,
            dicData: this.devNameData
          },
          {
            label:"车辆联动",
            prop:"carDevIdArr",
            type:"tree",
            multiple:true,
            dicData:this.carDevZtreeData,
            props:{
              value:'valueStr'
            },
            display: this.display
          },
          {
            label:"车辆同步",
            prop:'carAuthSync',
            type:'select',
            dicData:[
              {value:1,label:"待审核"},
              {value:3,label:"已审核"},
              {value:5,label:"访问中"}
            ],
            display: this.display
          },
          {
            label:"审批入园",
            prop:'isAutoDownAuth',
            type:'radio',
            dicData:[
              {value:true,label:"是"},
              {value:false,label:"否"},
            ],
            display: this.display
          }
        ]
      };
    }
  }
};
</script>

<style></style>
