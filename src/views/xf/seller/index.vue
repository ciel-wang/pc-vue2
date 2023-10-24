<template>
  <el-row>
    <el-col class="col-real-pos" :span="arrowCfg['left']">
      <i :style="arrowCfgStyleCommon" @click="leftClick" v-if="arrowCfg['left'] == 4" :class="arrowCfgClassLeftName"></i>
      <div class="ztreeStyle" :style="{ height: ztreeHeight + 'px' }">
        <seller-tree @click="clickCallBack" ref="sellerTree"></seller-tree>
      </div>
    </el-col>
    <el-col :span="arrowCfg['right']">
      <i :style="arrowCfgStyleCommon" @click="rightClick" v-if="arrowCfg['right'] == 24" :class="arrowCfgClassRightName"></i>
      <basic-container>
        <div>
          <el-input
            style="width: 200px;margin-right: 10px;"
            size="small"
            @keyup.enter.native="searchHandler"
            placeholder="输入商户名称"
            clearable
            v-model="sellerName"></el-input>
          <el-button
            type="primary"
            size="small"
            @keyup.enter.native="search"
            icon="el-icon-search"
            @click="searchHandler">搜索</el-button>
          <el-button type="default" size="small" icon="el-icon-refresh" @click="searchReset">重置</el-button>
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
          :columns="options"
          :loading="loading"
          :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}"
          :toolbar-config="{slots: { buttons: 'toolbar_buttons' }}"
          :data="areaData"
          :export-config="{}"
          @checkbox-change="selectionChange"
          @checkbox-all="selectionChange">
          <template #toolbar_buttons>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.seller_add_btn">添加</el-button>
            <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.seller_edit_btn">编辑</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permission.seller_del_btn">删 除</el-button>
            <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.seller_export_btn">导出</el-button>
          </template>
          <template #devNames="{row}">
            <el-tag size="mini"
              v-for="(item,i) in row.devNames && row.devNames.split(',')" :key="'devNames'+i"
              style="margin:0 4px 4px 0;">{{item}}</el-tag>
          </template>
          <template #sellerState="{row}">
            <i class="icon-xuanzhong" v-if="row.sellerState" :style="{color: colorName}"></i>
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
          width="50%"
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
    </el-col>
  </el-row>
</template>

<script>
import { getList, addSeller, updateSeller, removeSeller, getDetails } from '@/api/xf/seller';
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import SellerTree from '@/components/sellertree/index';
import { getSchoolsZtreeData } from "@/api/iot/dept.js"
import { getBizDictByCode } from "@/api/common.js"

export default {
  components: { SellerTree },
  data() {
    return {
      areaData: [],
      sellerName: '',
      ancestors: "",
      selectionList: [],
      query: {},
      loading: true,
      page: {
        pageSize: 30,
        currentPage: 1,
        total: 0
      },
      treeDeptId: '',
      ztreeHeight: 0,
      tableHeight: 0,
      dialogTitle:"添加",
      dialogVisible:false,
      form:{},
      sellerStateDic:[{ label: '启用', value: true }, { label: '停用', value: false }],
      walletSeqDic:[],
      schoolIdDic:[],
    };
  },
  mounted() {
    this.ztreeHeight = window.innerHeight - 146;
    this.tableHeight = window.innerHeight - 264;
    this.onLoad(this.page);
  },
  activated() {
    getSchoolsZtreeData().then(r => {
      this.schoolIdDic = r.data.data;
    })
    getBizDictByCode({ code:'xfWalletDeductNum'}).then(r => {
      let arr = r.data.data.xfWalletDeductNum.map(v => ({ value:v.key*1, label:v.value }));
      this.walletSeqDic = arr;
    })
  },
  methods: {
    handleAdd(){
      this.dialogTitle = "添加"
      this.dialogVisible = true;
      this.type = "add"
    },
    handleEdit(){
      if (this.selectionList.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      var id = this.selectionList[0].id;
      getDetails(id).then(res => {
        this.form = res.data.data;
      });
      this.dialogTitle = "编辑"
      this.dialogVisible = true;
      this.type = "edit"
    },
    submit(row, done) {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          if(this.type == "edit"){
            delete row.createTime;
            delete row.$walletSeq;
            updateSeller(row).then(() => {
              this.onLoad(this.page);
              this.$message({
                type: 'success',
                message: '操作成功!'
              });
              this.handleClose()
              done();
              this.$refs.sellerTree.initSellerTree();
            },error => {
                window.console.log(error);
                done();
              }
            );
          }else{
            delete row.$walletSeq;
            let sellerSeq = parseInt(row.sellerSeq);
            if ('NaN' == sellerSeq.toString()) {
              this.$message.warning('请填写数字格式的序号');
              return;
            }
            addSeller(row).then(() => {
              this.onLoad(this.page);
              this.$message({
                type: 'success',
                message: '操作成功!'
              });
              this.handleClose()
              this.$refs.sellerTree.initSellerTree();
              done();
            },error => {
                window.console.log(error);
                done();
              }
            );
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
    clickCallBack(treeNode) {
      this.ancestors = treeNode.valueStr;
      this.onLoad(this.page);
    },
    searchHandler() {
      this.page.currentPage = 1
      this.selectionList = []
      this.onLoad(this.page);
    },
    onLoad(page, params = {}) {
      params['moreQueryParam'] = this.sellerName.trim();
      params['ancestors'] = this.ancestors;
      this.loading = true;
      getList(page.currentPage, page.pageSize, Object.assign(params, this.query)).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        let records = data.records;
        this.areaData = records;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    searchReset() {
      this.sellerName = '';
      this.ancestors = "";
      this.searchHandler();
      this.$refs.sellerTree.initSellerTree();
    },
    selectionChange({records}) {
      this.selectionList = records;
    },
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.onLoad(this.page);
    },
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.onLoad(this.page);
    },
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeSeller({ ids: this.ids });
      }).then(() => {
        this.$refs.sellerTree.initSellerTree();
        this.onLoad(this.page);
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      });
    },
    handleExport() {
      this.$confirm('是否导出商户数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(
          `/api/iot-xf/seller/export?current=${this.page.currentPage}&size=${this.page.pageSize}&${this.website.tokenHeader}=${getToken()}&moreQueryParam=${this.sellerName.trim()}&ids=${this.ids}`
        );
      });
    },
  },
  computed: {
    ...mapGetters(['permission','colorName']),
    permissionList() {
      return {
        addBtn: this.vaildData(this.permission.seller_add_btn, false),
        editBtn: this.vaildData(this.permission.seller_edit_btn, false),
        delBtn: this.vaildData(this.permission.seller_del_btn, false),
        exportBtn: this.vaildData(this.permission.seller_export_btn, false)
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
    addEditOption(){
      return{
        emptyBtn: false,
        submitText: "保存",
        column:[
          {
            label:"学校名称",
            prop:"schoolId",
            type:'tree',
            rules:[{
              required:true,
              message:"请选择学校",
              trigger:'blur'
            }],
            dicData:this.schoolIdDic,
            props:{
              value:'value',
            },
          },
          {
            label:"商户名称",
            prop:"sellerName",
            rules: [
              {
                required: true,
                message: '请输入商户名称',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label:"商户状态",
            prop:"sellerState",
            type: 'select',
            dicData: this.sellerStateDic,
            rules: [
              {
                required: true,
                message: '请选择商户状态',
                trigger: 'blur'
              }
            ]
          },
          {
            label:"排序",
            prop:"sellerSeq",
            rules: [
              {
                required: true,
                message: '请输入排序',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label:"扣款顺序",
            prop:"walletSeq",
            type: 'select',
            dicData:this.walletSeqDic,
            rules: [
              {
                required: true,
                message: '请选择扣款顺序',
                trigger: 'blur'
              }
            ]
          }
        ]
      }
    },
    options() {
      return [
        { type: 'checkbox', width: 70,fixed:"left" },
        { type: 'seq',title:"序号", width: 70 ,fixed:"left"},
        {
          title: '商户名称',
          field: 'sellerName',
          sortable: true,
          minWidth: 120,
          fixed: "left",
        },
        {
          title: '分管设备',
          field: 'devNames',
          sortable: true,
          minWidth: 130,
          slots:{default:"devNames"}
        },
        {
          title: '商户状态',
          field: 'sellerState',
          sortable: true,
          minWidth: 95,
          slots:{default:"sellerState"}
        },
        {
          title: '学校名称',
          field: 'schoolName',
          sortable: true,
          minWidth: 120,
        },
        {
          title: '排序',
          field: 'sellerSeq',
          sortable: true,
          minWidth: 100,
        },
        {
          title: '扣款顺序',
          field: 'walletSeq',
          sortable: true,
          minWidth: 200,
          formatter: ({ cellValue }) => {
            let item = this.walletSeqDic.find(item => item.value == cellValue)
            return item ? item.label : ''
          },
        }
      ]
    }
  },
};
</script>

<style lang="scss" scoped>
/deep/.el-table thead > tr > th:nth-child(2) > div {
  height: 26px !important;
}
/deep/.basic-container .full-card {
  height: 820px;
  overflow: scroll;
}
</style>
