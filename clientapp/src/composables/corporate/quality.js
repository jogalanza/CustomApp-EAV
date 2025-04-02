import { inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useCorporateQuality(overrideOpts) {
  const override = ref(overrideOpts);
  const mainStore = useMainStore();
  const eventBus = inject("eventBus");
  const { CalcGridData, CalcGridPeriodHeader } = useCalc();
  const { formatNumber } = general();
  const dirty = ref(false);
  const slidePointer = ref(10);
  const loading = ref(false);
  const resultMsg = ref(null);

  const cancelTokenCurrent = ref(null);
  const cancelTokenHistory = ref(null);

  const component = ref(null);
  const title = ref("Quality");
  const dataConfig = ref({
    dataApi: "svc/corporate/data/quality/current",
    historyApi: "svc/corporate/data/quality/history",
    saveApi: "svc/corporate/data/quality/save",
  });
  const graphopts = ref({
    title: "Quality",
    dataApi: "svc/corporate/graph/quality/",
    commentApi: "svc/corporate/comment/quality",
    commentApiSave: "svc/corporate/comment/save/quality",
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
          title: "Quality",
          category: "QUALITY",
          remarkType: [1]
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "Total Defective Returns (Ext)",
      key: "totalDefectiveReturnsExternal",
      type: "input",
      value: (data) => {
        return formatNumber(data.totalDefectiveReturnsExternal || 0);
      },
    },
    {
      label: "Total Defective Returns (Int)",
      key: "totalDefectiveReturnsInternal",
      type: "input",
      value: (data) => {
        return formatNumber(data.totalDefectiveReturnsInternal || 0);
      },
    },
    {
      label: "Int Mfg Sales Units (Ext)",
      key: "internallyManufacturedSalesUnitsExternal",
      type: "input",
      value: (data) => {
        return formatNumber(data.internallyManufacturedSalesUnitsExternal || 0);
      },
    },
    {
      label: "Int Mfg Sales Units (Int)",
      key: "internallyMAnufactoredSalesUnitsInternal",
      type: "input",
      value: (data) => {
        return formatNumber(data.internallyMAnufactoredSalesUnitsInternal || 0);
      },
    },
    {
      label: "# RMA's issued (Ext)",
      key: "numberOfRmasIssuedExternal",
      type: "input",
      value: (data) => {
        return formatNumber(data.numberOfRmasIssuedExternal || 0);
      },
    },
    {
      label: "# RMA's issued (Int)",
      key: "numberOfRmasIssuedInternal",
      type: "input",
      value: (data) => {
        return formatNumber(data.numberOfRmasIssuedInternal || 0);
      },
    },
    {
      label: "# of Total RMAs Target",
      key: "RMATarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.RMATarget || 0);
      },
      sortIndex: 700
    },
    {
      label: "Average Open Time (Days)",
      key: "AverageOpenTime",
      type: "input",
      value: (data) => {
        return formatNumber(data.AverageOpenTime || 0);
      },
    },
    {
      label: "Average Open Time Target (Days)",
      key: "AverageOpenTimeTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.AverageOpenTimeTarget || 0);
      },
      sortIndex: 800
    },
    {
      label: "Customer Quality (PPM)",
      key: "Customer_Quality",
      type: "text",
      value: (data) => {
        try {
          var step1 =
            ((parseFloat(data.totalDefectiveReturnsExternal) || 0) +
              (parseFloat(data.totalDefectiveReturnsInternal) || 0)) /
            ((parseFloat(data.internallyManufacturedSalesUnitsExternal) || 0) +
              (parseFloat(data.internallyMAnufactoredSalesUnitsInternal) || 0));
          if (isFinite(step1)) {
            return formatNumber(Math.round(step1 * 1000000));
          } else {
            return 0;
          }
        } catch (err) {
          console.log("calculatecustomerQuality", err);
        }
      },
      sortIndex: 900
    },
    
    {
      label: "Escapes Target",
      key: "Escapes_Target",
      type: "text",
      value: (data) => {
        return formatNumber(data.Escapes_Target || 0);
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

  const BowlerRMA = () => {
    const kpi = "QUALITY: # of RMA";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return formatNumber(bowlerData.value.MonthlyResult[index].Plan);

      return `${formatNumber(bowlerData.value.MonthlyResult[index].Actual)}`;
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";      

      if (
        bowlerData.value.YTDActual >
        bowlerData.value.YTDPlan
      )
        return "color: #ff0000;";

      return `text-green`;
    };

    const getCellStyle = (index, opts) => {
      if (!bowlerData.value) return "";
      if (opts === undefined && bowlerData.value.MonthlyResult[index].IsFuturePeriod) return "locked-period";

      if (opts) {
        if (opts?.ytd) {
          if (
            bowlerData.value.YTDActual >
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

    const Refresh = () => {
      loading.value = true;

      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

      return new Promise((resolve) => {
        server
          .post(`svc/corporate/bowler/quality/rma`, {
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

  const BowlerRMAAvgOpen = () => {
    const kpi = "QUALITY: RMA (Avg Open Time)";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return formatNumber(bowlerData.value.MonthlyResult[index].Plan);

      return `${formatNumber(bowlerData.value.MonthlyResult[index].Actual)}`;
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";      

      if (
        bowlerData.value.YTDActual >
        bowlerData.value.YTDPlan
      )
        return "color: #ff0000;";

      return `text-green`;
    };

    const getCellStyle = (index, opts) => {
      if (!bowlerData.value) return "";
      if (opts === undefined && bowlerData.value.MonthlyResult[index].IsFuturePeriod) return "locked-period";

      if (opts) {
        if (opts?.ytd) {
          if (
            bowlerData.value.YTDActual >
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

    const Refresh = () => {
      loading.value = true;

      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

      return new Promise((resolve) => {
        server
          .post(`svc/corporate/bowler/quality/rmaavgopen`, {
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
    BowlerRMA,
    BowlerRMAAvgOpen
  };
}
