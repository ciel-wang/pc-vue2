<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      width="700px"
      top="5vh"
      :before-close="handleClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form ref="formRef" :option="option" v-model="form" @submit="submit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="submit" icon="el-icon-check" type="primary" :disabled="submitDisabled">保存</el-button>
          <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
        </template>

        <template slot="Datemonth" slot-scope="scope">
          <el-date-picker
            v-model="form.Datemonth"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            value-format="yyyy-MM"
            format="yyyy-MM"
            @change="datepickerChange"
          ></el-date-picker>
        </template>
      </avue-form>
      <div style="position: relative;">
        <el-calendar v-model="calendarValue" v-if="show">
          <template slot="dateCell" slot-scope="{ date, data }">
            <div style="text-align: center;height: 50px;" @click="editDayoff(data.day)">
              <p style="margin: 7px 0;">{{ data.day.substr(8, 2) }}</p>
              <p style="margin: 0;color: green;">
                <span v-if="exit(data.day) && exit(data.day).holidayDateName">{{ exit(data.day).holidayDateName }} -</span>
                <span v-if="exit(data.day)" style="color: red;">休</span>
              </p>
            </div>
          </template>
        </el-calendar>
        <el-button style="position: absolute;top: 12px;right: 142px;z-index: 100;" size="mini" :disabled="prevDisabled" @click="prevMonthClick">上个月</el-button>
        <el-button style="position: absolute;top: 12px;right: 87px;z-index: 100;" size="mini" @click="currentDayClick">今天</el-button>
        <el-button style="position: absolute;top: 12px;right: 20px;z-index: 100;" size="mini" :disabled="nextDisabled" @click="nextMonthClick">下个月</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="变更假日属性"
      :visible.sync="updateAttributeVisible"
      width="500px"
      top="35vh"
      :before-close="escClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <p style="margin: 0 0 19px 30px;color: red;">确定将当前日期变更为假日?</p>
      <avue-form ref="formRef2" :option="option2" v-model="form2" @submit="submit2">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="escClose" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </div>
</template>

<script>
import { holidayStatutory, holidayAdd, holidayUpdate, holidaySingleUpdate, holidayDetails } from '@/api/kq/holiday.js';
import { schedulSelectData, schedulGenerateEdit } from '@/api/kq/scheduling.js';
import moment from 'moment';

export default {
  props: ['kqHolidayDic'],
  data() {
    return {
      title: '添加假日方案',
      dialogVisible: false,
      dayoffData: [
        { value: '1', label: '周一' },
        { value: '2', label: '周二' },
        { value: '3', label: '周三' },
        { value: '4', label: '周四' },
        { value: '5', label: '周五' },
        { value: '6', label: '周六' },
        { value: '7', label: '周日' }
      ],
      form: { isDefault: false, isStatutory: false },
      calendarValue: moment().format('YYYY-MM'),
      holidayDate: [],
      holidayStatutory: [], //当前所有的休息日
      show: true,
      btnType: 'add',
      prevDisabled: false,
      nextDisabled: false,
      submitDisabled: false,
      updateAttributeVisible: false,
      form2: {}
    };
  },
  mounted() {
    holidayStatutory().then(res => {
      this.holidayDate = [];
      if (res.data.code == 200) {
        let d = res.data.data;
        if (d.holidayStatutory.length) {
          d.holidayStatutory.forEach(v => {
            this.holidayDate.push(v);
          });
        }
      }
    });
  },
  watch: {
    'form.endDate': {
      handler(v) {
        if (this.btnType === 'edit' && v) {
          let start = this.caleMouth(this.form['startDate']);
          let end = this.caleMouth(this.form['endDate']);
          let current = this.caleMouth(this.calendarValue);
          let total = end - start;
          if (total <= 0) {
            this.prevDisabled = true;
            this.nextDisabled = true;
          } else {
            if (current <= start) {
              this.prevDisabled = true;
              this.nextDisabled = false;
            } else if (current >= end) {
              this.prevDisabled = false;
              this.nextDisabled = true;
            } else {
              this.prevDisabled = false;
              this.nextDisabled = false;
            }
          }
        }
      }
    }
  },
  methods: {
    caleMouth(date) {
      let arr1 = date ? date.split('-') : [];
      return arr1.length ? parseInt(arr1[0]) * 12 + parseInt(arr1[1]) : 0;
    },
    openDialog(details) {
      this.dialogVisible = true;
      this.holidayStatutory = [];
      this.submitDisabled = false;
      if (details) {
        this.title = '编辑假日方案';
        this.btnType = 'edit';
        this.calendarValue = details.startDate;
        this.details(details);
      } else {
        this.title = '添加假日方案';
        this.btnType = 'add';
        this.holidayStatutory = [];
      }
    },
    details(details) {
      if (details.holidays && details.holidays.length) {
        details.holidays.forEach(v => {
          v.holidayDateName = v.holidayType === 3 ? v.holidayDateName : '';
        });
      }
      this.holidayStatutory = details.holidays;
      this.form = details;
      this.form['Datemonth'] = [details.startDate, details.endDate];
      this.form['weeks'] = details.weeks.split(',');
    },
    prevMonthClick() {
      if (this.btnType === 'edit') {
        this.calendarValue = moment(this.calendarValue).add(-1, 'month').format('YYYY-MM');
        let params = {};
        params['holidayNum'] = this.form['holidayNum'];
        params['holidayDateStr'] = this.calendarValue;
        params['id'] = this.form.id;
        this.nextDisabled = false;
        if (this.caleMouth(this.calendarValue) <= this.caleMouth(this.form['startDate'])) {
          this.prevDisabled = true;
        }
        holidayDetails(params).then(res => {
          if (res.data.code == 200) {
            let details = res.data.data;
            this.details(details);
          }
        });
      } else {
        this.calendarValue = moment(this.calendarValue).add(-1, 'month').format('YYYY-MM');
        this.prevDisabled = false;
        this.nextDisabled = false;
      }
      this.use();
    },
    currentDayClick(){
      this.calendarValue = moment().format('YYYY-MM');
      if (this.btnType === 'edit') {
        let params = {};
        params['holidayNum'] = this.form['holidayNum'];
        params['holidayDateStr'] = this.calendarValue;
        params['id'] = this.form.id;
        this.prevDisabled = false;
        this.nextDisabled = false;
        if (this.caleMouth(this.calendarValue) >= this.caleMouth(this.form['endDate'])) {
          this.nextDisabled = true;
        }
        if (this.caleMouth(this.calendarValue) <= this.caleMouth(this.form['startDate'])) {
          this.prevDisabled = true;
        }
        holidayDetails(params).then(res => {
          if (res.data.code == 200) {
            let details = res.data.data;
            this.details(details);
          }
        });
      } else {
        this.prevDisabled = false;
        this.nextDisabled = false;
      }
      this.use();
    },
    nextMonthClick() {
      if (this.btnType === 'edit') {
        this.calendarValue = moment(this.calendarValue).add(1, 'month').format('YYYY-MM');
        let params = {};
        params['holidayNum'] = this.form['holidayNum'];
        params['holidayDateStr'] = this.calendarValue;
        params['id'] = this.form.id;
        this.prevDisabled = false;
        if (this.caleMouth(this.calendarValue) >= this.caleMouth(this.form['endDate'])) {
          this.nextDisabled = true;
        }
        holidayDetails(params).then(res => {
          if (res.data.code == 200) {
            let details = res.data.data;
            this.details(details);
          }
        });
      } else {
        this.calendarValue = moment(this.calendarValue).add(1, 'month').format('YYYY-MM');
        this.prevDisabled = false;
        this.nextDisabled = false;
      }
      this.use();
    },
    use() {
      this.show = false;
      setTimeout(() => {
        this.show = true;
      }, 1);
    },
    editDayoff(v) {
      if (this.btnType === 'add') return;
      if (!this.exit(v)) {
        this.form2.holidayType = 2;
        this.form2.id = this.form.id;
        this.form2.holidayDate = v;
        this.updateAttributeVisible = true;
      } else {
        this.$confirm('确定将当前日期变更为工作日?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let params = {};
          params['id'] = this.form['id'];
          params['holidayDate'] = v;
          params['holidayType'] = 1;
          holidaySingleUpdate(params).then(res => {
            if (res.data.code == 200) {
              this.$message.success(res.data.msg);
              let arr = [...this.holidayStatutory];
              let index = arr.findIndex(i => i.holidayDate === v);
              arr.splice(index, 1);
              this.holidayStatutory = [...arr];
              this.use();
            } else {
              this.$message.error(res.data.msg);
            }
          });
        });
      }
    },
    submit2(form, done) {
      holidaySingleUpdate(form).then(res => {
        done();
        if (res.data.code == 200) {
          this.$message.success(res.data.msg);
          this.holidayStatutory.push({
            holidayDate: form.holidayDate,
            holidayDateName: form.holidayType == 3 ? form.holidayDateName : ''
          });
          this.escClose();
          this.use();
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch(() => done());
    },
    escClose() {
      this.form2 = {};
      this.$refs['formRef2'].clearValidate();
      this.$refs['formRef2'].resetForm();
      this.updateAttributeVisible = false;
    },
    // 应用范围变更时
    datepickerChange(v) {
      this.form['startDate'] = v[0];
      this.form['endDate'] = v[1];
    },
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          this.holidayStatutory = [];
          let star = this.form['startDate'].substr(5, 2) * 1;
          let end = this.caleMouth(this.form['endDate']) - this.caleMouth(this.form['startDate']) + star;
          let day = this.form['weeks'];
          if (day.length) {
            day.forEach(v => {
              if (v == 7) v = 0;
              for (let j = star; j <= end; j++) {
                for (let i = 0; i < 5; i++) {
                  this.holidayStatutory.push({
                    holidayDate: moment().month(j - 1).endOf('month').day(v - 7 * i).format('YYYY-MM-DD'),
                    holidayDateName: ''
                  });
                }
              }
            });
          }
          if (this.form['isStatutory']) {
            this.holidayDate.forEach(v => {
              this.holidayStatutory.push(v);
            });
          }
          this.use();
          if (this.title == '编辑假日方案') {
            holidayUpdate(this.form).then(res => {
              if (res.data.code == 200) {
                this.$message.success(res.data.msg);
                this.$emit('refreshPage');
                this.handleClose();
              } else {
                this.$message.error(res.data.msg);
              }
            });
          } else {
            holidayAdd(this.form).then(res => {
              if (res.data.code == 200) {
                this.$message.success(res.data.msg);
                this.$emit('refreshPage');
                this.submitDisabled = true;
              } else {
                this.$message.error(res.data.msg);
                this.submitDisabled = false;
              }
            });
          }
          done();
        }
      });
    },
    exit(v) {
      return this.holidayStatutory.find(i => v === i.holidayDate);
    },
    handleClose() {
      this.form = {};
      this.holidayStatutory = [];
      this.$refs['formRef'].clearValidate();
      this.$refs['formRef'].resetForm();
      this.form.isDefault = false;
      this.form.isStatutory = false;
      this.dialogVisible = false;
    }
  },
  computed: {
    option2() {
      return {
        emptyBtn: false,
        submitText: '保存',
        size: 'mini',
        column: [
          {
            label: '假日属性',
            prop: 'holidayType',
            type: 'radio',
            dicData: [{ value: 2, label: '周休日' }, { value: 3, label: '节假日' }],
            span: 24,
            change: ({ value }) => {
              let that = this;
              if (value === 2) {
                that.form2.holidayDateName = '周休';
              } else {
                that.form2.holidayDateName = that.kqHolidayDic[0].value;
              }
            }
          },
          {
            label: '假日名称',
            prop: 'holidayDateName',
            type: 'select',
            dicData: this.form2.holidayType === 2 ? [{ value: '周休', label: '周休日' }] : this.kqHolidayDic,
            span: 24
          }
        ]
      };
    },
    option() {
      return {
        emptyBtn: false,
        submitBtn: false,
        size: 'mini',
        column: [
          {
            label: '方案编号',
            prop: 'holidayNum',
            rules: [{
              required: true,
              message: '请输入方案编号',
              trigger: 'blur'
            }],
            maxlength:20
          },
          {
            label: '设为默认',
            prop: 'isDefault',
            type: 'switch',
            row: true
          },
          {
            label: '方案名称',
            prop: 'holidayName',
            rules: [{
              required: true,
              message: '请输入方案名称',
              trigger: 'blur'
            }],
            maxlength:20
          },
          {
            label: '遇法定节假日自动排休',
            prop: 'isStatutory',
            type: 'switch',
            labelWidth: 160
          },
          {
            label: '应用范围',
            prop: 'Datemonth',
            formslot: true
          },
          {
            label: '请勾选每周休息日',
            prop: 'weeks',
            type: 'checkbox',
            dicData: this.dayoffData,
            span: 24,
            labelWidth: 140
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
>>> .el-calendar-table .el-calendar-day {
  height: 50px;
  padding: 0;
}
</style>
