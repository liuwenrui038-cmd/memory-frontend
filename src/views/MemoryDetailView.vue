
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../api/request'

const route = useRoute()
const router = useRouter()

const memory = ref(null)
const loading = ref(true)

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

const loadMemory = async () => {
  try {
    const response = await request.get(`/memories/${route.params.id}`)
    memory.value = response.data
  } catch (error) {
    ElMessage.error('作品信息加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMemory()
})
</script>

<template>
  <div class="detail-page">
    <button class="back-button" @click="router.push('/memories')">
      ← 返回收藏架
    </button>

    <p v-if="loading">正在打开这份收藏……</p>

    <div v-else-if="memory" class="detail-content">
      <div class="detail-cover" :class="`cover-${memory.type}`">
        <span class="cover-type">{{ getTypeName(memory.type) }}</span>
        <div class="cover-art">
          <span class="cover-symbol">{{ getCoverSymbol(memory.type) }}</span>
        </div>
        <h1>{{ memory.title }}</h1>
        <span class="cover-caption">A MEMORY TO KEEP</span>
      </div>

      <section class="detail-info">
        <p class="eyebrow">FROM YOUR COLLECTION</p>
        <h1 class="detail-title">{{ memory.title }}</h1>
        <p class="detail-type">{{ getTypeName(memory.type) }}</p>

        <div class="detail-divider"></div>

        <div class="info-row">
          <span>发现日期</span>
          <span>{{ memory.discoverDate || '尚未记录' }}</span>
        </div>

        <div class="info-row">
          <span>收藏感受</span>
          <span>{{ memory.favorite ? '喜欢' : '未标记为喜欢' }}</span>
        </div>

        <div class="detail-section">
          <h2>标签</h2>
          <div v-if="memory.tags && memory.tags.length" class="detail-tags">
            <span v-for="tag in memory.tags" :key="tag.id || tag.name">
              {{ tag.name }}
            </span>
          </div>
          <p v-else class="muted">还没有添加标签。</p>
        </div>

        <div class="detail-section">
          <h2>感受与想法</h2>
          <p v-if="memory.feeling" class="feeling-text">{{ memory.feeling }}</p>
          <p v-else class="muted">关于这件作品的感受，还等待着被写下来。</p>
        </div>
      </section>
    </div>

    <div v-else class="empty-detail">
      没有找到这件作品。它可能已经被删除。
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 1050px;
  margin: 0 auto;
  color: #354536;
}

.back-button {
  margin-bottom: 30px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: #74836d;
  font-size: 13px;
  cursor: pointer;
}

.back-button:hover {
  color: #354b37;
}

.detail-content {
  display: grid;
  grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1.3fr);
  align-items: start;
  gap: 54px;
}

.detail-cover {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  aspect-ratio: 3 / 4;
  min-height: 300px;
  padding: 22px;
  border: 1px solid #e4e7dc;
  border-radius: 5px 13px 13px 5px;
  background: #e9eee3;
  box-shadow: 5px 8px 20px #35453612;
}

.cover-BOOK { background: #e5eadc; }
.cover-MOVIE { background: #e9e2d9; }
.cover-MUSIC { background: #e4e4ed; }
.cover-ARTICLE { background: #f0eadb; }
.cover-DEBATE { background: #e8e0e3; }
.cover-GAME { background: #dfeae5; }
.cover-PODCAST { background: #e8e5d7; }
.cover-VIDEO { background: #e1e8ec; }

.cover-type,
.cover-caption {
  color: #788873;
  font-size: 10px;
  letter-spacing: 1.5px;
}

.cover-art {
  display: grid;
  flex: 1;
  place-items: center;
}

.cover-symbol {
  color: #788c6e;
  font-family: Georgia, serif;
  font-size: 68px;
}

.detail-cover h1 {
  overflow-wrap: anywhere;
  color: #354b37;
  font-family: Georgia, "Microsoft YaHei", serif;
  font-size: 25px;
  font-weight: 500;
  line-height: 1.5;
}

.detail-info {
  padding: 8px 0;
}

.eyebrow {
  color: #87947e;
  font-size: 10px;
  letter-spacing: 2px;
}

.detail-title {
  margin: 12px 0 8px;
  color: #354b37;
  font-family: Georgia, "Microsoft YaHei", serif;
  font-size: 30px;
  font-weight: 500;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.detail-type {
  color: #87917f;
  font-size: 13px;
}

.detail-divider {
  height: 1px;
  margin: 26px 0;
  background: #e4e8de;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 18px 0;
  color: #53604f;
  font-size: 13px;
}

.info-row span:first-child {
  color: #899183;
}

.detail-section {
  margin-top: 30px;
}

.detail-section h2 {
  margin-bottom: 14px;
  color: #455b43;
  font-size: 15px;
  font-weight: 600;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tags span {
  padding: 6px 11px;
  border: 1px solid #dce6d5;
  border-radius: 20px;
  background: #edf3e8;
  color: #5b7454;
  font-size: 12px;
}

.feeling-text {
  color: #596454;
  font-size: 14px;
  line-height: 2;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.muted,
.empty-detail {
  color: #92988b;
  font-size: 13px;
  line-height: 1.8;
}

@media (max-width: 700px) {
  .detail-content {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .detail-cover {
    width: min(100%, 300px);
    min-height: 0;
  }

  .detail-title {
    font-size: 25px;
  }
}
</style>
