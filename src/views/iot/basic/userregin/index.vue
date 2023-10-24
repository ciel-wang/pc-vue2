<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i
        :style="arrowCfgStyleCommon"
        @click="leftClick"
        v-if="arrowCfg['left'] == 4"
        :class="arrowCfgClassLeftName"
      ></i>
      <div class="ztreeStyle" :style="{height:ztreeHeight+'px'}">
        <dept-ztree ref="deptZtreeRef" @click="ztreeClick"></dept-ztree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i
        :style="arrowCfgStyleCommon"
        @click="rightClick"
        v-if="arrowCfg['right'] == 24"
        :class="arrowCfgClassRightName"
      ></i>
      <basic-container>
        <div class="searchBox">
          <el-input
            placeholder="输入工号/姓名/手机号"
            @keyup.enter.native="search"
            v-model.trim="moreParamQuery"
            style="width: 200px;margin-right: 10px;"
            size="small" clearable
          ></el-input>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-search"
            @click="search"
            >搜索</el-button>
          <el-button
            type="default"
            size="small"
            icon="el-icon-refresh"
            @click="searchReset"
            >重置</el-button>
        </div>
        <vxe-grid
          border
          resizable
          auto-resize
          highlight-hover-row
          :height="tableHeight"
          ref="crud"
          size="mini"
          align="center"
          :highlight="true"
          :columns="tableColumn"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :data="tableData"
          :toolbar-config="{custom:true,slots: { buttons: 'toolbar_buttons' }}"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
          <template #toolbar_buttons>
            <el-button
              type="primary"
              size="small"
              @click="handleRestore"
              v-if="permission.userregin_reinstatement_btn"
              >复职</el-button>
            <!-- <el-button
              type="danger"
              size="small"
              @click="handleDelete"
              v-if="permission.userregin_del_btn"
              >删除</el-button> -->
            <el-button
              type="primary"
              size="small"
              @click="handleExport"
              v-if="permission.userregin__export_btn"
              >导出</el-button>
          </template>
          <template #faceUrl="{ row }">
            <img :src="row.faceUrl+'?time='+ new Date().getTime()" v-if="row.faceUrl.length > 45" width="30px" height="30px"  @click="openPreview(row.faceUrl+'?time='+ new Date().getTime())" />
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
  import deptZtree from '@/components/dept-ztree/index.vue'
  import { getTableData, removeEmp, restoreEmp } from "@/api/iot/studentfinish.js"

  export default{
    components:{deptZtree},
    data(){
      return{
        ztreeHeight:0,
        tableHeight:0,
        moreParamQuery:"",
        loading:false,
        tableData:[],
        page:{
          pageSize:30,
          currentPage:1,
          total:0
        },
        selectionList:[],
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.tableHeight=window.innerHeight-264;
      this.search();
    },
    methods:{
      handleRestore(){
        if (this.selectionList.length === 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        this.$confirm("此操作可恢复离校前该人员的使用记录！", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return restoreEmp({ids:this.ids.split(',')});
        }).then(() => {
          this.search();
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        });
      },
      handleDelete(){
        if (this.selectionList.length === 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        this.$confirm(
          "警告：此处删除为彻底删除，成功删除后，将会把该人员所有记录从数据库中删除，诸如刷卡记录、消费记录、充值记录等，请勿误操作!",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        ).then(() => {
          return removeEmp(this.ids);
        }).then(() => {
          this.search()
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        });
      },
      handleExport(){
        this.$confirm("是否导出离校用户数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(`/api/iot-basic/resign/list/export?${website.tokenHeader}=${getToken()}&ancestors=${this.ancestors}&moreParamQuery=${this.moreParamQuery}&ids=${this.ids}&size=${this.page.pageSize}&current=${this.page.currentPage}&empType=2`);
        })
      },
      search(){
        this.page.currentPage = 1
        this.selectionList = []
        this.onLoad()
      },
      onLoad(){
        this.loading = true;
        let params = {}
        params['size'] = this.page.pageSize;
        params['current'] = this.page.currentPage;
        params["moreParamQuery"] = this.moreParamQuery;
        params['ancestors'] = this.ancestors;
        params['empType'] = 2;
        getTableData(params).then(r => {
          this.loading = false;
          if(r.data.code == 200){
            let d = r.data.data
            this.page.total = d.total;
            this.tableData = d.records;
          }
        }).catch(() => {
          this.loading = false
        })
      },
      searchReset(){
        this.moreParamQuery = ""
        this.ancestors = ""
        this.search();
        this.$refs.deptZtreeRef.getDeptZtreeInit();
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
      ztreeClick(treeNode){
        this.ancestors = treeNode.valueStr;
        this.search()
      },
      openPreview(url) {
        let arr = [{
          thumbUrl: url,
          url: url
        }];
        this.$ImagePreview(arr, 0);
      },
    },
    computed:{
      ...mapGetters(['permission']),
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
            title:"部门名称",
            field:"deptName",
            sortable: true,
            width: 120,
          },
          {
            title:"学校名称",
            field:"schoolName",
            sortable:true,
            minWidth:120
          },
          {
            title:"职工状态",
            field:"empStatusStr",
            sortable: true,
            minWidth: 100,
          },
          {
            title:"职工类型",
            field:"empCategoryStr",
            sortable: true,
            minWidth: 100,
          },
          {
            title:"入职日期",
            field:"entryYear",
            sortable: true,
            minWidth: 110,
          },
          {
            title:"离职方式",
            field:"resignTypeStr",
            sortable: true,
            minWidth: 100,
            visible:false
          },
          {
            title:"离校日期",
            field:"resignDate",
            sortable: true,
            minWidth: 100,
            // formatter:({ cellValue })=>{
            //   return cellValue ? cellValue.substr(0,10) : ""
            // }
          },
          {
            title:"手机号",
            field:"empPhone",
            sortable: true,
            minWidth: 110,
            visible:false
          },
          {
            title:"身份证号",
            field:"idCardNo",
            sortable: true,
            minWidth: 140,
            visible:false
          },
          {
            title:"邮箱",
            field:"empEmail",
            sortable: true,
            minWidth: 140,
            visible:false
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
    },
  }
</script>
