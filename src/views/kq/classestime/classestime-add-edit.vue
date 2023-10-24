<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="925px"
    top="5vh"
    :before-close="escForm"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-form ref="formRef" :model="form" label-width="75px" inline>
      <el-form-item label="班次编号" prop="classesTimeNum" size="mini">
        <el-input style="width: 120px;" v-model="form.classesTimeNum" :disabled="classesTimeNumDisa" maxlength="20"></el-input>
      </el-form-item>
      <el-form-item label="班次名称" prop="classesTimeName" size="mini">
        <el-input v-model="form.classesTimeName" maxlength="20"></el-input>
      </el-form-item>
      <el-form-item label="排序" label-width="45px" prop="classesTimeSeq" size="mini">
        <el-input style="width: 120px;" v-model="form.classesTimeSeq" maxlength="999"></el-input>
      </el-form-item>
      <el-form-item label="范围间隔" size="mini">
        <el-input-number
          style="width: 80px;"
          :min="0" :max="60"
          :precision="0"
          v-model="step"
          :controls="false"
          @change="stepChange"></el-input-number> 分钟
      </el-form-item>
      <div style="font-size: 18px;color: #303133;padding-bottom: 10px;">班次定义</div>
      <el-form-item size="mini">
        <el-table :data="data" :span-method="spanMethod" size="mini" border style="width: 731px;">
          <el-table-column label="" width="80" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.timestepNum }}</span>
            </template>
          </el-table-column>

          <el-table-column label="" width="80" prop="sxb" align="center"></el-table-column>

          <el-table-column label="上下课时间" width="170" align="center">
            <template slot-scope="scope">
              <el-time-select
                v-if="scope.row.sxb == '上课'"
                style="width: 130px;"
                v-model="form['startWorkTime_'+scope.row.value]"
                placeholder="时间"
                size="mini"
                :picker-options="{ start: '00:00', step: '00:05', end: '23:45'}"
                @change="startWorkTimeChange($event,scope.row.value)">
              </el-time-select>
              <el-time-select
                v-else
                style="width: 130px;"
                v-model="form['endWorkTime_'+scope.row.value]"
                placeholder="时间"
                size="mini"
                :picker-options="{ start: '00:00', step: '00:05', end: '23:45'}"
                @change="endWorkTimeChange($event,scope.row.value)">
              </el-time-select>
            </template>
          </el-table-column>

          <el-table-column label="上下课打卡范围" width="300" align="center">
            <template slot-scope="scope">
              <span style="margin-right: 10px;">
                <el-time-select
                  v-if="scope.row.sxb == '上课'"
                  style="width: 130px;"
                  v-model="form['startWorkStartTime_'+scope.row.value]"
                  placeholder="开始时间"
                  size="mini"
                  :picker-options="{ start: '00:00', step: '00:05', end: '23:45'}">
                </el-time-select>
                <el-time-select
                  v-else
                  style="width: 130px;"
                  v-model="form['endWorkStartTime_'+scope.row.value]"
                  placeholder="开始时间"
                  size="mini"
                  :picker-options="{ start: '00:00', step: '00:05', end: '23:45'}">
                </el-time-select>
              </span>
              <span>
                <el-time-select
                  v-if="scope.row.sxb == '上课'"
                  style="width: 130px;"
                  v-model="form['startWorkEndTime_'+scope.row.value]"
                  placeholder="结束时间"
                  size="mini"
                  :picker-options="{ start: '00:00', step: '00:05', end: '23:45'}">
                </el-time-select>
                <el-time-select
                  v-else
                  style="width: 130px;"
                  v-model="form['endWorkEndTime_'+scope.row.value]"
                  placeholder="结束时间"
                  size="mini"
                  :picker-options="{ start: '00:00', step: '00:05', end: '23:45'}">
                </el-time-select>
              </span>
            </template>
          </el-table-column>

          <el-table-column label="是否免卡" width="100" align="center">
            <template slot-scope="scope">
              <el-checkbox v-if="scope.row.sxb == '上课'" v-model="form['earlyIsSignIn_' + scope.row.value]"></el-checkbox>
              <el-checkbox v-else v-model="form['nightIsSignIn_' + scope.row.value]"></el-checkbox>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <div style="font-size: 18px;color: #303133;padding-bottom: 10px;">弹性打卡</div>
      <el-form-item size="mini">
        <el-checkbox v-model="checkboxItem1" @change="item1Change">允许晚到晚走，早到早走</el-checkbox>
        <div style="margin-left: 30px;" v-show="checkboxItem1">
          <div style="margin: 10px 0;">上课最多可晚到：
            <el-input-number v-model="checkboxItem1_1" :min="0" :precision="0" :controls="false" style="width: 85px;vertical-align: middle;" class="number_input"></el-input-number>
            <span class="apendClass">分钟</span>
            上课晚到{{ checkboxItem1_1 }}分钟，下课需晚走{{ checkboxItem1_1 }}分钟
          </div>
          <div>下课最多可早走：
            <el-input-number v-model="checkboxItem1_2" :min="0" :precision="0" :controls="false" style="width: 85px;vertical-align: middle;" class="number_input"></el-input-number>
            <span class="apendClass">分钟</span>
            上课早到{{ checkboxItem1_2 }}分钟，下课可早走{{ checkboxItem1_2 }}分钟
          </div>
        </div>

        <el-checkbox v-model="checkboxItem2" @change="item2Change" style="display: block;margin: 10px 0;">迟到、早退几分钟不记异常</el-checkbox>
        <div style="margin-left: 30px;" v-show="checkboxItem2">
          <div style="margin: 10px 0;">上课最多可迟到：
            <el-input-number v-model="checkboxItem2_1" :min="0" :precision="0" :controls="false" style="width: 85px;vertical-align: middle;" class="number_input"></el-input-number>
            <span class="apendClass">分钟</span>
            迟到{{ checkboxItem2_1 }}分钟内不记异常
          </div>
          <div>下课最多可早退：
            <el-input-number v-model="checkboxItem2_2" :min="0" :precision="0" :controls="false" style="width: 85px;vertical-align: middle;" class="number_input"></el-input-number>
            <span class="apendClass">分钟</span>
            早走{{ checkboxItem2_2 }}分钟内不记异常
          </div>
        </div>
        <el-checkbox v-model="checkboxItem3" @change="item3Change">下课晚走，第二天可以晚到</el-checkbox>
        <div style="margin-left: 30px;padding-top: 10px;" v-show="checkboxItem3">
          <span style="margin-right: 10px;">第一天下课后晚走：
            <el-input-number v-model="checkboxItem3_1" :min="0" :precision="0" :controls="false" style="width: 85px;vertical-align: middle;" class="number_input"></el-input-number>
            <span class="apendClass">分钟</span>
          </span>
          <span>第二天上课可以晚到：
            <el-input-number v-model="checkboxItem3_2" :min="0" :precision="0" :controls="false" style="width: 85px;vertical-align: middle;" class="number_input"></el-input-number>
            <span class="apendClass">分钟</span>
          </span>
        </div>
      </el-form-item>

      <el-form-item style="width: 100%;" size="mini">
        <div>
          合计工作时长为{{ workTimeTotal }}小时,记为
          <el-input v-model="form['workTimeDay']" style="width: 70px;margin: 0 5px;"></el-input>
          天出勤
        </div>
      </el-form-item>
      <el-form-item style="text-align: center;width: 100%;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submit">保存</el-button>
        <el-button size="mini" icon="el-icon-close" @click="escForm">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import moment from 'moment';
import { classestimeAdd, classestimeUpdate } from '@/api/kq/classestime.js';

export default {
  data() {
    return {
      title: '添加班次',
      dialogVisible: false,
      form: {
        earlyIsSignIn_1:false,earlyIsSignIn_2:false,earlyIsSignIn_3:false,
        nightIsSignIn_1:false,nightIsSignIn_2:false,nightIsSignIn_3:false,
      },
      checkboxItem1: false,
      checkboxItem1_1: '',
      checkboxItem1_2: '',
      checkboxItem2: false,
      checkboxItem2_1: '',
      checkboxItem2_2: '',
      checkboxItem3: false,
      checkboxItem3_1: '',
      checkboxItem3_2: '',
      data: [
        { value: 1, timestepNum: '时段1', sxb: '上课' },
        { value: 1, timestepNum: '时段1', sxb: '下课' },
        { value: 2, timestepNum: '时段2', sxb: '上课' },
        { value: 2, timestepNum: '时段2', sxb: '下课' },
        { value: 3, timestepNum: '时段3', sxb: '上课' },
        { value: 3, timestepNum: '时段3', sxb: '下课' }
      ],
      rules: {
        classesTimeNum: [{ required: true, message: '请输入班次编号', trigger: 'blur' }],
        classesTimeName: [{ required: true, message: '请输入班次名称', trigger: 'blur' }]
      },
      btnType:'add',
      classesTimeNumDisa: false,
      step:15
    };
  },
  computed: {
    workTimeTotal() {
      let d = this.form;
      let workTimeTotal = '';
      if (d.endWorkTime_1) {
        workTimeTotal = new Date('2021/04/01 ' + d.endWorkTime_1+':00') * 1 - new Date('2021/04/01 ' + d.startWorkTime_1+':00') * 1;
      }
      if (d.endWorkTime_2) {
        workTimeTotal += new Date('2021/04/01 ' + d.endWorkTime_2+':00') * 1 - new Date('2021/04/01 ' + d.startWorkTime_2+':00') * 1;
      }
      if (d.endWorkTime_3) {
        workTimeTotal += new Date('2021/04/01 ' + d.endWorkTime_3+':00') * 1 - new Date('2021/04/01 ' + d.startWorkTime_3+':00') * 1;
      }
      return (workTimeTotal = (workTimeTotal / 1000 / 60 / 60).toFixed(2));
    }
  },
  methods: {
    stepChange(v){
      [1,2,3].forEach(i => {
        if(this.form['startWorkTime_'+i]){
          let times = new Date('2022/03/25 '+this.form['startWorkTime_'+i]+':00')*1;
          let diff = v*60*1000;
          this.$set(this.form,'startWorkStartTime_'+i,moment(times - diff).format('HH:mm'));
          this.$set(this.form,'startWorkEndTime_'+i,moment(times + diff).format('HH:mm'));
        }
        if(this.form['endWorkTime_'+i]){
          let times = new Date('2022/03/25 '+this.form['endWorkTime_'+i]+":00")*1;
          let diff = v*60*1000;
          this.$set(this.form,'endWorkStartTime_'+i,moment(times - diff).format('HH:mm'));
          this.$set(this.form,'endWorkEndTime_'+i,moment(times + diff).format('HH:mm'));
        }
      })
    },
    startWorkTimeChange(v,i){
      if(v){
        let times = new Date('2022/03/25 '+v+':00')*1;
        let diff = this.step*60*1000;
        this.$set(this.form,'startWorkStartTime_'+i,moment(times - diff).format('HH:mm'));
        this.$set(this.form,'startWorkEndTime_'+i,moment(times + diff).format('HH:mm'));
      }
    },
    endWorkTimeChange(v,i){
      if(v){
        let times = new Date('2022/03/25 '+v+':00')*1;
        let diff = this.step*60*1000;
        this.$set(this.form,'endWorkStartTime_'+i,moment(times - diff).format('HH:mm'));
        this.$set(this.form,'endWorkEndTime_'+i,moment(times + diff).format('HH:mm'));
      }
    },
    openDialog(type,details) {
      this.dialogVisible = true;
      this.btnType = type;
      this.title = type === 'edit' ? "编辑班次" : "添加班次";
      this.form = {};
      this.checkboxItem1 = false;
      this.checkboxItem2 = false;
      this.checkboxItem3 = false;
      this.checkboxItem1_1 = '';
      this.checkboxItem1_2 = '';
      this.checkboxItem2_1 = '';
      this.checkboxItem2_2 = '';
      this.checkboxItem3_1 = '';
      this.checkboxItem3_2 = '';
      if (type === 'edit') {
        this.step = 0;
        this.classesTimeNumDisa = true;
        let d = details;
        if (d.elasticityType == 1) {
          this.checkboxItem1 = true;
          this.checkboxItem1_2 = d.nightMinute;
          this.checkboxItem1_1 = d.earlyMinute;
        }
        if (d.elasticityType == 2) {
          this.checkboxItem2 = true;
          this.checkboxItem2_2 = d.nightMinute;
          this.checkboxItem2_1 = d.earlyMinute;
        }
        if (d.elasticityType == 3) {
          this.checkboxItem3 = true;
          this.checkboxItem3_2 = d.nightMinute;
          this.checkboxItem3_1 = d.earlyMinute;
        }
        if (d.timestepNum_1) {
          this.timestepNum_1 = d.timestepNum_1;
        }
        if (d.timestepNum_2) {
          this.timestepNum_2 = d.timestepNum_2;
        }
        if (d.timestepNum_3) {
          this.timestepNum_3 = d.timestepNum_3;
        }
        [1,2,3].forEach(v => {
          d['startWorkTime_'+v] = d['startWorkTime_'+v]?.substr(0,5) || '';
          d['endWorkTime_'+v] = d['endWorkTime_'+v]?.substr(0,5);
          d['startWorkStartTime_'+v] = d['startWorkStartTime_'+v]?.substr(0,5) || '';
          d['startWorkEndTime_'+v] = d['startWorkEndTime_'+v]?.substr(0,5) || '';
          d['endWorkStartTime_'+v] = d['endWorkStartTime_'+v]?.substr(0,5) || '';
          d['endWorkEndTime_'+v] = d['endWorkEndTime_'+v]?.substr(0,5) || '';
          d['earlyIsSignIn_'+v] = d['earlyIsSignIn_'+v] ? true : false;
          d['nightIsSignIn_'+v] = d['nightIsSignIn_'+v] ? true : false;
        })
        this.form = details;
      } else {
        this.form = {
          earlyIsSignIn_1:false,earlyIsSignIn_2:false,earlyIsSignIn_3:false,
          nightIsSignIn_1:false,nightIsSignIn_2:false,nightIsSignIn_3:false,
        }
        this.form['workTimeDay'] = 1;
        this.classesTimeNumDisa = false;
      }
    },
    submit() {
      this.$refs['formRef'].validate(valid => {
        let form = {...this.form};
        if (
          (form['startWorkTime_1'] && !form['endWorkTime_1']) ||
          (form['startWorkTime_2'] && !form['endWorkTime_2']) ||
          (form['startWorkTime_3'] && !form['endWorkTime_3'])
        ) {
          this.$message.error('请填写下课时间');
          return;
        }
        if (
          (form['endWorkTime_1'] && !form['startWorkTime_1']) ||
          (form['endWorkTime_2'] && !form['startWorkTime_2']) ||
          (form['endWorkTime_3'] && !form['startWorkTime_3'])
        ) {
          this.$message.error('请填写上课时间');
          return;
        }
        if (valid) {
          [1,2,3].forEach(i => {
            form['startWorkTime_'+i] = form['startWorkTime_'+i] ? form['startWorkTime_'+i]+':00' : '';
            form['endWorkTime_'+i] = form['endWorkTime_'+i] ? form['endWorkTime_'+i]+':00' : ''
            form['startWorkStartTime_'+i] = form['startWorkStartTime_'+i] ? form['startWorkStartTime_'+i]+':00' : ''
            form['startWorkEndTime_'+i] = form['startWorkEndTime_'+i] ? form['startWorkEndTime_'+i]+':59' : ''
            form['endWorkStartTime_'+i] = form['endWorkStartTime_'+i] ? form['endWorkStartTime_'+i]+':00' : ''
            form['endWorkEndTime_'+i] = form['endWorkEndTime_'+i] ? form['endWorkEndTime_'+i]+':59' : ''
          })
          if (this.checkboxItem1) {
            form['earlyMinute'] = this.checkboxItem1_1;
            form['nightMinute'] = this.checkboxItem1_2;
          } else if (this.checkboxItem2) {
            form['earlyMinute'] = this.checkboxItem2_1;
            form['nightMinute'] = this.checkboxItem2_2;
          } else if (this.checkboxItem3) {
            form['earlyMinute'] = this.checkboxItem3_1;
            form['nightMinute'] = this.checkboxItem3_2;
          } else {
            form['earlyMinute'] = '';
            form['nightMinute'] = '';
          }
          if (form['startWorkTime_1']) form['timestepNum_1'] = 1;
          if (form['startWorkTime_2']) form['timestepNum_2'] = 2;
          if (form['startWorkTime_3']) form['timestepNum_3'] = 3;
          if (this.btnType == 'edit') {
            classestimeUpdate(form).then(res => {
              if (res.data.code == 200) {
                this.$message({
                  type: 'success',
                  message: res.data.msg
                });
                this.form = {};
                this.$refs['formRef'].resetFields();
                this.$refs['formRef'].clearValidate();
                this.$emit('refreshPage');
                this.dialogVisible = false;
              } else {
                this.$message({
                  type: 'error',
                  message: res.data.msg
                });
              }
            });
          } else {
            classestimeAdd(form).then(res => {
              if (res.data.code == 200) {
                this.$message({
                  type: 'success',
                  message: res.data.msg
                });
                this.form = {};
                this.$refs['formRef'].resetFields();
                this.$refs['formRef'].clearValidate();
                this.$emit('refreshPage');
                this.dialogVisible = false;
              } else {
                this.$message({
                  type: 'error',
                  message: res.data.msg
                });
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    item1Change(v) {
      if (v) {
        this.form['elasticityType'] = 1;
        this.checkboxItem2 = false;
        this.checkboxItem3 = false;
      } else {
        this.form['elasticityType'] = '';
      }
    },
    item2Change(v) {
      if (v) {
        this.form['elasticityType'] = 2;
        this.checkboxItem1 = false;
        this.checkboxItem3 = false;
      } else {
        this.form['elasticityType'] = '';
      }
    },
    item3Change(v) {
      if (v) {
        this.form['elasticityType'] = 3;
        this.checkboxItem1 = false;
        this.checkboxItem2 = false;
      } else {
        this.form['elasticityType'] = '';
      }
    },
    escForm() {
      this.$refs['formRef'].resetFields();
      this.$refs['formRef'].clearValidate();
      this.dialogVisible = false;
    },
    spanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0) {
        if (rowIndex % 2 == 0) {
          return { rowspan: 2, colspan: 1 };
        } else {
          return { rowspan: 0, colspan: 0 };
        }
      }
    }
  }
};
</script>

<style scoped>
>>> .el-form-item__content {
  line-height: 0;
  vertical-align: middle;
}
>>> .el-dialog__body {
  padding: 20px;
}
>>> .el-checkbox__input {
  margin-top: 3px;
  vertical-align: text-bottom;
}
>>> .el-input__inner {
  height: 28px;
}
>>>.el-input-number .el-input__inner{text-align: left;}
.number_input >>>.el-input__inner{
  border-radius: 4px 0 0 4px !important;
  vertical-align: baseline;
}
</style>
