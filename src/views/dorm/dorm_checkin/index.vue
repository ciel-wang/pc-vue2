<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i
        :style="arrowCfgStyleCommon"
        @click="leftClick"
        v-if="arrowCfg['left'] == 4"
        :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <dorm-ztree ref="dormZtreeRef" @click="ztreeClick" :showStudentDorm="true"></dorm-ztree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i
        :style="arrowCfgStyleCommon"
        @click="rightClick"
        v-if="arrowCfg['right'] == 24"
        :class="arrowCfgClassRightName"></i>
      <div :style="{ height: ztreeHeight + 12 + 'px' }" style="margin: 0 0 0 6px;padding-bottom: 20px;">
        <!-- 搜索框部分 -->
        <div style="display: flex;align-items: center;background-color: #fff;padding: 20px 20px 0;" class="myopacity">
          <el-input
            size="small"
            style="width: 160px;margin-right: 10px;"
            clearable
            @keyup.enter.native="search"
            v-model="moreParamQuery"
            placeholder="请输入学号/姓名">
          </el-input>
          <el-input
            size="small"
            style="width: 160px;margin-right: 10px;"
            clearable
            @keyup.enter.native="search"
            v-model="dormName"
            placeholder="请输入宿舍编号">
          </el-input>
          <el-checkbox v-model="dormLiveStatus1" label="1">空房</el-checkbox>
          <el-checkbox v-model="dormLiveStatus2" label="2">已满</el-checkbox>
          <el-checkbox v-model="dormLiveStatus3" label="0">未满</el-checkbox>
          <el-checkbox-group v-model="dormSexs">
            <el-checkbox label="1">男</el-checkbox>
            <el-checkbox label="2">女</el-checkbox>
            <el-checkbox label="0">其他</el-checkbox>
          </el-checkbox-group>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-search"
            @click="search">
            搜索</el-button>
          <el-button
            type="default"
            size="small"
            icon="el-icon-refresh"
            @click="searchReset">
            重置</el-button>
        </div>
        <!-- 按钮部分 -->
        <div style="background-color: #fff;padding: 8px 20px;margin-bottom: 8px;" class="myopacity">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="$refs.autoAllotRef.openDialog({btnType:'autoAllot'})"
            v-if="permissionList.autoAllotBtn">
            批量分配</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="$refs.autoAllotRef.openDialog({btnType:'autoExchange'})"
            v-if="permissionList.autoExchangeBtn">
            批量调换</el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="$refs.autoCheckoutRef.openDialog()"
            v-if="permissionList.autoCheckoutBtn"
            >批量退宿</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-download"
            @click="handleExport"
            v-if="permissionList.exchangeBtn"
            >导出</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-upload2"
            @click="$refs.importCheckinRef.openDialog({sourceType:'dorm'})"
            v-if="permissionList.importBtn"
            >导入</el-button>
          <el-button
            type="primary"
            size="small"
            @click="$refs.accommodationDetailRef.openDialog()"
            v-if="permissionList.accommodationDetailBtn">
            住宿明细</el-button>
          <el-button
            type="primary"
            size="small"
            @click="$refs.exchangeRecordRef.openDialog()"
            v-if="permissionList.exchangeListBtn">
            调换记录</el-button>
        </div>

        <el-row style="height: calc(100% - 100px);">
          <el-col :span="18" style="height: 100%;">
            <el-row style="height: 131px;margin-bottom: 8px;margin-right: 8px;">
              <!-- 宿舍概况部分 -->
              <el-col :span="12" style="height: 100%;">
                <el-card shadow="never" style="height: 100%;">
                  <div slot="header">
                    <span class="fw600">宿舍概况</span>
                    <span style="font-size: 14px;margin: 0 6px 0 20px;">宿舍总房间数</span>
                    <span style="font-weight: 600;">{{obj.dormTotalCount}}间</span>
                  </div>
                  <div class="twoItemClass">
                    <div>
                      <div>
                        <img src="/img/kongbedmf.png" width="35px" />
                        <p class="fw600">空房</p>
                      </div>
                      <div class="p">
                        <p><span>男：</span>{{obj.manK}}间</p>
                        <p><span>女：</span>{{obj.woManK}}间</p>
                        <p><span>其他：</span>{{obj.otherK}}间</p>
                      </div>
                    </div>
                    <div>
                      <div>
                        <img src="/img/yimanbedmf.png" width="35px" />
                        <p class="fw600">已满房</p>
                      </div>
                      <div class="p">
                        <p><span>男：</span>{{obj.manM}}间</p>
                        <p><span>女：</span>{{obj.woManM}}间</p>
                        <p><span>其他：</span>{{obj.otherM}}间</p>
                      </div>
                    </div>
                    <div>
                      <div>
                        <img src="/img/weimanbedmf.png" width="35px" />
                        <p class="fw600">未满房</p>
                      </div>
                      <div class="p">
                        <p><span>男：</span>{{obj.manW}}间</p>
                        <p><span>女：</span>{{obj.woManW}}间</p>
                        <p><span>其他：</span>{{obj.otherW}}间</p>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <!-- 分配概况部分 -->
              <el-col :span="12" style="height: 100%;">
                <el-card shadow="never" style="height: 100%;margin-left: 6px;">
                  <div slot="header">
                    <span class="fw600">床位分配概况</span>
                    <span style="font-size: 14px;margin: 0 6px 0 20px;">内宿人员</span>
                    <span style="font-weight: 600;">{{obj.empInnerTotalCount}}人</span>
                  </div>
                  <div class="twoItemClass">
                    <div>
                      <div>
                        <img src="/img/kfenpei.png" />
                        <p class="fw600">可分配</p>
                      </div>
                      <div class="p">
                        <p><span>男：</span>{{obj.manKFP}}位</p>
                        <p><span>女：</span>{{obj.woManKFP}}位</p>
                        <p><span>其他：</span>{{obj.otherKFP}}位</p>
                      </div>
                    </div>
                    <div>
                      <div>
                        <img src="/img/yruzhu.png" />
                        <p class="fw600">已入住</p>
                      </div>
                      <div class="p">
                        <p><span>男：</span>{{obj.manY}}位</p>
                        <p><span>女：</span>{{obj.woManY}}位</p>
                        <p><span>其他：</span>{{obj.otherY}}位</p>
                      </div>
                    </div>
                    <div>
                      <div>
                        <img src="/img/wfenpei.png" />
                        <p class="fw600">未分配学生</p>
                      </div>
                      <div class="p">
                        <p><span>男：</span>{{obj.manCount}}人</p>
                        <p><span>女：</span>{{obj.woManCount}}人</p>
                      </div>
                    </div>

                  </div>
                </el-card>
              </el-col>
            </el-row>
            <!-- 各个宿舍住宿部分 -->
            <div id="bodyMain" ref="myScrollbar" class="myopacity">
              <div>
                <div v-for="(v,i) in currentList" :key="'currentList'+i" @click="dormItemClick(v)">
                  <img src="/img/kongbedmfman.png" v-if="v.dormSex == 1 && v.realLiveCount == 0" />
                  <img src="/img/weimanbedmfman.png" v-if="v.dormSex == 1 && (v.realLiveCount > 0 && v.diff > 0)" />
                  <img src="/img/yimanbedmfman.png" v-if="v.dormSex == 1 && v.diff == 0" />
                  <img src="/img/kongbedmfwomen.png" v-if="v.dormSex == 2 && v.realLiveCount == 0" />
                  <img src="/img/weimanbedmfwomen.png" v-if="v.dormSex == 2 && (v.realLiveCount > 0 && v.diff > 0)" />
                  <img src="/img/yimanbedmfwomen.png" v-if="v.dormSex == 2 && v.diff == 0" />
                  <img src="/img/kongbedmf.png" v-if="v.dormSex == 0 && v.realLiveCount == 0" />
                  <img src="/img/weimanbedmf.png" v-if="v.dormSex == 0 && (v.realLiveCount > 0 && v.diff > 0)" />
                  <img src="/img/yimanbedmf.png" v-if="v.dormSex == 0 && v.diff == 0" />
                  <div style="font-size: 14px;margin-left: 10px;">
                    <p style="font-size: 16px;font-weight: 600;" class="text_line_2">{{v.dormName}}</p>
                    <p>可住：{{v.badCount}}位</p>
                    <p>已住：{{v.realLiveCount}}位</p>
                    <p>剩余：{{v.diff}}位</p>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <!-- 单个宿舍详情部分 -->
          <el-col :span="6" style="height: 100%;background-color: #fff;" class="myopacity">
            <el-card shadow="never" style="height: 101%;overflow: auto;" :body-style="{height:'calc(100% - 70px)',padding:'10px'}">
              <div slot="header">
                <span style="width: 48%;overflow: hidden;display: inline-block;height: 21px;text-overflow: ellipsis;white-space: nowrap;font-weight: 600;">{{form.dormName}}</span>
                <el-button
                  type="danger"
                  :disabled="singleDormBtnDisa"
                  style="float: right; padding: 5px;"
                  @click="checkOut"
                  v-if="permissionList.checkoutBtn">退宿</el-button>
                <el-button
                  type="primary"
                  :disabled="singleDormBtnDisa"
                  style="float: right; padding: 5px;margin: 0 4px;"
                  @click="exchangeClick"
                  v-if="permissionList.exchangeBtn">调换</el-button>
                <el-button
                  type="primary"
                  :disabled="singleDormBtnDisa"
                  style="float: right; padding: 5px;"
                  @click="allotClick"
                  v-if="permissionList.allotBtn">分配</el-button>
              </div>
              <vxe-table
                border
                auto-resize
                ref="xTable"
                highlight-hover-column
                highlight-current-column
                size="mini"
                height="100%"
                align="center"
                :data="tableData"
                :menu-config="{ body: { options: menuConfig }}"
                @menu-click="contextMenuClickEvent"
                @checkbox-change="checkboxChangeEvent"
                @checkbox-all="checkboxChangeEvent">
                <vxe-table-column width="50" type='checkbox'></vxe-table-column>
                <vxe-table-column title="学号" minWidth="70" field="empCode"></vxe-table-column>
                <vxe-table-column title="姓名" minWidth="70" field="empName">
                  <template #default="{row}">
                    <div>
                      <p>{{row.empName}}</p>
                      <el-tooltip v-if="row.isAdmin" effect="dark" content="舍长" placement="top-end">
                        <i
                          class="iconfont icon-shechang"
                          style="position: absolute;top: 0;right: 0;font-size: 22px !important;"
                          :style="{ color: colorName }"></i>
                      </el-tooltip>
                    </div>
                  </template>
                </vxe-table-column>
                <vxe-table-column title="性别" minWidth="50" field="empSex" :formatter="({ cellValue })=>{
                  return cellValue == 1 ? '男' : '女'
                }"></vxe-table-column>
                <vxe-table-column title="年/班级" minWidth="100" field="className"></vxe-table-column>
                <vxe-table-column title="床号" minWidth="60" field="badNum"></vxe-table-column>
                <vxe-table-column title="柜号" minWidth="60" field="cabinetNum"></vxe-table-column>
              </vxe-table>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <!-- 退宿确认表单 -->
      <el-dialog
        title="退宿"
        :visible.sync="checkoutDialogVisible"
        width="31%"
        append-to-body
        :modal-append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="checkoutClose">
        <avue-form
          ref="checkoutFormRef"
          :option="checkoutOption"
          v-model="checkoutForm"
          @submit="checkoutSubmitBtn">
          <template slot-scope="scope" slot="menuForm">
            <el-button @click="checkoutClose" icon="el-icon-close">取消</el-button>
          </template>
          <template slot-scope="scope" slot="leaveDate">
            <el-date-picker
              v-model="checkoutForm.leaveDate"
              type="date"
              placeholder="选择退宿日期"
              format='yyyy-MM-dd'
              valueFormat='yyyy-MM-dd'>
            </el-date-picker>
            <div style="line-height: 18px;margin-top: 6px;color: #666;">退宿将会自动取消进出宿舍的权限，请谨慎操作！</div>
          </template>
        </avue-form>
      </el-dialog>

      <accommodation-detail ref="accommodationDetailRef"></accommodation-detail>
      <auto-allot ref="autoAllotRef" @refeshPage="search"></auto-allot>
      <import-checkin ref="importCheckinRef" @refeshPage="search"></import-checkin>
      <exchange-record ref="exchangeRecordRef"></exchange-record>
      <auto-checkout ref="autoCheckoutRef" @getAutoCheckoutData="getAutoCheckoutData"></auto-checkout>
      <allot-exchange ref="allotExchangeRef" @refeshPage="search" @refeshDorm="getDormDetail"></allot-exchange>
    </el-col>
  </el-row>
</template>

<script>
  import moment from 'moment'
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import dormZtree from "@/components/dorm-ztree/index.vue"
  import accommodationDetail from "./accommodation-detail.vue"
  import {getDormStatistics, getTableData, getDormDetails, dormExit, exchange, autoCheckoutData, autoCheckoutSubmit, setSuperDorm} from "@/api/dorm/dorm_checkin.js"
  import autoAllot from "./auto-allot.vue"
  import importCheckin from "./import-checkin.vue"
  import exchangeRecord from "./exchange-record.vue"
  import autoCheckout from './auto-checkout.vue'
  import allotExchange from './allot-exchange.vue'

  export default{
    components:{ dormZtree , accommodationDetail, autoAllot, importCheckin, exchangeRecord, autoCheckout, allotExchange},
    data(){
      return{
        ztreeHeight:0,
        dormName:'',
        moreParamQuery:"",
        ancestors:"",
        dormLiveStatus1:false,
        dormLiveStatus2:false,
        dormLiveStatus3:false,
        dormSexs:['1','2','0'],
        obj:{manK:0},
        page:{
          pageSize:40,
          currentPage:1,
          total:0,
          totalPage:0
        },
        currentList:[],
        tableData:[],
        form:{},
        selectionList:[],
        singleDormBtnDisa:true,
        checkoutDialogVisible:false,
        checkoutForm:{},
        menuConfig:[[{name:"设为舍长",code:'1'},{name:"取消舍长",code:"2"}]],
        btnType:""
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.search()
      document.getElementById('bodyMain').addEventListener('scroll', this.handleScroll,true)
    },
    destroyed() {
      window.removeEventListener("scroll", this.handleScroll, true);
    },
    methods:{
      contextMenuClickEvent({ menu, row}){
        let stype = menu.code == 1 ? true : false
        setSuperDorm({liveId:row.liveId,stype:stype}).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.getDormDetail()
          }else{
            this.$message.error(r.data.msg)
          }
        })
      },
      handleScroll(){
        let that = this
        let sh = that.$refs['myScrollbar'].scrollHeight // 滚动条高度
        let st = that.$refs['myScrollbar'].scrollTop // 滚动条距离顶部的距离
        let ch = that.$refs['myScrollbar'].clientHeight // 滚动条外容器的高度
        if (st + ch >= sh) {
          that.page.currentPage += 1
          if(that.page.currentPage<=that.page.totalPage){
            that.onLoad()
          }
        }
      },
      // 单个调换
      exchangeClick(){
        if (this.selectionList.length != 1) {
          this.$message.warning("请选择一条数据");
          return;
        }
        let form = this.selectionList[0]
        this.$refs.allotExchangeRef.openDialog({btnType:'exchange',form:form})
      },
      // 单个分配
      allotClick(){
        this.$refs.allotExchangeRef.openDialog({btnType:'allot',form:this.form})
      },
      // 退宿部分
      getAutoCheckoutData(val){
        this.checkoutForm = val
        this.checkoutDialogVisible = true;
        this.btnType = "autoCheckout"
      },
      checkoutSubmitBtn(form,done){
        if(this.btnType == "autoCheckout"){
          autoCheckoutSubmit(form).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg);
              this.$refs.autoCheckoutRef.autoCheckoutList()
              this.$refs.autoCheckoutRef.handleClose()
              this.checkoutClose()
              this.search()
              if(this.form.id){
                this.getDormDetail()
              }
              done()
            }else{
              this.$message.error(r.data.msg);
              done()
            }
          }).catch(() => {
            done()
          })
        }else if(this.btnType == "checkout"){
          form['dormId'] = this.form.id;
          form['empIds'] = this.ids
          dormExit(form).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg);
              this.getDormDetail()
              this.checkoutClose()
              this.search()
              done()
            }else{
              this.$message.error(r.data.msg);
              done()
            }
          }).catch(() => {
            done()
          })
        }
      },
      checkoutClose(){
        this.checkoutForm = {}
        this.$refs['checkoutFormRef'].clearValidate();
        this.$refs['checkoutFormRef'].resetForm();
        this.checkoutDialogVisible = false;
      },
      checkOut(){
        if (this.selectionList.length == 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        this.checkoutDialogVisible = true;
        this.btnType = "checkout"
        this.checkoutForm.leaveDate = moment().format('yyyy-MM-DD');
      },
      dormItemClick(val){
        this.singleDormBtnDisa = false
        this.form = val
        this.getDormDetail()
      },
      getDormDetail(){
        this.selectionList = []
        let id = this.form.id ? this.form.id : ''
        getDormDetails({dormId:id}).then(r => {
          this.tableData = r.data.data;
        })
      },
      onLoad(){
        let params = {}
        params['size'] = this.page.pageSize
        params['current'] = this.page.currentPage
        params['ancestors'] = this.ancestors;
        params['dormName'] = this.dormName.trim()
        params['moreParamQuery'] = this.moreParamQuery.trim();
        params['dormSexs'] = this.dormSexs.join(',')
        params['dormLiveStatus1'] = this.dormLiveStatus1 == true ? 1 : 0
        params['dormLiveStatus2'] = this.dormLiveStatus2 == true ? 1 : 0
        params['dormLiveStatus3'] = this.dormLiveStatus3 == true ? 1 : 0
        params['dormType'] = 1
        getTableData(params).then(r => {
          let d = r.data.data;
          this.page.total = d.total
          this.page.totalPage = d.pages;
          d.records.forEach(v => {
            v.diff = v.badCount - v.realLiveCount
          })
          this.currentList = [...this.currentList,...d.records];
        })
      },
      search(){
        this.page.currentPage = 1
        this.currentList = []
        this.onLoad()
        getDormStatistics({dormType:1}).then(r => {
          this.obj = {...r.data.data.dormStatistics,...r.data.data.liveEmpStatistics,...r.data.data.basicData}
        })
      },
      searchReset(){
        this.ancestors = ""
        this.dormName = ""
        this.moreParamQuery = ""
        this.dormSexs = ['1','2']
        this.dormLiveStatus1 = false
        this.dormLiveStatus2 = false
        this.dormLiveStatus3 = false
        this.search()
        this.$refs.dormZtreeRef.getDormZtreeInit();
      },
      ztreeClick(val){
        this.ancestors = val.valueStr
        this.search()
      },
      checkboxChangeEvent({records}){
        this.selectionList = records;
      },
      handleExport(){
        this.$confirm("是否导出宿舍管理信息?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let dormLiveStatus1 = this.dormLiveStatus1 == true ? 1 : 0
          let dormLiveStatus2 = this.dormLiveStatus2 == true ? 1 : 0
          let dormLiveStatus3 = this.dormLiveStatus3 == true ? 1 : 0
          window.open(
            `/api/iot-dorm/dorm/mnglist/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&dormName=${this.dormName.trim()}&ancestors=${this.ancestors}&dormLiveStatus1=${dormLiveStatus1}&dormLiveStatus2=${dormLiveStatus2}&dormLiveStatus3=${dormLiveStatus3}&dormSexs=${this.dormSexs.join(',')}&moreParamQuery=${this.moreParamQuery.trim()}&dormType=1`
          );
        });
      }
    },
    computed:{
      ...mapGetters(['permission', 'btnicon', 'colorName']),
      permissionList() {
        return {
          autoAllotBtn: this.vaildData(this.permission.dorm_dormlive_batch_allot_btn, false),
          autoExchangeBtn: this.vaildData(this.permission.dorm_dormlive_batch_exchange_btn, false),
          autoCheckoutBtn: this.vaildData(this.permission.dorm_dormlive_batch_exit_btn, false),
          exportBtn: this.vaildData(this.permission.dorm_dormlive_export_btn, false),
          importBtn: this.vaildData(this.permission.dorm_dormlive_import_btn, false),
          accommodationDetailBtn: this.vaildData(this.permission.dorm_dormlive_details_list_btn, false),
          exchangeListBtn: this.vaildData(this.permission.dorm_dormlive_exchange_list_btn, false),
          allotBtn: this.vaildData(this.permission.dorm_dormlive_allot_btn, false),
          exchangeBtn: this.vaildData(this.permission.dorm_dormlive_exchange_btn, false),
          checkoutBtn: this.vaildData(this.permission.dorm_dormlive_exit_btn, false),
        };
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      checkoutOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"退宿日期",
              prop:"leaveDate",
              span:24,
              rules:[{
                required:true,
                message:"请选择退宿日期",
                trigger:"change"
              }],
              formslot: true,
            },
          ]
        }
      },
    }
  }
</script>

<style scoped="scoped" lang="scss">
/deep/.basic-container__card{
  height: 100% !important;
}
/deep/.el-checkbox__label{
  padding-left: 6px;
}
/deep/.el-checkbox{
  margin-right: 15px !important;
}
p{
  margin: 0 !important;
}
.twoItemClass{
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  &>div{
    display: flex;
    i{
      font-size: 26px;
    }
    .p{
      text-align: left;margin-left: 8px;font-size: 14px;
      span{
        display: inline-block;width: 42px;text-align: right;
      }
    }
  }
}
#bodyMain{
  background-color: #fff;margin-right: 8px;height: calc(100% - 131px);overflow: auto;
  &>div{
    display: flex;flex-wrap: wrap;padding: 10px 0 10px 20px;
    &>div{
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid #e8e8e8;
      min-width: 15%;
      width: 15%;
      margin: 8px 0.6% 8px 0;
      padding: 4px;
      img{
        width: 40%;
        max-width: 60px;
      }
    }
  }
}
.fw600{
  font-weight: 600;
}
</style>
