import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useOpexCostQuality(overrideOpts) {
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
  const title = ref("Cost of Poor Quality");
  const dataConfig = ref({
    dataApi: "svc/opex/data/coq/current",
    historyApi: "svc/opex/data/coq/history",
    saveApi: "svc/opex/data/coq/save",
  });
  const graphopts = ref({
    title: "Cost of Poor Quality",
    dataApi: "svc/opex/graph/coq/",
    commentApi: "svc/opex/comment/coq",
    commentApiSave: "svc/opex/comment/save/coq",
    remarkType: [2, 3],
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
          category: "COST_OF_QUALITY",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "Scrap ($K)",
      key: "scrapAmount",
      type: "input",
      value: (data) => {
        return formatNumber(data.scrapAmount || 0);
      },
    },
    {
      label: "Warranty ($K)",
      key: "warrantyAmount",
      type: "input",
      value: (data) => {
        return formatNumber(data.warrantyAmount || 0);
      },
    },
    {
      label: "COPQ Target ($K)",
      key: "coqAmountTarget",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(data.coqAmountTarget || 0);
      },
    },
    {
      label: "Scrap % of COGS",
      key: "scrapPercentOfMfgCosts",
      type: "text",
      value: (data) => {
        try {
          if ((parseFloat(data.cogsAmountKs) || 0) === 0) return 0;
          var step1 =
            (parseFloat(data.scrapAmount) || 0) /
            (parseFloat(data.cogsAmountKs) || 0);
          return formatNumber(step1 * 100, 2);
        } catch (err) {
          return 0;
        }
      },
    },
    {
      label: "Warranty % of COGS",
      key: "warrantyPercentOfMfgCosts",
      type: "text",
      value: (data) => {
        try {
          if ((parseFloat(data.cogsAmountKs) || 0) === 0) return 0;
          var step1 = ((parseFloat(data.warrantyAmount) || 0) / (parseFloat(data.cogsAmountKs) || 0));
          return formatNumber(step1 * 100, 2);
      }
      catch (err) {
        return 0;
      }
      },
    },
    {
      label: "COPQ (%)",
      key: "coqPercent",
      type: "text",
      value: (data) => {
        try {
          if ((parseFloat(data.cogsAmountKs) || 0) === 0) return 0;
          var step1 = (((parseFloat(data.scrapAmount) || 0) + (parseFloat(data.warrantyAmount) || 0)) / (parseFloat(data.cogsAmountKs) || 0));
          return formatNumber(step1 * 100, 2);
      }
      catch (err) {
        return 0;
      }
      },
    },
    {
      label: "COPQ Target (%)",
      key: "coqPercentTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.coqPercentTarget || 0, 2);
      },
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

  const BowlerFacilityOutput = () => {
    const kpi = "QUALITY: COPQ % of Facility Output";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${bowlerData.value.MonthlyResult[index].Plan?.toFixed(2)}%`;

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(2)}%`;
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";

      return bowlerData.value.Gap < 0 ? "color: #ff0000;" : ""
    };

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.CurrentYearPlan, 2)}%`;

      return `${formatNumber(bowlerData.value.PrevYearActual, 2)}%`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.YTDPlan, 2)}%`;

      return `${formatNumber(bowlerData.value.YTDActual, 2)}%`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 1, { accounting: true, suffix: "%"})}`;
    };

    const getCellStyle = (index, opts) => {
      if (!bowlerData.value) return "";
      if (opts === undefined && bowlerData.value.MonthlyResult[index].IsFuturePeriod) return "locked-period";

      if (opts) {
        if (opts?.ytd) {
          if (
            bowlerData.value.YTDActual <
            bowlerData.value.YTDPlan
          )
            return "background: #51b44b !important;";

          return "background: #ff0000 !important; color: #FFFFFF;";
        }
      }

      if (
        bowlerData.value.MonthlyResult[index].Actual <
        bowlerData.value.MonthlyResult[index].Plan
      )
        return "background: #51b44b !important;";

      return "background: #ff0000 !important; color: #FFFFFF;";
    };

    const Refresh = () => {
      loading.value = true;

      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

      return new Promise((resolve) => {
        server
          .post(`svc/opex/bowler/coq/facilityoutput`, {
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
      formatActual,
      formatYTD,
      formatGap,
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
    GetCurrent,
    GetHistory,
    EvalPostData,
    Save,
    GetGridData,
    GetPeriodHeader,
    Refresh,
    BowlerFacilityOutput,
  };
}
