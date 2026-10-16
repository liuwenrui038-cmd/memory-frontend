
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="placeholder-page">
    <h1>{{ route.meta.title }}</h1>
    <p>{{ route.meta.description }}</p>

    <div class="placeholder-card">
      <p>这个页面的功能还在搭建中。</p>
      <p>我们会逐步完善这里的内容。</p>
    </div>
  </section>
</template>

<style scoped>
.placeholder-page {
  max-width: 1000px;
  margin: 0 auto;
}

.placeholder-page h1 {
  margin: 0 0 12px;
  color: #354536;
  font-size: 28px;
}

.placeholder-page > p {
  margin-bottom: 28px;
  color: #858a7f;
}

.placeholder-card {
  padding: 28px;
  border: 1px solid #e5e8df;
  border-radius: 14px;
  background: #fff;
  color: #788373;
}

.placeholder-card p {
  margin: 8px 0;
}
</style>
