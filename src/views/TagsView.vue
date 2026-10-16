
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../api/request'

// 保存从后端获取的标签
const tags = ref([])

// 从后端加载标签及其关联作品数量
const loadTags = async () => {
  try {
    const response = await request.get('/tags')
    tags.value = response.data
  } catch (error) {
    ElMessage.error('标签加载失败，请检查后端是否启动')
  }
}

// 页面加载时获取标签
onMounted(() => {
  loadTags()
})
</script>

<template>
  <div class="tags-page">
    <header class="page-header">
      <p class="eyebrow">MY COLLECTION · INDEX</p>
      <h1>标签档案室</h1>
      <p class="description">
        为喜欢的作品留下线索，让不同的思想彼此连接。
      </p>
    </header>

    <section class="tag-summary">
      <span>已建立的标签</span>
      <strong>{{ tags.length }}</strong>
    </section>

    <section class="tag-grid">
      <article
        v-for="tag in tags"
        :key="tag.id"
        class="tag-card"
      >
        <span class="tag-symbol">✳</span>
        <h2>{{ tag.name }}</h2>
        <p>{{ tag.count }} 件收藏与它有关</p>
      </article>
    </section>

    <p v-if="tags.length === 0" class="empty-state">
      这里还没有标签。等第一枚标签出现，档案室就开始生长。
    </p>
  </div>
</template>

<style scoped>
.tags-page {
  max-width: 1200px;
  margin: 0 auto;
  color: #354536;
}

.page-header {
  margin-bottom: 34px;
}

.eyebrow {
  margin: 0 0 12px;
  color: #87947e;
  font-size: 11px;
  letter-spacing: 2px;
}

.page-header h1 {
  margin: 0;
  color: #354b37;
  font-family: Georgia, "Microsoft YaHei", serif;
  font-size: 30px;
  font-weight: 500;
  letter-spacing: 1px;
}

.description {
  margin-top: 12px;
  color: #858d7e;
  font-size: 14px;
  line-height: 1.8;
}

.tag-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  color: #788373;
  font-size: 13px;
}

.tag-summary strong {
  color: #526b50;
  font-size: 22px;
  font-weight: 500;
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
}

.tag-card {
  min-height: 145px;
  padding: 22px;
  border: 1px solid #e5e9df;
  border-radius: 13px;
  background: #fffefa;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tag-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px #3545360d;
}

.tag-symbol {
  color: #819477;
  font-size: 20px;
}

.tag-card h2 {
  margin: 16px 0 8px;
  color: #455b43;
  font-size: 17px;
  font-weight: 500;
}

.tag-card p {
  margin: 0;
  color: #92988b;
  font-size: 12px;
}

.empty-state {
  padding: 50px 20px;
  color: #92988b;
  text-align: center;
}

@media (max-width: 600px) {
  .page-header h1 {
    font-size: 25px;
  }

  .tag-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .tag-card {
    padding: 16px;
  }
}
</style>
