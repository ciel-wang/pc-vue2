<template>
    <el-dialog
        title="详情"
        :visible.sync="dialogVisible"
        width="600px"
        append-to-body
        :modal-append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false">
        <el-collapse v-model="activeNames">
            <el-collapse-item name="1">
                <template slot="title">
                    <i class="header-icon el-icon-info marginR4"></i>当天属性
                </template>
                <div>
                    <span>假日属性：</span>
                    <span>{{dataObj.dayMode == 1 ? '工作日' : dataObj.dayMode == 2 ? "休息日" : '节假日'}}</span>
                </div>
                <div>
                    <p style="margin: 10px 0;">
                        <span>班&emsp;&emsp;次：</span>
                        <span class="colorRed" v-if="!dataObj.isPkg && dataObj.classesTimeName">
                            解析班次为【{{dataObj.classesTimeNum}}】{{dataObj.classesTimeName}}
                        </span>
                        <span v-else-if="dataObj.classesTimeName">【{{dataObj.classesTimeNum}}】{{dataObj.classesTimeName}}</span>
                        <span v-else>空班</span>
                    </p>
                    <div v-for="(item,index) in dataObj.classObj" :key="index">
                        <span class="ml64">{{item[0].classesTimeName}}</span>
                        <span v-for="(v,index1) in item" :key="index1">
                            <span class="marginL10">{{v.startWorkTime}}</span>
                            <span class="colorRed" v-show="v.earlyAcrossDay">+1</span> -
                            <span>{{v.endWorkTime}}</span>
                            <span class="colorRed" v-show="v.nightAcrossDay">+1</span>
                        </span>
                    </div>
                </div>
            </el-collapse-item>

            <el-collapse-item name="2">
                <template slot="title">
                    <i class="header-icon el-icon-info marginR4"></i>考勤记录
                </template>
                <div v-if="JSON.stringify(dataObj.kqMjDatas) == '{}'" style="text-align: center;color: #909399;">
                    <i class="iconfont icon-zanwushuju" style="font-size: 40px !important;"></i>
                    <div>暂时没有数据</div>
                </div>
                <div class="ml64" v-for="(item,index) in dataObj.kqMjDatas" :key="'dataObj'+index">
                    <div style="margin-bottom: 10px;">
                        <span>{{index}} | </span>
                        <span v-for="(v,i) in item" :key="'kqMjDatas'+i" class="marginL10" :class="[v.dataType == 5 ? 'colorRed' : '']">{{v.time}}</span>
                    </div>
                </div>
            </el-collapse-item>

            <el-collapse-item name="3">
                <template slot="title">
                    <i class="header-icon el-icon-info marginR4"></i>单据信息
                </template>
                <div v-if="dataObj.receipts.length === 0" style="text-align: center;color: #909399;">
                    <i class="iconfont icon-zanwushuju" style="font-size: 40px !important;"></i>
                    <div>暂时没有数据</div>
                </div>
                <div class="ml64" v-for="(item,index) in dataObj.receipts" :key="index">
                    <span v-if="item.receiptType != 4">{{item.roleName}} | </span>
                    <span v-if="item.receiptType == 1 || item.receiptType == 2">
                        {{item.startTime}} 至 {{item.endTime}}
                    </span>
                    <span v-if="item.receiptType == 3">
                        {{dataObj.dayDate}}【{{(item.minute/60).toFixed(2)}}H】
                    </span>
                </div>
            </el-collapse-item>
        </el-collapse>
    </el-dialog>
</template>

<script>
    export default{
        data(){
            return{
                dialogVisible:false,
                dataObj:{kqMjDatas:{},receipts:[]},
                activeNames:['1'],
            }
        },
        methods:{
            openDialog(dataObj = {kqMjDatas:{},receipts:[]}){
                this.dataObj = dataObj;
                this.dialogVisible = true;
            },
        }
    }
</script>

<style scoped>
    >>>.el-collapse{border-top: none;}
    >>>.el-collapse-item__header.is-active{border-bottom-color:#EBEEF5;margin-bottom: 10px;}
    >>>.el-collapse-item__wrap{border-bottom: none;}
    >>>.el-collapse-item__header{font-size: 14px;font-weight: 600;}
    >>>.el-collapse-item__content{padding-bottom: 10px;}
    .marginL10{margin-left: 10px;}
    .colorRed{color: red;}
    .ml64{margin-left: 64px;}
    .marginR4{margin-right: 4px;}
</style>
