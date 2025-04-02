import { inject, nextTick, onMounted, ref, watch } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useCorporateDelivery(overrideOpts) {
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
  const title = ref("Delivery");
  const dataConfig = ref({
    dataApi: "svc/corporate/data/delivery/current",
    historyApi: "svc/corporate/data/delivery/history",
    saveApi: "svc/corporate/data/delivery/save",
  });
  const graphopts = ref({
    title: "Delivery",
    dataApi: "svc/corporate/graph/delivery/",
    commentApi: "svc/corporate/comment/delivery",
    commentApiSave: "svc/corporate/comment/save/delivery",
    remarkType: [1],
  });

  const history = ref([]);

  const current = ref({});

  const extraMenu = ref([
    {
      label: "View edit history",
      action: () => {
        eventBus.$emit("show-edit-history", {
          title: "Delivery",
          category: "DELIVERY",
        });
      }
    }
  ]);

  /** CUSTOM CALCULATION */
  const Calc_CRDPercent = (data) => {
    try {
      var step1 =
        ((parseFloat(data.lineItemsShippedOnTimeRequestExternal) || 0) +
          (parseFloat(data.lineItemsShippedOnTimeRequestInternal) || 0)) /
        ((parseFloat(data.totalLineItemsDueRequestExternal) || 0) +
          (parseFloat(data.totalLineItemsDueRequestInternal) || 0));
      if (isFinite(step1)) {
        return (step1 * 100).toFixed(2);
      } else {
        return 0;
      }
    } catch (err) {
      //
    }
  }

  const Calc_OCDPercent = (data) => {
    try {
      var step1 =
        ((parseFloat(data.lineItemsShippedOnTimeOriginalCommitExternal) ||
          0) +
          (parseFloat(data.lineItemsShippedOnTimeOriginalCommitInternal) ||
            0)) /
        ((parseFloat(data.totalLineItemsDueOriginalCommitExternal) || 0) +
          (parseFloat(data.totalLineItemsDueOriginalCommitInternal) || 0));
      if (isFinite(step1)) {
        return (step1 * 100).toFixed(2);
      } else {
        return 0;
      }
    } catch (err) {
      //
    }
  }

  const rowItemConfig = ref([
    {
      label: "Items Shipped On-time (original)",
      key: "lineItemsShippedOnTimeRequestExternal",
      group: [
        {
          label: "Ext",
          key: "lineItemsShippedOnTimeOriginalCommitExternal",
          type: "input",
          value: (data) => formatNumber(data.lineItemsShippedOnTimeOriginalCommitExternal || 0),
        },
        {
          label: "Int",
          key: "lineItemsShippedOnTimeOriginalCommitInternal",
          type: "input",
          value: (data) => formatNumber(data.lineItemsShippedOnTimeOriginalCommitInternal || 0),
        }
      ],
    },

    {
      label: "Items Shipped On-time (req)",
      key: "lineItemsShippedOnTimeRequestExternal",
      group: [
        {
          label: "Ext",
          key: "lineItemsShippedOnTimeRequestExternal",
          type: "input",
          value: (data) => formatNumber(data.lineItemsShippedOnTimeRequestExternal || 0),
        },
        {
          label: "Int",
          key: "lineItemsShippedOnTimeRequestInternal",
          type: "input",
          value: (data) => formatNumber(data.lineItemsShippedOnTimeRequestInternal || 0),
        }
      ],
    },

    {
      label: "Total Line Items Due (original)",
      group: [
        {
          label: "Ext",
          key: "totalLineItemsDueOriginalCommitExternal",
          type: "input",
          value: (data) => formatNumber(data.totalLineItemsDueOriginalCommitExternal || 0),
        },
        {
          label: "Int",
          key: "totalLineItemsDueOriginalCommitInternal",
          type: "input",
          value: (data) => formatNumber(data.totalLineItemsDueOriginalCommitInternal || 0),
        }
      ],
    },

    {
      label: "Total Line Items Due (req)",
      key: "lineItemsShippedOnTimeRequestExternal",
      group: [
        {
          label: "Ext",
          key: "totalLineItemsDueRequestExternal",
          type: "input",
          value: (data) => formatNumber(data.totalLineItemsDueRequestExternal || 0),
        },
        {
          label: "Int",
          key: "totalLineItemsDueRequestInternal",
          type: "input",
          value: (data) => formatNumber(data.totalLineItemsDueRequestInternal || 0),
        }
      ],
    },


   
   
   
    
    {
      label: "OCD Past Due ($K)",
      group: [
        {
          label: "Ext",
          key: "ocdPastDueAmountKsExternal",
          type: "input",
          value: (data) => formatNumber(data.ocdPastDueAmountKsExternal || 0),
        },
        {
          label: "Int",
          key: "ocdPastDueAmountKsInternal",
          type: "input",
          value: (data) => formatNumber(data.ocdPastDueAmountKsInternal || 0),
        }
      ],
    },
    {
      label: "CRD Past Due ($K)",
      group: [
        {
          label: "Ext",
          key: "crdPastDueAmountKsExternal",
          type: "input",
          value: (data) => formatNumber(data.crdPastDueAmountKsExternal || 0),
        },
        {
          label: "Int",
          key: "crdPastDueAmountKsInternal",
          type: "input",
          value: (data) => formatNumber(data.crdPastDueAmountKsInternal || 0),
        }
      ],
    },
    {
      label: "Average Days Late",
      group: [
        {
          label: "CRD",
          key: "averageDaysLateCrd",
          type: "input",
          value: (data) => formatNumber(data.averageDaysLateCrd || 0),
        },
        {
          label: "OCD",
          key: "averageDaysLateOCD",
          type: "input",
          value: (data) => formatNumber(data.averageDaysLateOCD || 0),
        }
      ],
    },
    {
      label: "",
      group: [
        {
          label: "CRD %",
          key: "crd",
          type: "text",
          value: Calc_CRDPercent
        },
        {
          label: "OCD %",
          key: "ocd",
          type: "text",
          value: Calc_OCDPercent
        }
      ],
    },


    {
      label: "Items Shipped On-time (original) - Ext",
      key: "lineItemsShippedOnTimeOriginalCommitExternal",
      type: "input",
      value: (data) => formatNumber(data.lineItemsShippedOnTimeOriginalCommitExternal || 0),
      view: [2]
    },
    {
      label: "Items Shipped On-time (original) - Int",
      key: "lineItemsShippedOnTimeOriginalCommitInternal",
      type: "input",
      value: (data) => formatNumber(data.lineItemsShippedOnTimeOriginalCommitInternal || 0),
      view: [2]
    },
    {
      label: "Items Shipped On-time (req) - Ext",
      key: "lineItemsShippedOnTimeRequestExternal",
      type: "input",
      value: (data) => formatNumber(data.lineItemsShippedOnTimeRequestExternal || 0),
      view: [2]
    },
    {
      label: "Items Shipped On-time (req) - Int",
      key: "lineItemsShippedOnTimeRequestInternal",
      type: "input",
      value: (data) => formatNumber(data.lineItemsShippedOnTimeRequestInternal || 0),
      view: [2]
    },

    {
      label: "Total Line Items Due (original) - Ext",
      key: "totalLineItemsDueOriginalCommitExternal",
      type: "input",
      value: (data) => formatNumber(data.totalLineItemsDueOriginalCommitExternal || 0),
      view: [2]
    },
    {
      label: "Total Line Items Due (original) - Int",
      key: "totalLineItemsDueOriginalCommitInternal",
      type: "input",
      value: (data) => formatNumber(data.totalLineItemsDueOriginalCommitInternal || 0),
      view: [2]
    },
    {
      label: "Total Line Items Due (req) - Ext",
      key: "totalLineItemsDueRequestExternal",
      type: "input",
      value: (data) => formatNumber(data.totalLineItemsDueRequestExternal || 0),
      view: [2]
    },
    {
      label: "Total Line Items Due (req) - Int",
      key: "totalLineItemsDueRequestInternal",
      type: "input",
      value: (data) => formatNumber(data.totalLineItemsDueRequestInternal || 0),
      view: [2]
    },

    
    
    
    
    
    {
      label: "OCD Past Due ($K) - Ext",
      key: "ocdPastDueAmountKsExternal",
      type: "input",
      value: (data) => formatNumber(data.ocdPastDueAmountKsExternal || 0),
      view: [2]
    },
    {
      label: "OCD Past Due ($K) - Int",
      key: "ocdPastDueAmountKsInternal",
      type: "input",
      value: (data) => formatNumber(data.ocdPastDueAmountKsInternal || 0),
      view: [2]
    },
    {
      label: "OCD Past Due $K Target",
      key: "ocdPastDueTargetKs",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => formatNumber(data.ocdPastDueTargetKs || 0),
    },
    {
      label: "CRD Past Due ($K) - Ext",
      key: "crdPastDueAmountKsExternal",
      type: "input",
      value: (data) => formatNumber(data.crdPastDueAmountKsExternal || 0),
      view: [2]
    },
    {
      label: "CRD Past Due ($K) - Int",
      key: "crdPastDueAmountKsInternal",
      type: "input",
      value: (data) => formatNumber(data.crdPastDueAmountKsInternal || 0),
      view: [2]
    },
    {
      label: "CRD %",
      key: "crd",
      type: "text",
      value: Calc_CRDPercent,
      view: [2]
    },
    {
      label: "OCD %",
      key: "ocd",
      type: "text",
      value: Calc_OCDPercent,
      view: [2]
    },
    {
      label: "OCD Target %",
      key: "ocdTarget",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => formatNumber(data.ocdTarget || 0),
    },
    {
      label: "Average Days Late (CRD)",
      key: "averageDaysLateCrd",
      type: "input",
      value: (data) => formatNumber(data.averageDaysLateCrd || 0),
      view: [2]
    },
    {
      label: "Average Days Late (OCD)",
      key: "averageDaysLateOCD",
      type: "input",
      value: (data) => formatNumber(data.averageDaysLateOCD || 0),
      view: [2]
    },
  ]);

  watch(
    () => current.value,
    () => {
      dirty.value = true;
    },
    { deep: true }
  );

  

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

  /** BOWLER */

  const BowlerOCDPercent= () => {
    const kpi = "DELIVERY: OCD %";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.MonthlyResult[index].Plan?.toFixed(2);

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(2)}`;
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

      if (bowlerData.value.MonthlyResult[index].Actual >= bowlerData.value.MonthlyResult[index].Plan)
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
          .post(`svc/corporate/bowler/delivery/ocd`, {
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
    }

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
      Refresh
    };
  };

  const BowlerPastDue = () => {
    const kpi = "DELIVERY: Past Due ($000)";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return formatNumber(bowlerData.value.MonthlyResult[index].Plan);

      return `${formatNumber(bowlerData.value.MonthlyResult[index].Actual)}`;
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

      if (bowlerData.value.MonthlyResult[index].Actual > bowlerData.value.MonthlyResult[index].Plan)
        return "background: #ff0000 !important; color: #FFFFFF;";

      return "background: #51b44b !important;";
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";
      

      if (bowlerData.value.Gap < 0)
        return "color: #ff0000;";

      return ``;
    };

    const Refresh = () => {
      loading.value = true;

      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

      return new Promise((resolve) => {
        server
          .post(`svc/corporate/bowler/delivery/pastdue`, {
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
    }

    const GetGraphOpts = () => {
      return graphopts.value;
    };

    return {
      kpi,
      loading,
      bowlerData,
      GetGraphOpts,
      getGapCellStyle,
      formatValue,
      getCellStyle,
      Refresh
    };
  };

  const Refresh = () => {
    GetCurrent();
    GetHistory();
  };

  onMounted(() => {
    //Refresh();
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
    BowlerOCDPercent,
    BowlerPastDue
  };
}
