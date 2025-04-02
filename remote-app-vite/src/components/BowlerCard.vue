<template>
  <div>
    <QCard :class="`bowler-card multiview-card ${(view === 'grid' ? 'grid-mode' : '')}`">
      <QToolbar class="chart-toolbar">
        <q-spinner v-if="data.loading || !data.bowlerData || !IsSessionReady" color="white" size="24px" class="q-mr-sm" />
        <div class="card-title">{{ `${title}` }}</div>
      </QToolbar>
      <QCardSection>
        <q-markup-table flat>
          <q-tr>
            <q-td></q-td>
            <q-td class="text-center text-bold">Plan</q-td>
            <q-td class="text-center text-bold">Actual</q-td>
          </q-tr>
          <q-tr>
            <q-td class="text-bold">Previous Year</q-td>
            <q-td colspan="2" class="text-center">{{ `${(data.formatActual !== undefined ? data.formatActual(false) : formatNumber(data.bowlerData?.PrevYearActual, 0, { accounting: true }) ?? '0')}`
              }}</q-td>
          </q-tr>
          <q-tr>
            <q-td class="text-bold" v-html="`FY${(mainStore.SessionOptions.Year)} Plan`"></q-td>
            <q-td colspan="2" class="text-center"> {{ `${(data.formatActual !== undefined ? data.formatActual() : formatNumber(data.bowlerData?.CurrentYearPlan, 0, { accounting: true }) ?? '0')}`
              }}</q-td>
          </q-tr>
          <q-tr>
            <q-td class="text-bold">YTD</q-td>
            <q-td class="text-center"> {{ `${(data.formatYTD !== undefined ? data.formatYTD() : formatNumber(data.bowlerData?.YTDPlan, 0, { accounting: true }) ?? '0')}` }}</q-td>
            <q-td class="text-center" :style="`text-align: center; ${data.getCellStyle(0, { ytd: true })}`"> {{ `${(data.formatYTD !== undefined ? data.formatYTD(false) : formatNumber(data.bowlerData?.YTDActual, 0, { accounting: true }) ?? '0')}` }}</q-td>
          </q-tr>
          <q-tr>
            <q-td class="text-bold">Gap</q-td>
            <q-td colspan="2" class="text-center" :style="`text-align: center; ${(data.getGapCellStyle !== undefined ? data.getGapCellStyle() : `${(data.bowlerData?.Gap < 0 ? 'color: #ff0000;' : '')}`)}`"> {{ `${(data.formatGap !== undefined ? data.formatGap() : formatNumber(data.bowlerData?.Gap, 0, { accounting: true }) ?? '0')}` }}</q-td>
          </q-tr>
          <q-tr>
            <q-td class="text-bold">% Achieved</q-td>
            <q-td colspan="2" class="text-center"> {{ `${(data.formatAchieved !== undefined ? data.formatAchieved() : formatNumber(data.bowlerData?.Achieved, 0, { accounting: true, suffix: "%" }) ?? '0')}` }}</q-td>
          </q-tr>

          <q-tr v-for="(p, i) in calcBowlerPeriod" :key="`${p}-${i}`">
            <q-td class="text-bold">{{ p }}</q-td>
            <q-td class="text-center">{{ data.formatValue(i) }}</q-td>
            <q-td class="text-center" :style="`text-align: center; ${data.getCellStyle(i)}`">{{ data.formatValue(i, false) }}</q-td>
          </q-tr>

          <q-tr v-if="data.bowlerData">
            <q-td colspan="3" style="padding: 5px; background: rgba(0, 0, 0, 0.1); border-radius: 0px;">
              <BowlerComment :model-value="data.bowlerData.Comments" @update="data.Refresh" :hide-control="exportMode" :readonly="CalcReadOnly" :opts="{ title: data.kpi }" />
            </q-td>
          </q-tr>
        </q-markup-table>
      </QCardSection>
    </QCard>
  </div>
</template>

<script>
import { defineComponent, ref, watch, inject, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import { useMainStore } from "../store";
import general from "../mixins/general";
import BowlerComment from "../components/BowlerComment.vue";

export default defineComponent({
  name: "BowlerCard",
  props: {
    data: {
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
  },
  components: {
    BowlerComment
  },
  emits: ["refresh", "save"],
  setup(props, ctx) {
    const mainStore = useMainStore();
    const eventBus = inject("eventBus");
    const IsSessionReady = inject("IsSessionReady");
    const graphcard = ref(null);
    const showRightDrawer = ref(false);
    const tab = ref("default");
    const localView = ref("chart");
    const localSlide = ref("main");
    const { formatNumber } = general();

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

    const calcBowlerPeriod = computed(() => {

      var x = [];

      if (mainStore.SessionOptions.Period) {
        mainStore.BowlerPeriods.map((e, i) => {
          if (i <= mainStore.SessionOptions.Period.PERIOD_MONTH - 1) {
            x.push(e);
          }
        });
      }


      return x;
    })

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
        console.warn("EvalCardUpdate", data.keys, data, mainStore.SessionOptions, props.data, props.data.key && data.keys && data.keys.indexOf(props.data.key) > -1);
        if (props.data.key && data.keys && data.keys.indexOf(props.data.key) > -1) {
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
      mainStore,
      formatNumber,
      calcBowlerPeriod,
      IsSessionReady
    };
  },
});
</script>

<style lang="scss">
.bowler-card{
  .q-td{
    border: 1px solid #eee;
    font-size: 1.1em;
  }

  .bowler-comment{
    min-height: 120px !important;
    max-height: 600px !important;

    .comment-container-item{

    }

    .q-editor__content{
      background: #e5e5e5;
    }

    .comment-container{
      max-height: 100vh !important;
      height: 100% !important;
    }
  }
}
.multiview-card {
  min-height: 400px;

  &.grid-mode {
    min-height: 0px;

  }

  // height: 100%;

  .QCarousel {
    .q-panel {
      overflow: hidden;
    }
  }
}
</style>