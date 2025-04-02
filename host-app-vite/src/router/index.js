import { createRouter, createWebHashHistory } from "vue-router";

import { Cookies } from "quasar";
import { useUser } from "../store/user";
import general from "../mixins/general";
import RequestAccess from "../views/RequestAccess.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/requestaccess",
    name: "RequestAccess",
    component: RequestAccess,
  },
  {
    path: "/",
    name: "Main",
    component: () => {
      return import("../layout/Main.vue");
    },
    children: [
      {
        path: "/test",
        name: "Test",
        meta: { roles: [1] },
        component: () => import("../views/RemoteView.vue"),
      },
      {
        path: "",
        name: "Home",
        meta: { roles: [1] },
        component: () => import("../views/RemoteView.vue"),
      },
      {
        path: "/bowler",
        name: "Bowler",
        meta: { roles: [1] },
        component: () => import("../views/RemoteView.vue"),
      },
      {
        path: "/training",
        name: "Training",
        meta: { roles: [1] },
        component: () => import("../views/TrainingLibrary.vue"),
      },    
      //OTHERS
      {
        path: "preferences",
        name: "Preferences",
        meta: { roles: [1] },
        component: () => import("../views/Preferences.vue"),
      },
      {
        path: "unauth",
        name: "Unauthorized",
        meta: { roles: [1] },
        component: () => import("../views/Unauthorized.vue"),
      },
    ],
  },
  // {
  //   path: '/:catchAll(.*)',
  //   name: 'Error404',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/Error404.vue')
  // }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  //console.log('router beforeEach', to, from, store)
  if (to.fullPath !== "/")
    Cookies.set("_t", "a", {
      expires:
        window.xmap.to !== undefined && window.xmap.to !== null
          ? window.xmap.to
          : "5m",
    });

  const user = useUser();
  const { hasKey } = general();

  console.warn("route intercept", to, user.GroupMenu)

  if (
    to.meta.key !== undefined &&
    user !== undefined &&
    user.GroupMenu !== null &&
    !hasKey(user.GroupMenu, to.meta.key)
  ) {
    next({ name: "Unauthorized" });
  } else {
    if (["RequestAccess", "Unauthorized", "Dashboard", "Bowler"].indexOf(to.name) === -1) window.localStorage.setItem("mor_last", to.name);
    next();
  }
});

export default router;
