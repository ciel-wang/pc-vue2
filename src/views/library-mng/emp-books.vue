<template>
  <div class="empbooksClass">
    <el-row>
      <el-col :span="4" style="height: 256px;">
        <el-card>
          <div
            class="left_btn"
            :class="activeName === 'borrow' ? 'active_class' : ''"
            :style="{backgroundColor:activeName === 'borrow' ? colorName : ''}"
            @click="activeName = 'borrow'">借书</div>
          <div
            class="left_btn"
            :class="activeName === 'return' ? 'active_class' : ''"
            :style="{backgroundColor:activeName === 'return' ? colorName : ''}"
            @click="activeName = 'return'">还书</div>
          <div
            class="left_btn"
            :class="activeName === 'renew' ? 'active_class' : ''"
            :style="{backgroundColor:activeName === 'renew' ? colorName : ''}"
            @click="activeName = 'renew'">续借</div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card style="margin: 0 4px 0 8px;">
          <div slot="header">读者确认</div>
          <div class="flexAround">
            <ul class="ul_class">
              <li>
                <el-select v-model="empValue" placeholder="请选择" size="small" style="width: 120px;" @change="empChange">
                  <el-option
                    v-for="item in empOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <el-select
                  v-model="empParams"
                  filterable
                  remote size="small"
                  class="input_class"
                  placeholder="请输入关键词"
                  :remote-method="remoteMethod"
                  :loading="loading2"
                  @change="remoteChange">
                  <el-option
                    v-for="item in empSearchData"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </li>
              <li>
                <span>读者姓名</span>
                <el-input v-model="empform.empName" size="small" readonly class="input_class"></el-input>
              </li>
              <li>
                <span>证卡编码</span>
                <el-input v-model="empform.physicalCardNum" size="small" readonly class="input_class"></el-input>
              </li>
              <li>
                <span>读者类别</span>
                <el-input v-model="empform.groupName" size="small" readonly class="input_class"></el-input>
              </li>
              <li>
                <span>身份证号</span>
                <el-input v-model="empform.idCardNo" size="small" readonly class="input_class"></el-input>
              </li>
            </ul>
            <div style="display: flex;flex-direction: column;align-items: center;">
              <el-avatar :size="130" :src="empform.faceUrl+'?time='+ new Date().getTime()"></el-avatar>
              <el-button
                type="primary"
                round size="small"
                style="width: 110px;margin-top: 10px;"
                @click="readCard">读卡</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card style="margin-left: 4px;">
          <div slot="header">书籍确认</div>
          <div class="flexAround">
            <ul class="ul_class">
              <li>
                <el-select v-model="bookValue" placeholder="请选择" size="small" style="width: 120px;" @change="bookChange">
                  <el-option
                    v-for="item in bookOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <el-input v-model="bookParams" placeholder="请输入" size="small" class="input_class" @keyup.enter.native="searchBook">
                  <el-button slot="append" icon="el-icon-search" @click="searchBook"></el-button>
                </el-input>
              </li>
              <li>
                <span>书刊名称</span>
                <el-input v-model="bookform.bookName" size="small" readonly class="input_class"></el-input>
              </li>
              <li>
                <span>书刊条码</span>
                <el-input v-model="bookform.barCode" size="small" readonly class="input_class"></el-input>
              </li>
              <li>
                <span>ISBN/ISSN</span>
                <el-input v-model="bookform.bookIsbn" size="small" readonly class="input_class"></el-input>
              </li>
              <li>
                <span>书室架位</span>
                <el-input v-model="bookform.bookPeriodicalsNum" size="small" readonly class="input_class"></el-input>
              </li>
            </ul>
            <div
              class="left_btn active_class"
              style="padding: 15px;height: 134px;line-height: 134px;"
              :style="{backgroundColor:colorName}"
              @click="submit">
              {{activeName === 'borrow' ? '借出此书' : activeName === 'return' ? '归还此书' : '续借此书'}}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div style="padding: 20px;background-color: #fff;" class="myopacity">
      <span id="expire">到期</span>
      <span id="overdue">逾期</span>
    </div>
    <div style="background-color: #fff;padding-bottom: 20px;" class="myopacity">
      <vxe-table
        border
        resizable
        size="mini"
        :height="tableHeight"
        ref="xTable"
        auto-resize
        highlight-hover-row
        align="center"
        :row-class-name="rowClassName"
        :loading="loading"
        :data="tableData"
        @cell-dblclick="cellClickEvent($event,true)">
        <vxe-table-column title="借出日期" minWidth="100" field="borrowStartDate"></vxe-table-column>
        <vxe-table-column title="应还日期" minWidth="100" field="borrowEndDate"></vxe-table-column>
        <vxe-table-column title="逾期天数" minWidth="100" field="overdueDays"></vxe-table-column>
        <vxe-table-column title="书刊名称" minWidth="140" field="bookName"></vxe-table-column>
        <vxe-table-column title="书刊条码" minWidth="100" field="barCode"></vxe-table-column>
        <vxe-table-column title="馆藏类型" minWidth="100" field="carrierType"></vxe-table-column>
        <vxe-table-column title="分类号" minWidth="100" field="typeCode"></vxe-table-column>
        <vxe-table-column title="分类名称" minWidth="100" field="typeName"></vxe-table-column>
        <vxe-table-column title="索书号" minWidth="100" field="bookIndex"></vxe-table-column>
        <vxe-table-column title="书刊定价" minWidth="100" field="pricing"></vxe-table-column>
        <vxe-table-column title="卷册期价格" minWidth="100" field="reelBookPrice"></vxe-table-column>
        <vxe-table-column title="已续借次数" minWidth="100" field="continueBorrowCount"></vxe-table-column>
        <vxe-table-column title="续借日期" minWidth="100" field="continueBorrowDate"></vxe-table-column>
        <vxe-table-column title="操作员" minWidth="100" field="createUser"></vxe-table-column>
      </vxe-table>
    </div>

    <el-dialog
      title="书刊检索"
      :visible.sync="dialogVisible"
      width="1000px"
      top="8vh"
      append-to-body
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <p style="color: red;margin-top: 0;">如果当前要借的书在以下表格中存在，则双击图书进行选中即可；</p>
      <p style="color: red;margin-top: 0;">如果不存在，关闭本窗口，在上一界面补全书本名称重新搜索或者通过扫码枪扫码书本条码</p>
      <vxe-table
        border
        resizable
        ref="xTable"
        size="mini"
        auto-resize
        highlight-hover-row
        align="center"
        :height="600"
        :data="tableData4"
        @cell-dblclick="cellClickEvent">
        <vxe-table-column title="书刊条码" minWidth="100" field="barCode"></vxe-table-column>
        <vxe-table-column title="索书号" minWidth="100" field="bookIndex"></vxe-table-column>
        <vxe-table-column title="所在书室" minWidth="100" field="libraryName"></vxe-table-column>
        <vxe-table-column title="书刊架位" minWidth="100" field="bookPeriodicalsNum"></vxe-table-column>
        <vxe-table-column title="卷册期信息" minWidth="100" field="reelBookInfo"></vxe-table-column>
        <vxe-table-column title="卷册期价格" minWidth="100" field="reelBookPrice"></vxe-table-column>
        <vxe-table-column title="ISBN/ISSN" minWidth="160" field="bookIsbn"></vxe-table-column>
        <vxe-table-column title="书刊名称" minWidth="140" field="bookName"></vxe-table-column>
        <vxe-table-column title="输入码" minWidth="120" field="bookCode"></vxe-table-column>
        <vxe-table-column title="著者" minWidth="100" field="bookAuthor"></vxe-table-column>
        <vxe-table-column title="馆藏类型" minWidth="100" field="carrierType"></vxe-table-column>
        <vxe-table-column title="分类号" minWidth="100" field="typeCode"></vxe-table-column>
        <vxe-table-column title="分类名称" minWidth="100" field="typeName"></vxe-table-column>
        <vxe-table-column title="出版单位" minWidth="100" field="publisherUnit"></vxe-table-column>
        <vxe-table-column title="出版地" minWidth="100" field="publishAddr"></vxe-table-column>
        <vxe-table-column title="出版日期" minWidth="100" field="publishDate"></vxe-table-column>
        <vxe-table-column title="书刊定价" minWidth="100" field="pricing"></vxe-table-column>
      </vxe-table>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import axios from "axios";
  import {setStore, getStore} from '@/util/store'
  import { getReaderInfo, getBookInfo, getEmpBookList, sendBorrowBook,sendReturnBook,sendRenewBook } from '@/api/library-mng/emp-books.js'
  import { cardFunction } from '@/util/cardIssuer.js'

  export default{
    props:{
      activeName:{type:String,default:'borrow'}
    },
    data(){
      return{
        loading:false,
        tableData:[],
        empValue:getStore({name: 'empSelectItem'}) || "cardNo",
        empOptions:[
          {value:'empCode',label:"读者编码"},
          {value:'empName',label:"读者姓名"},
          {value:'cardNo',label:"证卡编码"},
          {value:'idCardNo',label:"身份证号"}
        ],
        empParams:"",
        empSearchData:[],
        loading2:false,
        empform:{},
        bookValue:getStore({name: 'bookSelectItem'}) || "bookCode",
        bookOptions:[
          {value:'barCode',label:"书刊条码"},
          {value:'bookName',label:"书刊名称"},
          {value:'bookCode',label:"输入码"},
          {value:'bookIsbn',label:"ISBN/ISSN"}
        ],
        bookParams:"",
        bookform:{},
        tableData4:[],
        dialogVisible:false,
      }
    },
    methods:{
      readCard(){
        if(["empCode","empName"].includes(this.empValue)) return this.$message.warning("读卡请选择证卡编码/身份证号");
        if(this.empValue === "cardNo"){
          cardFunction({},'CardFindEmp').then(res => {
            if (res) {
              getReaderInfo({cardNo:res}).then(r => {
                if(r.data.code === 200){
                  let d = r.data.data
                  this.empform = d instanceof Array && d.length ? d[0] : {};
                  this.initEmpBook();
                }
              })
            }
          }).catch((err) => {
            if(err.toString() === 'Error: Error: Network Error') return this.$message.warning("请检测读取器服务是否启动正常");
            this.$message.warning(err)
          })
        }else{
          axios.get("http://127.0.0.1:18888/idcard").then(res => {
            getReaderInfo({idCardNo:res.data.idNo}).then(r => {
              if(r.data.code === 200){
                let d = r.data.data
                this.empform = d instanceof Array && d.length ? d[0] : {};
                this.initEmpBook();
              }
            })
          }).catch(err => {
            this.$message.warning("请检测读取器服务是否启动正常");
          });
        }
      },
      submit(){
        if(this.activeName === 'borrow'){
          const { id } = this.empform;
          const { bookListEctypeId } = this.bookform;
          if(!id) return this.$message.warning("请先选择读者");
          if(!bookListEctypeId) return this.$message.warning("请先选择书本");
          sendBorrowBook({empId:id,bookEctypeId:bookListEctypeId}).then(r => {
            if(r.data.code === 200){
              this.$message.success(r.data.msg);
              this.initEmpBook();
              this.bookChange();
            }else{
              this.$message.error(r.data.msg);
            }
          })
        }
        if(this.activeName === 'return'){
          const { id } = this.bookform;
          if(!id) return this.$message.warning("请先选择书本");
          sendReturnBook({ids:[id]}).then(r => {
            if(r.data.code === 200){
              this.$message.success(r.data.msg);
              this.initEmpBook();
              this.bookChange();
            }else{
              this.$message.error(r.data.msg);
            }
          })
        }
        if(this.activeName === 'renew'){
          const { id } = this.bookform;
          if(!id) return this.$message.warning("请先选择书本");
          sendRenewBook({id}).then(r => {
            if(r.data.code === 200){
              this.$message.success(r.data.msg);
              this.initEmpBook();
              this.bookChange();
            }else{
              this.$message.error(r.data.msg);
            }
          })
        }
      },
      cellClickEvent({row},flag){
        if(flag && this.activeName === 'borrow') return;
        let {bookName,bookCode,bookIsbn,bookPeriodicalsNum,bookListEctypeId,id,barCode} = row;
        this.bookform = {bookName,bookCode,bookIsbn,bookPeriodicalsNum,bookListEctypeId,id,barCode};
        this.dialogVisible = false;
        this.tableData4 = [];
      },
      bookChange(val){
        this.bookform = {};
        this.bookParams = "";
        setStore({ name: 'bookSelectItem', content: val })
      },
      searchBook(){
        if(!this.bookParams) return;
        let params = {}
        if(this.bookValue === "bookName") params['bookName'] = this.bookParams;
        if(this.bookValue === "bookIsbn") params['bookIsbn'] = this.bookParams;
        if(this.bookValue === "bookCode") params['bookCode'] = this.bookParams.toLocaleUpperCase();
        if(this.bookValue === "barCode") params['barCode'] = this.bookParams;
        getBookInfo(params).then(r => {
          this.loading4 = false;
          if(r.data.code === 200){
            let d = r.data.data;
            if(d instanceof Array && d.length){
              if(d.length === 1){
                this.bookform = d[0];
              }else{
                this.tableData4 = d;
                this.dialogVisible = true;
              }
            }
          }
        })
      },
      empChange(val){
        this.empSearchData = [];
        this.empform = {};
        this.empParams = "";
        setStore({ name: 'empSelectItem', content: val })
      },
      remoteChange(val){
        let item = this.empSearchData.filter(v => v.value === val);
        this.empform = item[0];
        this.initEmpBook();
      },
      remoteMethod(val){
        if(!val) return;
        let params = {}
        if(this.empValue === "empCode") params['empCode'] = val;
        if(this.empValue === "empName") params['empName'] = val;
        if(this.empValue === "cardNo") params['cardNo'] = val;
        if(this.empValue === "idCardNo") params['idCardNo'] = val;
        getReaderInfo(params).then(r => {
          if(r.data.code === 200){
            let d = r.data.data
            if(d instanceof Array && d.length){
              if(d.length === 1){
                if(this.empValue === "empCode"){
                  let arr = d.map(v => ({value:v.id,label:v.empCode+v.empName,...v}));
                  this.empSearchData = arr;
                }else if(this.empValue === "empName"){
                  let arr = d.map(v => ({value:v.id,label:v.empCode+v.empName,...v}));
                  this.empSearchData = arr;
                }else if(this.empValue === "cardNo"){
                  let arr = d.map(v => ({value:v.physicalCardNum,label:v.physicalCardNum+v.empName,...v}));
                  this.empSearchData = arr;
                }else{
                  let arr = d.map(v => ({value:v.idCardNo,label:v.idCardNo+v.empName,...v}));
                  this.empSearchData = arr;
                }
              }else{
                let arr = d.map(v => ({value:v.id,label:v.empCode + v.empName,...v}));
                this.empSearchData = arr;
              }
            }
          }
        })
      },
      initEmpBook(){
        if(!this.empform.id) return;
        getEmpBookList({empId:this.empform.id,size:1000,current:1,borrowState:1}).then(r => {
          if(r.data.code === 200){
            let d = r.data.data;
            this.tableData = d.records;
          }
        })
      },
      rowClassName({row}){
        if(row.overdueDays == 0){
          return 'color1'
        }else if(row.overdueDays > 0){
          return 'color2'
        }
      }
    },
    computed:{
      ...mapGetters(['colorName']),
      tableHeight(){
        return window.innerHeight - 460
      }
    }
  }
</script>

<style lang="scss">
  .empbooksClass{
    padding: 0 10px;
    ul,li{list-style: none;margin: 0;padding: 0;}
    .left_btn{
      border: 1px solid #ccc;
      border-radius: 6px;
      text-align: center;
      padding: 18px 0;
      cursor: pointer;
    }
    .left_btn+.left_btn{
      margin-top: 19px;
    }
    .active_class{
      border: none;
      background-color: #0055AA;
      color: #fff;
    }
    .ul_class{
      li{margin-top: 4px;}
      li>span{
        display: inline-block;
        width: 120px;
        text-align: right;
        font-size: 14px;
      }
    }
    .input_class{width: 200px;margin-left: 10px;}
    #expire::before{
      content: "";
      width: 12px;height: 12px;
      display: inline-block;
      border-radius: 12px;
      background-color: #ffea39;
      margin-right: 4px;
    }
    #overdue::before{
      content: "";
      width: 12px;height: 12px;
      display: inline-block;
      border-radius: 12px;
      background-color: #ff4438;
      margin: 0 4px 0 20px;
    }
    .vxe-body--row.color1{background-color: #ffea39;color:#fff}
    .vxe-body--row.color1:hover{color:#000}
    .vxe-body--row.color2{background-color: #ff4438;color:#fff}
    .vxe-body--row.color2:hover{color:#000}
  }
</style>
