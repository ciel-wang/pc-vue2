<template>
  <div style="height: 100%;">
    <basic-container full>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="APP通告" name="app">
          <avue-form :option="appOptions" v-model="appForm" @submit="appSubmit" @error="error"></avue-form>
        </el-tab-pane>

        <el-tab-pane label="消息推送" name="news">
          <avue-form :option="newsOptions" v-model="newsForm" ref="formRef" @submit="newsSubmit" @error="error"></avue-form>
        </el-tab-pane>

        <el-tab-pane label="规则说明" name="rule">
          <el-collapse accordion v-model="ruleActive">
            <el-collapse-item name="visitor">
              <template slot="title">
                <i class="header-icon el-icon-info" style="font-size: 20px !important;margin-right: 8px;"></i>访客
              </template>
              <div style="border: 1px solid #ccc;">
                <Toolbar
                  style="border-bottom: 1px solid #ccc"
                  mode="default"
                  :editor="visitorEditor" />
                <Editor
                  style="height: 400px; overflow-y: hidden;"
                  v-model="FK_RULE_DESCRIPTION"
                  mode="default"
                  @onCreated="onCreated" />
              </div>
            </el-collapse-item>

            <el-collapse-item name="library">
              <template slot="title">
                <i class="header-icon el-icon-info" style="font-size: 20px !important;margin-right: 8px;"></i>图书
              </template>
              <div style="border: 1px solid #ccc;">
                <Toolbar
                  style="border-bottom: 1px solid #ccc"
                  mode="default"
                  :editor="libraryEditor" />
                <Editor
                  style="height: 400px; overflow-y: hidden;"
                  v-model="KEY_LIBRARY_APPLICATION_CARD_DESC"
                  mode="default"
                  @onCreated="onCreated2" />
              </div>
            </el-collapse-item>

            <el-collapse-item name="visitorDev">
              <template slot="title">
                <i class="header-icon el-icon-info" style="font-size: 20px !important;margin-right: 8px;"></i>访客机
              </template>
              <div style="border: 1px solid #ccc;">
                <Toolbar
                  style="border-bottom: 1px solid #ccc"
                  mode="default"
                  :editor="visitorDevEditor" />
                <Editor
                  style="height: 400px; overflow-y: hidden;"
                  v-model="VISITOR_DEV_CLIENT_TIPS_MSG"
                  mode="default"
                  @onCreated="onCreated3" />
              </div>
            </el-collapse-item>
          </el-collapse>
          <div style="text-align: center;margin-top: 30px;">
            <el-button type="primary" size="mini" icon="el-icon-check" @click="ruleSubmit" :loading="ruleSubmitLoading">保存</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="其他配置" name="visitorOther">
          <avue-form :option="visitorOtherOptions" v-model="visitorOtherForm" @submit="visitorOtherSubmit" @error="error"></avue-form>
        </el-tab-pane>
      </el-tabs>
    </basic-container>
  </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { getAppCfgList, update } from '@/api/app-manage/basicCfg.js';

export default {
  components: { Editor, Toolbar },
  data() {
    return {
      activeName: 'app',
      appForm: {},
      newsForm: {},
      ruleActive: 'visitor',
      libraryEditor: null,
      visitorEditor: null,
      visitorDevEditor:null,
      visitorOtherForm: {
        APP_UPDATE_HEAD_PORTRAIT: 0,
        EMP_AVATOR_IS_RESERVE_ORIGINAL:0,
        DORM_CATEGORY_IMG:[],
        VISITOR_ZW_YY_TIME:'23:59:59',
        VISITOR_IS_SHOW_AUDIT_BTN:1,
        VISITOR_IS_UPLOAD_CERTIFICATE:1 ,
        REGISTER_IS_START_ACCOUNT:0,
        WALLET_SUBSIDY1_START:1,WALLET_SUBSIDY2_START:1,WALLET_SUBSIDY3_START:1,WALLET_PERSONAL_START:1
      },
      ruleSubmitLoading: false,
      KEY_LIBRARY_APPLICATION_CARD_DESC:"",
      FK_RULE_DESCRIPTION:"",
      VISITOR_DEV_CLIENT_TIPS_MSG:""
    };
  },
  activated() {
    this.onLoad();
  },
  beforeDestroy() {
    // 调用销毁 API 对当前编辑器实例进行销毁
    this.libraryEditor.destroy();
    this.visitorEditor.destroy();
    this.visitorDevEditor.destroy();
  },
  methods: {
    onCreated(editor) {
      this.visitorEditor = Object.seal(editor);
    },
    onCreated2(editor) {
      this.libraryEditor = Object.seal(editor);
    },
    onCreated3(editor) {
      this.visitorDevEditor = Object.seal(editor);
    },
    onLoad() {
      getAppCfgList().then(r => {
        if (r.data.code == 200) {
          let d = r.data.data;
          this.appForm.APP_NOTICE = d.APP_NOTICE || '';
          this.appForm.APP_BANNER = d.banners.join(',') || '';
          this.FK_RULE_DESCRIPTION = d.FK_RULE_DESCRIPTION;
          this.KEY_LIBRARY_APPLICATION_CARD_DESC = d.KEY_LIBRARY_APPLICATION_CARD_DESC;
          this.VISITOR_DEV_CLIENT_TIPS_MSG = d.VISITOR_DEV_CLIENT_TIPS_MSG;
          // this.visitorEditor.txt.html(`<p>${d.FK_RULE_DESCRIPTION || ''}</p>`);
          // this.libraryEditor.txt.html(`<p>${d.KEY_LIBRARY_APPLICATION_CARD_DESC || ''}</p>`);
          this.newsForm = d
          this.visitorOtherForm.FK_APPOINTMENT_MAX_DYAS = d.FK_APPOINTMENT_MAX_DYAS || '';
          this.visitorOtherForm.APP_UPDATE_HEAD_PORTRAIT = d.APP_UPDATE_HEAD_PORTRAIT == 0 ? 0 : 1;
          this.visitorOtherForm.EMP_FACE_VERIFY_XFDEV_ID = d.EMP_FACE_VERIFY_XFDEV_ID;
          this.visitorOtherForm.REGISTER_IS_START_ACCOUNT = d.REGISTER_IS_START_ACCOUNT ? 1 : 0;
          this.visitorOtherForm.EMP_AVATOR_IS_RESERVE_ORIGINAL = d.EMP_AVATOR_IS_RESERVE_ORIGINAL == 0 ? 0 : 1;
          this.visitorOtherForm.FK_YUYUE_DATE_OR_DATETIME_OPTIONS = d.FK_YUYUE_DATE_OR_DATETIME_OPTIONS || '';
          this.visitorOtherForm.code_checkbox = [d.VISITOR_IS_START_SOURCE_ADDRESS == 1 ? 'VISITOR_IS_START_SOURCE_ADDRESS' : ''];
          this.visitorOtherForm.VISITOR_FOLLOW_UP_MAX_PERSON_COUNT = d.VISITOR_FOLLOW_UP_MAX_PERSON_COUNT;
          this.visitorOtherForm.VISITOR_DEFAULT_YY_DURATION = d.VISITOR_DEFAULT_YY_DURATION*1;
          this.visitorOtherForm.VISITOR_ZW_YY_TIME = d.VISITOR_ZW_YY_TIME;
          this.visitorOtherForm.VISITOR_IS_SHOW_AUDIT_BTN = d.VISITOR_IS_SHOW_AUDIT_BTN*1;
          this.visitorOtherForm.VISITOR_IS_UPLOAD_CERTIFICATE = d.VISITOR_IS_UPLOAD_CERTIFICATE*1;
          this.visitorOtherForm.CASH_WITHDRAWAL_SINGLE_USER_MAX_COUNT = d.CASH_WITHDRAWAL_SINGLE_USER_MAX_COUNT;
          this.visitorOtherForm.CASH_WITHDRAWAL_SINGLE_USER_MAX_AMOUNT = d.CASH_WITHDRAWAL_SINGLE_USER_MAX_AMOUNT;
          this.visitorOtherForm.WALLET_SUBSIDY1_START = d.WALLET_SUBSIDY1_START*1;
          this.visitorOtherForm.WALLET_SUBSIDY2_START = d.WALLET_SUBSIDY2_START*1;
          this.visitorOtherForm.WALLET_SUBSIDY3_START = d.WALLET_SUBSIDY3_START*1;
          this.visitorOtherForm.WALLET_PERSONAL_START = d.WALLET_PERSONAL_START*1;
          this.visitorOtherForm.CZ_SIGNLE_MAX_MONEY = d.CZ_SIGNLE_MAX_MONEY;
        }
      });
    },
    appSubmit(form, done) {
      if (!this.appForm.APP_NOTICE) {
        this.$message.error('请填写公告通知');
        done();
        return;
      }
      if (!this.appForm.APP_BANNER) {
        this.$message.warning('请上传轮播图图片');
        done();
        return;
      }
      let params = {};
      params['APP_NOTICE'] = this.appForm.APP_NOTICE;
      params['APP_BANNER'] = this.appForm.APP_BANNER.split(',');
      update(params).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          done();
        } else {
          this.$message.error(r.data.msg);
          this.onLoad();
          done();
        }
      }).catch(() => {
        done();
      });
    },
    newsSubmit(form, done) {
      update(form).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          done();
        } else {
          this.$message.error(r.data.msg);
          this.onLoad();
          done();
        }
      }).catch(() => {
        done();
      });
    },
    ruleSubmit() {
      if (!this.FK_RULE_DESCRIPTION) {
        this.$message.warning('请输入访客规则说明');
        return;
      }
      if (!this.KEY_LIBRARY_APPLICATION_CARD_DESC) {
        this.$message.warning('请输入图书规则说明');
        return;
      }
      if (!this.VISITOR_DEV_CLIENT_TIPS_MSG) {
        this.$message.warning('请输入访客机规则说明');
        return;
      }
      let params = {};
      params['KEY_LIBRARY_APPLICATION_CARD_DESC'] = this.KEY_LIBRARY_APPLICATION_CARD_DESC;
      params['FK_RULE_DESCRIPTION'] = this.FK_RULE_DESCRIPTION;
      params['VISITOR_DEV_CLIENT_TIPS_MSG'] = this.VISITOR_DEV_CLIENT_TIPS_MSG;
      this.ruleSubmitLoading = true;
      update(params).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          this.ruleSubmitLoading = false;
        } else {
          this.$message.error(r.data.msg);
          this.onLoad();
          this.ruleSubmitLoading = false;
        }
      }).catch(() => {
        this.ruleSubmitLoading = false;
      });
    },
    visitorOtherSubmit(form, done) {
      form.VISITOR_IS_START_SOURCE_ADDRESS = form.code_checkbox.includes('VISITOR_IS_START_SOURCE_ADDRESS') ? 1 : 0;
      update(form).then(r => {
        if (r.data.code == 200) {
          this.$message.success(r.data.msg);
          done();
        } else {
          this.$message.error(r.data.msg);
          this.onLoad();
          done();
        }
      }).catch(() => {
        done();
      });
    }
  },
  computed: {
    appOptions() {
      return {
        labelWidth: 120,
        emptyBtn: false,
        submitText: '保存',
        group: [
          {
            icon: 'el-icon-info',
            label: '公告通知',
            collapse: false,
            prop: 'noticeGroup',
            column: [
              {
                label: '公告通知',
                prop: 'APP_NOTICE',
                span: 12
              }
            ]
          },
          {
            icon: 'el-icon-info',
            label: '轮播图',
            collapse: false,
            prop: 'bannerGroup',
            column: [
              {
                label: '',
                prop: 'APP_BANNER',
                dataType: 'string',
                type: 'upload',
                span: 24,
                limit: 3,
                loadText: '上传中，请稍等',
                listType: 'picture-card',
                propsHttp: {
                  res: 'data'
                },
                tip: '只能上传jpg/png文件，且不超过500kb',
                action: '/api/iot-basic/appcfg/upload/banner'
              }
            ]
          }
        ]
      };
    },
    visitorOtherOptions() {
      return {
        labelWidth: 120,
        emptyBtn: false,
        submitText: '保存',
        group: [
          {
            icon: 'el-icon-info',
            label: '访客应用配置',
            collapse: false,
            prop: 'group1',
            column: [
              {
                label: '授权时间范围',
                prop: 'FK_APPOINTMENT_MAX_DYAS',
                append: '天',
                span: 12,
              },
              {
                label:"最大随行人数",
                prop:"VISITOR_FOLLOW_UP_MAX_PERSON_COUNT",
                type:"number",
                precision:0,
              },
              {
                label:"预约日期类型",
                prop:"FK_YUYUE_DATE_OR_DATETIME_OPTIONS",
                type:"radio",
                dicData:[
                  {value:'date',label:"日期"},{value:'datetime',label:"日期时间"}
                ],
                value:'datetime',
                span:12,
                control:(val) => {
                  if(val === 'datetime'){
                    return{
                      VISITOR_DEFAULT_YY_DURATION:{display:true}
                    }
                  }else{
                    return{
                      VISITOR_DEFAULT_YY_DURATION:{display:false}
                    }
                  }
                }
              },
              {
                label:"默认预约时长（小时）",
                prop:"VISITOR_DEFAULT_YY_DURATION",
                type:"number",
                span:12,
                precision:0,
                maxRows:24,
                labelWidth:160
              },
              {
                label:"更多填报内容",
                prop:"code_checkbox",
                type:"checkbox",
                dicData:[
                  {value:'VISITOR_IS_START_SOURCE_ADDRESS',label:"来源地"},
                ],
                span:12
              },
              {
                label:"最迟离访时间",
                prop:"VISITOR_ZW_YY_TIME",
                type:"time",
                span:12,
                format:'HH:mm:ss',
                valueFormat:'HH:mm:ss',
              },
              {
                label:"第三方审核",
                prop:"VISITOR_IS_SHOW_AUDIT_BTN",
                span:12,
                type:'switch',
                dicData:[
                  {value:1,label:'否'},{value:0,label:'是'}
                ]
              },
              {
                label:"上传证件照",
                prop:"VISITOR_IS_UPLOAD_CERTIFICATE",
                span:12,
                type:'switch',
                dicData:[
                  {value:0,label:'否'},{value:1,label:'是'}
                ]
              },
            ]
          },
          {
            icon: 'el-icon-info',
            label: '系统钱包配置',
            collapse: false,
            prop: 'group2',
            column: [
              {
                label: '单个个人钱包提现上限金额',
                prop: 'CASH_WITHDRAWAL_SINGLE_USER_MAX_AMOUNT',
                span: 12,
                labelWidth: 200,
                type: 'number',
                precision: 2
              },
              {
                label: '单日个人钱包提现频次上限次数',
                prop: 'CASH_WITHDRAWAL_SINGLE_USER_MAX_COUNT',
                span: 12,
                labelWidth: 220,
                type: 'number',
                precision: 0
              },
              {
                label: "单笔充值上限金额",
                prop: "CZ_SIGNLE_MAX_MONEY",
                span: 12,
                labelWidth: 180,
                type:"number",
                precision:2,
                min:0,
              },
              {
                label: "启用个人钱包",
                prop: "WALLET_PERSONAL_START",
                span: 12,
                type:'switch',
                dicData:[
                  {value:0,label:'否'},{value:1,label:'是'}
                ]
              },
              {
                label: "启用补贴钱包一",
                prop: "WALLET_SUBSIDY1_START",
                span: 12,
                type:'switch',
                dicData:[
                  {value:0,label:'否'},{value:1,label:'是'}
                ]
              },
              {
                label: "启用补贴钱包二",
                prop: "WALLET_SUBSIDY2_START",
                span: 12,
                type:'switch',
                dicData:[
                  {value:0,label:'否'},{value:1,label:'是'}
                ]
              },
              {
                label: "启用补贴钱包三",
                prop: "WALLET_SUBSIDY3_START",
                span: 12,
                type:'switch',
                dicData:[
                  {value:0,label:'否'},{value:1,label:'是'}
                ]
              },
            ]
          },
          {
            icon: 'el-icon-info',
            label: '更换头像',
            collapse: false,
            prop: 'group2',
            column: [
              {
                label: '是否能更换头像',
                prop: 'APP_UPDATE_HEAD_PORTRAIT',
                span: 12,
                type: 'radio',
                dicData: [{ value: 1, label: '是' }, { value: 0, label: '否' }]
              },
              {
                label: '是否保留原图',
                prop: 'EMP_AVATOR_IS_RESERVE_ORIGINAL',
                span: 12,
                type: 'radio',
                dicData: [{ value: 1, label: '是' }, { value: 0, label: '否' }]
              },
              {
                label: "校验设备SN",
                prop: "EMP_FACE_VERIFY_XFDEV_ID",
                span: 12,
              }
            ]
          },
          {
            icon: 'el-icon-info',
            label: '其他',
            collapse: false,
            prop: 'group3',
            column: [
              {
                label: '注册启用账户',
                prop: 'REGISTER_IS_START_ACCOUNT',
                span: 12,
                type: 'radio',
                dicData: [{ value: 1, label: '是' }, { value: 0, label: '否' }]
              },
            ]
          },
        ]
      };
    },
    newsOptions() {
      return {
        labelWidth: 130,
        emptyBtn: false,
        submitText: '保存',
        group: [
          {
            icon: 'el-icon-info',
            label: '访客模板消息',
            collapse: false,
            prop: 'visitor',
            column: [
              {
                label: '访客模板消息ID',
                prop: 'FK_VISITOR_TEMPLATE_MSGID',
                span: 12
              }
            ]
          },
          {
            icon: "el-icon-info",
            label: "照片验证模板消息",
            collapse: false,
            prop: "visitor",
            column: [
              {
                label: "照片验证结果模板消息ID",
                prop: "EMP_FACE_VERIFY_RES_TEMPLATE_MESID",
                span: 12,
                labelWidth: 180,
              },
            ],
          },
          {
            icon: 'el-icon-info',
            label: '消费模板消息',
            collapse: false,
            prop: 'xf',
            column: [
              {
                label: '消费模板消息ID',
                prop: 'ACCOUNT_MONEY_VARIATION_TEMPLATE_MSGID',
                span: 12
              }
            ]
          },
          {
            icon: 'el-icon-info',
            label: '门禁模板消息',
            collapse: false,
            prop: 'mj',
            column: [
              {
                label: '门禁模板消息ID',
                prop: 'MJ_INOUT_TEMPLATE_MSGID',
                span: 12
              }
            ]
          },
          {
            icon: 'el-icon-info',
            label: '考勤模板消息',
            collapse: false,
            prop: 'kq',
            column: [
              {
                label: '考勤模板消息ID',
                prop: 'RECEIPT_NOTIFY_TEMPLATE_MSGID',
                span: 12
              }
            ]
          },
          {
            icon: 'el-icon-info',
            label: '宿舍模板消息',
            collapse: false,
            prop: 'dorm',
            column: [
              {
                label: '宿舍维修单推送模板消息ID',
                prop: 'DORM_REPAIR_MAINTAIN_TEMPLATE_MSGID',
                span: 12
              },
              {
                label: '宿舍异常人员模板消息ID',
                prop: 'DORM_ERR_INOUT_MJ_TEMPLATE_MSGID',
                span: 12,
                labelWidth: 180
              }
            ]
          }
        ]
      };
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.basic-container .full-card {
  height: 100% !important;
  overflow: auto;
}
/deep/.basic-container:first-child {
  height: 100% !important;
}
/deep/.el-collapse {
  border: none;
}
/deep/.el-collapse-item__wrap {
  border: none;
}
/deep/.basic-container__card {
  height: 100%;
  overflow: auto;
}
/deep/.avue-group__title {
  font-size: 13px;
  margin: 0;
}
</style>
