<template>
  <basicContainer>
    <div style="display: flex;align-items: center;font-size: 14px;font-weight: 600;">
      <span>当前位置：</span>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{path:'/library-mng/books-periodicals'}">书刊目录</el-breadcrumb-item>
        <el-breadcrumb-item>书刊信息{{$route.query.bookIsbn ? '编辑' : '录入'}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div style="padding: 20px 0;text-align: center;border-bottom: 1px solid #e6e9ec;">
      <el-input
        size="small"
        style="width: 300px;margin-right: 10px;"
        clearable autofocus
        ref="bookIsbnRef"
        @keyup.enter.native="search('isbn')"
        v-model.trim="bookIsbn"
        maxlength="13"
        placeholder="请输入ISBN/ISSN">
      </el-input>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-search"
        @click="search('isbn')">
        检索</el-button>
    </div>
    <avue-form
      style="width: 76%;margin: 20px auto;transform: translateX(70px);"
      ref="formRef"
      class="form"
      :option="addEditOption"
      v-model="form">
      <template slot-scope="scope" slot="menuForm">
        <el-button type="primary" @click="submit" icon="el-icon-check">保存</el-button>
      </template>
      <template slot="bookName">
        <el-select
          v-model="form.bookName"
          filterable
          remote
          allow-create
          reserve-keyword
          placeholder="请输入 书刊名称"
          :remote-method="remoteMethod"
          @change="bookNameChange"
          maxlength="100">
          <el-option
            v-for="item in bookNameDic"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </template>

      <template slot="groupId">
        <vxe-pulldown ref="xDown" style="width: 100%;">
          <template #default>
            <el-input v-model="form.parentBookTypeName" readonly placeholder="请选择 分类号" size="small">
              <el-button slot="append" icon="el-icon-search" @click="searchZtreeNode"></el-button>
            </el-input>
          </template>
          <template #dropdown>
            <div class="my-dropdown1">
              <booksCategoryZtree ref="booksCategoryZtreeRef" :isShowIcon="false" @onClick="selectGroupId"></booksCategoryZtree>
            </div>
          </template>
        </vxe-pulldown>
      </template>
    </avue-form>
    <div style="border-top: 1px solid #e6e9ec;padding: 20px 0;">
      <el-button type="primary" size="small" @click="handleAddDuplicate" icon="el-icon-plus">添加复本</el-button>
      <div style="float: right;">
        <span>总册数：</span> <span style="margin: 0 6px 0;color: blue;">{{bookTotal}}</span>
        <span>借出册数：</span> <span style="margin: 0 6px 0;color: red;">{{borrowCount}}</span>
        <span>剩余册数：</span> <span style="margin: 0 6px 0;color: green;">{{bookDiff}}</span>
      </div>
    </div>
    <div :style="{minHeight:minHeight+'px'}">
      <vxe-table
        border
        resizable
        size="mini"
        height="auto"
        ref="xTable"
        auto-resize
        highlight-hover-row
        align="center"
        :loading="loading"
        :data="tableData">
        <vxe-table-column title="书刊条码" minWidth="100" field="barCode"></vxe-table-column>
        <vxe-table-column title="书刊状态" minWidth="100" field="bookState">
          <template #default="{row}">
            <el-tag effect="dark" type="success" size="mini" v-if="row.bookState == 1">可借</el-tag>
            <el-tag effect="dark" type="warning" size="mini" v-if="row.bookState == 2">破损</el-tag>
            <el-tag effect="dark" type="warning" size="mini" v-if="row.bookState == 3">遗失</el-tag>
            <el-tag effect="dark" size="mini" v-if="row.bookState == 4">保留</el-tag>
            <el-tag effect="dark" type="info" size="mini" v-if="row.bookState == 5">注销</el-tag>
            <el-tag effect="dark" type="danger" size="mini" v-if="row.bookState == 6">借出</el-tag>
          </template>
        </vxe-table-column>
        <vxe-table-column title="索书号" minWidth="100" field="bookIndex"></vxe-table-column>
        <vxe-table-column title="所在书室" minWidth="100" field="libraryName"></vxe-table-column>
        <vxe-table-column title="书刊架位" minWidth="100" field="bookPeriodicalsNum"></vxe-table-column>
        <vxe-table-column title="卷册期信息" minWidth="100" field="reelBookInfo"></vxe-table-column>
        <vxe-table-column title="卷册期价格" minWidth="100" field="reelBookPrice"></vxe-table-column>
        <vxe-table-column title="登记日期" minWidth="100" field="createTime"></vxe-table-column>
        <vxe-table-column title="操作员" minWidth="100" field="createUser"></vxe-table-column>
        <vxe-table-column title="操作" minWidth="100">
          <template #default="{row}">
            <el-button type="text" size="small" @click="rowEdit(row)">编辑</el-button>
            <el-button type="text" size="small" @click="rowDelete(row)">删除</el-button>
          </template>
        </vxe-table-column>
      </vxe-table>
    </div>

    <addEditDuplicate ref="addEditDuplicateRef" @refeshPage="search"></addEditDuplicate>
  </basicContainer>
</template>

<script>
  import axios from 'axios';
  import { mapGetters } from "vuex";
  import website from "@/config/website";
  import { getToken } from "@/util/auth";
  import { getDictCode } from "@/api/iot/teacher.js"
  import { getBookCategoryDic } from '@/api/library-mng/books-categories.js'
  import { getPublisherDic } from '@/api/library-mng/publisher.js'
  import { getBookInfo, sendBookMenu, getBookDuplicateDetails, removeBookDuplicate, sendCoverimg } from "@/api/library-mng/books-periodicals.js"
  import addEditDuplicate from './add-edit-duplicate.vue'
  import ChinesePY from '@/util/ChinesePY.js'
  import booksCategoryZtree from '../books-category-ztree.vue'

  export default{
    components:{ addEditDuplicate, booksCategoryZtree },
    data(){
      return{
        bookIsbn:"",
        form:{},
        loading:false,
        tableData:[],
        lbBookAccessory:[],
        lbBookLanguage:[],
        lbCarrierMode:[],
        lbCarrierType:[],
        lbPublishEdition:[],
        lbPublishPeriod:[],
        lbPublishAddr:[],
        booksCategoryDic:[],
        publisherDic:[],
        bookNameDic:[],
        borrowCount:0,
        bookTotal:0,
        bookDiff:0
      }
    },
    mounted() {
      getDictCode({keys:"lbCarrierType##lbPublishEdition##lbBookLanguage##lbCarrierMode##lbBookAccessory##lbPublishPeriod##lbPublishAddr"}).then(r => {
        let d = r.data.data;
        let lbBookAccessory = d.lbBookAccessory.map(v => ({value:v.value,label:v.value}));
        let lbBookLanguage = d.lbBookLanguage.map(v => ({value:v.value,label:v.value}));
        let lbCarrierMode = d.lbCarrierMode.map(v => ({value:v.value,label:v.value}));
        let lbCarrierType = d.lbCarrierType.map(v => ({value:v.value,label:v.value}));
        let lbPublishEdition = d.lbPublishEdition.map(v => ({value:v.value,label:v.value}));
        let lbPublishPeriod = d.lbPublishPeriod.map(v => ({value:v.value,label:v.value}));
        let lbPublishAddr = d.lbPublishAddr.map(v => ({value:v.value,label:v.value}));
        this.lbBookAccessory = lbBookAccessory;
        this.lbBookLanguage = lbBookLanguage;
        this.lbCarrierMode = lbCarrierMode;
        this.lbCarrierType = lbCarrierType;
        this.lbPublishEdition = lbPublishEdition;
        this.lbPublishPeriod = lbPublishPeriod;
        this.lbPublishAddr = lbPublishAddr;
      })
      getBookCategoryDic().then(r => {
        this.booksCategoryDic = r.data;
      })
      getPublisherDic().then(r => {
        let publisherDic = r.data.data.map(v => ({value:v.value,label:v.value}));
        this.publisherDic = publisherDic;
      })
      if(this.$route.query.bookIsbn){
        this.bookIsbn = this.$route.query.bookIsbn
        this.search('isbn')
      }
      this.$refs.bookIsbnRef.focus();
    },
    methods:{
      searchZtreeNode(){
        this.$refs.xDown.showPanel()
      },
      selectGroupId(treeNode){
        this.form.groupId = treeNode.value;
        this.form.parentBookTypeName = treeNode.label;
        this.$refs.xDown.hidePanel();
      },
      submit(){
        if(!this.bookIsbn) return this.$message.warning('请输入ISBN/ISSN');
        let form = {...this.form}
        form['bookIsbn'] = this.bookIsbn;
        form.publishDate = form.publishDate ? form.publishDate : null;
        sendBookMenu(form).then(r => {
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.search()
          }else{
            this.$message.error(r.data.msg)
          }
        })
      },
      handleAddDuplicate(){
        if(!this.bookIsbn) return this.$message.warning("请先查询书刊目录");
        this.$refs.addEditDuplicateRef.openDialog({bookIsbn:this.bookIsbn,bookIndex:this.form.typeCode},'add')
      },
      rowEdit(row){
        getBookDuplicateDetails({id:row.id}).then(r => {
          if(r.data.code === 200){
            let d = r.data.data;
            this.$refs.addEditDuplicateRef.openDialog(d,'edit')
          }
        })
      },
      rowDelete(row){
        if(row.bookState == 6) return this.$message.warning('当前记录因存在借阅记录，无法删除！');
        this.$confirm("确定要删除选择的数据？", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return removeBookDuplicate({ids:[row.id]});
        }).then(res =>{
          if(res.data.code == 200){
            this.$message.success(res.data.msg);
            this.search();
          }else{
            this.$message.error(res.data.msg)
          }
        })
      },
      search(type = 'isbn',value){
        let params = {};
        if(type === 'isbn'){
          if(!this.bookIsbn) return this.$message.warning("请输入ISBN/ISSN");
          params['bookIsbn'] = this.bookIsbn;
          if(this.bookIsbn.length === 13 && this.bookIsbn.startsWith('978')){
            this.form.carrierType = "图书";
          }
          if(this.bookIsbn.length === 8){
            this.form.carrierType = "期刊";
          }
        }
        if(type === 'name') params['bookName'] = value;
        getBookInfo(params).then(r => {
          if(r.data.code === 200){
            let d = r.data.data;
            if(type === 'name'){
              let arr = d.map(v => ({value:v.bookIsbn,label:v.bookName}));
              this.bookNameDic = arr;
            }else{
              if(JSON.stringify(d) == '{}'){
                axios.get(`${process.env.VUE_APP_BOOKS_URL}/api/book/select?isbn=${this.bookIsbn}`).then(r => {
                  if(r.data.code === 200){
                    let data = r.data.data;
                    this.form = r.data.data;
                    this.form.bookContent = data.bookDesc ? data.bookDesc.substr(0,299) : '';
                    this.form.publisherUnit = data.publishUnit;
                    this.form.bookDesc = "";
                    this.form.bookAuthor = data.bookAuthor || data.translator || '';
                    this.form.carrierMode = data.pageCount ? data.pageCount+'页' : '';
                    if(data.coverImg){
                      sendCoverimg({coverImgUrl:data.coverImg,publisherName:data.publishUnit}).then(res => {
                        this.form.coverImg = res.data.data.coverImgUrl;
                        this.form.publishAddr = res.data.data.publishAddr;
                      })
                    }
                  }
                })
              }else{
                this.form = {...d};
                this.form.parentBookTypeName = d.typeName;
                let borrowCount = d.bookListEctypes && d.bookListEctypes instanceof Array && d.bookListEctypes.reduce((cur,item)=>{
                  if(item.bookState == 6){
                    cur++;
                  }
                  return cur;
                },0)
                this.borrowCount = borrowCount;
                this.bookTotal = d.bookListEctypes && d.bookListEctypes instanceof Array && d.bookListEctypes.length;
                this.bookDiff = this.bookTotal - this.borrowCount;
                this.tableData = d.bookListEctypes || [];
              }
            }
          }
        })
      },
      remoteMethod(value){
        if(value){
          if(value.length > 100) value = value.substr(0,100);
          this.search('name',value);
        }
      },
      bookNameChange(value){
        if(value){
          if(value.length > 100) value = value.substr(0,100);
          this.bookIsbn = value;
          this.search('isbn');
          this.form.bookCode = ChinesePY.GetJP(value).toUpperCase();
        }
      }
    },
    computed:{
      minHeight(){
        return window.innerHeight - 587-63
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitBtn: false,
          size:'mini',
          column:[
            {
              label:"书刊名称",
              prop:"bookName",
              span:8,
              formslot:true
            },{
              label:"主题词",
              prop:"subject",
              span:8,
              maxlength:100
            },{
              label:"出版周期",
              prop:"publishPeriod",
              type:"select",
              span:8,
              dicData:this.lbPublishPeriod,
              allowCreate:true,
              filterable:true
            },{
              label:"输入码",
              prop:"bookCode",
              span:8,
            },{
              label:"分类号",
              prop:"groupId",
              span:8,
              row:true
            },{
              label:"著者",
              prop:"bookAuthor",
              span:8,
              maxlength:50
            },{
              label:"出版版次",
              prop:"publishEdition",
              span:4,
              type:"select",
              dicData:this.lbPublishEdition,
              allowCreate:true,
              filterable:true
            },{
              label:"书刊语言",
              prop:"bookLanguage",
              span:4,
              labelWidth:74,
              type:"select",
              dicData:this.lbBookLanguage,
              allowCreate:true,
              filterable:true,
              value:"中文",
              row:true
            },{
              label:"馆藏类型",
              prop:"carrierType",
              type:"select",
              span:8,
              dicData:this.lbCarrierType,
              allowCreate:true,
              filterable:true
            },{
              label:"载体形态",
              prop:"carrierMode",
              span:4,
              type:"select",
              dicData:this.lbCarrierMode,
              allowCreate:true,
              filterable:true
            },{
              label:"书刊附件",
              prop:"bookAccessory",
              span:4,
              labelWidth:74,
              type:"select",
              dicData:this.lbBookAccessory,
              allowCreate:true,
              filterable:true,
              row:true
            },{
              label:"丛编名",
              prop:"secondName",
              span:8,
              maxlength:100
            },{
              label:"CN刊号",
              prop:"bookCn",
              span:8,
              row:true,
              maxlength:13
            },{
              label:"出版单位",
              prop:"publisherUnit",
              type:"select",
              dicData:this.publisherDic,
              span:8,
              filterable:true
            },{
              label:"书刊定价",
              prop:"pricing",
              type:'number',
              minRows: 0,
              maxRows:99999,
              controls:false,
              span:8,
              row:true
            },{
              label:"出版地",
              prop:"publishAddr",
              span:4,
              type:"select",
              dicData:this.lbPublishAddr,
              allowCreate:true,
              filterable:true
            },{
              label:"出版日期",
              prop:"publishDate",
              span:4,
              labelWidth:74,
              type:"date",
              format:'yyyy-MM-dd',
              valueFormat:'yyyy-MM-dd',
            },{
              label:"主办单位",
              prop:"hostUnit",
              span:8,
              row:true,
              maxlength:20
            },{
              label:"备注",
              prop:"bookDesc",
              type:"textarea",
              maxRows:3,
              maxlength:299,
              span:8,
              className:'bookDesc'
            },{
              label: "",
              labelWidth:0,
              span:3,
              prop: "coverImg",
              type: "upload",
              loadText: "上传中，请稍等",
              limit: 1,
              listType: "picture-img",
              drag: false,
              propsHttp: {
                res: "data",url:"absUrl"
              },
              data:{mode:'LB_BOOK_COVER'},
              action: `/api/iot-basic/common/upload?${website.tokenHeader}=${getToken()}`,
              className:'coverImg'
            },{
              label:"内容简介",
              prop:"bookContent",
              type:'textarea',
              maxRows:4,
              maxlength:299,
              span:8,
              className:'bookContent'
            }
          ]
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .form /deep/.avue-form__group {
    .avue-upload__avatar,.avue-upload__icon{width: 135px;height: 180px;}
    .avue-upload--list .el-upload{box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)}
    .coverImg{
      position: absolute;
      top: 0;
      left: -160px;
      z-index: 100;
    }
    .bookContent{
      position: absolute;
      top: 40px;
      right: 0;
      z-index: 100;
    }
    .bookDesc{
      position: absolute;
      top: 162px;
      right: 0;
      z-index: 10;
      .el-textarea__inner{
        min-height: 70px !important;
        height: 70px !important;
        max-height: 70px !important;
      }
    }
    .avue-form__menu{
      position: absolute !important;
      bottom: 6px;
      right: 0;
      width: 34%;
      padding: 0;
    }
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
      margin: 0;
    }
    /deep/.vxe-pulldown--panel{
      width: 100%;
      padding: 0;
    }
    .avue-upload__icon{line-height: 180px !important;}
  }
  .my-dropdown1 {
    height: 200px;
    width: 100%;
    overflow: auto;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    background-color: #fff;
  }

</style>
