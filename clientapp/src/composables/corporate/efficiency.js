import { inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useCorporateEfficency(overrideOpts) {
  const override = ref(overrideOpts);
  const mainStore = useMainStore();
  const { CalcGridData, CalcGridPeriodHeader } = useCalc();
  const { formatNumber } = general();
  const dirty = ref(false);
  const slidePointer = ref(10);
  const loading = ref(false);
  const resultMsg = ref(null);
  const eventBus = inject("eventBus");

  const component = ref(null);
  const title = ref("Plant Absorption & Variances");
  const dataConfig = ref({
    dataApi: "svc/corporate/data/efficiency/current",
    historyApi: "svc/corporate/data/efficiency/history",
    saveApi: "svc/corporate/data/efficiency/save",
  });
  const graphopts = ref({
    title: "Plant Absorption & Variances",
    dataApi: "svc/corporate/graph/efficiency/",
    commentApi: "svc/corporate/comment/efficiency",
    commentApiSave: "svc/corporate/comment/save/efficiency",
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
          title: "Plant Absorption & Variances",
          category: "EFFICIENCY",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "Trade Sales ($K)",
      key: "totalTradeSalesExternal",
      type: "input",
      value: (data) => {
        return formatNumber(data.totalTradeSalesExternal || 0);
      },
    },
    {
      label: "Interco Sales ($K)",
      key: "totalIntercoSalesInternal",
      type: "input",
      value: (data) => {
        return formatNumber(data.totalIntercoSalesInternal || 0);
      },
    },
    {
      label: "Total Sales ($K)",
      key: "totalSales",
      type: "text",
      sortIndex: 600,
      value: (data) => {
        try {
          return formatNumber(
            (parseFloat(data.totalTradeSalesExternal) || 0) +
              (parseFloat(data.totalIntercoSalesInternal) || 0),
            1
          );
        } catch (err) {
          //
        }
      },
    },
    {
      label: "Total Sales Target ($K)",
      key: "totalSalesTargetKs",
      type: "text",
      sortIndex: 500,
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(data.totalSalesTargetKs || 0);
      },
    },
    {
      label: "Act vs Plan Sales %",
      key: "actPlanSales",
      type: "text",
      sortIndex: 900,
      value: (data) => {
        try {
          if ((parseFloat(data.totalSalesTargetKs) || 0) == 0) return 0;

          return formatNumber(
            (((parseFloat(data.totalTradeSalesExternal) || 0) +
              (parseFloat(data.totalIntercoSalesInternal) || 0) -
              (parseFloat(data.totalSalesTargetKs) || 0)) *
              100) /
              (parseFloat(data.totalSalesTargetKs) || 0),
            2
          );
        } catch (err) {
          //
        }
      },
    },

    {
      label: "Std Cost ($K)",
      key: "stdCost",
      type: "input",
      value: (data) => {
        return formatNumber(data.stdCost || 0);
      },
    },
    {
      label: "Over (Under) Absorption ($K)",
      key: "overAbsorption",
      type: "input",
      value: (data) => {
        return formatNumber(data.overAbsorption || 0);
      },
    },
    {
      label: "Over (Under) Absorption %",
      key: "underAbsorptionPercent",
      type: "text",
      sortIndex: 700,
      value: (data) => {
        try {
          if ((parseFloat(data.mfgCostTotalKs) || 0) == 0) return 0;

          return formatNumber(
            ((parseFloat(data.overAbsorption) || 0) /
              (parseFloat(data.mfgCostTotalKs) || 0)) *
              100,
            2
          );
        } catch (err) {
          //
        }
        return formatNumber(data.underAbsorptionPercent || 0);
      },
    },
    {
      label: "Variances ($K)",
      key: "variances",
      type: "input",
      value: (data) => {
        return formatNumber(data.variances || 0);
      },
    },
    {
      label: "Variances % of Sales",
      key: "variancesPercent",
      type: "text",
      sortIndex: 800,
      value: (data) => {
        try {
          if (
            (parseFloat(data.totalTradeSalesExternal) || 0) +
              (parseFloat(data.totalIntercoSalesInternal) || 0) ==
            0
          )
            return 0;

          return formatNumber(
            ((parseFloat(data.variances) || 0) * 100) /
              ((parseFloat(data.totalTradeSalesExternal) || 0) +
                (parseFloat(data.totalIntercoSalesInternal) || 0)),
            2
          );
        } catch (err) {
          //
        }
      },
    },
    {
      label: "Other OCOGS ($K)",
      key: "otherOCOGS",
      type: "input",
      value: (data) => {
        return formatNumber(data.otherOCOGS || 0);
      },
    },
    {
      label: "COGS ($K)",
      key: "cogs",
      type: "text",
      sortIndex: 1000,
      value: (data) => {
        return formatNumber(data.cogs || 0);
      },
    },
    {
      label: "Backlog ($K)",
      key: "backlogKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.backlogKs || 0);
      },
    },
    // {
    //   label: "Variance Target ($K)",
    //   key: "varianceTargetKs",
    //   type: "input",
    //   value: (data) => {
    //     return formatNumber(data.varianceTargetKs || 0);
    //   },
    // },
    // {
    //   label: "Variance Target % of Sales",
    //   key: "variancePercentSalesTarget",
    //   type: "input",
    //   value: (data) => {
    //     return formatNumber(data.variancePercentSalesTarget || 0);
    //   },
    // },

    // {
    //   label: "GM ($K)",
    //   key: "gmAmountKs",
    //   type: "input",
    //   value: (data) => {
    //     return data.gmAmountKs || 0;
    //   },
    // },
    // {
    //   label: "GM %",
    //   key: "gmPercent",
    //   type: "input",
    //   value: (data) => {
    //     return data.gmPercent || 0;
    //   },
    // },
    // {
    //   label: "Functional Spend ($K)",
    //   key: "functional_spend_dollar_ks",
    //   type: "input",
    //   value: (data) => {
    //     return data.functional_spend_dollar_ks || 0;
    //   },
    // },
    // {
    //   label: "GM Target ($K)",
    //   key: "gmTargetAmountKs",
    //   type: "input",
    //   value: (data) => {
    //     return data.gmTargetAmountKs || 0;
    //   },
    // },
    // {
    //   label: "GM Target %",
    //   key: "gmPercentTarget",
    //   type: "input",
    //   value: (data) => {
    //     return data.gmPercentTarget || 0;
    //   },
    // },
  ]);

  const GetCurrent = () => {
    return new Promise((resolve) => {
      loading.value = true;
      server
        .post(dataConfig.value.dataApi, {
          session: mainStore.SessionOptions,
        })
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
      server
        .post(dataConfig.value.historyApi, {
          session: mainStore.SessionOptions,
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

  const BowlerAbsorption = () => {
    const kpi = "COST: Utilization/Absorption in %";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan)
        return `${formatNumber(bowlerData.value.MonthlyResult[index].Plan, 1, {accounting: true, suffix: "%" })}`;

      return `${formatNumber(bowlerData.value.MonthlyResult[index].Actual, 1, {accounting: true, suffix: "%" })}`;
    };

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.CurrentYearPlan, 0, {accounting: true, suffix: "%" })}`;

      return `${formatNumber(bowlerData.value.PrevYearActual, 0, {accounting: true, suffix: "%" })}`;
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
          if (bowlerData.value.YTDActual < -5)
            return "background: #ff0000 !important; color: #FFFFFF;";

          return "background: #51b44b !important;";
        }
      }

      if (
        bowlerData.value.MonthlyResult[index].Actual < -5
      )
        return "background: #ff0000 !important; color: #FFFFFF;";

      return "background: #51b44b !important;";
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";
      

      if (bowlerData.value.Gap < 0)
        return "color: #ff0000;";

      return ``;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.YTDPlan, 1, { accounting: true, suffix: "%"})}`;

      return `${formatNumber(bowlerData.value.YTDActual, 1, { accounting: true, suffix: "%"})}`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 2, { accounting: true, suffix: "%" })}`;
    };

    const Refresh = () => {
      loading.value = true;

      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

      return new Promise((resolve) => {
        server
          .post(
            `svc/corporate/bowler/efficiency/absorption`,
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
      return graphopts.value;
    };

    return {
      kpi,
      loading,
      bowlerData,
      GetGraphOpts,
      getGapCellStyle,
      formatGap,
      formatActual,
      formatYTD,
      formatValue,
      getCellStyle,
      Refresh,
    };
  };

  const BowlerVariance = () => {
    const kpi = "COST: Efficiency/Variance in %";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.CurrentYearPlan, 2, { accounting: true, suffix: "%" })}`;
      return `${formatNumber(bowlerData.value.PrevYearActual, 2, { accounting: true, suffix: "%" })}`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.YTDPlan, 1, { accounting: true, suffix: "%" })}`;

      return `${formatNumber(bowlerData.value.YTDActual, 1, { accounting: true, suffix: "%" })}`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return `0%`;
      return `${formatNumber(bowlerData.value.Gap, 2, { accounting: true, suffix: "%" })}`;
    };

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan)
        return `${formatNumber(bowlerData.value.MonthlyResult[index].Plan, 2, { accounting: true, suffix: "%" })}`;

      return `${formatNumber(bowlerData.value.MonthlyResult[index].Actual, 2, { accounting: true, suffix: "%" })}`;
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

          if (bowlerData.value.YTDActual >= -2 && bowlerData.value.YTDActual <= 2)
            return "background: #51b44b !important;";

          return "background: #ff0000 !important; color: #FFFFFF;";
        }
      }

      if (
        bowlerData.value.MonthlyResult[index].Actual >= -2 && bowlerData.value.MonthlyResult[index].Actual <= 2
      )
        return "background: #51b44b !important;";

      return "background: #ff0000 !important; color: #FFFFFF;";
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";
      

      if (bowlerData.value.Gap < 0)
        return "color: #ff0000;";

      return "";
    };

    const Refresh = () => {
      loading.value = true;

      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

      return new Promise((resolve) => {
        server
          .post(
            `svc/corporate/bowler/efficiency/variance`,
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
      return graphopts.value;
    };

    return {
      kpi,
      loading,
      bowlerData,
      GetGraphOpts,
      getGapCellStyle,
      formatActual,
      formatYTD,
      formatGap,
      formatValue,
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
    BowlerAbsorption,
    BowlerVariance,
  };
}
