<template>
  <basic-container>
    <div class="tipcls">
      <p>注意：</p>
      <p>1.系统只允许有一个临时车以及访客车类型，如果需要设置车型差异化收费，可通过添加多个车型，在配置收费规则时，设置相应的车型、车类收费规则。</p>
      <p>2.系统的临时车类必须设置，请勿删除。</p>
      <p>3.当车场允许访客车进入，系统的访客车类必须添加，请勿删除。</p>
    </div>
    <div class="mbottom8">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd" v-if="permission.park_carclass_add_btn">添加</el-button>
      <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit" v-if="permission.park_carclass_edit_btn">编辑</el-button>
      <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete" v-if="permission.park_carclass_del_btn">删除</el-button>
      <el-button type="primary" size="small" icon="el-icon-download" @click="handleExport" v-if="permission.park_carclass_export_btn">导出</el-button>
    </div>
    <vxe-grid
      border
      resizable
      auto-resize
      highlight-hover-row
      :height="tableHeight"
      keep-source
      ref="xGrid"
      size="mini"
      align="center"
      :highlight="true"
      :columns="tableColumn"
      :loading="loading"
      :data="tableData">
      <template #allowRepeatIn="{row}">
        <i class="icon-xuanzhong" v-if="row.allowRepeatIn" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>

      <template #allowRepeatOut="{row}">
        <i class="icon-xuanzhong" v-if="row.allowRepeatOut" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>
      <template #inConfirm="{row}">
        <i class="icon-xuanzhong" v-if="row.inConfirm" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>
      <template #outConfirm="{row}">
        <i class="icon-xuanzhong" v-if="row.outConfirm" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>
      <template #allowFullIn="{row}">
        <i class="icon-xuanzhong" v-if="row.allowFullIn" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>
      <template #inOutUpdateCarNum="{row}">
        <i class="icon-xuanzhong" v-if="row.inOutUpdateCarNum" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>
      <template #likeMatch="{row}">
        <i class="icon-xuanzhong" v-if="row.likeMatch" :style="{ color: colorName }"></i>
        <i class="icon-weixuanzhong" v-else></i>
      </template>
    </vxe-grid>

    <carclass-add-edit ref="carclassAddEditRef" @refeshPage="onLoad" :carTypeDic="carTypeDic"></carclass-add-edit>
  </basic-container>
</template>

<script>
import { mapGetters } from 'vuex';
import website from '@/config/website';
import { getToken } from '@/util/auth';
import carclassAddEdit from './carclass-add-edit.vue';
import { getCartypeList, detailsCartype, removeCartype } from '@/api/parking/carclass.js';
import { getDictCode } from '@/api/iot/teacher.js'

export default {
  components: { carclassAddEdit },
  data() {
    return {
      loading: false,
      tableData: [],
      carTypeDic: []
    };
  },
  activated() {
    this.onLoad();
    getDictCode({ keys: 'carBasicType' }).then(r => {
      let arr = r.data.data.carBasicType.map(v => ({value: v.key * 1,label: v.value}))
      this.carTypeDic = arr;
    });
  },
  methods: {
    handleAdd() {
      this.$refs.carclassAddEditRef.openDialog('add');
    },
    handleEdit() {
      if (this.ids.length != 1) {
        this.$message.warning('请选择一条数据');
        return;
      }
      detailsCartype({ id: this.ids[0] }).then(r => {
        if (r.data.code == 200) {
          let form = r.data.data;
          this.$refs.carclassAddEditRef.openDialog('edit', form);
        }
      });
    },
    handleDelete() {
      if (this.ids.length === 0) {
        this.$message.error('请选择一条数据');
        return;
      }
      this.$confirm('确定要删除选择的数据？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return removeCartype({ ids: this.ids });
      }).then(res => {
        if (res.data.code == 200) {
          this.$message.success(res.data.msg);
          this.onLoad();
        }
      });
    },
    handleExport() {
      this.$confirm('是否导出车类管理?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.open(`/api/iot-car/cartype/list/export?${this.website.tokenHeader}=${getToken()}&ids=${this.ids.join(',')}`);
      });
    },
    onLoad() {
      getCartypeList().then(r => {
        this.tableData = r.data.data || [];
      });
    }
  },
  computed: {
    ...mapGetters(['permission', 'btnicon', 'colorName']),
    ids() {
      let ids = [];
      let list = this.$refs.xGrid.getCheckboxRecords();
      list.forEach(ele => {
        ids.push(ele.id);
      });
      return ids;
    },
    tableHeight() {
      return window.innerHeight - 187 - 165;
    },
    tableColumn() {
      return [
        { type: 'checkbox', width: 70, fixed: 'left' },
        { type: 'seq', title: '序号', width: 70, fixed: 'left' },
        {
          title: '车类名称',
          field: 'typeName',
          sortable: true,
          minWidth: 100
        },
        {
          title: '基础类型',
          field: 'categoryStr',
          sortable: true,
          minWidth: 100
        },
        {
          title: '重复入场',
          field: 'allowRepeatIn',
          sortable: true,
          minWidth: 100,
          slots: { default: 'allowRepeatIn' }
        },
        {
          title: '重复出场',
          field: 'allowRepeatOut',
          sortable: true,
          minWidth: 100,
          slots: { default: 'allowRepeatOut' }
        },
        {
          title: '入场确认',
          field: 'inConfirm',
          sortable: true,
          minWidth: 100,
          slots: { default: 'inConfirm' }
        },
        {
          title: '出场确认',
          field: 'outConfirm',
          sortable: true,
          minWidth: 100,
          slots: { default: 'outConfirm' }
        },
        {
          title: '满位可进',
          field: 'allowFullIn',
          sortable: true,
          minWidth: 100,
          slots: { default: 'allowFullIn' }
        },
        {
          title: '进出修改车位',
          field: 'inOutUpdateCarNum',
          sortable: true,
          minWidth: 110,
          slots: { default: 'inOutUpdateCarNum' }
        },
        {
          title: '开启模糊识别',
          field: 'likeMatch',
          sortable: true,
          minWidth: 110,
          slots: { default: 'likeMatch' }
        },
        {
          title: '月租金额',
          field: 'payMoneyMonth',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            return cellValue < 0 ? '' : cellValue;
          }
        },
        {
          title: '过期延期天数',
          field: 'expirePostponeDays',
          sortable: true,
          minWidth: 100,
          formatter: ({ cellValue }) => {
            return cellValue < 0 ? '' : cellValue;
          }
        }
      ];
    }
  }
};
</script>

<style scoped>
.tipcls {
  font-size: 13px;
  line-height: 10px;
  background: #f5f6f7;
  padding: 20px;
  margin-top: 5px;
  color: #666;
  margin-bottom: 15px;
}
.tipcls > p ~ p {
  margin-left: 24px;
}
</style>
