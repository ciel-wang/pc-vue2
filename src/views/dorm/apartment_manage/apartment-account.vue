<template>
  <el-dialog
    title=""
    :visible.sync="dialogVisible"
    top="5vh"
    width="80%"
    append-to-body
    :show-close="false"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-row :style="{height: height + 'px'}">
      <el-col :span="17" style="height: 100%;">
        <div class="orderLeft">
          <div v-for="(v,i) in orderDetailArr" :key="i" class="firstItem">
            <div class="font20">{{v.dormName}}</div>
            <el-row class="row">
              <el-col :span="9">
                <p class="title">入住日期</p>
                <p class="fw600">{{v.entryTime}} ( {{v.entryWeek}} )</p>
              </el-col>
              <el-col :span="6" style="margin-top: 12px;">{{v.betweenDays}}晚</el-col>
              <el-col :span="9">
                <p class="title">退宿日期</p>
                <p class="fw600">{{v.leaveTime}} ( {{v.leaveWeek}} )</p>
              </el-col>
            </el-row>
          </div>

          <div class="tableItem">
            <div class="font20">住客资料</div>
            <div v-show="empData.length > 0">
              <div class="header">内部人员</div>
              <vxe-table
                border
                auto-resize
                ref="xTable"
                highlight-hover-column
                highlight-current-column
                size="mini"
                height="160px"
                align="center"
                :data="empData">
                <vxe-table-column title="姓名" minWidth="70" field="empName"></vxe-table-column>
                <vxe-table-column title="工号" minWidth="70" field="empCode"></vxe-table-column>
                <vxe-table-column title="性别" minWidth="50" field="empSex" :formatter="({ cellValue })=>{
                  return cellValue == 1 ? '男' : '女'
                }"></vxe-table-column>
                <vxe-table-column title="部门名称" minWidth="100" field="deptName"></vxe-table-column>
                <vxe-table-column title="房号" minWidth="100" field="dormName"></vxe-table-column>
                <vxe-table-column title="床号" minWidth="60" field="badNum"></vxe-table-column>
                <vxe-table-column title="柜号" minWidth="60" field="cabinetNum"></vxe-table-column>
              </vxe-table>
            </div>
            <div v-show="visitorData.length > 0">
              <div class="header">外来访客</div>
              <vxe-table
                border
                auto-resize
                ref="xTable"
                highlight-hover-column
                highlight-current-column
                size="mini"
                height="160px"
                align="center"
                :data="visitorData">
                <vxe-table-column title="姓名" minWidth="100" field="visitorName"></vxe-table-column>
                <vxe-table-column title="联系方式" minWidth="100" field="visitorPhone"></vxe-table-column>
                <vxe-table-column title="性别" minWidth="50" field="visitorSex" :formatter="({ cellValue })=>{
                  return cellValue == 1 ? '男' : '女'
                }"></vxe-table-column>
                <vxe-table-column title="证件号" minWidth="100" field="visitorIdCardNo"></vxe-table-column>
                <vxe-table-column title="房号" minWidth="100" field="dormName"></vxe-table-column>
                <vxe-table-column title="床号" minWidth="60" field="badNum"></vxe-table-column>
                <vxe-table-column title="柜号" minWidth="60" field="cabinetNum"></vxe-table-column>
              </vxe-table>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="7" style="height: 100%;">
        <el-card shadow="never" style="height: 100%;overflow: auto;" :body-style="{height:'89%',padding:'10px 20px'}">
          <div slot="header" class="fw600" style="padding: 8px 0;margin-bottom: 4px;">订单支付明细</div>
          <div class="fw600">支付金额
            <span style="float: right;">￥{{totalCostMoney}}</span>
          </div>
          <div class="orderDetail">
            <div style="margin-bottom: 8px;">
              <p>房号</p>
              <p>单价</p>
            </div>
            <div v-for="(v,i) in orderDetailArr" :key="i">
              <p class="fw600">{{v.dormName}}</p>
              <p class="fw600">￥{{v.costMoney}} × {{v.betweenDays}}晚</p>
              <p>入住折扣</p>
              <p>-￥{{v.disCountMoney}}</p>
            </div>
          </div>
          <div class="btns">
            <el-button type="primary" :disabled="btnDisabled" @click="submit(0)">退宿且结算</el-button>
            <el-button :plain="true" :disabled="btnDisabled" @click="submit(1)">仅结算</el-button>
            <el-button :plain="true" @click="handleClose">取消</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
  import { accountSubmit } from '@/api/dorm/apartment_manage.js'

  export default{
    data(){
      return{
        dialogVisible:false,
        orderDetailArr:[],
        height:0,
        empData:[],
        visitorData:[],
        liveId:'',
        btnDisabled:false,
        totalCostMoney:""
      }
    },
    mounted() {
      this.height = window.innerHeight - 140
    },
    methods:{
      openDialog(form,liveId){
        this.dialogVisible = true
        this.liveId = liveId;
        this.empData = form.emps;
        this.visitorData = form.visitors;
        let arr = form.exchangeRecrods;
        let sum = 0;
        let week = ['星期天','星期一','星期二','星期三','星期四','星期五','星期六']
        arr.forEach(v => {
          sum += (v.costMoney*v.betweenDays - v.disCountMoney)
          if(v.entryTime){
            v.entryWeek = week[new Date(v.entryTime).getDay()]
          }
          if(v.leaveTime){
            v.leaveWeek = week[new Date(v.leaveTime).getDay()]
          }
        })
        this.totalCostMoney = sum
        this.orderDetailArr = arr
      },
      submit(val){
        this.$confirm("确定要进行此操作？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let form = {}
          form['liveId'] = this.liveId;
          form['exitType'] = val
          this.btnDisabled = true
          return accountSubmit(form);
        }).then(r =>{
          this.btnDisabled = false
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.dialogVisible = false
            this.$emit('refeshPage')
            this.$emit('refeshDorm')
          }else{
            this.$message.error(r.data.msg)
          }
        }).catch(() => {
          this.btnDisabled = false
        })
      },
      handleClose(){
        this.dialogVisible = false
      }
    }
  }
</script>

<style lang="scss" scoped="scoped">
  p{
    margin: 0;
  }
  /deep/.el-dialog__body{
    background-color: #ebe7e7;
    padding:10px;
  }
  .orderDetail{
    min-height: 200px;
    margin: 20px auto 30px;
    padding: 10px 10px 20px 16px;
    background-color: #f5f8fa;
    div + div{
      font-size: 12px;
      margin-bottom: 4px;
      border-bottom: 1px dashed #999;
    }
    &>div{
      display: flex;
      flex-wrap: wrap;
      padding-bottom: 8px;
      &>p{
        margin-bottom: 4px;
        &:nth-child(odd){
          width: 64%;
        }
        &:nth-child(even){
          width: 36%;
          text-align: right;
        }
      }
    }
  }
  .btns{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .el-button{
      width: 50%;
      margin-left: 0;
      margin-bottom: 10px;
    }
  }
  .orderLeft{
    margin-right: 10px;background-color: #fff;height: 100%;overflow: auto;
    .firstItem{
      border-bottom: 1px dashed #999;
      padding: 20px;
      padding-bottom: 0;
      .row{
        padding: 20px;
        .title{
          width: 50%;
          text-align: center;
          margin-bottom: 4px;
        }
      }
    }
    .tableItem{
      padding: 20px;
      padding-bottom: 0;
      .header{
        margin: 20px 0 10px;
      }
    }
  }
  .font20{
    font-size: 20px;
    font-weight: 600;
  }
  /deep/.el-card__header{
    border-bottom: 1px dashed #999;
  }
</style>
