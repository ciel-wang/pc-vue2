<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i
        :style="arrowCfgStyleCommon"
        @click="leftClick"
        v-if="arrowCfg['left'] == 4"
        :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <dorm-ztree ref="dormZtreeRef" @click="ztreeClick" :noDorm="true"></dorm-ztree>
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
            style="width: 200px;"
            @keyup.enter.native="search"
            v-model="dormName"
            placeholder="请输入宿舍编号">
          </el-input>
          <el-select v-model="dormType" placeholder="请选择宿舍类型" size="small" clearable style="width: 150px;margin: 0 10px;">
            <el-option
              v-for="item in dormTypeDic"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select v-model="dormSex" placeholder="请选择宿舍类别" size="small" clearable style="width: 150px;">
            <el-option
              v-for="item in dormSexDic"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <el-select v-model="dormStatus" placeholder="请选择宿舍是否启用" size="small" clearable style="width: 150px;margin: 0 10px;">
            <el-option
              v-for="item in dormStatusDic"
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
        <div style="margin: 8px 0;">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="handleAdd"
            v-if="permissionList.addBtn">
            添加</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit"
            v-if="permissionList.editBtn">
            编辑</el-button>
          <el-button
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete"
            v-if="permissionList.delBtn"
            >删除</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-download"
            @click="handleExport"
            v-if="permissionList.exportBtn"
            >导出</el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleAutoDormitory"
            v-if="permissionList.autoBtn">
            批量创建宿舍</el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleAddAssets"
            v-if="permissionList.addFixedBtn">
            添加固定资产</el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleFixedAssets"
            v-if="permissionList.fixedMngBtn">
            固定资产管理</el-button>
          <el-button
            type="primary"
            size="small"
            @click="dormEnabledClick"
            v-if="permissionList.startDormBtn">
            宿舍启用</el-button>
          <el-button
            type="primary"
            size="small"
            @click="dormOutageClick"
            v-if="permissionList.stopDormBtn">
            宿舍停用</el-button>
          <el-button
            type="primary"
            size="small"
            @click="BedCabinetManageClick"
            v-if="permissionList.bedBtn">
            床/柜管理</el-button>
        </div>
        <vxe-grid
          border
          resizable
          auto-resize
          :height="tableHeight"
          keep-source
          ref="xGrid"
          size="mini"
          align="center"
          :highlight="true"
          :columns="tableColumn"
          :loading="loading"
          :data="tableData"
          :export-config="{}"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
          <template #dormStatus="{row}">
            <i class="icon-xuanzhong" v-if="row.dormStatus == 1" :style="{ color: colorName }"></i>
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
      </basic-container>
      <el-dialog
        :title="addEditTitle"
        :visible.sync="dialogVisible"
        width="38%"
        top="10vh"
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

          <template slot-scope="scope" slot="label">
            <div style="font-size: 12px;color: #606266;line-height: 18px;margin-top: 2px;">宿舍编号组成：楼栋号楼层号房号。房号根据宿舍数量自动生成01、02......</div>
          </template>
        </avue-form>
      </el-dialog>
      <el-dialog
        :title="assetsTitle"
        :visible.sync="assetDialogVisible"
        width="30%"
        :before-close="escClose"
        append-to-body
        :modal-append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false">
        <avue-form
          ref="assetFormRef"
          :option="assetOption"
          v-model="assetform"
          @submit="assetSubmit"
          @error="error">
          <template slot-scope="scope" slot="menuForm">
            <el-button @click="escClose" icon="el-icon-close">取消</el-button>
          </template>
        </avue-form>
      </el-dialog>

      <fixed-assets-manage ref="fixedAssetsManageRef" @addEditAssets="handleAddAssets"></fixed-assets-manage>
      <bed-cabinet-manage ref="BedCabinetManageRef" @refeshPage="search"></bed-cabinet-manage>
    </el-col>
  </el-row>
</template>

<script>
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import { getTableData, addDorm, dormDetails, updateDorm, removeDorm, updateAssets, addAssets, batchDormstatus} from "@/api/dorm/dorm_mng.js"
  import dormZtree from "@/components/dorm-ztree/index.vue"
  import fixedAssetsManage from "./fixed-assets-manage.vue"
  import { getDormZtree } from "@/api/dorm/dorm_mng.js";
  import BedCabinetManage from "./bed-cabinet-manage.vue"
  import { validatenum } from '@/util/validate.js'

  export default{
    components:{dormZtree, fixedAssetsManage,BedCabinetManage},
    data(){
      return{
        ztreeHeight:0,
        tableHeight:0,
        dormName:'',
        page:{
          pageSize: 30,
          currentPage: 1,
          total: 0
        },
        loading:false,
        tableData:[],
        selectionList:[],
        dialogVisible:false,
        addEditTitle:"添加",
        form:{},
        dormNameDispaly:false,
        doorNumDispaly:false,
        isMultiple:false,
        floorIdDic:[],
        waterCtrlDic:[],
        electronicDevDic:[],
        doorLockDevDic:[],
        assetDialogVisible:false,
        assetform:{},
        assetsTitle:"添加固定资产",
        ancestors:"",
        autoDisplay:false,
        dormTypeDic:[
          {value:1,label:"宿舍"},{value:2,label:"公寓"}
        ],
        dormType:"",
        dormSex:"",
        dormSexDic:[
          {value:1,label:"男生宿舍"},{value:2,label:"女生宿舍"},{value:0,label:"其他"}
        ],
        dormStatusDic:[
          {value:true,label:"是"},{value:false,label:"否"}
        ],
        dormStatus:"",
        group1Display:false,
        editDisplay:false
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.tableHeight=window.innerHeight-313;
      this.search()

    },
    methods:{
      openDialog(){
        getDormZtree({stype:'NODORM'}).then(r => {
          this.floorIdDic = r.data;
        })
      },
      dormEnabledClick(){
        if ( this.selectionList.length == 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        let flag = false;
        this.selectionList.forEach(v => {
          if (v.dormStatus == "1") {
            flag = true;
          }
        });
        if (flag) {
          this.$message.warning("请勾选未启用状态");
          return;
        }
        this.$confirm("您确定要启用吗?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(()=>{
          return batchDormstatus({ids:this.ids,dormStatus:true});
        }).then((r)=>{
          if(r.data.code == 200){
            this.$message.success(r.data.msg);
          }else{
            this.$message.error(r.data.msg);
          }
          this.search();
        })
      },
      dormOutageClick(){
        if ( this.selectionList.length == 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        let flag = false;
        this.selectionList.forEach(v => {
          if (v.dormStatus != "1") {
            flag = true;
          }
        });
        if (flag) {
          this.$message.warning("请勾选启用状态");
          return;
        }
        this.$confirm("您确定要停用吗?",{
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(()=>{
          return batchDormstatus({ids:this.ids,dormStatus:false});
        }).then((r) => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg);
          }else{
            this.$message.error(r.data.msg);
          }
          this.search();
        })
      },
      BedCabinetManageClick(){
        if ( this.selectionList.length != 1) {
          this.$message.warning("请选择一条数据");
          return;
        }
        this.$refs.BedCabinetManageRef.openDialog({dormId:this.selectionList[0].id})
      },
      submit(form,done){
        if(this.doorNumDispaly){
          form['autoType'] = 1
          let arr = form.floorIds;
          let arr2 = []
          arr.forEach(v => {
            let val = v.split("-")
            if(val[0] == "FLOOR" && val[2] == 2){
              arr2.push(v)
            }
          })
          form['floorIds'] = arr2.join(',')
        }else{
          form['autoType'] = 0
          if(this.btn == "add"){
            let floorArr = form.floorIds.split('-');
            if(!(floorArr[0] == "FLOOR" && floorArr[2] == 2)){
              this.$message.warning("请选择到楼层");
              done();
              return;
            }
          }
        }
        if(this.btn == "edit"){
          updateDorm(form).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.search()
              this.$refs.dormZtreeRef.getDormZtreeInit();
              done();
            }else{
              this.$message.error(r.data.msg);
              done();
            }
          }).catch(() => {
            done();
          })
        }else{
          addDorm(form).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.handleClose()
              this.search()
              this.$refs.dormZtreeRef.getDormZtreeInit();
              done();
            }else{
              this.$message.error(r.data.msg);
              done();
            }
          }).catch(() => {
            done();
          })
        }
      },
      handleClose(){
        // this.form = {}
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
      handleAdd(){
        this.doorNumDispaly = false;
        this.dormNameDispaly = true;
        this.addEditTitle = "添加宿舍"
        this.form = {dormSex:1,waterCtrl:false,doorlockCtl:false,electricityCtrl:false,dormStatus:true,dormType:1,costType:0}
        this.btn = "add"
        this.autoDisplay = true
        this.isMultiple = false
        this.editDisplay = true
        this.openDialog()
        this.dialogVisible = true;
      },
      handleEdit(){
        if(this.selectionList.length != 1){
          this.$message.warning("请选择一条数据")
          return;
        }
        dormDetails({id:this.selectionList[0].id}).then(r => {
          let d = r.data.data;
          d.waterCtrl = d.waterDevId == 0 ? false : true;
          d.electricityCtrl = d.electricityDevId == 0 ? false : true;
          d.doorlockCtl = d.doorlockDevId == 0 ? false : true;
          this.form = d
          this.doorNumDispaly = false;
          this.dormNameDispaly = true;
          this.addEditTitle = "编辑宿舍"
          this.btn = "edit"
          this.autoDisplay = true
          this.isMultiple = false
          this.editDisplay = false
          this.dialogVisible = true;
        })
      },
      handleAutoDormitory(){
        this.addEditTitle = "批量创建宿舍"
        this.doorNumDispaly = true;
        this.dormNameDispaly = false;
        this.form = {dormSex:1,dormStatus:true,dormType:1,costType:0}
        this.autoDisplay = false
        this.isMultiple = true
        this.editDisplay = true
        this.openDialog()
        this.dialogVisible = true;
        this.btn = "autoAdd"
      },
      handleAddAssets(val){
        if(val.form){
          this.assetDialogVisible = true
          this.assetsTitle = "编辑固定资产"
          this.assetform = val.form
          this.assetform.id = val.id
          this.btn = "edit"
        }else{
          if(this.selectionList.length == 0){
            this.$message.warning("请选择至少一条数据")
            return;
          }
          this.assetDialogVisible = true
          this.assetsTitle = "添加固定资产"
          this.assetform.propertyCount = 1
          this.btn = "add"
        }
      },
      assetSubmit(form,done){
        if(this.btn == "edit"){
          updateAssets(form).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.escClose()
              this.$refs.fixedAssetsManageRef.search();
              done();
            }else{
              this.$message.error(r.data.msg);
              done();
            }
          }).catch(() => {
            done();
          })
        }else{
          form['dormIds'] = this.ids
          addAssets(form).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.escClose()
              done();
            }else{
              this.$message.error(r.data.msg);
              done();
            }
          }).catch(() => {
            done();
          })
        }
      },
      escClose(){
        this.$refs.assetFormRef.resetForm();
        this.$refs.assetFormRef.clearValidate();
        this.assetDialogVisible = false
      },
      handleFixedAssets(){
        this.$refs.fixedAssetsManageRef.assetDialogVisible = true;
        this.$refs.fixedAssetsManageRef.search();
      },
      handleDelete(){
        if ( this.selectionList.length == 0) {
          this.$message.warning("请选择要删除的数据");
          return;
        }
        let flag = false
        this.selectionList.forEach(v => {
          if(v.realLiveCount > 0){
            flag = true
          }
        })
        if(flag){
          this.$message.warning('宿舍中尚有人员入住，请将人员调换宿舍后再删除')
          return;
        }
        this.$confirm("确定要删除选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return removeDorm({ids:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
            this.$refs.dormZtreeRef.getDormZtreeInit();
          }
        })
      },
      search(){
        this.page.currentPage = 1;
        this.onLoad();
      },
      onLoad(){
        this.selectionList = []
        let params = {}
        params["size"] = this.page.pageSize
        params['current'] = this.page.currentPage
        params['dormName'] = this.dormName.trim()
        params['ancestors'] = this.ancestors;
        params['dormType'] = this.dormType;
        params['dormSex'] = this.dormSex
        params['dormStatus'] = this.dormStatus
        this.loading = true;
        getTableData(params).then(r => {
          this.loading = false
          let d = r.data.data
          this.page.total = d.total
          this.tableData = d.records;
        }).catch(() => {
          this.loading = false
        })
      },
      searchReset(){
        this.selectionList = []
        this.dormName = ""
        this.ancestors = ""
        this.dormType = ""
        this.dormSex = ""
        this.search()
        this.$refs.dormZtreeRef.getDormZtreeInit();
      },
      ztreeClick(val){
        this.ancestors = val.valueStr
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
      handleExport(){
        this.$confirm("是否导出宿舍管理信息?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          window.open(
            `/api/iot-dorm/dorm/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}&current=${this.page.currentPage}&size=${this.page.pageSize}&dormName=${this.dormName.trim()}&ancestors=${this.ancestors}&dormType=${this.dormType}&dormSex=${this.dormSex}&dormStatus=${this.dormStatus}`
          );
        });
      }
    },
    computed:{
      ...mapGetters(['permission', 'btnicon', 'colorName']),
      permissionList() {
        return {
          addBtn: this.vaildData(this.permission.dorm_dorm_add_btn, false),
          editBtn: this.vaildData(this.permission.dorm_dorm_edit_btn, false),
          delBtn: this.vaildData(this.permission.dorm_dorm_delete_btn, false),
          autoBtn: this.vaildData(this.permission.dorm_dorm_batch_add_btn, false),
          addFixedBtn: this.vaildData(this.permission.dorm_dorm_add_property_btn, false),
          fixedMngBtn: this.vaildData(this.permission.dorm_dorm_property_mng_btn, false),
          exportBtn: this.vaildData(this.permission.dorm_dorm_export_btn, false),
          startDormBtn: this.vaildData(this.permission.dorm_dorm_start_btn, false),
          stopDormBtn: this.vaildData(this.permission.dorm_dorm_stop_btn, false),
          bedBtn: this.vaildData(this.permission.dorm_dorm_bad_cabinet_mng_btn, false),
        }
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      assetOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label: "资产编号",
              prop: "propertyNum",
              span: 24,
              rules:[{
                required:true,
                message:"请输入资产编号",
                trigger:'blur'
              }],
              maxlength:20
            },
            {
              label: "物品名称",
              prop: "propertyName",
              span: 24,
              rules:[{
                required:true,
                message:"请输入物品名称",
                trigger:'blur'
              }],
              maxlength:20
            },
            {
              label: "规格或型号",
              prop: "propertyType",
              span: 24,
              maxlength:20
            },
            {
              label: "单位",
              prop: "propertyUnit",
              span: 24,
              maxlength:20
            },
            {
              label: "数量",
              prop: "propertyCount",
              span: 24,
              type:"number",
              minRows:1,
              maxRows:9999,
              controls:false,
              rules:[{
                required:true,
                message:"请输入数量",
                trigger:'blur'
              }],
            }
          ]
        }
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"选择楼层",
              prop:'floorIds',
              type:"tree",
              multiple:this.isMultiple,
              rules:[{
                required:true,
                message:"请选择所属楼层",
                trigger:'blur'
              }],
              span:12,
              dicData:this.floorIdDic,
              props:{
                value:"valueStr"
              },
              display:this.editDisplay
            },
            {
              label:"宿舍类型",
              prop:"dormType",
              type:"select",
              dicData:[
                {value:1,label:"宿舍"},{value:2,label:"公寓"}
              ],
              span:12,
              change:({value})=>{
                let that = this;
                if(value == 1){
                  that.group1Display = false
                }else{
                  that.group1Display = true
                }
              }
            },
            {
              label: "宿舍编号",
              prop: "dormName",
              rules: [{
                required: true,
                message: "请输入宿舍编号",
                trigger: "blur"
              }],
              span: 12,
              display:this.dormNameDispaly,
              maxlength:20
            },
            {
              label:"宿舍数量",
              prop:"doorNum",
              rules:[{
                required:true,
                message:"请输入宿舍数量",
                trigger:'blur'
              }],
              type: 'number',
              minRows:1,
              maxRows:99,
              precision:0,
              span:12,
              display:this.doorNumDispaly,
            },
            {
              label:"是否启用",
              prop:"dormStatus",
              type:"radio",
              dicData:[
                {value:true,label:"是"},{value:false,label:"否"}
              ],
              span:12
            },
            {
              label:"床位数",
              prop:"badCount",
              type: 'number',
              minRows:0,
              maxRows:99,
              precision:0,
              rules:[{
                required:true,
                message:'请输入床位数',
                trigger:"blur"
              }],
              span:12,
            },
            {
              label:"宿舍类别",
              prop:"dormSex",
              type:"radio",
              dicData:[
                {value:1,label:"男"},
                {value:2,label:"女"},
                {value:0,label:"其他"}
              ],
              span:12,
              rules:[{
                required:true,
                message:"请选择宿舍类别",
                trigger:"blur"
              }],
            },
            {
              labelWidth:20,
              prop:'label',
              span:24,
              formslot:true
            }
          ],
          group:[
            {
              prop:"group",
              label:"配套设施",
              display:this.autoDisplay,
              collapse:false,
              column:[
                {
                  label:"水控",
                  prop:"waterCtrl",
                  type:"radio",
                  dicData:[
                    {value:false,label:"停用"},{value:true,label:"启用"}
                  ],
                  span:12,
                  control:(val,form)=>{
                    if(val){
                      return{
                        waterDevId:{disabled:false,rules:[{
                          trigger:"blur",
                          message:"请选择水控设备",
                          required:true
                        }]}
                      }
                    }else{
                      return{
                        waterDevId:{disabled:true,rules:[]}
                      }
                    }
                  },
                },
                {
                  label:"水控设备",
                  prop:'waterDevId',
                  type:'select',
                  span:12,
                  dicData:this.waterCtrlDic,
                  disabled:true,
                },
                {
                  label:"电控",
                  prop:"electricityCtrl",
                  type:"radio",
                  dicData:[
                    {value:false,label:"停用"},{value:true,label:"启用"}
                  ],
                  span:12,
                  control:(val,form)=>{
                    if(val){
                      return{
                        electricityDevId:{disabled:false,rules:[{
                          trigger:"blur",
                          message:"请选择电控设备",
                          required:true
                        }]}
                      }
                    }else{
                      return{
                        electricityDevId:{disabled:true,rules:[]}
                      }
                    }
                  },
                },
                {
                  label:"电控设备",
                  prop:'electricityDevId',
                  type:'select',
                  span:12,
                  dicData:this.electronicDevDic,
                  disabled:true,
                },
                {
                  label:"门锁",
                  prop:"doorlockCtl",
                  type:"radio",
                  dicData:[
                    {value:false,label:"停用"},{value:true,label:"启用"}
                  ],
                  span:12,
                  control:(val,form)=>{
                    if(val){
                      return{
                        doorlockDevId:{disabled:false,rules:[{
                          trigger:"blur",
                          message:"请选择门锁设备",
                          required:true
                        }]}
                      }
                    }else{
                      return{
                        doorlockDevId:{disabled:true,rules:[]}
                      }
                    }
                  },
                },
                {
                  label:"门锁设备",
                  prop:'doorlockDevId',
                  type:'select',
                  span:12,
                  dicData:this.doorLockDevDic,
                  disabled:true,
                },
              ]
            },
            {
              prop:"group1",
              label:"收费标准",
              collapse:false,
              display:this.group1Display,
              column:[
                {
                  label:'收费标准',
                  prop:"costType",
                  type:'radio',
                  dicData:[
                    {value:0,label:"免费"},{value:1,label:"按床位"},{value:2,label:"按房间"}
                  ],
                  span:24,
                  control:(val,form)=>{
                    if(val == 0){
                      return{
                        costMoney:{display:false,rules:[]}
                      }
                    }else{
                      return{
                        costMoney:{display:true,rules:[{
                          validator: (rule, value, callback) => {
                            if(!value){
                              callback(new Error("请输入收费金额"));
                            }else if (validatenum(value,1)) {
                              callback(new Error("请输入正确格式的收费金额"));
                            } else {
                              callback();
                            }
                          },
                          trigger:"blur",
                          required:true
                        }]}
                      }
                    }
                  }
                },
                {
                  label:"收费金额",
                  prop:'costMoney',
                  append:'元/天',
                  span:12
                }
              ]
            }
          ]
        }
      },
      tableColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
          {
            title:"学校名称",
            field:"schoolName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"楼栋名称",
            field:"floorName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"楼层名称",
            field:"floorLayerName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"宿舍编号",
            field:"dormName",
            sortable:true,
            minWidth:100,
            fixed:"left"
          },
          {
            title:"床位数",
            field:"badCount",
            sortable:true,
            minWidth:100,
          },
          {
            title:"实际入驻人数",
            field:"realLiveCount",
            sortable:true,
            minWidth:110,
          },
          {
            title:"宿舍类型",
            field:"dormType",
            sortable:true,
            minWidth:100,
            formatter:({ cellValue })=>{
              return cellValue == 1 ? '宿舍' : "公寓"
            },
          },
          {
            title:"是否启用",
            field:"dormStatus",
            sortable:true,
            minWidth:100,
            slots:{default:"dormStatus"}
          },
          {
            title:"宿舍类别",
            field:"dormSex",
            sortable:true,
            minWidth:100,
            formatter:({ cellValue })=>{
              return cellValue == 1 ? '男生宿舍' : cellValue == 2 ? '女生宿舍' : "其他"
            },
          },
          {
            title:"收费标准",
            field:"costType",
            sortable:true,
            minWidth:100,
            formatter:({ cellValue })=>{
              return cellValue == 0 ? '免费' : cellValue == 1 ? '按床位收费' : "按房间收费"
            },
          },
          {
            title:"单价",
            field:"costMoney",
            sortable:true,
            minWidth:100
          },
          {
            title:"水控",
            field:"waterDevId",
            sortable:true,
            minWidth:100,
            formatter:({ cellValue })=>{
              return cellValue == 0 ? '停用' : cellValue
            },
          },
          {
            title:"电控",
            field:"electricityDevId",
            sortable:true,
            minWidth:100,
            formatter:({ cellValue })=>{
              return cellValue == 0 ? '停用' : cellValue
            },
          },
          {
            title:"门锁",
            field:"doorlockDevId",
            sortable:true,
            minWidth:100,
            formatter:({ cellValue })=>{
              return cellValue == 0 ? '停用' : cellValue
            },
          },
        ]
      }
    }
  }
</script>
