<template>
  <q-layout
    :class="`app-main-layout ${mobileView ? 'mobile-view' : ''}`"
    view="hHh lpR fFf"
    style="background: #0e0c0c"
  >
    <!-- lHh Lpr lFf -->
    <q-header class="app-header dark q-py-sm">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          icon="r_menu"
          size="md"
          class="toggle-main-drawer"
          color="white"
        />

        <q-toolbar-title class="app-title" style="overflow: inherit">
          <q-img
            v-if="!mobileView"
            :src="require('@/assets/excelitas_logo.png')"
            fit="fill"
            width="144px"
            height="54px"
            style="min-width: 144px; margin-top: -6px;"
          />
          <span class="q-ml-md text-etc-green" :style="`font-size: 2em; font-family: sap72-bold; letter-spacing: -4px; margin-left: ${(mobileView ? 0 : 24)}px`"
            >XMAP</span
          >
        </q-toolbar-title>
        <q-space v-if="mobileView" />
        <q-btn
          id="notifs"
          color="white"
          round
          flat
          icon="o_notifications"
          size="md"
          class="app-btn"
          @click="ShowRightDrawerItem(2)"
        >
          <q-tooltip>Notifications</q-tooltip>
          <q-badge
            v-if="notifs.count > 0"
            color="red"
            floating
            transparent
            rounded
          >
            {{ notifs.count }}
          </q-badge>
        </q-btn>

        <q-list class="q-mr-sm">
          <q-item clickable class="q-pa-none q-px-sm">
            <q-item-section avatar :style="`padding-right: 16px; min-width: 32px; ${(mobileView ? 'margin-right: -32px;' : '')}`">
              <q-avatar size="32px">
                <img v-if="user.ActiveUser.Photo" :src="`data:image/png;base64,${user.ActiveUser.Photo}`" />
                <q-icon v-else name="o_face" size="24px" color="green" />
              </q-avatar>
            </q-item-section>
            <q-item-section v-if="user.ActiveUser && !mobileView">
              <q-item-label class="text-white" style="text-transform: capitalize">{{ user.ActiveUser.DisplayName }}</q-item-label>
              <q-item-label v-if="user.ActiveUser.Title" caption class="text-grey" style="text-transform: capitalize; margin-top: 0px">{{ user.ActiveUser.Title }}</q-item-label>
              <q-item-label v-if="user.ActiveUser.RoleName" caption class="text-grey" style="text-transform: capitalize; margin-top: 0px">{{ user.ActiveUser.RoleName }}</q-item-label>
            </q-item-section>

            <q-popup-proxy v-if="user.ActiveUser" style="max-width: 100%">
              <q-card style="width: 380px">
              <q-card-section class="q-pa-sm">
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar size="88px">
                        <img
                          v-if="user.ActiveUser.Photo"
                          :src="`data:image/png;base64,${user.ActiveUser.Photo}`"
                        />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section top>
                      <q-item-label class="text-h6 text-bold">{{
                        user.ActiveUser.DisplayName
                      }}</q-item-label>
                      <q-item-label caption>{{
                        user.ActiveUser.Email
                      }}</q-item-label>
                      <q-item-label caption>{{
                        user.ActiveUser.Title
                      }}</q-item-label>

                      <q-item-label caption
                        >Reports to: {{ user.ActiveUser.Manager }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
            </q-popup-proxy>
          </q-item>
        </q-list>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="user.ActiveUser"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="miniState"
      class="app-drawer"
      :width="290"   
      @mouseenter="miniState = false"
      @mouseleave="miniState = true"   
      mini-to-overlay
    >
    <!-- behavior="mobile" -->
      <q-list
        class="q-px-none"
        style="
          height: calc(100vh - 155px);
          overflow-y: auto;
          overflow-x: hidden;
        "
      >
        <template v-for="(m, i) in locUserMenu" :key="i">
          <q-expansion-item
            :id="`drawermenuitem${i}`"
            v-if="
              m.label !== 'separator' &&
              (m.userItem !== undefined ||
                (m.hasHeader === undefined &&
                  m.items !== undefined &&
                  m.ignoreItems === undefined))
            "
            group="menu"
            :key="`${i}-ei`"
            :default-opened="m.opened !== undefined ? m.opened : false"
            :icon="m.icon !== '' ? m.icon : 'r_settings'"
            :label="GetLocaleString(m.langkey, m.label)"
            header-class="sticky-menu-header"
            @mouseenter="m.showMenu = true"
            @mouseleave="m.showMenu = false"
            :class="{
              active:
                m.link === undefined
                  ? false
                  : (route.fullPath.indexOf(m.link) > -1 &&
                      miniState &&
                      m.link !== '/') ||
                    (m.link === '/' && route.fullPath === m.link && miniState),
            }"
          >
            <!--  -->
            <q-menu
              v-model="m.showMenu"
              v-show="miniState"
              v-if="miniState"
              auto-close
              @mouseenter="m.showMenu = true"
              @mouseleave="m.showMenu = false"
              touch-position
              :target="`#drawermenuitem${i}`"
              anchor="top right"
              self="top left"
              style="
                background: transparent;
                padding: 8px;
                padding-top: 0px;
                box-shadow: none;
              "
            >
              <q-card class="drawer-pop-menu">
                <q-card-section class="q-pa-sm">
                  <template v-for="(n, o) in m.items">
                    <q-item-label
                      v-if="n.isHeader !== undefined"
                      :key="o"
                      header
                      style="padding-left: 26px; line-height: 2px !important"
                      >{{ GetLocaleString(n.langkey, n.label) }}</q-item-label
                    >
                    <q-item
                      v-else
                      :key="`${o}-e`"
                      dense
                      clickable
                      style="padding-left: 26px"
                      class="drawer-item"
                      :active="
                        n.link !== undefined
                          ? route.fullPath.indexOf(n.link) > -1 && n.link !== '/'
                          : false
                      "
                      @click="
                        n.action !== undefined
                          ? handleAction(n.action)
                          : navigateTo({ ...n.route })
                      "
                    >
                      <q-item-section
                        avatar
                        style="width: 32px; min-width: 32px"
                      >
                        <q-icon
                          size="16px"
                          :name="
                            n.icon !== '' && n.icon !== undefined
                              ? n.icon
                              : 'r_settings'
                          "
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{
                          GetLocaleString(n.langkey, n.label)
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-card-section>
              </q-card>
            </q-menu>

            <q-card style="background-color: transparent">
              <q-card-section style="padding: 0px">
                <q-list>
                  <template v-for="(n, o) in m.items">
                    <q-item-label
                      v-if="n.isHeader !== undefined && miniState"
                      :key="o"
                      header
                      style="padding-left: 26px; line-height: 2px !important"
                      >{{ GetLocaleString(n.langkey, n.label) }}</q-item-label
                    >
                    <q-item
                      v-else-if="!n.isHeader"
                      :key="`${o}-qe`"
                      clickable
                      style="padding-left: 26px"
                      class="drawer-item"
                      :active="
                        n.link !== undefined
                          ? route.fullPath.indexOf(n.link) > -1 &&
                            !miniState &&
                            n.link !== '/'
                          : false
                      "
                      @click="
                        n.action !== undefined
                          ? handleAction(n.action)
                          : navigateTo({ ...n.route })
                      "
                    >
                      <q-item-section
                        avatar
                        style="width: 32px; min-width: 32px"
                      >
                        <q-icon
                          size="16px"
                          :name="
                            n.icon !== '' && n.icon !== undefined
                              ? n.icon
                              : 'r_settings'
                          "
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{
                          GetLocaleString(n.langkey, n.label)
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-item
            v-else-if="
              m.label !== 'separator' &&
              (m.items === undefined || m.ignoreItems)
            "
            :key="`${i}-we`"
            clickable
            @click="navigateTo({ ...m.route })"
            :class="{
              'drawer-item': true,
              active:
                m.link === undefined
                  ? false
                  : (route.fullPath.indexOf(m.link) > -1 && m.link !== '/') ||
                    (m.link === '/' && route.fullPath === m.link),
              'mini-active':
                m.link === undefined
                  ? false
                  : (route.fullPath.indexOf(m.link) > -1 &&
                      miniState &&
                      m.link !== '/') ||
                    (route.fullPath === m.link && m.link === '/' && miniState),
            }"
          >
            <q-item-section avatar>
              <q-icon :name="m.icon !== '' ? m.icon : 'r_settings'" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{
                GetLocaleString(m.langkey, m.label)
              }}</q-item-label>
            </q-item-section>

            <q-tooltip v-show="miniState && q.screen.width >= 1014" v-if="miniState && q.screen.width >= 1014">{{
              GetLocaleString(m.langkey, m.label)
            }}</q-tooltip>
          </q-item>

          <q-separator v-else :key="`${o}-ee`" />
        </template>
      </q-list>
    </q-drawer>

    <q-drawer
      v-model="rightDrawerOpen"
      bordered
      :breakpoint="50000"
      :width="q.screen.width < 400 ? q.screen.width : 400"
      class="app-drawer-right"
      side="right"
    >
      <Notifications
        v-if="rightDrawerItem === 2"
        @close="rightDrawerOpen = false"
        backicon="o_close"
      />
    </q-drawer>

    <q-page-container
      :class="{ 'app-container': true, mobile: mobileView }"
      style="position: fixed; top: 0px; right: 0px; left: 0px"
    >
      <router-view></router-view>
    </q-page-container>

    <!-- <q-dialog
      v-model="mainStore.Installable"
      seamless
      :position="mobileView ? 'top' : 'bottom'"
    >
      <q-card class="bg-primary">
        <q-card-section class="row">
          <div style="line-height: 36px; color: white">Install this app?</div>
          <q-space />
          <q-btn
            label="Dismiss"
            flat
            @click="dismissInstall"
            text-color="white"
          />
          <q-btn
            label="Install"
            color="green"
            @click="installPWA"
            text-color="white"
            unelevated
          />
        </q-card-section>
      </q-card>
    </q-dialog> -->

    <!-- <q-dialog
      v-model="mainStore.hasNewUpdates"
      seamless
      :position="mobileView ? 'top' : 'bottom'"
    >
      <q-card class="bg-red">
        <q-card-section class="row">
          <div style="line-height: 36px; color: white">
            A new version of this app is now available. Please refresh the app.
          </div>
          <q-space />
          <q-btn
            label="Dismiss"
            flat
            text-color="white"
            @click="mainStore.SetHasNewUpdates(false)"
          />
          <q-btn label="Refresh" text-color="green" flat @click="RefreshApp" unelevated />
        </q-card-section>
      </q-card>
    </q-dialog> -->
  </q-layout>
</template>

<style lang="scss">
.app-container {
  &.mobile {
    bottom: 60px;
    padding-bottom: 20px !important;
    height: inherit;
  }
}
.bottom-menu {
  .q-dialog__backdrop {
    margin-bottom: 70px;
  }
  .q-dialog__inner {
    top: 130px;
    // bottom: 70px;
  }
}
.q-expansion-item--standard {
  &.active {
    .sticky-menu-header {
      // background: rgba(94,94,94, 0.3);
      // border-radius: 32px;
      color: var(--q-positive);
    }
  }
}
.footer-menu {
  .q-tab__icon {
    margin-top: -8px;
  }
}
</style>

<script>
import {
  ref,
  computed,
  onMounted,
  watch,
  provide,
  inject,
  onBeforeUnmount,
  defineAsyncComponent,
} from "vue";
import { useQuasar, Cookies } from "quasar";

import { useRoute } from "vue-router";
import general from "@/mixins/general";
import api from "../api/index";
import { useNotifs } from "../store/notifs";
import { useUser } from "../store/user";
import { useLocale } from "../store/locale";
import { useMainStore } from "@/store/index";
//import { useOptions } from "../store/options";

export default {
  name: "LayoutDefault",
  components: {
    Notifications: defineAsyncComponent(() =>
      import("../components/General/Notifications.vue")
    ),
  },
  setup() {
    const eventBus = inject("eventBus");
    const GetLocaleString = inject("GetLocaleString");
    const CheckAuth = inject("CheckAuth");

    const q = useQuasar();
    const route = useRoute();
    const { navigateTo, UseLightTheme, toggleDarkMode, NotifyUser } = general();
    const notifs = useNotifs();
    const user = useUser();
    const locale = useLocale();
    const mainStore = useMainStore();
    //const options = useOptions();

    const mobileWidth = ref(650);

    //Vars
    const offlineNotif = ref(null);
    const miniState = ref(true);
    const tab = ref("confirm");
    const rightDrawerOpen = ref(false);
    const locUserMenu = ref([]);
    const rightDrawerItem = ref(1);
    //Computed
    const scrWidth = computed(() => q.screen.width);
    const mobileView = computed(() => {
      var x = q.screen.width < mobileWidth.value;
      if (user.ActiveUser && user.ActiveUser.MobileViewOnly) x = true;
      //x = true; //remove later
      return x;
    });
    const darkMode = computed(() => {
      return q.dark;
      //return !UseLightTheme(); // q.dark;
    });

    const userMenu = computed(() => user.Menu);

    const footerDialog = ref(false);

    const connectionCheck = ref(null);

    provide("mobileWidth", mobileWidth);
    provide("mobileView", mobileView);
    provide("darkMode", darkMode);

    //Watchers
    watch(tab, () => {
      if (tab.value !== "menu") footerDialog.value = false;
    });

    // watch(miniState, () => {
    //   window.localStorage.setItem(
    //     "finxminimenu",
    //     miniState.value ? "1" : "0"
    //   );
    // });

    watch(
      () => userMenu.value,
      () => {
        locUserMenu.value = [...userMenu.value];
      },
      { deep: true, immediate: true }
    );

    watch(rightDrawerItem, () => {
      if (rightDrawerItem.value !== 2)
        window.localStorage.setItem(
          "finxRightDrawerItem",
          rightDrawerItem.value
        );
    });

    watch(() => mainStore.hasNewUpdates, (val) => {
      console.warn("new updates", route, val, mainStore.appNewUpdates)
      if (val) {
        AutoRefreshApp();
      }
    });

    //Methods

    const SwitchTheme = () => {
      toggleDarkMode();
      q.dark.set(!UseLightTheme());
    };

    const handleAction = (data) => {
      if (data.name === "Logout") {
        user.SetUser(null);
        q.cookies.remove("_xmap_auth");
        q.cookies.remove("_pdcs_oss");
        navigateTo({ name: "Login" });
        api.UserLogout();
      } else if (data.name === "ToggleDarkMode") {
        SwitchTheme();
      }
    };

    const installPWA = () => {
      if (mainStore.InstallPrompt) {
        mainStore.InstallPrompt.prompt();
        mainStore.SetInstallable(false);
      }
    };

    const dismissInstall = () => {
      mainStore.SetInstallable(false);
      q.cookies.set("install-xmap-pwa", null, { expires: 15 });
    };

    const RefreshApp = () => {
      mainStore.SetHasNewUpdates(false);
      if (!mainStore.appNewUpdates || !mainStore.appNewUpdates.waiting) return;

      try {
        mainStore.appNewUpdates.waiting.postMessage({ type: "SKIP_WAITING" });
      } catch {
        console.error("Error refreshing app");
        location.reload();
      }
    };

    const ShowRightDrawerItem = (_index) => {
      rightDrawerItem.value = _index;
      rightDrawerOpen.value = true;
    };

    const AutoRefreshApp = () => {
      NotifyUser(
        {
          success: false,
          message: GetLocaleString('UPDATE_NOTIF', `We're almost there! The app is being updated to the latest version for you.`)
        },
        undefined,
        { timeout: 1200, progress: true, position: 'top' }
      );

      setTimeout(() => {
        RefreshApp();
      }, 1000);
    }

    onMounted(async () => {
      console.warn(route)

      // var x = UseLightTheme();
      // q.dark.set(!x);

      setTimeout(() => {
        CheckAuth();
      }, 100);

      if (route.query && route.query.snapmonth !== undefined && route.query.snapyear !== undefined){
        Cookies.remove("_morrdr");
        // mainStore.SyncSessionOptions({
        //   Enabled: true,
        //   Month: parseInt(route.query.snapmonth),
        //   Year: parseInt(route.query.snapyear)
        // });
        navigateTo({name: "Home"});
      }
    });

    onBeforeUnmount(() => {
      clearInterval(connectionCheck);
    });

    return {
      //Vars
      q,
      rightDrawerOpen,
      leftDrawerOpen: ref(false),
      footerDialog,
      tab,
      route,
      offlineNotif,
      notifs,
      mobileWidth,
      locUserMenu,
      rightDrawerItem,

      //Computed
      mobileView,
      user,
      mainStore,
      miniState,
      scrWidth,
      locale,
      darkMode,

      //Methods
      navigateTo,
      handleAction,
      installPWA,
      dismissInstall,
      SwitchTheme,
      GetLocaleString,
      RefreshApp,
      ShowRightDrawerItem,
      eventBus,
      AutoRefreshApp
    };
  },
};
</script>
