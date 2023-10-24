<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i
        :style="arrowCfgStyleCommon"
        @click="leftClick"
        v-if="arrowCfg['left'] == 4"
        :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <dorm-ztree ref="dormZtreeRef" @click="ztreeClick" :stype="false"></dorm-ztree>
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
            v-model="floorName"
            placeholder="请输入楼栋名称">
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
            >导出</el-button>
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
            type="danger"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete"
            v-if="permissionList.delBtn"
            >删除</el-button>
          <el-button
            type="primary"
            size="small"
            @click="handleAddFloor"
            v-if="permissionList.AutoBtn">
            批量创建楼层</el-button>
          <el-button
            type="primary"
            size="small"
            @click="devDialogVisible = true;btnType='dev'"
            v-if="permissionList.DevBtn">
            关联设备</el-button>
          <el-button type="primary" size="small" @click="handleAdmin" v-if="permissionList.AdminBtn">关联管理员/维修工</el-button>
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
          :edit-config="{trigger: 'click',mode: 'cell'}"
          :keyboard-config="{isEnter:true}"
          @edit-closed="editClosedEvent"
          @keydown="keydown"
          :span-method="mergeRowMethod"
          @checkbox-change="checkboxChangeEvent"
          @checkbox-all="checkboxChangeEvent">
        </vxe-grid>
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
          @submit="submit"
          @error="error">
          <template slot-scope="scope" slot="menuForm">
            <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
          </template>
        </avue-form>
      </el-dialog>
      <el-dialog
        :title="btnType == 'dev' ? '关联设备' : '关联管理员/维修工'"
        :visible.sync="devDialogVisible"
        width="30%"
        :before-close="escClose"
        append-to-body
        :modal-append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false">
        <avue-form
          ref="devformRef"
          :option="devOption"
          v-model="devform"
          @submit="devsubmit"
          @error="error">
          <template slot-scope="scope" slot="menuForm">
            <el-button @click="escClose" icon="el-icon-close">取消</el-button>
          </template>
          <template slot="adminEmpIds" slot-scope="scope">
              <div>
                  <span class="duplicateEmpItem" v-for="(v,i) in adminEmpList" :key="v.id">{{v.empName}}<i class="el-icon-close close" @click="adminEmpClick(i)"></i></span>
                  <span class="icon-tianjia" style="font-size: 40px !important;vertical-align: super;" @click="adminEmpAdd"></span>
              </div>
          </template>
          <template slot="mainTainEmpIds" slot-scope="scope">
              <div>
                  <span class="duplicateEmpItem" v-for="(v,i) in mainTainEmpList" :key="v.id">{{v.empName}}<i class="el-icon-close close" @click="mainTainEmpClick(i)"></i></span>
                  <span class="icon-tianjia" style="font-size: 40px !important;vertical-align: super;" @click="mainTainEmpAdd"></span>
              </div>
          </template>
        </avue-form>
      </el-dialog>

      <select-emp ref="selectEmpRef" @refreshPage="getEmpVal"></select-emp>
    </el-col>
  </el-row>
</template>

<script>
  import { getSchoolsZtreeData } from "@/api/iot/dept.js"
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import { getTableData, addFloor, removeFloor, updateFloor, getFloorDic, addAuto, getFloorDevDic, devSubmit, getFloorDevDetails, adminAuthSubmit, getFloorAdminDic} from "@/api/dorm/floor.js"
  import { getAreaAllEquipmentTree} from "@/api/iot/access/icauth";
  import dormZtree from "@/components/dorm-ztree/index.vue"
  import selectEmp from "@/views/kq/components/select-emp.vue"

  export default{
    components:{ dormZtree, selectEmp },
    data(){
      return{
        ztreeHeight:0,
        tableHeight:0,
        floorName:'',
        loading:false,
        tableData:[],
        selectionList:[],
        dialogVisible:false,
        form:{},
        schoolIdDic:[],
        parentData:[],
        display:false,
        gcNameLabel:"楼栋名称",
        dialogTitle:"添加",
        btnAddType:false,
        btnAutoType:false,
        ancestors:"",
        devArr:[],
        devDisplay:true,
        devDialogVisible:false,
        devform:{},
        btnType:"",
        adminEmpList:[],
        mainTainEmpList:[],
        goto:""
      }
    },
    mounted() {
      this.ztreeHeight=window.innerHeight-146;
      this.tableHeight=window.innerHeight-236;
      this.search()
    },
    activated() {
      getSchoolsZtreeData().then(r => {
        this.schoolIdDic = r.data.data;
      })
      this.initDev()
    },
    watch:{
      'form.floorType':{
        handler(val){
          if(val == 1){
            this.display = false;
            this.gcNameLabel = "楼栋名称"
            this.devDisplay = true
          }else{
            this.display = true;
            this.gcNameLabel = "楼层名称"
            this.devDisplay = false
          }
        }
      }
    },
    methods:{
      handleAdmin(){
        this.devDialogVisible = true;
        this.btnType='admin'
      },
      getEmpVal(v){
        let d = v;
        if(this.goto == "admin"){
          d.forEach(v => {
            this.adminEmpList.push({
              id:v.id,
              empName:v.empName.substring(v.empName.length-2),
            })
          })
          let obj = {};
          let arr = this.adminEmpList;
          arr = arr.reduce(function(item, next) {
            obj[next.id] ? '' : obj[next.id] = true && item.push(next);
            return item;
          }, []);
          this.adminEmpList = arr;
          let arr2 = [];
          arr.forEach(i => {
            arr2.push(i.id)
          });
          this.devform["adminEmpIds"] = arr2;
        }
        if(this.goto == "mainTain"){
          d.forEach(v => {
            this.mainTainEmpList.push({
              id:v.id,
              empName:v.empName.substring(v.empName.length-2),
            })
          })
          let obj = {};
          let arr = this.mainTainEmpList;
          arr = arr.reduce(function(item, next) {
            obj[next.id] ? '' : obj[next.id] = true && item.push(next);
            return item;
          }, []);
          this.mainTainEmpList = arr;
          let arr2 = [];
          arr.forEach(i => {
            arr2.push(i.id)
          });
          this.devform["mainTainEmpIds"] = arr2;
        }
      },
      adminEmpAdd(){
        this.goto = "admin"
        this.$refs['selectEmpRef'].openDialog({type:"adminEmp"});
      },
      mainTainEmpAdd(){
        this.goto = "mainTain"
        this.$refs['selectEmpRef'].openDialog({type:"mainTain"});
      },
      adminEmpClick(v){
        this.adminEmpList.splice(v,1);
        let arr = this.adminEmpList;
        let arr2 = [];
        arr.forEach(i => {
          arr2.push(i.id)
        });
        this.devform["adminEmpIds"] = arr2;
      },
      mainTainEmpClick(v){
        this.mainTainEmpList.splice(v,1);
        let arr = this.mainTainEmpList;
        let arr2 = [];
        arr.forEach(i => {
          arr2.push(i.id)
        });
        this.devform["mainTainEmpIds"] = arr2;
      },
      initDev(){
        getAreaAllEquipmentTree({stype:'floor-relevance'}).then(r => {
          this.devArr = r.data.data
        })
      },
      devsubmit(form,done){
        if(this.btnType == 'dev'){
          let arr = []
          form.doorIds.forEach(v => {
            if(v.startsWith('E') || v.startsWith('D')){
              arr.push(v)
            }
          })
          form.doorIds = arr.join(',')
          devSubmit(form).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.escClose()
              this.initDev()
              this.search()
              done();
            }else{
              this.$message.error(r.data.msg);
              done();
            }
          }).catch(() => {
            done()
          })
        }else{
          adminAuthSubmit(form).then(r => {
            if (r.data.code == 200) {
              this.$message.success(r.data.msg);
              this.escClose();
              this.search();
              done();
            } else {
              this.$message.error(r.data.msg);
              done();
            }
          }).catch(() => {
            done();
          });
        }

      },
      escClose(){
        this.devform = {}
        this.adminEmpList = []
        this.mainTainEmpList = []
        this.$refs.devformRef.resetForm();
        this.$refs.devformRef.clearValidate();
        this.devDialogVisible = false;
      },
      submit(form,done){
        if(this.btnAutoType){
          addAuto(form).then(r => {
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
          if(form.doorIds){
            let arr = []
            form.doorIds.forEach(v => {
              if(v.startsWith('E') || v.startsWith('D')){
                arr.push(v)
              }
            })
            form.doorIds = arr.join(',')
          }
          addFloor(form).then(r => {
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
        this.form = {}
        this.$refs.formRef.resetForm();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
      handleAdd(){
        this.dialogVisible = true;
        this.dialogTitle = "添加"
        this.btnAddType = true
        this.btnAutoType = false
        this.form.floorType = 1;
      },
      handleAddFloor(){
        this.dialogVisible = true;
        this.display = true;
        this.btnAddType = false
        this.btnAutoType = true
        this.dialogTitle = "批量创建楼层"
        this.devDisplay = false
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
          return removeFloor({ids:this.ids});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
            this.$refs.dormZtreeRef.getDormZtreeInit();
          }
        })
      },
      search(){
        let params = {}
        params['floorName'] = this.floorName.trim()
        params['ancestors'] = this.ancestors;
        this.loading = true;
        getTableData(params).then(r => {
          this.loading = false
          let d = r.data.data
          d.forEach(v => {
            v.devName = []
            if(v.devs){
              let dataInfo = {};
              v.devs.forEach((item, index) => {
                let { devName } = item;
                if (!dataInfo[devName]) {
                  dataInfo[devName] = {
                    devName,
                    child: []
                  }
                }
                dataInfo[devName].child.push(item.doorName);
              });
              let list = Object.values(dataInfo);
              list.forEach(i => {
                v.devName.push(`${i.devName}( ${i.child.join(',')} )   `)
              })
              v.devName = v.devName.join(' , ')
            }
          })
          this.tableData = d;
        }).catch(() => {
          this.loading = false
        })
      },
      searchReset(){
        this.floorName = ""
        this.ancestors = ""
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
      mergeRowMethod({ row, _rowIndex, column, visibleData }){
        const fields = ['floorName','schoolName','devName']
        const cellValue = row[column.property]
        if (cellValue && fields.includes(column.property)) {
          const prevRow = visibleData[_rowIndex - 1]
          let nextRow = visibleData[_rowIndex + 1]
          if (prevRow && prevRow[column.property] === cellValue) {
            return { rowspan: 0, colspan: 0 }
          } else {
            let countRowspan = 1
            while (nextRow && nextRow[column.property] === cellValue) {
              nextRow = visibleData[++countRowspan + _rowIndex]
            }
            if (countRowspan > 1) {
              return { rowspan: countRowspan, colspan: 1 }
            }
          }
        }
      },
      keydown({$event}){
        if($event.keyCode == 13){
          this.$refs.xGrid.clearActived()
        }
      },
      editClosedEvent({ row, column }){
        const $table = this.$refs.xGrid
        let type = column.property
        if ($table.isUpdateByRow(row, type)) {
          let form = {}
          if(type == "floorName"){
            form['id'] = row.floorId
            form['floorName'] = row.floorName;
          }else{
            form['id'] = row.floorLayerId
            form['floorName'] = row.floorLayerName;
          }
          updateFloor(form).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              this.$refs.dormZtreeRef.getDormZtreeInit();
            }else{
              this.$message.error(r.data.msg);
            }
            this.search()
          }).catch(() => {
            this.search()
          })
        }
      },
      getSchoolFloorList(data){
        getFloorDic({schoolId:data.value,parentId:0}).then(r => {
          if(r.data.code == 200){
            let d = r.data.data
            let arr = []
            d.forEach(v => {
              arr.push({
                value:v.id,
                label:v.floorName
              })
            })
            this.parentData = arr
          }
        })
      },
      handleExport() {
        this.$refs.xGrid.exportData({
          filename: '楼栋管理',
          type: 'csv',
          isHeader: true,
          columnFilterMethod: ({ column, $columnIndex }) => {
            if (column.type === 'checkbox') {
              return false;
            } else {
              return true;
            }
          }
        });
      },
      getFloorInfo(value){
        getFloorDevDetails({id:value}).then(r => {
          if(r.data.code == 200){
            let d = r.data.data
            let arr = []
            if(d.doorIds){
              arr = d.doorIds.split(',')
            }
            this.$nextTick(() => {
              this.$set(this.devform,'doorIds',arr)
            })
            this.$forceUpdate()
          }
        })
        getFloorAdminDic({floorId:value}).then(r => {
          if(r.data.code == 200){
            let d = r.data.data
            let arr1 = [],arr2 = [],arr3 = [],arr4 = []
            d.forEach(v => {
              if(v.authType == 1){
                arr1.push({
                  id:v.id,
                  empName:v.empName.substring(v.empName.length-2),
                })
                arr2.push(v.id)
              }else{
                arr3.push({
                  id:v.id,
                  empName:v.empName.substring(v.empName.length-2),
                })
                arr4.push(v.id)
              }
            })
            this.devform.adminEmpIds = arr2
            this.devform.mainTainEmpIds = arr4
            this.adminEmpList = arr1
            this.mainTainEmpList = arr3
          }
        })
      }
    },
    computed:{
      ...mapGetters(['permission']),
      permissionList() {
        return {
          addBtn: this.vaildData(this.permission.dorm_floor_add_btn, false),
          delBtn: this.vaildData(this.permission.dorm_floor_delete_btn, false),
          AutoBtn: this.vaildData(this.permission.dorm_floor_batch_add_layer_btn, false),
          DevBtn: this.vaildData(this.permission.dorm_floor_add_dev_btn, false),
          AdminBtn: this.vaildData(this.permission.dorm_floor_add_admin_maintain_btn, false),
          exportBtn: this.vaildData(this.permission.dorm_floor_export_btn, false),
        };
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          if(ids.floorLayerId){
            ids.push(ele.floorLayerId);
          }else{
            ids.push(ele.floorId);
          }
        });
        return ids.join(",");
      },
      devOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
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
                this.getSchoolFloorList(data);
              }
            },
            {
              label: "所属楼栋",
              prop: "floorId",
              type:"select",
              rules: [{
                required: true,
                message: "请选择所属楼栋",
                trigger: "blur"
              }],
              dicData:this.parentData,
              span: 24,
              change:({value})=>{
                let that = this;
                if(value) that.getFloorInfo(value);
              }
            },
            {
              label:"选择设备",
              prop:"doorIds",
              span:24,
              type:"tree",
              dicData:this.devArr,
              props:{
                value:"valueStr"
              },
              multiple:true,
              display:this.btnType == 'dev' ? true : false
            },
            {
              label:"管理员",
              prop:"adminEmpIds",
              span:24,
              formslot:true,
              display:this.btnType == 'admin' ? true : false
            },
            {
              label:"维修工",
              prop:"mainTainEmpIds",
              span:24,
              formslot:true,
              display:this.btnType == 'admin' ? true : false
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
              label: "类型",
              prop: "floorType",
              type:"select",
              rules: [{
                required: true,
                message: "请选择类型",
                trigger: "blur"
              }],
              dicData:[
                {value:1,label:"楼栋"},
                {value:2,label:"楼层"}
              ],
              span: 24,
              display:this.btnAddType
            },
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
                if(this.form.floorType == 2 || this.btnAutoType){
                  this.getSchoolFloorList(data);
                }
              }
            },
            {
              label: "所属楼栋",
              prop: "parentId",
              type:"select",
              rules: [{
                required: true,
                message: "请选择所属楼栋",
                trigger: "blur"
              }],
              dicData:this.parentData,
              span: 24,
              display:this.display
            },
            {
              label:this.gcNameLabel,
              prop:"floorName",
              rules:[{
                required:true,
                message:"请输入"+this.gcNameLabel,
                trigger:"blur"
              }],
              span:24,
              display:this.btnAddType,
              maxlength:10
            },
            {
              label:"选择设备",
              prop:"doorIds",
              span:24,
              type:"tree",
              dicData:this.devArr,
              props:{
                value:"valueStr"
              },
              multiple:true,
              display:this.devDisplay
            },
            {
              label:"楼层数量",
              prop:"floorNum",
              type: 'number',
              minRows:1,
              maxRows:100,
              precision:0,
              span:24,
              rules:[{
                required:true,
                message:"请输入楼层数量",
                trigger:"blur"
              }],
              display:this.btnAutoType
            }
          ]
        }
      },
      tableColumn(){
        return[
          { type: 'checkbox', width: 70,fixed:"left" },
          {
            title:"学校名称",
            field:"schoolName",
            sortable:true,
            minWidth:100,
          },
          {
            title:"楼栋名称",
            field:"floorName",
            sortable:true,
            minWidth:100,
            editRender:{ name: 'input',attrs:{maxlength:10}},
          },
          {
            title:"设备名称",
            field:"devName",
            sortable:true,
            minWidth:100,
          },
          {
            title: '管理员',
            field: 'adminEmpNames',
            sortable: true,
            minWidth: 100
          },
          {
            title: '维修工',
            field: 'maintainEmpNames',
            sortable: true,
            minWidth: 100
          },
          {
            title:"楼层名称",
            field:"floorLayerName",
            sortable:true,
            minWidth:100,
            editRender:{ name: 'input',attrs:{maxlength:10}},
          },
        ]
      }
    }
  }
</script>

<style scoped>
    .duplicateEmpItem{
        width: 36px;
        height: 37px;
        border: 2px solid #E8E8E8;
        padding: 2px;
        border-radius: 6px;
        display: inline-block;
        font-size: 12px;
        margin-right: 5px;
        text-align: center;
        vertical-align: text-bottom;
        position: relative;
    }
    .close{
        position: absolute;
        top: -4px;right: -4px;
        font-size: 13px;
        padding: 1px;
        background-color: red;
        border-radius: 13px;
        color: #fff;
        cursor: pointer;
    }
</style>
