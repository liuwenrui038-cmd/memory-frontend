
import { createRouter, createWebHistory } from 'vue-router'

import MemoriesView from '../views/MemoriesView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'
import TagsView from '../views/TagsView.vue'
import MemoryDetailView from '../views/MemoryDetailView.vue'

const routes = [
  {
    path: '/',
    redirect: '/memories'
  },
  {
    path: '/memories',
    component: MemoriesView,
    meta: {
      title: '全部记录',
      description: '浏览和管理你的所有收藏。'
    }
  },
  {
  path: '/memories/:id',
  component: MemoryDetailView,
  meta: {
    title: '作品详情'
  }
  },
  {
    path: '/timeline',
    component: PlaceholderView,
    meta: {
      title: '时间线',
      description: '按照发现日期，回顾你遇见的作品。'
    }
  },
  {
    path: '/calendar',
    component: PlaceholderView,
    meta: {
      title: '月历',
      description: '在日历中浏览每天记录的内容。'
    }
  },
  {
    path: '/tags',
    component: TagsView,
    meta: {
      title: '标签管理',
      description: '整理标签，让你的收藏更有条理。'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
console.log('当前注册的路由：', router.getRoutes().map(route => route.path))
export default router
