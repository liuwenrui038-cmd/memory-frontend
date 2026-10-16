//侧边栏里的 RouterLink 负责跳转，RouterView 则负责显示当前页面。收起按钮会缩窄侧边栏，让右侧内容获得更多空间。
<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const sidebarOpen = ref(true)

const menuItems = [
  { path: '/memories', label: '全部记录', icon: '▤' },
  { path: '/timeline', label: '时间线', icon: '◷' },
  { path: '/calendar', label: '月历', icon: '▦' },
  { path: '/tags', label: '标签管理', icon: '◇' }
]
</script>

<template>
  <div class="app-layout">
  
    <aside class="sidebar" :class="{ collapsed: !sidebarOpen }">
      <div class="brand">
        <div class="brand-icon">M</div>
        <span v-if="sidebarOpen">Memory</span>
      </div>

      <p v-if="sidebarOpen" class="menu-caption">我的空间</p>

      <nav class="menu">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: route.path === item.path }"
          :title="item.label"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span v-if="sidebarOpen">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-bottom">
        <button class="collapse-button" @click="sidebarOpen = !sidebarOpen">
          <span>{{ sidebarOpen ? '←' : '→' }}</span>
          <span v-if="sidebarOpen">收起侧边栏</span>
        </button>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <span class="breadcrumb">Memory / {{ route.meta.title || '我的空间' }}</span>
      </header>

      <div class="page-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f8f8f4;
  color: #354536;
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 230px;
  min-height: 100vh;
  padding: 26px 16px 18px;
  background: #edf0e7;
  border-right: 1px solid #e2e6dc;
  transition: width 0.2s ease;
}

.sidebar.collapsed {
  width: 76px;
  padding-right: 12px;
  padding-left: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  color: #354b37;
  font-size: 21px;
  font-weight: 650;
}

.brand-icon {
  display: grid;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 11px;
  background: #526b50;
  color: white;
  font-family: Georgia, serif;
}

.menu-caption {
  margin: 42px 8px 12px;
  color: #879080;
  font-size: 12px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 9px;
  color: #657160;
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
}

.collapsed .menu-item {
  justify-content: center;
  padding: 0;
}

.menu-item:hover {
  background: #e2e8dc;
}

.menu-item.active {
  background: #dce5d5;
  color: #344b36;
  font-weight: 600;
}

.menu-icon {
  display: grid;
  width: 22px;
  flex-shrink: 0;
  place-items: center;
  font-size: 19px;
}

.sidebar-bottom {
  margin-top: auto;
}

.collapse-button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 8px;
  border: 0;
  background: transparent;
  color: #788373;
  cursor: pointer;
  white-space: nowrap;
}

.main-area {
  flex: 1;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  height: 66px;
  padding: 0 34px;
  border-bottom: 1px solid #e9e9e1;
  background: #fbfbf8;
}

.breadcrumb {
  color: #858a7f;
  font-size: 13px;
}

.page-content {
  padding: 34px;
}

@media (max-width: 700px) {
  .sidebar {
    width: 76px;
    padding-right: 12px;
    padding-left: 12px;
  }

  .sidebar .brand > span,
  .sidebar .menu-caption,
  .sidebar .menu-item > span:not(.menu-icon),
  .sidebar .collapse-button > span:not(:first-child) {
    display: none;
  }

  .sidebar .menu-item {
    justify-content: center;
    padding: 0;
  }

  .page-content {
    padding: 18px;
  }

  .topbar {
    padding: 0 18px;
  }
}
</style>
