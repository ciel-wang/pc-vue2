<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i
        :style="arrowCfgStyleCommon"
        @click="leftClick"
        v-if="arrowCfg['left'] == 4"
        :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <dorm-ztree ref="dormZtreeRef" @click="ztreeClick" :showApartment="true"></dorm-ztree>
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
            style="width: 160px;"
            clearable
            @keyup.enter.native="search"
            v-model="moreParamQuery"
            placeholder="请输入工号/姓名">
          </el-input>
          <el-input
            size="small"
            style="width: 250px;margin-left: 10px;"
            clearable
            @keyup.enter.native="search"
            v-model="visitorQuery"
            placeholder="请输入访客姓名/手机号码/身份证号">
          </el-input>
          <el-input
            size="small"
            style="width: 160px;margin: 0 10px;"
            clearable
            @keyup.enter.native="search"
            v-model="dormName"
            placeholder="请输入宿舍编号">
          </el-input>
          <el-select size="small" clearable v-model="dormLiveStatus" placeholder="请选择房间状态" class="ztreeClass" style="width: 160px;height:32px;">
            <el-option
              v-for="item in dormLiveStatusDic"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select size="small" clearable v-model="dormSexs" multiple placeholder="请选择房间类型" class="ztreeClass" style="width: 160px;margin: 0 10px;height: 32px;">
            <el-option
              v-for="item in dormSexsDic"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select size="small" clearable v-model="costTypes" multiple placeholder="请选择收费类型" class="ztreeClass" style="width: 160px;margin-right: 10px;height: 32px;">
            <el-option
              v-for="item in costTypeDic"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
            @click="$refs.accommodationDetailRef.openDialog()"
            v-if="permissionList.accommodationDetailBtn">
            住宿明细</el-button>
          <el-button
            type="primary"
            size="small"
            @click="$refs.exchangeRecordRef.openDialog()"
            v-if="permissionList.exchangeListBtn">
            调换记录</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-upload2"
            @click="$refs.importCheckinRef.openDialog({sourceType:'apartment'})"
            v-if="permissionList.importBtn"
            >导入</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-download"
            @click="handleExport"
            style="margin-right: 10px;"
            v-if="permissionList.exportBtn"
            >导出</el-button>
          <!-- <el-dropdown @command="handleMore">
            <el-button size="small" type="primary">
              更多<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="auto_allot">
                批量分配</el-dropdown-item>
              <el-dropdown-item command="auto_exchange">
                批量调换</el-dropdown-item>
              <el-dropdown-item command="auto_checkout">
                批量退宿</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> -->
        </div>

        <el-row style="height: calc(100% - 100px);">
          <el-col :span="18" style="height: 100%;">
            <el-row style="height: 131px;margin-bottom: 8px;margin-right: 8px;">
              <!-- 宿舍概况部分 -->
              <el-col :span="16" style="height: 100%;">
                <el-card shadow="never" style="height: 100%;">
                  <div slot="header" class="flexAround">
                    <div style="width: 48%;">
                      <span class="fw600">免费房间</span>
                      <span style="font-size: 14px;margin: 0 6px 0 20px;">已住/总数</span>
                    </div>
                    <div style="width: 52%;">
                      <span class="fw600">收费房间</span>
                      <span style="font-size: 14px;margin: 0 6px 0 20px;">已住/总数</span>
                    </div>
                  </div>
                  <div class="leftTop flexAround">
                    <div class="flexAround width23">
                      <div style="text-align: center;margin-right: 6px;">
                        <img src="/img/kongbedmf.png" width="35px" />
                        <p class="fw600">床位</p>
                      </div>
                      <div class="spanRight">
                        <p><span>男：</span>{{obj.mfManTotalBadRealCount}}/{{obj.mfManTotalBadCount}}位</p>
                        <p><span>女：</span>{{obj.mfWoManTotalBadRealCount}}/{{obj.mfWoManTotalBadCount}}位</p>
                        <p><span>其他：</span>{{obj.mfQtTotalBadRealCount}}/{{obj.mfQtTotalBadCount}}位</p>
                      </div>
                    </div>
                    <div class="flexAround width23" style="border-right: 1px solid #e8e8e8;">
                      <div style="text-align: center;margin-right: 6px;">
                        <img src="/img/kongdoormmf.png" width="35px" />
                        <p class="fw600">房间</p>
                      </div>
                      <div class="spanRight">
                        <p><span>男：</span>{{obj.mfManTotalRoomRealCount}}/{{obj.mfManTotalRoomCount}}间</p>
                        <p><span>女：</span>{{obj.mfWoManTotalRoomRealCount}}/{{obj.mfWoManTotalRoomCount}}间</p>
                        <p><span>其他：</span>{{obj.mfQtTotalRoomRealCount}}/{{obj.mfQtTotalRoomCount}}间</p>
                      </div>
                    </div>
                    <div class="flexAround width27">
                      <div style="text-align: center;margin-right: 6px;">
                        <img src="/img/kongbedsf.png" width="35px" />
                        <p class="fw600">按床位收费</p>
                      </div>
                      <div class="spanRight">
                        <p><span>男：</span>{{obj.sManTotalRealCount}}/{{obj.sManTotalBadCount}}位</p>
                        <p><span>女：</span>{{obj.sWoManTotalRealCount}}/{{obj.sWoManTotalBadCount}}位</p>
                        <p><span>其他：</span>{{obj.sQtTotalRealCount}}/{{obj.sQtTotalBadCount}}位</p>
                      </div>
                    </div>
                    <div class="flexAround width27">
                      <div style="text-align: center;margin-right: 6px;">
                        <img src="/img/kongdoormsf.png" width="35px" />
                        <p class="fw600">按房间收费</p>
                      </div>
                      <div class="spanRight">
                        <p><span>男：</span>{{obj.gManTotalRoomRealCount}}/{{obj.gManTotalRoomCount}}间</p>
                        <p><span>女：</span>{{obj.gWoManTotalRoomRealCount}}/{{obj.gWoManTotalRoomCount}}间</p>
                        <p><span>其他：</span>{{obj.gQtTotalRoomRealCount}}/{{obj.gQtTotalRoomCount}}间</p>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <!-- 分配概况部分 -->
              <el-col :span="8" style="height: 100%;">
                <el-card shadow="never" style="height: 100%;margin-left: 6px;" :body-style="{padding:0,height:'74%'}">
                  <div slot="header">
                    <span class="fw600">入住概况</span>
                  </div>
                  <div class="leftTop flexAround">
                    <div class="flexAround">
                      <div style="text-align: center;margin-right: 6px;">
                        <i class="iconfont icon-neiburenyuan" style="font-size: 35px;color: #437dff;"></i>
                        <p class="fw600">内部人员</p>
                      </div>
                      <div class="spanRight">
                        <p><span>男：</span>{{obj.manLiveTotal}}人</p>
                        <p><span>女：</span>{{obj.woManLiveTotal}}人</p>
                        <p><span>合计：</span>{{obj.manLiveTotal + obj.woManLiveTotal}}人</p>
                      </div>
                    </div>
                    <div class="flexAround">
                      <div style="text-align: center;margin-right: 6px;">
                        <i class="iconfont icon-wailaifangke" style="font-size: 35px;color: #437dff;"></i>
                        <p class="fw600">外来访客</p>
                      </div>
                      <div class="spanRight">
                        <p><span>男：</span>{{obj.fkManLiveTotal}}人</p>
                        <p><span>女：</span>{{obj.fkWoManLiveTotal}}人</p>
                        <p><span>合计：</span>{{obj.fkManLiveTotal + obj.fkWoManLiveTotal}}人</p>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <!-- 各个宿舍住宿部分 -->
            <div id="bodyMain" ref="myScrollbar" class="myopacity">
              <div>
                <div v-for="(v,i) in currentList" :key="i" @click="dormItemClick(v)">
                  <img :src="v.img" />
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
          <el-col :span="6" style="height: 101%;background-color: #fff;" class="myopacity">
            <el-card shadow="never" style="height: 100%;overflow: auto;" :body-style="{height:'calc(100% - 70px)',padding:'10px'}">
              <div slot="header">
                <span style="width: 48%;overflow: hidden;display: inline-block;height: 21px;text-overflow: ellipsis;white-space: nowrap;font-weight: 600;">{{form.dormName}}</span>
                <el-button
                  type="danger"
                  :disabled="singleDormBtnDisa"
                  style="float: right; padding: 5px;"
                  v-if="permissionList.checkoutBtn"
                  @click="checkOutClick">退宿</el-button>
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
              <el-collapse class="collapse" v-model="activeNames" @change="handleChange" style="height: 100%;">
                <el-collapse-item title="内部人员" name="1">
                  <vxe-table
                    border
                    auto-resize
                    ref="xTable"
                    highlight-hover-column
                    highlight-current-column
                    size="mini"
                    height="100%"
                    align="center"
                    :data="empData"
                    @checkbox-change="checkboxChangeEvent"
                    @checkbox-all="checkboxChangeEvent">
                    <vxe-table-column width="50" type='checkbox'></vxe-table-column>
                    <vxe-table-column title="工号" minWidth="90" field="empCode"></vxe-table-column>
                    <vxe-table-column title="姓名" minWidth="70" field="empName"></vxe-table-column>
                    <vxe-table-column title="性别" minWidth="50" field="empSex" :formatter="({ cellValue })=>{
                      return cellValue == 1 ? '男' : '女'
                    }"></vxe-table-column>
                    <vxe-table-column title="部门名称" minWidth="100" field="deptName"></vxe-table-column>
                    <vxe-table-column title="床号" minWidth="60" field="badNum"></vxe-table-column>
                    <vxe-table-column title="柜号" minWidth="60" field="cabinetNum"></vxe-table-column>
                  </vxe-table>
                </el-collapse-item>

                <el-collapse-item title="外来访客" name="2">
                  <vxe-table
                    border
                    auto-resize
                    ref="xTable2"
                    highlight-hover-column
                    highlight-current-column
                    size="mini"
                    height="100%"
                    align="center"
                    :data="visitorData"
                    :menu-config="{ body: { options: menuConfig }}"
                    @menu-click="contextMenuClickEvent"
                    @checkbox-change="checkboxChangeEvent"
                    @checkbox-all="checkboxChangeEvent">
                    <vxe-table-column width="40" type='checkbox'></vxe-table-column>
                    <vxe-table-column title="姓名" minWidth="70" field="vidisotName"></vxe-table-column>
                    <vxe-table-column title="性别" width="50" field="visitorSex" :formatter="({ cellValue })=>{
                      return cellValue == 1 ? '男' : '女'
                    }"></vxe-table-column>
                    <vxe-table-column title="身份证号" minWidth="140" field="visitorIdCardNo"></vxe-table-column>
                    <vxe-table-column title="联系方式" minWidth="100" field="visitorPhone"></vxe-table-column>
                    <vxe-table-column title="床号" width="50" field="badNum"></vxe-table-column>
                    <vxe-table-column title="柜号" width="50" field="cabinetNum"></vxe-table-column>
                  </vxe-table>
                </el-collapse-item>
              </el-collapse>

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
          @submit="checkoutSubmitBtn"
          @error="error">
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
      <auto-allot ref="autoAllotRef" @refeshPage="search" :dormType="2"></auto-allot>
      <import-checkin ref="importCheckinRef" @refeshPage="search"></import-checkin>
      <exchange-record ref="exchangeRecordRef"></exchange-record>
			<auto-checkout ref="autoCheckoutRef" @getAutoCheckoutData="getAutoCheckoutData" :dormType="2"></auto-checkout>
      <single-allot ref="singleAllotRef" @refeshPage="search" @refeshDorm="getDormDetail" :dormType="2"></single-allot>
      <single-exchange ref="singleExchangeRef" @refeshPage="search" @refeshDorm="getDormDetail"></single-exchange>
      <apartment-account ref="apartmentAccountRef" @refeshPage="search" @refeshDorm="getDormDetail"></apartment-account>
    </el-col>
  </el-row>
</template>

<script>
  import moment from 'moment'
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import dormZtree from "@/components/dorm-ztree/index.vue"
  import autoAllot from "../dorm_checkin/auto-allot.vue"
  import accommodationDetail from "./accommodation-detail.vue"
  import importCheckin from "../dorm_checkin/import-checkin.vue"
  import exchangeRecord from "./exchange-record.vue"
  import { getTableData, getDormDetails, dormExit, autoCheckoutData, autoCheckoutSubmit} from "@/api/dorm/dorm_checkin.js"
	import autoCheckout from '../dorm_checkin/auto-checkout.vue'
  import singleAllot from './single-allot.vue'
  import singleExchange from './single-exchange.vue'
  import { apartmentCheckout, getDormVisitorData, getApartmentStatistics, getExitDetalisList, mjauthDown } from '@/api/dorm/apartment_manage.js'
  import apartmentAccount from './apartment-account.vue'

  export default{
    components:{ dormZtree, accommodationDetail, importCheckin, exchangeRecord, autoCheckout, singleAllot, autoAllot, singleExchange, apartmentAccount },
    data(){
      return{
        ztreeHeight:0,
        dormName:'',
        moreParamQuery:"",
        ancestors:"",
        dormLiveStatusDic:[
          {value:3,label:'未满'},{value:1,label:"空房"},{value:2,label:"已满"}
        ],
        dormLiveStatus:'',
        dormSexsDic:[
          {value:0,label:'其他'},{value:1,label:"男"},{value:2,label:"女"}
        ],
        dormSexs:[],
        costTypeDic:[
          {value:0,label:'免费'},{value:1,label:"按床位"},{value:2,label:"按房间"}
        ],
        costTypes:[],
        obj:{},
        page:{
          pageSize:40,
          currentPage:1,
          total:0,
          totalPage:0
        },
        currentList:[],
        empData:[],
        visitorData:[],
        form:{},
        selectionList:[],
        singleDormBtnDisa:true,
        checkoutDialogVisible:false,
        checkoutForm:{},
        activeNames:['1','2'],
        menuConfig:[[{name:"增加权限",code:'1'}]],
        visitorQuery:""
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
      contextMenuClickEvent({ menu, row, column }){
        mjauthDown({liveId:row.liveId}).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
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
      // 更多下拉菜单里的批量按钮操作
      handleMore(val){
        if(val == 'auto_allot'){
          this.$refs.autoAllotRef.openDialog({btnType:'autoAllot'})
        }else if(val == 'auto_exchange'){
          this.$refs.autoAllotRef.openDialog({btnType:'autoExchange'})
        }else if(val == 'auto_checkout'){
          this.$refs.autoCheckoutRef.autoCheckoutVisible = true
          this.$refs.autoCheckoutRef.autoCheckoutList()
        }
      },
      // 单个调换
      exchangeClick(){
        if (this.selectionList.length != 1) {
          this.$message.warning("请选择一条数据");
          return;
        }
        let form = this.selectionList[0]
        form['costType'] = this.form.costType
        this.$refs.singleExchangeRef.openDialog(form)
      },
      // 单个分配
      allotClick(){
        this.$refs.singleAllotRef.openDialog({btnType:'allot',form:this.form})
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
              this.checkoutClose()
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
      checkOutClick(){
        if (this.selectionList.length == 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        let liveId = this.selectionList[0].liveId
        getExitDetalisList({liveId:liveId}).then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            this.$refs.apartmentAccountRef.openDialog(d,liveId)
          }
        })
      },
      dormItemClick(val){
        this.singleDormBtnDisa = false
        this.form = val
        this.getDormDetail()
      },
      getDormDetail(){
        this.selectionList = []
        getDormDetails({dormId:this.form.id}).then(r => {
          this.empData = r.data.data;
        })
        getDormVisitorData({dormId:this.form.id}).then(r => {
          this.visitorData = r.data.data;
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
        params['costTypes'] = this.costTypes.join(',');
        params['dormVisitorName'] = this.visitorQuery.trim()
        params['dormLiveStatus1'] = this.dormLiveStatus == 1 ? 1 : 0
        params['dormLiveStatus2'] = this.dormLiveStatus == 2 ? 1 : 0
        params['dormLiveStatus3'] = this.dormLiveStatus == 3 ? 1 : 0
        params['dormType'] = 2
        getTableData(params).then(r => {
          let d = r.data.data;
          this.page.total = d.total
          this.page.totalPage = d.pages;
          d.records.forEach(v => {
            v.diff = v.badCount - v.realLiveCount
            if(v.dormSex == 0){
              if(v.costType == 0){
                v.img = v.realLiveCount == 0 ? "/img/kongbedmf.png" : v.diff == 0 ? '/img/yimanbedmf.png' :'/img/weimanbedmf.png'
              }else if(v.costType == 1){
                v.img = v.realLiveCount == 0 ? "/img/kongbedsf.png" : v.diff == 0 ? '/img/yimanbedsf.png' :'/img/weimanbedsf.png'
              }else{
                v.img = v.realLiveCount == 0 ? "/img/kongdoormsf.png" : v.diff == 0 ? '/img/yimandoormsf.png' :'/img/weimandoormsf.png'
              }
            }else if(v.dormSex == 1){
              if(v.costType == 0){
                v.img = v.realLiveCount == 0 ? "/img/kongbedmfman.png" : v.diff == 0 ? '/img/yimanbedmfman.png' :'/img/weimanbedmfman.png'
              }else if(v.costType == 1){
                v.img = v.realLiveCount == 0 ? "/img/kongbedsfman.png" : v.diff == 0 ? '/img/yimanbedsfman.png' :'/img/weimanbedsfman.png'
              }else{
                v.img = v.realLiveCount == 0 ? "/img/kongdoormsfman.png" : v.diff == 0 ? '/img/yimandoormsfman.png' :'/img/weimandoormsfman.png'
              }
            }else{
              if(v.costType == 0){
                v.img = v.realLiveCount == 0 ? "/img/kongbedmfwomen.png" : v.diff == 0 ? '/img/yimanbedmfwomen.png' :'/img/weimanbedmfwomen.png'
              }else if(v.costType == 1){
                v.img = v.realLiveCount == 0 ? "/img/kongbedsfwomen.png" : v.diff == 0 ? '/img/yimanbedsfwomen.png' :'/img/weimanbedsfwomen.png'
              }else{
                v.img = v.realLiveCount == 0 ? "/img/kongdoormsfwomen.png" : v.diff == 0 ? '/img/yimandoormsfwomen.png' :'/img/weimandoormsfwomen.png'
              }
            }
          })
          this.currentList = [...this.currentList,...d.records];
        })
        getApartmentStatistics().then(r => {
          let d = r.data.data;
          this.obj = {...d.liveInfo,...d.mfRoomInfo,...d.sfRoomInfo}
        })
      },
      search(){
        this.page.currentPage = 1
        this.currentList = []
        this.onLoad()
      },
      searchReset(){
        this.ancestors = ""
        this.dormName = ""
        this.moreParamQuery = ""
        this.dormSexs = []
        this.dormLiveStatus = ''
        this.costTypes = []
        this.visitorQuery = ""
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
      checkboxChangeEvent2({records}){
        this.selectionList2 = records;
      },
      handleExport(){
        this.$confirm("是否导出公寓管理信息?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          let dormLiveStatus1 = this.dormLiveStatus == 1 ? 1 : ''
          let dormLiveStatus2 = this.dormLiveStatus == 2 ? 1 : ''
          let dormLiveStatus3 = this.dormLiveStatus == 3 ? 1 : ''
          window.open(
            `/api/iot-dorm/dorm/mnglist/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&dormName=${this.dormName.trim()}&dormSexs=${this.dormSexs.join(',')}&moreParamQuery=${this.moreParamQuery.trim()}&dormType=2&dormLiveStatus1=${dormLiveStatus1}&dormLiveStatus2=${dormLiveStatus2}&dormLiveStatus3=${dormLiveStatus3}`
          );
        });
      }
    },
    computed:{
      ...mapGetters(['permission']),
      permissionList() {
        return {
          accommodationDetailBtn: this.vaildData(this.permission.dorm_appartment_details_list_btn, false),
          exchangeListBtn: this.vaildData(this.permission.dorm_appartment_exchange_list_btn, false),
          importBtn: this.vaildData(this.permission.dorm_appartment_import, false),
          exportBtn: this.vaildData(this.permission.dorm_appartment_export, false),
          allotBtn: this.vaildData(this.permission.dorm_appartment_allot_btn, false),
          exchangeBtn: this.vaildData(this.permission.dorm_appartment_exchange_btn, false),
          checkoutBtn: this.vaildData(this.permission.dorm_appartment_exit_btn, false),
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
      allotOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"姓名",
              prop:"empName",
              span:24,
              rules:[{
                required:true,
                message:"请选择姓名",
                trigger:"blur"
              }],
              formslot: true,
            },
            {
              label:"宿舍",
              prop:'dormId',
              type:"tree",
              span:24,
              dicData:this.dormIdDic,
              rules:[{
                required:true,
                message:"请选择宿舍",
                trigger:"change"
              }],
              display:this.exchangeBtn,
              nodeClick:(data, node,ref)=>{
                let that = this;
                if(data.valueStr.startsWith('DORM')){
                  that.getBedContainer({id:data.value})
                }else{
                  that.$message.error('请选择到宿舍')
                  that.allotForm.dormId = ""
                }
              }
            },
            {
              label:"床号",
              prop:"badId",
              type:"select",
              span:24,
              rules:[{
                required:true,
                message:"请选择床号",
                trigger:"change"
              }],
              dicData:this.bedIdDic
            },
            {
              label:"柜号",
              prop:"cabinetId",
              span:24,
              type:"select",
              rules:[{
                required:true,
                message:"请选择柜号",
                trigger:"change"
              }],
              dicData:this.containerIdDic
            },
            {
              label:this.dateLabel,
              prop:"time",
              span:24,
              type:'date',
              rules:[{
                required:true,
                message:"请选择"+this.dateLabel,
                trigger:"change"
              }],
              format:'yyyy-MM-dd',
              valueFormat:'yyyy-MM-dd',
            },
            {
              label:'备注',
              prop:'remark',
              span:24,
              maxRows:6,
              minRows:4,
              type:"textarea"
            }
          ]
        }
      }
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
.collapse /deep/.el-collapse-item__content{
  min-height: 240px;
  height: 240px;
}
/deep/.el-collapse{
  border: none;
}
/deep/.el-collapse-item__wrap{
  border-bottom: none;
}
p{
  margin: 0 !important;
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
      width: 15%;
      min-width: 15%;
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
.leftTop{
  font-size: 14px;
  align-items: center;
  height: 100%;
  .width27{
    width: 27%;
    justify-content: center;
  }
  .width23{
    width: 23%;
    justify-content: center;
  }
}
.spanRight{
  p>span{
    display: inline-block;
    width: 42px;
    text-align: right;
  }
}
.ztreeClass{
    height: 21px;
    /deep/.el-input--small /deep/.el-input__inner{
      height: 32px !important;
    }
    /deep/.el-select__tags{
      height: 100%;
      overflow: hidden;
    }
  }
</style>
