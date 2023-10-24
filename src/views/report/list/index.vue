<template>
    <basic-container>
        <div class="mbottom8">
            <el-input
               size="small" clearable
               @keyup.enter.native="onLoad"
               v-model.trim="name"
               placeholder="请输入报表名称"
               style="width: 200px;margin-right: 10px;">
            </el-input>
            <el-button
               type="primary"
               size="small"
               icon="el-icon-search"
               @click="onLoad">
               搜索</el-button>
            <el-button
               type="default"
               size="small"
               icon="el-icon-refresh"
               @click="searchReset">
               重置</el-button>
            <el-button
                type="primary"
                size="small"
                icon="el-icon-upload2"
                @click="handleImport">导入</el-button>
            <el-button
                type="primary"
                size="small"
                icon="el-icon-download"
                @click="handleExport">导出</el-button>
            <el-button
                type="danger"
                size="small"
                icon="el-icon-delete"
                @click="handleDelete">删除</el-button>
        </div>
        <vxe-table
            border
            resizable
            ref="xTable"
            auto-resize
            highlight-hover-row
            show-overflow
            size="mini"
            :height="tableHeight"
            :loading="loading"
            align="center"
            :data="tableData"
            @checkbox-change="checkboxChangeEvent"
            @checkbox-all="checkboxChangeEvent">
            <vxe-table-column type="checkbox" width="70" fixed="left"></vxe-table-column>
            <vxe-table-column title="序号" type="seq" width="70" fixed="left"></vxe-table-column>
            <vxe-table-column title="报表名称" minWidth="140" field="name"></vxe-table-column>
            <vxe-table-column title="创建人" minWidth="140" field="createBy"></vxe-table-column>
            <vxe-table-column title="创建时间" minWidth="140" field="createTime"></vxe-table-column>
        </vxe-table>

        <import-info ref="importInfoRef" @refeshPage="onLoad"></import-info>
    </basic-container>
</template>

<script>
    import moment from 'moment';
    import website from '@/config/website';
    import { getToken } from '@/util/auth';
    import importInfo from '@/views/iot/components/teacher-import-info.vue'
    import { reqReportList, reportListRemove } from "@/api/interface/interface.js"

    export default{
        components:{ importInfo },
        data(){
            return{
                loading:false,
                tableData:[],
                selectionList:[],
                name:""
            }
        },
        activated() {
            this.onLoad()
        },
        methods:{
            handleDelete(){
                if(this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
                this.$confirm('确定要删除数据?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    return reportListRemove({reportIds:this.ids.split(',')})
                }).then(r => {
                    if(r.data.code === 200){
                        this.$message.success(r.data.msg);
                        this.onLoad();
                    }else{
                        this.$message.error(r.data.msg);
                    }
                });
            },
            handleImport(){
                this.$refs.importInfoRef.openDialog('report-list')
            },
            handleExport(){
                if(this.selectionList.length === 0) return this.$message.warning('请选择至少一条数据');
                this.$confirm('是否导出报表?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    window.open(`/api/iot-mreport/reportDownload?${this.website.tokenHeader}=${getToken()}&ids=${this.ids}`);
                });
            },
            searchReset(){
                this.name = "";
                this.onLoad();
            },
            onLoad(){
                this.loading = true;
                reqReportList({name:this.name}).then(r => {
                    this.loading = false;
                    r.data.data.forEach(v => {
                        v.createTime = moment(v.createTime).format('YYYY-MM-DD HH:mm:ss');
                    })
                    this.tableData = r.data.data;
                }).catch(() => this.loading = false)
            },
            checkboxChangeEvent({ records }){
                this.selectionList = records;
            },
        },
        computed:{
            ids() {
                let ids = this.selectionList.map(v => v.id);
                return ids.join(",");
            },
            tableHeight(){
                return window.innerHeight - 190;
            }
        }
    }
</script>
