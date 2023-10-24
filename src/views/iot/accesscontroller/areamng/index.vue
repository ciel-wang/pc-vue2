<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{height:ztreeHeight+'px'}">
        <area-ztree @click="ztreeClick" ref="areaZtreeRef"></area-ztree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basicContainer>
        <div>
          <el-input
            size="small" clearable
            @keyup.enter.native="search"
            v-model="areaName"
            style="width: 150px;"
            placeholder="请输入区域名称"></el-input>
          <el-input
            size="small" clearable
            @keyup.enter.native="search"
            v-model="areaDevs"
            style="width: 150px;margin: 0 10px;"
            placeholder="请输入区域设备"></el-input>

          <el-button type="primary" size="small" icon="el-icon-search" @click="search">搜索</el-button>
          <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
        </div>
        <vxe-grid
          border
          resizable
          auto-resize
          highlight-hover-row
          :height="tableHeight"
          ref="xGrid"
          size="mini"
          align="center"
          :highlight="true"
          :columns="tableColumn"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="tableData"
          :export-config="{}"
          :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
          <template #toolbar_buttons>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="handleAdd"
              v-if="permission.access_controller_areamng_add_btn">
              添加</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="handleEdit"
              v-if="permission.access_controller_areamng_edit_btn">
              编辑</el-button>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="handleDelete"
              v-if="permission.access_controller_areamng_del_btn"
              >删除</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              @click="handleExport"
              v-if="permission.access_controller_areamng_export_btn"
              >导出</el-button>
          </template>
          <template #areaDevs="{row}">
            <el-tag
              size="mini"
              v-for="(item,i) in row.areaDevs && row.areaDevs.split(',')" :key="'areaDevs'+i"
              style="margin:0 4px 4px 0;">{{item}}</el-tag>
          </template>
          <template #areaState="{row}">
            <i class="icon-xuanzhong" v-if="row.areaState" :style="{color: colorName}"></i>
            <i class="icon-weixuanzhong" v-else></i>
          </template>
          <template #isPublic="{row}">
            <i class="icon-xuanzhong" v-if="row.isPublic" :style="{color: colorName}"></i>
            <i class="icon-weixuanzhong" v-else></i>
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
          :title="dialogTitle"
          :visible.sync="dialogVisible"
          width="700px"
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
      </basicContainer>
    </el-col>
  </el-row>
</template>

<script>
  import website from '@/config/website';
  import { mapGetters } from "vuex";
  import { getToken } from '@/util/auth';
  import areaZtree from '@/components/area-ztree/index.vue'
  import {addArea,getList,getAreaById,updateArea,getAreaTree,removeArea} from "@/api/iot/access/area";
  export default{
    components:{areaZtree},
    data(){
      return{
        areaName:"",
        areaDevs:"",
        loading: false,
        page: {
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        tableData:[],
        tableHeight:"",
        ztreeHeight:"",
        selectionList: [],
        dialogTitle:"添加",
        dialogVisible:false,
        form:{},
        ancestors:0,
        parentIdDic:[]
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.tableHeight=window.innerHeight-264;
      this.search()
    },
    activated() {
      this.getParentAreaTree();
    },
    methods:{
      submit(form,done){
        this.$refs.formRef.validate((vaild, done) => {
          if (vaild) {
            if(this.dialogTitle == "编辑"){
              delete form.createTime
              updateArea(form).then(() => {
                this.search();
                this.$message({
                  type: "success",
                  message: "操作成功!"
                });
                this.getParentAreaTree();
                this.handleClose()
                done();
              }, error => {
                window.console.log(error);
                done();
              });
            }else{
              addArea(form).then(() => {
                this.search();
                this.$message({
                  type: "success",
                  message: "操作成功!"
                });
                this.getParentAreaTree();
                this.handleClose()
                done();
              }, error => {
                window.console.log(error);
                done();
              });
            }
          }
        })
      },
      handleClose(){
        this.form = {}
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
      handleAdd(){
        this.dialogTitle = "添加"
        this.dialogVisible = true;
        this.form.isPublic = false
        this.form.areaState = 1
      },
      handleEdit(){
        if(this.selectionList.length != 1){
          this.$message.warning("请选择一条数据");
          return;
        }
        let id = this.selectionList[0].id;
        getAreaById(id).then(res => {
          this.form = res.data.data;
        });
        this.dialogTitle = "编辑"
        this.dialogVisible = true;
      },
      handleDelete(){
        if(this.selectionList.length == 0){
          this.$message.warning("请选择至少一条数据");
          return;
        }
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return removeArea(this.ids);
        }).then(() => {
          this.search();
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          this.getParentAreaTree();
        });
      },
      handleExport() {
        this.$confirm("是否导出区域管理数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(`/api/iot-basic/access/area/export-area?${this.website.tokenHeader}=${getToken()}&areaName=${this.areaName.trim()}&ids=${this.ids}&ancestors=${this.ancestors}&areaDevs=${this.areaDevs.trim()}`);
        });
      },
      getParentAreaTree(){
        getAreaTree().then(res=>{
          this.parentIdDic = res.data.data;
        });
        this.$refs.areaZtreeRef.initAreaTree();
      },
      search(){
        this.page.currentPage = 1;
        this.selectionList = []
        this.onLoad()
      },
      onLoad(){
        let params = {}
        params["ancestors"] = this.ancestors;
        if(this.areaName){
            params["areaName"] = this.areaName.trim();
        }
        if(this.areaDevs){
            params["areaDevs"] = this.areaDevs.trim();
        }
        this.loading = true;
        params['size'] = this.page.pageSize;
        params["current"] = this.page.currentPage;
        getList(params).then(res => {
          this.loading = false;
          const data = res.data.data;
          this.page.total = data.total;
          let records = data.records;
          this.tableData = records;
        });
      },
      searchReset(){
        this.areaName = "";
        this.areaDevs = "";
        this.ancestors = 0;
        this.search()
        this.$refs.areaZtreeRef.initAreaTree();
      },
      ztreeClick(treeNode) {
        this.ancestors = treeNode.valueStr;
        this.search()
      },
      checkboxChangeEvent({records}){
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
      ...mapGetters(['permission','colorName']),
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label: "父区域",
              prop: "ancestors",
              type:"tree",
              dicData:this.parentIdDic,
              props:{
                value:"valueStr"
              }
            },
            {
              label: "服务编号",
              prop: "areaCode",
              rules:[{
                required:true,
                message:'请输入服务编号',
                trigger:'blur'
              }],
              disabled:this.dialogTitle == '编辑' ? true : false,
              maxlength:20
            },
            {
              label: "区域名称",
              prop: "areaName",
              rules:[{
                required:true,
                message:'请输入区域名称',
                trigger:'blur'
              }],
              maxlength:20
            },
            {
              label: "排序",
              prop: "seq",
              maxlength:20
            },
            {
              label: "状态",
              prop: "areaState",
              type:"select",
              dicData: [{"label":"启用","value":1},{"label":"停用","value":0}],
            },
            {
              label: "公共区域",
              prop: "isPublic",
              type:"radio",
              dicData: [{"label":"是","value":true},{"label":"否","value":false}],
            }
          ]
        }
      },
      tableColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title: "学校名称",
            field: "schoolName",
            sortable:true,
            minWidth: 100,
          },
          {
            title: "服务编号",
            field: "areaCode",
            sortable:true,
            minWidth: 100,
          },
          {
            title: "区域名称",
            field: "areaName",
            sortable:true,
            minWidth: 100,
          },
          {
            title: "区域设备",
            field: "areaDevs",
            sortable:true,
            minWidth: 100,
            slots:{default:"areaDevs"}
          },
          {
            title: "排序",
            field: "seq",
            sortable:true,
            minWidth: 100,
          },
          {
            title: "状态",
            field: "areaState",
            sortable:true,
            minWidth: 100,
            slots:{default:"areaState"}
          },
          {
            title: "公共区域",
            field: "isPublic",
            sortable:true,
            minWidth: 100,
            slots:{default:"isPublic"}
          }
        ]
      }
    }
  }
</script>
