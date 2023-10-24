<template>
    <el-dialog class="timestep_page" title="定时任务" append-to-body top="6vh" :visible.sync="dialogVisible" :close-on-click-modal="false" width="1000px">
        <avue-form ref="avueform" :option="formOption" v-model="form">
            <template slot="menuForm">
                <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添加</el-button>
                <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDel">删除</el-button>
            </template>

            <template slot="actionTime">
                <el-time-select
                    v-model="form.actionTime"
                    :picker-options="{ start: '00:00', step: '00:05', end: '23:55' }"
                    placeholder="选择动作时间">
                </el-time-select>
            </template>
        </avue-form>

        <vxe-table
            border
            stripe
            auto-resize
            resizable
            size="mini"
            highlight-hover-row
            align="center"
            :height="240"
            :data="tableData"
            @checkbox-change="checkboxChangeEvent"
            @checkbox-all="checkboxChangeEvent">
            <vxe-column type="checkbox" width="40"></vxe-column>
            <vxe-column title="任务编号" type="seq" width="70"></vxe-column>
            <vxe-column title="起始日期" field="startDate" min-width="86"></vxe-column>
            <vxe-column title="截止日期" field="endDate" min-width="86"></vxe-column>
            <vxe-column title="动作时间" field="actionTime" min-width="70"></vxe-column>
            <vxe-column title="星期一" field="monday" min-width="60">
                <template #default="{row}">
                    <i class="icon-xuanzhong" v-if="row.monday" :style="{color: colorName}"></i>
                    <i class="icon-weixuanzhong" v-else></i>
                </template>
            </vxe-column>
            <vxe-column title="星期二" field="tuesday" min-width="60">
                <template #default="{row}">
                    <i class="icon-xuanzhong" v-if="row.tuesday" :style="{color: colorName}"></i>
                    <i class="icon-weixuanzhong" v-else></i>
                </template>
            </vxe-column>
            <vxe-column title="星期三" field="wednesday" min-width="60">
                <template #default="{row}">
                    <i class="icon-xuanzhong" v-if="row.wednesday" :style="{color: colorName}"></i>
                    <i class="icon-weixuanzhong" v-else></i>
                </template>
            </vxe-column>
            <vxe-column title="星期四" field="thursday" min-width="60">
                <template #default="{row}">
                    <i class="icon-xuanzhong" v-if="row.thursday" :style="{color: colorName}"></i>
                    <i class="icon-weixuanzhong" v-else></i>
                </template>
            </vxe-column>
            <vxe-column title="星期五" field="friday" min-width="60">
                <template #default="{row}">
                    <i class="icon-xuanzhong" v-if="row.friday" :style="{color: colorName}"></i>
                    <i class="icon-weixuanzhong" v-else></i>
                </template>
            </vxe-column>
            <vxe-column title="星期六" field="saturday" min-width="60">
                <template #default="{row}">
                    <i class="icon-xuanzhong" v-if="row.saturday" :style="{color: colorName}"></i>
                    <i class="icon-weixuanzhong" v-else></i>
                </template>
            </vxe-column>
            <vxe-column title="星期日" field="sunday" min-width="60">
                <template #default="{row}">
                    <i class="icon-xuanzhong" v-if="row.sunday" :style="{color: colorName}"></i>
                    <i class="icon-weixuanzhong" v-else></i>
                </template>
            </vxe-column>
            <vxe-column title="适用于门" field="doorNums" min-width="80">
                <template #default="{row}">
                    <el-tag size="mini" v-for="item in row.doorNames" :key="item.value" style="margin-right: 4px;">{{ item.label }}</el-tag>
                </template>
            </vxe-column>
            <vxe-column title="控制方式" field="ctrlMode" min-width="70">
                <template #default="{row}">
                    <el-tag size="mini" effect="dark" type="success" v-if="row.ctrlMode == 0">自动</el-tag>
                    <el-tag size="mini" effect="dark" type="warning" v-if="row.ctrlMode == 1">常开</el-tag>
                    <el-tag size="mini" effect="dark" type="danger" v-if="row.ctrlMode == 2">常闭</el-tag>
                </template>
            </vxe-column>
        </vxe-table>

        <template slot="footer">
            <el-button type="primary" icon="el-icon-check" @click="submit">下载任务</el-button>
            <el-button plain icon="el-icon-close" @click="handleClose">取消</el-button>
        </template>
    </el-dialog>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { addEditTimedTask, removeTimedTask, downloadTimedTask, reqTimedTaskList, reqIcDoorDic } from '@/api/iot/access/ic';

    export default{
        data(){
            return{
                dialogVisible:false,
                form:{},
                tableData:[],
                selectionList:[],
                btnType:"add",
                doorDic:[],
                devId:""
            }
        },
        methods:{
            async openDialog( devId ){
                this.dialogVisible = true;
                this.selectionList = [];
                this.devId = devId;
                await reqIcDoorDic({ devId }).then(r => {
                    if(r.data.code === 200){
                        let arr = r.data.data.map(v => ({ value:v.doorNum,label:v.doorName }));
                        this.doorDic = arr;
                    }
                })
                this.onLoad();
            },
            onLoad(){
                reqTimedTaskList({ devId:this.devId }).then(r => {
                    let d = r.data.data;
                    d.forEach(obj => {
                        obj.doorNames = [];
                        let doorNums = obj.doorNums.split(',');
                        doorNums.forEach(v => {
                            let item = this.doorDic.find(item => item.value == v);
                            if(item && item.value) obj.doorNames.push(item);
                        });
                        let weekArr = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                        let weekAllow = obj.weekAllow.split(',');
                        weekAllow.forEach((v,i) => {
                            obj[weekArr[i]] = v*1;
                        })
                    })
                    this.tableData = d;
                })
            },
            submit(){
                downloadTimedTask({ devIds:[this.devId] }).then(r => {
                    if(r.data.code === 200){
                        this.$message.success(r.data.msg);
                        this.handleClose();
                    }else{
                        this.$message.error(r.data.msg);
                    }
                })
            },
            handleClose(){
                this.tableData = [];
                this.$refs.avueform.resetForm();
                this.$refs.avueform.clearValidate();
                this.dialogVisible = false;
            },
            handleAdd(){
                this.$refs.avueform.validate((valid,done,msg)=>{
                    if(valid){
                        let { startDate, endDate, actionTime, weekAllow, doorNums, ctrlMode } = this.form;
                        let form = { startDate, endDate, actionTime, doorNums:doorNums.join(','), ctrlMode };
                        let weekArr = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                        form.weekAllow = weekArr.map(v => weekAllow.some(i => v == i) ? 1 : 0).join(',');
                        form.devId = this.devId;
                        addEditTimedTask(form).then(r => {
                            done();
                            if(r.data.code === 200){
                                this.$message.success(r.data.msg);
                                this.onLoad();
                            }else{
                                this.$message.error(r.data.msg);
                            }
                        }).catch(() => done())
                    }
                })
            },
            handleDel(){
                if(this.selectionList.length === 0) return this.$message.warning("请选择至少一条数据");
                this.$confirm('确定将选择数据删除?', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let ids = this.selectionList.map(v => v.id);
                    return removeTimedTask({ ids });
                }).then(r => {
                    if(r.data.code === 200){
                        this.$message.success(r.data.msg);
                        this.onLoad();
                    }else{
                        this.$message.error(r.data.msg);
                    }
                });
            },
            checkboxChangeEvent({ records }){
                this.selectionList = records;
            }
        },
        computed:{
            ...mapGetters(["colorName"]),
            formOption(){
                return{
                    emptyBtn: false,
                    submitBtn: false,
                    menuPosition:'right',
                    column: [{
                        label:'起止日期',
                        prop:'startDate',
                        type:'date',
                        format:'yyyy-MM-dd',
                        valueFormat:'yyyy-MM-dd',
                        rules: [{
                            required: true,
                            message: "请选择起止日期",
                            trigger: "blur"
                        }],
                        span:8
                    },{
                        label:'截止日期',
                        prop:'endDate',
                        type:'date',
                        format:'yyyy-MM-dd',
                        valueFormat:'yyyy-MM-dd',
                        rules: [{
                            required: true,
                            message: "请选择截止日期",
                            trigger: "blur"
                        }],
                        span:8
                    },{
                        label:'动作时间',
                        prop:'actionTime',
                        rules: [{
                            required: true,
                            message: "请选择动作时间",
                            trigger: "blur"
                        }],
                        formslot:true,
                        span:8
                    },{
                        label:'适用于门',
                        prop:'doorNums',
                        type:'select',
                        multiple:true,
                        dicData:this.doorDic,
                        rules: [{
                            required: true,
                            message: "请选择门区",
                            trigger: "blur"
                        }],
                        span:8
                    },{
                        label:'控制方式',
                        prop:'ctrlMode',
                        type:'select',
                        dicData:[
                            {value:0,label:"自动"},
                            {value:1,label:"常开"},
                            {value:2,label:"常闭"},
                        ],
                        rules: [{
                            required: true,
                            message: "请选择控制方式",
                            trigger: "blur"
                        }],
                        span:8
                    },{
                        label:"有效星期",
                        prop:"weekAllow",
                        type:"checkbox",
                        dicData:[
                            {value:'monday',label:"星期一"},
                            {value:'tuesday',label:"星期二"},
                            {value:'wednesday',label:"星期三"},
                            {value:'thursday',label:"星期四"},
                            {value:'friday',label:"星期五"},
                            {value:'saturday',label:"星期六"},
                            {value:'sunday',label:"星期日"},
                        ],
                        rules: [{
                            required: true,
                            message: "请选择有效星期",
                            trigger: "blur"
                        }],
                        span:24,
                    }]
                }
            }
        }
    }
</script>

<style>
</style>
