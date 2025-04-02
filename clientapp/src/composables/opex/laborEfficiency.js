import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useOpexLaborEfficiency(overrideOpts) {
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
  const title = ref("Direct Labor Utilization");
  const dataConfig = ref({
    dataApi: "svc/opex/data/labor/current",
    historyApi: "svc/opex/data/labor/history",
    saveApi: "svc/opex/data/labor/save",
  });
  const graphopts = ref({
    title: "Direct Labor Utilization",
    dataApi: "svc/opex/graph/labor/",
    commentApi: "svc/opex/comment/labor",
    commentApiSave: "svc/opex/comment/save/labor",
    remarkType: [2,3],
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
          category: "LABOR_EFFICIENCY",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "Hours Absorbed in Production Work", //"DL Recovered Hours",
      key: "dlRecoveredHours",
      type: "input",
      value: (data) => {
        return formatNumber(data.dlRecoveredHours || 0);
      },
    },
    {
      label: "Available Hours",
      key: "dlHoursAvailable",
      type: "input",
      value: (data) => {
        return formatNumber(data.dlHoursAvailable || 0);
      },
    },    
    {
      label: "Paid Hours",
      key: "PaidHours",
      type: "input",
      value: (data) => {
        return formatNumber(data.PaidHours || 0);
      },
    }, 
    {
      label: "Overtime (%)",
      key: "overtimePercent",
      type: "input",
      value: (data) => {
        return formatNumber(data.overtimePercent || 0);
      },
    },
    {
      label: "Overtime Target (%)",
      key: "overtimePercentTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.overtimePercentTarget || 0);
      },
    },
    {
      label: "Available Hours/Paid Hours (%)",
      key: "AvailableOverPaidHoursPercent",
      type: "text",
      value: (data) => {
        try {
          var a = parseInt(data.PaidHours) || 0;
          var b = parseInt(data.dlHoursAvailable) || 0;
      
          if (a === 0) return formatNumber(0, 2);
          else return formatNumber((b / a) * 100, 0);
      } catch (err) { 
        return 0;
       }
      },
    },
    {
      label: "Direct Labor Utilization (%)",
      key: "laborUtilizationPercent",
      type: "text",
      value: (data) => {
        try {
          var a = parseInt(data.dlRecoveredHours) || 0; //parseInt(data.PaidHours) || 0;
          var b = parseInt(data.dlHoursAvailable) || 0;
      
          if (b === 0) return formatNumber(0, 2);
          else return formatNumber((a / b) * 100, 0);
      } catch (err) { 
        return 0;
       }
      },
    },
    {
      label: "Direct Labor Utilization Target (%)",
      key: "laborUtilizationTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.laborUtilizationTarget || 0);
      },
    }
   
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

  const BowlerOvertimePercent = () => {
    const kpi = "COST: Overtime as % of Total hrs";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${bowlerData.value.MonthlyResult[index].Plan?.toFixed(1)}%`;

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(1)}%`;
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";

      return bowlerData.value.Gap < 0 ? "color: #ff0000;" : "";
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

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.CurrentYearPlan, 1)}%`;

      return `${formatNumber(bowlerData.value.PrevYearActual, 1)}%`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.YTDPlan, 1)}%`;

      return `${formatNumber(bowlerData.value.YTDActual, 1)}%`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 1, { accounting: true, suffix: "%"})}`;
    };

    const Refresh = () => {
      loading.value = true;

      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();
      
      return new Promise((resolve) => {
        server
          .post(`svc/opex/bowler/labor/overtimepercent`, {
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

  const BowlerDLEfficiency= () => {
    const kpi = "COST: Direct Labor Utilization (DLU %)";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${bowlerData.value.MonthlyResult[index].Plan?.toFixed(1)}%`;

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(1)}%`;
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";

      return bowlerData.value.Gap < 0 ? "color: #ff0000;" : "";
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

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.CurrentYearPlan, 1)}%`;

      return `${formatNumber(bowlerData.value.PrevYearActual, 1)}%`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.YTDPlan, 1)}%`;

      return `${formatNumber(bowlerData.value.YTDActual, 1)}%`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 1, { accounting: true, suffix: "%"})}`;
    };

    const Refresh = () => {
      loading.value = true;

      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();
      
      return new Promise((resolve) => {
        server
          .post(`svc/opex/bowler/labor/dlefficiency`, {
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
    BowlerOvertimePercent,
    BowlerDLEfficiency
  };
}
