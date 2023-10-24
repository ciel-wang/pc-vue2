<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i
        :style="arrowCfgStyleCommon"
        @click="leftClick"
        v-if="arrowCfg['left'] == 4"
        :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <libraryZtree ref="libraryZtreeRef" @onClick="ztreeClick"></libraryZtree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i
        :style="arrowCfgStyleCommon"
        @click="rightClick"
        v-if="arrowCfg['right'] == 24"
        :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div>
          <el-input
            size="small"
            style="width: 200px;margin-right: 10px;"
            clearable
            @keyup.enter.native="search"
            v-model="libraryName"
            placeholder="请输入图书室名称">
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
          <el-button
            type="primary"
            size="small"
            icon="el-icon-download"
            @click="handleExport"
            v-if="permission.library_room_export_btn"
            >导出</el-button>
        </div>
        <div style="margin: 8px 0;">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="handleAdd"
            v-if="permission.library_room_add_btn">
            添加</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit"
            v-if="permission.library_room_edit_btn">
            编辑</el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete"
            v-if="permission.library_room_del_btn"
            >删除</el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleAutoAdd"
            v-if="permission.library_room_autoadd_btn">
            批量创建书刊架位</el-button>
          <el-button
            type="primary"
            size="small"
            @click="handlePeriodicalsMng"
            v-if="permission.library_room_periodcals_btn">
            书刊架位管理</el-button>
        </div>
        <vxe-table
          border
          resizable
          ref="xGrid"
          size="mini"
          auto-resize
          highlight-hover-row
          align="center"
          :height="tableHeight"
          :loading="loading"
          :export-config="{}"
          :seq-config="{ startIndex: (currentPage - 1) * pageSize }"
          :data="tableData"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
          <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
          <vxe-table-column title="学校名称" minWidth="100" field="schoolName"></vxe-table-column>
          <vxe-table-column title="图书室名称" minWidth="100" field="libraryName"></vxe-table-column>
          <vxe-table-column title="设备名称" minWidth="100" field="devNames"></vxe-table-column>
          <vxe-table-column title="书刊架位" minWidth="360" field="bookPeriodicalsCount">
            <template #default="{row}">
              <el-tag
                v-if="row.bookPeriodicalsNames.length"
                v-for="(item,i) in row.bookPeriodicalsNames" :key="i"
                type="success" effect="dark"
                style="margin: 0 8px 8px 0;">
                {{ item }}
              </el-tag>
            </template>
          </vxe-table-column>
        </vxe-table>
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
      </basic-container>

      <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        width="30%"
        :before-close="handleClose"
        append-to-body
        :modal-append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false">
        <avue-form
          ref="formRef"
          :option="addEditOption"
          v-model="form"
          @submit="submit">
          <template slot-scope="scope" slot="menuForm">
            <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
          </template>
        </avue-form>
      </el-dialog>

      <PeriodicalsCountMng ref="PeriodicalsCountMngRef" @refeshPage="search"></PeriodicalsCountMng>
    </el-col>
  </el-row>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import { getSchoolsZtreeData } from "@/api/iot/dept.js"
  import { getAreaAllEquipmentTree} from "@/api/iot/access/icauth";
  import { getLibraryList, getLibraryDetails, removeLibrary, addLibrary, updateLibrary, getLibraryDic, addBatchPeriodicals} from '@/api/library-mng/book-room-mng'
  import PeriodicalsCountMng from './PeriodicalsCountMng.vue'
  import libraryZtree from '../library-ztree.vue'

  export default{
    components:{ PeriodicalsCountMng, libraryZtree },
    data(){
      return{
        ztreeHeight:0,
        tableHeight:0,
        libraryName:"",
        loading:false,
        tableData:[],
        selectionList:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        dialogTitle:"添加",
        dialogVisible:false,
        form:{},
        schoolIdDic:[],
        libraryDic:[],
        devDic:[],
        btnType:"add",
        schoolId:"",
        treeType:"school"
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.tableHeight=window.innerHeight-236-77;
      this.search()
    },
    activated() {
      getSchoolsZtreeData().then(r => {
        this.schoolIdDic = r.data.data;
      })
      getAreaAllEquipmentTree({stype:'floor-relevance'}).then(r => {
        this.devDic = r.data.data
      })
    },
    methods:{
      submit(f,done){
        let form = {...this.form}
        if(form.doorIds && Array.isArray(form.doorIds)){
          let arr = []
          form.doorIds.forEach(v => {
            if(v.startsWith('E') || v.startsWith('D')){
              arr.push(v)
            }
          })
          form.doorIds = arr.join(',')
        }
        if(this.btnType === 'edit'){
          updateLibrary(form).then(r => {
            done();
            if(r.data.code === 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.search()
              this.$refs.libraryZtreeRef.getLibraryZtreeInit();
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch(() => done())
        }else if(this.btnType === 'add'){
          addLibrary(form).then(r => {
            done();
            if(r.data.code === 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.search()
              this.$refs.libraryZtreeRef.getLibraryZtreeInit();
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch(() => done())
        }else{
          addBatchPeriodicals(form).then(r => {
            done();
            if(r.data.code === 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.search()
              this.$refs.libraryZtreeRef.getLibraryZtreeInit();
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch(() => done())
        }
      },
      handleClose(){
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
      handleAdd(){
        this.btnType = "add";
        this.dialogTitle = "添加"
        this.dialogVisible = true;
      },
      handleAutoAdd(){
        this.btnType = "auto";
        this.dialogTitle = "批量创建书刊架位"
        this.dialogVisible = true;
      },
      handleEdit(){
        if ( this.selectionList.length !== 1) {
          this.$message.warning("请选择一条数据");
          return;
        }
        this.btnType = "edit";
        this.dialogTitle = "编辑"
        getLibraryDetails({id:this.selectionList[0].id}).then(r => {
          if(r.data.code === 200){
            let form = r.data.data;
            this.form = {...form};
            this.dialogVisible = true;
          }
        })
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
          return removeLibrary({ids:this.ids.split(',')});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }
        })
      },
      handlePeriodicalsMng(){
        if ( this.selectionList.length !== 1) return this.$message.warning("请选择一条数据");
        let id = this.selectionList[0].id;
        this.$refs.PeriodicalsCountMngRef.openDialog(id)
      },
      search(){
        this.page.currentPage = 1;
        this.selectionList = [];
        this.onLoad();
      },
      searchReset(){
        this.libraryName = "";
        this.schoolId = "";
        this.$refs.libraryZtreeRef.getLibraryZtreeInit();
        this.search();
      },
      ztreeClick(treeNode){
        this.treeType = treeNode.valueStr.startsWith('lb') ? 'lb' : 'school';
        this.schoolId = treeNode.value;
        this.search();
      },
      onLoad(){
        let params = {}
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params['libraryName'] = this.libraryName;
        params['schoolId'] = this.treeType === 'school' ? this.schoolId : '';
        params['ids'] = this.treeType === 'lb' ? this.schoolId : '';
        this.loading = true;
        getLibraryList(params).then(r => {
          this.loading = false;
          if(r.data.code === 200){
            let d = r.data.data;
            this.page.total = d.total;
            d.records.forEach(v => {
              v.bookPeriodicalsNames = v.bookPeriodicalsNames ? v.bookPeriodicalsNames.split(',') : []
            })
            this.tableData = d.records;
          }
        }).catch(() => this.loading = false)
      },
      handleExport(){
        this.$confirm("是否导出书室管理?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-library/lb/list/export?${website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&libraryName=${this.libraryName.trim()}&schoolId=${this.treeType === 'school' ? this.schoolId : ''}&ids=${this.treeType === 'lb' ? this.schoolId : ''}`
          );
        });
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
      getSchoolLibraryList(data){
        getLibraryDic({schoolId:data.value}).then(r => {
          let arr = r.data.data.map(v => ({value:v.key,label:v.value}))
          this.libraryDic = arr;
        })
      }
    },
    computed:{
      ...mapGetters(['permission']),
      ids() {
        let ids = this.selectionList.map(v => v.id);
        return ids.join(",");
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          labelWidth:130,
          column:[
            {
              label:"所属学校",
              prop:'schoolId',
              type:'tree',
              rules:[{
                required:true,
                message:"请选择学校",
                trigger:'blur'
              }],
              span:24,
              dicData:this.schoolIdDic,
              props:{
                value:'value',
              },
              nodeClick:(data, node,ref)=>{
                if(this.btnType === 'auto'){
                  this.getSchoolLibraryList(data);
                }
              }
            },
            {
              label: "所属图书室",
              prop: "libraryId",
              type:"select",
              rules: [{
                required: true,
                message: "请选择所属图书室",
                trigger: "blur"
              }],
              dicData:this.libraryDic,
              span: 24,
              display:this.btnType === 'auto' ? true : false
            },
            {
              label:"图书室名称",
              prop:"libraryName",
              rules:[{
                required:true,
                message:"请输入图书室名称",
                trigger:"blur"
              }],
              span:24,
              display:this.btnType !== 'auto' ? true : false,
              maxlength:20
            },
            {
              label:"选择设备",
              prop:"doorIds",
              span:24,
              type:"tree",
              dicData:this.devDic,
              props:{
                value:"valueStr"
              },
              multiple:true,
              display:this.btnType !== 'auto' ? true : false
            },
            {
              label:"书刊架位数量",
              prop:"bookPeriodicalsCount",
              type: 'number',
              minRows:1,
              maxRows:99,
              precision:0,
              span:24,
              rules:[{
                required:true,
                message:"请输入书刊架位数量",
                trigger:"blur"
              }],
              display:this.btnType === 'auto' ? true : false
            }
          ]
        }
      }
    }
  }
</script>

<style>
</style>
