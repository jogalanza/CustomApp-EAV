<template>
  <router-view></router-view>
</template>

<script>
import {
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  watch,
  ref,
  computed,
  nextTick,
  onUnmounted,
} from "vue";
import { useQuasar, Cookies } from "quasar";
import { useLocale } from "./store/locale";
import { useUser } from "./store/user";
import general from "./mixins/general";
import { useMainStore } from "./store/index";
import { useRoute, useRouter } from "vue-router";
import { useNotifs } from "./store/notifs";
import { useEvalFilter } from "./composables/evalFilter";
import moment from "moment";
import server from "./server"
import useServerEvents from "./composables/serverEvents";
import { useHelper } from "./composables/helper";

export default {
  name: "App",
  created() {
    window.addEventListener("beforeinstallprompt", this.beforeInstall);
    window.addEventListener("appinstalled", this.appInstalled);
    window.addEventListener("appnewupdates", this.updateAvailable, {
      once: true,
    });

    //console.warn("APP", navigator.serviceWorker);

    // Prevent multiple refreshes
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (this.refreshing) return;
        this.refreshing = true;
        // Here the actual reload of the page occurs
        window.location.reload();
      });
    }


  },
  setup() {
    const q = useQuasar();
    const locale = useLocale();
    const user = useUser();
    const route = useRoute();
    const router = useRouter();
    const { hasKey, navigateTo, NotifyUser } = general();
    const eventBus = inject("eventBus");
    const mainStore = useMainStore();
    const notifs = useNotifs();
    const hub = inject("hub");
    const { optSites, optPeriods, SetDefaultSite, SetDefaultPeriod } = useEvalFilter();
    const { InvokeNotif } = useServerEvents();
    const { DownloadFile } = useHelper();
    const refreshing = ref(false);
    const hubRegistered = ref(false);
    const hubConnected = ref(false);
    const hubConnectionInfo = ref({});
    const sessionUpdate = ref(null);

    const _locale = locale.Locale; // computed(() => store.getters["locale/Locale"]);

    const HubConnected = computed(() => hubConnected.value);

    const IsSessionReady = computed(() => {
      if (mainStore.SessionOptions.Site && mainStore.SessionOptions.Period) {
        return true;
      }

      return false;
    });

    const CalcReadOnly = computed(() => {
      var isActive = true;
      var x = mainStore.ReviewPeriods.filter(e => e.PERIOD_ID === mainStore.SessionOptions.Period?.PERIOD_ID);
      if (x) {
        try {
          isActive = x[0].IS_ACTIVE;
        } catch {
          //
        }
      }

      return !isActive || [3, 4].indexOf(user.ActiveUser.RoleId) > -1;
    });

    watch(_locale, () => {
      //locale.GetLocaleText(locale);
    });

    watch(
      () => user.GroupMenu,
      (newVal) => {
        if (newVal !== null && route.meta.key !== undefined) {
          if (!hasKey(user.GroupMenu, route.meta.key)) {
            //console.warn("App group check", user.GroupMenu, route.meta.key);
            navigateTo({ name: "Unauthorized" });
          }
        }
      }
    );

    watch(() => route.fullPath, (newVal) => {
      console.warn("route change", newVal);
      UpdateUserSession(newVal);
    }, {deep: true})

    watch(
      () => user.ActiveUser,
      (newVal) => {
        if (newVal.ID !== undefined) {
          RegisterToHub();
        }
      },
      { deep: true }
    );

    watch(
      () => optSites.value,
      (newVal, oldVal) => {
        if (newVal.length > 0 && oldVal.length == 0 && !mainStore.SessionOptions.Site) {
          SetDefaultSite();
        }
      },
      { deep: true }
    );

    watch(
      () => optPeriods.value,
      (newVal, oldVal) => {
        if (newVal.length > 0 && oldVal.length == 0 && !mainStore.SessionOptions.Period) {
          SetDefaultPeriod();
        }
      },
      { deep: true }
    );

    const GetLocaleString = (key, _default) => {
      return _default;
      // if (!key) return _default;
      // if (locale.Repo === null || locale.Repo === undefined) return _default;
      // if (locale.Repo[key] === undefined) return _default;
      // if (locale.Repo[key] === null) return _default;
      // return locale.Repo[key];
    };

    const IsMenuOK = (key) => {
      if (user.GroupMenu === null) return false;
      return hasKey(user.GroupMenu, key);
    };

    const beforeInstall = (e) => {
      e.preventDefault();
      var x = q.cookies.get("install-xmap-pwa");
      if (!x) {
        mainStore.SetInstallPrompt(e);
        mainStore.SetInstallable(true);
      }
    };

    const appInstalled = () => {
      mainStore.SetInstallPrompt(null);
      mainStore.SetInstallable(false);
    };

    const updateAvailable = (e) => {
      console.warn("updateAvailable", e);
      mainStore.SetAppUpdate(e.detail);
    };

    provide("GetLocaleString", GetLocaleString);
    provide("IsMenuOK", IsMenuOK);
    provide("HubConnected", HubConnected);
    provide("CalcReadOnly", CalcReadOnly);

    const HandleWebSocketConnect = (data) => {
      hubConnected.value = true;
      hubConnectionInfo.value = data;
      nextTick(() => {
        RegisterToHub();
      });
    };

    const RegisterToHub = () => {
      if (
        !hubRegistered.value &&
        hubConnected.value &&
        user.ActiveUser.ID !== undefined
      ) {
        var r = {
          id: user.ActiveUser.ID,
          connection: hubConnectionInfo.value,
        };
        hubRegistered.value = true;
        UpdateHubSession();
      }
    };

    const UnregisterToHub = () => {
      var r = {
          id: user.ActiveUser.ID,
          connection: hubConnectionInfo.value,
        };
    };

    const UpdateUserSession = (_path) => {
      var r = {
          id: user.ActiveUser.ID,
          connection: hubConnectionInfo.value,
          path: _path
        };
    }

    const HandleNewNotifs = (_data) => {
      var data = JSON.parse(_data);
      data.timestamp = moment().toString("YYYY-MM-DD HH:mm:ss");

      if (!data.noCache) notifs.AddItem(data);
      if (data.showNotif) {
        var x =
          data.message.length > 100
            ? `${data.message.substring(0, 100)}...`
            : data.message;
        NotifyUser({ success: true, message: x }, undefined, {
          icon: data.icon,
          position: "bottom-left",
          type: data.type,
          multiLine: true,
        });
      }
    };

    const UpdateHubSession = () => {
      if (hubConnected.value && user.ActiveUser.ID !== undefined) {
        //
      }
    };

    const CheckAuthCookie = () => {
      if (!q.cookies.has('.XMAPCore')) {
        //!q.cookies.has("_cnsoutha") || 
        //window.reload();
        console.warn("No auth cookie detected", q.cookies.has("_cnsoutha"), q.cookies.has('.XMAPCore'))
        window.location.href = window.location.href.split('?')[0] + '?session=' + new Date().getTime();
      }
    }

    const HandleAppSessionInfo = (_info) => {
      mainStore.SyncAppSessionInfo(_info);
    };

    const ResetGuidedTour = () => {
      
      //
    };

    const RestoreSession = () => {
      var x = sessionStorage.getItem("morsession");
      if (x) {
        try {
          var y = JSON.parse(x);
          mainStore.SyncSessionOptions({ ...y });
        } catch {
          //
        }
      }

      var a = sessionStorage.getItem("morsessionview");
      if (a) {
        try {
          mainStore.SetDashboardView(a);
        } catch {
          //
        }
      }
    }

    const CheckAuth = () => {
      if (q.cookies.has("_cnsoiu")) {
        navigateTo({ name: "RequestAccess" });
      } else {
        user.GetCurrentUser().then((response) => {
          var x = { ...mainStore.SessionOptions };
          x.Consolidated = response.IsAdmin;
          mainStore.SyncSessionOptions(x);
          mainStore.GetReviewPeriods();
          mainStore.GetReviewYears();
          mainStore.GetSiteRegions();
        });
      }
    };

    const EvalUserUpdate = (data) => {
      //console.warn("EvalUserUpdate", data, JSON.parse(data))
      if (user.ActiveUser && user.ActiveUser.ID !== undefined) {
        var x = JSON.parse(data);
        if (user.ActiveUser.ID === x.ID) {
          CheckAuth();
        }
      }
    };

    const HamdleLookupUpdate = () => {
      var x = { ...mainStore.SessionOptions };
      mainStore.SyncSessionOptions(x);
      mainStore.GetReviewPeriods();
      mainStore.GetReviewYears();
      mainStore.GetSiteRegions();
    }

    provide("CheckAuth", CheckAuth);
    provide("IsSessionReady", IsSessionReady);

    const EvalInitialPath = (_route) => {
      const params = new URLSearchParams(window.location.search);
      const errId = params.get('err');
      const email = params.get('email');

      console.log('ID:', errId);
      console.log('Email:', email);

      if (errId) {
        window.sessionStorage.setItem('errId', errId);
        window.sessionStorage.setItem('email', email);
        navigateTo({ name: "RequestAccess" });
      } else {
        if (_route && user.ActiveUser.RoleId !== undefined){
          navigateTo({ name: _route });
          return;
        }
        navigateTo({ name: "Home" });
      }
    }

    const HubDownload = (data) => {
      try{
        var x = JSON.parse(data);
        DownloadFile(`${server.defaults.baseURL}/${x.path}`);
        //window.open(`${server.defaults.baseURL}/${x.path}`, "_blank") //?t=${(new Date().getUTCMilliseconds())}
      }catch{
        //
      }
      
    };

    const HandleWSStatusChange = (data) => {
      hubConnected.value = data;
    };

    onMounted(() => {
      eventBus.$on("server-event", InvokeNotif);
      eventBus.$on("hub-download-file", HubDownload);
      eventBus.$on("on-ws-connect", HandleWebSocketConnect);
      eventBus.$on("hub-app-notif", HandleNewNotifs);
      eventBus.$on("hub-session-users", HandleAppSessionInfo);
      eventBus.$on("hub-update-user", EvalUserUpdate);
      eventBus.$on("hub-update-lookups", HamdleLookupUpdate);
      eventBus.$on("on-ws-status-change", HandleWSStatusChange);
      eventBus.$on("reset-guided-tour", ResetGuidedTour);



      sessionUpdate.value = setInterval(() => {
        UpdateHubSession();
      }, (window.xmap && window.xmap.sessionInterval !== undefined ? window.xmap.sessionInterval : 60) * 1000);

     

      var x = window.localStorage.getItem("xmap_locale");
      if (x) {
        locale.SetLocale(x);
      } else {
        x = window.xmap.locale;
      }

      locale.SetLocale(x);

      const value = Cookies.get("_morrdr");
      var y = window.localStorage.getItem("mor_last");
      if (value) {
        Cookies.remove("_morrdr");
        console.warn("Parse redirect object", value, value.route, value.query);
        try {
          router.replace({ name: value.route, query: { ...value.query } });
        } catch {
          EvalInitialPath();
        }
      } else if (y && ["RequestAccess", "Unauthorized"].indexOf(y) === -1) {
        EvalInitialPath(y);
      } else {
        EvalInitialPath();
      }

      setTimeout(() => {
        CheckAuthCookie();
      }, 10000);
    });

  

    onBeforeUnmount(() => {
      eventBus.$off("server-event", InvokeNotif);
      eventBus.$off("hub-download-file", HubDownload);
      eventBus.$off("on-ws-connect", HandleWebSocketConnect);
      eventBus.$off("hub-app-notif", HandleNewNotifs);
      eventBus.$off("hub-session-users", HandleAppSessionInfo);
      eventBus.$off("hub-update-user", EvalUserUpdate);
      eventBus.$off("hub-update-lookups", HamdleLookupUpdate);
      eventBus.$off("on-ws-status-change", HandleWSStatusChange);
      eventBus.$off("reset-guided-tour", ResetGuidedTour);

      clearInterval(sessionUpdate.value);
    });

    onUnmounted(() => {
      UnregisterToHub();
    })

    return {
      beforeInstall,
      appInstalled,
      updateAvailable,
      RestoreSession,
      refreshing,
      HubConnected,
      IsSessionReady,
      CheckAuthCookie
    };
  },
};
</script>
