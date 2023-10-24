<template>
  <el-dialog
    title="粘贴查询"
    :visible.sync="searchShow"
    width="850px"
    :append-to-body="true"
    :modal-append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <div style="position: relative;">
      <el-table
        :data="mulTableData"
        height="300"
        empty-text="请添加查询条件"
        border
        size="mini"
        style="width: 100%"
        :header-cell-style="{backgroundColor:'#f0f0f0'}">
        <el-table-column prop="qcolumn" align="center" label="字段名" width="150">
          <template slot-scope="scope">
            <el-select v-model="queryFieldType" placeholder="请选择" size="small">
              <el-option
                v-for="item in queryFieldTypeDic"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="qcolumn2" align="center" label="查询值,每行一个">
          <template slot-scope="scope">
            <el-input style="height:250px;resize:none;" resize="none" v-model="mulValue" rows="11" type="textarea" />
          </template>
        </el-table-column>
      </el-table>
      <el-row>
        <el-col :span="6" style="text-align: right;margin-top:10px" :offset="18">
          <el-button @click="mulValue = ''" size="small" icon="el-icon-refresh" >重置</el-button>
          <el-button size="small" @click="handleQuery" icon="el-icon-search" type="primary">查询</el-button>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<script>
  export default{
    data(){
      return{
        searchShow:false,
        mulTableData:[],
        mulValue:"",
        queryFieldType:'empName',
        queryFieldTypeDic:[
          {value:'empName',label:"姓名"},
          {value:'empCode',label:"学工号"},
          {value:'empPhone',label:"手机号码"},
          {value:'empIdCard',label:"身份证号"}
        ]
      }
    },
    methods:{
      openDialog(){
        this.searchShow = true;
        this.mulTableData[0] = [{qcolumn:"人员姓名"}];
        this.mulValue= '';
        this.queryFieldType = 'empName';
      },
      handleQuery(){
        if(this.mulValue == "") return this.$message.warning("请填写查询值");
        let mulvalueArr = this.mulValue.split(/[(\r\n)\r\n]+/)
        let queryFieldContent = mulvalueArr.join(',');
        this.$emit('getQuery',this.queryFieldType,queryFieldContent)
        this.searchShow = false;
      }
    }
  }
</script>
