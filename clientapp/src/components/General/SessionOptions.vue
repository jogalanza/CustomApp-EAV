<template>
  <q-dialog v-model="dialog">
    <q-card>
      <!-- <q-toolbar>
                <q-space />
                <q-btn flat round icon="o_close" dense @click="dialog = false" />                
            </q-toolbar> -->
      <q-card-section>
        <q-list>
          <q-item class="q-pt-none">
            <q-item-section>
              <q-item-label class="text-h5 text-bold"
                >Session Options</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-select
                v-model="sessionopt.Site"
                label="Site"
                :options="optSites"
                option-value="SiteId"
                option-label="SiteName"
                dense
                filled
              />
            </q-item-section>
          </q-item>
          <q-item v-if="yearOnly">
            <q-item-section>
              <q-item-label>
                <q-select
                  v-model="sessionopt.Year"
                  label="Year"
                  :options="mainStore.ReviewYears"
                  dense
                  filled
                />
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-else>
            <q-item-section>
              <q-item-label>
                <q-select
                  v-model="sessionopt.Period"
                  :label="sessionopt.UseOpenPeriod ? 'Period (Open)' : 'Period (Closed)'"
                  :options="periods"
                  option-value="PERIOD_ID"
                  option-label="DESCRIPTION"
                  dense
                  filled
                />
              </q-item-label>
              <q-item-label>
                <q-toggle
                  v-model="sessionopt.UseOpenPeriod"
                  :label="sessionopt.UseOpenPeriod ? 'Show Open Periods' : 'Show Closed Periods'"
                />
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label class="flex">
                <q-space />
                <q-btn label="Apply Settings" no-caps color="green" @click="UpdateSessionOpt" />
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, onMounted, ref, watch } from "vue";
import { useMainStore } from "../../store";
import { useEvalFilter } from "../../composables/evalFilter";

export default defineComponent({
  name: "SessionOptions",
  props: {
    yearOnly: {
      type: Boolean,
      default: false,
    }
  },
  setup() {
    const mainStore = useMainStore();
    const { optSites, optPeriods,GetPeriodOpts } = useEvalFilter();
    const dialog = ref(false);
    const sessionopt = ref({
      Site: null,
      Year: 0,
      Period: null,
      Consolidated: false,
      UseOpenPeriod : true
    });
    const closedPeriod = ref(false);
    const periods = ref([]);
    const periodYears = ref([]);
    const skip = ref(false);

    //sessionopt.value.Year = new Date().getFullYear();

    const Show = () => {
      skip.value = true;
      sessionopt.value = {...mainStore.SessionOptions};
      if (sessionopt.value.Year === 0) sessionopt.value.Year = new Date().getFullYear();

      dialog.value = true;
      setTimeout(() => {
        skip.value = false;
      }, 2000);
    };

    watch(
      () => optSites.value,
      (newVal) => {
        if (newVal.length > 0 && !sessionopt.value.Site){
          sessionopt.value.Site = {...newVal[0]};
        }
      },
      { deep: true }
    );

    watch(
      () => optPeriods.value,
      (newVal) => {
        if (newVal.length > 0){
          //sessionopt.value.Period = {...newVal[0]};
          EvalPeriodOpts();
        }
      },
      { deep: true }
    );

    watch(() => sessionopt.value.UseOpenPeriod, (newVal, oldVal) => {
      if (newVal !== oldVal){
        EvalPeriodOpts();
      }
    }, { deep: true });

    const EvalPeriodOpts = () => {
      periods.value = GetPeriodOpts(sessionopt.value.UseOpenPeriod);

      if (periods.value.length > 0){
        //&& !skip.value
        sessionopt.value.Period = periods.value[0];
      }

      skip.value = false;
    }

    const UpdateSessionOpt = () => {
      console.warn("watch session", sessionopt.value);
      mainStore.SyncSessionOptions(sessionopt.value);
      dialog.value = false;
    }


    onMounted(() => {
      EvalPeriodOpts();
    });

    return {
      dialog,
      sessionopt,
      mainStore,
      optSites,
      optPeriods,
      closedPeriod,
      periods,
      periodYears,
      Show,
      UpdateSessionOpt,
      EvalPeriodOpts,
    };
  },
});
</script>