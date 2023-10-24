<template>
  <el-dialog
    title="车辆信息设置"
    :visible.sync="dialogVisible"
    width="40%"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-tabs v-model="activeName">
      <el-tab-pane label="车牌信息" name="first"></el-tab-pane>

      <el-tab-pane label="运输车附加信息" name="second"></el-tab-pane>

      <avue-form ref="formRef" :option="addEditOption" v-model="form" @submit="submit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
        </template>

        <template slot-scope="scope" slot="empName">
          <div>
            <el-input v-model="form.empName" placeholder="请选择车主" :disabled="true">
              <el-button
                slot="append" icon="el-icon-search"
                @click="$refs['selectEmpRef'].openDialog({ type: 'empName', isAudit: true })"></el-button>
            </el-input>
          </div>
        </template>

        <template slot="cfg">
          <el-checkbox v-model="form.isCarExistObd">加装OBD</el-checkbox>
          <el-checkbox v-model="form.isCarInside">场内车辆</el-checkbox>
        </template>
      </avue-form>
    </el-tabs>

    <select-emp ref="selectEmpRef" @refreshPage="getEmpVal"></select-emp>
  </el-dialog>
</template>

<script>
import { carNo } from '@/util/validate.js';
import selectEmp from '@/views/kq/components/select-emp.vue';
import { addCar, updateCar } from '@/api/parking/car.js';

export default {
  components: { selectEmp },
  props: {
    carTypeDic: {
      type: Array,
      default: () => []
    },
    plateNumColorDic: {
      type: Array,
      default: () => []
    },
    carEmissionStandardDic: {
      type: Array,
      default: () => []
    },
    carFuelOliType: {
      type: Array,
      default: () => []
    },
    carVehicleDic: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeName: 'first',
      dialogVisible: false,
      form: { empId: '', empName: '', deptName: '', empPhone: '' }
    };
  },
  methods: {
    openDialog(type, form = {}) {
      this.btnType = type;
      this.form = form;
      this.dialogVisible = true;
    },
    submit() {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          if (this.btnType === 'add') {
            addCar(this.form).then(r => {
              done();
              if (r.data.code == 200) {
                this.$message.success(r.data.msg);
                this.$emit('refeshPage');
                this.handleClose();
              } else {
                this.$message.error(r.data.msg);
              }
            }).catch(() => {
              done();
            });
          } else {
            updateCar(this.form).then(r => {
              done();
              if (r.data.code == 200) {
                this.$message.success(r.data.msg);
                this.$emit('refeshPage');
                this.handleClose();
              } else {
                this.$message.error(r.data.msg);
              }
            }).catch(() => {
              done();
            });
          }
        }
      });
    },
    getEmpVal(arr) {
      let obj = arr[0];
      this.form.empId = obj.id;
      this.$set(this.form,'empName',obj.empName);
      this.$set(this.form,'deptName',obj.deptName);
      this.$set(this.form,'empPhone',obj.empPhone);
    },
    handleClose() {
      this.$refs.formRef.resetForm();
      this.$refs.formRef.clearValidate();
      this.dialogVisible = false;
    }
  },
  computed: {
    addEditOption() {
      return {
        emptyBtn: false,
        submitText: '保存',
        column: [
          {
            label: '车辆类型',
            prop: 'carTypeId',
            type: 'select',
            dicData: this.carTypeDic,
            rules: [
              {
                required: true,
                message: '请选择车辆类型',
                trigger: 'blur'
              }
            ],
            display: this.activeName === 'first' ? true : false
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
                trigger: 'blur'
              }
            ],
            display: this.activeName === 'first' ? true : false
          },
          {
            label: '车牌颜色',
            prop: 'plateNumColor',
            type: 'select',
            dicData: this.plateNumColorDic,
            display: this.activeName === 'first' ? true : false
          },
          {
            label: '车辆颜色',
            prop: 'carColor',
            maxlength:10,
            display: this.activeName === 'first' ? true : false
          },
          {
            label: '车牌号码',
            prop: 'plateNum',
            rules: [
              {
                validator: (rule, value, callback) => {
                  if (value === '') {
                    callback(new Error('请输入车牌号码'));
                  } else {
                    if (!carNo(value)) {
                      callback(new Error('请输入正确的车牌号码'));
                    } else {
                      callback();
                    }
                  }
                },
                required: true,
                trigger: 'blur'
              }
            ],
            display: this.activeName === 'first' ? true : false
          },
          {
            label: '车主姓名',
            prop: 'empName',
            rules: [
              {
                required: true,
                message: '请选择车主姓名',
                trigger: 'blur'
              }
            ],
            formslot: true,
            display: this.activeName === 'first' ? true : false
          },
          {
            label: '联系电话',
            prop: 'empPhone',
            disabled: true,
            display: this.activeName === 'first' ? true : false
          },
          {
            label: '部门',
            prop: 'deptName',
            disabled: true,
            display: this.activeName === 'first' ? true : false
          },
          {
            label: '运输量(吨)',
            prop: 'freightVolume',
            type: 'number',
            minRows: 1,
            precision: 1,
            maxRows:999,
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '排放阶段',
            prop: 'carEmissionStandard',
            type: 'select',
            dicData: this.carEmissionStandardDic,
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '发动机号',
            prop: 'engineNum',
            maxlength:8,
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '行驶证',
            prop: 'drivingPermit',
            maxlength:18,
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '车辆识别代码(VIN)',
            prop: 'carRecognitionNum',
            labelWidth: 140,
            maxlength:17,
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '注册时间',
            prop: 'registerTime',
            type: 'datetime',
            format: 'yyyy-MM-dd hh:mm:ss',
            valueFormat: 'yyyy-MM-dd hh:mm:ss',
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '运输货物名称',
            prop: 'goodsName',
            labelWidth: 110,
            maxlength:100,
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '车队名称',
            prop: 'carMotorcadeName',
            maxlength:20,
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '环保登记(管理)号',
            prop: 'environmentalAdminNum',
            labelWidth: 130,
            maxlength:16,
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '',
            prop: 'cfg',
            labelWidth: 40,
            formslot: true,
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '燃油类型',
            prop: 'fuelOliType',
            type: 'select',
            dicData: this.carFuelOliType,
            display: this.activeName === 'second' ? true : false
          },
          {
            label: '核载重量(吨)',
            prop: 'loadWeight',
            type: 'number',
            labelWidth: 110,
            minRows: 1,
            maxRows:999,
            precision: 1,
            display: this.activeName === 'second' ? true : false
          }
        ]
      };
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.el-dialog__body {
  padding: 6px 20px 20px;
}
</style>
