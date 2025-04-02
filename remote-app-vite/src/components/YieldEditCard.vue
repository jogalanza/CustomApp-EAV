<template>
  <MultiView class="yield-edit-card" :title="config.title" @refresh="Refresh" @save="Save" :dirty="dirty" :config="config">
    <template v-slot:history>
      <QList>
        <QItem>
          <QItemSection class="q-px-none">
            <q-tabs v-model="tab" align="justify" narrow-indicator style="width: 100%" dense>
              <q-tab name="fpy" label="First Pass Yield (%)" no-caps />
              <q-tab name="fy" label="Final Yield (%)" no-caps />
              <q-tab name="totalUnits" label="Total Units Started" no-caps />
              <q-tab name="totalProduced" label="Total Units Produced" no-caps />
              <q-tab name="totalGoodFP" label="Total Units Produced Good First Time" no-caps />
              <q-tab name="summary" label="Summary" no-caps />
            </q-tabs>
            <q-markup-table class="card-history" flat>
              <q-tr>
                <q-td class="text-center text-bold text-h6" style="font-size: 0.95rem !important;">{{ CalcGridPeriodHeader(0, slidePointer) }}</q-td>
                <q-td class="text-center text-bold text-h6" style="font-size: 0.95rem !important;">{{ CalcGridPeriodHeader(1, slidePointer) }}</q-td>
                <q-td class="text-center text-bold text-h6" style="font-size: 0.95rem !important;">{{ CalcGridPeriodHeader(2, slidePointer) }}</q-td>
              </q-tr>
              <template v-if="tab === 'summary'">
                <template
                  v-for="(r, i) in config.rowItemConfig.filter(e => (e.view === undefined || (e.view && e.view.indexOf(2) > -1)) && e.group === undefined).sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))"
                  :key="i">
                  <q-tr class="header-row">
                    <q-td colspan="3" class="header" style="font-size: 0.8rem;"><span class="q-pa-sm">{{ r.label }}</span></q-td>
                  </q-tr>
                  <q-tr>
                    <q-td class="text-center text-h6" style="padding: 2px; font-size: 1.1em !important;">{{ CalcGridData(current, history, 0, slidePointer, r.key, r.value) }}</q-td>
                    <q-td class="text-center text-h6" style="padding: 2px; font-size: 1.1em !important;">{{ CalcGridData(current, history, 1, slidePointer, r.key, r.value) }}</q-td>
                    <q-td class="text-center text-h6" style="padding: 2px; font-size: 1.1em !important;">{{ CalcGridData(current, history, 2, slidePointer, r.key, r.value) }}</q-td>
                  </q-tr>
                </template>
              </template>

              <template v-else>
                <template v-for="(r, i) in current.lineItems" :key="i">
                  <q-tr class="header-row">
                    <q-td colspan="3" class="header" style="font-size: 0.8rem;"><span class="q-pa-sm">{{ r.productDescription }}</span></q-td>
                  </q-tr>
                  <q-tr>
                    <q-td class="text-center text-h6" style="padding: 2px; font-size: 1.1em !important;">{{ formatNumber(CalcGridData(current, history, 0, slidePointer, yieldKey, undefined, "lineItems", i)) }}</q-td>
                    <q-td class="text-center text-h6" style="padding: 2px; font-size: 1.1em !important;">{{ formatNumber(CalcGridData(current, history, 1, slidePointer, yieldKey, undefined, "lineItems", i)) }}</q-td>
                    <q-td class="text-center text-h6" style="padding: 2px; font-size: 1.1em !important;">{{ formatNumber(CalcGridData(current, history, 2, slidePointer, yieldKey, undefined, "lineItems", i)) }}</q-td>
                  </q-tr>
                </template>
              </template>

            </q-markup-table>
          </QItemSection>
        </QItem>
        <QItem>
          <QItemSection>
            <q-slider v-model="slidePointer" markers :min="0" :max="10" color="primary" track-color="primary" />
          </QItemSection>
        </QItem>
      </QList>
    </template>

    <q-markup-table class="product-editor" flat>
      <q-tr>
        <q-td class="text-center editor-header" style="font-size: 0.85rem !important; width: 260px"></q-td>
        <q-td class="text-center editor-header" style="font-size: 0.85rem !important;">Total Units Started</q-td>
        <q-td class="text-center editor-header" style="font-size: 0.85rem !important;">Total Units Produced Good First Time</q-td>
        <q-td class="text-center editor-header" style="font-size: 0.85rem !important;">Total Units Produced</q-td>
        <q-td class="text-center editor-header" style="font-size: 0.85rem !important;">First Pass Yield (%)</q-td>
        <q-td class="text-center editor-header" style="font-size: 0.85rem !important;">Final Yield</q-td>
      </q-tr>
      <template v-for="(r, i) in current.lineItems" :key="i">
        <q-tr>
          <q-td class="q-py-none" style="font-size: 0.8rem;">
            <q-select v-model="r.productLineId" :options="products" emit-value map-options option-label="label" option-value="id" dense :readonly="CalcReadOnly" />
          </q-td>
          <q-td class="q-py-none">
            <QInput v-model="r.totalUnitsStarted" hide-bottom-space dense type="number" input-class="card-input text-center" :readonly="CalcReadOnly" />
          </q-td>
          <q-td class="q-py-none">
            <QInput v-model="r.totalUnitsProducedGoodFirstTime" hide-bottom-space dense type="number" input-class="card-input text-center" :readonly="CalcReadOnly" />
          </q-td>
          <q-td class="q-py-none">
            <QInput v-model="r.totalUnitsProduced" hide-bottom-space dense type="number" input-class="card-input text-center" :readonly="CalcReadOnly" />
          </q-td>
          <q-td class="q-py-none text-center text-h6" style="padding: 2px; font-size: 0.9rem !important;">
            {{ Calc_FirstPassYield(r) }}
          </q-td>
          <q-td class="q-py-none text-center text-h6" style="padding: 2px; font-size: 0.9rem !important;">
            {{ Calc_FinalYield(r) }}
          </q-td>
        </q-tr>
      </template>
      <q-tr>
        <q-td style="height: 34px;" class="text-bold">Overall</q-td>
        <q-td class="text-center text-bold">{{ formatNumber(Calc_TotalUnitsStarted) }}</q-td>
        <q-td class="text-center text-bold">{{ formatNumber(Calc_TotalFirstTime) }}</q-td>
        <q-td class="text-center text-bold">{{ formatNumber(Calc_TotalUnitsProduced) }}</q-td>
        <q-td class="text-center text-bold">{{ Calc_FirstPassYield({ totalUnitsStarted: Calc_TotalUnitsStarted, totalUnitsProducedGoodFirstTime: Calc_TotalFirstTime }, true) }}</q-td>
        <q-td class="text-center text-bold">{{ Calc_FinalYield({ totalUnitsStarted: Calc_TotalUnitsStarted, totalUnitsProduced: Calc_TotalUnitsProduced }, true) }}</q-td>
      </q-tr>
      <q-tr>
        <q-td style="height: 34px;" class="text-bold">Overall First Pass Yield Target</q-td>
        <q-td>&nbsp;</q-td>
        <q-td>&nbsp;</q-td>
        <q-td>&nbsp;</q-td>
        <q-td class="text-center text-bold">{{ `${formatNumber(current.firstPassYieldTarget)}%` }}</q-td>
        <q-td>&nbsp;</q-td>
      </q-tr>
    </q-markup-table>

    <QList class="q-mb-lg">
      <!-- <QItem v-if="resultMsg" :class="`q-px-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense
        style="position: absolute; top: 0px; left: 0px; right: 0px; overflow: auto; min-height: 60px; z-index: 10;">
        <QItemSection>
          <QItemLabel class="text-white q-pa-sm">{{ resultMsg.message }}</QItemLabel>
        </QItemSection>
        <QItemSection side class="q-pa-none">
          <QBtn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
        </QItemSection>
      </QItem>-->
      <template v-for="(r, i) in config.rowItemConfig.filter(e => e.view === undefined || (e.view && e.view.indexOf(1) > -1)).sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))" :key="i">
        <template v-if="r.group !== undefined && r.group.length > 0">
          <QItemLabel class="q-pa-none q-px-md q-pt-sm text-bold">{{ r.label }}</QItemLabel>
          <QItem :key="i" :class="`q-pb-none ${(r.type === 'text' && i > 0 ? 'q-pt-none' : '')} ${(r.itemclass || '')}`" dense>
            <QItemSection v-for="(rr, ii) in r.group" :key="`${i}${ii}`">
              <QInput v-if="rr.type === 'input' && !rr.readonly" v-model="current[rr.key]" hide-bottom-space dense :label="rr.label" type="number" input-class="card-input-field"
                :readonly="CalcReadOnly" />
              <QInput v-else-if="rr.type === 'input' && rr.readonly" :model-value="rr.value(current)" hide-bottom-space readonly dense :label="rr.label" input-class="card-input-field" />
              <QItemLabel v-else><span class="text-out-label">{{ `${rr.label} : ` }}</span><span class="text-out-value">{{ rr.value(current) }}</span></QItemLabel>
            </QItemSection>
          </QItem>
        </template>
        <QItem v-else :key="i" :class="`q-pb-none ${(r.type === 'text' && i > 0 ? 'q-pt-none' : '')} ${(r.itemclass || '')}`" dense>
          <QItemSection>
            <QInput v-if="r.type === 'input' && !r.readonly" v-model="current[r.key]" hide-bottom-space dense :label="r.label" type="number" input-class="card-input-field" :readonly="CalcReadOnly" />
            <QInput v-else-if="r.type === 'input' && r.readonly" :model-value="r.value(current)" hide-bottom-space readonly dense :label="r.label" input-class="card-input-field" />
            <QItemLabel v-else><span class="text-out-label">{{ `${r.label} : ` }}</span><span class="text-out-value">{{ r.value(current) }}</span></QItemLabel>
          </QItemSection>
        </QItem>
      </template>
      <QItem v-if="resultMsg" :class="`q-px-sm q-mt-md q-mx-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense style="overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
        <QItemSection>
          <QItemLabel class="text-white q-pa-sm">{{ resultMsg.message }}</QItemLabel>
        </QItemSection>
        <QItemSection side class="q-pa-none">
          <QBtn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
        </QItemSection>
      </QItem>
    </QList>
  </MultiView>
</template>

<style lang="scss">
.yield-edit-card {
  .editor-header {
    white-space: break-spaces;
  }

  .product-editor {
    .q-table {
      table-layout: fixed;
    }

    td {
      padding-top: 0px !important;
      padding-bottom: 0px !important;

      .q-field__control {
        height: 34px;
        min-height: 34px;
      }

      .q-field__native {
        min-height: 34px;
      }
    }
  }

  .q-tab__label {
    white-space: break-spaces;
  }
}
</style>

<script>
import { computed, defineAsyncComponent, defineComponent, nextTick, onMounted, ref, watch, inject } from "vue";
import { useCalc } from "../composables/calc";
import general from "../mixins/general";
import api from "../api/lookup";

export default defineComponent({
  name: "YieldEditCard",
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      default: ""
    }
  },
  components: {
    MultiView: defineAsyncComponent(() =>
      import("../components/General/MultiView.vue")
    ),
  },
  setup(props) {
    const CalcReadOnly = inject("CalcReadOnly");
    const { CalcGridData, CalcGridPeriodHeader } = useCalc();
    const { formatNumber } = general();
    const { NotifyUser } = general();
    const dirty = ref(false);
    const slidePointer = ref(10);
    const resultMsg = ref(null);
    const tab = ref("summary");
    const history = ref([]);
    const products = ref([]);

    const current = ref({
      prop1: 1200, prop2: 2200, prop3: 3200
    });

    const yieldKey = computed(() => {
      if (tab.value === "fpy") return "firstPassYield";
      else if (tab.value === "fy") return "finalYield";
      else if (tab.value === "totalUnits") return "totalUnitsStarted";
      else if (tab.value === "totalProduced") return "totalUnitsProduced";
      return "totalUnitsProducedGoodFirstTime"
    });

    watch(() => current.value, () => {
      dirty.value = true;
    }, { deep: true });

    const ProductLookup = () => {
      api.GetProductsSelect().then(response => {
        products.value = response.data;
      });
    }

    const Calc_FirstPassYield = (data, isTotal) => {
      var x = parseFloat(data.totalUnitsStarted) || 0;
      var y = x === 0 ? 0 : (parseFloat(data.totalUnitsProducedGoodFirstTime) || 0) * 100 / x;
      if (isTotal) current.value.firstPassYield = y.toFixed(0);
      return `${formatNumber(y, 0)}%`;
    }

    const Calc_FinalYield = (data, isTotal) => {
      var x = parseFloat(data.totalUnitsStarted) || 0;
      var y = x === 0 ? 0 : (parseFloat(data.totalUnitsProduced) || 0) * 100 / x;
      if (isTotal) current.value.finalYield = y.toFixed(0);
      return `${formatNumber(y, 0)}%`;
    }

    const Calc_TotalUnitsStarted = computed(() => {
      var x = 0;
      if (current.value.lineItems) {
        current.value.lineItems.map(e => {
          x += parseFloat(e.totalUnitsStarted) || 0;
        });
      }

      return x;
    });

    const Calc_TotalFirstTime = computed(() => {
      var x = 0;
      if (current.value.lineItems) {
        current.value.lineItems.map(e => {
          if (e.totalUnitsStarted > 0) {
            x += parseFloat(e.totalUnitsProducedGoodFirstTime) || 0;
          }
        });
      }

      return x;
    });

    const Calc_TotalUnitsProduced = computed(() => {
      var x = 0;
      if (current.value.lineItems) {
        current.value.lineItems.map(e => {
          if (e.totalUnitsStarted > 0) {
            x += parseFloat(e.totalUnitsProduced) || 0;
          }
        });
      }

      return x;
    });

    const GetCurrent = () => {
      if (props.config.GetCurrent !== undefined && typeof props.config.GetCurrent === 'function') {
        props.config.GetCurrent().then(response => {
          current.value = { ...response };
          nextTick(() => {
            dirty.value = false;
          });
        });
      }
    }

    const GetHistory = () => {
      if (props.config.GetHistory !== undefined && typeof props.config.GetHistory === 'function') {
        props.config.GetHistory().then(response => {
          history.value = { ...response };
        });
      }
    }

    const Save = () => {
      resultMsg.value = null;
      if (props.config.Save !== undefined && typeof props.config.Save === 'function') {
        props.config.Save(current.value).then(response => {
          resultMsg.value = response;
          if (response.success) {
            GetCurrent();
            setTimeout(() => {
              resultMsg.value = null;
            }, 2500);
          }
        });
        return;
      }
    }

    const GetGridData = (offset, key, callback) => {
      return CalcGridData(current.value, history.value, offset, slidePointer.value, key, callback);
    }

    const GetPeriodHeader = (offset) => {
      return CalcGridPeriodHeader(offset, slidePointer.value);
    }
    const Refresh = () => {
      GetCurrent();
      GetHistory();
    }

    onMounted(() => {
      Refresh();
      ProductLookup();
    })

    return {
      CalcReadOnly,
      products,
      history,
      current,
      dirty,
      slidePointer,
      resultMsg,
      NotifyUser,
      tab,
      yieldKey,
      Refresh,
      Save,
      GetGridData,
      GetPeriodHeader,
      CalcGridData,
      CalcGridPeriodHeader,
      Calc_FirstPassYield,
      Calc_FinalYield,
      formatNumber,
      Calc_TotalUnitsStarted,
      Calc_TotalFirstTime,
      Calc_TotalUnitsProduced
    };
  },
});
</script>
