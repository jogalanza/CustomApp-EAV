<template>
  <div>
    <q-card :class="`multiview-card ${(view === 'grid' ? 'grid-mode' : '')}`" :flat="view === 'grid'">
      <q-tab-panels v-model="localView" style="height: 100%">
        <q-tab-panel name="chart" class="q-pa-none" style="padding: 0px">
          <slot name="chart">
            <GraphCard ref="graphcard" :options="graphopts" :override="override" :chartid="id" :extramenu="extramenu" />
          </slot>
        </q-tab-panel>
        <q-tab-panel name="default" class="q-pa-none" style="padding: 0px">
          <q-carousel v-model="localSlide" transition-prev="slide-right" transition-next="slide-left" animated style="height: 100%">
            <q-carousel-slide name="history" class="q-pa-none">
              <slot name="history-toolbar">
                <q-toolbar class="chart-toolbar">
                  <div class="card-title">{{ `${title}: History` }}</div>
                  <q-btn flat icon="o_arrow_forward" dense @click="localSlide = 'main'" />
                </q-toolbar>
              </slot>
              <slot name="history">History</slot>
            </q-carousel-slide>
            <q-carousel-slide name="main" class="q-pa-none">
              <slot name="default-toolbar">
                <q-toolbar class="chart-toolbar">
                  <q-btn v-if="withHistory" flat icon="o_history" dense @click="localSlide = 'history'"><q-tooltip>History</q-tooltip></q-btn>
                  <div class="card-title">
                    <div>{{ title }}</div>
                    <div v-if="subtitle">{{ subtitle }}</div>
                  </div>
                  <!-- <q-btn v-if="dirty" flat icon="r_save" color="green" no-wrap no-caps dense @click="InvokeSave"><q-tooltip>Save Changes</q-tooltip></q-btn> -->
                  <q-btn flat icon="o_refresh" dense @click="InvokeRefresh">
                    <q-tooltip>{{ `${(dirty ? 'Cancel changes' : 'Refresh')}` }}</q-tooltip>
                    <q-badge rounded floating color="red" />
                  </q-btn>
                  <q-btn v-if="extramenu && extramenu.length > 0" icon="o_more_vert" flat dense>
                    <q-menu auto-close>
                      <q-list>
                        <q-item v-for="(m, i) in extramenu" :key="i" clickable @click="m.action" dense>
                          <q-item-section>{{ m.label }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-toolbar>
              </slot>
              <slot name="default"></slot>
              <q-toolbar v-if="dirty">
                <q-space />
                <q-btn  color="green" :label="`Save changes`" no-wrap no-caps @click="InvokeSave" unelevated><q-tooltip>Save Changes</q-tooltip></q-btn>
              </q-toolbar>
            </q-carousel-slide>
          </q-carousel>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, ref, watch, inject, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useMainStore } from "../../store";

import GraphCard from "@/components/General/GraphCard.vue";

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
    chartid: {
      type: Number,
      default: 0,
    },
    extramenu: {
      type: Array,
      default: () => [],
    },
    withHistory: {
      type: Boolean,
      default: true
    },
    override: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    GraphCard
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

      console.warn("multiview-card invoke resfresh", localView.value, graphcard.value)
      if (localView.value === "chart" && graphcard.value) {
        graphcard.value.RefreshChart();
      } else {
        ctx.emit("refresh");
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

      InvokeRefresh();
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