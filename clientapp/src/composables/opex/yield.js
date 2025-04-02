import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  inject
} from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useOpexYield(overrideOpts) {
  const override = ref(overrideOpts);
  const mainStore = useMainStore();
  const { CalcGridData, CalcGridPeriodHeader } = useCalc();
  const { formatNumber } = general();
  const dirty = ref(false);
  const slidePointer = ref(10);
  const loading = ref(false);
  const resultMsg = ref(null);
  const eventBus = inject("eventBus");

  const cancelTokenCurrent = ref(null);
  const cancelTokenHistory = ref(null);

  const component = ref("YieldEditCard");
  const title = ref("Yield / Rework");
  const dataConfig = ref({
    dataApi: "svc/opex/data/yield/current",
    historyApi: "svc/opex/data/yield/history",
    saveApi: "svc/opex/data/yield/save",
  });
  const graphopts = ref({
    title: "Yield / Rework",
    dataApi: "svc/opex/graph/yield/",
    commentApi: "svc/opex/comment/yield",
    commentApiSave: "svc/opex/comment/save/yield",
    remarkType: [2, 3],
    toggleView: {
      dataApi: "svc/opex/graph/yield/?pm=1",
      label: "View per Product Line",
      visible: (session) => {
        return session?.Consolidated === false;
      }
    }
  });

  const history = ref([]);

  const current = ref({});

  const cardIndex = ref(10000);

  watch(
    () => current.value,
    () => {
      dirty.value = true;
    },
    { deep: true }
  );

  const extraMenu = ref([
    {
      label: "View edit history",
      action: () => {
        eventBus.$emit("show-edit-history", {
          title: title.value,
          category: "FIRST_PASS_YIELD_REWORK",
        });
      },
    },
  ]);

  const cardCalcClass = computed(() => {
    if (mainStore.DashboardView === "default") {
      return "col-12 col-md-8 col-lg-6";
    }
    return "";
  });

  const rowItemConfig = ref([
    {
      label: "Final Yield (%)",
      key: "finalYield",
      type: "text",
      value: (data) => {
        return formatNumber(data.finalYield || 0);
      },
      view: [2]
    },
    {
      label: "First Pass Yield (%)",
      key: "firstPassYield",
      type: "text",
      value: (data) => {
        return formatNumber(data.firstPassYield || 0);
      },
      view: [2]
    },
    {
      label: "First Pass Yield Target (%)",
      key: "firstPassYieldTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.firstPassYieldTarget || 0);
      },
      view: [2]
    },
    {
      label: "Rework Hours",
      key: "reworkHours",
      type: "input",
      value: (data) => {
        return formatNumber(data.reworkHours || 0);
      },
    },
    {
      label: "Rework Target",
      key: "reworkTarget",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(data.reworkTarget || 0);
      },
    },

    {
      label: "Total Units Started",
      key: "totalUnitsStarted",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(data.totalUnitsStarted || 0);
      },
      view: [2]
    },

    {
      label: "Total Units Produced",
      key: "totalUnitsProduced",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(data.totalUnitsProduced || 0);
      },
      view: [2]
    },

    {
      label: "Total Units Produced Good First Time",
      key: "totalUnitsProducedGoodFirstTime",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(data.totalUnitsProducedGoodFirstTime || 0);
      },
      view: [2]
    },
    
    
  ]);

  const GetCurrent = () => {
    return new Promise((resolve) => {
      loading.value = true;

      if (cancelTokenCurrent.value) cancelTokenCurrent.value.cancel();

      cancelTokenCurrent.value = axios.CancelToken.source();

      server
        .post(
          dataConfig.value.dataApi,
          {
            session: mainStore.SessionOptions,
          },
          {
            cancelToken: cancelTokenCurrent.value.token,
          }
        )
        .then((response) => {
          loading.value = false;
          current.value = { ...response.data.result };
          resolve(current.value);
          nextTick(() => {
            dirty.value = false;
          });
        })
        .catch(() => {
          loading.value = false;
          
        });
    });
  };

  const GetHistory = () => {
    return new Promise((resolve) => {
      if (cancelTokenHistory.value) cancelTokenHistory.value.cancel();

      cancelTokenHistory.value = axios.CancelToken.source();

      server
        .post(
          dataConfig.value.historyApi,
          {
            session: mainStore.SessionOptions,
          },
          {
            cancelToken: cancelTokenHistory.value.token,
          }
        )
        .then((response) => {
          history.value = { ...response.data.result };
          resolve(history.value);
        })
        .catch(() => {
          
        });
    });
  };

  const EvalPostData = (data) => {
    return { ...data };
  };

  const Save = (data) => {
    loading.value = true;
    resultMsg.value = null;
    return new Promise((resolve) => {
      server
        .post(dataConfig.value.saveApi, {
          session: mainStore.SessionOptions,
          data: data === undefined ? current.value : EvalPostData(data),
        })
        .then((response) => {
          //NotifyUser(response.data);
          loading.value = false;
          resultMsg.value = response.data;
          resolve(response.data);
          if (response.data.success && data === undefined) GetCurrent();

          setTimeout(() => {
            resultMsg.value = null;
          }, 3500);
        })
        .catch(() => {
          loading.value = false;
          
        });
    });
  };

  const GetGridData = (offset, key, callback) => {
    return CalcGridData(
      current.value,
      history.value,
      offset,
      slidePointer.value,
      key,
      callback
    );
  };

  const GetPeriodHeader = (offset) => {
    return CalcGridPeriodHeader(offset, slidePointer.value);
  };

  const Refresh = () => {
    GetCurrent();
    GetHistory();
  };

  const BowlerQualityYield = () => {
    const kpi = "QUALITY: Yield %";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.MonthlyResult[index].Plan?.toFixed(1);

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(1)}`;
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";

      if (bowlerData.value.Gap < 0)
        return "color: #ff0000;";

      return ``;
    };

    const getCellStyle = (index, opts) => {
      if (!bowlerData.value) return "";
      if (opts === undefined && bowlerData.value.MonthlyResult[index].IsFuturePeriod) return "locked-period";

      if (opts) {
        if (opts?.ytd) {
          if (
            bowlerData.value.YTDActual < bowlerData.value.YTDPlan 
          )
            return "background: #ff0000 !important; color: #FFFFFF;";

          return "background: #51b44b !important;";
        }
      }

      if (
        bowlerData.value.MonthlyResult[index].Actual <
        bowlerData.value.MonthlyResult[index].Plan
      )
        return "background: #ff0000 !important; color: #FFFFFF;";

      return "background: #51b44b !important;";
    };

    const Refresh = () => {
      loading.value = true;

      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

      return new Promise((resolve) => {
        server
          .post(`svc/opex/bowler/yield/qualityyield`, {
            session: mainStore.SessionOptions,
          }, {
            cancelToken: cancelToken.value.token
          })
          .then((response) => {
            loading.value = false;
            bowlerData.value = { ...response.data };
            resolve(bowlerData.value);
          })
          .catch(() => {
            loading.value = false;
            bowlerData.value = null;
            
          });
      });
    };

    const GetGraphOpts = () => {
      return graphopts.value;
    };

    return {
      kpi,
      loading,
      bowlerData,
      GetGraphOpts,
      formatValue,
      getGapCellStyle,
      getCellStyle,
      Refresh,
    };
  };

  onMounted(() => {
    //console.warn("useCorporateQuality mounted", mode.value);
    // eventBus.$on("refresh", Refresh);
    // Refresh();
  });

  onBeforeUnmount(() => {
    //eventBus.$off("refresh", Refresh);
  });

  return {
    override,
    title,
    component,
    dataConfig,
    graphopts,
    dirty,
    slidePointer,
    history,
    current,
    rowItemConfig,
    loading,
    resultMsg,
    extraMenu,
    cardCalcClass,
    cardIndex,
    GetCurrent,
    GetHistory,
    EvalPostData,
    Save,
    GetGridData,
    GetPeriodHeader,
    Refresh,
    BowlerQualityYield,
  };
}
