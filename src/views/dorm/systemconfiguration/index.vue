<template>
  <basicContainer style="height: 99%;">
    <avue-form
      ref="formRef"
      :option="option"
      v-model="form"
      @submit="handleSubmit"
      @tab-click="handleTabClick">
      <template slot-scope="{}" slot="DAY_NODE_HOURLabel">
        <span>默认退宿日期：T+1天</span>
      </template>
      <template slot="tip">
        <span>入住时间跨天记1晚，入住时间未跨天时，收费标准如下：</span>
      </template>
      <template slot="operator">
        <div>></div>
      </template>
    </avue-form>
  </basicContainer>
</template>

<script>
  import { mapGetters } from "vuex";
  import { getSystemDetails, updateSystem} from '@/api/dorm/dorm_mng.js'
  
  export default{
    data(){
      return{
        form:{dynamic:[{}]}
      }
    },
    mounted() {
      this.initData()
    },
    methods:{
      handleSubmit(form,done){
        let arr = form.dynamicArr
        let arr1 = []
        arr.forEach(v => {
          arr1.push(v.time + ':' + v.roomRate)
        })
        form['TF_HOUR_TYPE'] = arr1
        updateSystem(form).then(r => {
          if(r.data.code == 200){
            this.$message.success(r.data.msg)
            this.initData()
            done()
          }else{
            this.$message.error(r.data.msg)
            done()
          }
        }).catch(() => {
          done()
        })
      },
      initData(){
        getSystemDetails().then(r => {
          if(r.data.code == 200){
            let d = r.data.data;
            let arr1 = []
            d.TF_HOUR_TYPE.forEach(v => {
              let arr = v.split(':')
              arr1.push({
                time:arr[0],
                roomRate:arr[1]
              })
            })
            d.dynamicArr = arr1
            this.form = d
          }
        })
      }
    },
    computed:{
      ...mapGetters(['permission']),
      permissionList() {
        return {
          submitBtn: this.vaildData(this.permission.dorm_system_cfg_update_btn, false),
        }
      },
      option(){
        return{
          emptyBtn:false,
          submitBtn:this.permissionList.submitBtn ? true : false,
          group:[
            {
              label: '默认退宿日期',
              collapse:true,
              arrow:false,
              prop: 'group1',
              column:[
                {
                  label:"",
                  labelWidth:160,
                  prop:"DAY_NODE_HOUR",
                  type:"time",
                  format:'HH:mm:ss',
                  valueFormat:'HH:mm:ss',
                  span:8,
                  labelslot:true,
                  rules:[{
                    required:true,
                    message:'请选择默认退宿时间',
                    trigger:"change"
                  }],
                }
              ]
            },
            {
              label: '收费标准',
              collapse:true,
              arrow:false,
              prop: 'group2',
              column:[
                {
                  label:"",
                  prop:"tip",
                  span:24,
                  formslot:true
                },
                {
                  label:"",
                  type: 'dynamic',
                  prop:"dynamicArr",
                  children: {
                    align: 'center',
                    headerAlign: 'center',
                    column:[{
                      label: '操作符',
                      prop: "operator",
                      formslot: true,
                    },{
                      label:"入住时间(min)",
                      prop:"time",
                      rules:[{
                        required:true,
                        message:'请输入入住时间',
                        trigger:"blur"
                      }],
                    },{
                      label:"入住标准房费占比",
                      prop:"roomRate",
                      rules:[{
                        required:true,
                        message:'请输入入住标准房费占比',
                        trigger:"blur"
                      }],
                      append:'%',
                    }]
                  }
                }
              ]
            }
          ]
        }
      }
    }
  }
</script>

<style scoped="scoped">
  >>>.el-form-item--mini.el-form-item, >>>.el-form-item--small.el-form-item{
    margin-bottom: 0 !important;
  }
  >>>.basic-container__card{
    height: 100% !important;
  }
  >>>.el-collapse-item__header.is-active{
    border-bottom: 1px solid #eee;
  }
</style>
