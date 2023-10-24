<template>
  <el-dialog
    title="折扣设置"
    :visible.sync="dialogVisible"
    width="480px"
    top="10vh"
    append-to-body
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <vxe-grid
      border
      resizable
      auto-resize
      keep-source
      ref="Crud"
      size="mini"
      align="center"
      :highlight="true"
      :keyboard-config="{isEnter:true}"
      @keydown="keydown"
      :columns="parametOptions"
      :data="tableData"
      :edit-config="{trigger: 'click',mode: 'cell',activeMethod:()=>{
        if(permission.xf_system_submit_btn) return true;
        return false;
      }}">
    </vxe-grid>
    <template slot="footer">
      <div style="text-align: center;">
        <el-button icon="el-icon-check" size="small" type="primary" :loading="btnLoading" @click="submit">保存</el-button>
        <el-button icon="el-icon-close" size="small" :loading="btnLoading" @click="dialogVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { update } from '@/api/app-manage/basicCfg.js';

  export default{
    props:{
      empCategorys:{
        type:Array,
        default:() => []
      }
    },
    data(){
      return{
        dialogVisible:false,
        tableData:[],
        btnLoading:false
      }
    },
    methods:{
      submit(){
        this.btnLoading = true;
        const $table = this.$refs.Crud.getTableData().fullData;
        update({ SDCTRL_EMP_CATEGORY_ZK_JSON:$table }).then(r => {
          this.btnLoading = false;
          if(r.data.code === 200){
            this.$message.success(r.data.msg);
            this.dialogVisible = false;
          }else{
            this.$message.error(r.data.msg);
          }
        }).catch(() => this.btnLoading = false)
      },
      openDialog(data = []){
        this.dialogVisible = true;
        this.tableData = data;
      },
      keydown({$event}){
        if($event.keyCode == 13){
          const $table = this.$refs.Crud
          $table.clearActived();
        }
      },
    },
    computed:{
      ...mapGetters(['permission']),
      parametOptions(){
        return[
          {
            title:"人员分类",
            field:"empCategory",
            minWidth:100,
            formatter:({ cellValue }) => {
              const item = this.empCategorys.find(item => item.dictKey == cellValue);
              return item ? item.dictValue : ''
            }
          },
          {
            title:"折扣率(%)",
            field:"discount",
            minWidth:100,
            editRender: { name: 'input',props: {type: 'float',digits: 2,placeholder: '请输入数字类型'}}
          }
        ]
      }
    }
  }
</script>

<style>
</style>
