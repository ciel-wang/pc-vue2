<template>
  <basic-container style="height: 99%;">
    <el-collapse v-model="activeNames">
      <el-collapse-item name="1">
        <template slot="title">
          <i class="el-icon-s-custom icon"></i>餐别管理
        </template>
        <vxe-grid
          style="width: 600px;"
          border
          resizable
          highlight-hover-row
          keep-source
          ref="Crud1"
          size="mini"
          align="center"
          :highlight="true"
          :columns="eatOptions"
          :keyboard-config="{isEnter:true}"
          @keydown="keydown"
          :data="eatData"
          :edit-config="{trigger: 'click',mode: 'cell',activeMethod:()=>{
            if(permission.xf_system_submit_btn) return true;
            return false;
          }}"
          @edit-closed="editClosedEvent1">
          <template #startTime="{row}">
            <el-time-picker
              v-model="row.startTime"
              class="my-time"
              size="mini"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              placeholder="选择开始时间">
            </el-time-picker>
          </template>
          <template #endTime_edit="{row}">
            <el-time-picker
              v-model="row.endTime"
              class="my-time"
              size="mini"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              placeholder="选择结束时间">
            </el-time-picker>
          </template>
        </vxe-grid>
      </el-collapse-item>

      <el-collapse-item name="2">
        <template slot="title">
          <i class="el-icon-s-custom icon"></i>钱包限额
        </template>
        <vxe-grid
          style="width: 750px;"
          border
          resizable
          keep-source
          ref="Crud2"
          size="mini"
          align="center"
          :highlight="true"
          :keyboard-config="{isEnter:true}"
          @keydown="keydown"
          :columns="walletOptions"
          :data="data"
          :edit-config="{trigger: 'click',mode: 'cell',activeMethod:()=>{
            if(permission.xf_system_submit_btn) return true;
            return false;
          }}"
          @edit-closed="editClosedEvent2">
          <template #name_header>
            <div class="first-col">
              <div class="first-col-top">钱包</div>
              <div class="first-col-bottom">人员分类</div>
            </div>
          </template>
        </vxe-grid>
      </el-collapse-item>

      <el-collapse-item name="3">
        <template slot="title">
          <i class="el-icon-s-custom icon"></i>高级参数
          <el-tooltip class="item" effect="dark" content="0代表不收取管理费、没有折扣、没有餐段限额、限次。设置以下参数需要填写大于等于1的整数" placement="top-start">
            <i class="el-icon-question"></i>
          </el-tooltip>
        </template>
        <vxe-grid
          style="width: 100%;"
          border
          resizable
          auto-resize
          keep-source
          ref="Crud3"
          size="mini"
          align="center"
          :highlight="true"
          :keyboard-config="{isEnter:true}"
          @keydown="keydown"
          :columns="parametOptions"
          :data="data"
          :edit-config="{trigger: 'click',mode: 'cell',activeMethod:()=>{
            if(permission.xf_system_submit_btn) return true;
            return false;
          }}"
          @edit-closed="editClosedEvent3">
        </vxe-grid>
      </el-collapse-item>
    </el-collapse>
  </basic-container>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { getSystemDetail , updateXfSystem} from "@/api/xf/xfsystem";
  export default{
    data(){
      return{
        activeNames:['1'],
        eatData:[{},{},{},{},{},{}],
        eatArr:[
          {value:"SYS_MEAL_1",label:"早餐"},
          {value:"SYS_MEAL_2",label:"午餐"},
          {value:"SYS_MEAL_3",label:"晚餐"},
          {value:"SYS_MEAL_4",label:"夜宵"},
          {value:"SYS_MEAL_5",label:"其他"},
        ],
        data:[{},{}],
      }
    },
    mounted() {
      this.initData()
    },
    methods:{
      initData(){
        getSystemDetail().then(r => {
          if(r.data.code == 200){
            let mealArr = r.data.data.mealArr
            mealArr.forEach(v => {
              let arr = v.SYS_MEAL_parValue ? v.SYS_MEAL_parValue.split(',') : []
              v.startTime = arr[0]
              v.endTime = arr[1]
            })
            this.eatData = mealArr;

            let arr = [...r.data.data.teacherCategory,...r.data.data.studentCategory]
            arr.forEach(v => {
              v.zcMoney = v['EMP_MEAL_0_LIMIT_MAX_MONEY_userCategory_'+v.categoryId+'_parValue'];
              v.wucMoney = v['EMP_MEAL_1_LIMIT_MAX_MONEY_userCategory_'+v.categoryId+'_parValue'];
              v.wancMoney = v['EMP_MEAL_2_LIMIT_MAX_MONEY_userCategory_'+v.categoryId+'_parValue'];
              v.yxMoney = v['EMP_MEAL_3_LIMIT_MAX_MONEY_userCategory_'+v.categoryId+'_parValue'];
              v.qtMoney = v['EMP_MEAL_4_LIMIT_MAX_MONEY_userCategory_'+v.categoryId+'_parValue'];

              v.zcCount = v['EMP_MEAL_0_LIMIT_MAX_COUNT_userCategory_'+v.categoryId+'_parValue'];
              v.wucCount = v['EMP_MEAL_1_LIMIT_MAX_COUNT_userCategory_'+v.categoryId+'_parValue'];
              v.wancCount = v['EMP_MEAL_2_LIMIT_MAX_COUNT_userCategory_'+v.categoryId+'_parValue'];
              v.yxCount = v['EMP_MEAL_3_LIMIT_MAX_COUNT_userCategory_'+v.categoryId+'_parValue'];
              v.qtCount = v['EMP_MEAL_4_LIMIT_MAX_COUNT_userCategory_'+v.categoryId+'_parValue'];

              v.personWallet = v['XF_WALLET_0_MAX_BALANCE_userCategory_'+v.categoryId+'_parValue']
              v.btWallet1 = v['XF_WALLET_1_MAX_BALANCE_userCategory_'+v.categoryId+'_parValue']
              v.btWallet2 = v['XF_WALLET_2_MAX_BALANCE_userCategory_'+v.categoryId+'_parValue']
              v.btWallet3 = v['XF_WALLET_3_MAX_BALANCE_userCategory_'+v.categoryId+'_parValue']
            })
            this.data = arr
          }
        })
      },
      keydown({$event}){
        if($event.keyCode == 13){
          const $table1 = this.$refs.Crud1
          const $table2 = this.$refs.Crud2
          const $table3 = this.$refs.Crud3
          $table1.clearActived();
          $table2.clearActived();
          $table3.clearActived();
        }
      },
      editClosedEvent1({ row, column }){
        const $table = this.$refs.Crud1
        const field = column.property
        if ($table.isUpdateByRow(row, field)) {
          let key = row.SYS_MEAL_parKey
          let data = {};
          data[key] = row.startTime + ',' + row.endTime;
          data['categoryType'] = 100;
          updateXfSystem(data).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              $table.reloadRow(row, null, field)
            }else{
              this.$message.error(r.data.msg)
              this.initData()
            }
          }).catch(() =>{
            this.initData()
          })
        }
      },
      editClosedEvent2({ row, column }){
        const $table = this.$refs.Crud2
        const field = column.property
        if ($table.isUpdateByRow(row, field)) {
          let obj = {};
          if(field == 'personWallet'){
            obj['XF_WALLET_0_MAX_BALANCE_userCategory_'+row.categoryId] = row.personWallet;
          }else if(field == 'btWallet1'){
            obj['XF_WALLET_1_MAX_BALANCE_userCategory_'+row.categoryId] = row.btWallet1;
          }else if(field == 'btWallet2'){
            obj['XF_WALLET_2_MAX_BALANCE_userCategory_'+row.categoryId] = row.btWallet2;
          }else if(field == 'btWallet3'){
            obj['XF_WALLET_3_MAX_BALANCE_userCategory_'+row.categoryId] = row.btWallet3;
          }
          obj['categoryType'] = row.categoryType;
          updateXfSystem(obj).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              $table.reloadRow(row, null, field)
            }else{
              this.$message.error(r.data.msg)
              this.initData()
            }
          }).catch(() =>{
            this.initData()
          })
        }
      },
      editClosedEvent3({ row, column }){
        const $table = this.$refs.Crud3
        const field = column.property
        if ($table.isUpdateByRow(row, field)) {
          let obj = {};
          obj['categoryType'] = row.categoryType;
          if(field == 'HANDING_FEE_parValue'){
            obj[row.HANDING_FEE_parKey] = row.HANDING_FEE_parValue
          }else if(field == 'SYS_EMP_DISCOUNT_parValue'){
            obj[row.SYS_EMP_DISCOUNT_parKey] = row.SYS_EMP_DISCOUNT_parValue
          }else if(field == 'zcMoney'){
            obj['EMP_MEAL_0_LIMIT_MAX_MONEY_userCategory_'+ row.categoryId] = row.zcMoney
          }else if(field == 'wucMoney'){
            obj['EMP_MEAL_1_LIMIT_MAX_MONEY_userCategory_'+ row.categoryId] = row.wucMoney
          }else if(field == 'wancMoney'){
            obj['EMP_MEAL_2_LIMIT_MAX_MONEY_userCategory_'+ row.categoryId] = row.wancMoney
          }else if(field == 'yxMoney'){
            obj['EMP_MEAL_3_LIMIT_MAX_MONEY_userCategory_'+ row.categoryId] = row.yxMoney
          }else if(field == 'qtMoney'){
            obj['EMP_MEAL_4_LIMIT_MAX_MONEY_userCategory_'+ row.categoryId] = row.qtMoney
          }else if(field == 'zcCount'){
            obj['EMP_MEAL_0_LIMIT_MAX_COUNT_userCategory_'+ row.categoryId] = row.zcCount
          }else if(field == 'wucCount'){
            obj['EMP_MEAL_1_LIMIT_MAX_COUNT_userCategory_'+ row.categoryId] = row.wucCount
          }else if(field == 'wancCount'){
            obj['EMP_MEAL_2_LIMIT_MAX_COUNT_userCategory_'+ row.categoryId] = row.wancCount
          }else if(field == 'yxCount'){
            obj['EMP_MEAL_3_LIMIT_MAX_COUNT_userCategory_'+ row.categoryId] = row.yxCount
          }else if(field == 'qtCount'){
            obj['EMP_MEAL_4_LIMIT_MAX_COUNT_userCategory_'+ row.categoryId] = row.qtCount
          }
          updateXfSystem(obj).then(r => {
            if(r.data.code == 200){
              this.$message.success(r.data.msg)
              $table.reloadRow(row, null, field)
            }else{
              this.$message.error(r.data.msg)
              this.initData()
            }
          }).catch(() =>{
            this.initData()
          })
        }
      },
    },
    computed:{
      ...mapGetters(['permission']),
      eatOptions(){
        return[
          {
            title:"餐别管理",
            field:"SYS_MEAL_parKey",
            width:200,
            formatter: ({ cellValue }) => {
              let item = this.eatArr.find(item => item.value === cellValue)
              return item ? item.label : ''
            },
          },
          {
            title:"开始时间",
            field:"startTime",
            width:200,
            slots:{edit:"startTime"},
            editRender: { autofocus: '.my-time' },
          },
          {
            title:"结束时间",
            field:"endTime",
            width:200,
            slots:{edit:"endTime_edit"},
            editRender: { autofocus: '.my-time' },
          }
        ]
      },
      parametOptions(){
        return[
          {
            title:"人员分类",
            field:"categoryName",
            minWidth:100,
          },
          {
            title:"充值管理费(‰)",
            field:"HANDING_FEE_parValue",
            minWidth:120,
            editRender: { name: 'input',props: {type: 'float',digits: 2,placeholder: '请输入数字类型'}}
          },
          {
            title:"折扣率(%)",
            field:"SYS_EMP_DISCOUNT_parValue",
            minWidth:100,
            editRender: { name: 'input',props: {type: 'float',digits: 2,placeholder: '请输入数字类型'}}
          },
          {
            title:"餐段限额(元)",
            children:[
              {
                title:"早餐",
                field:"zcMoney",
                minWidth:90,
                editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
              },
              {
                title:"午餐",
                field:"wucMoney",
                minWidth:90,
                editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
              },
              {
                title:"晚餐",
                field:"wancMoney",
                minWidth:90,
                editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
              },
              {
                title:"夜宵",
                field:"yxMoney",
                minWidth:90,
                editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
              },
              {
                title:"其他",
                field:"qtMoney",
                minWidth:90,
                editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
              },
            ]
          },
          {
            title:"餐段限次(次)",
            children:[
              {
                title:"早餐",
                field:"zcCount",
                minWidth:90,
                editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
              },
              {
                title:"午餐",
                field:"wucCount",
                minWidth:90,
                editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
              },
              {
                title:"晚餐",
                field:"wancCount",
                minWidth:90,
                editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
              },
              {
                title:"夜宵",
                field:"yxCount",
                minWidth:90,
                editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
              },
              {
                title:"其他",
                field:"qtCount",
                minWidth:90,
                editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
              },
            ]
          },
        ]
      },
      walletOptions(){
        return[
          {
            title:"",
            field:"categoryName",
            width:150,
            resizable: false,
            slots: { header: 'name_header' }
          },
          {
            title:"个人钱包(元)",
            field:"personWallet",
            width:150,
            editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
          },
          {
            title:"补贴钱包1(元)",
            field:"btWallet1",
            width:150,
            editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
          },
          {
            title:"补贴钱包2(元)",
            field:"btWallet2",
            width:150,
            editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
          },
          {
            title:"补贴钱包3(元)",
            field:"btWallet3",
            width:150,
            editRender: { name: 'input',props: {type: 'number',placeholder: '请输入数字类型'}}
          },
        ]
      }
    }
  }
</script>

<style scoped>
  >>>.basic-container__card{
    height: 100% !important;
    overflow: auto;
  }
  .icon{
    font-size: 20px;
    margin-right: 5px;
  }
  .my-time{
    width: 90% !important;
  }
  .first-col {
    position: relative;
    height: 20px;
  }
  .first-col:before {
    content: "";
    position: absolute;
    left: -18px;
    top: 9px;
    width: 160px;
    height: 1px;
    transform: rotate(13deg);
    background-color: #e8eaec;
  }
  .first-col .first-col-top {
    position: absolute;
    right: 4px;
    top: -5px;
  }
  .first-col .first-col-bottom {
    position: absolute;
    left: 4px;
    bottom: -6px;
  }
</style>
