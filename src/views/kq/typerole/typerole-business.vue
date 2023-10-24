<template>
  <el-drawer
    :title="title"
    :visible.sync="drawerVisible"
    :before-close="handleClose"
    append-to-body
    size="480px"
    :modal-append-to-body="true"
    :wrapperClosable="false">
    <avue-form ref="formRef" :option="option" v-model="form" @submit="submit" @error="error">
      <template slot-scope="scope" slot="menuForm">
        <el-button @click="handleClose" icon="el-icon-close">取消</el-button>
      </template>
      <template slot="qjspHeader">
        <div>
          <span>出差审批设置</span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content" style="width: 260px;">
              系统默认显示一级审批人，当需要多级审批人时，用户可根据单据时长设置需要的审批级数。</div>
            <i class="el-icon-question" style="font-size: 14px;vertical-align: rever;"></i>
          </el-tooltip>
        </div>
      </template>
    </avue-form>
  </el-drawer>
</template>

<script>
import { typeroleAdd, typeroleUpdate } from '@/api/kq/typerole.js';
export default {
  data() {
    return {
      title: '添加出差类型',
      drawerVisible: false,
      form: { isPaid: true, roleStatus: true, ranks: [{ operator: '>', auditRank: '一级', limitDays: 1 }] }
    };
  },
  watch: {
    'form.ranks': {
      handler(val) {
        if (val) {
          if (val.length > 3) {
            this.$message.warning('最多三级');
            this.form.ranks.splice(3, this.form.ranks.length - 3);
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    openDialog(details) {
      this.drawerVisible = true;
      if (details) {
        this.title = '编辑出差类型';
        this.form = details;
      } else {
        this.title = '添加出差类型';
        this.form = { isPaid: true, roleStatus: true, ranks: [{ operator: '>', auditRank: '一级', limitDays: 1 }] };
      }
    },
    submit(form, done) {
      this.$refs.formRef.validate((vaild, done) => {
        if (vaild) {
          form.roleType = 2;
          let arr = form.ranks;
          arr.forEach(val => {
            if (val.operator == '>') {
              val.operator = 1;
            }
            if (val.auditRank == '一级') {
              val.auditRank = 1;
            }
            if (val.auditRank == '二级') {
              val.auditRank = 2;
            }
            if (val.auditRank == '三级') {
              val.auditRank = 3;
            }
          });
          if (arr.length > 1) {
            for (let i = 0; i < arr.length - 1; i++) {
              if (arr[i + 1].limitDays < arr[i].limitDays) {
                this.$message.error('下一级的天数不能小于上一级的天数');
                done();
                return;
              }
              if (arr[i + 1].auditRank <= arr[i].auditRank) {
                this.$message.error('下一级的级别不能小于上一级的级别');
                done();
                return;
              }
            }
          }
          let arr2 = [];
          arr.forEach(v => {
            arr2.push(v.operator + ',' + v.limitDays + ',' + v.auditRank);
          });
          form.ranks = arr2.join('#');
          if (this.title == '编辑出差类型') {
            typeroleUpdate(form).then(res => {
              if (res.data.code == 200) {
                this.$message.success(res.data.msg);
                this.$emit('refreshPage');
                this.form = {};
                this.$refs['formRef'].clearValidate();
                this.$refs['formRef'].resetForm();
                this.drawerVisible = false;
                done();
              } else {
                this.$message.error(res.data.msg);
                done();
              }
            }).catch(err => done());
          } else {
            typeroleAdd(form).then(res => {
              if (res.data.code == 200) {
                this.$message.success(res.data.msg);
                this.$emit('refreshPage');
                this.form = {};
                this.$refs['formRef'].clearValidate();
                this.$refs['formRef'].resetForm();
                this.drawerVisible = false;
                done();
              } else {
                this.$message.error(res.data.msg);
                done();
              }
            }).catch(err => {
              done();
            });
          }
        } else {
          done();
        }
      });
    },
    handleClose() {
      this.drawerVisible = false;
      this.form = {};
      this.$refs['formRef'].clearValidate();
      this.$refs['formRef'].resetForm();
    }
  },
  computed: {
    option() {
      return {
        emptyBtn: false,
        labelWidth: 110,
        column: [
          {
            label: '出差类型编号',
            prop: 'roleNum',
            span: 24,
            rules: [
              {
                required: true,
                message: '请填写出差类型编号',
                trigger: 'blur'
              }
            ],
            maxlength:20
          },
          {
            label: '出差类型名称',
            prop: 'roleName',
            span: 24,
            rules: [
              {
                required: true,
                message: '请填写出差类型名称',
                trigger: 'blur'
              }
            ],
            maxlength:5
          },
          {
            label: '是否启用',
            prop: 'roleStatus',
            span: 24,
            type: 'radio',
            dicData: [{ value: true, label: '启用' }, { value: false, label: '不启用' }]
          },
          {
            label: '排序',
            prop: 'roleSeq',
            span: 24,
            maxlength:20
          },
        ],
        group:[
          {
            arrow:false,
            prop:"qjsp",
            column:[
              {
                prop: 'ranks',
                type: 'dynamic',
                span: 24,
                labelWidth: 0,
                children: {
                  align: 'center',
                  rowAdd: done => {
                    done({
                      operator: '>',
                      limitDays: 0,
                      auditRank: '一级'
                    });
                  },
                  height: '200px',
                  column: [
                    {
                      label: '操作符',
                      prop: 'operator',
                      minWidth: 70,
                      type: 'select',
                      dicData: [
                        {
                          value: 1,
                          label: '>'
                        }
                      ]
                    },
                    {
                      label: '小时',
                      prop:"limitDays",
                      minWidth:70,
                      type: 'number',
                      minRows:0,
                      precision:0,
                      step:1,
                      controls:false,
                      maxRows:9999,
                    },
                    {
                      label: '级别',
                      prop: 'auditRank',
                      minWidth: 90,
                      type: 'select',
                      dicData: [
                        {
                          value: 1,
                          label: '一级'
                        },
                        {
                          value: 2,
                          label: '二级'
                        },
                        {
                          value: 3,
                          label: '三级'
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
>>> .avue-crud__pagination {
  padding: 0 !important;
}
>>> .avue-dynamic .avue-crud .avue-crud__pagination {
  height: 0 !important;
}
>>> .el-form-item--mini.el-form-item,
>>> .el-form-item--small.el-form-item {
  margin-bottom: 10px !important;
}
>>>.el-collapse-item.is-disabled .el-collapse-item__header{
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}
>>>.el-collapse-item__header.is-active{
  border-bottom: 1px solid #eee;
}
</style>
