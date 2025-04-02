<template>
  <div>
    <q-card :class="`multiview-card ${(view === 'grid' ? 'grid-mode' : '')}`" :flat="view === 'grid'">
      <q-tab-panels v-model="localView">
        <q-tab-panel name="chart" class="q-pa-none" style="padding: 0px">
          <slot name="chart">
            <GraphCard ref="graphcard" :options="graphopts" :override="override" />
          </slot>
        </q-tab-panel>
        <q-tab-panel name="default" class="q-pa-none" style="padding: 0px">
          <q-carousel v-model="localSlide" transition-prev="slide-right" transition-next="slide-left" animated style="height: 100%" >
            <q-carousel-slide name="history" class="q-pa-none">
              <slot name="history-toolbar">
                <q-toolbar>
                  <div class="card-title">{{ title }}</div>
                  <q-btn round flat icon="o_arrow_forward" dense @click="localSlide = 'main'" />
                </q-toolbar>
              </slot>
              <slot name="history">History</slot>
            </q-carousel-slide>
            <q-carousel-slide name="main" class="q-pa-none">
              <slot name="default-toolbar">
                <q-toolbar>
                  <q-btn round flat icon="o_history" dense @click="localSlide = 'history'"><q-tooltip>History</q-tooltip></q-btn>
                  <div class="card-title">{{ title }}</div>
                  <q-btn v-if="dirty" round flat icon="o_save" dense @click="InvokeSave"><q-tooltip>Save Changes</q-tooltip></q-btn>
                  <q-btn round flat icon="o_refresh" dense @click="InvokeRefresh"><q-tooltip>Refresh</q-tooltip></q-btn>
                </q-toolbar>
              </slot>
              <slot name="default"></slot>
            </q-carousel-slide>
          </q-carousel>
        </q-tab-panel>
        <q-tab-panel name="grid">
          <slot name="grid"></slot>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script>
import { defineAsyncComponent, defineComponent, ref, watch, inject, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useMainStore } from "../../store";

export default defineComponent({
  name: "MultiView",
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      default: "Title",
    },
    chartTitle: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    drawerRight: {
      type: Boolean,
      default: false,
    },
    view: {
      type: String,
      default: "default",
    },
    graphopts: {
      type: Object,
      default: () => ({}),
    },
    dirty: {
      type: Boolean,
      default: false
    },
    override: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    GraphCard: defineAsyncComponent(() =>
      import("@/components/General/GraphCard.vue")
    ),
  },
  emits: ["refresh", "save"],
  setup(props, ctx) {
    const mainStore = useMainStore();
    const eventBus = inject("eventBus");
    const graphcard = ref(null);
    const showRightDrawer = ref(false);
    const tab = ref("default");
    const localView = ref("chart");
    const localSlide = ref("main");

    watch(
      () => mainStore.SessionOptions,
      () => {
        if (mainStore.SessionOptions.Consolidated) {
          InvokeRefresh();
        } else if (mainStore.SessionOptions.Period && mainStore.SessionOptions.Site) {
          InvokeRefresh();
        }
      },
      { deep: true }
    );

    watch(() => mainStore.DashboardView, () => {
      nextTick(() => {
        InvokeRefresh();
      });
    });

    watch(
      () => props.drawerRight,
      (newVal) => {
        showRightDrawer.value = newVal;
      },
      { immediate: true }
    );

    watch(
      () => props.view,
      (newVal) => {
        localView.value = newVal;
      },
      { immediate: true }
    );

    const InvokeRefresh = () => {
      ctx.emit("refresh");
      if (localView.value === "chart" && graphcard.value) {
        graphcard.value.RefreshChart();
      }
    }

    const InvokeSave = () => {
      ctx.emit("save");
    }

    const EvalCardUpdate = (_data) => {
      try {
        var data = JSON.parse(_data);
        var s = { ...data.session };
        console.warn("EvalCardUpdate", data.keys, data, mainStore.SessionOptions, props.options, props.options.key && data.keys && data.keys.indexOf(props.options.key) > -1);        
        if (props.options.key && data.keys && data.keys.indexOf(props.options.key) > -1) {
          if (mainStore.SessionOptions.Consolidated && mainStore.SessionOptions.Period.PERIOD_ID == s.Period.PERIOD_ID) {
            InvokeRefresh();
          } else if (!mainStore.SessionOptions.Consolidated && mainStore.SessionOptions.Period.PERIOD_ID == s.Period.PERIOD_ID && mainStore.SessionOptions.Site.SiteId == s.Site.SiteId) {
            InvokeRefresh();
          }
        }
      } catch {
        //
      }

    }

    onMounted(() => {
      eventBus.$on("refresh-dashboard-items", InvokeRefresh);
      eventBus.$on("hub-update-card", EvalCardUpdate);
    });

    onBeforeUnmount(() => {
      eventBus.$off("refresh-dashboard-items", InvokeRefresh);
      eventBus.$off("hub-update-card", EvalCardUpdate);
    });

    return {
      graphcard,
      tab,
      showRightDrawer,
      localView,
      localSlide,
      InvokeRefresh,
      InvokeSave,
    };
  },
});
</script>

<style lang="scss">
.multiview-card {
  min-height: 400px;

  &.grid-mode {
    min-height: 0px;

  }

  // height: 100%;

  .q-carousel {
    .q-panel {
      overflow: hidden;
    }
  }
}
</style>