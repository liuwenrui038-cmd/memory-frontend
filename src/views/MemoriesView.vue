
<script setup>
import { ref, onMounted, computed } from 'vue'
import request from '../api/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const title = ref('Memory')
const memories= ref([])
const showForm=ref(false)
const form = ref(createEmptyForm())
const isEdit = ref(false)

//它们分别保存搜索关键词、类型筛选、喜欢状态和日期排序方式。
const keyword = ref('')
const selectedType = ref('')
const selectedFavorite = ref('')
const sortOrder = ref('desc')

// 保存后端返回的所有标签
const tags = ref([])
// 当前选中的标签名称
const selectedTag = ref('')

const router = useRouter()

// 把后端的类型代码转换成中文
const getTypeName = (type) => {
  const typeNames = {
    BOOK: '书籍',
    MOVIE: '电影',
    MUSIC: '音乐',
    ARTICLE: '文章',
    DEBATE: '辩论',
    GAME: '游戏',
    PODCAST: '播客',
    VIDEO: '视频'
  }

  return typeNames[type] || '其他'
}

// 不同类别使用不同的封面符号
const getCoverSymbol = (type) => {
  const symbols = {
    BOOK: '❧',
    MOVIE: '✳',
    MUSIC: '♫',
    ARTICLE: '¶',
    DEBATE: '❝',
    GAME: '✧',
    PODCAST: '◖',
    VIDEO: '▷'
  }

  return symbols[type] || '✳'
}

// 点击卡片，跳转到作品详情页
const openDetail = (item) => {
  router.push(`/memories/${item.id}`)
}

// 从后端获取标签列表
async function loadTags() {
  try {
    const response = await request.get('/tags')
    tags.value = response.data
  } catch (error) {
    console.error('加载标签失败：', error)
    ElMessage.error('加载标签失败')
  }
}

const filteredMemories = computed(() => {
    let result = [...memories.value]
    console.log('原始记录数：', result.length)

    // 1. 按标题搜索
    if (keyword.value.trim()) {
        const key = keyword.value.trim().toLowerCase()

        result = result.filter(item =>
            (item.title || '').toLowerCase().includes(key)
        )
    }
    console.log('标题搜索后：', result.length)

    // 2. 按类型筛选
    if (selectedType.value) {
        result = result.filter(item =>
            item.type === selectedType.value
        )
    }
    console.log('类型筛选后：', result.length)

    // 3. 按喜欢状态筛选
    if (selectedFavorite.value !== '') {
        const favorite = selectedFavorite.value === 'true'

        result = result.filter(item =>
            item.favorite === favorite
        )
    }
    console.log('喜欢筛选后：', result.length)

    // 4. 按发现日期排序
    result.sort((a, b) => {
        const dateA = a.discoverDate || ''
        const dateB = b.discoverDate || ''

        return sortOrder.value === 'desc'
            ? dateB.localeCompare(dateA)
            : dateA.localeCompare(dateB)
    })

    if (selectedType.value) {
        result = result.filter(item => item.type === selectedType.value)
    }
    // 按标签名称筛选
    if (selectedTag.value) {
        result = result.filter(item =>
        Array.isArray(item.tags) &&
        item.tags.some(tag => tag.name === selectedTag.value)
    )
    }

    return result
})


async function loadMemories(){
        const m=await request.get('/memories')
        memories.value=m.data
}
onMounted(()=>{
    loadMemories()
    loadTags()
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
        coverUrl: '',
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

    const submitData = {
        ...form.value,
        tags: form.value.tags.map(tag =>
            typeof tag === 'string' ? { name: tag } : tag
        )
    }

    try {
        if (isEdit.value) {
            await request.put(`/memories/${form.value.id}`, submitData)
        } else {
            await request.post('/memories', submitData)
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
        tags: (row.tags || []).map(tag => tag.name)
    }

    showForm.value = true
}


async function handleAddTag() {
  try {
    const { value } = await ElMessageBox.prompt(
      '请输入新标签名称',
      '新增标签',
      {
        confirmButtonText: '创建',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：女性成长',
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return '标签名称不能为空'
          }
          return true
        }
      }
    )

    await request.post('/tags', {
      name: value.trim()
    })

    await loadTags()
    ElMessage.success('标签创建成功')
  } catch (error) {
    if (error === 'cancel' || error === 'close') return

    console.error('创建标签失败：', error)
    ElMessage.error(
      error.response?.data?.message || '创建标签失败，可能是名称重复'
    )
  }
}

async function handleRenameTag(tag) {
  try {
    const { value } = await ElMessageBox.prompt(
      '请输入新的标签名称',
      '重命名标签',
      {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputValue: tag.name,
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return '标签名称不能为空'
          }
          return true
        }
      }
    )

    const newName = value.trim()

    if (newName === tag.name) return

    await request.put(`/tags/${tag.id}`, {
      name: newName
    })

    // 如果当前筛选的是旧名称，也同步更新筛选条件
    if (selectedTag.value === tag.name) {
      selectedTag.value = newName
    }

    await loadTags()
    await loadMemories()
    ElMessage.success('标签重命名成功')
  } catch (error) {
    if (error === 'cancel' || error === 'close') return

    console.error('重命名标签失败：', error)
    ElMessage.error(
      error.response?.data?.message || '重命名失败，检查名称是否重复'
    )
  }
}

async function handleDeleteTag(tag) {
  try {
    await ElMessageBox.confirm(
      `确定删除标签「${tag.name}」吗？删除后，关联记录将不再带有这个标签。`,
      '删除标签',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await request.delete(`/tags/${tag.id}`)

    if (selectedTag.value === tag.name) {
      selectedTag.value = ''
    }

    await loadTags()
    await loadMemories()
    ElMessage.success('标签删除成功')
  } catch (error) {
    if (error === 'cancel' || error === 'close') return

    console.error('删除标签失败：', error)
    ElMessage.error('删除标签失败')
  }
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

        <div class="record-summary">
            <span>全部记录 <strong>{{ memories.length }}</strong> 条</span>
            <span>当前显示 <strong>{{ filteredMemories.length }}</strong> 条</span>
        </div>

        <div class="filters content-card">
            <el-input
                v-model="keyword"
                placeholder="搜索记录标题"
                clearable
                style="width: 220px"
            />

            <el-select
                v-model="selectedType"
                placeholder="全部类型"
                clearable
                style="width: 150px"
            >
                <el-option label="书籍" value="BOOK" />
                <el-option label="电影" value="MOVIE" />
                <el-option label="音乐" value="MUSIC" />
                <el-option label="文章" value="ARTICLE" />
                <el-option label="辩论" value="DEBATE" />
            </el-select>

            <el-select
                v-model="selectedFavorite"
                placeholder="全部状态"
                clearable
                style="width: 150px"
            >
                <el-option label="喜欢" value="true" />
                <el-option label="不喜欢" value="false" />
            </el-select>

            <el-select
                v-model="selectedTag"
                placeholder="按标签筛选"
                clearable
                style="width: 180px"
                >
                <el-option
                    v-for="tag in tags"
                    :key="tag.id"
                    :label="`${tag.name}（${tag.count}）`"
                    :value="tag.name"
                />
            </el-select>

            <el-select
                v-model="sortOrder"
                style="width: 170px"
            >
                <el-option label="发现日期：最新优先" value="desc" />
                <el-option label="发现日期：最早优先" value="asc" />
            </el-select>
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

            
            <el-form-item label="封面图片地址">
                <el-input
                    v-model="form.coverUrl"
                    placeholder="请输入图片 URL（可选）"
                    clearable
                />
                <p class="form-hint">
                    暂时可以留空，之后也能为作品补充封面。
                </p>
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

            <el-form-item label="标签">
                <el-select
                    v-model="form.tags"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="选择或输入标签"
                    style="width: 100%"
                >
                    <el-option
                    v-for="tag in tags"
                    :key="tag.id"
                    :label="tag.name"
                    :value="tag.name"
                    />
                </el-select>
            </el-form-item>

            <template #footer>
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>

        <div class="table-card">
            
            <div class="shelf-grid">
                <article
                    v-for="item in filteredMemories"
                    :key="item.id"
                    class="shelf-card"
                    @click="openDetail(item)"
                    >
                    <div class="cover" :class="`cover-${item.type}`">
                    <span class="cover-type">{{ getTypeName(item.type) }}</span>
                    <div class="cover-art">
                        <span class="cover-symbol">{{ getCoverSymbol(item.type) }}</span>
                    </div>
                    <div class="cover-title">{{ item.title }}</div>
                    <span class="cover-caption">A MEMORY TO KEEP</span>
                    </div>

                    <div class="shelf-card-info">
                    <h3>{{ item.title }}</h3>
                    <span class="type-label">{{ getTypeName(item.type) }}</span>
                    </div>
                </article>
            </div>

                <div v-if="filteredMemories.length === 0" class="empty-shelf">
                这里暂时空着，等待下一件值得收藏的作品。
                </div>

        </div>
    </div> 
</template>


<style scoped>
/* 页面整体 */
.page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  color: #354536;
}

/* 标题区 */
.header {
  margin-bottom: 28px;
}

.header h1 {
  margin: 0;
  color: #354b37;
  font-size: 30px;
  font-weight: 650;
  letter-spacing: -0.5px;
}

.header p {
  margin: 10px 0 0;
  color: #858d7e;
  font-size: 14px;
  line-height: 1.7;
}

/* 标题与新增按钮 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.toolbar h2 {
  margin: 0;
  color: #455b43;
  font-size: 19px;
  font-weight: 600;
}

/* 统计信息 */
.record-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
  color: #788373;
  font-size: 13px;
}

.record-summary strong {
  margin: 0 3px;
  color: #526b50;
  font-size: 16px;
}

/* 卡片统一样式 */
.content-card,
.tag-panel,
.table-card {
  margin-bottom: 22px;
  padding: 22px;
  border: 1px solid #e5e9df;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 3px 12px rgba(62, 82, 57, 0.035);
}

/* 筛选区域 */
.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* 输入框和选择框 */
.page :deep(.el-input__wrapper),
.page :deep(.el-select__wrapper) {
  border-radius: 9px;
  background: #fbfcf8;
  box-shadow: 0 0 0 1px #e1e7da inset;
}

.page :deep(.el-input__wrapper.is-focus),
.page :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #82977a inset;
}

/* 主按钮 */
.page :deep(.el-button--primary) {
  border-color: #607b5b;
  border-radius: 9px;
  background: #607b5b;
}

.page :deep(.el-button--primary:hover) {
  border-color: #4d6849;
  background: #4d6849;
}

.page :deep(.el-button) {
  border-radius: 8px;
}

/* 标签管理 */
.tag-panel {
  margin-bottom: 22px;
}

.tag-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.tag-panel-header h3 {
  margin: 0;
  color: #455b43;
  font-size: 16px;
  font-weight: 600;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid #e6ebdf;
  border-radius: 10px;
  background: #fafbf7;
}

.tag-count {
  color: #858d7e;
  font-size: 12px;
}

/* 浅绿色标签 */
.page :deep(.el-tag) {
  border-color: #dce6d5;
  border-radius: 6px;
  background: #edf3e8;
  color: #5b7454;
}

/* 表格卡片 */
.table-card {
  overflow: hidden;
  padding: 12px;
}

.table-card :deep(.el-table) {
  --el-table-header-bg-color: #eef2e9;
  --el-table-row-hover-bg-color: #f5f7f1;
  --el-table-border-color: #e9ede4;
  --el-table-text-color: #53604f;
  --el-table-header-text-color: #52664e;

  border-radius: 9px;
  overflow: hidden;
}

.table-card :deep(.el-table th.el-table__cell) {
  font-weight: 600;
}

.table-card :deep(.el-table td.el-table__cell),
.table-card :deep(.el-table th.el-table__cell) {
  padding-top: 13px;
  padding-bottom: 13px;
}

/* 弹窗 */
.page :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.page :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 22px 24px 12px;
  background: #f7f9f3;
}

.page :deep(.el-dialog__title) {
  color: #354b37;
  font-weight: 600;
}

.page :deep(.el-dialog__body) {
  padding: 22px 24px;
}

.page :deep(.el-dialog__footer) {
  padding: 12px 24px 22px;
}

/* 小屏适配 */
@media (max-width: 768px) {
  .header h1 {
    font-size: 25px;
  }

  .toolbar {
    align-items: flex-start;
  }

  .content-card,
  .tag-panel {
    padding: 16px;
  }

  .filters {
    align-items: stretch;
  }

  .filters :deep(.el-input),
  .filters :deep(.el-select) {
    width: 100% !important;
  }

  .table-card {
    padding: 6px;
    overflow-x: auto;
  }
}


.shelf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));
  gap: 28px 22px;
}

.shelf-card {
  min-width: 0;
  cursor: pointer;
}

.cover {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  padding: 16px;
  border: 1px solid #e4e7dc;
  border-radius: 5px 12px 12px 5px;
  background: #e9eee3;
  box-shadow: 3px 4px 9px #35453612;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.cover::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 10px;
  width: 1px;
  background: #ffffff80;
  content: "";
}

.shelf-card:hover .cover {
  transform: translateY(-5px);
  box-shadow: 4px 10px 20px #35453620;
}

.cover-type {
  z-index: 1;
  color: #61745b;
  font-size: 11px;
  letter-spacing: 1px;
}

.cover-art {
  display: grid;
  flex: 1;
  place-items: center;
}

.cover-symbol {
  color: #788c6e;
  font-family: Georgia, serif;
  font-size: 54px;
}

.cover-title {
  z-index: 1;
  overflow-wrap: anywhere;
  color: #354b37;
  font-family: Georgia, "Microsoft YaHei", serif;
  font-size: 18px;
  line-height: 1.5;
}

.cover-caption {
  z-index: 1;
  margin-top: 10px;
  color: #84917b;
  font-size: 8px;
  letter-spacing: 1.5px;
}

.cover-BOOK {
  background: #e5eadc;
}

.cover-MOVIE {
  background: #e9e2d9;
}

.cover-MUSIC {
  background: #e4e4ed;
}

.cover-ARTICLE {
  background: #f0eadb;
}

.cover-DEBATE {
  background: #e8e0e3;
}

.cover-GAME {
  background: #dfeae5;
}

.cover-PODCAST {
  background: #e8e5d7;
}

.cover-VIDEO {
  background: #e1e8ec;
}

.shelf-card-info {
  padding: 11px 2px 0;
}

.shelf-card-info h3 {
  overflow: hidden;
  margin: 0 0 7px;
  color: #455343;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-label {
  color: #899183;
  font-size: 12px;
}

.empty-shelf {
  padding: 60px 20px;
  color: #899183;
  text-align: center;
}

</style>


