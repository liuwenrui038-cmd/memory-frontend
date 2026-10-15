
<script setup>
import {ref,onMounted} from 'vue'
import request from './api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const title = ref('Memory')
const memories= ref([])
const showForm=ref(false)
const form = ref(createEmptyForm())
const isEdit = ref(false)

async function loadMemories(){
        const m=await request.get('/memories')
        memories.value=m.data
}
onMounted(()=>{
    loadMemories()
})
function handleAdd() {
    resetForm()
    isEdit.value = false
    showForm.value=true
}

function createEmptyForm() {
    return {
        title: '',
        feeling: '',
        type: '',
        favorite: false,
        discoverDate: '',
        tags: []
    }
}
function resetForm() {
    form.value = createEmptyForm()
}

async function handleSubmit() {
    if (!form.value.title.trim()) {
        ElMessage.warning('请输入记录标题')
        return
    }

    if (!form.value.type) {
        ElMessage.warning('请选择记录类型')
        return
    }

    try {
        if (isEdit.value) {
            await request.put(`/memories/${form.value.id}`, form.value)
        } else {
            await request.post('/memories', form.value)
        }
        await loadMemories()

        ElMessage.success('记录添加成功')
        resetForm()
        showForm.value = false
    } catch (error) {
        console.error('新增记录失败：', error)
        ElMessage.error('保存失败，请检查后端服务或输入内容')
    }
}

function handleCancel() {
    resetForm()
    showForm.value = false
}


async function handleDelete(row) {
    try {
        await ElMessageBox.confirm(
            `确定删除「${row.title}」吗？删除后无法恢复。`,
            '删除记录',
            {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )

        await request.delete(`/memories/${row.id}`)
        await loadMemories()

        ElMessage.success('删除成功')
    } catch (error) {
        // 用户取消确认时，不执行删除
        if (error === 'cancel' || error === 'close') {
            return
        }

        console.error('删除记录失败：', error)
        ElMessage.error('删除失败，请检查后端服务')
    }
}

function handleEdit(row) {
    isEdit.value = true

    form.value = {
        id: row.id,
        title: row.title ?? '',
        feeling: row.feeling ?? '',
        type: row.type ?? '',
        favorite: row.favorite ?? false,
        discoverDate: row.discoverDate ?? '',
        tags: row.tags ?? []
    }

    showForm.value = true
}

</script>

<template>
    <div class="page">
        <div class="header">
            <h1>{{title}}</h1>
            <p>记录值得再次回味的事物。</p>
        </div>    

        <div class="toolbar">
            <h2>我的收藏</h2>
            <el-button type="primary"@click="handleAdd">＋ 新增记录</el-button>
        </div>

        <el-dialog 
            v-model="showForm"
            title="新增记录"
            width="500px"
        >
            
            
        <el-form label-position="top" class="memory-form">
            <el-form-item label="标题" required>
                <el-input
                    v-model="form.title"
                    placeholder="请输入标题"
                    clearable
                />
            </el-form-item>

            <el-form-item label="类型" required>
                <el-select
                    v-model="form.type"
                    placeholder="请选择类型"
                    style="width: 100%"
                >
                    <el-option label="书籍" value="BOOK" />
                    <el-option label="电影" value="MOVIE" />
                    <el-option label="音乐" value="MUSIC" />
                    <el-option label="文章" value="ARTICLE" />
                    <el-option label="辩论" value="DEBATE" />
                </el-select>
            </el-form-item>

            <el-form-item label="发现日期">
                <el-date-picker
                    v-model="form.discoverDate"
                    type="date"
                    placeholder="请选择发现日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                />
            </el-form-item>

            <el-form-item label="喜欢这条记录吗？">
                <el-switch v-model="form.favorite" />
            </el-form-item>

            <el-form-item label="感受与想法">
                <el-input
                    v-model="form.feeling"
                    type="textarea"
                    :rows="4"
                    placeholder="记录值得再次回味的原因……"
                    maxlength="1000"
                    show-word-limit
                />
            </el-form-item>
            </el-form>


            <template #footer>
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>

            <el-table :data="memories">
                <el-table-column prop="title" label="标题"/>
                <el-table-column prop="type" label="类型"/>
                <el-table-column label="喜欢">
                    <template #default="scope">
                        {{scope.row.favorite==true?'喜欢':'不喜欢'}}
                    </template>
                </el-table-column>
                <el-table-column prop="discoverDate" label="发现日期"/>
                <el-table-column prop="feeling" label="感受"/>
                
                <el-table-column label="操作" width="160" fixed="right">
                    <template #default="scope">
                        <el-button
                            size="small"
                            @click="handleEdit(scope.row)">编辑
                        </el-button>

                        <el-button
                            size="small"
                            type="danger"
                            @click="handleDelete(scope.row)"
                            >
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
    </div> 
</template>

<style>
.page{
    max-width:2000px;
    margin: 0 auto;
    padding: 24px;
}
.header{
    margin-bottom:20px;
}
.toolbar{
    display: flex; /* 让子元素可以横向排列 */
    align-items:center;/*让子元素垂直方向对齐 */
    justify-content:space-between;/*把子元素分别推到左右两侧*/
    gap:20px;/*设置子元素之间的间距*/
    margin-bottom:20px;
}

.memory-form {
    padding: 8px 4px 0;
}

.memory-form :deep(.el-form-item) {
    margin-bottom: 20px;
}

.memory-form :deep(.el-form-item__label) {
    font-weight: 500;
    color: #374151;
}

.memory-form :deep(.el-textarea__inner) {
    line-height: 1.7;
}

:deep(.el-dialog) {
    border-radius: 12px;
}

:deep(.el-dialog__title) {
    font-size: 20px;
    font-weight: 600;
}

</style>