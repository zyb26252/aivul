import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/register/index.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/',
      component: () => import('@/layouts/default/index.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/home/index.vue'),
          meta: { title: '首页', requiresAuth: true }
        },
        {
          path: 'images',
          name: 'Images',
          component: () => import('@/views/images/index.vue'),
          meta: { title: '镜像管理', requiresAuth: true }
        },
        {
          path: 'software',
          name: 'Software',
          component: () => import('@/views/software/index.vue'),
          meta: { title: '软件管理', requiresAuth: true }
        },
        {
          path: 'targets',
          name: 'Targets',
          component: () => import('@/views/targets/index.vue'),
          meta: { title: '靶标管理', requiresAuth: true }
        },
        {
          path: 'instances',
          name: 'Instances',
          component: () => import('@/views/instances/index.vue'),
          meta: { title: '实例管理', requiresAuth: true }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router 