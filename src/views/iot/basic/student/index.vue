<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i
        :style="arrowCfgStyleCommon"
        @click="leftClick"
        v-if="arrowCfg['left'] == 4"
        :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <gradeclass-ztree  @click="ztreeClick" ref="ztree"></gradeclass-ztree>
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
            style="width: 200px;"
            clearable
            @keyup.enter.native="search"
            v-model="moreParamQuery"
            placeholder="请输入学生学号/姓名">
          </el-input>
          <el-select
            v-model="empSex"
            placeholder="请选择性别"
            size="small"
            clearable
            style="width: 150px;margin: 0 10px;">
            <el-option
              v-for="item in empSexOptionList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select
            v-model="isHaveFaceUrl"
            placeholder="选择是否有头像"
            size="small"
            clearable
            style="width: 150px;">
            <el-option
              v-for="item in faceUrlOptionList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select
            v-model="empStatus"
            placeholder="选择学生状态"
            size="small"
            clearable
            style="width: 150px;margin: 0 10px;">
            <el-option
              v-for="item in empStatusOptionList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select
            v-model="empCategory"
            placeholder="选择学生类型"
            size="small"
            clearable
            style="width: 150px;margin-right: 10px;">
            <el-option
              v-for="item in empCategoryOptionList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select
            v-model="isLive"
            placeholder="是否住宿"
            size="small"
            clearable
            style="width: 150px;margin-right: 10px;">
            <el-option
              v-for="item in isLiveDic"
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
          show-overflow
          :columns="tableColumn"
          :loading="loading"
          :checkbox-config="{checkField:'checked'}"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="tableData"
          :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
          :export-config="{}"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
          <template #toolbar_buttons>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="handleAdd"
              v-if="permission.iot_student_add_btn">
              添加</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="handleEdit"
              v-if="permission.iot_student_edit_btn">
              编辑</el-button>
            <el-button
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="handleDelete"
              v-if="permission.iot_student_del_btn"
              >删除</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-upload2"
              @click="handleImportInfo"
              v-if="permission.iot_student_importinfo_btn"
              >导入</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-upload2"
              @click="handleImportImg"
              v-if="permission.iot_student_importimg_btn"
              >导入图片</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              @click="handleExportImg"
              v-if="permission.iot_student_exportimg_btn"
              >导出图片</el-button>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              @click="handleExport"
              v-if="permission.iot_student_export_btn"
              >导出</el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleGraduat"
              v-if="permission.iot_student_graduat_btn"
              >毕业</el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleStatus"
              v-if="permission.iot_student_status_btn"
              >批量修改学生状态</el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleTakephotos"
              v-if="permission.iot_student_takephotos_btn"
              >在线拍照</el-button>
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
          <template #isLive="{row}">
            <i class="icon-xuanzhong" v-if="row.isLive == 1" :style="{ color: colorName }"></i>
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
          title="批量修改学生状态"
          :visible.sync="dialogVisible"
          :modal-append-to-body="true"
          width="30%"
          :lock-scroll="true"
          :close-on-press-escape="false"
          :close-on-click-modal="false"
          :append-to-body="true"
          :before-close="handleClose">
          <avue-form
            ref="formRef"
            :option="option"
            v-model="form"
            @submit="submit"
            @error="error">
            <template slot-scope="scope" slot="menuForm">
              <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
            </template>
          </avue-form>
        </el-dialog>

        <student-add-edit
          ref="studentAddEditRef"
          @refeshPage="search"
          :classIdDic='classIdDic'
          :empStatusOptionList="empStatusOptionList"
          :empCategoryOptionList="empCategoryOptionList"></student-add-edit>
        <import-img ref="importImgRef" @refeshPage="search"></import-img>
        <import-info ref="importInfoRef" @refeshPage="search"></import-info>
        <open-camera ref="openCameraRef" @refeshPage="onLoad"></open-camera>
        <exportImg ref="exportImgRef"></exportImg>
      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import {getGradeclassZtreeData} from "@/api/iot/gradeclass.js";
  import { getDictCode } from "@/api/iot/teacher.js"
  import {getStudentData, getStudentDetails, studentRemove,studentGraduate, studentStatusUpdate} from "@/api/iot/student.js"
  import gradeclassZtree from "@/components/gradeclass-ztree/index.vue"
  import studentAddEdit from "./student-add-edit.vue"
  import importImg from "../../components/teacher-import-img.vue"
  import importInfo from "../../components/teacher-import-info.vue"
  import openCamera from '../open_camera.vue'
  import exportImg from '../export-img.vue'

  export default{
    components:{gradeclassZtree, studentAddEdit,importImg,importInfo, openCamera, exportImg},
    data(){
      return{
        ztreeHeight:0,
        tableHeight:0,
        moreParamQuery:"",
        isHaveFaceUrl:"",
        faceUrlOptionList:[
          {value:true,label:"有"},
          {value:false,label:"无"}
        ],
        empStatus:"",
        empStatusOptionList:[],
        empCategory:"",
        empCategoryOptionList:[],
        empSex:"",
        empSexOptionList:[
          {value:1,label:"男"},
          {value:2,label:"女"}
        ],
        loading:false,
        tableData:[],
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        selectionList:[],
        ancestors:"",
        dialogVisible:false,
        form:{},
        isLive:'',
        isLiveDic:[
          {value:true,label:'是'},{value:false,label:'否'}
        ],
        classIdDic:[]
      }
    },
    activated() {
      getGradeclassZtreeData().then(r => {
        if(r.data.code == 200){
          let d = r.data.data
          this.classIdDic = d
        }
      })
      getDictCode({keys:"studentStatus#studentCategory"}).then(r => {
        if(r.data.code == 200){
          let d = r.data.data;
          this.empStatusOptionList = d.studentStatus.map(v => ({ value:v.dictKey*1,label:v.dictValue }));
          this.empCategoryOptionList = d.studentCategory.map(v => ({ value:v.dictKey*1,label:v.dictValue }));
        }
      })
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
        // this.$refs.openCameraRef.openDialog(this.ids);
        this.$refs.openCameraRef.openDialog(this.selectionList);
      },
      handleAdd(){
        this.$refs.studentAddEditRef.openDialog();
      },
      handleEdit(){
        if(this.selectionList.length != 1) return this.$message.error("请选择一条数据");
        let id = this.selectionList[0].id
        getStudentDetails({id:id}).then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            d.id = id;
            d.faceUrl = d.faceUrl ? (d.faceUrl + '?time='+ new Date().getTime()) : ''
            this.$refs.studentAddEditRef.openDialog(d);
          }
        })
      },
      handleImportImg(){
        this.$refs.importImgRef.openDialog('student');
      },
      handleExportImg(){
        if(this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
        this.$refs.exportImgRef.openDialog(this.ids);
      },
      handleImportInfo(){
        this.$refs.importInfoRef.openDialog('student');
      },
      handleDelete(){
        if ( this.selectionList.length == 0) return this.$message.warning("请选择要删除的数据");
        this.$confirm("确定要删除选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return studentRemove({ids:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }else{
            this.$message.error(res.data.msg);
          }
        })
      },
      handleGraduat(){
        if ( this.selectionList.length == 0) return this.$message.warning("请选择至少一条数据");
        this.$confirm("确定要将选择的学生进行毕业操作？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return studentGraduate({empIds:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }else{
            this.$message.error(res.data.msg);
          }
        })
      },
      handleStatus(){
        if ( this.selectionList.length == 0) return this.$message.warning("请选择至少一条数据");
        this.dialogVisible = true;
      },
      handleClose(){
        this.form.studentStatus = "";
        this.$refs.formRef.resetFields();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
      submit(form,done) {
        this.$refs.formRef.validate((vaild, done) => {
          if (vaild) {
            form.empIds = this.ids;
            studentStatusUpdate(form).then(r => {
              done();
              if(r.data.code == 200){
                this.$message.success(r.data.msg);
                this.dialogVisible = false;
                this.form.studentStatus = "";
                this.search();
              }else{
                this.$message.error(r.data.msg);
              }
            }).catch(() => done())
          }
        })
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
        params["ancestors"] = this.ancestors;
        params["isHaveFaceUrl"] = this.isHaveFaceUrl
        params["empSex"] = this.empSex;
        params["empStatus"] = this.empStatus
        params["empCategory"] = this.empCategory;
        params['isLive'] = this.isLive;
        this.loading = true;
        getStudentData(params).then(r => {
          this.loading = false;
          if(r.data.code == 200){
            let d = r.data.data;
            this.page.total = d.total;
            d.records.forEach(v => {
              v.gradeClasss = v.gradeName + v.className;
              v.checked = false
            })
            this.tableData = d.records;
          }
        }).catch(() => this.loading = false)
      },
      searchReset(){
        this.moreParamQuery = ""
        this.ancestors = ""
        this.empCategory = ""
        this.empSex = ""
        this.isHaveFaceUrl = ""
        this.empStatus = ""
        this.isLive = ""
        this.search()
        this.$refs.ztree.getGradeclassZtreeInit();
      },
      checkboxChangeEvent({records}){
        this.selectionList = records;
      },
      handleExport(){
        this.$confirm("是否导出学生信息?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-basic/emp/student/export?${this.website.tokenHeader}=${getToken()}&moreParamQuery=${this.moreParamQuery.trim()}&ids=${this.ids}&isHaveFaceUrl=${this.isHaveFaceUrl}&empSex=${this.empSex}&empStatus=${this.empStatus}&empCategory=${this.empCategory}&ancestors=${this.ancestors}&isLive=${this.isLive}`
          );
        });
      },
      ztreeClick(ztreeNode){
        this.ancestors = ztreeNode.valueStr;
        this.search()
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
      ...mapGetters(['permission','colorName']),
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      option(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column: [
            {
              label:"学生状态",
              prop:"studentStatus",
              span:24,
              type:"select",
              dicData:this.empStatusOptionList,
              rules:[{
                required:true,
                message:"请选择学生状态",
                trigger:"blur"
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
            title:"头像",
            field:"faceUrl",
            sortable: true,
            minWidth: 100,
            fixed:"left",
            slots:{default:'faceUrl'}
          },
          {
            title:"学号",
            field:"empCode",
            sortable: true,
            minWidth: 100,
          },
          {
            title:"身份证号",
            field:"idCardNo",
            sortable:true,
            minWidth:140
          },
          {
            title:"姓名",
            field:"empName",
            sortable: true,
            minWidth: 100,
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
            title:"年/班级",
            field:"gradeClasss",
            sortable: true,
            minWidth: 140,
          },
          {
            title:"学校名称",
            field:"schoolName",
            sortable: true,
            minWidth: 100,
          },
          {
            title:"学生状态",
            field:"empStatusStr",
            sortable:true,
            minWidth:100
          },
          {
            title:"学生类型",
            field:"empCategoryStr",
            sortable:true,
            minWidth:100
          },
          {
            title:"住宿",
            field:"isLive",
            sortable:true,
            minWidth:100,
            slots:{default:"isLive"}
          },
          {
            title:"学籍号",
            field:"studentCode",
            sortable: true,
            minWidth: 140,
          },
          {
            title:"手机号",
            field:"empPhone",
            sortable: true,
            minWidth: 110,
          },
          {
            title:"入学日期",
            field:"entryYear",
            sortable:true,
            minWidth:100
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
        ]
      }
    }
  }

</script>
