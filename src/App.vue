
<script setup>
import {ref,onMounted} from 'vue'
import request from './api/request'


const title = ref('Memory')
const memories= ref([])
async function loadMemories(){
        const m=await request.get('/memories')
        memories.value=m.data
}
onMounted(()=>{
    loadMemories()
})


</script>

<template>
    <h1>{{title}}</h1>
    <p>记录值得再次回味的事物。</p>
    
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
    </el-table>
</template>
