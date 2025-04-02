import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "../server.js";
import { useMainStore } from "../store/index";
import { useCalc } from "../composables/calc";
import axios from "axios";
import general from "../mixins/general";

export default function useOpexEEI(overrideOpts) {
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

  const component = ref(null);
  const title = ref("Environmental Efficiency Index");
  const dataConfig = ref({
    dataApi: "svc/opex/data/eei/current",
    historyApi: "svc/opex/data/eei/history",
    saveApi: "svc/opex/data/eei/save",
  });
  const graphopts = ref({
    title: "Environmental Efficiency Index",
    dataApi: "svc/opex/graph/eei/",
    commentApi: "svc/opex/comment/eei",
    commentApiSave: "svc/opex/comment/save/eei",
    remarkType: [1],
  });

  const history = ref([]);

  const current = ref({});

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
          category: "ENERGY_EFFICIENCY_INDEX",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "Electricity Usage: (kWh)",
      key: "electricityUsage",
      type: "input",
      value: (data) => {
        return formatNumber(data.electricityUsage || 0);
      },
    },
    {
      label: "Electricity Usage Factor",
      key: "electricityUsageFactor",
      type: "text",
      value: (data) => {
        if (
          (parseFloat(data.priorYearCurrentMonthElectricityUsage) || 0) === 0
        ) {
          data.electricityUsageFactor = 0;
          return data.electricityUsageFactor;
        }

        try {
          var step1 =
            1 +
            ((parseFloat(data.electricityUsage) || 0) -
              (parseFloat(data.priorYearCurrentMonthElectricityUsage) || 0)) /
              (parseFloat(data.priorYearCurrentMonthElectricityUsage) || 0);
          if (isFinite(step1)) {
            data.electricityUsageFactor = (step1 * 0.33 * 100).toFixed(2);
          } else {
            data.electricityUsageFactor = 0;
          }
          return formatNumber(data.electricityUsageFactor, 2);
        } catch (err) {
          return 1;
        }
      },
      sortIndex: 500
    },
    {
      label: "Hazardous Waste and Scrap: (lbs.)",
      key: "hazardous",
      type: "input",
      value: (data) => {
        return formatNumber(data.hazardous || 0);
      },
    },
    {
      label: "Non-Hazardous Waste and Scrap: (lbs.)",
      key: "nonHazardous",
      type: "input",
      value: (data) => {
        return formatNumber(data.nonHazardous || 0);
      },
    },
    {
      label: "Total Waste and Scrap",
      key: "totalNonRecoverable",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        try {
          data.totalNonRecoverable =
            (parseFloat(data.hazardous) || 0) +
              (parseFloat(data.nonHazardous) || 0) || 0;
          return formatNumber(data.totalNonRecoverable);
        } catch (err) {
          return 0;
        }
      },
      sortIndex: 300
    },
    {
      label: "Waste and Scrap Factor",
      key: "nonRecoverableScrapFactor",
      type: "text",
      value: (data) => {
        try {
          data.nonRecoverableScrapFactor = 0;
          if (
            (parseFloat(data.priorYearCurrentMonthNonRecoverableScrap) || 0) ===
            0
          ) {
            return data.nonRecoverableScrapFactor;
          }

          var tnrs =
            (parseFloat(data.hazardous) || 0) +
            (parseFloat(data.nonHazardous) || 0);
          var step2 =
            1 +
            ((parseFloat(tnrs) || 0) -
              (parseFloat(data.priorYearCurrentMonthNonRecoverableScrap) ||
                0)) /
              (parseFloat(data.priorYearCurrentMonthNonRecoverableScrap) || 0);

          data.nonRecoverableScrapFactor = (step2 * 0.33 * 100).toFixed(1);

          return formatNumber(data.nonRecoverableScrapFactor, 1);
        } catch (err) {
          return 0;
        }
      },
      sortIndex: 600
    },
    {
      label: "Natural Resources Usage",
      key: "naturalResourcesUsage",
      type: "text",
      value: (data) => {
        try {
          //J.Galanza 14Sep2021 4.0 Update remove paper in calculation (parseFloat(paper) || 0)
          data.naturalResourcesUsage =
            (parseFloat(data.gases) || 0) + (parseFloat(data.water) || 0) || 0;
          return formatNumber(data.naturalResourcesUsage);
        } catch (err) {
          return 0;
        }
      },
      sortIndex: 400
    },

    

    {
      label: "Gases: (ccf)",
      key: "gases",
      type: "input",
      value: (data) => {
        return formatNumber(data.gases || 0);
      },
    },
    {
      label: "Water: (gal)",
      key: "water",
      type: "input",
      value: (data) => {
        return formatNumber(data.water || 0);
      },
    },
    
    {
      label: "Natural Resources Usage Factor",
      key: "naturalResourcesUsageFactor",
      type: "text",
      value: (data) => {
        data.naturalResourcesUsageFactor = 0;

        if (
          (parseFloat(data.priorYearCurrentMonthNaturalResourcesUsage) || 0) ===
          0
        ) {
          return formatNumber(data.naturalResourcesUsageFactor);
        }
        try {
          var step1 =
            1 +
            ((parseFloat(data.naturalResourcesUsage) || 0) -
              (parseFloat(data.priorYearCurrentMonthNaturalResourcesUsage) ||
                0)) /
              (parseFloat(data.priorYearCurrentMonthNaturalResourcesUsage) ||
                0);

          data.naturalResourcesUsageFactor = (step1 * 0.33 * 100).toFixed(2);

          return formatNumber(data.naturalResourcesUsageFactor, 2);
        } catch (err) {
          return 0;
        }
      },
      sortIndex: 700
    },
    
   
    {
      label: "Energy Efficiency Index (EEI)",
      key: "energyEfficiencyIndexEEI",
      type: "text",
      value: (data) => {
        try {
          return formatNumber(
            (parseFloat(data.naturalResourcesUsageFactor) || 0) +
              (parseFloat(data.nonRecoverableScrapFactor) || 0) +
              (parseFloat(data.electricityUsageFactor) || 0) || 0,
            1
          ); //.toFixed(2);
        } catch (err) {
          return 0;
        }
      },
      sortIndex: 800
    },
    {
      label: "EEI Target",
      key: "eeiTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.eeiTarget || 0);
      },
      sortIndex: 900
    },
    {
      label: "COGS ($K)",
      key: "cogsAmountKs",
      type: "text",
      value: (data) => {
        return formatNumber(data.cogsAmountKs || 0);
      },
      sortIndex: 1000
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
    GetCurrent,
    GetHistory,
    EvalPostData,
    Save,
    GetGridData,
    GetPeriodHeader,
    Refresh
  };
}
