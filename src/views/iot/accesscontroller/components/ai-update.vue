<template>
  <el-dialog title="编辑人脸设备"
             append-to-body
             :visible.sync="boxShow"
             width="900px">
    <avue-form ref="form" :option="option" v-model="obj" @submit="submit" >
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="boxShow = false" icon="el-icon-close">取消</el-button>
      </template>
      <template slot="attendance" slot-scope="scope">
        <el-checkbox v-model="obj.attendance">签到</el-checkbox>
      </template>
      <template slot="isPushMsg" slot-scope="scope">
        <el-checkbox v-model="obj.isPushMsg">消息推送</el-checkbox>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
  import {getDetails,updateFace} from "@/api/iot/access/face";
  import {getAreaTree} from "@/api/iot/access/area";
  export default {
    name:'ai-update',
    props:{
      btnname:{
        type:String,
        default:'添加'
      },
      selectionList:{
        type:Array
      }
    },
    data() {
      return {
        areaTreeData:[],
        boxShow:false,
        obj:{attendance:false,isPushMsg:false},
      };
    },
    computed:{
      option(){
        return {
            labelWidth:120,
            submitText:"保存",
            emptyBtn:false,
            column:[
              {
                label:'设备编号',
                prop:'devCode',
                rules: [{
                  required: true,
                  message: "请输入设备编号",
                  trigger: "blur"
                }],
                span:9,
                maxlength:20
              },
              {
                label:'',
                labelWidth:0,
                prop:"attendance",
                type:'checkbox',
                formslot:true,
                span:3
              },
              {
                label:'服务器IP',
                prop:'serverIp',
                rules: [{
                  required: true,
                  message: "请输入服务器",
                  trigger: "blur"
                }],
                maxlength:20
              },
              {
                label:'设备名称',
                prop:'devName',
                rules: [{
                  required: true,
                  message: "请输入设备名称",
                  trigger: "blur"
                }],
                span:9,
                maxlength:20
              },
              {
                label:'',
                labelWidth:0,
                prop:"isPushMsg",
                type:'checkbox',
                formslot:true,
                span:3
              },
              {
                label:'服务器端口',
                prop:'serverPort',
                type:"number",
                rules: [{
                  required: true,
                  message: "请输入服务器端口",
                  trigger: "blur"
                }],
                maxlength:10
              },
              {
                label:"设备类型",
                prop:"devType",
                type:'select',
                rules:[{
                  required: true,
                  message: "请选择设备类型",
                  trigger: "change"
                }],
                dicData:[
                  {value:2,label:"IOT-Y"},{value:7,label:"IOT-H"},
                ]
              },
              {
                label:'门区编号',
                prop:'doorAreaCode',
                maxlength:20
              },
              {
                label:'设备端口',
                prop:'devPort',
                placeholder:'IOT-H默认端口80，IOT-Y默认端口8090',
                rules: [{
                  required: true,
                  message: "请输入设备端口",
                  trigger: "blur"
                }],
                maxlength:10
              },
              {
                label:'门区名称',
                prop:'doorAreaName',
                maxlength:20
              },
              {
                label:'设备IP',
                prop:'devIp',
                rules: [{
                  required: true,
                  message: "请输入设备",
                  trigger: "blur"
                }],
                maxlength:20
              },
              {
                label:'区域选择',
                prop:'devAreaId',
                dicData:this.areaTreeData,
                type:"tree",
                props:{
                  value:"valueStr"
                }
              },
              {
                label:'设备序列号',
                prop:'devSn',
                rules: [{
                  required: true,
                  message: "请输入设备序列号",
                  trigger: "blur"
                }],
                maxlength:20
              },
              {
                label:'进出标识',
                prop:'direction',
                type:"select",
                dicData:[
                  {"label":"入口",value:"入口"},
                  {"label":"出口",value:"出口"},
                ],
              },
              {
                label: '读卡类型',
                prop: 'devReadCardType',
                rules: [{
                  required: true,
                  message: '请选择读卡类型',
                  trigger: 'blur'
                }],
                type:'select',
                dicData:[
                  {value:1,label:'物理卡号'},{value:2,label:'卡序列号'}
                ]
              },
              {
                label:"是否启用",
                prop:'devState',
                type:'radio',
                dicData:[
                  {value:1,label:"是"},
                  {value:0,label:"否"}
                ],
              },
            ]
         };
      },
    },
    activated() {
      this.initAreaTreeData();
    },
    methods: {
      showAddBox(row){
        getDetails({"devSn":row.devSn}).then(res=>{
          let d = res.data.data
          this.obj = res.data.data;
          this.obj.devAreaId = d.ancestors
          this.boxShow = true;
        })
      },
      submit(form,done){
        let area = form.devAreaId;
        if(!area || !area.startsWith('A')){
          this.$message.error("请选择区域");
          form.devAreaId = ""
          done();
          return;
        }else{
          form.devAreaId = area.split('-')[1]
        }
        updateFace(form).then(res=>{
          if(res.data.code == 200){
             done()
             this.$message.success('修改成功');
             this.boxShow = false;
             this.$refs.form.resetForm()
             this.$emit("updatePage")
          }else{
            this.$message.warning(res.msg);
            done()
          }
        }).catch(() => {
          done();
        })
      },
      error(err){
        this.$message.success('请查看控制台');
        console.log(err)
      },
      initAreaTreeData(){
        getAreaTree().then(res=>{
          this.areaTreeData = res.data.data;
          this.$forceUpdate();
        });
      },
    }
  }
</script>

<style>
</style>
