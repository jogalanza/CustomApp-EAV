import { inject, nextTick, onMounted, ref, watch } from "vue";
import server from "../server.js";
import { useMainStore } from "../store/index";
import { useCalc } from "../composables/calc";
import axios from "axios";
import general from "../mixins/general";

export default function useCorporateExcessObsolete(overrideOpts) {
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
  const title = ref("Excess and Obsolete Inventories");
  const dataConfig = ref({
    dataApi: "svc/corporate/data/excessobsolete/current",
    historyApi: "svc/corporate/data/excessobsolete/history",
    saveApi: "svc/corporate/data/excessobsolete/save",
  });
  const graphopts = ref({
    title: "Excess and Obsolete Inventories",
    dataApi: "svc/corporate/graph/excessobsolete/",
    commentApi: "svc/corporate/comment/excessobsolete",
    commentApiSave: "svc/corporate/comment/save/excessobsolete",
    remarkType: [1],
  });

  const extraMenu = ref([
    {
      label: "View edit history",
      action: () => {
        eventBus.$emit("show-edit-history", {
          title: "Excess and Obsolete Inventories",
          category: "EXCESS_OBSOLETE",
        });
      },
    },
  ]);

  const history = ref([]);

  const current = ref({});

  /** CUSTOM CALCULATION */

  const rowItemConfig = ref([  
    {
      label: "Inventory Reserves - BS ($K)",
      key: "InventoryReservesBS",
      type: "input",
      value: (data) => formatNumber(data.InventoryReservesBS || 0)
    },  
    {
      label: "Inventory Reserves - BS Target ($K)",
      key: "InventoryReservesBSTarget",
      type: "text",
      value: (data) => formatNumber(data.InventoryReservesBSTarget || 0),
      sortIndex: 700
    },

    {
      label: "Inventory Provision - P&L ($K)",
      key: "InventoryReservesPL",
      type: "input",
      value: (data) => formatNumber(data.InventoryReservesPL || 0)
    },  
    {
      label: "Inventory Provision - P&L Target ($K)",
      key: "InventoryReservesPLTarget",
      type: "text",
      value: (data) => formatNumber(data.InventoryReservesPLTarget || 0),
      sortIndex: 800
    },
    {
      label: "E&O (% of Inventory)",
      key: "EOPercentToOpsInventory",
      type: "text",
      value: (data) => {
        if ((data.GrossInventoryKs || 0) === 0) return 0;
        return formatNumber(((data.InventoryReservesBS || 0) / (data.GrossInventoryKs || 0)) * 100, 1);
      }, 
      sortIndex: 900
    }, 
    {
      label: "E&O Target (% of Inventory)",
      key: "EOTargetToOpsInventory",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(data.EOTargetToOpsInventory || 0, 1);
        
        // if ((data.GrossInventoryTarget || 0) === 0) return 0;
        // return formatNumber(((data.InventoryReservesBSTarget || 0) / (data.GrossInventoryTarget || 0)) * 100, 1);
      },
      sortIndex: 1000
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

  const BowlerEOValue = () => {
    const kpi = "INVENTORY: E&O Value (% of inventory)";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${bowlerData.value.MonthlyResult[index].Plan?.toFixed(1)}%`;

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(1)}%`;
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
          .post(`svc/corporate/bowler/excessobsolete/eovalue`, {
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
      formatActual,
      formatYTD,
      formatGap,
      getGapCellStyle,
      getCellStyle,
      Refresh,
    };
  };

  const BowlerEOQuarter= () => {
    const kpi = "INVENTORY: Quarterly E&O provision ($000)";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.MonthlyResult[index].Plan?.toFixed(0);

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(0)}`;
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

    const formatGap = () => {
      if (!bowlerData.value) return `0`;
      return `${formatNumber(bowlerData.value.Gap, 2, { accounting: true })}`;
    };



    const Refresh = () => {
      loading.value = true;

      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

      return new Promise((resolve) => {
        server
          .post(`svc/corporate/bowler/excessobsolete/qtreo`, {
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
      formatGap,
      formatValue,
      getGapCellStyle,
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
    BowlerEOQuarter,
    BowlerEOValue
  };
}
