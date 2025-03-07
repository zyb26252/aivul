import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { RouteRecordRaw } from 'vue-router'

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
        },
        {
          path: 'scene',
          name: 'Scene',
          component: () => import('../views/scene/index.vue'),
          meta: {
            title: '场景管理'
          }
        },
        {
          path: 'scene/:id/topology',
          name: 'Topology',
          component: () => import('../views/topology/index.vue'),
          meta: {
            title: '拓扑编辑器'
          }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  document.title = to.meta.title ? `${to.meta.title} - AI驱动的网络靶场驱动自动化构建引擎` : 'AI驱动的网络靶场驱动自动化构建引擎'
  
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