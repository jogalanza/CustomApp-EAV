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
        component: () => import("../components/HostComponent.vue"),
      },
      {
        path: "/home",
        name: "Home",
        meta: { roles: [1] },
        component: () => import("../components/HostComponent.vue"),
      },
      {
        path: "/training",
        name: "Training",
        meta: { roles: [1] },
        component: () => import("../views/TrainingLibrary.vue"),
      },
      // {
      //   path: "/corporate",
      //   name: "Corporate",
      //   meta: { roles: [1] },
      //   query: { group: "Corporate" },
      //   component: () => import("../views/DefaultDashboardContent.vue"),
      // },     
      // {
      //   path: "/supplychain",
      //   name: "SupplyChain",
      //   meta: { roles: [1] },
      //   query: { group: "Supply Chain" },
      //   component: () => import("../views/DefaultDashboardContent.vue"),
      // },  
      // {
      //   path: "/opex",
      //   name: "OpEx",
      //   meta: { roles: [1] },
      //   query: { group: "Opex" },
      //   component: () => import("../views/DefaultDashboardContent.vue"),
      // },  
      {
        path: "/learn",
        name: "HelpCenter",
        meta: { roles: [1] },
        component: () => import("../views/HelpCenter.vue"),
      },     
      {
        path: "about",
        name: "About",
        meta: { roles: [1] },
        component: () => import("../views/About.vue"),
      },
      //Admin
      {
        path: "admin/accounts",
        name: "Accounts",
        meta: { key: "AR", roles: [1] },
        component: () => import("../views/Admin/ManageAccounts.vue"),
      },  
      {
        path: "admin/period",
        name: "ManagePeriod",
        meta: { key: "M_PERIOD", roles: [1] },
        component: () => import("../views/Admin/ManagePeriod.vue"),
      },  
      {
        path: "admin/products",
        name: "ManageProducts",
        meta: { key: "M_PRODUCTS", roles: [1] },
        component: () => import("../views/Admin/ManageProducts.vue"),
      },  
      {
        path: "admin/sites",
        name: "ManageSites",
        meta: { key: "M_SITE", roles: [1] },
        component: () => import("../views/Admin/ManageSites.vue"),
      }, 
      {
        path: "admin/targets",
        name: "ManageTargets",
        meta: { key: "M_TARGETS", roles: [1] },
        component: () => import("../views/Admin/ManageTargets.vue"),
      }, 
      {
        path: "admin/bulk",
        name: "BulkUpload",
        meta: { key: "BULK", roles: [1] },
        component: () => import("../views/Admin/BulkUpload.vue"),
      }, 
      {
        path: "admin/pbi",
        name: "PowerBI",
        meta: { key: "PBI", roles: [1] },
        component: () => import("../views/Admin/PowerBIObjects.vue"),
      },  
      {
        path: "admin/snapshot",
        name: "SnapshotSettings",
        meta: { key: "SNAPSHOT", roles: [1] },
        component: () => import("../views/Admin/SnapshotSettings.vue"),
      }, 
      {
        path: "admin/cms",
        name: "ManageContent",
        meta: { key: "CMS", roles: [1] },
        component: () => import("../views/Admin/ManageContent.vue"),
      }, 
      {
        path: "admin/console",
        name: "SystemStats",
        meta: { key: "STAT", roles: [1] },
        component: () => import("../views/Admin/SystemStat.vue"),
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
