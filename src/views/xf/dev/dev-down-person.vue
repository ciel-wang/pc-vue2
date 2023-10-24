<template>
  <el-row style="position: relative;border: 8px solid #eee;">
    <el-col :span="17">
      <el-row>
        <el-col :span="7">
          <div style="height:682px;overflow:auto;padding: 15px 0 15px 15px;border: 1px solid #eee;margin: 8px;">
            <account-ztree ref="accountZtreeRef" :isCheck="true" @onCheck="onCheck"></account-ztree>
          </div>
        </el-col>

        <el-col :span="17">
          <div style="padding: 15px;">
            <div class="mbottom8">
              <el-input
                size="small" clearable
                v-model.trim="moreQueryParam"
                placeholder="请输入学工号/姓名"
                style="width:160px;margin-right: 10px;"
                @keyup.enter.native="search"></el-input>
              <el-select v-model="filterType" placeholder="请选择" size="small" clearable style="width: 120px;margin-right: 10px;">
                <el-option v-for="item in filterTypeDic" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-button type="primary" icon="el-icon-search" size="small" @click="search">搜索</el-button>
              <el-button type="primary" size="small" @click="handleQuerySearch">粘贴查询</el-button>
            </div>
            <vxe-table
              border
              resizable
              ref="plTable"
              highlight-hover-row
              keepSource
              size="mini"
              height="581"
              :loading="empLoading"
              :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
              align="center"
              @checkbox-change="selectionChange"
              @checkbox-all="selectionChange"
              :data="empData">
              <vxe-table-column type="checkbox" title="" width="50" fixed="left"></vxe-table-column>
              <vxe-table-column type="seq" title="序号" width="60" fixed="left"></vxe-table-column>
              <vxe-table-column title="学工号" minwidth="110" field="empCode" fixed="left"></vxe-table-column>
              <vxe-table-column title="姓名" minwidth="140" field="empName" fixed="left"></vxe-table-column>
              <vxe-table-column title="部门名称" minwidth="140" field="deptName"></vxe-table-column>
              <vxe-table-column title="学校名称" minwidth="140" field="schoolName"></vxe-table-column>
              <vxe-table-column title="智能卡" minwidth="100" field="physicalCardNum"></vxe-table-column>
              <vxe-table-column title="人脸" minwidth="110" field="faceUrl">
                <template #default="{ row }">
                  <img
                    width="20px"
                    height="20px"
                    v-if="isImg(row.faceUrl)"
                    :src="row.faceUrl+'?'+new Date().getTime()"
                    @click="openPreview(row.faceUrl+'?'+new Date().getTime())" />
                </template>
              </vxe-table-column>
            </vxe-table>
            <div class="page_class">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="page.currentPage"
                :page-sizes="[100,500,1000]"
                :page-size="page.pageSize"
                :background="true"
                :pager-count="5"
                layout="total, sizes, prev, pager, next"
                :total="page.total"
                :hide-on-single-page="false">
              </el-pagination>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-col>

    <el-col :span="7" style="border-left: 8px solid #eee;height: 746px;margin-bottom: 0;padding: 15px;">
      <div style="display: flex;margin-bottom: 15px;">
        <span>权限设置：</span>
        <el-radio-group v-model="radio" style="margin-left:15px">
            <el-radio :label="0">修改权限</el-radio>
            <el-tooltip class="item" effect="dark" content="删除设备人员资料" placement="top">
              <el-radio :label="3">删除权限</el-radio>
            </el-tooltip>
        </el-radio-group>
      </div>
      <div style="display: flex;margin-bottom: 15px;" v-show="radio != 3">
        <span>权限类型：</span>
        <el-checkbox-group v-model="checkList" style="margin-left: 15px;">
          <el-checkbox label="人脸"></el-checkbox>
          <el-checkbox label="卡"></el-checkbox>
        </el-checkbox-group>
      </div>
      <div>
        <span>有效期：</span>
        <el-tooltip class="item" effect="dark" content="有效期" placement="top">
          <el-date-picker
            style="margin-left:15px;width:150px"
            v-model="vaildDate"
            type="date"
            value-format="yyyy-MM-dd"
            size="mini"
            placeholder="选择日期"></el-date-picker>
        </el-tooltip>
      </div>
      <div style="text-align: center;margin-top: 30px;">
        <el-button type="primary" size="small" icon="el-icon-check" :disabled="sbtnDisabled" @click="handleSubmit">{{ sbtnText }}</el-button>
      </div>

      <div class="tips">
        <p>备注：</p>
        <p>当勾选对应权限类型，修改权限为“增加权限”，反之为“取消权限”；</p>
        <p>删除权限指将对应设备的人员信息删除；</p>
      </div>

      <pasteSearch ref="pasteSearchRef" @getQuery="getQuery"></pasteSearch>
    </el-col>
  </el-row>
</template>

<script>
import { getEventEmpList, faceSellerPersonDown } from "@/api/xf/event";
import accountZtree from "@/components/account-ztree/index.vue"
import pasteSearch from '@/components/paste-search.vue'
import { isImg } from '@/util/validate.js'

export default {
  name: "emp-select",
  components: { accountZtree, pasteSearch },
  props: {
    devIds: {
      type: String
    }
  },
  data() {
    return {
      checkList: [],
      sbtnDisabled: false,
      sbtnText: "提交",
      moreQueryParam: "",
      currRows: [],
      vaildDate: "2099-12-31",
      empLoading: false,
      radio: 0,
      ids: "",
      empData: [],
      page: {
        pageSize: 100,
        pageSizes: [100],
        currentPage: 1,
        total: 0
      },
      filterType: '',
      filterTypeDic: [
        { value: 'card', label: '仅卡' },
        { value: 'face', label: '仅脸' },
        { value: 'cardOrface', label: '卡或脸' },
        { value: 'cardAndface', label: '卡和脸' },
      ],
      queryFieldContent:"",
      queryFieldType:"",
    };
  },
  methods: {
    isImg,
    handleQuerySearch(){
      this.$refs.pasteSearchRef.openDialog();
    },
    getQuery(queryFieldType,queryFieldContent){
      this.queryFieldContent = queryFieldContent;
      this.queryFieldType = queryFieldType;
      this.search();
    },
    handleSubmit() {
      if(this.currRows.length == 0) return this.$message.error("请先选择至少一条数据");
      let empIds = this.currRows.map(v => v.id).join(',');
      let downCon = this.checkList.join(',');
      if (this.radio != 3 && downCon == "") return this.$message.warning("请勾选下载人脸或者卡");
      if (this.vaildDate && this.vaildDate.length < 3) return this.$message.warning("请选择失效日期");
      if (empIds == "") return this.$message.warning("请选择下载人员");
      var param = {
        devIds: this.devIds,
        empIds: empIds,
        downCon: downCon,
        vaildDate: this.vaildDate,
        state: this.radio
      };
      const loading = this.$loading({
        lock: true,
        text: "正在提交中，请耐心等待...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      this.sbtnDisabled = true;
      this.sbtnText = "正在提交...";
      faceSellerPersonDown(param).then(res => {
        if (res.data.code == 200) {
          loading.close();
          this.$message.success(res.data.msg);
          this.sbtnText = "提交";
          this.sbtnDisabled = false;
          this.openDialog();
        } else {
          this.$message.error(res.data.msg);
          this.sbtnText = "提交";
          this.sbtnDisabled = false;
        }
      }).catch(e => {
        loading.close();
        this.$message.error("提交失败");
        this.sbtnText = "提交";
        this.sbtnDisabled = false;
      });
    },
    openDialog(ids) {
      this.sbtnText = "提交";
      this.sbtnDisabled = false;
      this.onLoad();
      this.ids = "";
      this.$nextTick(() => {
        this.empData = [];
        this.vaildDate = "2099-12-31";
        this.checkList = [];
        this.radio = 0;
        this.page.currentPage = 1;
        this.page.total = 0;
      });
    },
    onCheck(treeNode){
      var ids = '';
      var deptId = "";
      treeNode.forEach(v => {
        if(v.valueStr.startsWith('DEPT')){
          let arr = v.valueStr.split('-')
          deptId = deptId + arr.slice(-1)[0] + ','
        }
        if(v.valueStr.startsWith('GS')){
          let arr = v.valueStr.split('-')
          ids = ids + arr.slice(-1)[0] + ',';
        }
      })
      ids = ids.length ? ids.substring(0, ids.length - 1) : ""
      deptId = deptId.length ? deptId.substring(0, deptId.length - 1) : ""
      this.ids = ids;
      this.deptId = deptId;
      this.onLoad();
    },
    onLoad(params = {}) {
      params["pmDeptIds"] = this.deptId ? this.deptId : "";
      params['pmGsIds'] = this.ids;
      params["moreQueryParam"] = this.moreQueryParam;
      params['filterType'] = this.filterType;
      params['queryFieldContent'] = this.queryFieldContent;
      params['queryFieldType'] = this.queryFieldType;
      this.empLoading = true;
      getEventEmpList(
        this.page.currentPage,
        this.page.pageSize,
        params
      ).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        data.records.forEach(v => {
          if(v.empType == 1) v.deptName = v.className
        })
        this.empData = data.records;
        this.empLoading = false;
        this.queryFieldContent = "";
        this.queryFieldType = "";
      }).catch(() => this.empLoading = false);
    },
    clearData() {
      this.$refs.accountZtreeRef.getAccountZtreeInit();
      this.selectionList = [];
      this.empData = [];
      this.$set(this.empData, []);
      this.$forceUpdate();
    },
    search() {
      this.onLoad();
    },
    selectionChange({records}) {
      this.currRows = records;
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
      let arr = [{ thumbUrl: url, url: url }];
      this.$ImagePreview(arr, 0);
    }
  }
};
</script>

<style scoped>
.el-dialog__body {
  padding: 10px 20px !important;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
.tips{
  font-size: 14px;color: rgba(0,0,0,.65);margin-top: 30px;
  p{margin: 0;line-height: 24px;}
}
</style>
