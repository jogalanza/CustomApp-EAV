<!-- eslint-disable vue/no-deprecated-html-element-is -->
<template>
  <BoardLayout class="dashboard" :title="GetLocaleString('DASHBOARD', 'Dashboard')" :drawer="drawer" :view="`hHr lpR fFr`" :breakpoint="1024" :show-if-above="false" :drawer-width="450"
    @drawerchange="(e) => (drawer = e)" ref="dashboardCont">
    <template v-slot:header>
      <q-toolbar v-if="!invalidSession" class="dashboard-toolbar">


        <q-select v-if="mainStore.SessionOptions.Consolidated && user.ActiveUser.IsAdmin" v-model="adminPeriod" :options="mainStore.ReviewPeriods" option-label="DESCRIPTION" borderless
          class="admin-select-period" popup-content-class="admin-select-period-popup" />
        <q-btn v-else flat :label="computeTitle" @click="ShowSessionOpts" style="font-size: 1.4rem;font-weight: bold" padding="xs md" />
        <!-- <q-toolbar-title v-else class="text-bold" style="overflow: initial">
          <q-btn flat :label="computeTitle" @click="ShowSessionOpts" style="font-size: 1.4rem;font-weight: bold" padding="xs md" />
        </q-toolbar-title> -->
        <span v-if="subTitle">{{ subTitle }}</span>

        <q-select v-if="mainStore.SessionOptions.Consolidated && user.ActiveUser.IsAdmin" v-model="regionSettings" :options="mainStore.SiteRegions" borderless class="admin-select-period q-mx-sm"
          popup-content-class="admin-select-period-popup" option-label="Label">
          <q-tooltip>Switch data display</q-tooltip>
        </q-select>

        <q-space />

        <q-chip v-if="CalcReadOnly" color="red" text-color="white" dense class="q-mx-sm" style="font-weight: initial">READ-ONLY</q-chip>
        <q-chip v-if="mainStore.SessionOptions.Consolidated && user.ActiveUser.IsAdmin" color="green" text-color="white" dense class="q-mx-sm" style="font-weight: initial">ADMIN</q-chip>





        <q-separator v-if="mainStore.SessionOptions.Consolidated && user.ActiveUser.IsAdmin" vertical class="q-my-sm" />

        <q-btn
          v-if="mode !== 'bowler' && mainStore.DashboardView == 'chart' && mainStore.SessionOptions.Consolidated && mainStore.SessionOptions.Region?.Name !== '' && user.ActiveUser.IsAdmin"
          id="btnCompare" round flat :icon="compareMode ? 'r_compare' : 'o_compare'" size="md" class="app-btn q-ml-sm" @click="ToggleCompare" :color="compareMode ? 'green' : 'white'">
          <q-tooltip>Compare mode</q-tooltip>
        </q-btn>

        <q-btn v-if="[1, 3].indexOf(user.ActiveUser.RoleId) > -1" round flat :icon="mainStore.SessionOptions.Consolidated ? 'r_admin_panel_settings' : 'o_admin_panel_settings'" size="md"
          class="app-btn q-mx-sm" @click="ToggleAdminView">
          <q-tooltip>{{ `${(mainStore.SessionOptions.Consolidated ? "Consolidated view" : "Site view")}` }}</q-tooltip>
        </q-btn>

        <q-separator v-if="[1, 3].indexOf(user.ActiveUser.RoleId) > -1" vertical class="q-my-sm" />

        <q-btn v-if="editMode && mode !== 'bowler' && !mainStore.SessionOptions.Consolidated" round flat :icon="fullEdit ? 'o_unfold_less' : 'o_unfold_more'" size="md" class="app-btn q-ml-sm"
          @click="ToggleFullEdit">
          <q-tooltip>Toggle Full View</q-tooltip>
        </q-btn>

        <q-btn v-if="mode !== 'bowler'" id="btnShowSnapshot" round flat :icon="editMode ? 'o_analytics' : 'o_edit_note'" size="md" class="app-btn q-ml-sm" @click="ToggleView">
          <q-tooltip>Edit or Chart View</q-tooltip>
        </q-btn>

        <q-btn id="btnRefresh" round flat icon="o_refresh" size="md" class="app-btn q-ml-sm" @click="RefreshReport">
          <q-tooltip>Refresh report</q-tooltip>
        </q-btn>

        <q-btn v-if="countView > 1" round flat icon="o_visibility">
          <q-menu v-model="showViewer" anchor="top left" self="top right" :offset="[190, -40]">
            <DashboardViewers ref="dashboardViewers" />
          </q-menu>
          <q-badge class="badge-viewer" floating rounded color="green" style="margin-top: 8px">{{ countView }}</q-badge>
          <q-tooltip v-if="!showViewer">{{
            `${countView} currently viewing`
          }}</q-tooltip>
        </q-btn>

        <slot name="export">
          <q-btn round flat icon="o_get_app" size="md" class="app-btn q-ml-sm" @click="ctx.emit('export')">
            <q-tooltip>Export data to Excel</q-tooltip>
          </q-btn>
        </slot>



      </q-toolbar>
    </template>
    <template v-slot:right-drawer>
      <!-- <KeepAlive> -->
    </template>

    <AppTour ref="appTour" @start="StartTour" title="Getting Started: Report Viewer" message="Take a quick guided tour to get familiar with XMAP Report Viewer" />

    <q-card-section v-if="!invalidSession" ref="contdiv" class="container-section q-pa-none" style="height: calc(100vh - 130px);padding: 16px">
      <div style="height: 100%;">
        <slot name="periodheader"></slot>
        <slot></slot>
      </div>

    </q-card-section>

    <SessionOptions ref="sessionOpts" />

    <!-- :year-only="mode === 'bowler'" -->

    <q-dialog v-model="invalidSession" persistent>
      <q-card>
        <q-toolbar>
          <q-toolbar-title class="text-h6">Invalid Session</q-toolbar-title>
          <q-btn flat round icon="o_close" @click="navigateTo({ name: 'Home' })" />
        </q-toolbar>
        <q-card-section>
          <p>One of the following reasons may have caused this issue:</p>
          <ul>
            <li>No assigned sites for data viewer roles</li>
            <li>Unhandled error has occurred causing the application to crash</li>
          </ul>
          <p>Please try again later. If the issue is still not resolved, please contact the system administrator or raise an IT Support Ticket.</p>
        </q-card-section>
        <q-card-actions class="row q-py-md" style="justify-content: center;">
          <q-btn label="Try again" color="primary" @click="Reload" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </BoardLayout>
</template>

<style lang="scss">
.dashboard {
  .inner-board {
    overflow: auto;
  }

  .dashboard-toolbar {
    background: linear-gradient(#444543, #52554e, #444444) !important;
    color: white !important;
  }

  .stat-title {
    font-size: 1.1rem;
    padding-bottom: 0px;
  }

  .value-note {
    background: white;
  }

  .admin-select-period {
    .q-field__native {
      span {
        font-size: 1.5rem;
        font-weight: 700;
        padding-left: 16px;
        padding-right: 16px;
        // text-transform: initial;
        color: white;
      }
    }

    &.chip-mode {
      font-size: 1rem;
      text-transform: initial;
      border-radius: 16px;
      outline: 0;
      position: relative;
      height: 1.4rem;
      max-width: 100%;
      margin: 4px;
      background: #4caf50 !important;
      color: rgba(0, 0, 0, .87);
      /* padding: .5em .5em; */
      padding-top: 2px;

      .q-field__control {
        min-height: 8px !important;
        height: 100%;
      }

      .q-field__native {
        min-height: 8px !important;

        span {
          font-size: 1rem;
          font-weight: initial;
          padding-left: 16px;
          padding-right: 16px;
          text-transform: initial;
          color: white;
          line-height: 0px;
        }
      }
    }

    .q-field__append {
      display: none;
    }
  }

  .grid-row-item {
    display: flex;
    flex-wrap: nowrap;

    .row-header {
      min-width: 300px;

      &.title {
        font-size: 1.2rem;
        font-weight: 700;
      }
    }

    &.details {
      .row-header {
        min-width: 284px;
      }

    }

    .ltm-period,
    .period-value {
      min-width: 120px;
      text-align: right;
    }

    .period-value {
      font-size: 1rem;
    }
  }

}

.admin-select-period-popup {
  font-size: 1.3rem;
  font-weight: 700;
  color: #222;
}

.body--dark {
  .value-note {
    background: #1f1f1f;
  }

  .dashboard-toolbar {
    background: linear-gradient(#262626, #323232, #363636) !important;
  }

  .admin-select-period-popup {
    color: white;
  }
}
</style>

<script>
import {
  computed,
  defineAsyncComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  nextTick,
} from "vue";
import { useDashboard } from "@/composables/dashboard";
import { useUser } from "@/store/user";
import general from "@/mixins/general";
import { useMainStore } from "@/store";
import { useQuasar } from "quasar";
import { useDashboardTour } from "@/composables/appTour";
import { useRoute } from "vue-router";
import { useEvalFilter } from "../../composables/evalFilter";

export default {
  name: "DashboardContainer",
  props: {
    group: {
      type: String,
      default: ""
    },
    mode: {
      type: String,
      default: "default"
    }
  },
  components: {
    BoardLayout: defineAsyncComponent(() =>
      import("./BoardLayout.vue")
    ),
    DashboardViewers: defineAsyncComponent(() =>
      import("./DashboardViewers.vue")
    ),
    SessionOptions: defineAsyncComponent(() =>
      import("./SessionOptions.vue")
    ),
    AppTour: defineAsyncComponent(() => import("../AppTour.vue")),
  },
  emits: ["viewchanged", "layoutchanged", "refresh", "export"],
  setup(props, ctx) {
    const CalcReadOnly = inject("CalcReadOnly");
    const { SetDashboardIn } = useDashboard();
    const { optPeriods } = useEvalFilter();
    const HubSend = inject("HubSend");
    const HubConnected = inject("HubConnected");
    const GetLocaleString = inject("GetLocaleString");
    const eventBus = inject("eventBus");
    const { navigateTo } = general();
    const mainStore = useMainStore();
    const user = useUser();
    const route = useRoute();
    const q = useQuasar();
    const drawer = ref(false);
    const slide = ref("0");
    const addEmbed = ref(null);
    const contdiv = ref(null);
    const dashboardCont = ref(null);
    const carousel = ref(null);
    const shareReport = ref(null);
    const mobileView = inject("mobileView");
    const rightDrawerItem = ref(-1);
    const show = ref(true);
    const editHistory = ref(null);
    const sessionOpts = ref(null);
    const iframe = ref(null);
    const countView = ref(0);
    const commentPanel = ref(null);
    const item = ref({});
    const showViewer = ref(false);
    const dashboardFilter = ref({
      Year: null,
      Month: null,
      Site: [],
      SBU: [],
      BusinessLine: [],
      ProductFamily: [],
      Function: [],
    });
    const dashboardViewers = ref(null);
    const updateTimestamp = ref(null);
    const dbFullView = ref(false);
    const editMode = ref(false);
    const fullEdit = ref(false);
    const computeTitle = ref("Loading Session Info...")
    const subTitle = ref("Press CTRL + F5 to refresh");
    const adminPeriod = ref(null);
    const adminYear = ref(null);
    const regionSettings = ref({
      Name: "",
      IsTotal: false,
      Label: "Excelitas TOTAL"
    });

    const appTour = ref(null);
    const invalidSession = ref(false);
    const IsSessionReady = inject("IsSessionReady");
    const compareMode = ref(false);

    const historicalInfo = computed(() => {
      if (mainStore.Snapshot.Year > 0 && mainStore.Snapshot.Month > 0) {
        var s = mainStore.Months.filter(
          (e) => e.value === mainStore.Snapshot.Month
        );
        return `HISTORICAL: ${s[0].label}-${mainStore.Snapshot.Year}`;
      }
      return "HISTORICAL";
    });

    const LTMPeriods = computed(() => {
      var x = [...mainStore.LTMPeriods];
      var r = [];
      if (x.length > 0) {
        r = [...x.reverse()];
      }

      return r;
    });


    const visibleFilters = computed(() => {
      var result = ["BusinessLine", "Site"];

      if (!mainStore.Snapshot.Enabled) {
        result.push("Year");
      }

      return result;
    });

    watch(() => user.InvalidUser, () => {
      EvalSession();
    }, { immediate: true })

    watch(() => mainStore.InvalidPeriodSession, () => {
      EvalSession();
    }, { immediate: true })

    watch(
      () => user.ActiveUser,
      (newVal) => {
        if (newVal.ID !== undefined) {
          SetDashboardIn();
          EvalTour();
        }

        EvalSession();
      },
      { deep: true }
    );

    watch(
      () => mainStore.SessionOptions,
      (newVal, oldVal) => {
        console.warn("watch session options", newVal);
        EvalDashboardTitle();

        if (editMode.value && newVal.Consolidated && !oldVal.Consolidated) {
          EmitChangedView();
        }

        ctx.emit("refresh");
      },
      { deep: true }
    );

    watch(
      () => HubConnected.value,
      () => {
        SetDashboardIn();
      }
    );

    watch(
      () => adminPeriod.value,
      () => {
        nextTick(() => {
          SyncAdminPeriodToStore();
        });
      },
      { deep: true }
    );

    watch(
      () => regionSettings.value,
      () => {
        nextTick(() => {
          SyncAdminPeriodToStore();
        });
      }, { deep: true }
    );

    watch(
      () => adminYear.value,
      () => {
        nextTick(() => {
          SyncAdminPeriodToStore();
        });
      },
      { deep: true }
    );



    watch(
      () => q.fullscreen.isActive,
      (val) => {
        if (!val) {
          dbFullView.value = false;
        }
      }
    );

    const EvalSession = () => {
      console.warn("eval session", IsSessionReady.value, user.InvalidUser, user.ActiveUser);
      invalidSession.value = user.InvalidUser;  // (IsSessionReady.value && user.InvalidUser);  // (user.InvalidUser || mainStore.InvalidPeriodSession);
    }

    const EvalDashboardTitle = () => {
      var x = mainStore.SessionOptions;
      computeTitle.value = `Loading session info...`;
      subTitle.value = "Press CTRL + F5 to refresh";

      if (x.Period && x.Consolidated) {
        subTitle.value = null;
        computeTitle.value = `${x.Period.DESCRIPTION}`;
      } else if (x.Period && x.Site) {
        subTitle.value = null;
        computeTitle.value = `${x.Site.SiteName} - ${x.Period.DESCRIPTION}`;
      }

      if (!adminPeriod.value && x.Period) {
        adminPeriod.value = { ...x.Period };
      }

      if (!adminYear.value) {
        adminYear.value = x.Year;
      }
    }


    const ShowSessionOpts = () => {
      if (sessionOpts.value) {
        sessionOpts.value.Show();
      }
    };

    const EvalActiveDashboard = () => {
      item.value = { ...mainStore.ActiveDashboard };

      if (item.value.ID === undefined) {
        //check session storage
        var db = sessionStorage.getItem("morsession");
        try {
          var x = JSON.parse(db);
          item.value = { ...x };
          mainStore.SetActiveDashboard({ ...x });
        } catch {
          //notify = false;
        }
      } else {
        sessionStorage.setItem("morsession", JSON.stringify(item.value));
      }

      // if (item.value.ID === undefined) {
      //   navigateTo({ name: "Home" });
      // }
    };

    const InitFilter = () => {
      dashboardFilter.value.Year =
        mainStore.CurrentYear === 0
          ? new Date().getFullYear()
          : mainStore.CurrentYear;
    };

    const GetDashboardActivity = (_payload) => {
      if (mainStore.ActiveDashboard.ID === _payload.ID) {
        countView.value = _payload.Count;
      }
    };

    const ToggleDashboardFullScreen = (fs) => {
      dbFullView.value = fs;
      var target = dashboardCont.value._.vnode.el;
      q.fullscreen.toggle(target);
    };

    const EvalTour = () => {
      // var c = q.cookies.get("xmap_apptour_dashboard");
      // var d = q.cookies.get("xmap_notours");
      // console.warn("eval tour", d, mainStore.adhocTour, appTour.value);
      // if (
      //   !c &&
      //   (!d || mainStore.adhocTour) &&
      //   user.ActiveUser.ID !== undefined
      // ) {
      //   setTimeout(() => {
      //     if (appTour.value) {
      //       appTour.value.Show();
      //     }
      //   }, 300);
      // }
    };

    const StartTour = () => {
      const { tour } = useDashboardTour(user.ActiveUser, q);
      tour.start();
    };

    const EvalFrameEvents = (e) => {
      console.warn(e);
    };

    const RefreshReport = () => {
      eventBus.$emit("refresh-dashboard-items");
      eventBus.$emit("refresh");
    };

    const ToggleView = () => {
      editMode.value = !editMode.value;
      if (!mainStore.SessionOptions.Consolidated) {
        fullEdit.value = false;
      } else if (editMode.value) {
        //admin mode, edit
        fullEdit.value = true;
      }
      EmitChangedView();
    }

    const ToggleCompare = () => {
      compareMode.value = !compareMode.value;
      var x = { ...mainStore.SessionOptions }
      x.Compare = compareMode.value;
      mainStore.SyncSessionOptions(x);
      ctx.emit("layoutchanged", compareMode.value);
    }

    const ToggleFullEdit = () => {
      fullEdit.value = !fullEdit.value;
      EmitChangedView();
    }

    const ToggleAdminView = () => {
      var x = { ...mainStore.SessionOptions }
      x.Consolidated = !x.Consolidated;
      if (adminPeriod.value.PERIOD_ID !== x.Period.PERIOD_ID) {
        adminPeriod.value = { ...x.Period };
      }
      mainStore.SyncSessionOptions(x);
    }

    const ToggleHedged = () => {
      mainStore.ToggleHedged();
      EmitChangedView();
    }

    const EmitChangedView = () => {
      console.warn("emit changed view", editMode.value, fullEdit.value, mainStore.SessionOptions);
      if (!editMode.value) {
        mainStore.SetDashboardView("chart");
        ctx.emit("viewchanged", "chart");
        return;
      }

      if (fullEdit.value || (editMode.value && mainStore.SessionOptions.Consolidated && !fullEdit.value)) {
        mainStore.SetDashboardView("grid");
        ctx.emit("viewchanged", "grid");
        fullEdit.value = true;
        return;
      }

      mainStore.SetDashboardView("default");
      ctx.emit("viewchanged", "default");
    }

    const SyncAdminPeriodToStore = () => {
      if (mainStore.SessionOptions.Consolidated) {
        var x = { ...mainStore.SessionOptions };
        x.Period = adminPeriod.value;
        x.Region = regionSettings.value;

        // if (props.mode === "bowler"){
        //   x.Period.PERIOD_YEAR = adminYear.value;
        //   x.Year = adminYear.value;
        // }else{
        //x.Year = x.Period.PERIOD_YEAR;
        //}
        console.warn("sync admin period", x, adminYear.value, adminPeriod.value)
        mainStore.SyncSessionOptions(x);
      }
    }

    const Reload = () => {
      window.location.reload();
    };

    onMounted(() => {
      eventBus.$on("hub-update-dashboard-activity", GetDashboardActivity);
      eventBus.$on("invoke-guided-tour", EvalTour);
      // if (iframe.value) {
      //   iframe.value.load = EvalFrameEvents("mounted iframe load");
      // }
      compareMode.value = mainStore.SessionOptions?.Compare;
      regionSettings.value = mainStore.SessionOptions?.Region;
      console.log(route);
      EvalDashboardTitle();
      EvalActiveDashboard();

      InitFilter();


      SetDashboardIn();

      updateTimestamp.value = setInterval(() => {
        SetDashboardIn();
      }, 30000);

      EvalTour();
    });

    onBeforeUnmount(() => {
      clearInterval(updateTimestamp.value);
      eventBus.$off("hub-update-dashboard-activity", GetDashboardActivity);
      eventBus.$off("invoke-guided-tour", EvalTour);
    });

    return {
      CalcReadOnly,
      HubSend,
      mainStore,
      commentPanel,
      shareReport,
      carousel,
      dashboardCont,
      addEmbed,
      dashboardFilter,
      computeTitle,
      slide,
      drawer,
      rightDrawerItem,
      GetLocaleString,
      item,
      contdiv,
      show,
      visibleFilters,
      mobileView,
      user,
      editHistory,
      navigateTo,
      sessionOpts,
      ShowSessionOpts,
      historicalInfo,
      iframe,
      countView,
      showViewer,
      dashboardViewers,
      dbFullView,
      ToggleDashboardFullScreen,
      q,
      StartTour,
      appTour,
      EvalFrameEvents,
      RefreshReport,
      editMode,
      ToggleView,
      fullEdit,
      adminPeriod,
      adminYear,
      ToggleFullEdit,
      ToggleAdminView,
      optPeriods,
      LTMPeriods,
      ToggleHedged,
      ctx,
      invalidSession,
      IsSessionReady,
      Reload,
      subTitle,
      regionSettings,
      ToggleCompare,
      compareMode

    };
  },
};
</script>
