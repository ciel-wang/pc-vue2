<template>
  <div class="dorm_monitor myopacity">
    <el-row class="header">
      <el-card>
        <avue-input-tree
          ref="tree"
          include-half-checked=""
          multiple
          v-model="devIds"
          placeholder="请选择设备"
          type="tree"
          size="small"
          style="width: 180px;"
          :props="{value:'valueStr'}"
          :dic="floodDevDic"
          @change="nodeClick"></avue-input-tree>
      </el-card>
      <el-card :body-style="{padding:'10px'}">
        <p>实时信息统计</p>
        <p>{{todayHours}}</p>
        <p>{{todayDate}}</p>
      </el-card>
      <el-card :body-style="{padding:'10px'}">
        <p>入住总人数</p>
        <p class="fw600"><avue-count-up decimals="0" :end="obj.liveTotalCount"></avue-count-up></p>
        <p>请假：<avue-count-up decimals="0" :end="obj.qjCount"></avue-count-up></p>
      </el-card>
      <el-card :body-style="{padding:'10px'}">
        <p>楼内人数</p>
        <p class="fw600"><avue-count-up decimals="0" :end="obj.inCount"></avue-count-up></p>
        <p><avue-count-up decimals="2" :end="obj.insideABR"></avue-count-up>%</p>
      </el-card>
      <el-card :body-style="{padding:'10px'}">
        <p>楼外人数</p>
        <p class="fw600"><avue-count-up decimals="0" :end="obj.outCount"></avue-count-up></p>
        <p><avue-count-up decimals="2" :end="obj.outsideABR"></avue-count-up>%</p>
      </el-card>
    </el-row>
    <el-row class="body">
      <el-col :span="18" class="body_left">
        <!-- 表单部分 -->
        <div>
          <avue-form :option="formOption" v-model="form"></avue-form>
          <div class="Photo">
            <div>
              <p>证件照</p>
              <p>
                <img v-if="form.sourceEmpFaceUrl" :src="form.sourceEmpFaceUrl+'?'+new Date().getTime()" height="180px" />
              </p>
            </div>
            <div>
              <p>实时照</p>
              <p>
                <img v-if="form.captureEmpFaceUrl" :src="form.captureEmpFaceUrl+'?'+new Date().getTime()" width="130px" />
              </p>
            </div>
          </div>
        </div>
        <!-- 表格部分 -->
        <div>
          <vxe-grid
            border
            resizable
            auto-resize
            keep-source
            height="100%"
            ref="xGrid"
            size="mini"
            align="center"
            :highlight="true"
            :columns="tableColumn"
            :loading="loading"
            :data="tableData"
            :export-config="{}"
            :seq-config="{startIndex: (page.currentPage - 1) * page.pageSize}">
          </vxe-grid>
        </div>
      </el-col>
      <!-- 进出信息部分 -->
      <el-col :span="6" class="body_right">
        <el-card shadow="never">
          <div slot="header">实时信息</div>
          <div v-for="(v,i) in realInfoArr" :key="i" class="right_item">
            <img :src="v.captureEmpFaceUrl+'?'+new Date().getTime()" />
            <div>
              <p>学工号：{{v.empCode}}</p>
              <p>设备：{{v.devName}}</p>
              <p>姓名：{{v.empName}}</p>
              <p>方向：{{v.inOutType}}</p>
              <p>部门名称：{{v.className}}</p>
              <p>时间：{{v.swipeTime}}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import moment from 'moment'
  import { mapGetters } from 'vuex';
  import website from '@/config/website';
  import { getToken } from '@/util/auth';
  import { getFloorDevDic } from "@/api/dorm/floor.js"
  import { getDormRealData } from "@/api/dorm/real_monitor.js"

  export default{
    data(){
      return{
        todayHours:moment().format('HH:mm:ss'),
        todayDate:moment().format("YYYY年MM月DD日"),
        timer:"",
        obj:{liveTotalCount:0,qjCount:0,inCount:0,insideABR:0,outCount:0,outsideABR:0},
        loading:false,
        tableData:[],
        page:{
          pageSize:20,
          currentPage:1,
          total:0
        },
        tableHeigt:0,
        realInfoArr:[],
        websock:null,
        form:{},
        floodDevDic:[],
        devIds:""
      }
    },
    created() {
      this.initWebSocket();
    },
    mounted() {
      this.timer = setInterval(() => {
        this.initDate()
      },1000)
      this.initFloorInfo()
      this.timer2 = setInterval(() => {
        this.initFloorInfo()
      },3000)
      getFloorDevDic().then(r => {
        this.floodDevDic = r.data.data
      })
    },
    deactivated() {
      clearInterval(this.timer)
      clearInterval(this.timer2)
      if(this.websock && this.websock.readyState != this.websock.OPEN)  {
        this.websock.close();
      }
    },
    methods:{
      initFloorInfo(){
        getDormRealData().then(r => {
          let d = r.data.data
          d.insideABR = (d.inCount / d.liveTotalCount)*100
          d.outsideABR = (d.outCount / d.liveTotalCount)*100
          this.obj = d
        })
      },
      nodeClick(val){
        console.log(val)
        this.devIds = val
      },
      initWebSocket() {
        let url = website.websocketUrl;
        this.websock = new WebSocket(url); // 监听打开
        this.websock.onopen = this.websockOpen; // 监听关闭
        this.websock.onclose = this.websockClose; //监听异常
        this.websock.onerror = this.websockError; //监听服务器发送的消息
        this.websock.onmessage = this.websockMessage;
      },
      websockOpen(){
        let $this = this;
        let token = getToken();
        let param = { type: 30, token: token};
        this.websock.send(JSON.stringify(param));
        // this.intervalIndex = setInterval(()=>{
        //   if($this.websock.readyState != $this.websock.OPEN){
        //     if(this.intervalIndex > 0){
        //       clearInterval(this.intervalIndex)
        //     }
        //   }else{

        //   }
        // },3000)
      },
      websockMessage(e) {
        if(e.data != 'successfully'){
          let data = JSON.parse(e.data)
          data.inOutType = data.inOutType == 1 ? '进' : '出'
          data.empSex = data.empSex == 1 ? '男' : '女'
          data.devType = data.devType == 1 ? '卡' : '脸'
          data.className = data.empType == 1 ? data.className : data.deptName
          let arr = this.tableData;
          let arr1 = this.realInfoArr;
          if(data.type == 30){
            console.log(data)
            let devArr = this.devIds || [];
            if(devArr.length){
              devArr.forEach(v => {
                if(v == data.treeKey){
                  arr.unshift(data)
                  arr1.unshift(data)
                  this.form = data;
                }
              })
            }else{
              arr.unshift(data)
              arr1.unshift(data)
              this.form = data;
            }
            if(arr.length>40){
              arr = arr.slice(0,40)
            }
            if(arr1.length>5){
              arr1 = arr1.slice(0,5)
            }
            this.tableData = arr;
            this.realInfoArr = arr1;
            this.$forceUpdate();
          }
        }
      },
      initDate(){
        this.todayDate = moment().format("YYYY年MM月DD日")
        this.todayHours = moment().format('HH:mm:ss')
      },
    },
    computed:{
      formOption(){
        return{
          emptyBtn: false,
          submitBtn:false,
          size:"mini",
          labelWidth:80,
          group:[
            {
              label:"基本资料",
              arrow:false,
              column:[
                {
                  label:"姓名",
                  prop:"empName",
                  span:12,
                  readonly:true
                },
                {
                  label:"学工号",
                  prop:"empCode",
                  span:12,
                  readonly:true
                }
              ]
            },
            {
              label:"详细资料",
              arrow:false,
              column:[
                {
                  label:"性别",
                  prop:"empSex",
                  span:12,
                  readonly:true,
                },
                {
                  label:"部门名称",
                  prop:"className",
                  span:12,
                  readonly:true
                },
                {
                  label:"进出方式",
                  prop:"devType",
                  span:12,
                  readonly:true
                },
                {
                  label:"方向",
                  prop:"inOutType",
                  span:12,
                  type:'radio',
                  dicData:[
                    {value:'进',label:"进"},{value:'出',label:'出'}
                  ],
                  disabled:true,
                }
              ]
            },
          ]
        }
      },
      tableColumn(){
        return[
          {
            title:"学工号",
            field:"empCode",
            minWidth:100
          },
          {
            title:"姓名",
            field:"empName",
            minWidth:100
          },
          {
            title:"性别",
            field:"empSex",
            minWidth:70
          },
          {
            title:"部门/班级名称",
            field:"className",
            minWidth:100
          },
          {
            title:"设备编号",
            field:"devCode",
            minWidth:100
          },
          {
            title:"设备名称",
            field:"devName",
            minWidth:100
          },
          {
            title:"进出方式",
            field:"devType",
            minWidth:100,
          },
          {
            title:"方向",
            field:"inOutType",
            minWidth:100,
          },
          {
            title:"时间",
            field:"swipeTime",
            minWidth:100
          }
        ]
      }
    }
  }
</script>

<style scoped="scoped" lang="scss">
  p{
    margin: 0;
  }
  .dorm_monitor{
    padding: 0 10px;
    height: 99%;
    .header{
      height: 130px;
      padding: 14px 0;
      margin-bottom: 8px;
      background-color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      .el-card{
        width: 18%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        p:nth-child(2){
          width: 100%;
          margin: 4px 0;
        }
      }
    }
    .body{
      height: calc(100% - 150px);
      .el-col{
        height: 100%;
      }
      .body_left{
        &>div{
          background-color: #fff;
          margin-right: 8px;
          &:first-child{
            height: 220px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 10px 20px;
            /deep/.avue-group .el-collapse-item__header{
              margin-bottom: 10px;
            }
            /deep/.avue-group__header{
              height: 30px;
            }
            /deep/.el-form-item--mini.el-form-item, .el-form-item--small.el-form-item{
              margin-bottom: 10px;
            }
            .avue-form{
              width: 90% !important;
              height: 100%;
              margin-right: 40px;
            }
            .Photo{
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: space-around;
              align-items: center;
              &>div{
                width: 200px;
                text-align: center;
                p{
                  &:last-child{
                    border: 1px solid #E8E8E8;
                    height: 180px;
                    width: 100%;
                    margin-top: 6px;
                    overflow: hidden;
                  }
                }
              }
            }
          }
          &:last-child{
            height: calc(100% - 276px);
            padding: 10px;
          }
        }
      }
      .body_right{
        background-color: #fff;
        .el-card{
          height: 100%;
          .right_item{
            font-size: 14px;
            display: flex;
            border-bottom: 1px dashed #999;
            margin: 6px 0;
            img{
              height: 130px;
              width: 130px;
            }
            div{
              width: 100%;
              margin-left: 20px;
              p{
                margin-bottom: 4px;
              }
            }
          }
        }
      }
    }
  }
</style>
