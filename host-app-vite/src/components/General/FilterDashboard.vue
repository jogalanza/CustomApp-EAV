<template>
  <QToolbar v-if="toolbar" style="flex-wrap: wrap">
    <q-tabs
      inline-label
      outside-arrows
      mobile-arrows
      style="width: 100%"
      dense
      align="left"
    >
      <q-tab
        v-for="(m, i) in optSites"
        :key="i"
        :label="m.label"
        no-caps
        :class="`tab-chip ${
          dashboardFilter.Site.indexOf(m) > -1 ? 'active' : ''
        }`"
        @click="SetValueToArr(dashboardFilter.Site, m)"
      />
    </q-tabs>
    <q-tabs
      inline-label
      outside-arrows
      mobile-arrows
      style="width: 100%"
      dense
      align="left"
    >
      <q-tab
        v-for="(m, i) in optProducts"
        :key="i"
        :label="m.label"
        no-caps
        :class="`tab-chip ${
          dashboardFilter.BusinessLine.indexOf(m) > -1 ? 'active' : ''
        }`"
        @click="SetValueToArr(dashboardFilter.BusinessLine, m)"
      />
    </q-tabs>
    <div>
      <q-select
        class="q-mb-md"
        borderless
        dense
        filled
        :options="mainStore.Years"
        v-model="dashboardFilter.Year"
      ></q-select>
    </div>
  </QToolbar>
  <QCard v-else flat style="height: 100%">
    <QToolbar class="q-py-sm">
      <QBtn
        flat
        round
        :icon="q.screen.width > 1024 ? 'r_close' : 'r_arrow_back'"
        @click="context.emit('close')"
      >
        <QTooltip>{{ GetLocaleString("CLOSE", "Close") }}</QTooltip>
      </QBtn>
      <QToolbarTitle
        class="app-title text-bold"
        style="overflow: inherit; text-transform: none"
        >{{ GetLocaleString("FILTER", "Filter") }}</QToolbarTitle
      >
    </QToolbar>
    <QCardSection class="q-pa-sm q-px-md" style="height: calc(100% - 58px)">
      <div class="q-mb-sm">
        <span class="text-h6 text-bold">Year</span>
      </div>
      <q-select
        class="q-mb-md"
        borderless
        dense
        filled
        :options="mainStore.Years"
        v-model="dashboardFilter.Year"
      ></q-select>

      <div class="q-mb-sm">
        <span class="text-h6 text-bold">Sites</span>
        <q-chip
          clickable
          dense
          flat
          outline
          no-caps
          class="q-ml-md"
          style="border-color: transparent"
          @click="dashboardFilter.Site = []"
          >Clear</q-chip
        >
        <q-chip
          clickable
          style="border-color: transparent"
          outline
          dense
          flat
          no-caps
          class="q-ml-sm"
          @click="FillArr(dashboardFilter.Site, optSites)"
          >Select All</q-chip
        >
      </div>
      <div class="row q-mb-md">
        <q-chip
          v-for="(m, i) in optSites"
          :key="i"
          clickable
          :class="`filter-chip ${
            dashboardFilter.Site.indexOf(m) > -1 ? 'active' : ''
          }`"
          @click="SetValueToArr(dashboardFilter.Site, m)"
          >{{ m.label }}</q-chip
        >
      </div>
      <!-- <div class="q-mb-sm q-mt-md">
        <span class="text-h6 text-bold">SBU</span>
        <q-chip
          clickable
          style="border-color: transparent"
          outline
          dense
          flat
          no-caps
          class="q-ml-md"
          @click="dashboardFilter.SBU = []"
          >Clear</q-chip
        >
        <q-chip
          clickable
          style="border-color: transparent"
          outline
          dense
          flat
          no-caps
          class="q-ml-sm"
          @click="FillArr(dashboardFilter.SBU, user.SBU, 'label')"
          >Select All</q-chip
        >
      </div>
      <div class="row">
        <q-chip
          v-for="(m, i) in user.SBU"
          :key="i"
          clickable
          :class="`filter-chip ${
            dashboardFilter.SBU.indexOf(m.label) > -1 ? 'active' : ''
          }`"
          @click="SetValueToArr(dashboardFilter.SBU, m.label)"
          >{{ m.label }}</q-chip
        >
      </div> -->
      <div class="q-mb-sm q-mt-md">
        <span class="text-h6 text-bold">Business Line</span>
        <q-chip
          clickable
          style="border-color: transparent"
          outline
          dense
          flat
          no-caps
          class="q-ml-md"
          @click="dashboardFilter.BusinessLine = []"
          >Clear</q-chip
        >
        <q-chip
          clickable
          style="border-color: transparent"
          outline
          dense
          flat
          no-caps
          class="q-ml-sm"
          @click="FillArr(dashboardFilter.BusinessLine, optProducts)"
          >Select All</q-chip
        >
      </div>
      <div class="row q-mb-md">
        <q-chip
          v-for="(m, i) in optProducts"
          :key="i"
          clickable
          :class="`filter-chip ${
            dashboardFilter.BusinessLine.indexOf(m) > -1 ? 'active' : ''
          }`"
          @click="SetValueToArr(dashboardFilter.BusinessLine, m)"
          >{{ m.label }}</q-chip
        >
      </div>
      <!--<div class="q-mb-sm q-mt-md">
        <span class="text-h6 text-bold">Functions</span>
        <q-chip
          clickable
          style="border-color: transparent"
          outline
          dense
          flat
          no-caps
          class="q-ml-md"
          @click="dashboardFilter.Function = []"
          >Clear</q-chip
        >
        <q-chip
          clickable
          style="border-color: transparent"
          outline
          dense
          flat
          no-caps
          class="q-ml-sm"
          @click="FillArr(dashboardFilter.Function, user.Functions, 'label')"
          >Select All</q-chip
        >
      </div>
       <div class="row">
        <q-chip
          v-for="(m, i) in user.Functions"
          :key="i"
          clickable
          :class="`filter-chip ${
            dashboardFilter.Function.indexOf(m.label) > -1 ? 'active' : ''
          }`"
          @click="SetValueToArr(dashboardFilter.Function, m.label)"
          >{{ m.label }}</q-chip
        >
      </div> -->
    </QCardSection>
  </QCard>
</template>

<script>
import {
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useNotifs } from "../../store/notifs";
import { useQuasar } from "quasar";
import general from "../../mixins/general";
import { useUser } from "../store/user";
import { useMainStore } from "../store";
//import { useOptions } from "../../store/options";
import { useEvalFilter } from "../../composables/evalFilter";

export default {
  name: "DashboardFilter",
  // components: {
  //   ProfileAvatar: defineAsyncComponent(() => import("../General/ProfileAvatar.vue"))
  // },
  props: {
    toolbar: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "update"],
  setup(props, context) {
    const q = useQuasar();
    const notifs = useNotifs();
    const user = useUser();
    //const options = useOptions();
    const mainStore = useMainStore();
    const { SetValueToArr, FillArr } = general();
    const mobileView = inject("mobileView");
    const GetLocaleString = inject("GetLocaleString");
    const eventBus = inject("eventBus");
    const { optSites, optProducts } = useEvalFilter();

    const dashboardFilter = ref({
      Year: null,
      Site: [],
      SBU: [],
      BusinessLine: [],
      ProductFamily: [],
      Function: [],
    });

    // const optSites = computed(() => {
    //   var x = [];
    //   options.Sites.forEach((e) => {
    //     if (user.Sites.indexOf(e.id) > -1) {
    //       x.push({ ...e });
    //     }
    //   });
    //   return x;
    // });

    // const optProducts = computed(() => {
    //   var x = [];
    //   options.Products.forEach((e) => {
    //     if (user.BusinessLine.indexOf(e.id) > -1) {
    //       x.push({ ...e });
    //     }
    //   });
    //   return x;
    // });

    const SyncFilter = () => {
      mainStore.SyncDashboardFilter(dashboardFilter.value).then(() => {
        context.emit("update");
        eventBus.$emit("updated-dashboard-filter");
      });
    };

    const TestClick = (d) => {
      console.warn("Test Click", d);
    };

    watch(
      dashboardFilter,
      () => {
        nextTick(() => {
          SyncFilter();
        });
      },
      { deep: true }
    );

    watch(
      optSites,
      (newVal) => {
        if (dashboardFilter.value.Site.length === 0 && newVal.length > 0) {
          //dashboardFilter.value.Site.push(newVal[0]);
        }
      },
      { deep: true, immediate: true }
    );

    watch(
      optProducts,
      (newVal) => {
        if (
          dashboardFilter.value.BusinessLine.length === 0 &&
          newVal.length > 0
        ) {
          //dashboardFilter.value.BusinessLine.push(newVal[0]);
        }
      },
      { deep: true, immediate: true }
    );

    onMounted(() => {
      dashboardFilter.value.Year = new Date().getFullYear();
    });

    onBeforeUnmount(() => {
      //eventBus.$off("ws-new-notif", HandleNewNotifs);
    });

    return {
      q,
      notifs,
      GetLocaleString,
      mobileView,
      context,
      user,
      mainStore,
      dashboardFilter,
      optSites,
      optProducts,
      SetValueToArr,
      FillArr,
      SyncFilter,
      TestClick,
    };
  },
};
</script>
