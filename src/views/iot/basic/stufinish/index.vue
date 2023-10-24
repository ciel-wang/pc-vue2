<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i
        :style="arrowCfgStyleCommon"
        @click="leftClick"
        v-if="arrowCfg['left'] == 4"
        :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <gradeclass-ztree  @click="ztreeClick" ref="ztree" :node="nodes"></gradeclass-ztree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i
        :style="arrowCfgStyleCommon"
        @click="rightClick"
        v-if="arrowCfg['right'] == 24"
        :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div style="margin-bottom: 8px;">
          <el-input
            size="small"
            style="width: 200px;margin-right: 10px;"
            clearable
            @keyup.enter.native="search"
            v-model.trim="moreParamQuery"
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
          <el-button
            type="primary"
            size="small"
            icon="el-icon-download"
            @click="handleExport"
            v-if="permission.stufinish_export_btn"
            >导出</el-button>
          <!-- <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete"
            v-if="permission.stufinish_del_btn"
            >删除</el-button> -->
          <el-button
            type="primary"
            size="small"
            @click="handleRestoreEmp"
            v-if="permission.stufinish_restore_btn">
            恢复</el-button>
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
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
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
      </basic-container>
    </el-col>
  </el-row>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import { getTableData, restoreEmp, removeEmp } from "@/api/iot/studentfinish.js"
  import gradeclassZtree from "@/components/gradeclass-ztree/index.vue"

  export default{
    components:{ gradeclassZtree },
    data(){
      return{
        moreParamQuery:"",
        tableData:[],
        loading:false,
        page:{
          pageSize:30,
          currentPage:1,
          total:0
        },
        ztreeHeight:0,
        selectionList:[],
        ancestors:"",
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.search()
    },
    methods:{
      handleRestoreEmp(){
        if ( this.selectionList.length == 0) {
          this.$message.warning("请选择要恢复的数据");
          return;
        }
        this.$confirm("确定要恢复选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return restoreEmp({ids:this.ids.split(',')});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }else{
            this.$message.error(res.data.msg)
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
          return removeEmp({ids:this.ids.split(',')});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }else{
            this.$message.error(res.data.msg)
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
        params['size'] = this.page.pageSize
        params['current'] = this.page.currentPage;
        params["ancestors"] = this.ancestors;
        params['moreParamQuery'] = this.moreParamQuery;
        params['empType'] = 1;
        this.loading = true
        getTableData(params).then(r => {
          this.loading = false;
          if(r.data.code == 200){
            let d = r.data.data;
            this.page.total = d.total;
            d.records.forEach(v => {
              v.deptName = v.gradeName + v.className;
            })
            this.tableData = d.records;
          }
        }).catch(() => {
          this.loading = false;
        })
      },
      searchReset(){
        this.moreParamQuery = ""
        this.ancestors = ""
        this.search()
      },
      handleExport(){
        this.$confirm("是否导出毕业生信息?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-basic/resign/list/export?${website.tokenHeader}=${getToken()}&moreParamQuery=${this.moreParamQuery}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&empType=1`
          );
        });
      },
      ztreeClick(ztreeNode){
        this.ancestors = ztreeNode.valueStr;
        this.search()
      },
      selectionChange({records}){
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
      openPreview(url) {
        let arr = [{ thumbUrl: url, url: url }];
        this.$ImagePreview(arr, 0);
      },
    },
    computed:{
      ...mapGetters(['permission']),
      tableHeight(){
        return window.innerHeight-264
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
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
            slots:{default:'faceUrl'}
          },
          {
            title:"学号",
            field:"empCode",
            sortable: true,
            minWidth: 100,
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
            field:"deptName",
            sortable: true,
            minWidth: 100,
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
            title:"学籍号",
            field:"studentCode",
            sortable: true,
            minWidth: 140,
          },
          {
            title:"入学日期",
            field:"entryYear",
            sortable:true,
            minWidth:100
          },
          {
            title:"离校日期",
            field:"resignDate",
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
