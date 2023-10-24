<template>
  <el-dialog
    :title="title"
    :visible.sync="allotDialogVisible"
    width="80%"
    top="5vh"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleClose">
    <div style="padding: 10px 0 10px 20px;border-bottom: 1px solid #E8E8E8;margin-bottom: 10px;background-color: #fff;">
      <span>{{btnLable}}日期：</span>
      <el-date-picker
        style="margin-right: 10px;"
        v-model="entryTime"
        type="date"
        size="small" :clearable="false"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        placeholder="选择日期"
        :picker-options="{
          disabledDate:(time) => {
            return btnType == 'autoExchange' ? time.getTime()+24*60*60*1000 < Date.now() : ''
          }
        }">
      </el-date-picker>
      <el-button size="small" :loading="btnLoading" type="primary" @click="submit">{{btnLable}}</el-button>
    </div>
    <el-row style="padding: 0 10px;">
      <el-col :span="13">
        <el-row style="margin-right: 10px;background-color: #fff;padding: 10px 10px 0;">
          <el-col :span="7" class="ztreeStyle" style="height: 600px;">
            <gradeclass-ztree ref="gradeclassZtreeRef" v-if="dormType == 1" :isCheck="true" @onCheck="ztreeClick"></gradeclass-ztree>
            <dept-ztree ref="deptZtreeRef" v-else :isCheck="true" @onCheck="ztreeClick"></dept-ztree>
          </el-col>
          <el-col :span="17">
            <div style="margin-bottom: 8px;">
              <el-input
                size="small"
                style="width: 150px;"
                clearable
                v-if="dormType == 1"
                @keyup.enter.native="empSearch"
                v-model="moreParamQuery"
                placeholder="请输入学号/姓名">
              </el-input>
              <el-input
                size="small"
                style="width: 150px;"
                clearable
                v-else
                @keyup.enter.native="empSearch"
                v-model="moreParamQuery"
                placeholder="请输入工号/姓名">
              </el-input>
              <el-select v-model="empSex" placeholder="请选择" size="small" clearable style="width: 150px;margin: 0 10px;">
                <el-option
                  v-for="item in sexDic"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <el-button
                type="primary"
                size="small"
                icon="el-icon-search"
                @click="empSearch">
                搜索</el-button>
            </div>
            <vxe-table
              border
              auto-resize
              ref="empTableRef"
              highlight-hover-column
              highlight-current-column
              size="mini"
              height="500px"
              align="center"
              :loading="loading1"
              :data="empData"
              @checkbox-change="checkboxChangeEvent1"
              @checkbox-all="checkboxChangeEvent1">
              <vxe-table-column width="50" type='checkbox'></vxe-table-column>
              <vxe-table-column :title="dormType == 1 ? '学号' : '工号'" minWidth="70" field="empCode" :sortable="true"></vxe-table-column>
              <vxe-table-column title="姓名" minWidth="70" field="empName"></vxe-table-column>
              <vxe-table-column title="性别" minWidth="50" field="empSex" :formatter="({ cellValue })=>{
                return cellValue == 1 ? '男' : '女'
              }"></vxe-table-column>
              <vxe-table-column v-if="btnType == 'autoAllot'" title="年/班级" minWidth="80" :visible="dormType == 1 ? true : false" field="className"></vxe-table-column>
              <vxe-table-column v-if="btnType == 'autoExchange'" title="宿舍编号" minWidth="80" field="dormName"></vxe-table-column>
              <vxe-table-column v-if="btnType == 'autoExchange'" title="床号" minWidth="70" field="badNum"></vxe-table-column>
              <vxe-table-column v-if="btnType == 'autoExchange'" title="柜号" minWidth="70" field="cabinetNum"></vxe-table-column>
            </vxe-table>
            <div style="min-height: 52px;text-align: right;padding-top: 25px;">
              <el-pagination
                @size-change="handleSizeChange1"
                @current-change="handleCurrentChange1"
                :current-page="page1.currentPage"
                :page-sizes="[200, 400, 500,1000]"
                :page-size="page1.pageSize"
                :background="true"
                layout="total, sizes, prev, pager, next, jumper"
                :total="page1.total"
                :hide-on-single-page="false">
              </el-pagination>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="11" style="background-color: #fff;padding: 10px;">
        <div style="margin-bottom: 8px;">
          <avue-input-tree
            ref="tree"
            include-half-checked=""
            multiple
            v-model="ancestors2"
            placeholder="请选择楼栋"
            type="tree"
            size="small"
            class="ztreeClass"
            style="width: 180px;height: 21px;"
            :props="{value:'valueStr'}"
            :dic="floodTreeDic"></avue-input-tree>
          <el-select v-model="dormSex" placeholder="请选择宿舍类型" size="small" clearable style="width: 100px;margin: 0 10px;">
            <el-option
              v-for="item in sexDic"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-input
            size="small"
            style="width: 130px;margin-right: 10px;"
            clearable
            @keyup.enter.native="bedSearch"
            v-model="dormName"
            placeholder="请输入宿舍编号">
          </el-input>
          <el-button
            type="primary"
            size="small"
            @click="bedSearch">
            空余床位</el-button>
        </div>
        <vxe-table
          border
          auto-resize
          ref="bedTableRef"
          highlight-hover-column
          highlight-current-column
          size="mini"
          height="500px"
          align="center"
          :loading="loading2"
          :data="dormData"
          @checkbox-change="checkboxChangeEvent2"
          @checkbox-all="checkboxChangeEvent2">
          <vxe-table-column width="50" type='checkbox'></vxe-table-column>
          <vxe-table-column title="楼栋" minWidth="70" field="floorName"></vxe-table-column>
          <vxe-table-column title="楼层" minWidth="70" field="floorLayerName"></vxe-table-column>
          <vxe-table-column title="宿舍号" minWidth="50" field="dormName" :sortable="true"></vxe-table-column>
          <vxe-table-column title="床号" minWidth="80" field="badNum"></vxe-table-column>
          <vxe-table-column title="柜号" minWidth="80" field="cabinetNum"></vxe-table-column>
        </vxe-table>
        <div style="min-height: 52px;text-align: right;padding-top: 25px;">
          <el-pagination
            @size-change="handleSizeChange2"
            @current-change="handleCurrentChange2"
            :current-page="page2.currentPage"
            :page-sizes="[200, 400, 500,1000]"
            :page-size="page2.pageSize"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="page2.total"
            :hide-on-single-page="false">
          </el-pagination>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
  import moment from "moment"
  import gradeclassZtree from "@/components/gradeclass-ztree/index.vue"
  import { getDormZtree } from "@/api/dorm/dorm_mng.js";
  import { getSelectEmpList, getNoliveBed, autoAllot, autoExchange } from "@/api/dorm/dorm_checkin.js"
  import deptZtree from '@/components/dept-ztree/index.vue'

  export default{
    props:{
      dormType:{
        type:Number,
        default:1
      }
    },
    components:{ gradeclassZtree, deptZtree },
    data(){
      return{
        title:"批量分配宿舍",
        allotDialogVisible:false,
        sexDic:[
          {value:1,label:"男"},{value:2,label:"女"},{value:0,label:"其他"}
        ],
        moreParamQuery:"",
        empSex:1,
        ancestors:"",
        empData:[],
        loading1:false,
        page1:{
          pageSize:200,
          currentPage:1,
          total:0
        },
        selectionList1:[],
        dormSex:1,
        ancestors2:[],
        floodTreeDic:[],
        dormName:"",
        dormData:[],
        loading2:false,
        page2:{
          pageSize:200,
          currentPage:1,
          total:0
        },
        selectionList2:[],
        btnLable:"分配",
        btnType:"",
        btnLoading:false,
        entryTime:moment().format('YYYY-MM-DD')
      }
    },
    methods:{
      openDialog(v){
        this.allotDialogVisible = true
        this.btnType = v.btnType
        this.empSex = 1
        this.dormSex = 1
        this.entryTime = moment().format('YYYY-MM-DD')
        if(v.btnType == "autoAllot"){
          this.title = "批量分配宿舍"
          this.btnLable = "分配"
        }else{
          this.title = "批量调换宿舍"
          this.btnLable = "调换"
        }
        this.empSearch()
        this.bedSearch()
        getDormZtree({stype:'DORM'}).then(r => {
          this.floodTreeDic = r.data
        })
      },
      submit(){
        if (this.selectionList1.length == 0) {
          this.$message.warning("请选择人员");
          return;
        }
        if (this.selectionList2.length == 0) {
          this.$message.warning("请选择宿舍");
          return;
        }
        if(!this.entryTime){
          this.$message.warning('请选择日期');
          return;
        }
        this.btnLoading = true;
        if(this.btnType == "autoAllot"){
          let params = {}
          params['empIds'] = this.empIds;
          params['badIds'] = this.badIds;
          params['entryTime'] = this.entryTime;
          params['liveEmpType'] = this.dormType;
          autoAllot(params).then(r => {
            this.btnLoading = false;
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.$emit('refeshPage')
            }else{
              this.$message.error(r.data.msg)
            }
          }).catch(() => {
            this.btnLoading = false;
          })
        }else{
          let params = {}
          params["empIds"] = this.empIds;
          params['entryTime'] = this.entryTime;
          params['liveEmpType'] = this.dormType;
          let arr = []
          this.selectionList2.forEach(v => {
            arr.push({
              afterBadId:v.id,
              afterCabinetId:v.id,
              dormId:v.dormId
            })
          })
          params['bads'] = arr
          autoExchange(params).then(r => {
            this.btnLoading = false;
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.$emit('refeshPage')
            }else{
              this.$message.error(r.data.msg)
            }
          }).catch(() => {
            this.btnLoading = false;
          })
        }
      },
      empSearch(){
        this.page1.currentPage = 1
        this.initEmpData()
      },
      initEmpData(){
        let params = {}
        params['size'] = this.page1.pageSize
        params['current'] = this.page1.currentPage
        params['moreParamQuery'] = this.moreParamQuery.trim()
        params['ancestors'] = this.ancestors;
        params['empSex'] = this.empSex
        if(this.btnType == "autoAllot"){
          params['sourceType'] = 'NOUSEDORM'
        }else{
          params['sourceType'] = 'USEDORM'
        }
        params['empType'] = this.dormType;
        this.loading1 = true;
        getSelectEmpList(params).then(r => {
          this.loading1 = false
          let d = r.data.data
          this.page1.total = d.total
          this.empData = d.records;
        })
      },
      ztreeClick(ztreeObj){
        let ids = []
        ztreeObj.forEach(v => {
          if(v.valueStr.startsWith('GS-1')){
            ids.push(v.valueStr)
          }
        })
        this.ancestors = ids.join(',');
        this.empSearch()
      },
      bedSearch(){
        this.page2.currentPage = 1;
        this.initBeddata()
      },
      initBeddata(){
        let params = {}
        params['size'] = this.page2.pageSize
        params['current'] = this.page2.currentPage
        params['dormName'] = this.dormName.trim()
        params['ancestors'] = this.ancestors2.join(',');
        params['dormSex'] = this.dormSex;
        params['liveEmpType'] = this.dormType;
        params['dormType'] = this.dormType
        this.loading2 = true
        getNoliveBed(params).then(r => {
          this.loading2 = false
          let d = r.data.data
          this.page2.total = d.total
          this.dormData = d.records;
        })
      },
      handleClose(){
        this.selectionList1 = []
        this.selectionList2 = []
        this.ancestors = ""
        this.ancestors2 = []
        this.dormName = ""
        this.dormSex = 1
        this.moreParamQuery = ""
        this.$refs.empTableRef.setAllCheckboxRow(false);
        this.$refs.bedTableRef.setAllCheckboxRow(false);
        if(this.dormType == 1){
          this.$refs.gradeclassZtreeRef.getGradeclassZtreeInit();
        }else{
          this.$refs.deptZtreeRef.getDeptZtreeInit();
        }
        this.allotDialogVisible = false
      },
      checkboxChangeEvent1({records}){
        this.selectionList1 = records;
      },
      handleSizeChange1(val) {
        this.page1.currentPage = 1;
        this.page1.pageSize = val;
        this.initEmpData();
      },
      handleCurrentChange1(val) {
        this.page1.currentPage = val;
        this.initEmpData();
      },
      checkboxChangeEvent2({records}){
        this.selectionList2 = records;
      },
      handleSizeChange2(val) {
        this.page2.currentPage = 1;
        this.page2.pageSize = val;
        this.initBeddata();
      },
      handleCurrentChange2(val) {
        this.page2.currentPage = val;
        this.initBeddata();
      },
    },
    computed:{
      empIds() {
        let ids = [];
        this.selectionList1.forEach(ele => {
          ids.push(ele.id);
        });
        return ids;
      },
      badIds() {
        let ids = [];
        this.selectionList2.forEach(ele => {
          ids.push(ele.id);
        });
        return ids;
      },
    }
  }
</script>

<style scoped="scoped" lang="scss">
  /deep/.el-dialog__body{
    padding: 0;
    background-color: #E8E8E8;
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
