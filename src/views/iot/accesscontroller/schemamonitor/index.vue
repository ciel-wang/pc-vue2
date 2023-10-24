<template>
  <basic-container>
    <div>
      <el-input style="width:200px;margin-right: 10px;"
                placeholder="请输入方案名称/编号"
                @keyup.enter.native="search"
                :clearable="true"
                size="small"
                v-model="searchForm">
      </el-input>
      <el-button type="primary"
                 size="small"
                 icon="el-icon-search"
                 @click="search">搜索
      </el-button>
      <el-button type="default"
                 size="small"
                 icon="el-icon-refresh"
                 @click="searchReset">重置
      </el-button>
    </div>
    <div style="margin: 8px 0;">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="handleAdd"
        v-if="permission.access_controller_monitor_schema_add_btn">
        添加</el-button>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-edit"
        @click="handleEdit"
        v-if="permission.access_controller_monitor_schema_edit_btn">
        编辑</el-button>
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        @click="handleDelete"
        v-if="permission.access_controller_monitor_schema_del_btn"
        >删除</el-button>
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
      :columns="cusOptions"
      :loading="loading"
      :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
      :data="deptData"
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
  </basic-container>
</template>

<script>
  import { getAreaAllEquipmentTree} from "@/api/iot/access/icauth";
  import { addMonitorSchema,getMonitorSchemaList,getDetails,remove,updateMonitorSchema} from "@/api/iot/access/monitor";
  import {mapGetters} from "vuex";
  import website from '@/config/website';
  import {getToken} from '@/util/auth';
  export default{
    data(){
      return{
        searchForm:'',
        query: {},
        loading: false,
        page: {
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        tableHeight:0,
        dialogTitle:"添加",
        dialogVisible:false,
        form:{},
        dictData:[],
        selectionList:[],
        type:'add'
      }
    },
    mounted() {
      this.tableHeight=window.innerHeight-313;
      this.search()
    },
    activated() {
      getAreaAllEquipmentTree().then(res=>{
        this.dictData = res.data.data;
      })
    },
    methods:{
      handleAdd(){
        this.dialogTitle = "添加"
        this.dialogVisible = true;
        this.type = "add"
      },
      handleEdit(){
        if(this.selectionList.length != 1){
          this.$message.warning("请选择一条数据");
          return;
        }
        let schemaCode = this.selectionList[0].schemaCode;
        getDetails({"schemaCode":schemaCode}).then(res=>{
          let data =res.data.data;
          let devs = data.devs.split("#")
          let hxdevs = [];
          for(let i=0;i<devs.length;i++){
            hxdevs.push(devs[i])
          }
          this.form = data;
          this.form.devs = hxdevs;
          this.dialogTitle = "编辑"
          this.dialogVisible = true;
          this.type = "edit"
        })
      },
      submit(row,done){
        this.$refs.formRef.validate((vaild, done) => {
          if (vaild) {
            if(row.devs){
              let arr = row.devs;
              let devs = "";
              arr.forEach(v => {
                if(v.startsWith('D') || (v.startsWith('E') && (v.split('-')[2] == 2 || v.split('-')[2] == 7))){
                  devs = devs + v + "#";
                }
              })
              row.devs = devs;
            }
            if(this.type == "edit"){
              updateMonitorSchema(row).then(res=>{
                this.$message({
                  type: "success",
                  message: "修改成功!"
                });
                done();
                this.onLoad();
                this.handleClose();
               }, error => {
                window.console.log(error);
                done()
              })
            }else{
              addMonitorSchema(row).then(res=>{
                this.$message({
                  type: "success",
                  message: "添加成功!"
                });
                done();
                this.search();
                this.handleClose();
              }, error => {
                window.console.log(error);
                done()
              })
            }
          }
        })
      },
      handleDelete(){
        if (this.selectionList.length === 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        this.$confirm(`将删除【${this.schemaCodes}】方案下所有的数据，您确定要继续吗?`, {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return remove({"schemaCodes":this.schemaCodes});
        }).then(() => {
          this.onLoad();
          this.$message({
            type: "success",
            message: "删除成功!"
          });
        });
      },
      search(){
        this.page.currentPage = 1
        this.selectionList = []
        this.onLoad()
      },
      onLoad(){
        this.loading = true;
        let params = {}
        params['size'] = this.page.pageSize
        params['current'] = this.page.currentPage
        params['moreParamQuery'] = this.searchForm;
        getMonitorSchemaList(params).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          let records = data.records;
          this.deptData = records;
          this.loading = false;
        });
      },
      searchReset(){
        this.searchForm = ""
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
      handleClose(){
        this.dialogVisible = false
        this.form = {}
        this.$refs.formRef.resetForm();
      },
    },
    computed:{
      ...mapGetters(["userInfo", "permission","colorName"]),
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      schemaCodes() {
        let schemaCodeObj = {};
        this.selectionList.forEach(ele => {
          schemaCodeObj[ele.schemaCode] = 1;
        });
        let schemaStr = "";
        for(let i in schemaCodeObj){
          schemaStr = schemaStr + i + "#";
        }
        if(schemaStr){
          schemaStr = schemaStr.substring(0,schemaStr.length - 1)
        }
        return schemaStr;
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          labelWidth:'120',
          column:[
            {
              label: "方案编号",
              prop: "schemaCode",
              span:24,
              rules: [{
                required: true,
                message: "请输入方案编号",
                trigger: "blur"
              }],
              disabled:this.type == 'edit' ? true : false
            },
            {
              label: "方案名称",
              prop: "schemaName",
              span:24,
              rules: [{
                required: true,
                message: "请输入方案名称",
                trigger: "blur"
              }]
            },
            {
              label: "选择设备",
              prop: "devs",
              type: 'tree',
              multiple:true,
              dicData:this.dictData,
              props:{
                label: 'label',
                value: 'valueStr'
              },
              rules: [{
                required: true,
                message: "请选择设备",
                trigger: "blur"
              }],
              span:24,
            }
          ]
        }
      },
      cusOptions(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title: "方案编号",
            field: "schemaCode",
            sortable:true,
            minWidth:120,
          },
          {
            title: "方案名称",
            field: "schemaName",
            sortable:true,
            minWidth:130,
          },
          {
            title: "门区 - 进",
            field: "doorInNames",
            sortable:true,
            minWidth:120,
          },
          {
            title: "门区 - 出",
            field: "doorOutNames",
            sortable:true,
            minWidth:120,
          },
        ]
      }
    }
  }
</script>
