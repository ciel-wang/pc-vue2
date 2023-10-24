<template>
  <el-row>
    <el-col>
      <p style="font-size: 16px;">
        <span style="font-weight: 600;">设备名称：</span>
        <span class="wm">鑫汇大厦1号刷卡机</span>
        <span style="font-weight: 600;margin-left: 20px;">设备序列号：</span>
        <span class="wm">84E0F4238A6C503A</span>
        <span style="font-weight: 600;margin-left: 20px;">门区名称：</span>
        xxxxx xxxxx xxxxx xxxxx
      </p>
      <p style="font-size: 16px;">
        <span style="font-weight: 600;">设备名称：</span>
        <span class="wm">鑫汇大厦1号人脸机</span>
        <span style="font-weight: 600;margin-left: 20px;">设备序列号：</span>
        <span class="wm">84E0F4238A6C503A</span>
        <span style="font-weight: 600;margin-left: 20px;">门区名称：</span>
        xxxxx xxxxx xxxxx xxxxx
      </p>
      <p style="font-size: 16px;">
        <span style="font-weight: 600;">设备名称：</span>
        <span class="wm">鑫汇大厦1号刷卡机</span>
        <span style="font-weight: 600;margin-left: 20px;">设备序列号：</span>
        <span class="wm">233126535</span>
        <span style="font-weight: 600;margin-left: 20px;">门区名称：</span>
        xxxxx xxxxx xxxxx xxxxx
      </p>
    </el-col>
    <!-- <avue-crud :data="devData" :option="option"  @on-load="onLoad"></avue-crud> -->
  </el-row>
</template>

<script>
export default {
  name: 'schema-child',
  props: ['row'],
  created() {
    console.log(this.row, this.option, '++++++++++++++++++++++++++');
  },
  data() {
    return {
      form: '',
      devData: [],
      loading: false
    };
  },
  methods: {
    onLoad() {
      this.devData.push({ devSn: 'xx', devName: 'vvv', doorName: 'vvvvv' });
    }
  },
  computed: {
    option() {
      return {
        calcHeight: 80,
        tip: false,
        searchShow: false,
        searchMenuSpan: 6,
        border: true,
        refreshBtn: false,
        filterMultiple: false,
        columnBtn: false,
        index: true,
        selection: false,
        addBtn: false,
        editBtn: false,
        menu: false,
        viewBtn: false,
        delBtn: false,
        multiple: false,
        dialogClickModal: false,
        column: [
          {
            label: '设备名称',
            prop: 'devName',
            align: 'center',
            display: true
          },
          {
            label: '设备序列化',
            prop: 'devSn',
            align: 'center',
            display: true
          },
          {
            label: '门区名称',
            prop: 'doorName',
            align: 'center',
            display: true
          }
        ]
      };
    }
  }
};
</script>

<style>
.wm {
  width: 150px;
  display: inline-block;
}
</style>
