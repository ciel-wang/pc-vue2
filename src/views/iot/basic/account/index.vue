<template>
  <div>
    <el-row>
      <el-col class="col-real-pos" :span="arrowCfg['left']">
        <i
          :style="arrowCfgStyleCommon"
          @click="leftClick"
          v-if="arrowCfg['left'] == 4"
          :class="arrowCfgClassLeftName"
        ></i>
        <div class="ztreeStyle" :style="{height:ztreeHeight+'px'}">
          <account-ztree ref="accountZtreeRef" @click="ztreeClick"></account-ztree>
        </div>
      </el-col>
      <el-col :span="arrowCfg['right']">
        <i
          :style="arrowCfgStyleCommon"
          @click="rightClick"
          v-if="arrowCfg['right'] == 24"
          :class="arrowCfgClassRightName"
        ></i>
        <basic-container>
          <div>
            <el-input
              placeholder="输入学工号/姓名"
              @keyup.enter.native="search"
              clearable
              v-model="moreParamQuery"
              size="small"
              style="width: 150px;margin-right: 10px;"
            ></el-input>
            <el-input
              placeholder="输入账号"
              @keyup.enter.native="search"
              clearable
              v-model="accountNumStr"
              size="small"
              style="width: 150px;margin-right: 10px;"
            ></el-input>
            <el-select
              size="small" clearable
              v-model="empCategory"
              placeholder="人员分类"
              style="width: 150px;margin-right: 10px;">
              <el-option
                v-for="item in userCategoryDict" :key="item.dictKey"
                :label="item.dictValue" :value="item.dictKey">
              </el-option>
            </el-select>
            <el-select
              size="small"
              clearable
              v-model="accountStateStr"
              placeholder="请选择账户状态"
              style="width: 150px;margin-right: 10px;">
                <el-option
                  v-for="item in accountStateList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
            </el-select>
            <el-select
              size="small" clearable
              v-model="qrcodeState"
              placeholder="请选择动态码状态"
              style="width: 150px;margin-right: 10px;">
                <el-option label="启用" :value="1"></el-option>
                <el-option label="未启用" :value="0"></el-option>
            </el-select>
            <el-select
              size="small" clearable
              v-model="wxState"
              placeholder="请选择微信状态"
              style="width: 150px;margin-right: 10px;">
                <el-option label="已绑定" :value="1"></el-option>
                <el-option label="未绑定" :value="0"></el-option>
            </el-select>
            <el-select
              size="small"
              clearable
              v-model="cardState"
              placeholder="请选择卡状态"
              style="width: 150px;margin-right: 10px;">
                <el-option
                  v-for="item in cardStateList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
            </el-select>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="search"
              >搜索</el-button>
            <el-button
              type="default"
              size="small"
              icon="el-icon-refresh"
              @click="searchReset"
              >重置</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="readIcCardFindEmp"
              >卡找人</el-button>
          </div>
          <vxe-grid
            border
            resizable
            auto-resize
            highlight-hover-row
            show-overflow
            :height="tableHeight"
            ref="crud"
            size="mini"
            align="center"
            :highlight="true"
            :columns="tableColumn"
            :loading="loading"
            :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
            :data="tableData"
            :checkbox-config="{checkField:'checked'}"
            :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
            @checkbox-change="checkboxChangeEvent"
            @checkbox-all="checkboxChangeEvent">
            <template #toolbar_buttons>
              <el-button
                type="primary"
                size="small"
                icon="btnicon.account_start_btn"
                @click="handleStart"
                v-if="permission.account_start_btn"
                >启用账户</el-button>
              <el-button
                type="danger"
                size="small"
                icon="btnicon.account_disable_btn"
                @click="handleStop"
                v-if="permission.account_disable_btn"
                >停用账户</el-button>
              <el-button
                type="primary"
                size="small"
                icon="btnicon.account_hair_btn"
                :disabled="isSendCardBtn"
                @click="sendCard"
                v-if="permission.account_hair_btn"
                >发 卡</el-button>
              <el-button
                type="danger"
                size="small"
                icon="btnicon.account_loss_btn"
                :disabled="isReportLossBtn"
                @click="reportLoss"
                v-if="permission.account_loss_btn"
                >挂 失</el-button>
              <el-button
                type="primary"
                size="small"
                icon="btnicon.account_Solut_btn"
                :disabled="isLiftReportLossBtn"
                @click="handlerLiftReportLoss"
                v-if="permission.account_Solut_btn"
                >解 挂</el-button>
              <el-button
                type="danger"
                size="small"
                icon="btnicon.account_breakage_btn"
                :disabled="isDamagedBtn"
                @click="handleDamaged"
                v-if="permission.account_breakage_btn"
                >报 损</el-button>
              <el-button
                type="danger"
                size="small"
                icon="btnicon.account_return_btn"
                :disabled="isRecycleBtn"
                @click="handleRecycle"
                v-if="permission.account_return_btn"
                >退 卡</el-button>
              <el-button
                type="primary"
                size="small"
                icon="btnicon.account_reissue_btn"
                :disabled="isReplaceBtn"
                @click="handleReplace"
                v-if="permission.account_reissue_btn"
                >补 卡</el-button>
              <el-button
                type="danger"
                size="small"
                v-if="permission.account_emptycard_btn"
                @click="handleEmptyCard">回收卡</el-button>
              <el-button
                type="primary"
                size="small"
                @click="handleAbnormalRecord"
                v-if="permission.account_change_btn"
                >异动记录</el-button>
              <el-button
                type="primary"
                size="small"
                icon="el-icon-download"
                @click="handleExport"
                v-if="permission.account_export_btn"
                >导出</el-button>
              <el-dropdown @command="handleCommand">
                <el-button size="small" type="primary" style="margin-left: 10px;">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="batchStartQrcode" v-if="permission.account_start_dynamic_code_btn">启用动态码</el-dropdown-item>
                  <el-dropdown-item command="batchStopQrcode" v-if="permission.account_stop_dynamic_code_btn">停用动态码</el-dropdown-item>
                  <el-dropdown-item command="wxUnbind" v-if="permission.account_wxUnbind_btn">微信解绑</el-dropdown-item>
                  <el-dropdown-item command="photoAuth" v-if="permission.account_photoAuth_btn">照片审核</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
            <template #cardState="{row}">
              <el-tag
                effect="dark"
                size="mini"
                type="info"
                v-if="row.cardState == '未发卡'"
                >{{ row.cardState }}</el-tag>
              <el-tag
                effect="dark"
                size="mini"
                v-if="row.cardState == '正常'"
                >{{ row.cardState }}</el-tag>
              <el-tag
                effect="dark"
                size="mini"
                type="warning"
                v-if="row.cardState == '报损'"
                >{{ row.cardState }}</el-tag>
              <el-tag
                effect="dark"
                size="mini"
                type="warning"
                v-if="row.cardState == '挂失'"
                >{{ row.cardState }}</el-tag>
              <el-tag
                effect="dark"
                size="mini"
                type="warning"
                v-if="row.cardState == '退卡'"
                >{{ row.cardState }}</el-tag>
            </template>
            <template #accountState="{row}">
              <el-tag
                effect="dark"
                size="mini"
                type="warning"
                v-if="row.accountState == 0"
                >未启用</el-tag>
              <el-tag
                effect="dark"
                size="mini"
                v-if="row.accountState == 1"
                >启用</el-tag>
              <el-tag
                effect="dark"
                size="mini"
                type="info"
                v-if="row.accountState == 2"
                >停用</el-tag>
            </template>
            <template #qrcodeState="{row}">
              <el-switch
                v-model="row.qrcodeState"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="qrCodeChange"
                :disabled="!permission.account_start_dynamic_code_btn"
                :active-value="row.id + '-1'"
                :inactive-value="row.id + '-0'">
              </el-switch>
            </template>
            <template #wxState="{row}">
              <el-tag
                effect="dark"
                size="mini"
                type="warning"
                v-if="row.wxState == '未绑定'"
                >{{ row.wxState }}</el-tag>
              <el-tag
                effect="dark"
                size="mini"
                v-if="row.wxState == '已绑定'"
                >{{ row.wxState }}</el-tag>
            </template>
            <template #faceUrl="{row}">
              <img
                width="30px"
                height="30px"
                v-if="row.faceUrl.length>0"
                :src="row.faceUrl+'?'+new Date().getTime()"
                @click="openPreview(row.faceUrl+'?'+new Date().getTime())" />
            </template>
          </vxe-grid>
          <div class="page_class">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="page.currentPage"
              :page-sizes="[20, 50, 100, 500,1000]"
              :page-size="page.pageSize"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="page.total"
              :hide-on-single-page="false">
            </el-pagination>
          </div>
          <el-dialog
            :title="sendCardTitle"
            append-to-body
            :visible.sync="sendCardVisible"
            :before-close="sendCardClose"
            width="555px">
            <avue-form
              :option="sendCardOption"
              ref="sendCardRef"
              v-model="sendCardBoxForm"
              @submit="sendCardSubmit"></avue-form>
          </el-dialog>

          <el-dialog
            title="卡片异动记录"
            append-to-body
            :visible.sync="abnormalRecordVisible"
            @open="abnormalDialogOpen"
            width="1200px">
            <vxe-grid
              border
              resizable
              :height="600"
              ref="abnormalRecordRef"
              size="mini"
              align="center"
              :highlight="true"
              :columns="abnormalRecordOption"
              :loading="abnormalLoading"
              :seq-config="{startIndex: (abnormalPage.currentPage - 1) * abnormalPage.pageSize}"
              :data="abnormalRecordData">
              <template #cardState="{row}">
                <el-tag
                  effect="dark"
                  size="mini"
                  type="info"
                  v-if="row.cardState == '未发卡'"
                  >{{ row.cardState }}</el-tag>
                <el-tag
                  effect="dark"
                  size="mini"
                  v-if="row.cardState == '正常'"
                  >{{ row.cardState }}</el-tag>
                <el-tag
                  effect="dark"
                  size="mini"
                  type="warning"
                  v-if="row.cardState == '报损'"
                  >{{ row.cardState }}</el-tag>
                <el-tag
                  effect="dark"
                  size="mini"
                  type="warning"
                  v-if="row.cardState == '挂失'"
                  >{{ row.cardState }}</el-tag>
                <el-tag
                  effect="dark"
                  size="mini"
                  type="warning"
                  v-if="row.cardState == '退卡'"
                  >{{ row.cardState }}</el-tag>
              </template>
            </vxe-grid>
            <div class="page_class">
              <el-pagination
                @size-change="handleSizeChange2"
                @current-change="handleCurrentChange2"
                :current-page="abnormalPage.currentPage"
                :page-sizes="[20, 50, 100, 500,1000]"
                :page-size="abnormalPage.pageSize"
                :background="true"
                layout="total, sizes, prev, pager, next, jumper"
                :total="abnormalPage.total"
                :hide-on-single-page="false">
              </el-pagination>
            </div>
          </el-dialog>
        </basic-container>
      </el-col>
    </el-row>

    <photo-auth ref="photoAuthRef" @refeshPage="search"></photo-auth>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import website from "@/config/website";
import { getToken } from "@/util/auth";
import axios from "axios";
import { getAccountData, getCardStateList, startCarduse, stopCarduse, reportloss, liftReportloss, damaged, recycle, issueCard, getReadCardCipher, getCleanCardCipher, updateQrcodeState, getOperateLogList, getDictListByCode, updateWxState} from "@/api/iot/account.js"
import { cardStatusTrans, cardTypeTrans } from "@/util/trans";
import accountZtree from "@/components/account-ztree/index.vue"
import photoAuth from './photo-auth.vue'
import { cardFunction } from '@/util/cardIssuer.js'
import { waterCardFunction } from '@/util/waterCardIssuer.js'
import { getDictCode } from "@/api/iot/teacher.js"

export default {
  components:{ accountZtree, photoAuth },
  data(){
    return{
      moreParamQuery:"",
      accountNumStr:"",
      empCategory: '',
      userCategoryDict: [],
      physicalCardNum: "",
      accountStateStr:"",
      accountStateList:[
        { label: "未启用", value: 0 },
        { label: "启用", value: 1 },
        { label: "停用", value: 2 }
      ],
      wxState:'',
      qrcodeState:'',
      cardState:"",
      cardStateList:[],
      page:{
        pageSize:20,
        currentPage:1,
        total:0
      },
      loading:false,
      tableData:[],
      selectionList:[],
      isSendCardBtn:true,
      isReportLossBtn:true,
      isLiftReportLossBtn:true,
      isDamagedBtn:true,
      isRecycleBtn:true,
      isReplaceBtn:true,
      ztreeHeight:0,
      tableHeight:0,
      sendCardTitle:"发卡",
      sendCardVisible:false,
      sendCardBoxForm:{},
      abnormalLoading: false,
      abnormalRecordData: [],
      abnormalRecordVisible: false,
      abnormalPage: {
        pageSize: 20,
        currentPage: 1,
        total: 0
      },
      abnormalRecordOption:[
        { type: 'seq',title:"序号", width: 70},
        {
          title:"学工号",
          field:"empCode",
          sortable: true,
          minWidth: 100,
        },
        {
          title: "姓名",
          field: "empName",
          sortable: true,
          minWidth: 100
        },
        {
          title: "卡片状态",
          field: "cardState",
          sortable: true,
          minWidth: 100,
          slot: true
        },
        {
          title: "持卡类型",
          field: "cardType",
          sortable: true,
          minWidth: 100
        },
        {
          title: "物理卡号",
          sortable: true,
          field: "physicalCardNum",
          minWidth: 100
        },
        {
          title: "卡状态变更日期",
          sortable: true,
          field: "updateCardTime",
          minWidth: 100
        },
        {
          title: "备注",
          field: "remarks",
          minWidth: 100
        }
      ],
      ancestors:"",
      cardTypeDict:[],
    }
  },
  mounted() {
    this.ztreeHeight=window.innerHeight-146;
    this.tableHeight=window.innerHeight-256;
    this.search()
  },
  activated() {
    getCardStateList().then(r => {
      if(r.data.code == 200){
        let arr = r.data.data.map(v => ({ value:v.value, label:v.name }))
        this.cardStateList = arr;
      }
    })
    getDictListByCode({ code: "cardType" }).then(res => {
      let arr = res.data.data.map(v => ({ value:v.dictKey, label:v.dictValue }))
      this.cardTypeDict = arr;
    });
    getDictCode({keys:"studentCategory#userCategory"}).then(r => {
      let d = r.data.data
      d.studentCategory.forEach(v => {
        v.dictValue = v.dictValue + ' (学生)'
      })
      d.userCategory.forEach(v => {
        v.dictValue = v.dictValue + ' (教师)'
      })
      this.userCategoryDict = [...d.studentCategory,...d.userCategory]
    })
  },
  methods:{
    handleCommand(v){
      if(v === "batchStartQrcode") this.batchStartQrcode();
      if(v === "batchStopQrcode") this.batchStopQrcode();
      if(v === "wxUnbind") this.wxUnbind();
      if(v === "photoAuth") this.$refs.photoAuthRef.openDialog();
    },
    // 微信解绑
    wxUnbind() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      let flag = false;
      this.selectionList.forEach(v => {
        if (v.wxState == '未绑定') {
          flag = true;
        }
      });
      if (flag) {
        this.$message.warning('请勾选已绑定状态');
        return;
      }
      this.$confirm('您确定要微信解绑吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = '';
        this.selectionList.forEach(v => {
          ids += v.id + ',';
        });
        ids = ids.substring(0, ids.length - 1);
        return updateWxState({ ids: ids });
      }).then(() => {
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '操作成功!'
        });
      });
    },
    // 卡找人
    readIcCardFindEmp(){
      cardFunction({},'CardFindEmp').then(res => {
        if (res) {
          this.physicalCardNum = res;
          this.search();
          this.physicalCardNum = '';
        }
      }).catch((err) => {
        if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
        this.$message.warning(err)
      })
    },
    handleStart(){
      if (this.selectionList.length === 0) return this.$message.warning("请选择至少一条数据");
      let flag = this.selectionList.some(v => v.accountState == '1');
      if (flag) return this.$message.warning('请勾选未启用状态');
      this.$confirm("您确定要启用吗?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(()=>{
        return startCarduse(this.ids.split(','));
      }).then(()=>{
        this.onLoad();
        this.$message({
          type: "success",
          message: "操作成功!"
        });
      })
    },
    handleStop(){
      if (this.selectionList.length === 0) {
        this.$message.warning("请选择至少一条数据");
        return;
      }
      let flag = this.selectionList.every(v => v.accountState == 1);
      if (!flag) return this.$message.warning('请勾选启用状态');
      this.$confirm(
        "警告：停用将会删除该人员所有权限，包括所有设备权限、充值权限等！",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(()=>{
        return stopCarduse(this.ids.split(','));
      }).then(() => {
        this.onLoad();
        this.$message({
          type: "success",
          message: "操作成功!"
        });
      })
    },
    sendCard(){
      if (this.selectionList.length != 1) {
        this.$message.warning("请勾选一条记录");
        return;
      }
      this.sendCardVisible = true;
      this.isIssueCard = true;
      this.sendCardBoxForm.cardType = "1";
      this.sendCardBoxForm.physicalCardNum = "";
    },
    handleReplace(){
      this.sendCardTitle="补卡";
      this.sendCardVisible = true;
      this.isIssueCard = false;
      this.sendCardBoxForm.cardType = "1";
    },
    sendCardSubmit(){
      this.$refs.sendCardRef.validate(async (vaild,done)=>{
        if(vaild){
          const loading = this.$loading({
            lock: true,
            text: "正在提交中，请耐心等待...",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)"
          });
          let param = {};
          param['cardType'] = this.sendCardBoxForm.cardType;
          param['isIssueCard'] = this.isIssueCard;
          param['cardPrintNum'] = this.sendCardBoxForm.cardPrintNum;
          param['accountNum'] = this.selectionList[0].accountNum;
          param['empId'] = this.selectionList[0].uid;
          await cardFunction(param,'sendCard').then(res => {
            done();
            if (res.data.code === 200) {
              this.$message.success('消费发卡成功！')
              this.onLoad(this.page);
            }
            this.sendCardClose();
            this.sendCardBoxForm.physicalCardNum = '';
            this.sendCardBoxForm.cardType = '';
          }).catch((err) => {
            loading.close();
            done();
            if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
            this.$message.warning(err)
          })
          await waterCardFunction(param,'sendCard').then(r => {
            loading.close();
            if(r == 0) this.$message.success('水电控发卡成功！');
            done();
          }).catch((err) => {
            loading.close();
            done();
            if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
            this.$message.warning(err)
          })
        }
      })
    },
    reportLoss(){
      if (this.selectionList.length === 0) {
        this.$message.warning("请选择一条数据");
        return;
      }
      this.$confirm("您确定要挂失吗?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let id = this.selectionList[0].uid
        return reportloss(id)
      }).then(() => {
        this.onLoad()
        this.$message({
          type: "success",
          message: "挂失成功!"
        });
      })
    },
    handlerLiftReportLoss(){
      if (this.selectionList.length === 0) {
        this.$message.warning("请选择至少一条数据");
        return;
      }
      this.$confirm("您确定要解挂吗?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let ids = this.selectionList.map(v => v.empId).join(',')
        return liftReportloss(ids)
      }).then(() => {
        this.onLoad()
        this.$message({
          type: "success",
          message: "解挂成功!"
        });
      })
    },
    handleDamaged(){
      if (this.selectionList.length != 1) {
        this.$message.warning("请选择一条数据");
        return;
      }
      this.$confirm("您确定要报损吗?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        let id = this.selectionList[0].uid
        return damaged(id)
      }).then(() => {
        this.onLoad()
        this.$message({
          type: "success",
          message: "报损成功!"
        });
      })
    },
    handleRecycle(){
      if (this.selectionList.length != 1) return this.$message.warning('请选择一条数据');
      let param = {};
      param['physicalCardNum'] = this.selectionList[0].physicalCardNum;
      param['accountNum'] = this.selectionList[0].accountNum;
      param['empId'] = this.selectionList[0].uid;
      this.$confirm("卡片回收之后，可再次绑定给其他人员", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        await cardFunction(param,'cleanCard').then(r => {
          if(r.data.code === 200){
            this.$message.success("消费退卡成功！");
            this.onLoad();
          }else{
            this.$message.error(r.data.msg);
          }
        }).catch((err) => {
          if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
          this.$message.warning(err)
        })
        await waterCardFunction(param,'cleanCard').then(r => {
          if(r == 0) this.$message.success('水电控退卡成功！');
        }).catch((err) => {
          if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
          this.$message.warning(err)
        })
      })
    },
    async handleEmptyCard(){
      await cardFunction({},'emptyCard').then(res => {
        this.$message.success(res)
      }).catch((err) => {
        if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
        this.$message.warning(err)
      })
      await waterCardFunction({},'emptyCard').then(r => {
        if(r == 0) this.$message.success('水电控回收卡成功！');
      }).catch((err) => {
        if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
        this.$message.warning(err)
      })
    },
    handleAbnormalRecord(){
      if (this.selectionList.length != 1) {
        this.$message.warning("请选择一条数据");
        return;
      }
      this.abnormalRecordVisible = true;
    },
    abnormalOnLoad() {
      this.abnormalLoading = true;
      this.abnormalRecordData = [];
      getOperateLogList(
        this.abnormalPage.currentPage,
        this.abnormalPage.pageSize,
        { accountId: this.selectionList[0].id }
      ).then(res => {
        let records = res.data.data.records;
        records.forEach(v => {
          v.cardState = cardStatusTrans(v.cardState);
          v.cardType = cardTypeTrans(v.cardType);
        });
        this.abnormalPage.total = res.data.data.total;
        this.abnormalRecordData = records;
        this.abnormalLoading = false;
      });
    },
    abnormalDialogOpen() {
      this.abnormalOnLoad();
    },
    handleSizeChange2(val) {
      this.abnormalPage.currentPage = 1;
      this.abnormalPage.pageSize = val;
      this.abnormalOnLoad();
    },
    handleCurrentChange2(val) {
      this.abnormalPage.currentPage = val;
      this.abnormalOnLoad();
    },
    handleExport(){
      this.$confirm("是否导出介质数据?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        window.open(`/api/iot-basic/account/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&accountStateStr=${this.accountStateStr}&accountNumStr=${this.accountNumStr}&moreParamQuery=${this.moreParamQuery}&physicalCardNum=${this.physicalCardNum}&cardState=${this.cardState}&ancestors=${this.ancestors}&size=${this.page.pageSize}&current=${this.page.currentPage}&qrcodeState=${this.qrcodeState}&wxState=${this.wxState}&empCategory=${this.empCategory}`
        );
      });
    },
    batchStartQrcode(){
      if (this.selectionList.length === 0) {
        this.$message.warning("请选择至少一条数据");
        return;
      }
      let flag = false;
      this.selectionList.forEach(v => {
        if (v.qrcodeState == (v.id+'-1')) {
          flag = true;
        }
      });
      if (flag) {
        this.$message.warning("请勾选未启用状态的动态码");
        return;
      }
      let accIds = "";
      this.selectionList.forEach((e)=>{
        accIds += e.id + ",";
      })
      accIds = accIds.substring(0,accIds.length-1)
      updateQrcodeState({"accIds":accIds,"qrcodeState":1}).then(res=>{
        this.$message.success(res.data.msg);
        this.onLoad();
      })
    },
    batchStopQrcode(){
      if (this.selectionList.length === 0) {
        this.$message.warning("请选择至少一条数据");
        return;
      }
      let flag = false;
      this.selectionList.forEach(v => {
        if (v.qrcodeState != (v.id+'-1')) {
          flag = true;
        }
      });
      if (flag) {
        this.$message.warning("请勾选启用状态的动态码");
        return;
      }
      let accIds = "";
      this.selectionList.forEach((e)=>{
        accIds += e.id + ",";
      })
      accIds = accIds.substring(0,accIds.length-1)
      updateQrcodeState({"accIds":accIds,"qrcodeState":0}).then(res=>{
        this.$message.success(res.data.msg);
        this.onLoad();
      })
    },
    qrCodeChange(val){
      let infos = val.split("-");
      let accId = infos[0] ;
      let qrcodeState = infos[1];
      updateQrcodeState({"accIds":accId,"qrcodeState":qrcodeState}).then(res=>{
        this.$message.success(res.data.msg);
      }).catch(() => {
        this.onLoad();
      })
    },
    enableNormalBtn() {
      this.isDamagedBtn = false;
      this.isSendCardBtn = false;
      this.isLiftReportLossBtn = false;
      this.isRecycleBtn = false;
      this.isReportLossBtn = false;
      this.isReplaceBtn = false;
    },
    disabledBtn() {
      this.isDamagedBtn = true;
      this.isSendCardBtn = true;
      this.isLiftReportLossBtn = true;
      this.isRecycleBtn = true;
      this.isReportLossBtn = true;
      this.isReplaceBtn = true;
    },
    search(){
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad()
    },
    onLoad(){
      let params = {}
      params["moreParamQuery"] = this.moreParamQuery.trim()
      params['accountNumStr'] = this.accountNumStr.trim()
      params['accountStateStr'] = this.accountStateStr
      params['cardState'] = this.cardState
      params['current'] = this.page.currentPage
      params['size'] = this.page.pageSize
      params['ancestors'] = this.ancestors;
      params['physicalCardNum'] = this.physicalCardNum;
      params['wxState'] = this.wxState;
      params['qrcodeState'] = this.qrcodeState;
      params['empCategory'] = this.empCategory;
      this.loading = true;
      getAccountData(params).then(r => {
        this.loading = false;
        if(r.data.code == 200){
          let d = r.data.data
          this.page.total = d.total
          d.records.forEach(v => {
            if(v.empType == 1){
              v.deptName = v.gradeName + v.className
              v.deptNo = v.classCode
            }
            v.cardState = cardStatusTrans(v.cardState);
            v.scardType = cardTypeTrans(v.cardType);
            v.wxState = v.wxState || v.wxNickName ? "已绑定" : '未绑定';
            if(v.qrcodeState == 1){
              v.qrcodeState = v.id + "-1";
            }else{
              v.qrcodeState = v.id + "-0";
            }
            v.checked = false
          })
          this.tableData = d.records;
          this.physicalCardNum="";
        }
      }).catch(() => {
        this.loading = false;
      })
    },
    searchReset(){
      this.moreParamQuery = ""
      this.accountNumStr = ""
      this.cardState = ""
      this.accountStateStr = ""
      this.physicalCardNum = ""
      this.ancestors = ""
      this.wxState = '';
      this.qrcodeState = "";
      this.empCategory = "";
      this.search()
      this.$refs.accountZtreeRef.getAccountZtreeInit();
    },
    checkboxChangeEvent({records}){
      let list = records;
      if (list.length != 1) {
        this.disabledBtn();
      } else {
        this.enableNormalBtn();
        let account = list[0];
        if (account.accountState == "1") {
          if (account.cardState == "未发卡") {
            this.isDamagedBtn = true;
            this.isSendCardBtn = false;
            this.isLiftReportLossBtn = true;
            this.isRecycleBtn = true;
            this.isReportLossBtn = true;
            this.isReplaceBtn = true;
          } else if (account.cardState == "正常") {
            this.isDamagedBtn = false;
            this.isSendCardBtn = true;
            this.isLiftReportLossBtn = true;
            this.isRecycleBtn = false;
            this.isReportLossBtn = false;
            this.isReplaceBtn = true;
          } else if (account.cardState == "报损") {
            this.isDamagedBtn = true;
            this.isSendCardBtn = true;
            this.isLiftReportLossBtn = true;
            this.isRecycleBtn = true;
            this.isReportLossBtn = true;
            this.isReplaceBtn = false;
          } else if (account.cardState == "挂失") {
            this.isDamagedBtn = true;
            this.isSendCardBtn = true;
            this.isLiftReportLossBtn = false;
            this.isRecycleBtn = true;
            this.isReportLossBtn = true;
            this.isReplaceBtn = false;
          } else if (account.cardState == "退卡") {
            this.isDamagedBtn = true;
            this.isSendCardBtn = false;
            this.isLiftReportLossBtn = true;
            this.isRecycleBtn = true;
            this.isReportLossBtn = true;
            this.isReplaceBtn = true;
          } else {
            this.disabledBtn();
          }
        } else if (account.accountState == "2") {
          this.disabledBtn();
        } else if (account.accountState == "0") {
          this.isDamagedBtn = true;
          this.isSendCardBtn = false;
          this.isLiftReportLossBtn = true;
          this.isRecycleBtn = true;
          this.isReportLossBtn = true;
          this.isReplaceBtn = true;
        }
      }
      this.selectionList = list;
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
    openPreview(url) {
      let arr = [{
        thumbUrl: url,
        url: url
      }];
      this.$ImagePreview(arr, 0);
    },
    sendCardClose(){
      this.$refs['sendCardRef'].resetForm();
      this.$refs['sendCardRef'].clearValidate();
      this.sendCardVisible = false;
    },
    ztreeClick(treeNode){
      this.ancestors = treeNode.valueStr;
      this.search()
    }
  },
  computed:{
    ...mapGetters(['permission']),
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
          ids.push(ele.id);
      });
      return ids.join(",");
    },
    sendCardOption(){
      return{
        submitBtn: true,
        emptyBtn: true,
        column: [
          {
            label: "持卡类型",
            prop: "cardType",
            span: 20,
            type: "select",
            dicData: this.cardTypeDict,
            rules: [{
              required: true,
              message: "请选择卡类型",
              trigger: "change"
            }]
          },
        ]
      }
    },
    tableColumn(){
      return[
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title:"学工号",
          field:"empCode",
          sortable: true,
          minWidth: 100,
          fixed:"left",
        },
        {
          title:"姓名",
          field:"empName",
          sortable: true,
          minWidth: 100,
          fixed:"left",
        },
        {
          title:"人员分类",
          field:'empCategoryStr',
          sortable: true,
          minWidth: 100,
        },
        {
          title:"部门/班级编号",
          field:"deptNo",
          sortable: true,
          minWidth: 120,
        },
        {
          title: "部门/班级名称",
          minWidth: 110,
          field: "deptName"
        },
        {
          title: "学校名称",
          minWidth: 110,
          field: "schoolName"
        },
        {
          title: "账户号",
          minWidth: 110,
          field: "accountNum",
          sortable: true
        },
        {
          title: "账户状态",
          minWidth: 100,
          sortable: true,
          field: "accountState",
          slots:{default:"accountState"}
        },
        {
          title: "动态码",
          minWidth: 100,
          slots:{default:"qrcodeState"},
          field: "qrcodeState",
        },
        {
          title: "卡片状态",
          minWidth: 100,
          sortable: true,
          field: "cardState",
          slots:{default:"cardState"}
        },
        {
          title: "物理卡号",
          minWidth: 100,
          sortable: true,
          field: "physicalCardNum"
        },
        {
          title: "卡序列号",
          minWidth: 100,
          sortable: true,
          field: "cardSeqNum"
        },
        {
          title: "持卡类型",
          minWidth: 100,
          sortable: true,
          field: "scardType"
        },
        {
          title: "人脸信息",
          minWidth: 100,
          sortable: true,
          slots:{default:"faceUrl"},
          field: "faceUrl"
        },
        {
          title: "微信状态",
          minWidth: 100,
          sortable: true,
          field: "wxState",
          slots:{default:"wxState"}
        },
        {
          title: "微信昵称",
          minWidth: 100,
          sortable: true,
          field: "wxNickName"
        },
        {
          title: "是否开通免签协议",
          minWidth: 160,
          sortable: true,
          field: "isVisaFree",
          visible:false,
          formatter:({ cellValue })=>{
            return cellValue == true ? '是' : "否"
          }
        },
        {
          title: "开户日期",
          minWidth: 130,
          sortable: true,
          field: "openTime"
        },
        {
          title: "停用日期",
          minWidth: 130,
          sortable: true,
          field: "stopTime"
        },
        {
          title: "操作员",
          minWidth: 100,
          sortable: true,
          field: "oprtUserName"
        },
      ]
    },
  },
};
</script>

<style lang="scss" scoped>
.right_arw_icn{
  left: 6px;
}
</style>
