<template>
    <el-dialog class="timestep_page" title="时段策略" append-to-body top="3vh" :visible.sync="dialogVisible" :close-on-click-modal="false" width="1000px">
        <el-row :gutter="10">
            <el-col :span="10">
                <div class="divBox" :style="{height:boxHeight+'px'}">
                    <div style="margin-bottom: 8px;">
                        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添加</el-button>
                        <el-button type="danger" size="small" icon="el-icon-delete" @click="handleRemove">删除</el-button>
                    </div>
                    <vxe-table
                        border
                        stripe
                        auto-resize
                        resizable
                        size="mini"
                        highlight-hover-row
                        align="center"
                        :height="boxHeight-60"
                        :data="leftTableData"
                        @cell-click="leftTableClick"
                        @checkbox-change="leftcheckboxChangeEvent"
                        @checkbox-all="leftcheckboxChangeEvent">
                        <vxe-column type="checkbox" width="60"></vxe-column>
                        <vxe-column type="expand" width="60">
                            <template #content="{ row, rowIndex }">
                                <div style="padding: 15px;">
                                    <span style="margin-right: 15px;color: #909399;">链接时段</span>
                                    <span
                                        v-for="(item,index) in row.nextTimestepNamesArr" :key="index"
                                        :style="{color:item.color}"
                                        style="margin-right: 6px;">{{ item.name }}</span>
                                </div>
                            </template>
                        </vxe-column>
                        <vxe-column title="时段号" field="timestepSeq" width="100"></vxe-column>
                        <vxe-column title="时段名称" field="timestepName"></vxe-column>
                    </vxe-table>
                </div>
            </el-col>

            <el-col :span="14">
                <div class="divBox" :style="{height:boxHeight+'px'}">
                    <avue-form ref="avueform" :option="formOption" v-model="form" @submit="submit">
                        <template slot="endDateLabel">
                            <span> - </span>
                        </template>

                        <template slot="timestep">
                            <ul>
                                <li v-for="item in 3" :key="'timestep'+item">
                                    <span>时区{{ item }}</span>
                                    <el-time-select
                                        v-model="form['start'+item]"
                                        :picker-options="{ start: '00:00', step:'00:01', end:'23:59' }"
                                        :placeholder="'开始时区'+item"
                                        style="width: 120px !important;margin: 0 8px;">
                                    </el-time-select>
                                    <span> - </span>
                                    <el-time-select
                                        v-model="form['end'+item]"
                                        :picker-options="{ start: '00:00', step:'00:01', end:'23:59' }"
                                        :placeholder="'结束时区'+item"
                                        style="width: 120px !important;margin: 0 8px;">
                                    </el-time-select>
                                </li>
                            </ul>
                        </template>
                    </avue-form>
                </div>
            </el-col>
        </el-row>
    </el-dialog>
</template>

<script>
import { sendTimestep,reqTimestepList,removeTimestep } from '@/api/iot/access/ic';

export default {
    data() {
        return {
            dialogVisible: false,
            leftTableData: [],
            form:{},
            timestepSeqDicAll:[],
            timestepSeqDic:[],
            btnType:'add',
            nextTimestepSeqDic:[],
            selectionList:[]
        };
    },
    mounted() {
        let arr = [];
        for(let i = 2;i <= 255;i++){
            arr.push({value:i,label:i})
        }
        this.timestepSeqDicAll = arr;
    },
    methods: {
        openDialog(){
            this.dialogVisible = true;
            this.initData();
            this.btnType = "add";
            this.form = {
                start1:'00:00',end1:'00:00',
                start2:'00:00',end2:'00:00',
                start3:'00:00',end3:'00:00',
            }
        },
        submit(form,done){
            if(!form.endDate || !form.startDate){
                this.$message.warning('请填写完整的有效期！');
                return done();
            }
            if(!form.end1 || !form.start1){
                this.$message.warning('请填写完整的时区1！');
                return done();
            }
            if(!form.end2 || !form.start2){
                this.$message.warning('请填写完整的时区2！');
                return done();
            }
            if(!form.end3 || !form.start3){
                this.$message.warning('请填写完整的时区3！');
                return done();
            }
            let {
                timestepSeq,nextTimestepSeq=0,
                timestepName,
                start1,end1,
                start2,end2,
                start3,end3,
                startDate,endDate
            } = form;
            nextTimestepSeq = nextTimestepSeq ? nextTimestepSeq : 0;
            let timestep1 = start1 ? start1+'#'+end1 : '',
                timestep2 = start2 ? start2+'#'+end2 : '',
                timestep3 = start3 ? start3+'#'+end3 : '';
            let obj = {timestepSeq,nextTimestepSeq,timestepName,startDate,endDate,timestep1,timestep2,timestep3};

            let arr = [...form.weeks];
            let weekArr = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
            weekArr.forEach(v => {
                obj[v] = arr.some(item => item === v) ? 1 : 0;
            })
            if(this.btnType === 'edit'){
                obj.id = form.id;
            }
            sendTimestep(obj).then(r => {
                if(r.data.code === 200){
                    this.$message.success(r.data.msg);
                    this.initData();
                }else{
                    this.$message.error(r.data.msg)
                }
                done();
            }).catch(() => done())
        },
        handleAdd(){
            this.btnType = "add";
            this.$refs.avueform.resetForm();
            this.$refs.avueform.clearValidate();
            this.$nextTick(() => {
                this.form = {
                    start1:'00:00',end1:'00:00',
                    start2:'00:00',end2:'00:00',
                    start3:'00:00',end3:'00:00',
                }
            })
        },
        handleRemove(){
            if(this.selectionList.length === 0) return this.$message.warning("请选择至少一条数据");
            this.$confirm('确定将选择数据删除?', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                return removeTimestep({timestepIds:this.ids});
            }).then(r => {
                if(r.data.code === 200){
                    this.$message.success(r.data.msg);
                    this.initData();
                    this.handleAdd();
                }else{
                    this.$message.error(r.data.msg);
                }
            });
        },
        leftTableClick({ row }){
            let arr3 = this.leftTableData.filter(v => v.timestepSeq != timestepSeq);
            this.nextTimestepSeqDic = arr3.map(v => ({value:v.timestepSeq,label:`【${v.timestepSeq}】${v.timestepName}`}));

            let timestep1 = row.timestep1 ? row.timestep1.split('#') : [],
                timestep2 = row.timestep2 ? row.timestep2.split('#') : [],
                timestep3 = row.timestep3 ? row.timestep3.split('#') : [];

            let start1 = timestep1.length ? timestep1[0] : '',
                end1 = timestep1.length ? timestep1[1] : '',
                start2 = timestep2.length ? timestep2[0] : '',
                end2 = timestep2.length ? timestep2[1] : '',
                start3 = timestep3.length ? timestep3[0] : '',
                end3 = timestep3.length ? timestep3[1] : '';
            let arr = [];
            if(row.monday == 1) arr.push('monday');
            if(row.tuesday == 1) arr.push('tuesday');
            if(row.wednesday == 1) arr.push('wednesday');
            if(row.thursday == 1) arr.push('thursday');
            if(row.friday == 1) arr.push('friday');
            if(row.saturday == 1) arr.push('saturday');
            if(row.sunday == 1) arr.push('sunday');
            let {timestepSeq,timestepName,nextTimestepSeq,id,startDate,endDate} = row;
            nextTimestepSeq = nextTimestepSeq == 0 ? '' : nextTimestepSeq;
            this.form = {timestepSeq,timestepName,nextTimestepSeq,id,startDate,endDate,weeks:arr,start1,start2,start3,end1,end2,end3};
            this.btnType = 'edit';
        },
        leftcheckboxChangeEvent({ records }){
            this.selectionList = records;
        },
        initData(){
            reqTimestepList().then(r => {
                if(r.data.code === 200){
                    let d = r.data.data;
                    d.forEach(v => {
                        let seqArr = v.nextTimestepNames ? v.nextTimestepNames.split(',') : [];
                        v.nextTimestepNamesArr = seqArr.map((item,i,arr) => {
                            return{
                                color:arr.filter(j => j === item).length > 1 ? 'red' : '#606266',
                                name:item
                            }
                        })
                    })
                    this.leftTableData = d;
                    let arr = [...this.timestepSeqDicAll];
                    let arr2 = arr.filter(v => !d.some(item => item.timestepSeq == v.value));
                    this.timestepSeqDic = arr2;
                    let arr3 = d.map(v => ({value:v.timestepSeq,label:`【${v.timestepSeq}】${v.timestepName}`}));
                    this.nextTimestepSeqDic = arr3;
                }
            })
        }
    },
    computed: {
        ids(){
            let ids = this.selectionList.map(v => v.id);
            return ids
        },
        boxHeight(){
            return window.innerHeight - 145
        },
        formOption(){
            return{
                submitText: '保存',
                emptyBtn: false,
                column: [
                    {
                        label:'时段号',
                        prop:'timestepSeq',
                        type:'select',
                        dicData:this.timestepSeqDic,
                        rules: [{
                            required: true,
                            message: "请选择时段号",
                            trigger: "blur"
                        }],
                        span:12,
                    },
                    {
                        label:'时段名称',
                        prop:'timestepName',
                        rules: [{
                            required: true,
                            message: "请输入时段名称",
                            trigger: "blur"
                        }],
                        span:12,
                    },
                    {
                        label:'有效期',
                        prop:'startDate',
                        type:'date',
                        format:'yyyy-MM-dd',
                        valueFormat:'yyyy-MM-dd',
                        rules: [{
                            required: false,
                            message: "请选择开始有效期",
                            trigger: "blur"
                        }],
                        span:12,
                    },
                    {
                        label:"",
                        labelWidth:20,
                        labelslot:true,
                        prop:"endDate",
                        type:'date',
                        format:'yyyy-MM-dd',
                        valueFormat:'yyyy-MM-dd',
                        rules: [{
                            required: false,
                            message: "请选择结束有效期",
                            trigger: "blur"
                        }],
                        span:12,
                    },
                    {
                        label:'链接时段',
                        prop:'nextTimestepSeq',
                        type:'select',
                        dicData:this.nextTimestepSeqDic,
                        span:12,
                    },
                    {
                        label:"有效星期",
                        prop:"weeks",
                        type:'checkbox',
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
                    },
                    {
                        label:"有效时区",
                        prop:"timestep",
                        formslot:true,
                        span:24
                    }
                ]
            }
        }
    }
};
</script>

<style scoped="scoped" lang="scss">
.timestep_page{
    /deep/.el-dialog__body {
        background-color: #e6e6e6;
        padding: 10px;
    }
    /deep/.el-checkbox {
        margin-bottom: 10px;
    }
    .divBox{
        background-color: #fff;padding: 10px;overflow: auto;
    }
    ul,li{
        list-style: none;margin: 0;padding: 0;
    }
    li{
        margin-bottom: 10px;
        span{font-size: 12px;}
    }
}
</style>
