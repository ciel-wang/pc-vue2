<template>
  <basicContainer>
    <div ref="myPage" @click="isShowNodeMenuPanel = false" :style="{height: height + 'px'}">
      <SeeksRelationGraph
        ref="seeksRelationGraphRef"
        :options="graphOptions"
        :on-node-click="onNodeClick"
        :on-line-click="onLineClick">
        <div slot="node" slot-scope="{node}">
          <div style="cursor: pointer;width: 70px;height: 70px;overflow: hidden;" @click="showNodeMenus(node, $event)" @contextmenu.prevent.stop="showNodeMenus(node, $event)">
            <img :src="node.data.schoolLogo ? node.data.schoolLogo : '/logo2.png'" width="100%" />
          </div>
          <div v-if="!node.data.first" style="position: absolute;top: -6px;left: 100px;color: #000;text-align: left;padding: 5px;width: 300px;">
            <p style="margin: 5px 0;">
              <span style="font-weight: 600;">学校名称：</span>{{node.data.schoolName}}</p>
            <p style="margin: 5px 0;">
              <span style="font-weight: 600;">办公类型：</span>{{node.data.schoolType}}</p>
            <p style="margin: 5px 0;">
              <span style="font-weight: 600;">学校办别：</span>{{node.data.schoolNature}}</p>
            <p style="margin: 5px 0;">
              <span style="font-weight: 600;">学&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别：</span>{{node.data.schoolLength}}</p>
            <p style="margin: 5px 0;">
              <span style="font-weight: 600;">学校地址：</span>{{node.data.schoolAddress}}</p>
          </div>
          <!-- <p style="margin-top: 16px;width: 266px;text-align: left;color: #000000;" v-if="!node.data.first">
            <span style="font-weight: 600;">学校地址：</span>{{node.data.schoolAddress}}
          </p> -->
          <div v-if="node.data.first" style="color: #000;text-align: left;width: 180px;position: absolute;left: 0;margin-top: 10px;">
            <p style="margin: 5px 0;">
              <span style="font-weight: 600;">学校名称：</span>{{node.data.schoolName}}</p>
            <p style="margin: 5px 0;">
              <span style="font-weight: 600;">办公类型：</span>{{node.data.schoolType}}</p>
            <p style="margin: 5px 0;">
              <span style="font-weight: 600;">学校办别：</span>{{node.data.schoolNature}}</p>
            <p style="margin: 5px 0;">
              <span style="font-weight: 600;">学&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别：</span>{{node.data.schoolLength}}</p>
            <p style="margin: 5px 0;">
              <span style="font-weight: 600;">学校地址：</span>{{node.data.schoolAddress}}</p>
          </div>
        </div>
      </SeeksRelationGraph>
    </div>
    <div v-show="isShowNodeMenuPanel" :style="{left: nodeMenuPanelPosition.x + 'px', top: nodeMenuPanelPosition.y + 'px' }" class="menu">
      <div class="c-node-menu-item" @click.stop="doAction('1')" v-if="add && permission.iot_user_add_btn">添加</div>
      <div class="c-node-menu-item" @click.stop="doAction('2')" v-if="permission.iot_user_edit_btn">编辑</div>
      <div class="c-node-menu-item" @click.stop="doAction('3')" v-if="remove && permission.iot_user_del_btn">删除</div>
    </div>

    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      :modal-append-to-body="true"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :append-to-body="true"
      :before-close="handleClose">
      <avue-form
        ref="formRef"
        :option="options"
        v-model="form"
        @submit="submit">
        <template slot-scope="scope" slot="menuForm">
          <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
        </template>
      </avue-form>
    </el-dialog>
  </basicContainer>
</template>

<script>
  import SeeksRelationGraph from 'relation-graph'
  import { schoolUpdate ,schoolRemove , schoolList, schoolDetails} from "@/api/iot/user.js"
  import { getToken } from "@/util/auth";
  import website from "@/config/website";
  import { mapGetters } from "vuex";
  
  export default{
    components: { SeeksRelationGraph },
    data(){
      return{
        height:0,
        isShowNodeMenuPanel:false,
        nodeMenuPanelPosition: { x: 0, y: 0 },
        title:"添加学校",
        dialogVisible:false,
        form:{schoolName:""},
        add:true,
        remove:true
      }
    },
    mounted() {
      this.height = window.innerHeight - 134
      this.setGraphData()
    },
    methods:{
      submit(form,done){
        this.$refs.formRef.validate((vaild, done) => {
          if (vaild) {
            if(form.schoolLogo){
              form.schoolLogo = '/' + form.schoolLogo.split('/').slice(3).join('/');
            }
            schoolUpdate(form).then(r => {
              if(r.data.code == 200){
                this.$message.success(r.data.msg);
                done();
                // this.form.schoolName = "";
                // this.dialogVisible = false;
                this.setGraphData();
                this.handleClose();
              }else{
                this.$message.error(r.data.msg);
                done();
              }
            }).catch(() => done())
          }
        })
      },
      setGraphData(){
        schoolList().then(r => {
          let d = r.data.data;
          this.trans(d,true);
          var __graph_json_data = { 'rootId': '', 'nodes': d, 'links': [] }
          this.$refs.seeksRelationGraphRef.setJsonData(__graph_json_data)
        })
      },
      trans(data,bool){
        data.forEach((v,i) => {
          v.id = v.id + '';
          v.text = v.schoolName
          v.data = {
            schoolName:v.schoolName,
            schoolLogo:v.schoolLogo,
            schoolLength:v.schoolLength,
            schoolAddress:v.schoolAddress,
            schoolNature:v.schoolNature,
            schoolType:v.schoolType,
            first:bool
          }
          if(v.children && v.children.length > 0){
            this.trans(v.children,false)
          }
        })
      },
      showNodeMenus(nodeObject, $event) {
        if(nodeObject.lot.parent){
          this.add = false;
          this.remove = true;
        }else{
          this.add = true;
          this.remove = false;
        }
        this.currentNode = nodeObject
        var _base_position = this.$refs.myPage.getBoundingClientRect()
        this.isShowNodeMenuPanel = true
        this.nodeMenuPanelPosition.x = $event.clientX - _base_position.x+37
        this.nodeMenuPanelPosition.y = $event.clientY - _base_position.y+80
      },
      doAction(actionName) {
        if(actionName == 1){
          this.title = "添加学校"
          this.dialogVisible = true;
          this.$nextTick(() => {
            this.$refs.formRef.clearValidate();
          })
        }else if(actionName == 2){
          this.title = "编辑学校"
          this.dialogVisible = true;
          schoolDetails(this.currentNode.id).then(r => {
            if(r.data.code == 200){
              this.form = r.data.data;
            }
          })
        }else{
          this.$confirm("确定要删除学校？", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            let id = this.currentNode.id;
            return schoolRemove({id:id});
          }).then(r =>{
            if(r.data.code == 200){
              this.$message.success(r.data.msg);
              this.setGraphData()
            }else{
              this.$message.error(r.data.msg);
            }
          }).catch((error) => {
            console.log(error);
          });
        }
        this.isShowNodeMenuPanel = false
      },
      handleClose(){
        this.form.id = "";
        this.$refs.formRef.resetFields();
        this.$refs.formRef.clearValidate();
        this.dialogVisible = false;
      },
    },
    computed:{
      ...mapGetters(['permission']),
      options(){
        return{
          emptyBtn: false,
          submitText: "保存",
          column:[
            {
              label:"学校名称",
              prop:"schoolName",
              span:16,
              maxlength:20,
              rules:[{
                required:true,
                message:"请输入学校名称",
                trigger:"blur"
              }]
            },
            {
              label:"办学类型",
              prop:"schoolType",
              span:16,
              type:"select",
              dicData:[
                {value:"高等教育",label:"高等教育"},
                {value:"学前教育",label:"学前教育"},
                {value:'幼儿园',label:"幼儿园"},
                {value:'初等教育',label:"初等教育"},
              ]
            },
            {
              label:"学校办别",
              prop:"schoolNature",
              span:16,
              type:"select",
              dicData:[
                {value:"公办",label:"公办"},
                {value:"民办",label:"民办"},
              ]
            },
            {
              label:"学制",
              prop:"schoolLength",
              span:16,
              type:"select",
              dicData:[
                {value:'三年制',label:"三年制"},
                {value:"四年制",label:"四年制"},
                {value:"六年制",label:"六年制"},
              ]
            },
            {
              label:"学校地址",
              prop:"schoolAddress",
              span:16,
              maxlength:100
            },
            {
              label: "",
              labelWidth:0,
              prop: "schoolLogo",
              type: "upload",
              loadText: "上传中，请稍等",
              limit: 1,
              listType: "picture-img",
              span: 3,
              drag: false,
              propsHttp: {
                res: "data"
              },
              data: {
                basicUserId: this.form.id == null ? 0 : this.form.id
              },
              tip: "支持上传JPG,JPEG,PNG格式的图片,单张图片大小不能超过5M",
              action: `/api/iot-basic/school/upload/logo?${this.website.tokenHeader}=${getToken()}`
            }
          ]
        }
      },
      graphOptions(){
        return{
          'backgrounImageNoRepeat': true,
          'allowSwitchLineShape': true,
          'layouts': [
            {
              'label': '中心',
              'layoutName': 'tree',
              'layoutClassName': 'seeks-layout-center',
              'defaultJunctionPoint': 'border',
              'defaultNodeShape': 0,
              'defaultLineShape': 1,
              'centerOffset_x':60,
              'from': 'left',
              'min_per_width': '150',
              'max_per_width': '300',
              'min_per_height': '200',
              'max_per_height': '500',
            }
          ],
          'defaultLineMarker': {
            'markerWidth': 12,
            'markerHeight': 12,
            'refX': 6,
            'refY': 6,
            'data': 'M2,2 L10,6 L2,10 L6,6 L2,2'
          },
          'defaultNodeShape': 1,
          'defaultLineShape': 4,
          'defaultJunctionPoint': 'lr',
          'defaultNodeBorderWidth': 0,
          'defaultLineColor': 'rgba(0, 186, 189, 1)',
          'defaultNodeColor': '#fff',
          'defaultNodeHeight': '70',
          'allowShowZoomMenu':false,
          'disableDragNode':false,
          'defaultNodeWidth':70,
          'defaultLineWidth':3
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
.menu{
  z-index: 999;
  background-color: #ffffff;
  border:#eeeeee solid 1px;
  box-shadow: 0px 0px 8px #cccccc;
  position: absolute;
  .c-node-menu-item{
    line-height: 30px;
    padding: 7px 24px;
    cursor: pointer;
    color: #444444;
    font-size: 14px;
    border-top:#efefef solid 1px;
    &:hover{
      background-color: rgba(66,187,66,0.2);
    }
  }
}
/deep/.avue-form__group {
  div:nth-child(6) {
    position: absolute;
    top: 10px;
    right: 95px;
    z-index: 100;
  }
  .avue-upload__icon {
    width: 149px !important;
    height: 149px !important;
    line-height: 116px !important;
  }
  .el-upload__tip {
    line-height: 19px;
    padding: 10px;
    width: 133px;
    margin-top: -85px !important;
  }
}
/deep/.el-upload__tip {
  font-size: 12px;
  color: #c0c4cc !important;
  margin-top: 7px;
}
/deep/ .avue-upload__avatar {
  width: 149px !important;
  height: 149px !important;
  display: block;
}
/deep/.avue-upload--list .el-upload {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}
</style>
