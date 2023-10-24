<template>
  <basic-container>
    <div>
      <el-date-picker
        v-model="accTransTime"
        size="small"
        value-format="yyyy-MM-dd"
        type="daterange"
        :clearable="false"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 250px;"></el-date-picker>
      <el-input
        v-model="repairEmpName"
        size="small" clearable
        placeholder="请输入报修人姓名"
        style="width: 160px;margin: 0 10px;"
        @keyup.enter.native="search"></el-input>
      <el-input
        v-model="repairNum"
        size="small" clearable
        placeholder="请输入宿舍/楼栋编号"
        style="width: 180px;"
        @keyup.enter.native="search"></el-input>
      <el-select size="small" clearable v-model="repairStatus" placeholder="请选择维修状态" style="width: 150px;margin: 0 10px;">
        <el-option
          v-for="item in repairStatusArr"
          :key="item.value"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-search" size="small" @click="search">搜索</el-button>
      <el-button icon="el-icon-refresh" size="small" @click="searchReset">重置</el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="handleAdd"
        v-if="permissionList.addBtn">
        添加</el-button>
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        @click="handleDelete"
        v-if="permissionList.delBtn"
        >删除</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-download"
        @click="handleExport"
        v-if="permissionList.exportBtn">导出</el-button>
      <el-button
        type="primary"
        size="small"
        @click="handleorderReceiv"
        v-if="permissionList.orderReceivBtn">接单</el-button>
      <el-button
        type="primary"
        size="small"
        @click="handleReceipts"
        v-if="permissionList.finishBtn">单据处理</el-button>
    </div>
    <vxe-grid
      border
      resizable
      :height="tableHeight"
      ref="crud"
      size="mini"
      align="center"
      show-overflow
      :highlight="true"
      :columns="options"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="data"
      @checkbox-change="selectionChange"
      @checkbox-all="selectionChange">
      <template #repairStatus="{row}">
        <el-tag effect="dark" size="mini" type="warning" v-if="row.repairStatus == 1" >待处理</el-tag>
        <el-tag effect="dark" size="mini" v-if="row.repairStatus == 2" type="info" >已撤销</el-tag>
        <el-tag effect="dark" size="mini" v-if="row.repairStatus == 3" type="danger" >处理中</el-tag>
        <el-tag effect="dark" size="mini" v-if="row.repairStatus == 4" type="info" >已拒绝</el-tag>
        <el-tag effect="dark" size="mini" v-if="row.repairStatus == 5">已完成</el-tag>
      </template>
      <template #handlingIsSpite="{row}">
        <i class="icon-xuanzhong" v-if="row.handlingIsSpite" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>
      <template #repairImg="{row}">
        <div>
          <img v-for="(v,i) in row.repairImgs" :key="i" width="30px" height="30px" :src="v" style="margin-right: 4px;" @click="openPreview(v)" />
        </div>
      </template>
    </vxe-grid>
    <div class="page_class">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.currentPage"
        :page-sizes="[30, 50, 100, 500,1000,3000]"
        :page-size="page.pageSize"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :hide-on-single-page="false">
      </el-pagination>
    </div>
    <el-dialog
      title="添加报修单"
      :visible.sync="dialogVisible"
      width="44%"
      top="10vh"
      :before-close="handleClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form
        ref="formRef"
        :option="addEditOption"
        v-model="form"
        @submit="submit"
        @error="error">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
    <el-dialog
      title="单据处理"
      :visible.sync="receiptsDialogVisible"
      width="30%"
      :before-close="escClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <avue-form
        ref="receiptsFormRef"
        :option="receiptsOption"
        v-model="receiptsForm"
        @submit="receiptsSubmit"
        @error="error">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="escClose" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </basic-container>
</template>

<script>
  import moment from 'moment';
  import { mapGetters } from 'vuex';
  import website from "@/config/website";
  import { getToken } from '@/util/auth';
  import { getTableData, addForm, removeForm, receiptsHandle, receiptsOrder } from '@/api/dorm/maintain.js'
  import { getDormZtree } from '@/api/dorm/floor.js'

  export default{
    data(){
      return{
        accTransTime:[],
        repairEmpName:"",
        repairStatus:1,
        repairStatusArr:[
          {value:1,label:"待处理"},{value:2,label:"已撤销"},{value:3,label:"处理中"},{value:4,label:"已拒绝"},{value:5,label:"已完成"}
        ],
        repairNum:"",
        tableHeight:0,
        loading:false,
        data:[],
        page:{
          pageSize:30,
          currentPage:1,
          total:0
        },
        selectionList:[],
        dialogVisible:false,
        form:{},
        receiptsDialogVisible:false,
        receiptsForm:{},
        floorDic:[]
      }
    },
    mounted() {
      this.tableHeight=window.innerHeight-313;
      let start = moment().format('YYYY-MM-DD');
      let end = moment().format('YYYY-MM-DD');
      this.accTransTime = [start, end];
      this.search()
      getDormZtree({stype:'SFLOOR'}).then(r => {
        this.floorDic = r.data;
      })
    },
    methods:{
      openPreview(url) {
        let arr = [{
          thumbUrl: url,
          url: url
        }];
        this.$ImagePreview(arr, 0);
      },
      handleorderReceiv(){
        if(this.selectionList.length == 0){
          this.$message.warning('请选择至少一条数据')
          return;
        }
        let that = this;
        let flag = false;
        that.selectionList.forEach(v => {
          if(v.repairStatus != 1){
            flag = true;
            return
          }
        })
        if(flag){
          this.$message.warning('请选择待处理的单据')
          return;
        }
        receiptsOrder({ids:this.ids}).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.search()
          }else{
            this.$message.error(r.data.msg)
          }
        })
      },
      receiptsSubmit(form,done){
        if(form.handlingCost == "undefined"){
          form.handlingCost = 0
        }
        receiptsHandle(form).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.search()
            this.escClose()
            done()
          }else{
            this.$message.error(r.data.msg)
            done()
          }
        }).catch(() => {
          done()
        })
      },
      handleReceipts(){
        if ( this.selectionList.length != 1) {
          this.$message.warning("请选择一条数据");
          return;
        }
        if(this.selectionList[0].repairStatus != 3){
          this.$message.warning('请选择处理中的单据')
          return;
        }
        this.receiptsForm.id = this.selectionList[0].id;
        this.receiptsForm.handlingIsSpite = false
        this.receiptsDialogVisible = true
      },
      escClose(){
        this.receiptsForm = {}
        this.$refs.receiptsFormRef.resetForm();
        this.$refs.receiptsFormRef.clearValidate();
        this.receiptsDialogVisible = false;
      },
      submit(form,done){
        let str = form.floorId;
        if(!str.startsWith('FLOOR')){
          this.$message.error("请选择到楼栋")
          this.form.floorId = ""
          done()
          return;
        }else{
          form.floorId = form.floorId.split('-')[1]
        }
        addForm(form).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.search()
            this.handleClose()
            done()
          }else{
            this.$message.error(r.data.msg)
            done()
          }
        }).catch(() => {
          done()
        })
      },
      handleAdd(){
        this.dialogVisible = true;
        this.form.reapirDateTime = moment().format('YYYY-MM-DD HH:mm:ss')
      },
      handleDelete(){
        if ( this.selectionList.length == 0) {
          this.$message.warning("请选择要删除的数据");
          return;
        }
        this.$confirm("确定要删除选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return removeForm({ids:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }else{
            this.$message.error(res.data.msg);
          }
        })
      },
      handleClose(){
        this.form = {}
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
      search(){
        this.page.currentPage = 1;
        this.onLoad()
      },
      onLoad(){
        this.loading = true;
        let params = {}
        params['size'] = this.page.pageSize
        params["current"] = this.page.currentPage
        params['repairStatus'] = this.repairStatus;
        params['repairEmpName'] = this.repairEmpName.trim()
        params['repairNum'] = this.repairNum.trim()
        params['startRepairDateTime'] = this.accTransTime[0]
        params['endRepairDateTime'] = this.accTransTime[1]
        getTableData(params).then(r => {
          this.loading = false
          let d = r.data.data;
          this.page.total = d.total
          d.records.forEach(v => {
            v.repairImgs = v.repairImgs.split(',')
          })
          this.data = d.records
        })
      },
      searchReset(){
        this.repairEmpName = ""
        this.repairNum = ""
        this.repairStatus = 1
        let start = moment().format('YYYY-MM-DD');
        let end = moment().format('YYYY-MM-DD');
        this.accTransTime = [start, end];
        this.search()
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
      handleExport(){
        this.$confirm("是否导出维修管理信息?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let startRepairDateTime = '',endRepairDateTime = ''
          if(this.accTransTime.length){
            startRepairDateTime = this.accTransTime[0]
            endRepairDateTime = this.accTransTime[1]
          }
          window.open(
            `/api/iot-dorm/repair/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&repairStatus=${this.repairStatus}&repairEmpName=${this.repairEmpName.trim()}&repairNum=${this.repairNum.trim()}&startRepairDateTime=${startRepairDateTime}&endRepairDateTime=${endRepairDateTime}`
          );
        });
      }
    },
    computed:{
      ...mapGetters(['permission', 'btnicon', 'colorName']),
      permissionList() {
        return {
          addBtn: this.vaildData(this.permission.dorm_repair_add_btn, false),
          delBtn: this.vaildData(this.permission.dorm_repair_delete_btn, false),
          exportBtn: this.vaildData(this.permission.dorm_repair_export_btn, false),
          orderReceivBtn: this.vaildData(this.permission.dorm_repair_handler_btn, false),
          finishBtn: this.vaildData(this.permission.dorm_repair_handler_finish_btn, false),
        };
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(',');
      },
      receiptsOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"是否恶意损坏",
              prop:"handlingIsSpite",
              span:24,
              type:"radio",
              dicData:[
                {value:true,label:"是"},{value:false,label:"否"}
              ],
              labelWidth:120,
            },
            {
              label:"处理意见",
              prop:"handlingRemark",
              span:24,
              type:"textarea",
              maxlength:290,
              rules: [{
                required: true,
                message: "请输入处理意见",
                trigger: "blur"
              }]
            },
            {
              label:"费用",
              prop:"handlingCost",
              span:24,
              type: 'number',
              precision:1,
              minRows:0,
              maxRows:99999999
            }
          ]
        }
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          labelWidth:120,
          column:[
            {
              label:"报修人姓名",
              prop:"repairEmpName",
              span:12,
              rules: [{
                required: true,
                message: "请输入报修人姓名",
                trigger: "blur"
              }],
              maxlength:10,
            },
            {
              label:"报修内容",
              prop:"repairContent",
              span:12,
              rules: [{
                required: true,
                message: "请输入报修内容",
                trigger: "blur"
              }],
              maxlength:90,
            },
            {
              label:"楼栋编号",
              prop:"floorId",
              span:12,
              rules:[{
                required: true,
                message: "请选择楼栋编号",
                trigger: "blur"
              }],
              type:'tree',
              props:{
                value:"valueStr"
              },
              dicData:this.floorDic
            },
            {
              label:"期望处理日期",
              prop:"reapirDateTime",
              span:12,
              rules: [{
                required: true,
                message: "请选择期望处理日期",
                trigger: "blur"
              }],
              type:"datetime",
              format:'yyyy-MM-dd HH:mm:ss',
              valueFormat:'yyyy-MM-dd HH:mm:ss'
            },
            {
              label:"宿舍编号",
              prop:"reapirNum",
              span:12,
              rules: [{
                required: true,
                message: "请输入宿舍编号",
                trigger: "blur"
              }],
              maxlength:30,
            },
            {
              label:"照片",
              prop:"reapirImgs",
              span:24,
              type: 'upload',
              dataType: 'string',
              listType: 'picture-card',
              propsHttp: {
                res: "data",
                url:"absUrl"
              },
              limit:3,
              loadText: "上传中，请稍等",
              tip: "支持上传JPG,JPEG,PNG格式的图片,单张图片大小不能超过5M",
              action: `/api/iot-basic/common/upload?${this.website.tokenHeader}=${getToken()}&mode=DORM_REPAIR`,
            },
            {
              label:"备注",
              prop:"reapirRemark",
              span:12,
              type:"textarea",
              maxlength:290,
            },
          ]
        }
      },
      options(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title: '报修人',
            field: 'repairEmpName',
            sortable: true,
            fixed: "left",
            minWidth: 100,
          },
          {
            title: '报修日期',
            field: 'createTime',
            sortable: true,
            minWidth: 130,
          },
          {
            title: '期望处理日期',
            field: 'repairDateTime',
            sortable: true,
            minWidth: 150,
          },
          {
            title: '报修内容',
            field: 'repairContent',
            sortable: true,
            minWidth: 100,
          },
          {
            title: '楼栋编号',
            field: 'floorName',
            sortable: true,
            minWidth: 100,
          },
          {
            title:"宿舍编号",
            field:"repairNum",
            sortable:true,
            minWidth:100
          },
          {
            title: '维修状态',
            field: 'repairStatus',
            sortable: true,
            minWidth: 100,
            slots:{default:"repairStatus"}
          },
          {
            title: '备注',
            field: 'repairRemark',
            sortable: true,
            minWidth: 130,
          },
          {
            title: '费用',
            field: 'handlingCost',
            sortable: true,
            minWidth: 100,
          },
          {
            title: '是否恶意损坏',
            field: 'handlingIsSpite',
            sortable: true,
            minWidth: 120,
            slots: {default:"handlingIsSpite"}
          },
          {
            title: '处理人',
            field: 'handlingEmpName',
            sortable: true,
            minWidth: 100,
          },
          {
            title: '处理日期',
            field: 'handlingDateTime',
            sortable: true,
            minWidth: 150,
          },
          {
            title: '处理意见',
            field: 'handlingRemark',
            sortable: true,
            minWidth: 100,
          },
          {
            title:"提交人",
            field:"submitEmpName",
            sortable:true,
            minWidth:100,
          },
          {
            title: '照片',
            field: 'repairImg',
            sortable: true,
            minWidth: 120,
            slots: {default:"repairImg"}
          },
        ]
      }
    }
  }
</script>

<style scoped="scoped">
  >>>.basic-container:first-child{
    height: 100%;
  }
  >>>.el-card{
    height: 99%;
  }
</style>
