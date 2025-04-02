<template>
  <MultiView :title="config.title" @refresh="Refresh" @save="Save" :dirty="dirty" :config="config">
    <template v-slot:history>
      <q-list>
        <q-item>
          <q-item-section class="q-px-none">
            <q-markup-table class="card-history" flat>
              <q-tr>
                <q-td class="text-center text-bold text-h6" style="font-size: 0.95rem !important;">{{ CalcGridPeriodHeader(0, slidePointer) }}</q-td>
                <q-td class="text-center text-bold text-h6" style="font-size: 0.95rem !important;">{{ CalcGridPeriodHeader(1, slidePointer) }}</q-td>
                <q-td class="text-center text-bold text-h6" style="font-size: 0.95rem !important;">{{ CalcGridPeriodHeader(2, slidePointer) }}</q-td>
              </q-tr>
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
            </q-markup-table>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-slider v-model="slidePointer" markers :min="0" :max="10" color="primary" track-color="primary" />
          </q-item-section>
        </q-item>
      </q-list>
    </template>

    <q-list class="q-mb-lg">
      <!-- <q-item v-if="resultMsg" :class="`q-px-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense
        style="position: absolute; top: 0px; left: 0px; right: 0px; overflow: auto; min-height: 60px; z-index: 10;">
        <q-item-section>
          <q-item-label class="text-white q-pa-sm">{{ resultMsg.message }}</q-item-label>
        </q-item-section>
        <q-item-section side class="q-pa-none">
          <q-btn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
        </q-item-section>
      </q-item> -->
      <template v-for="(r, i) in config.rowItemConfig.filter(e => e.view === undefined || (e.view && e.view.indexOf(1) > -1)).sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))" :key="i">
        <template v-if="r.group !== undefined && r.group.length > 0">
          <q-item-label class="q-pa-none q-px-md q-pt-sm text-bold">{{ r.label }}</q-item-label>
          <q-item :key="i" :class="`q-pb-none ${(r.type === 'text' && i > 0 ? 'q-pt-none' : '')} ${(r.itemclass || '')}`" dense>
            <q-item-section v-for="(rr, ii) in r.group" :key="`${i}${ii}`">
              <q-input v-if="rr.type === 'input' && !rr.readonly" v-model="current[rr.key]" hide-bottom-space dense :label="rr.label" type="number" @blur="HandleBlankValue(rr.key)" input-class="card-input-field" :readonly="CalcReadOnly" />
              <q-input v-else-if="rr.type === 'input' && rr.readonly" :model-value="rr.value(current)" hide-bottom-space readonly dense :label="rr.label" input-class="card-input-field" />
              <q-item-label v-else><span class="text-out-label">{{ `${rr.label} : ` }}</span><span class="text-out-value">{{ rr.value(current) }}</span></q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <q-item v-else :key="i" :class="`q-pb-none ${(r.type === 'text' && i > 0 ? 'q-pt-none' : '')} ${(r.itemclass || '')}`" dense>
          <q-item-section>
            <q-input v-if="r.type === 'input' && !r.readonly" v-model="current[r.key]" hide-bottom-space dense :label="r.label" type="number" @blur="HandleBlankValue(r.key)" input-class="card-input-field"
              :readonly="CalcReadOnly" />
            <q-input v-else-if="r.type === 'input' && r.readonly" :model-value="r.value(current)" hide-bottom-space readonly dense :label="r.label" input-class="card-input-field" />
            <q-item-label v-else><span class="text-out-label">{{ `${r.label} : ` }}</span><span class="text-out-value">{{ r.value(current) }}</span></q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <q-item v-if="resultMsg" :class="`q-px-sm q-mt-md q-mx-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense
        style="overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
        <q-item-section>
          <q-item-label class="text-white q-pa-sm">{{ resultMsg.message }}</q-item-label>
        </q-item-section>
        <q-item-section side class="q-pa-none">
          <q-btn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
        </q-item-section>
      </q-item>
    </q-list>
  </MultiView>
</template>

<script>
import { defineAsyncComponent, defineComponent, inject, nextTick, onMounted, ref, watch } from "vue";
import { useCalc } from "@/composables/calc";
import general from "@/mixins/general";
import { useMainStore } from "@/store/index";
import { useUser } from "@/store/user"

export default defineComponent({
  name: "DefaultEditCard",
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
      import("@/components/General/MultiView.vue")
    ),
  },
  setup(props) {
    const { CalcGridData, CalcGridPeriodHeader } = useCalc();
    const mainStore = useMainStore();
    const { NotifyUser } = general();
    const dirty = ref(false);
    const slidePointer = ref(10);
    const resultMsg = ref(null);
    const user = useUser();

    const history = ref([]);

    const current = ref({
      prop1: 1200, prop2: 2200, prop3: 3200
    });

    const CalcReadOnly = inject("CalcReadOnly");

    watch(() => current.value, () => {
      dirty.value = true;
    }, { deep: true });

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
            }, 3000);
          }
        });
        return;
      }
    }

    const HandleBlankValue = (key) => {
      if (current.value[key] === undefined || current.value[key] === null || current.value[key] === '') {
        current.value[key] = 0;
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
      if (mainStore.DashboardView !== "chart") {
        Refresh();
      }
    })

    return {
      user,
      mainStore,
      history,
      current,
      dirty,
      slidePointer,
      resultMsg,
      NotifyUser,
      Refresh,
      Save,
      GetGridData,
      GetPeriodHeader,
      CalcGridData,
      CalcGridPeriodHeader,
      CalcReadOnly,
      HandleBlankValue
    };
  },
});
</script>
