import { type RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory } from "vue-router"

const Layout = () => import("@/layout/index.vue")

/** 常驻路由 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: {
      hidden: true
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首页",
          svgIcon: "dashboard",
          affix: true
        }
      }
    ]
  },
  {
    path: "/userInfo",
    component: Layout,
    redirect: "/current",
    meta: {
      hidden: true
    },
    children: [
      {
        path: "/current",
        component: () => import("@/views/user/about/index.vue"),
        name: "个人中心",
        meta: {
          title: "个人中心"
        }
      }
    ]
  }
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: "/users",
    component: Layout,
    redirect: "/users",
    meta: {
      alwaysShow: false
    },
    children: [
      {
        path: "/users",
        component: () => import("@/views/user/index.vue"),
        name: "User List",
        meta: {
          svgIcon: "lock",
          title: "用户管理",
          roles: ["SUPER_ADMIN"]
        }
      }
    ]
  },
  {
    path: "/roles",
    component: Layout,
    redirect: "/roles",
    meta: {
      alwaysShow: false
    },
    children: [
      {
        path: "/roles",
        component: () => import("@/views/role/index.vue"),
        name: "Role List",
        meta: {
          title: "角色管理",
          svgIcon: "lock",
          roles: ["SUPER_ADMIN"]
        }
      }
    ]
  },
  {
    path: "/articles",
    component: Layout,
    redirect: "/articles",
    meta: {
      title: "文章相关",
      svgIcon: "lock",
      alwaysShow: false
    },
    children: [
      {
        path: "/articles",
        component: () => import("@/views/article/index.vue"),
        name: "Article List",
        meta: {
          title: "文章管理",
          svgIcon: "lock",
          roles: ["SUPER_ADMIN"]
        }
      },
      {
        path: "/tags",
        component: () => import("@/views/tag/index.vue"),
        name: "Article Tag List",
        meta: {
          title: "标签管理",
          svgIcon: "lock",
          roles: ["SUPER_ADMIN"]
        }
      },
      {
        path: "/categories",
        component: () => import("@/views/category/index.vue"),
        name: "Article Category List",
        meta: {
          title: "分类管理",
          svgIcon: "lock",
          roles: ["SUPER_ADMIN"]
        }
      }
    ]
  },

  {
    path: "/:pathMatch(.*)*", // Must put the 'ErrorPage' route at the end, 必须将 'ErrorPage' 路由放在最后
    redirect: "/404",
    name: "ErrorPage",
    meta: {
      hidden: true
    }
  }
]

const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === "hash"
      ? createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH)
      : createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch (error) {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
