import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/register/index.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/',
      component: () => import('../layouts/default/index.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('../views/home/index.vue'),
          meta: { title: '首页', requiresAuth: true }
        },
        {
          path: 'scenes',
          name: 'Scenes',
          component: () => import('../views/scene/index.vue'),
          meta: { title: '场景管理', requiresAuth: true }
        },
        {
          path: 'images',
          name: 'Images',
          component: () => import('../views/images/index.vue'),
          meta: { title: '镜像管理', requiresAuth: true }
        },
        {
          path: 'software',
          name: 'Software',
          component: () => import('../views/software/index.vue'),
          meta: { title: '软件管理', requiresAuth: true }
        },
        {
          path: 'targets',
          name: 'Targets',
          component: () => import('../views/targets/index.vue'),
          meta: { title: '靶标管理', requiresAuth: true }
        },
        {
          path: 'instances',
          name: 'Instances',
          component: () => import('../views/instances/index.vue'),
          meta: { title: '实例管理', requiresAuth: true }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  document.title = to.meta.title ? `${to.meta.title} - 靶标管理系统` : '靶标管理系统'
  
  if (to.meta.requiresAuth && !token) {
    ElMessage.warning('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (token && (to.path === '/login' || to.path === '/register')) {
    // 已登录用户访问登录或注册页面时重定向到首页
    next('/')
  } else {
    next()
  }
})

export default router 