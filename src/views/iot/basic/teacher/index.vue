<template>
    <el-row>
      <el-col class="col-real-pos" :span="arrowCfg['left']">
        <i
          :style="arrowCfgStyleCommon"
          @click="leftClick"
          v-if="arrowCfg['left'] == 4"
          :class="arrowCfgClassLeftName"></i>
        <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
          <dept-ztree @click="ztreeClick" ref="ztree"></dept-ztree>
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
              size="small" clearable
              style="width: 200px;margin-right: 10px;"
              @keyup.enter.native="search"
              v-model="moreParamQuery"
              placeholder="请输入教师工号/姓名/手机号">
            </el-input>
            <el-select
              v-model="isHaveFaceUrl"
              placeholder="选择是否有头像"
              size="small"
              clearable
              style="width: 150px;">
              <el-option v-for="item in faceUrlOptionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-select
              v-model="empStatus"
              placeholder="选择职工状态"
              size="small" clearable
              style="width: 150px;margin: 0 10px;">
              <el-option v-for="item in empStatusOptionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-select
              v-model="empPost"
              placeholder="选择职务"
              size="small" clearable
              style="width: 150px;margin-right: 10px;">
              <el-option v-for="item in empPostOptionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
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
          <vxe-grid
            border
            resizable
            auto-resize
            highlight-hover-row
            :height="tableHeight"
            ref="xGrid"
            size="mini"
            align="center"
            show-overflow
            :highlight="true"
            :columns="tableColumn"
            :loading="loading"
            :checkbox-config="{checkField:'checked'}"
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
                v-if="permission.iot_teacher_add_btn">
                添加</el-button>
              <el-button
                type="primary"
                size="small"
                icon="el-icon-edit"
                @click="handleEdit"
                v-if="permission.iot_teacher_edit_btn">
                编辑</el-button>
              <el-button
                type="danger"
                size="small"
                icon="el-icon-delete"
                @click="handleDelete"
                v-if="permission.iot_teacher_del_btn"
                >删除</el-button>
              <el-button
                type="primary"
                size="small"
                icon="el-icon-upload2"
                @click="handleImportInfo"
                v-if="permission.iot_teacher_importinfo_btn"
                >导入</el-button>
              <el-button
                type="primary"
                size="small"
                icon="el-icon-upload2"
                @click="handleImportImg"
                v-if="permission.iot_teacher_importimg_btn"
                >导入图片</el-button>
              <el-button
                type="primary"
                size="small"
                icon="el-icon-download"
                @click="handleExportImg"
                v-if="permission.iot_teacher_exportimg_btn"
                >导出图片</el-button>
              <el-button
                type="primary"
                size="small"
                @click="batchAudit(1)"
                v-if="permission.iot_teacher_agree_visitor_btn">允许访客审批</el-button>
              <el-button
                type="danger"
                size="small"
                @click="batchAudit(0)"
                v-if="permission.iot_teacher_reject_visitor_btn">禁止访客审批</el-button>
              <el-button
                type="primary"
                size="small"
                icon="el-icon-download"
                @click="handleExport"
                v-if="permission.iot_teacher_export_btn"
                >导出</el-button>
              <el-button
                type="primary"
                size="small"
                @click="handleTeachingClass"
                v-if="permission.iot_teacher_teachingclass_btn"
                >关联班级</el-button>
              <el-button
                type="primary"
                size="small"
                @click="handleTakephotos"
                v-if="permission.iot_teacher_takephotos_btn"
                >在线拍照</el-button>
            </template>

            <template #isVisitorAuditAuth="{row}">
              <el-switch
                v-model="row.isVisitorAuditAuth"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="qrCodeChange"
                :disabled="!permission.iot_teacher_agree_visitor_btn"
                :active-value="row.id + '-1'"
                :inactive-value="row.id+ '-0'">
              </el-switch>
            </template>
            <template #faceUrl="{ row }">
              <img
                :src="row.faceUrl+'?time='+ new Date().getTime()"
                v-if="row.faceUrl.length > 45"
                width="30px"
                height="30px"
                style="border-radius: 50%;"
                @click="openPreview(row.faceUrl+'?time='+ new Date().getTime())" />
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

          <teacher-add-edit
            ref="teacherAddEditRef"
            @refeshPage="search"
            :empStatusDic="empStatusOptionList"
            :empPostDic="empPostOptionList"
            :resignTypeDic="resignTypeOptionList"
            :userCategoryDic="userCategoryDic"
            :deptDic="deptDic"></teacher-add-edit>
          <teacher-import-img ref="teacherImportImgRef" @refeshPage="search"></teacher-import-img>
          <teacher-import-info ref="teacherImportInfoRef" @refeshPage="search"></teacher-import-info>
          <teaching-class ref="teachingClassRef" @refeshPage="search"></teaching-class>
          <open-camera ref="openCameraRef" @refeshPage="onLoad"></open-camera>
          <exportImg ref="exportImgRef"></exportImg>
        </basic-container>
      </el-col>
    </el-row>
</template>

<script>
  import deptZtree from "@/components/dept-ztree/index.vue"
  import {getTeacherData, teacherRemove, teacherDetails, getDictCode, updateVisitorAuditState} from "@/api/iot/teacher.js"
  import {getDeptZtreeData,} from "@/api/iot/dept.js"
  import teacherAddEdit from "./teacher-add-edit.vue"
  import teacherImportImg from "../../components/teacher-import-img.vue"
  import teacherImportInfo from "../../components/teacher-import-info.vue"
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import teachingClass from './teachingClass.vue'
  import openCamera from '../open_camera.vue'
  import exportImg from '../export-img.vue'

  export default{
    components:{deptZtree,teacherAddEdit,teacherImportImg,teacherImportInfo, teachingClass, openCamera, exportImg},
    data(){
      return{
        ztreeHeight:0,
        tableHeight:0,
        loading:false,
        tableData:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        selectionList:[],
        ancestors:"",
        isHaveFaceUrl:"",
        faceUrlOptionList:[
          {value:true,label:"有"},
          {value:false,label:"无"}
        ],
        empStatus:"",
        empStatusOptionList:[],
        empPost:"",
        empPostOptionList:[],
        resignTypeOptionList:[],
        moreParamQuery:"",
        userCategoryDic:[],
        deptDic:[]
      }
    },
    activated() {
      getDictCode({keys:"empPost#userStatus#resignType#userCategory"}).then(r => {
        if(r.data.code == 200){
          let d = r.data.data;
          this.empPostOptionList = d.empPost.map(v => ({ value:v.dictKey*1,label:v.dictValue }));
          this.empStatusOptionList = d.userStatus.map(v => ({ value:v.dictKey*1,label:v.dictValue }));
          this.resignTypeOptionList = d.resignType.map(v => ({ value:v.dictKey*1,label:v.dictValue }));
          this.userCategoryDic = d.userCategory.map(v => ({ value:v.dictKey*1,label:v.dictValue }));
        }
      })
      getDeptZtreeData().then(r => {
        this.deptDic = [];
        if(r.data.code == 200){
          this.deptDic = r.data.data;
        }
      });
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.tableHeight=window.innerHeight-264;
      this.search()
    },
    methods:{
      handleTakephotos(){
        if(this.selectionList.length === 0) return this.$message.warning("请选择至少一条数据");
        if(this.selectionList.length > 50) return this.$message.warning("最多选择50条数据");
        this.$refs.openCameraRef.openDialog(this.selectionList);
        // if(this.selectionList.length != 1) return this.$message.warning("请选择一条数据");
        // this.$refs.openCameraRef.openDialog(this.ids);
      },
      handleTeachingClass(){
        if(this.selectionList.length != 1) return this.$message.warning("请选择一条数据");
        let ids = this.selectionList.map(v => v.id).join(',');
        this.$refs.teachingClassRef.openDialog(ids);
      },
      qrCodeChange(val){
        let infos = val.split("-");
        let empId = infos[0] ;
        let visitorAuditState = infos[1];
        updateVisitorAuditState({"empIds":empId,"visitorAuditState":visitorAuditState}).then(res=>{
          this.$message.success(res.data.msg);
          this.onLoad();
        }).catch(() => {
          this.onLoad();
        })
      },
      batchAudit(visitorAuditState){
        if (this.selectionList.length === 0) return this.$message.warning("请选择至少一条数据");
        let empIds = this.selectionList.map(v => v.id).join(',');
        updateVisitorAuditState({"empIds":empIds,"visitorAuditState":visitorAuditState}).then(res=>{
          this.$message.success(res.data.msg);
          this.onLoad();
        }).catch(() => {
          this.onLoad();
        })
      },
      handleAdd(){
        this.$refs.teacherAddEditRef.openDialog();
      },
      handleEdit(){
        if(this.selectionList.length != 1) return this.$message.warning("请选择一条数据");
        teacherDetails({id:this.selectionList[0].id}).then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            d.id = this.selectionList[0].id
            let arr = []
            let arr2 = []
            if(d.gradeClass){
              d.gradeClass.forEach(v => {
                arr.push(v.classId)
                arr2.push(v.schoolName+v.gradeName+v.className)
              })
              d.gradeClassNames = arr2.join(' | ')
              d.gradeClassIds = arr.join('#')
            }
            if(d.faceUrl) d.faceUrl = d.faceUrl + '?time='+ new Date().getTime();
            this.$refs.teacherAddEditRef.openDialog(d);
          }
        })
      },
      handleImportImg(){
        this.$refs.teacherImportImgRef.openDialog();
      },
      handleExportImg(){
        if(this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
        this.$refs.exportImgRef.openDialog(this.ids);
      },
      handleImportInfo(){
        this.$refs.teacherImportInfoRef.openDialog('teacher');
      },
      handleDelete(){
        if ( this.selectionList.length == 0) return this.$message.warning("请选择要删除的数据");
        this.$confirm("确定要删除选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return teacherRemove({ids:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }else{
            this.$message.error(res.data.msg);
          }
        })
      },
      ztreeClick(treeNode){
        this.ancestors = treeNode.valueStr;
        this.search()
      },
      search(){
        this.page.currentPage = 1
        this.selectionList = []
        this.onLoad()
      },
      onLoad(){
        let params = {}
        params["current"] = this.page.currentPage;
        params["size"] = this.page.pageSize;
        params["moreParamQuery"] = this.moreParamQuery.trim();
        params["ancestors"] = this.ancestors;
        params["isHaveFaceUrl"] = this.isHaveFaceUrl;
        params["empStatus"] = this.empStatus;
        params["empPost"] = this.empPost;
        this.loading = true;
        getTeacherData(params).then(r => {
          this.loading = false;
          if(r.data.code == 200){
            let d = r.data.data;
            this.page.total = d.total;
            d.records.forEach(v => {
              v.isVisitorAuditAuth  =  v.isVisitorAuditAuth ? v.id + "-1" : v.id + "-0";
              v.checked = false
            })
            this.tableData = d.records;
          }
        }).catch(() => this.loading = false)
      },
      searchReset(){
        this.moreParamQuery = ""
        this.ancestors = ""
        this.isHaveFaceUrl = ""
        this.empStatus = ""
        this.empPost = ""
        this.search()
        this.$refs.ztree.getDeptZtreeInit();
      },
      checkboxChangeEvent({records}){
        this.selectionList = records;
      },
      handleExport(){
        this.$confirm("是否导出教师信息?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-basic/emp/teacher/export?${this.website.tokenHeader}=${getToken()}&moreParamQuery=${this.moreParamQuery.trim()}&ids=${this.ids}&ancestors=${this.ancestors}&isHaveFaceUrl=${this.isHaveFaceUrl}&empStatus=${this.empStatus}&empPost=${this.empPost}`
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
      openPreview(url) {
        let arr = [{ thumbUrl: url, url: url }];
        this.$ImagePreview(arr, 0);
      },
    },
    computed:{
      ...mapGetters(['permission']),
      ids() {
        let ids = this.selectionList.map(v => v.id);
        return ids.join(",");
      },
      tableColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:"头像",
            field:"faceUrl",
            sortable: true,
            minWidth: 100,
            fixed:"left",
            slots:{default:"faceUrl"}
          },
          {
            title:"工号",
            field:"empCode",
            sortable: true,
            width: 100,
            fixed:"left",
          },
          {
            title:"姓名",
            field:"empName",
            sortable: true,
            width: 100,
            fixed:"left",
          },
          {
            title:"性别",
            field:"empSex",
            sortable: true,
            minWidth: 100,
            formatter:({ cellValue })=>{
              return cellValue == 1 ? '男' : "女"
            }
          },
          {
            title:"手机号",
            field:"empPhone",
            sortable: true,
            minWidth: 110,
          },
          {
            title:"身份证号",
            field:"idCardNo",
            sortable: true,
            minWidth: 140,
          },
          {
            title:"部门编号",
            field:"deptNo",
            sortable: true,
            width: 100,
          },
          {
            title:"部门名称",
            field:"deptName",
            sortable: true,
            width: 140,
          },
          {
            title:"学校名称",
            field:"schoolName",
            sortable: true,
            minWidth: 100,
          },
          {
            title:"职务",
            field:"empPostStr",
            sortable: true,
            minWidth: 100,
          },
          {
            title:"职工分类",
            field:"empCategoryStr",
            sortable: true,
            minWidth: 100,
          },
          {
            title:"职工状态",
            field:"empStatusStr",
            sortable: true,
            minWidth: 100,
          },
          {
            title:"邮箱",
            field:"empEmail",
            sortable: true,
            minWidth: 130,
          },
          {
            title:"入职日期",
            field:"entryYear",
            sortable: true,
            minWidth: 100,
          },
          {
            title:"离职方式",
            field:"resignTypeStr",
            sortable: true,
            minWidth: 100,
          },
          {
            title:"离职日期",
            field:"resignDate",
            sortable: true,
            minWidth: 100,
            formatter:({cellValue}) => {
              return cellValue ? cellValue.substr(0,10) : ""
            }
          },
          {
            title:"现居住地址",
            field:"residence",
            sortable: true,
            width: 140,
            visible:false
          },
          {
            title:"扩展一",
            field:"ext1",
            sortable: true,
            width: 100,
            visible:false
          },
          {
            title:"扩展二",
            field:"ext2",
            sortable: true,
            width: 100,
            visible:false
          },
          {
            title:"扩展三",
            field:"ext3",
            sortable: true,
            width: 100,
            visible:false
          },
          {
            title: "访客审批权限",
            field: "isVisitorAuditAuth",
            minWidth: 120,
            slots:{default:'isVisitorAuditAuth'},
            visible:false
          },
          {
            title:"ID",
            field:"id",
            sortable: true,
            width: 100,
            visible:false
          },
        ]
      }
    }
  }

</script>
