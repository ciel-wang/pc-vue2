<template>
  <el-drawer
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="escForm"
    append-to-body
    size="480px"
    :modal-append-to-body="true"
    :wrapperClosable="false"
    :close-on-press-escape="false">
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit" @error="error">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="escForm" icon="el-icon-close">取消</el-button>
      </template>

      <template slot-scope="scope" slot="isAudit">
        <el-switch v-model="form.isAudit" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
      </template>

      <template slot-scope="scope" slot="empName">
        <el-input v-model="form.empName" placeholder="请选择提交人" :disabled="true">
          <el-button slot="append" icon="el-icon-search" @click="empNameClick"></el-button>
        </el-input>
      </template>

      <template slot-scope="scope" slot="receiptCause">
        <el-input
          v-model="form.receiptCause"
          placeholder="请输入事由"
          type="textarea"
          :maxlength="128"
          :rows="3"
          resize="none"></el-input>
      </template>

      <template slot="jbTimeSteps" slot-scope="scope">
        <div style="width: 100%;color: #606266;font-size: 12px;" v-if="form.jbTimeSteps.length">
          <div>为了方便统计，请填写每日加班时长</div>
          <table width="100%">
            <tr>
              <th style="border: 1px solid #DCDFE6;">加班日期</th>
              <th style="border: 1px solid #DCDFE6;">加班时长(小时)</th>
            </tr>
            <tr v-for="(v, i) in form.jbTimeSteps" :key="i" align="center">
              <td style="border: 1px solid #DCDFE6;">{{ v.date }}</td>
              <td style="border: 1px solid #DCDFE6;"><el-input type="number" v-model="v.hour" placeholder="请输入加班时长" @blur="timeBlur"></el-input></td>
            </tr>
          </table>
        </div>
      </template>

      <!-- 抄送人 -->
      <template slot="duplicateEmpIds" slot-scope="scope">
        <div>
          <span class="duplicateEmpItem" v-for="(v, i) in duplicateEmpList" :key="v.id">
            {{ v.empName }}
            <i class="el-icon-close close" @click="duplicateEmpClick(i)"></i>
          </span>
          <span class="icon-tianjia" style="font-size: 40px !important;vertical-align: super;" @click="duplicateEmpAdd"></span>
        </div>
      </template>

      <!-- 同行人 -->
      <template slot="receiptTogetherEmp" slot-scope="scope">
        <div>
          <span class="duplicateEmpItem" v-for="(v,i) in receiptTogetherEmpList" :key="v.id">
            {{v.empName}}
            <i class="el-icon-close close" @click="receiptTogetherEmpClick(i)"></i>
          </span>
          <span
            class="icon-tianjia"
            style="font-size: 40px !important;vertical-align: super;"
            @click="receiptTogetherEmpAdd"></span>
        </div>
      </template>
    </avue-form>
    <select-emp ref="selectEmpRef" @refreshPage="getEmpVal"></select-emp>
  </el-drawer>
</template>

<script>
import moment from 'moment';
import { typeroleSelectlist, receiptAdd, receiptBetweentime, auditempList, receiptUpdate } from '@/api/kq/receipt.js';
import selectEmp from './select-emp.vue';
import { getToken } from '@/util/auth';
import website from '@/config/website';
export default {
  components: { selectEmp },
  data() {
    return {
      title: '添加请假单',
      dialogVisible: false,
      form: { empId: '', isAudit: true },
      typeLabel: '请假类型',
      reasonLabel: '请假事由',
      dateTimeLabel: '请假时间',
      typeDicData: [],
      dateTimeDisabled: true,
      dateTimeStep: '00:30',
      typeDisabled: true,
      auditEmpDisabled: true,
      auditEmpData: [],
      goto: '',
      duplicateEmpList: [],
      receiptType: '',
      workTime: 0,
      receiptTogetherEmpList:[],
      sourceType:'add'
    };
  },
  methods: {
    openDialog(details) {
      this.dialogVisible = true;
      this.duplicateEmpList = [];
      this.auditEmpData = [];
      this.receiptType = details.type;
      this.form.jbTimeSteps = [];
      if (details.type == 1) {
        if (details.d) {
          this.title = '编辑请假单';
          this.details(details.d);
        } else {
          this.title = '添加请假单';
          this.sourceType = "add";
          this.$set(this.form, 'isAudit', true);
          this.$set(this.form, 'isLeave', 0);
        }
        this.typeLabel = '请假类型';
        this.reasonLabel = '请假事由';
        this.dateTimeLabel = '请假时间';
      }
      if (details.type == 2) {
        this.typeLabel = '出差类型';
        this.reasonLabel = '出差事由';
        this.dateTimeLabel = '出差时间';
        if (details.d) {
          this.title = '编辑出差单';
          this.details(details.d);
        } else {
          this.title = '添加出差单';
          this.$set(this.form, 'isOneWay', true);
          this.$set(this.form, 'receiptVehicle', '1');
          this.$set(this.form, 'isAudit', true);
        }
      }
      if (details.type == 3) {
        if (details.d) {
          this.title = '编辑加班单';
          this.details(details.d);
        } else {
          this.title = '添加加班单';
          this.$set(this.form, 'isAudit', true);
        }
        this.typeLabel = '加班类型';
        this.reasonLabel = '加班事由';
        this.dateTimeLabel = '加班时间';
      }
      if (details.type == 4) {
        if (details.d) {
          this.title = '编辑补卡单';
          this.details(details.d);
          this.form.bkTime = details.d.bkTimeSteps[0];
        } else {
          this.title = '添加补卡单';
          this.$set(this.form, 'isAudit', true);
        }
        this.typeLabel = '补卡类型';
        this.reasonLabel = '补卡事由';
        this.dateTimeLabel = '补卡时间';
      }
      typeroleSelectlist({ roleType: details.type }).then(r => {
        if (r.data.code == 200) {
          this.typeDicData = [];
          let d = r.data.data;
          d.forEach(v => {
            this.typeDicData.push({
              label: v.roleName,
              value: v.id
            });
          });
        }
      });
    },
    details(v) {
      this.sourceType = 'edit';
      let d = v;
      d.isLeave = d.isLeave ? 1 : 0
      d.deptName = d.deptName ? d.deptName : (d.gradeName + d.className)
      d.isAudit = true;
      this.$set(this.form, d);
      this.form = d;
      d.duplicateEmps.forEach(v => {
        this.duplicateEmpList.push({
          id: v.id,
          empName: v.empName.substring(v.empName.length - 2)
        });
      });
      if (d.auditEmps.length) {
        this.form['auditEmpIds'] = d.auditEmps[0].id;
      }
      this.form['datetimerangeData'] = [d.startTime, d.endTime];
      if (d.receiptImgs && d.receiptImgs.length > 5) {
        let imgs = d.receiptImgs.split(',');
        let img = [];
        imgs.forEach(v => {
          img.push({
            label: '',
            value: d.staticPrefix + v
          });
        });
        this.form['receiptImgs'] = img;
      } else {
        this.form['receiptImgs'] = '';
      }
      let arr2 = [];
      d.duplicateEmps.forEach(i => {
        arr2.push(i.id);
      });
      this.form['duplicateEmpIds'] = arr2.join(',');
    },
    timeBlur() {
      let arr = this.form.jbTimeSteps;
      let str = 0;
      arr.forEach(v => {
        if (v.hour > 24) {
          v.hour = 0.5;
        }
        if (0 < v.hour < 24) {
          v.hour = Math.round(v.hour * Math.pow(10, 1)) / Math.pow(10, 1);
        }
        str += v.hour * 1;
      });
      this.form.duration = str.toFixed(1);
    },
    getEmpVal(v) {
      let d = v;
      if (this.goto == 'empName') {
        this.form['empId'] = d[0].id;
        this.form['empName'] = d[0].empName;
        this.form['deptNo'] = d[0].deptNo;
        this.form['deptName'] = d[0].deptName;
        this.dateTimeDisabled = false;
        this.typeDisabled = false;
      }
      if (this.goto == 'duplicateEmp') {
        d.forEach(v => {
          this.duplicateEmpList.push({
            id: v.id,
            empName: v.empName.substring(v.empName.length - 2)
          });
        });
        let obj = {};
        let arr = this.duplicateEmpList;
        arr = arr.reduce(function(item, next) {
          obj[next.id] ? '' : (obj[next.id] = true && item.push(next));
          return item;
        }, []);
        this.duplicateEmpList = arr;
        let arr2 = arr.map(i => i.id);
        this.form['duplicateEmpIds'] = arr2.join(',');
      }
      if(this.goto == "receiptTogether"){
        let arr = d.map(v => ({id:v.id,empName:v.empName.substring(v.empName.length-2)}))
        let arr1 = [...this.receiptTogetherEmpList,...arr]
        let obj = {};
        arr1 = arr1.reduce(function(item, next) {
          obj[next.id] ? '' : obj[next.id] = true && item.push(next);
          return item;
        }, []);
        this.receiptTogetherEmpList = arr1;
        let arr2 = arr1.map(i => i.id);
        this.form["receiptTogether"] = arr2.join(",");
      }
    },
    empNameClick() {
      this.goto = 'empName';
      this.$refs['selectEmpRef'].openDialog({ type: 'empName', isAudit: true,ztree:this.receiptType });
    },
    duplicateEmpClick(v) {
      this.duplicateEmpList.splice(v, 1);
      let arr = this.duplicateEmpList;
      let arr2 = [];
      arr.forEach(i => {
        arr2.push(i.id);
      });
      this.form['duplicateEmpIds'] = arr2.join(',');
    },
    duplicateEmpAdd() {
      this.goto = 'duplicateEmp';
      this.$refs['selectEmpRef'].openDialog({ type: 'duplicateEmp',ztree:this.receiptType });
    },
    receiptTogetherEmpAdd(){
      this.goto = "receiptTogether";
      this.$refs['selectEmpRef'].openDialog({type:"receiptTogether"});
    },
    receiptTogetherEmpClick(v){
      this.receiptTogetherEmpList.splice(v,1);
      let arr = this.receiptTogetherEmpList;
      let arr2 = arr.map(i => i.id);
      this.form["receiptTogether"] = arr2.join(",");
    },
    submit(form, done) {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          let form = JSON.parse(JSON.stringify(this.form));
          form['receiptType'] = this.receiptType;
          if(this.receiptType == 2 && form.duration == 0){
            done();
            return this.$message.warning('假日出差请填写加班单')
          }

          if (this.receiptType == 1 && (this.workTime*1 > this.maxTime || this.workTime*1 < this.minTime)) {
            this.$message.error(`请假时长不在${this.minTime}-${this.maxTime}内`);
            return done();
          }

          if (form.datetimerangeData.length) {
            form['startTime'] = form.datetimerangeData[0];
            form['endTime'] = form.datetimerangeData[1];
          }

          if (typeof form['receiptImgs'] == 'string') {
            form['receiptImgs'] = form['receiptImgs'].split(',');
          }
          let imgs = form['receiptImgs'];
          let arr = imgs.map(v => v.value);
          form['receiptImgs'] = arr.join(',');

          if (this.receiptType == 4) {
            let bktime = form.bkTime;
            form.bkTimeSteps = [bktime];
          }

          if (this.sourceType === 'edit') {
            receiptUpdate(form).then(r => {
              if (r.data.code == 200) {
                this.$message.success(r.data.msg);
                this.$emit('refreshPage');
                this.escForm();
              } else {
                this.$message.error(r.data.msg);
              }
            }).catch(err => {
              done();
            });
          } else {
            receiptAdd(form).then(r => {
              if (r.data.code == 200) {
                this.$message.success(r.data.msg);
                this.$emit('refreshPage');
                this.escForm();
              } else {
                this.$message.error(r.data.msg);
              }
            }).catch(err => {
              done();
            });
          }
          done();
        } else {
          done();
        }
      });
    },
    escForm() {
      this.$refs['formRef'].clearValidate();
      this.$refs['formRef'].resetForm();
      this.sourceType = 'add';
      this.duplicateEmpList = [];
      this.auditEmpData = [];
      this.receiptTogetherEmpList = [];
      this.dialogVisible = false;
    }
  },
  watch: {
    'form.datetimerangeData': {
      handler(val) {
        if (val == undefined || val.length <= 0) {
          this.form['duration'] = '';
        } else {
          if (!val[0] || !val[1]) {
            this.form['duration'] = '';
          } else {
            if (this.receiptType == 3) {
              var startDate = val[0];
              var endDate = val[1];
              var sd = new Date(startDate).getTime(),
                ed = new Date(endDate).getTime(),
                timeDiff = ed - sd;
              var arr = [];
              for (var i = 0; i <= timeDiff; i += 86400000) {
                var v = new Date(sd + i);
                arr.push({
                  date: moment(v).format('YYYY-MM-DD'),
                  hour: 0.5
                });
              }
              this.form.jbTimeSteps = arr;
              this.form.duration = (0.5 * arr.length).toFixed(1);
            } else {
              let params = {};
              params['empId'] = this.form['empId'];
              params['startTime'] = val[0];
              params['endTime'] = val[1];
              receiptBetweentime(params).then(r => {
                if (r.data.code == 200) {
                  this.workTime = (r.data.data.totalMinute / 60).toFixed(1);
                  this.form['duration'] = (r.data.data.totalMinute / 60).toFixed(1);
                }
              });
            }
          }
        }
      },
      immediate: true
    },
    'form.empId': {
      handler(val) {
        if (val) {
          this.dateTimeDisabled = false;
          this.typeDisabled = false;
        } else {
          this.dateTimeDisabled = true;
          this.typeDisabled = true;
        }
      },
      immediate: true
    },
    'form.typeRoleId': {
      handler(val) {
        if (val) {
          let params = {};
          params['empId'] = this.form['empId'];
          params['typeRoleId'] = val;
          this.auditEmpData = [];
          auditempList(params).then(r => {
            if (r.data.code == 200) {
              this.auditEmpDisabled = false;
              let d = r.data.data;
              this.maxTime = d.LEAVETIME_MAX_MINUTE;
              this.minTime = d.LEAVETIME_MIN_MINUTE;
              d.auditEmps.forEach(v => {
                this.auditEmpData.push({
                  value: v.auditEmpId,
                  label: v.empName
                });
              });
            }
          });
        } else {
          this.auditEmpDisabled = true;
        }
      },
      immediate: true
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        labelWidth: 82,
        column: [
          {
            label: '是否审批',
            prop: 'isAudit',
            span: 24,
            formslot: true
          },
          {
            label: '提交人',
            prop: 'empName',
            span: 24,
            formslot: true,
            rules: [
              {
                required: true,
                message: '请输入',
                trigger: 'change'
              }
            ]
          },
          {
            label: '所在部门',
            prop: 'deptName',
            span: 24,
            disabled: true,
            placeholder: '所在部门'
          },
          {
            label: this.typeLabel,
            prop: 'typeRoleId',
            rules: [
              {
                required: true,
                message: '请输入',
                trigger: 'blur'
              }
            ],
            span: 24,
            type: 'select',
            dicData: this.typeDicData,
            disabled: this.typeDisabled
          },
          {
            label: '交通工具',
            prop: 'receiptVehicle',
            span: 24,
            type: 'radio',
            dicData: [
              { value: '1', label: '飞机' },
              { value: '2', label: '火车' },
              { value: '3', label: '汽车' },
              {value: '4', label: '其他' },
            ],
            display: this.receiptType == 2 ? true : false
          },
          {
            label: '单程往返',
            prop: 'isOneWay',
            span: 24,
            type: 'radio',
            dicData: [{ value: true, label: '单程' }, { value: false, label: '往返' }],
            display: this.receiptType == 2 ? true : false
          },
          {
            label: '出发城市',
            prop: 'fromCity',
            span: 24,
            maxlength:50,
            display: this.receiptType == 2 ? true : false
          },
          {
            label: '目的城市',
            prop: 'toCity',
            span: 24,
            maxlength:50,
            display: this.receiptType == 2 ? true : false
          },
          {
            label: this.dateTimeLabel,
            prop: 'datetimerangeData',
            type: 'datetimerange',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间',
            rules: [
              {
                required: true,
                message: '请选择',
                trigger: 'change'
              }
            ],
            span: 24,
            disabled: this.dateTimeDisabled,
            display: this.receiptType == 1 || this.receiptType == 2 ? true : false,
          },
          {
            label: '加班时间',
            prop: 'datetimerangeData',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            valueFormat: 'yyyy-MM-dd',
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间',
            rules: [
              {
                required: true,
                message: '请选择',
                trigger: 'change'
              }
            ],
            span: 24,
            disabled: this.dateTimeDisabled,
            display: this.receiptType == 3 ? true : false
          },
          {
            label: '补卡时间',
            prop: 'bkTime',
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            span: 24,
            rules: [
              {
                required: true,
                message: '请选择',
                trigger: 'change'
              }
            ],
            display:this.receiptType == 4 ? true : false,
          },
          {
            prop: 'jbTimeSteps',
            span: 24,
            display:this.receiptType == 3 ? true : false,
            formslot: true
          },
          {
            label: '总时长(h)',
            prop: 'duration',
            labelWidth: 86,
            span: 24,
            disabled: true,
            placeholder: '自动计算时长(h)',
            display:this.receiptType != 4 ? true : false,
          },
          {
            label: this.reasonLabel,
            prop: 'receiptCause',
            span: 24,
            formslot: true,
            rules: [{
              required: true,
              message: '请填写',
              trigger: 'blur'
            }]
          },
          {
            label: '图片',
            prop: 'receiptImgs',
            type: 'upload',
            loadText: '上传中，请稍等',
            tip: '支持上传JPG,JPEG,PNG格式的图片,单张图片大小不能超过5M',
            action: `/api/iot-kq/receipt/upload/img?${this.website.tokenHeader}=${getToken()}`,
            limit: 3,
            multiple: true,
            drag: false,
            propsHttp: {
              res: 'data'
            },
            listType: 'picture-card',
            span: 24
          },
          {
            label:"是否离校",
            prop:'isLeave',
            type:'radio',
            dicData:[{value:1,label:"是"},{value:0,label:"否"}],
            span:24,
            value:0,
            display:this.receiptType == 1 ? true : false,
            control:(val)=>{
              if(val == 1){
                return{
                  leaveCause:{
                    display:true,
                    rules:[{
                      required:true,
                      message:"请输入外出去向",
                      trigger:'blur'
                    }]
                  }
                }
              }else{
                return{
                  leaveCause:{display:false,rules:[]}
                }
              }
            }
          },
          {
            label:"外出去向",
            prop:"leaveCause",
            span:24,
            maxlength:100,
            display:false
          },
          {
            label: '同行人',
            prop: 'receiptTogetherEmp',
            span: 24,
            display:this.receiptType == 2 ? true : false,
            formslot: true
          },
          {
            label: '审批人',
            prop: 'auditEmpIds',
            span: 24,
            type: 'select',
            rules: [
              {
                required: true,
                message: '请选择审批人',
                trigger: 'change'
              }
            ],
            dicData: this.auditEmpData,
            disabled: this.auditEmpDisabled,
            display: this.form.isAudit
          },
          {
            label: '抄送人',
            prop: 'duplicateEmpIds',
            span: 24,
            type: 'select',
            formslot: true,
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
>>> .el-drawer__body {
  overflow: auto;
}
>>> .el-form-item {
  margin-bottom: 10px !important;
}
>>> .el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
}
>>> .el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
}
.close {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 13px;
  padding: 1px;
  background-color: red;
  border-radius: 13px;
  color: #fff;
  cursor: pointer;
}
.duplicateEmpItem {
  width: 36px;
  height: 37px;
  border: 2px solid #e8e8e8;
  padding: 2px;
  border-radius: 6px;
  display: inline-block;
  font-size: 12px;
  margin-right: 5px;
  text-align: center;
  vertical-align: text-bottom;
  position: relative;
}
</style>
