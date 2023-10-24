<template>
  <el-dialog :title="btnType === 'authDev' ? '关联权限设备' : '关联考勤设备'" append-to-body :visible.sync="isVisible" top="8vh" width="728px">
    <el-tabs type="border-card">
      <el-tab-pane label="设备权限(门禁)" v-if="permission.dept_syncmjdev_btn && btnType === 'authDev'">
        <el-tree :style="{ height: tableHeight + 'px', overflow: 'auto' }" :data="mjDevTreeDic" show-checkbox node-key="value" ref="mjDevTreeRef"></el-tree>
      </el-tab-pane>
      <el-tab-pane label="设备权限(消费)" v-if="permission.dept_syncxfdev_btn && btnType === 'authDev'">
        <el-tree :style="{ height: tableHeight + 'px', overflow: 'auto' }" :data="xfDevTreeDic" show-checkbox node-key="valueStr" ref="xfDevTreeRef"></el-tree>
      </el-tab-pane>
      <el-tab-pane label="设备权限(考勤)" v-if="permission.dept_synckqdev_btn && btnType === 'kqDev'">
        <el-tree :style="{ height: tableHeight + 'px', overflow: 'auto' }" :data="kqDevTreeDic" show-checkbox node-key="value" ref="kqDevTreeRef"></el-tree>
      </el-tab-pane>
    </el-tabs>

    <span slot="footer" class="dialog-footer">
      <el-button
        type="danger" size="small" icon="el-icon-delete"
        @click="submit('del')"
        :disabled="btnDisabled">{{ btnType === 'authDev' ? '删除权限' : '删除关联' }}</el-button>
      <el-button
        type="primary" size="small" icon="el-icon-check"
        @click="submit('add')"
        :disabled="btnDisabled">{{ btnType === 'authDev' ? '增加权限' : '关联设备' }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { getAreaAllEquipmentTree } from '@/api/iot/access/icauth';
import { sellerDevZtreeData } from '@/api/xf/seller';
import { sendDeptSnycDev } from '@/api/iot/dept.js';

export default {
  data() {
    return {
      isVisible: false,
      mjDevTreeDic: [],
      xfDevTreeDic: [],
      entityIds: [],
      btnDisabled: false,
      kqDevTreeDic: [],
      btnType: 'authDev',
      entityType:'',
    };
  },
  mounted() {
    sellerDevZtreeData().then(res => {
      this.xfDevTreeDic = res.data.data;
    });
    getAreaAllEquipmentTree().then(res => {
      let arr = [...res.data.data];
      this.transData(arr);
      this.mjDevTreeDic = arr;
      this.kqDevTreeDic = res.data.data;
    });
  },
  methods: {
    transData(arr) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].children && arr[i].children.length) {
          this.transData(arr[i].children);
        } else {
          let arr2 = arr[i].valueStr.split('-');
          if (arr[i].valueStr.startsWith('E') && arr2[1].startsWith('D')) {
            arr.splice(i, 1);
            i--;
          }
        }
      }
    },
    openDialog(btnType = 'authDev', type = '', entityIds) {
      this.btnType = btnType;
      this.entityIds = entityIds.split(',');
      this.entityType = type === 'dept' ? 1 : 2;
      this.btnDisabled = false;
      this.isVisible = true;
      this.$nextTick(() => {
        if (btnType === 'authDev') {
          this.$refs.xfDevTreeRef.setCheckedKeys([]);
          this.$refs.mjDevTreeRef.setCheckedKeys([]);
        } else {
          this.$refs.kqDevTreeRef.setCheckedKeys([]);
        }
      });
    },
    submit(type) {
      this.btnDisabled = true;
      if (this.btnType === 'authDev') {
        let xfArr = this.$refs.xfDevTreeRef.getCheckedNodes().filter(v => v.valueStr.startsWith('D'));
        let xfdevIds = xfArr.map(v => v.value);

        let mjArr = this.$refs.mjDevTreeRef.getCheckedNodes().filter(v => {
          let arr = v.valueStr.split('-');
          return (arr[0] == 'E' && (arr[2] == 1 || arr[2] == 7 || arr[2] == 8)) || arr[0] == 'D' ;
        });
        let mjdevIds = mjArr.map(v => v.value);
        let devIds = [...xfdevIds, ...mjdevIds];

        let oprtType = type === 'add' ? 1 : 0;
        sendDeptSnycDev({ entityIds: this.entityIds,entityType:this.entityType, devIds, oprtType }).then(r => {
          this.btnDisabled = false;
          if (r.data.code === 200) {
            this.$message.success(r.data.msg);
            this.isVisible = false;
          } else {
            this.$message.error(r.data.msg);
          }
        }).catch(() => (this.btnDisabled = false));
      } else {
        let kqArr = this.$refs.kqDevTreeRef.getCheckedNodes();
        let devIds = kqArr.map(v => v.value);
        let oprtType = type === 'add' ? 1 : 0;
        sendDeptSnycKqDev({ entityIds: this.entityIds,entityType:this.entityType, devIds, oprtType }).then(r => {
          this.btnDisabled = false;
          if (r.data.code === 200) {
            this.$message.success(r.data.msg);
            this.isVisible = false;
          } else {
            this.$message.error(r.data.msg);
          }
        }).catch(() => (this.btnDisabled = false));
      }
    }
  },
  computed: {
    ...mapGetters(['permission']),
    tableHeight() {
      return window.innerHeight - 360;
    }
  }
};
</script>
