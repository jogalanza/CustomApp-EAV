import { inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useCorporateSafety(overrideOpts) {
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
  const title = ref("Safety");
  const dataConfig = ref({
    dataApi: "svc/corporate/data/safety/current",
    historyApi: "svc/corporate/data/safety/history",
    saveApi: "svc/corporate/data/safety/save",
  });
  const graphopts = ref({
    title: "Safety",
    dataApi: "svc/corporate/graph/safety/",
    commentApi: "svc/corporate/comment/safety",
    commentApiSave: "svc/corporate/comment/save/safety",
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
          title: "Safety",
          category: "SAFETY",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "OSHA Recordable",
      key: "ohsaRecordable",
      type: "input",
      value: (data) => {
        return formatNumber(data.ohsaRecordable || 0);
      },
    },
    {
      label: "OSHA Reportable",
      key: "ohsaReportable",
      type: "input",
      value: (data) => {
        return formatNumber(data.ohsaReportable || 0);
      },
    },
    {
      label: "Near Misses/First Aid",
      key: "nearMissesFirstAid",
      type: "input",
      value: (data) => {
        return formatNumber(data.nearMissesFirstAid || 0);
      },
    },
    {
      label: "Near Misses / First Aid Target",
      key: "nearMissFirstAidTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.nearMissFirstAidTarget || 0);
      },
      sortIndex: 500
    },
    
    {
      label: "# of Safety Observations",
      key: "challengesObservations",
      type: "input",
      value: (data) => {
        return formatNumber(data.challengesObservations || 0);
      },
    },
    {
      label: "Safety Challenges / Observations Target",
      key: "challengesObservationsTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.challengesObservationsTarget || 0);
      },
      sortIndex: 600
    },
    {
      label: "# of New Comp Claims",
      key: "numNewCompClaims",
      type: "input",
      value: (data) => {
        return formatNumber(data.numNewCompClaims || 0);
      },
    },
    {
      label: "Incident Rate (IR)",
      key: "incidentRate",
      type: "text",
      value: (data) => {
        try {
          //(parseFloat(data.ohsaReportable) || 0) +

          var x =
            (parseFloat(data.dlWorkedHours) || 0) +
            (parseFloat(data.dlWorkedHoursElevenMonths) || 0) +
            (parseFloat(data.idlWorkedHours) || 0) +
            (parseFloat(data.idlWorkedHoursElevenMonths) || 0);
          if (x === 0) return 0;
          var step1 =
            (((parseFloat(data.ohsaRecordable) || 0) +
              (parseFloat(data.ohsaReportable) || 0) +
              (parseFloat(data.oshaRecordableElevenMonths) || 0)) *
              200000) /
            (x * 1.0);

          return formatNumber(step1, 2);
        } catch (err) {
          //
        }
      },
      sortIndex: 700
    },
    {
      label: "Incident Rate Target",
      key: "SafetyIncidentRateTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.SafetyIncidentRateTarget || 0, 2);
      },
      sortIndex: 800
    },
    
    
    
    {
      label: "DL Worked Hours",
      key: "dlWorkedHours",
      type: "text",
      value: (data) => {
        return formatNumber(data.dlWorkedHours || 0, 0);
      },
      sortIndex: 900
    },
    {
      label: "IDL Worked Hours",
      key: "idlWorkedHours",
      type: "text",
      value: (data) => {
        return formatNumber(data.idlWorkedHours || 0, 0);
      },
      sortIndex: 1000
    },
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

  const BowlerIncidentRate = () => {
    const kpi = "SAFETY: Total Recordable Incident Rate < X.X";
    const loading = ref(true);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.MonthlyResult[index].Plan?.toFixed(2);

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(2)}`;
    };

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.CurrentYearPlan?.toFixed(2);

      return `${bowlerData.value.PrevYearActual?.toFixed(2)}`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.YTDPlan?.toFixed(2);

      return `${bowlerData.value.YTDActual?.toFixed(2)}`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 2, { accounting: true })}`;
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
          .post(`svc/corporate/bowler/safety/ir`, {
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

  const BowlerChallenges = () => {
    const kpi = "SAFETY: # of Safety Observations";
    const loading = ref(true);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.MonthlyResult[index].Plan?.toFixed(2);

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(2)}`;
    };

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.CurrentYearPlan?.toFixed(2);

      return `${bowlerData.value.PrevYearActual?.toFixed(2)}`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.YTDPlan?.toFixed(2);

      return `${bowlerData.value.YTDActual?.toFixed(2)}`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 2, { accounting: true })}`;
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
          .post(`svc/corporate/bowler/safety/challenges`, {
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

  const BowlerNearMiss = () => {
    const kpi = "SAFETY: Near Misses";
    const loading = ref(true);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.MonthlyResult[index].Plan?.toFixed(2);

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(2)}`;
    };

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.CurrentYearPlan?.toFixed(2);

      return `${bowlerData.value.PrevYearActual?.toFixed(2)}`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.YTDPlan?.toFixed(2);

      return `${bowlerData.value.YTDActual?.toFixed(2)}`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 2, { accounting: true })}`;
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
          .post(`svc/corporate/bowler/safety/nearmiss`, {
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
    BowlerIncidentRate,
    BowlerChallenges,
    BowlerNearMiss
  };
}
