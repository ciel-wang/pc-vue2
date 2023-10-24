<template>
  <div>
    <div class="mbottom8">
      <el-date-picker
        v-model="dayDate"
        size="small" clearable
        type="datetimerange"
        format="yyyy-MM-dd HH:mm:ss"
        value-format="yyyy-MM-dd HH:mm:ss"
        :default-time="['00:00:00', '23:59:59']"
        style="width: 340px;margin-right: 10px;"
        start-placeholder="审核开始时间"
        range-separator="至"
        end-placeholder="审核结束时间"
      ></el-date-picker>
      <el-input
        v-model="empParam"
        size="small" clearable
        placeholder="请输入学工号/姓名"
        style="width: 160px;margin-right: 10px;"
        @keyup.enter.native="search"></el-input>
      <el-input
        v-model="deptParam"
        size="small" clearable
        placeholder="请输入部门/班级名称"
        style="width: 200px;margin-right: 10px;"
        @keyup.enter.native="search"></el-input>
      <el-select v-model="empCategory" size="small" clearable placeholder="请选择人员分类" style="width: 160px;margin-right: 10px;">
        <el-option
          v-for="item in empCategoryDic"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select v-model="exaState" clearable size="small" placeholder="审核状态" style="width: 150px;margin-right: 10px;" >
        <el-option v-for="item in exaStatDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
      <el-button size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
    </div>
    <div class="mbottom8">
      <el-button
        type="primary"
        size="small"
        v-if="permission.no_card_auth__pre_recharge"
        @click="preRechargeMoney">预充值</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-upload2"
        @click="handleImportInfo"
        v-if="permission.iot_teacher_importinfo_btn"
        >导入</el-button>
      <el-button
        type="primary"
        size="small"
        v-if="permission.no_card_auth__audit"
        @click="auditRechargeMoney">审核</el-button>
      <el-button
        type="danger"
        size="small"
        v-if="permission.no_card_auth__audit"
        @click="rejectRechargeMoney">驳回</el-button>
    </div>
    <vxe-grid
      border
      resizable
      highlight-hover-row
      :height="tableHeight"
      ref="empCrud"
      size="mini"
      align="center"
      :highlight="true"
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="tableData"
      :export-config="{}"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #rechargeState="{row}">
        <el-tag effect="dark" size="mini" type="info" v-if="row.rechargeState == 1">未审核</el-tag>
        <el-tag effect="dark" size="mini" type="primary" v-if="row.rechargeState == 2">已到账</el-tag>
        <el-tag effect="dark" size="mini" type="warning" v-if="row.rechargeState == 3">已驳回</el-tag>
      </template>
    </vxe-grid>
    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[30,50,100,500,1000]"
        :page-size="page.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :hide-on-single-page="false">
      </el-pagination>
    </div>

    <el-drawer
      title="预充值"
      :visible.sync="drawer"
      :append-to-body="true"
      :wrapperClosable="false"
      :before-close="handleEsc"
      size="480px">
      <avue-form
        :option="preRechargeoption"
        v-model="preRechargeObj"
        ref="preRechargeRef"
        @submit="preRechargeSubmit">
        <template slot="menuForm">
          <el-button @click="handleEsc" icon="el-icon-close">取消</el-button>
        </template>

        <template slot-scope="scope" slot="empIds">
          <div style="max-height: 50vh;overflow: auto;padding-top: 6px;">
            <span
              class="icon-tianjia"
              style="font-size: 40px !important;vertical-align: super;"
              @click="rechargeEmpAdd"></span>
            <span class="duplicateEmpItem" v-for="(v,i) in rechargeEmpList" :key="v.id">
              {{v.empName}}
              <i class="el-icon-close close" @click="rechargeEmpDel(i)"></i>
            </span>
            
          </div>
        </template>
      </avue-form>
    </el-drawer>

    <el-dialog title="审核" append-to-body :visible.sync="exaBox" width="555px">
      <div>
        <p>充值总金额：{{ rechargeSelectTotalMoney }}</p>
        <p>充值总人数：{{ rechargeSelectCount }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAuditHandle">确 定</el-button>
        <el-button @click="exaBox = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="驳回原因" :modal-append-to-body="true" :append-to-body="true" :visible.sync="dialogRejectVisible">
      <el-form :model="rejectForm">
        <el-form-item label="备注">
          <el-input type="textarea" :rows="4" v-model="rejectForm.name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="rejectSubmit">确 定</el-button>
        <el-button @click="dialogRejectVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <importInfo ref="importInfoRef" @refeshPage="search"></importInfo>
    <select-emp ref="selectEmpRef" @refreshPage="getEmpVal"></select-emp>
  </div>
</template>

<script>
  import moment from 'moment';
  import { mapGetters } from 'vuex';
  import { getDictCode } from "@/api/iot/teacher.js"
  import importInfo from '@/views/iot/components/teacher-import-info.vue'
  import selectEmp from '@/views/kq/components/select-emp.vue';
  import { reqNocardRechargeList, sendRechargeAudit, sendRechargeReject,sendRechargePreSubmit } from '@/api/energy-mng/index.js'

  export default {
    components:{ importInfo, selectEmp },
    data() {
      return{
        dayDate:[],
        empParam:"",
        deptParam:"",
        empCategory:"",
        empCategoryDic:[],
        exaState:1,
        exaStatDic:[
          { label: '未审核', value: 1 }, { label: '已到账', value: 2 }, { label: '已驳回', value: 3 }
        ],
        loading:false,
        tableData:[],
        selectionList: [],
        page: {
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        drawer:false,
        rechargeEmpList:[],
        preRechargeObj:{
          rechargeWellet: 0,
          rechargeMode: '现金'
        },
        exaBox:false,
        rechargeSelectTotalMoney:0,
        rechargeSelectCount:0,
        dialogRejectVisible:false,
        rejectForm:{ name:"" },
      }
    },
    activated() {
      // let dayStartDateStr = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      // let dayEndDateStr = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
      // this.dayDate = [dayStartDateStr, dayEndDateStr];
      getDictCode({keys:"userCategory#studentCategory"}).then(res => {
        this.empCategorys = [];
        let data = res.data.data;
        let arr1 = data.studentCategory.map(v => ({ value:v.dictKey,label:v.dictValue + '(学生)' }));
        let arr2 = data.userCategory.map(v => ({ value:v.dictKey,label:v.dictValue + '(教师)' }));
        this.empCategoryDic = [...arr1,...arr2];
        this.search()
      });
    },
    methods:{
      handleImportInfo(){
        this.$refs.importInfoRef.openDialog('energyNocardRecharge');
      },
      getEmpVal(d){
        let arr = d.map(v => ({id:v.id,empName:v.empName.substring(v.empName.length-2)}))
        let arr1 = [...this.rechargeEmpList,...arr]
        let obj = {};
        arr1 = arr1.reduce(function(item, next) {
          obj[next.id] ? '' : obj[next.id] = true && item.push(next);
          return item;
        }, []);
        this.rechargeEmpList = arr1;
        let arr2 = arr1.map(i => i.id);
        this.preRechargeObj["empIds"] = arr2;
      },
      rechargeEmpAdd(){
        this.$refs.selectEmpRef.openDialog({type:'energyNocardRecharge'});
      },
      rechargeEmpDel(v){
        this.rechargeEmpList.splice(v,1);
        let arr = this.rechargeEmpList.map(i => i.id);
        this.preRechargeObj["empIds"] = arr;
      },
      preRechargeSubmit(form, done){
        sendRechargePreSubmit(form).then(r => {
          done()
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.onLoad();
            this.handleEsc();
          }else{
            this.$message.error(r.data.msg);
          }
        }).catch(() => done())
      },
      handleEsc(){
        this.preRechargeObj.rechargeMoney = '';
        this.preRechargeObj.empIds = [];
        this.rechargeEmpList = [];
        this.$refs['preRechargeRef'].clearValidate();
        this.drawer = false;
      },
      preRechargeMoney(){
        this.drawer = true;
        this.$nextTick(() => this.$refs['preRechargeRef'].clearValidate())
      },
      auditRechargeMoney(){
        if (this.selectionList.length === 0) return this.$message.warning('请选择人员');
        let flag = this.selectionList.some(v => v.rechargeState != 1);
        if(flag) return this.$message.warning('请选择未审核的数据！');
        let rechargeSelectTotalMoney = 0, rechargeSelectCount = 0;
        this.selectionList.forEach(v => {
          rechargeSelectTotalMoney += v.rechargeMoney*1;
        })
        this.rechargeSelectTotalMoney = rechargeSelectTotalMoney.toFixed(2);
        this.rechargeSelectCount = this.selectionList.length;
        this.exaBox = true;
      },
      submitAuditHandle(){
        const loading = this.$loading({
          lock: true,
          text: '正在提交中，请耐心等待...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        sendRechargeAudit({ ids:this.ids }).then(r => {
          loading.close();
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.onLoad();
            this.exaBox = false;
          }else{
            this.$message.error(r.data.msg);
          }
        }).catch(() => loading.close())
      },
      rejectRechargeMoney(){
        if (this.selectionList.length === 0) return this.$message.warning('请选择人员');
        let flag = this.selectionList.some(v => v.rechargeState != 1);
        if(flag) return this.$message.warning('请选择未审核的数据！');
        this.rejectForm.name = '';
        this.dialogRejectVisible = true;
      },
      rejectSubmit(){
        const loading = this.$loading({
          lock: true,
          text: '正在提交中，请耐心等待...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        sendRechargeReject({ ids:this.ids,remark:this.rejectForm.name }).then(r => {
          loading.close();
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.onLoad();
            this.dialogRejectVisible = false;
          }else{
            this.$message.error(r.data.msg);
          }
        }).catch(() => loading.close())
      },
      search(){
        this.page.currentPage = 1
        this.selectionList = []
        this.onLoad();
      },
      searchReset(){
        this.empParam = "";
        this.deptParam = "";
        this.empCategory = "";
        this.exaState = 1;
        // let dayStartDateStr = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
        // let dayEndDateStr = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        // this.dayDate = [dayStartDateStr, dayEndDateStr];
        this.search();
      },
      onLoad(params = {}){
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['empCategory'] = this.empCategory;
        params['empName'] = this.empParam;
        params['deptParam'] = this.deptParam;
        params['rechargeState'] = this.exaState;
        params['startDateTime'] = this.dayDate && this.dayDate[0];
        params['endDateTime'] = this.dayDate && this.dayDate[1];
        this.loading = true;
        reqNocardRechargeList(params).then(r => {
          this.loading = false;
          if(r.data.code === 200){
            let d = r.data.data;
            this.page.total = d.total;
            d.records.forEach(v => {
              if(v.empType == 1) v.deptName = v.className;
              let extJson = v.extJson ? JSON.parse(v.extJson) : {};
              v.rejectCause = extJson.rejectCause;
            })
            this.tableData = d.records;
          }
        }).catch(() => this.loading = false)
      },
      selectionChange({records}) {
        this.selectionList = records;
      },
      handleSizeChange(val) {
        this.page.currentPage = 1;
        this.page.pageSize = val;
        this.onLoad();
      },
      handleCurrentChange(val) {
        this.page.currentPage = val;
        this.onLoad();
      },
    },
    computed:{
      ...mapGetters(['permission']),
      ids(){
        let ids = this.selectionList.map(v => v.id);
        return ids;
      },
      tableHeight(){
        return window.innerHeight - 366
      },
      preRechargeoption(){
        return {
          submitText: '确定',
          emptyBtn: false,
          column: [
            {
              label: '充值金额',
              prop: 'rechargeMoney',
              span: 24,
              rules: [{
                validator: (rule, value, callback) => {
                  if (value == '') {
                    callback(new Error('请填写充值金额'));
                  } else if (value * 1 <= 0 || !/^[+-]?((\d*(\.\d{1,2})$)|(\d+$))/.test(value)) {
                    callback(new Error('请输入大于0并最多两位小数的充值金额'));
                  } else {
                    callback();
                  }
                },
                required: true,
                trigger: 'blur',
              }]
            },
            {
              label: '充值方式',
              span: 24,
              type: 'radio',
              dicData: [
                { label: '现金', value: '现金' },
                { label: '微信', value: '微信' },
                { label: '支付宝', value: '支付宝' },
                { label: '其它', value: '其它' },
              ],
              prop: 'rechargeMode',
            },
            {
              label: '钱包',
              prop: 'rechargeWellet',
              type: 'radio',
              dicData: [{ label: '节能钱包', value: 0 }],
            },
            {
              label: '充值人员',
              prop: 'empIds',
              span: 24,
              formslot: true,
              rules: [{
                required: true,
                message: '请选择充值人员',
                trigger: 'blur'
              }]
            },
          ]
        }
      },
      options(){
        return [
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title: '学工号',
            field: 'empCode',
            sortable: true,
            fixed: "left",
            minWidth: 100,
          },
          {
            title: '姓名',
            field: 'empName',
            sortable: true,
            fixed: "left",
            minWidth: 100,
          },
          {
            title: '审核状态',
            field: 'rechargeState',
            slots: {default:"rechargeState"},
            sortable: true,
            minWidth: 100,
          },
          {
            title: '充值金额',
            field: 'rechargeMoney',
            sortable: true,
            minWidth: 120,
          },
          {
            title: '人员分类',
            field: 'empCategory',
            sortable: true,
            minWidth: 120,
            formatter:({ cellValue }) => {
              let item = this.empCategoryDic.find(item => item.value == cellValue)
              return item ? item.label : ''
            }
          },
          {
            title: '部门/班级名称',
            field: 'deptName',
            sortable: true,
            minWidth: 120,
          },
          {
            title: '学校名称',
            field: 'schoolName',
            sortable: true,
            minWidth: 120,
          },
          {
            title: '审核人',
            field: 'auditUserName',
            sortable: true,
            minWidth: 100,
          },
          {
            title: '审核时间',
            field: 'auditTime',
            sortable: true,
            minWidth: 140,
          },
          {
            title: '提交人',
            field: 'oprtUserName',
            sortable: true,
            minWidth: 100,
          },
          {
            title: '提交时间',
            field: 'createTime',
            sortable: true,
            minWidth: 140,
          },
          {
            title: '驳回理由',
            field: 'rejectCause',
            minWidth: 100,
          }
        ]
      }
    }
  }
</script>

<style>
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
    margin-left: 5px;
    text-align: center;
    vertical-align: text-bottom;
    position: relative;
  }
</style>
