import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/emergency-dispatch'
  },
  {
    path: '/emergency-dispatch',
    name: 'EmergencyDispatch',
    component: () => import('@/views/EmergencyDispatch/index.vue'),
    meta: {
      title: '应急调度指挥中心'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router