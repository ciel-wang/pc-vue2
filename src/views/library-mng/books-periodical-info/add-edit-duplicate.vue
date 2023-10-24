<template>
  <el-dialog
    :title="btnType === 'add' ? '添加复本' : '编辑复本'"
    :visible.sync="dialogVisible"
    width="700px"
    :before-close="handleClose"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <p style="color: red;margin-top: -10px;margin-left: 20px;">注意：重复的书刊条码系统会直接忽略！</p>
    <avue-form
      ref="formRef"
      :option="addEditOption"
      v-model="form"
      @submit="submit">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>
      <template slot="barCode" v-if="btnType === 'add'">
        <div style="border: 1px solid #DCDFE6;height: 90px;overflow: auto;padding: 0 10px;">
          <div style="line-height: 20px;" v-for="(item,index) in barCodeArr" :key="index">{{item}}</div>
        </div>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
  import { getLibraryZtreeDic } from '@/api/library-mng/book-room-mng.js'
  import { addBookDuplicate, updateBookDuplicate } from "@/api/library-mng/books-periodicals.js"

  export default{
    data(){
      return{
        dialogVisible:false,
        form:{},
        btnType:'add',
        libraryZtreeDic:[]
      }
    },
    mounted() {
      getLibraryZtreeDic({treeKey:'lb#lp'}).then(r => {
        this.libraryZtreeDic = r.data.data;
      })
    },
    methods:{
      openDialog(form = {reelBookPrice:0},type = 'add'){
        this.form = form;
        this.btnType = type;
        this.dialogVisible = true;
      },
      submit(f,done){
        let form = {...f};
        if(!form.bookPeriodicalsId.startsWith('lbp')){
          this.$message.warning('请选择到书刊架位');
          done();
          return;
        }
        form.bookPeriodicalsId = form.bookPeriodicalsId.split('-')[1];
        form.reelBookPrice = form.reelBookPrice || 0;
        if(this.btnType === 'add'){
          addBookDuplicate(form).then(r => {
            done();
            if(r.data.code === 200){
              this.$message.success(r.data.msg);
              this.$emit('refeshPage');
              this.handleClose();
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch(() => done())
        }else{
          updateBookDuplicate(form).then(r => {
            done();
            if(r.data.code === 200){
              this.$message.success(r.data.msg);
              this.$emit('refeshPage');
              this.handleClose();
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
      }
    },
    computed:{
      barCodeArr(){
        let num = this.form.barCodeCount;
        let str = this.form.startBarCode;
        if(num && str){
          return new Array(num).fill('').map((v,i) => str+(i+1));
        }
        return []
      },
      addEditOption(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"索书号",
              prop:"bookIndex",
            },
            {
              label:"起始条码",
              prop:"startBarCode",
              display:this.btnType === 'add' ? true : false
            },
            {
              label:"所在架位",
              prop:"bookPeriodicalsId",
              type:'tree',
              props:{value:'valueStr'},
              dicData:this.libraryZtreeDic
            },
            {
              label:"数量",
              prop:"barCodeCount",
              type:'number',
              minRows: 0,
              precision:0,
              display:this.btnType === 'add' ? true : false
            },
            {
              label:"卷册期信息",
              prop:"reelBookInfo",
              row:this.btnType === 'edit' ? false : true
            },
            {
              label:"书刊条码",
              prop:"barCode",
              className:this.btnType === 'edit' ? '' : 'barCode',
            },
            {
              label:"卷册期价格",
              prop:"reelBookPrice",
              type:'number',
              minRows: 0,
            },
            {
              label:"书刊状态",
              prop:"bookState",
              type:'select',
              dicData:[
                {value:1,label:"可借"},
                {value:2,label:"破损"},
                {value:3,label:"遗失"},
                {value:4,label:"保留"},
                {value:5,label:"注销"},
                {value:6,label:"借出"}
              ],
              disabled:this.btnType === 'edit' && this.form.bookState == 6 ? true : false,
              display:this.btnType === 'edit' ? true : false
            }
          ]
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/.avue-form__group {
    .barCode{
      position: absolute;
      top: 116px;
      right: 0;
      z-index: 100;
    }
  }
</style>
