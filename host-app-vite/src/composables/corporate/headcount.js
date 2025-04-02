import { inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import server from "../server.js";
import { useMainStore } from "../store/index";
import { useCalc } from "../composables/calc";
import axios from "axios";
import general from "../mixins/general";

export default function useCorporateHeadcount(overrideOpts) {
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
  const title = ref("Headcount");
  const dataConfig = ref({
    dataApi: "svc/corporate/data/headcount/current",
    historyApi: "svc/corporate/data/headcount/history",
    saveApi: "svc/corporate/data/headcount/save",
  });
  const graphopts = ref({
    title: "Headcount",
    dataApi: "svc/corporate/graph/headcount/",
    commentApi: "svc/corporate/comment/headcount",
    commentApiSave: "svc/corporate/comment/save/headcount",
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
          title: "Headcount",
          category: "HEADCOUNT",
        });
      },
    },
  ]);

  const Calc_TotalHeadcount = (data, all = true) => {
    try {
      return (
        (parseFloat(data.dlTemp) || 0) +
          (parseFloat(data.dl) || 0) +
          (parseFloat(data.idlTemp) || 0) +
          (parseFloat(data.idl) || 0) + 
          (all ? (parseFloat(data.nonOps) || 0) : 0) || 0
      );
    } catch (err) {
      //
    }
  };

  const rowItemConfig = ref([
    {
      label: "Ops DL Temp",
      key: "dlTemp",
      type: "input",
      value: (data) => {
        return formatNumber(data.dlTemp || 0);
      },
    },
    {
      label: "Ops DL",
      key: "dl",
      type: "input",
      value: (data) => {
        return formatNumber(data.dl || 0);
      },
    },
    {
      label: "Ops IDL Temp",
      key: "idlTemp",
      type: "input",
      value: (data) => {
        return formatNumber(data.idlTemp || 0);
      },
    },
    {
      label: "Ops IDL",
      key: "idl",
      type: "input",
      value: (data) => {
        return formatNumber(data.idl || 0);
      },
    },
    {
      label: "Non-Ops (All Functions)",
      key: "nonOps",
      type: "input",
      value: (data) => {
        return formatNumber(data.nonOps || 0);
      },
    },
    {
      label: "Total Site Headcount",
      key: "totalSiteHeadcount",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(Calc_TotalHeadcount(data));
      },
      sortIndex: 600
    },
    {
      label: "Total Ops Headcount",
      key: "totalHeadcount",
      type: "text",
      value: (data) => {
        try {
          return formatNumber(
            (parseFloat(data.dlTemp) || 0) +
              (parseFloat(data.dl) || 0) +
              (parseFloat(data.idlTemp) || 0) +
              (parseFloat(data.idl) || 0) || 0
          );
        } catch (err) {
          return 0;
        }
      },
      sortIndex: 700
    },
    {
      label: "Rev Per Emp ($K)",
      key: "revPerEmpAmountKs",
      type: "text",
      value: (data) => {
        try {
          //var step1 = (parseFloat(totalTradeSalesExternal) || 0) / this.calculatetotalHeadcount(dlTemp, dl, idlTemp, idl);
          var step1 =
            (parseFloat(data.totalSales) || 0) /
            Calc_TotalHeadcount(data, false); // by BBS - 20210930
            return formatNumber(step1, 2);
        } catch (err) {
          return 0;
        }
      },
      sortIndex: 800
    },
    {
      label: "Total Turnover (%)",
      key: "totalTurnOver",
      type: "input",
      value: (data) => {
        return formatNumber(data.totalTurnOver || 2);
      },
    },
    {
      label: "Total Turnover Target (%)",
      key: "totalTurnOverTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.totalTurnOverTarget || 0);
      },
      sortIndex: 900
    },
    {
      label: "First Year Turnover (%)",
      key: "firstYearTurnOver",
      type: "input",
      value: (data) => {
        return formatNumber(data.firstYearTurnOver || 0);
      },
    },   
    {
      label: "First Year Turnover Target (%)",
      key: "firstYearTurnOverTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.firstYearTurnOverTarget || 0);
      },
      sortIndex: 1000
    },
    // {
    //   label: "Ops DL Temp",
    //   key: "dlTemp",
    //   type: "input",
    //   value: (data) => {
    //     return data.dlTemp || 0;
    //   },
    // },
    // {
    //   label: "Ops IDL Temp",
    //   key: "idlTemp",
    //   type: "input",
    //   value: (data) => {
    //     return data.idlTemp || 0;
    //   },
    // },
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

  const BowlerTotalTurnover = () => {
    const kpi = "PEOPLE: Total Turnover in %";
    const loading = ref(true);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${bowlerData.value.MonthlyResult[index].Plan?.toFixed(2)}%`;

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(2)}%`;
    };

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${bowlerData.value.CurrentYearPlan?.toFixed(2)}%`;

      return `${bowlerData.value.PrevYearActual?.toFixed(2)}%`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.YTDPlan?.toFixed(2);

      return `${bowlerData.value.YTDActual?.toFixed(2)}`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 2, { accounting: true })}%`;
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
          if (bowlerData.value.YTDActual > bowlerData.value.YTDPlan)
            return "background: #ff0000 !important; color: #FFFFFF;";

          return "background: #51b44b !important;";
        }
      }

      if (
        bowlerData.value.MonthlyResult[index].Actual >
        bowlerData.value.MonthlyResult[index].Plan
      )
        return "background: #ff0000 !important; color: #FFFFFF;";

      return "background: #51b44b !important;";
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
          .post(`svc/corporate/bowler/headcount/totalturnover`, {
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
      getCellStyle,
      getGapCellStyle,
      Refresh,
    };
  };

  const BowlerFirstYearTurnover = () => {
    const kpi = "PEOPLE: First Year Turnover (%)";
    const loading = ref(true);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${bowlerData.value.MonthlyResult[index].Plan?.toFixed(2)}%`;

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(2)}%`;
    };

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${bowlerData.value.CurrentYearPlan?.toFixed(2)}%`;

      return `${bowlerData.value.PrevYearActual?.toFixed(2)}%`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${bowlerData.value.YTDPlan?.toFixed(2)}%`;

      return `${bowlerData.value.YTDActual?.toFixed(2)}%`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 2, { accounting: true, suffix: "%" })}`;
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
          if (bowlerData.value.YTDActual > bowlerData.value.YTDPlan)
            return "background: #ff0000 !important; color: #FFFFFF;";

          return "background: #51b44b !important;";
        }
      }

      if (
        bowlerData.value.MonthlyResult[index].Actual >
        bowlerData.value.MonthlyResult[index].Plan
      )
        return "background: #ff0000 !important; color: #FFFFFF;";

      return "background: #51b44b !important;";
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
          .post(`svc/corporate/bowler/headcount/fyturnover`, {
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
      getCellStyle,
      getGapCellStyle,
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
    BowlerTotalTurnover,
    BowlerFirstYearTurnover
    };
}
