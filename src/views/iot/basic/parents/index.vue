<template>
  <basic-container>
    <div style="margin-bottom: 8px;">
      <el-input
        size="small"
        style="width: 200px;margin-right: 10px;"
        clearable
        @keyup.enter.native="search"
        v-model="moreParamQuery"
        placeholder="请输入学生学号/姓名">
      </el-input>
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
    <div style="margin-bottom: 8px;">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="handleEdit"
        v-if="permission.iot_parents_add_btn">
        关联家长</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-upload2"
        @click="handleImportInfo"
        v-if="permission.iot_parents_import_btn"
        >导入</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-download"
        @click="handleExport"
        v-if="permission.iot_parents_export_btn"
        >导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      highlight-hover-row
      :height="tableHeight"
      ref="xGrid"
      size="mini"
      align="center"
      :highlight="true"
      :columns="tableColumn"
      :loading="loading"
      :checkbox-config="{checkField:'checked'}"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="tableData"
      :export-config="{}"
      @checkbox-change="checkboxChangeEvent"
      @checkbox-all="checkboxChangeEvent">

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
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="35%"
      :before-close="handleClose"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <div style="padding: 10px 0;font-size: 16px;font-weight: 600;">{{form.empName}} <span>{{form.empCode}}</span></div>
      <vxe-table
        border
        resizable
        keep-source
        ref="addEditRef"
        align="center"
        :data="formData"
        :edit-rules="validRules"
        :edit-config="{trigger: 'click', mode: 'cell'}">
        <vxe-table-column field="parentsName" title="姓名" :edit-render="{name: 'input', placeholder: '请输入姓名', attrs: {type: 'text',maxlength:20}}"></vxe-table-column>

        <vxe-table-column field="relation" title="学生关系" :edit-render="{name: 'input', placeholder: '请输入与学生的关系', attrs: {type: 'text',maxlength:10}}"></vxe-table-column>
        <vxe-table-column field="parentsPhone" title="手机号" :edit-render="{name: 'input', placeholder: '请输入手机号'}"></vxe-table-column>
      </vxe-table>

      <div style="margin: 30px 0 0;text-align: center;">
        <el-button @click="validAllEvent" icon="el-icon-check" :loading="submitLoading" type="primary">提交</el-button>
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </div>
    </el-dialog>

    <import-info ref="importInfoRef" @refeshPage="search"></import-info>
  </basic-container>
</template>

<script>
  import {getParentData, parentsUpdate, parentsRemove} from '@/api/iot/parents.js'
  import importInfo from '../../components/teacher-import-info.vue'
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import {isvalidatemobile} from '@/util/validate.js'

  export default{
    components:{importInfo},
    data(){
      const parentsPhoneValid = ({ cellValue }) => {
        if (isvalidatemobile(cellValue)[0]) {
          return new Error(isvalidatemobile(cellValue)[1]);
        }
      }
      return{
        moreParamQuery:"",
        loading:false,
        tableHeight:0,
        tableData:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        selectionList:[],
        dialogTitle:"关联家长",
        dialogVisible:false,
        formData:[{},{},{}],
        submitLoading:false,
        form:{},
        validRules:{
          parentsPhone:[
            { validator: parentsPhoneValid }
          ]
        }
      }
    },
    mounted() {
      this.tableHeight=window.innerHeight-313;
      this.search()
    },
    methods:{
      async validAllEvent () {
        const $table = this.$refs.addEditRef
        const errMap = await $table.validate().catch(errMap => errMap)
        if (errMap) {
          return;
        }else{
          this.submit()
        }
      },
      submit(){
        this.submitLoading = true;
        let form = {}
        form["empId"] = this.form.empId;
        let arr = this.formData
        for (let i = 0; i < arr.length; i++) {
          if (!arr[i].parentsName) {
            arr.splice(i, 1);
            i = i - 1;
          }
        }
        form["parents"] = arr;
        parentsUpdate(form).then(r => {
          this.submitLoading = false;
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.search()
            this.handleClose()
          }else{
            this.$message.error(r.data.msg)
          }
        }).catch(() => {
          this.submitLoading = false;
        })
      },
      handleEdit(){
        if(this.selectionList.length != 1){
          this.$message.error("请选择一条数据");
          return;
        }
        let d = this.selectionList[0]
        let arr = []
        if(d.parents.length < 4){
          for(let i=1;i<4-d.parents.length;i++){
            arr.push({id:0})
          }
        }
        d.parents = [...d.parents,...arr]
        this.form = this.selectionList[0]
        this.formData = this.selectionList[0].parents;
        this.dialogVisible = true;
      },
      handleImportInfo(){
        this.$refs.importInfoRef.openDialog('parents');
      },
      search(){
        this.page.currentPage = 1
        this.selectionList = []
        this.onLoad()
      },
      onLoad(){
        let params = {}
        params["moreParamQuery"] = this.moreParamQuery.trim()
        params["current"] = this.page.currentPage;
        params["size"] = this.page.pageSize;
        this.loading = true;
        getParentData(params).then(r => {
          this.loading = false;
          if(r.data.code == 200){
            let d = r.data.data;
            this.page.total = d.total;
            d.records.forEach(v => {
              v.checked = false
              if(v.parents.length > 0){
                for(let i=0,item=v.parents;i<item.length;i++){
                  v['parentsName'+(i+1)] = item[i].parentsName
                  v['parentsPhone'+(i+1)] = item[i].parentsPhone
                  v['relation'+(i+1)] = item[i].relation
                  v['wxState'+(i+1)] = item[i].wxState == true ? "已绑定" : "未绑定"
                }
              }
            })
            this.tableData = d.records;
          }
        }).catch(() => {
          this.loading = false;
        })
      },
      searchReset(){
        this.moreParamQuery = ""
        this.search()
      },
      checkboxChangeEvent({records}){
        this.selectionList = records;
      },
      handleExport(){
        this.$confirm("是否导出家长信息?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-basic/parents/export?${this.website.tokenHeader}=${getToken()}&moreParamQuery=${this.moreParamQuery.trim()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}`
          );
        });
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
      handleClose(){
        this.formData = []
        this.dialogVisible = false;
      },
    },
    computed:{
      ...mapGetters(['permission']),
      ids() {
        let ids = this.selectionList.map(v => v.empId);
        return ids.join(",");
      },
      tableColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:"姓名",
            field:"empName",
            sortable: true,
            minWidth: 100,
            fixed:"left",
          },
          {
            title:"学号",
            field:"empCode",
            sortable: true,
            minWidth: 140,
            fixed:"left",
          },
          {
            title:"家长",
            children:[
              {
                title:"姓名",
                field:"parentsName1",
                sortable: true,
                minWidth: 100,
              },
              {
                title:"手机号",
                field:"parentsPhone1",
                sortable: true,
                minWidth: 100,
              },
              {
                title:"微信状态",
                field:"wxState1",
                sortable: true,
                minWidth: 100,
              },
              {
                title:"关系",
                field:"relation1",
                sortable: true,
                minWidth: 100,
              },
            ]
          },
          {
            title:"家长",
            children:[
              {
                title:"姓名",
                field:"parentsName2",
                sortable: true,
                minWidth: 100,
              },
              {
                title:"手机号",
                field:"parentsPhone2",
                sortable: true,
                minWidth: 100,
              },
              {
                title:"微信状态",
                field:"wxState2",
                sortable: true,
                minWidth: 100,
              },
              {
                title:"关系",
                field:"relation2",
                sortable: true,
                minWidth: 100,
              },
            ]
          },
          {
            title:"家长",
            children:[
              {
                title:"姓名",
                field:"parentsName3",
                sortable: true,
                minWidth: 100,
              },
              {
                title:"手机号",
                field:"parentsPhone3",
                sortable: true,
                minWidth: 100,
              },
              {
                title:"微信状态",
                field:"wxState3",
                sortable: true,
                minWidth: 100,
              },
              {
                title:"关系",
                field:"relation3",
                sortable: true,
                minWidth: 100,
              },
            ]
          }
        ]
      }
    }
  }
</script>

<style scoped>
  >>>.el-dialog__body{
    padding: 5px 30px 20px 30px !important;
  }
</style>
