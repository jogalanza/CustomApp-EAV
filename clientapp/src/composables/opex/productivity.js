import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useOpexProductivity(overrideOpts) {
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
  const Id = ref("OPEX_PRODUCTIVITY");
  const component = ref(null);
  const title = ref("Actual Productivity");
  const dataConfig = ref({
    dataApi: "svc/opex/data/productivity/current",
    historyApi: "svc/opex/data/productivity/history",
    saveApi: "svc/opex/data/productivity/save",
  });
  const graphopts = ref({
    title: "Actual Productivity",
    dataApi: "svc/opex/graph/productivity/",
    commentApi: "svc/opex/comment/productivity",
    commentApiSave: "svc/opex/comment/save/productivity",
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
          category: "PRODUCTIVITY",
        });
      },
    },
  ]);

  const Calc_GrossProductivity  = (data) => {
    try {
      return (
        (parseFloat(data.deflationAmountKs) || 0) +
        (parseFloat(data.leanAmountKs) || 0) +
        (parseFloat(data.operatingLeverageAmountKs) || 0) +
        (parseFloat(data.modernizationAmountKs) || 0) +
        (parseFloat(data.oeeAmountKs) || 0)
      );
    } catch (err) {
      return 0;
    }
  }

  const rowItemConfig = ref([
    {
      label: "Adv. Manuf. ($K)",
      key: "modernizationAmountKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.modernizationAmountKs || 0);
      },
    },
    {
      label: "OEE ($K)",
      key: "oeeAmountKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.oeeAmountKs || 0);
      },
    },
    {
      label: "Lean Six Sigma ($K)",
      key: "leanAmountKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.leanAmountKs || 0);
      },
    },
    {
      label: "SC Savings ($K)",
      key: "deflationAmountKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.deflationAmountKs || 0);
      },
    },
    {
      label: "SC Savings Target ($K)",
      key: "SCSavingsTargetKS",
      type: "text",
      value: (data) => {
        return formatNumber(data.SCSavingsTargetKS || 0);
      },
      sortIndex: 610
    },
  
    {
      label: "Operating Leverage ($K)",
      key: "operatingLeverageAmountKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.operatingLeverageAmountKs || 0);
      },
    },
    {
      label: "Lean Savings ($K)",
      key: "LeanSavingsKs",
      type: "text",
      value: (data) => {
        return formatNumber(Calc_GrossProductivity(data) - (data.deflationAmountKs || 0));
      },
      sortIndex: 600
    }, 
    {
      label: "Lean Savings Target ($K)",
      key: "LeanSavingsTargetKs",
      type: "text",
      value: (data) => {
        return formatNumber(data.LeanSavingsTargetKs || 0);
      },
      sortIndex: 700
    },     
    {
      label: "Gross Productivity ($K)",
      key: "grossProductivityAmountKs",
      type: "text",
      value: (data) => {
        return formatNumber(Calc_GrossProductivity(data));
      },
      sortIndex: 800
    },
    {
      label: "Total Savings Target ($K)",
      key: "ciSavingsTargetAmountKs",
      type: "text",
      value: (data) => {
        return formatNumber(data.ciSavingsTargetAmountKs || 0);
      },
      sortIndex: 900
    },
    {
      label: "Gross Savings %",
      key: "grossSavingsPercent",
      type: "text",
      value: (data) => {
        try {
          if (
            Calc_GrossProductivity(data) === 0
          ) {
            return 0;
          }
          var step1 =
            Calc_GrossProductivity(data) / (parseFloat(data.cogsAmountKs) || 0);
            return formatNumber(step1 * 100, 2);
        } catch (err) {
          return 0;
        }
      },
      sortIndex: 1000
    }, 
    {
      label: "Project Count",
      key: "projectCount",
      type: "input",
      value: (data) => {
        return formatNumber(data.projectCount || 0);
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
        .post(dataConfig.value.historyApi, {
          session: mainStore.SessionOptions,
        },
        {
          cancelToken: cancelTokenHistory.value.token,
        })
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

  const BowlerLeanSavings = () => {
    const kpi = "COST: Lean Saving -CI ($000)";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.MonthlyResult[index].Plan?.toFixed(0);

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(0)}`;
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
            bowlerData.value.YTDActual >=
            bowlerData.value.YTDPlan
          )
            return "background: #51b44b !important;";

          return "background: #ff0000 !important; color: #FFFFFF;";
        }
      }

      if (
        bowlerData.value.MonthlyResult[index].Actual >=
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
          .post(`svc/opex/bowler/productivity/leansavings`, {
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
      formatValue,
      getGapCellStyle,
      getCellStyle,
      Refresh,
    };
  };

  const BowlerSCSavings = () => {
    const kpi = "COST: SC Savings ($000)";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return formatNumber(bowlerData.value.MonthlyResult[index].Plan, 0, { accounting: true });

      return `${formatNumber(bowlerData.value.MonthlyResult[index].Actual, 0, { accounting: true })}`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.YTDPlan, 0, { accounting: true})}`;

      return `${formatNumber(bowlerData.value.YTDActual, 0, { accounting: true})}`;
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";

      if (bowlerData.value.Gap < 0)
        return "color: #ff0000;";

      return ``;
    };

    const getCellStyle = (index, opts) => {
      if (!bowlerData.value) return "";
      if (
        opts === undefined &&
        bowlerData.value.MonthlyResult[index].IsFuturePeriod
      )
        return "locked-period";

      if (opts) {
        if (opts?.ytd) {
          if (bowlerData.value.YTDActual >= bowlerData.value.YTDPlan)
            return "background: #51b44b !important;";

          return "background: #ff0000 !important; color: #FFFFFF;";
        }
      }

      if (
        bowlerData.value.MonthlyResult[index].Actual >=
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
          .post(
            `svc/opex/bowler/productivity/scsavings`,
            {
              session: mainStore.SessionOptions,
            },
            {
              cancelToken: cancelToken.value.token,
            }
          )
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
      // return {
      //   override: true,
      //   id: "OPEX_PRODUCTIVITY"
      // };

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
      formatYTD,
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
    Id,
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
    BowlerLeanSavings,
    BowlerSCSavings
  };
}
