<template>
  <el-drawer
    title="查看"
    :visible.sync="dialogVisible"
    :before-close="escForm"
    append-to-body
    size="480px"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit" @error="error">
      <template slot-scope="scope" slot="receiptCause">
        <el-input
          v-model="form.receiptCause"
          placeholder=" "
          type="textarea"
          :disabled="true"
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
              <td style="border: 1px solid #DCDFE6;">{{ v.dayDate.substr(0, 10) }}</td>
              <td style="border: 1px solid #DCDFE6;">{{ (v.minute / 60).toFixed(1) }}</td>
            </tr>
          </table>
        </div>
      </template>

      <template slot="startTime">
        <div v-if="form.bkTimeSteps && form.bkTimeSteps.length && Array.isArray(form.bkTimeSteps)" class="bkClass">
          <p v-for="(item,index) in form.bkTimeSteps" :key="index" style="margin: 0 0 6px;">{{item}}</p>
        </div>
      </template>

      <template slot="receiptTogether" slot-scope="scope">
        <div style="display: flex;text-align: center;flex-wrap: wrap;">
          <div v-for="(item,index) in form.receiptTogether" :key="index+'viewkq'" style="margin-right: 8px;">
            <p class="flowNode" style="margin: 0;">{{item.empName.substring(item.empName.length-2)}}</p>
            <p style="margin: 0;">{{item.empName}}</p>
          </div>
        </div>
      </template>
    </avue-form>

    <el-divider content-position="left" style="margin: 0 0 30px;">流程</el-divider>
    <div class="flow" v-for="(v, i) in activities" :key="i">
      <div style="display: flex;float: left;width: 72%;">
        <div class="flowNode">
          {{ v.empName.substr(v.empName.length - 2) }}
          <i v-if="v.auditStatus == 1 || v.auditStatus == 2" :class="v.icon1" style="position: absolute;left: 26px;bottom: -14px;color: #FF9F40;"></i>
          <i v-else-if="v.auditStatus == 3" :class="v.icon2" style="position: absolute;left: 26px;bottom: -14px;color: #52C41A;"></i>
          <i v-else-if="v.auditStatus == 4" :class="v.icon3" style="position: absolute;left: 26px;bottom: -14px;color: #FF5736;"></i>
          <i v-else :class="v.icon3" style="position: absolute;left: 26px;bottom: -14px;color: #52C41A;"></i>
        </div>
        <div style="line-height: 22px;margin-right: 20px;">
          <div>{{ v.title }}</div>
          <div>
            <span v-if="v.initiatorEmpName">由{{v.initiatorEmpName}}代</span>{{ v.empName }}<span v-if="!v.auditStatus">提交</span>
            <span v-if="v.auditStatus == 1 || v.auditStatus == 2">(审核中)</span>
            <span v-if="v.auditStatus == 3">(已通过)</span>
            <span v-if="v.auditStatus == 4">(已拒绝)</span>
          </div>
          <div v-if="v.auditCause" style="background-color: #f5f6f8;padding: 4px;">{{ v.auditCause }}</div>
        </div>
      </div>
      <div style="float: right;margin-right: 30px;">{{ v.timestamp }}</div>
      <div class="xian"></div>
    </div>
    <!-- 抄送人部分 -->
    <div class="flow">
      <div class="flowNode" style="width: 40px;float: left;">
        <i class="icon-chaosong" style="font-size: 20px !important;"></i>
      </div>
      <div style="line-height: 22px;float: left;">
        <div>抄送人</div>
        <div>抄送{{ duplicateEmpList.length }}人</div>
        <div style="display: flex;flex-wrap: wrap;text-align: center;margin-top: 10px;">
          <div v-for="(v, i) in duplicateEmpList" :key="i" style="margin-right: 5px;" v-if="duplicateEmpList.length > 0">
            <div class="duplicateEmpItem">{{ v.empName.substring(v.empName.length - 2) }}</div>
            <div>{{ v.empName }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="icon-shenpi-daishenhe bigIcon" style="color: #ff9227;" v-if="form.receiptStatus == 1"></div>
    <div class="icon-shenpi-shenpizhong bigIcon" style="color: #ff9227;" v-if="form.receiptStatus == 2"></div>
    <div class="icon-shenpi-yitongyi bigIcon" style="color: #00C431;" v-if="form.receiptStatus == 3"></div>
    <div class="icon-shenpi-yijujue bigIcon" style="color: #d81e06;" v-if="form.receiptStatus == 4"></div>
    <div class="icon-shenpi-yichexiao bigIcon" style="color: #cdcdcd;" v-if="form.receiptStatus == 5"></div>
    <div class="icon-shenpi-yichaoshi bigIcon" style="color: #cdcdcd;" v-if="form.receiptStatus == 6"></div>
    <div class="icon-yizuofei bigIcon" style="color: #cdcdcd;" v-if="form.receiptStatus == 7"></div>
  </el-drawer>
</template>

<script>
import moment from 'moment';
export default {
  data() {
    return {
      dialogVisible: false,
      form: { jbTimeSteps: [] },
      typeLabel: '请假类型',
      reasonLabel: '请假事由',
      dateTimeLabel: '请假时间',
      businessDisplay: false,
      dateTimeDisplay: false,
      timeCountDisplay: false,
      typeDicData: [],
      TimeDisplay: false,
      auditEmpData: [],
      activities: [],
      duplicateEmpList: [],
      receiptStatus: '',
      jbTimeDisplay: false,
      receiptType:""
    };
  },
  methods: {
    openDialog(details) {
      this.activities = [];
      this.dialogVisible = true;
      this.businessDisplay = false;
      if (details.d) {
        let d = details.d;
        d.isLeave = d.isLeave ? 1 : 0
        d.deptName = d.deptName ? d.deptName : (d.gradeName + d.className)
        d.duration = (d.duration / 60).toFixed(2);
        this.form = details.d;
        this.duplicateEmpList = d.duplicateEmps;
        if (d.auditEmps.length) {
          this.form['auditEmpIds'] = d.auditEmps[0].empName;
        }
        this.form['datetimerangeData'] = [d.startTime, d.endTime];
        this.activities.push({
          empName: d.empName,
          title: '发起申请',
          icon1: 'icon-shenhetongguo',
          icon2: 'icon-shenhetongguo',
          icon3: 'icon-shenhetongguo',
          timestamp: d.createTime.substr(5),
          initiatorEmpName:d.initiatorEmpName
        });
        d.auditEmps.forEach(v => {
          this.activities.push({
            empName: v.empName,
            title: '审核人',
            icon1: 'icon-shenhezhong',
            icon2: 'icon-shenhetongguo',
            icon3: 'icon-shenhebutongguo',
            timestamp: v.auditTime ? v.auditTime.substr(5) : '',
            auditStatus: v.auditStatus,
            auditCause: v.auditCause
          });
        });
        this.receiptStatus = d.receiptStatus;
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
          this.form['receiptImgs'] = [];
        }
      }
      this.receiptType = details.type
      if (details.type == 1) {
        this.typeLabel = '请假类型';
        this.reasonLabel = '请假事由';
        this.dateTimeLabel = '请假时间';
        this.TimeDisplay = false;
        this.dateTimeDisplay = true;
        this.timeCountDisplay = true;
        this.jbTimeDisplay = false;
      }
      if (details.type == 2) {
        this.typeLabel = '出差类型';
        this.reasonLabel = '出差事由';
        this.dateTimeLabel = '出差时间';
        this.businessDisplay = true;
        this.dateTimeDisplay = true;
        this.timeCountDisplay = true;
        this.TimeDisplay = false;
        this.jbTimeDisplay = false;
      }
      if (details.type == 3) {
        this.typeLabel = '加班类型';
        this.reasonLabel = '加班事由';
        this.dateTimeLabel = '加班时间';
        this.TimeDisplay = false;
        this.dateTimeDisplay = true;
        this.timeCountDisplay = true;
        this.jbTimeDisplay = true;
      }
      if (details.type == 4) {
        this.typeLabel = '补卡类型';
        this.reasonLabel = '补卡事由';
        this.dateTimeLabel = '补卡时间';
        this.dateTimeDisplay = false;
        this.timeCountDisplay = false;
        this.TimeDisplay = true;
        this.jbTimeDisplay = false;
      }
    },
    escForm() {
      this.$refs['formRef'].resetForm();
      this.dialogVisible = false;
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        submitBtn: false,
        labelWidth: 72,
        disabled: true,
        column: [
          {
            label: '提交人',
            prop: 'empName',
            span: 24
          },
          {
            label: '所在部门',
            prop: 'deptName',
            span: 24
          },
          {
            label: this.typeLabel,
            prop: 'typeRoleName',
            span: 24
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
              { value: '4', label: '其他' },
            ],
            display: this.businessDisplay
          },
          {
            label: '单程往返',
            prop: 'isOneWay',
            span: 24,
            type: 'radio',
            dicData: [{ value: true, label: '单程' }, { value: false, label: '往返' }],
            display: this.businessDisplay
          },
          {
            label: '出发城市',
            prop: 'fromCity',
            span: 24,
            display: this.businessDisplay
          },
          {
            label: '目的城市',
            prop: 'toCity',
            span: 24,
            display: this.businessDisplay
          },
          {
            label: this.dateTimeLabel,
            prop: 'datetimerangeData',
            type: 'datetimerange',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间',
            span: 24,
            display: this.dateTimeDisplay
          },
          {
            label: '补卡时间',
            prop: 'startTime',
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd HH:mm:ss',
            span: 24,
            display: this.TimeDisplay,
            formslot:true
          },
          {
            prop: 'jbTimeSteps',
            span: 24,
            display: this.jbTimeDisplay,
            formslot: true
          },
          {
            label: '时长(H)',
            prop: 'duration',
            span: 24,
            placeholder: '自动计算时长(H)',
            display: this.timeCountDisplay
          },
          {
            label: this.reasonLabel,
            prop: 'receiptCause',
            span: 24,
            formslot: true
          },
          {
            label: '图片',
            prop: 'receiptImgs',
            type: 'upload',
            tip: '支持上传JPG,JPEG,PNG格式的图片,单张图片大小不能超过5M',
            action: '/api/iot-kq/receipt/compute/working/betweentime',
            limit: 3,
            multiple: true,
            listType: 'picture-card',
            span: 24,
            propsHttp: {
              res: 'data'
            }
          },
          {
            label:"是否离校",
            prop:'isLeave',
            type:'radio',
            dicData:[{value:1,label:"是"},{value:0,label:"否"}],
            span:24,
            display:this.receiptType == 1 ? true : false,
            control:(val)=>{
              if(val == 1){
                return{
                  leaveCause:{
                    display:true,
                  }
                }
              }else{
                return{
                  leaveCause:{display:false}
                }
              }
            }
          },
          {
            label:"外出去向",
            prop:"leaveCause",
            span:24,
            display:this.receiptType == 1 ? true : false,
          },
          {
            label: '审批人',
            prop: 'auditEmpIds',
            span: 24,
            dicData: this.auditEmpData
          },
          {
            label:"同行人",
            prop:"receiptTogether",
            span:24,
            display:this.businessDisplay,
            formslot:true,
          }
        ]
      };
    }
  }
};
</script>

<style scoped lang="scss">
/deep/.el-drawer__body {
  overflow: auto;
}
/deep/.el-dialog__body {
  padding: 10px;
}
/deep/.el-form-item {
  margin-bottom: 10px !important;
}
/deep/.el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
}
/deep/.el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
}
/deep/.el-divider--horizontal {
  margin: 0 0 30px !important;
}
.flow {
  width: 100%;
  padding-left: 40px;
  font-size: 12px;
  position: relative;
  margin-bottom: 32px;
  .xian {
    width: 2px;
    min-height: 30px;
    height: 100%;
    border-left: 2px dashed #999;
    position: absolute;
    bottom: -40px;
    left: 59px;
  }
  &::after {
    content: '';
    display: block;
    clear: both;
  }
}
.flowNode {
  width: 40px;
  height: 40px;
  background-color: #0086b3;
  color: #ffffff;
  text-align: center;
  line-height: 40px;
  position: relative;
  border-radius: 10px;
  margin-right: 15px;
}
.duplicateEmpItem {
  width: 37px;
  height: 37px;
  background-color: #0086b3;
  color: #ffffff;
  padding: 2px;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
  vertical-align: text-bottom;
  line-height: 37px;
}
.bigIcon {
  position: fixed;
  top: 40px;
  right: 12px;
  font-size: 90px !important;
  z-index: 100;
}
</style>
