<template>
  <basic-container>
    <div class="mbottom8">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.park_chargerule_add_btn">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.park_chargerule_edit_btn">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permission.park_chargerule_del_btn">删除</el-button>
      <el-button type="primary" size="small" @click="handleTest"  v-if="permission.park_chargerule_test_btn">收费测试</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.park_chargerule_export_btn">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      :height="tableHeight"
      keep-source
      ref="xGrid"
      size="mini"
      align="center"
      :highlight="true"
      :columns="tableColumn"
      :loading="loading"
      :data="tableData">
      <template #desc="{row}">
        <div v-show="row.desc == 2">计费类型：按自定义计费</div>
        <div v-show="row.desc == 1 && row.cyclicFeeType == 1">
          <p>计费类型：按时计费</p>
          <p>收费限额：{{ row.nature.singleMaxFee }}元</p>
          <p>免费时间：{{ row.nature.freeFeeMinute }}分钟</p>
          <p>停车时间：每{{ row.nature.greaterEachMinute }}分钟，收费{{ row.nature.greaterEachFee }}元</p>
        </div>
        <div v-show="row.desc == 1 && row.cyclicFeeType == 2">
          <p>计费类型：按时计费</p>
          <div>
            白天：
            <p class="ml20">收费限额：{{ row.daytime.singleMaxFee }}元</p>
            <p class="ml20">免费时间：{{ row.daytime.freeFeeMinute }}分钟</p>
            <p class="ml20">
              停车时间：{{ transNumToTime(row.daytime.startTime * 1000) }} - {{ transNumToTime(row.daytime.endTime * 1000) }}，每{{ row.daytime.greaterEachMinute }}分钟，收费{{
                row.daytime.greaterEachFee
              }}元
            </p>
          </div>
          <div>
            黑夜：
            <p class="ml20">收费限额：{{ row.night.singleMaxFee }}元</p>
            <p class="ml20">免费时间：{{ row.night.freeFeeMinute }}分钟</p>
            <p class="ml20">
              停车时间：{{ transNumToTime(row.night.startTime * 1000) }} - {{ transNumToTime(row.night.endTime * 1000) }}，每{{ row.night.greaterEachMinute }}分钟，收费{{
                row.night.greaterEachFee
              }}元
            </p>
          </div>
        </div>
      </template>
    </vxe-grid>

    <el-dialog
      title="收费标准"
      :visible.sync="dialogVisible"
      width="800px"
      top="10vh"
      append-to-body
      v-if="dialogVisible"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form ref="formRef" :defaults.sync="defaults" :option="addEditOption" v-model="form" @submit="submit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="dialogVisible = false" icon="el-icon-close">取消</el-button>
        </template>

        <template slot="tabs">
          <div style="text-align: center;display: flex;">
            <p v-show="activeName == 1" style="width: 100%;" @click="activeName = 1" :class="activeName == 1 ? 'active' : 'tabsDefalut'">自然天</p>
            <p v-show="activeName && activeName != 1" style="width: 50%;" @click="activeName = 2" :class="activeName == 2 ? 'active' : 'tabsDefalut'">白天</p>
            <p v-show="activeName && activeName != 1" style="width: 50%;" @click="activeName = 3" :class="activeName == 3 ? 'active' : 'tabsDefalut'">黑夜</p>
          </div>
        </template>

        <template slot="procKey">
          <div style="width: 230px;"><el-input v-model="form.procKey" size="small" placeholder="请输入 KEY"></el-input></div>
        </template>
      </avue-form>
    </el-dialog>

    <el-dialog
      title="收费测试"
      :visible.sync="testDialogVisible"
      width="400px"
      :before-close="testClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form ref="testformRef" :option="testOption" v-model="testForm" @submit="handleCalc">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="testClose" icon="el-icon-close">关闭</el-button>
        </template>
      </avue-form>

      <div v-show="stopTotalTime || totalMoney">停车时长：{{ stopTotalTime }} 分钟, 停车总费用：{{ totalMoney }} 元</div>
    </el-dialog>
  </basic-container>
</template>

<script>
import moment from 'moment';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import { deepClone } from '@/util/util.js';
import { getDictCode } from '@/api/iot/teacher.js'
import { getSelectlist } from '@/api/parking/vehicle.js';
import { getAreaSelectDic } from '@/api/parking/area.js';
import { addRules, getRulesDetails, getRulesList, updateRules, removeRules, rulesCalc } from '@/api/parking/charge-rules.js';

export default {
  data() {
    return {
      tableData: [],
      loading: false,
      dialogVisible: false,
      form: {
        cyclicFeeType: 1,
        billingType: 1,
        daytime: { freeFeeMinute: 0, greaterEachFee: 0, greaterEachMinute: 0, singleMaxFee: 0 },
        night: { freeFeeMinute: 0, greaterEachFee: 0, greaterEachMinute: 0, singleMaxFee: 0 }
      },
      btnType: '',
      chargeModeDic: [{ value: 1, label: '自然天' }, { value: 2, label: '白天黑夜' }],
      carTypeDic: [],
      activeName: 1,
      carVehicleDic: [],
      areaDic: [],
      testDialogVisible: false,
      testForm: {},
      defaults: {},
      display: true,
      stopTotalTime: '',
      totalMoney: '',
      userDefined: false
    };
  },
  activated() {
    getDictCode({ keys: 'carBasicType' }).then(r => {
      let arr = r.data.data.carBasicType.map(v => ({ value: v.key * 1, label: v.value }));
      this.carTypeDic = arr;
    });
    getSelectlist().then(r => {
      let arr = r.data.data.map(v => ({ value: v.key * 1, label: v.value }));
      this.carVehicleDic = arr;
    });
    getAreaSelectDic().then(r => {
      let arr = r.data.data.map(v => ({ value: v.key, label: v.value }));
      this.areaDic = arr;
    });
    this.onLoad();
  },
  watch: {
    'form.billingType': {
      handler(val) {
        if (val == 1) {
          this.display = true;
        } else {
          this.display = false;
        }
      },
      deep: true
    }
  },
  methods: {
    handleCalc() {
      this.$refs.testformRef.validate((vaild, done) => {
        if (vaild) {
          let form = { ...this.testForm, id: this.ids[0] };
          rulesCalc(form).then(r => {
            done();
            if (r.data.code === 200) {
              this.$message.success(r.data.msg);
              this.stopTotalTime = r.data.data.totalMinutes;
              this.totalMoney = r.data.data.money;
            } else {
              this.$message.error(r.data.msg);
            }
          }).catch(() => done());
        }
      });
    },
    handleTest() {
      if (this.ids.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      this.testDialogVisible = true;
    },
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          let {
            ruleName,
            cyclicFeeType,
            carBasicCategory,
            carShapeId,
            parkingAreaId,
            isNextDay3,
            startTime,
            endTime,
            startTime3,
            endTime3,
            billingType,
            procKey,
            procRemark
          } = this.form;
          let form = { ruleName, cyclicFeeType, carBasicCategory, carShapeId, parkingAreaId, procKey, procRemark };

          isNextDay3 = isNextDay3.length ? true : false;
          startTime = startTime ? (new Date('2021/12/01 ' + startTime).getTime() - new Date('2021/12/01 00:00:00') * 1) / 1000 : '';
          endTime = endTime ? (new Date('2021/12/01 ' + endTime).getTime() - new Date('2021/12/01 00:00:00') * 1) / 1000 : '';

          startTime3 = startTime3 ? (new Date('2021/12/01 ' + startTime3).getTime() - new Date('2021/12/01 00:00:00') * 1) / 1000 : '';
          endTime3 = endTime3 ? (new Date('2021/12/01 ' + endTime3).getTime() - new Date('2021/12/01 00:00:00') * 1) / 1000 : '';
          let daytime = { ...this.form.daytime, startTime, endTime, billingType };
          let night = { ...this.form.night, isNextDay: isNextDay3, startTime: startTime3, endTime: endTime3, billingType };

          if (cyclicFeeType == 1) {
            form['nature'] = { ...daytime, ruleType: 1 };
          } else {
            form['daytime'] = { ...daytime, ruleType: 2 };
            form['night'] = { ...night, ruleType: 3 };
          }
          if (this.btnType === 'add') {
            addRules(form).then(r => {
              done();
              if (r.data.code === 200) {
                this.$message.success(r.data.msg);
                this.handleClose();
                this.onLoad();
              } else {
                this.$message.error(r.daa.msg);
              }
            }).catch(() => done());
          } else {
            form['id'] = this.form.id;
            updateRules(form).then(r => {
              done();
              if (r.data.code === 200) {
                this.$message.success(r.data.msg);
                this.handleClose();
                this.onLoad();
              } else {
                this.$message.error(r.daa.msg);
              }
            }).catch(() => done());
          }
        }
      });
    },
    handleAdd() {
      this.dialogVisible = true;
      this.btnType = 'add';
      (this.form = {
        cyclicFeeType: 1,
        billingType: 1,
        isNextDay3: [true],
        daytime: { freeFeeMinute: 0, greaterEachFee: 0, greaterEachMinute: 0, singleMaxFee: 0 },
        night: { freeFeeMinute: 0, greaterEachFee: 0, greaterEachMinute: 0, singleMaxFee: 0 }
      }),
      this.$nextTick(() => {
        this.$refs.formRef.clearValidate();
      });
    },
    transNumToTime(time) {
      return moment(new Date('2021/12/01 00:00:00') * 1 + time).format('HH:mm:ss') || '';
    },
    handleEdit() {
      if (this.ids.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      this.btnType = 'edit';
      this.form = {
        cyclicFeeType: 1,
        billingType: 1,
        daytime: { freeFeeMinute: 0, greaterEachFee: 0, greaterEachMinute: 0, singleMaxFee: 0 },
        night: { freeFeeMinute: 0, greaterEachFee: 0, greaterEachMinute: 0, singleMaxFee: 0 }
      };
      getRulesDetails({ id: this.ids[0] }).then(r => {
        if (r.data.code === 200) {
          let d = r.data.data;
          let { ruleName, parkingAreaId, carBasicCategory, carShapeId, cyclicFeeType, id, procKey, procRemark } = d;
          if (cyclicFeeType == 1) {
            let form = {};
            form = {
              ruleName,
              parkingAreaId,
              carBasicCategory,
              carShapeId,
              cyclicFeeType,
              id,
              daytime: { ...d.nature },
              night: {},
              billingType: d.nature.billingType,
              procKey,
              procRemark
            };
            this.form = { ...this.form, ...form };
            this.$forceUpdate();
          } else {
            let form1 = {};
            let isNextDay3 = d.night.isNextDay ? [true] : [false];
            let startTime = this.transNumToTime(d.daytime.startTime * 1000),
              endTime = this.transNumToTime(d.daytime.endTime * 1000),
              startTime3 = this.transNumToTime(d.night.startTime * 1000),
              endTime3 = this.transNumToTime(d.night.endTime * 1000);
            let billingType = d.daytime.billingType || d.night.billingType;

            form1 = {
              ruleName,
              parkingAreaId,
              carBasicCategory,
              carShapeId,
              cyclicFeeType,
              id,
              daytime: { ...d.daytime },
              night: { ...d.night },
              isNextDay3,
              startTime,
              endTime,
              startTime3,
              endTime3,
              billingType: billingType,
              procKey,
              procRemark
            };
            this.form = deepClone(form1);
            this.$forceUpdate();
          }
          this.dialogVisible = true;
        }
      });
    },
    handleDelete() {
      if (this.ids.length == 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm('确定要删除选择的数据？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeRules({ ids: this.ids });
      }).then(res => {
        if (res.data.code == 200) {
          this.$message.success(res.data.msg);
          this.onLoad();
        }
      });
    },
    handleExport() {
      this.$confirm('是否导出收费规则?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(`/api/iot-car/fee/rule/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids.join(',')}`);
      });
    },
    handleClose() {
      // this.$refs.formRef.resetForm();
      // this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
    },
    testClose() {
      this.$refs.testformRef.resetForm();
      this.$refs.testformRef.clearValidate();
      this.totalMoney = '';
      this.stopTotalTime = '';
      this.testDialogVisible = false;
    },
    onLoad() {
      let params = {};
      params['size'] = 1000;
      params['current'] = 1;
      this.loading = true;
      getRulesList(params).then(r => {
        this.loading = false;
        if (r.data.code === 200) {
          let d = r.data.data;
          d.records.forEach(item => {
            if (item.cyclicFeeType == 1) {
              item.desc = item.nature.billingType;
            } else {
              item.desc = item.daytime.billingType;
            }
          });
          this.tableData = d.records;
        }
      });
    }
  },
  computed: {
    ...mapGetters(['permission']),
    ids() {
      let list = this.$refs.xGrid.getCheckboxRecords();
      return list.map(v => v.id);
    },
    tableHeight() {
      return window.innerHeight - 187;
    },
    testOption() {
      return {
        emptyBtn: false,
        submitText: '计算',
        column: [
          {
            label: '开始时间',
            prop: 'startTime',
            rules: [
              {
                required: true,
                message: '请选择开始时间',
                trigger: 'change'
              }
            ],
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            span: 24
          },
          {
            label: '结束时间',
            prop: 'endTime',
            rules: [
              {
                required: true,
                message: '请选择结束时间',
                trigger: 'change'
              }
            ],
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            span: 24
          }
        ]
      };
    },
    addEditOption() {
      return {
        emptyBtn: false,
        submitText: '保存',
        labelWidth: 110,
        column: [
          {
            label: '收费标准名称',
            prop: 'ruleName',
            rules: [
              {
                required: true,
                message: '请输入收费标准名称',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label: '车型类型',
            prop: 'carShapeId',
            type: 'select',
            dicData: this.carVehicleDic,
            rules: [
              {
                required: true,
                message: '请选择车型类型',
                trigger: 'change'
              }
            ]
          },
          {
            label: '循环计费方式',
            prop: 'cyclicFeeType',
            type: 'select',
            dicData: this.chargeModeDic,
            change: ({ value }) => {
              let that = this;
              if (value == 1) {
                that.activeName = 1;
              } else if (value == 2) {
                that.activeName = 2;
              }
            },
            rules: [
              {
                required: true,
                message: '请选择循环计费方式',
                trigger: 'change'
              }
            ]
          },
          {
            label: '车类类型',
            prop: 'carBasicCategory',
            type: 'select',
            dicData: [{ value: 4, label: '临时车' }],
            rules: [
              {
                required: true,
                message: '请选择车类类型',
                trigger: 'change'
              }
            ]
          },
          {
            label: '应用区域',
            prop: 'parkingAreaId',
            type: 'select',
            dicData: this.areaDic,
            rules: [
              {
                required: true,
                message: '请选择应用区域',
                trigger: 'change'
              }
            ]
          },
          {
            label: '计费类型',
            prop: 'billingType',
            type: 'select',
            dicData: [{ value: 1, label: '按时计费' }, { value: 2, label: '自定义' }],
            rules: [
              {
                required: true,
                message: '请选择计费类型',
                trigger: 'change'
              }
            ],
            change: ({ value }) => {
              let that = this;
              if (value == 2) {
                that.userDefined = true;
              } else {
                that.userDefined = false;
              }
            }
          },
          {
            label: '',
            prop: 'tabs',
            formslot: true,
            span: 24,
            labelWidth: 0
          },
          // 自然天部分和白天部分
          {
            label: '开始时间',
            prop: 'startTime',
            type: 'time',
            span: 12,
            format: 'HH:mm:ss',
            valueFormat: 'HH:mm:ss',
            value: '08:00:00',
            display: this.activeName == 2 ? true : false,
            rules: [
              {
                required: true,
                message: '请选择开始时间',
                trigger: 'change'
              }
            ],
            labelWidth:160,
            change:({value}) => {
              let that = this;
              let time = new Date('2022/05/05 '+value).getTime()-1000;
              that.form.endTime3 = moment(time).format('HH:mm:ss')
            }
          },
          {
            label: '结束时间',
            prop: 'endTime',
            type: 'time',
            span: 12,
            format: 'HH:mm:ss',
            valueFormat: 'HH:mm:ss',
            value: '18:00:00',
            display: this.activeName == 2 ? true : false,
            rules: [
              {
                required: true,
                message: '请选择结束时间',
                trigger: 'change'
              }
            ],
            labelWidth:120,
            change:({value}) => {
              let that = this;
              let time = new Date('2022/05/05 '+value).getTime()+1000;
              that.form.startTime3 = moment(time).format('HH:mm:ss')
            }
          },
          {
            label: '单次进出最高收费(元)',
            prop: 'singleMaxFee',
            type: 'number',
            minRows: 0,
            precision: 2,
            labelWidth: 160,
            value: 0,
            rules: [
              {
                required: true,
                message: '请输入单次进出最高收费',
                trigger: 'blur'
              }
            ],
            bind: 'daytime.singleMaxFee',
            display: this.activeName != 3 && this.display ? true : false
          },
          {
            label: '免费时间(分钟)',
            prop: 'freeFeeMinute',
            type: 'number',
            labelWidth:120,
            minRows: 0,
            maxRows:99999,
            precision: 0,
            rules: [
              {
                required: true,
                message: '请输入免费时间',
                trigger: 'blur'
              }
            ],
            value: 0,
            bind: 'daytime.freeFeeMinute',
            display: this.activeName != 3 && this.display ? true : false
          },
          {
            label: '每多少分钟',
            prop: 'greaterEachMinute',
            type: 'number',
            minRows: 0,
            precision: 2,
            value: 0,
            span: 12,
            rules: [
              {
                required: true,
                message: '请输入收费',
                trigger: 'blur'
              }
            ],
            labelWidth:160,
            bind: 'daytime.greaterEachMinute',
            display: this.activeName != 3 && this.display ? true : false
          },
          {
            label: '收费(元)',
            prop: 'greaterEachFee',
            type: 'number',
            minRows: 0,
            precision: 2,
            value: 0,
            span: 12,
            rules: [
              {
                required: true,
                message: '请输入收费',
                trigger: 'blur'
              }
            ],
            labelWidth:120,
            bind: 'daytime.greaterEachFee',
            display: this.activeName != 3 && this.display ? true : false
          },
          // 黑夜部分
          {
            label: '开始时间',
            prop: 'startTime3',
            type: 'time',
            span: 12,
            format: 'HH:mm:ss',
            valueFormat: 'HH:mm:ss',
            display: this.activeName == 3 ? true : false,
            rules: [
              {
                required: true,
                message: '请选择开始时间',
                trigger: 'change'
              }
            ],
            disabled:true,
            labelWidth: 130,
          },
          {
            label: '结束时间',
            prop: 'endTime3',
            type: 'time',
            span: 9,
            format: 'HH:mm:ss',
            valueFormat: 'HH:mm:ss',
            display: this.activeName == 3 ? true : false,
            rules: [
              {
                required: true,
                message: '请选择结束时间',
                trigger: 'change'
              }
            ],
            disabled:true,
          },
          {
            label: '',
            labelWidth: 0,
            prop: 'isNextDay3',
            type: 'checkbox',
            dicData: [{ value: true, label: '跨天' }],
            display: this.activeName == 3 ? true : false,
            span: 3,
            disabled: this.btnType == 'edit' ? true : false
          },
          {
            label: '最高收费(元)',
            prop: 'singleMaxFee3',
            type: 'number',
            minRows: 0,
            precision: 2,
            labelWidth: 130,
            rules: [
              {
                required: true,
                message: '请输入最高收费',
                trigger: 'blur'
              }
            ],
            value: 0,
            bind: 'night.singleMaxFee',
            display: this.activeName == 3 && this.display ? true : false
          },
          {
            label: '每多少分钟',
            prop: 'greaterEachMinute3',
            type: 'number',
            minRows: 0,
            precision: 2,
            value: 0,
            span: 12,
            rules: [
              {
                required: true,
                message: '请输入收费',
                trigger: 'blur'
              }
            ],
            bind: 'night.greaterEachMinute',
            display: this.activeName == 3 && this.display ? true : false
          },
          {
            label: '收费(元)',
            prop: 'greaterEachFee3',
            type: 'number',
            minRows: 0,
            precision: 2,
            span: 12,
            value: 0,
            rules: [
              {
                required: true,
                message: '请输入收费',
                trigger: 'blur'
              }
            ],
            bind: 'night.greaterEachFee',
            labelWidth: 130,
            display: this.activeName == 3 && this.display ? true : false
          },
          // 自定义部分
          {
            label: 'KEY',
            prop: 'procKey',
            rules: [
              {
                required: true,
                message: '请输入自定义标识KEY',
                trigger: 'blur'
              }
            ],
            display: this.userDefined,
            span: 24,
            formslot: true,
            labelWidth: 130,
          },
          {
            label: '描述',
            prop: 'procRemark',
            type: 'textarea',
            rules: [
              {
                required: true,
                message: '请输入描述',
                trigger: 'blur'
              }
            ],
            labelWidth: 130,
            display: this.userDefined
          }
        ]
      };
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '规则名称',
          field: 'ruleName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '所属区域',
          field: 'parkingAreaId',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            let item = this.areaDic.find(item => item.value === cellValue);
            return item ? item.label : '';
          }
        },
        {
          title: '计费方式',
          field: 'cyclicFeeType',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            let item = this.chargeModeDic.find(item => item.value === cellValue);
            return item ? item.label : '';
          }
        },
        {
          title: '车型类型',
          field: 'carShapeId',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            let item = this.carVehicleDic.find(item => item.value === cellValue);
            return item ? item.label : '';
          }
        },
        {
          title: '车辆类型',
          field: 'carBasicCategory',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            let item = this.carTypeDic.find(item => item.value === cellValue);
            return item ? item.label : '';
          }
        },
        {
          title: '描述',
          field: 'desc',
          sortable: true,
          minWidth: 200,
          slots: { default: 'desc' },
          align: 'left',
          headerAlign: 'center'
        }
      ];
    }
  }
};
</script>

<style scoped lang="scss">
.active {
  background-color: #409eff;
  color: #fff;
  margin: 0;
  padding: 8px 0;
}
.tabsDefalut {
  margin: 0;
  padding: 8px 0;
  background-color: #ddd;
  color: #fff;
}
p {
  margin: 0;
}
.ml20 {
  margin-left: 20px;
}
</style>
