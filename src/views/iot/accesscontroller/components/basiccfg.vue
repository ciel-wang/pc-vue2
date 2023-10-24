<template>
  <el-dialog title="基础配置"
             append-to-body
             :visible.sync="boxShow"
             width="1200px">
    <avue-form :option="option" v-model="obj" @submit="submit" >
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="boxShow = false" icon="el-icon-close">取消</el-button>
      </template>
    </avue-form>
  </el-dialog>
</template>

<script>
  import {updateDevFaceBasicCfg,getDetails} from "@/api/iot/access/face";
  import {getAreaTree} from "@/api/iot/access/area";
  export default {
    name:'basic-cfg',
    data() {
      return {
        boxShow:false,
        obj:{
            identifyDistance:'1',
            multiplayerDetection:'1',
            recRank:'1',
            recStrangerType:'1',
            recStrangerTimesThreshold:'1',
            ttsModStrangerType:'1',
            ttsModType:'1',
            displayModType:'1'
        },
        option:{
          labelWidth:150,
          submitText:"保存",
          emptyBtn:false,
          column:[
            {
              label:'设备序列号',
              prop:'devSn',
              readonly:true,
            },
            {
              label:'设备显示名称',
              prop:'companyName',
            },
            {
              label:'识别距离',
              prop:'identifyDistance',
              type:"select",
              dicData:[
                 {"label":"无限制",value:"0"},
                 {"label":"0.5米以内",value:"1"},
                 {"label":"1米以内",value:"2"},
                 {"label":"1.5米以内",value:"3"},
                 {"label":"2米以内",value:"4"},
                 {"label":"3米以内",value:"5"},
                 {"label":"4米以内",value:"6"},
               ],
            },
            {
              label:'识别分数',
              prop:'identifyScores',
            },
            {
              label:'开门延时',
              prop:'delayTimeForCloseDoor',
            },
            {
              label:'识别间隔',
              prop:'saveIdentifyTime',
            },
            {
              label:'人脸检测',
              prop:'multiplayerDetection',
              type:"select",
                dicData:[
                   {"label":"单人识别",value:"1"},
                   {"label":"多人识别",value:"2"}
                 ],
              },
            {
              label:'识别等级',
              prop:'recRank',
              type:"select",
              dicData:[
                 {"label":"快速识别,不能拒绝照片",value:"1"},
                 {"label":"能拒绝部分照片",value:"2"},
                 {"label":"能拒绝照片和视频",value:"3"}
               ],
            },
            {
              label:'陌生人识别开关',
              prop:'recStrangerType',
              type:"select",
              dicData:[
                 {"label":"不识别陌生人,不产生结果",value:"1"},
                 {"label":"识别陌生人,并产生结果",value:"2"},
               ],
            },
            {
              label:'陌生人判断等级',
              prop:'recStrangerTimesThreshold',
              type:"select",
              dicData:[
                 {"label":"1",value:"1"},
                 {"label":"2",value:"2"},
                 {"label":"3",value:"3"}
               ],
            },
            {
              label:'陌生人语音模式',
              prop:'ttsModStrangerType',
              type:"select",
              dicData:[
                 {"label":"不播报",value:"1"},
                 {"label":'播报语音',value:"2"},
                 {"label":"自定义",value:"100"}
               ],
            },
            {
              label:'陌生人语音播报模式自定义内容',
              prop:'ttsModStrangerContent',
            },
            {
              label:'会员语音模式',
              prop:'ttsModType',
              type:"select",
              dicData:[
                 {"label":"播报名字",value:"1"},
                 {"label":"不播报语音",value:"2"},
                 {"label":"自定义",value:"100"}
               ],
            },
            {
              label:'会员语音播报模式自定义内容',
              prop:'ttsModContent',
            },
            {
              label:'屏幕显示模式',
              prop:'displayModType',
              type:"select",
              dicData:[
                 {"label":"显示名字",value:"1"},
                 {"label":"不显示",value:"2"},
                 {"label":"自定义",value:"100"}
               ],
            },
            {
              label:'屏幕显示模式自定义内容',
              prop:'displayModContent',
            },

          ]
        },
      };
    },
    methods: {
      showAddBox(row){
        getDetails({"devSn":row.devSn}).then(res=>{
          let data = res.data.data;
          this.obj.devSn = data.devSn;
          this.obj = data;
          this.obj.displayModType = data.displayModType ? data.displayModType+ '' : '1';
          this.obj.identifyDistance = data.identifyDistance ? data.identifyDistance+ '' : '1';
          this.obj.multiplayerDetection = data.multiplayerDetection ? data.multiplayerDetection+ '' : '1';
          this.obj.recRank = data.recRank ? data.recRank+ '' : '1';
          this.obj.recStrangerType = data.recStrangerType ? data.recStrangerType+ '' : '1';
          this.obj.recStrangerTimesThreshold = data.recStrangerTimesThreshold ? data.recStrangerTimesThreshold+ '' : '1';
          this.obj.ttsModStrangerType = data.ttsModStrangerType ? data.ttsModStrangerType+ '' : '1';
          this.obj.ttsModType = data.ttsModType ? data.ttsModType+ '' : '1';
          this.boxShow = true;
          this.obj.id = row.devId;
        })
      },
      submit(form,done){
        updateDevFaceBasicCfg(form).then(res=>{
          if(res.data.code == 200){
            this.$message.success('设置成功');
          }else{
            this.$message.warning(res.data.data.msg);
          }
        })
        done()
      },
      error(err){
        this.$message.success('请查看控制台');
        console.log(err)
      }
    }
  }
</script>

<style>
</style>
