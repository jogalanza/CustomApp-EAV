import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useCorporateNetInventory(overrideOpts) {
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
  const title = ref("Operating Inventory");
  const dataConfig = ref({
    dataApi: "svc/corporate/data/netinventory/current",
    historyApi: "svc/corporate/data/netinventory/history",
    saveApi: "svc/corporate/data/netinventory/save",
  });
  const graphopts = ref({
    title: "Operating Inventory",
    dataApi: "svc/corporate/graph/netinventory/",
    commentApi: "svc/corporate/comment/netinventory",
    commentApiSave: "svc/corporate/comment/save/netinventory",
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
          title: "Operating Inventory",
          category: "NET_INVENTORY",
        });
      },
    },
  ]);

  const Calc_NetInventoryAmountKs = (data) => {
    try {
      return (
        (parseFloat(data.rawMaterials) || 0) +
          (parseFloat(data.wip) || 0) +
          (parseFloat(data.fg) || 0) +
          (parseFloat(data.capVariance) || 0) || 0
      );
    } catch (err) {
      //
    }
  };

  const rowItemConfig = ref([
    {
      label: "Raw ($K)",
      key: "rawMaterials",
      type: "input",
      value: (data) => {
        return formatNumber(data.rawMaterials || 0);
      },
    },
    {
      label: "WIP ($K)",
      key: "wip",
      type: "input",
      value: (data) => {
        return formatNumber(data.wip || 0);
      },
    },
    {
      label: "FG ($K)",
      key: "fg",
      type: "input",
      value: (data) => {
        return formatNumber(data.fg || 0);
      },
    },
    {
      label: "CAP VAR ($K)",
      key: "capVariance",
      type: "input",
      value: (data) => {
        return formatNumber(data.capVariance || 0);
      },
    },   
    {
      label: "Operating Inventory ($K)",
      key: "netInventoryAmountKs",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(Calc_NetInventoryAmountKs(data));
      },
      sortIndex: 500
    },
    {
      label: "Operating Inventory Target ($K)",
      key: "netInvTargetAmountKs",
      type: "text",
      value: (data) => {
        return formatNumber(data.netInvTargetAmountKs || 0);
      },
      sortIndex: 600
    },
    {
      label: "Gross Inventory ($K)",
      key: "GrossInventoryKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.GrossInventoryKs || 0);
      },
    },   
    {
      label: "Gross Inventory Target ($K)",
      key: "GrossInventoryTargetKs",
      type: "text",
      value: (data) => {
        return formatNumber(data.GrossInventoryTargetKs || 0);
      },
      sortIndex: 700
    },
    {
      label: "Inventory Turns",
      key: "InventoryTurns",
      type: "text",
      value: (data) => {
        var x = parseFloat(data.CogsAmountLast11Months || 0) + parseFloat(data.cogsAmountKs || 0);
        var y = parseFloat(data.rawMaterials || 0) + parseFloat(data.wip || 0) + parseFloat(data.fg || 0) + parseFloat(data.capVariance || 0);

        if (y === 0) return formatNumber(0, 2);

        return formatNumber(x / y, 2);
      },
      sortIndex: 800
    },   
    {
      label: "Inventory Turns Target",
      key: "InventoryTurnsTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.InventoryTurnsTarget || 0, 2);
      },
      sortIndex: 900
    },
    {
      label: "Cycle Count (%)",
      key: "CycleCount",
      type: "input",
      value: (data) => {
        return formatNumber(data.CycleCount || 0);
      },
    },
    {
      label: "Cycle Count Target (%)",
      key: "CycleCountTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.CycleCountTarget || 0);
      },
      sortIndex: 1000
    },
    {
      label: "COGS ($K)",
      key: "cogsAmountKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.cogsAmountKs || 0);
      },
    },
    
    // {
    //   label: "DOS",
    //   key: "dos",
    //   type: "text",
    //   value: (data) => {
    //     try {
    //       var step1 = Calc_NetInventoryAmountKs(data);
    //       var step2 =
    //         step1 /
    //         (((parseFloat(data.sumOfPrior11MonthsCogsAmountKs) || 0) +
    //           (parseFloat(data.cogsAmountKs) || 0)) /
    //           360);

    //       if (isFinite(step2)) {
    //         return formatNumber(Math.round(step2));
    //       } else {
    //         return 0;
    //       }
    //     } catch (err) {
    //       //
    //     }
    //   },
    // },
    // {
    //   label: "DOS Target",
    //   key: "dosTarget",
    //   type: "text",
    //   value: (data) => {
    //     return formatNumber(data.dosTarget || 0);
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

  const BowlerOpInventory = () => {
    const kpi = "INVENTORY: Operating Inventory ($000)";
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
          .post(`svc/corporate/bowler/netinventory/opinv`, {
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

  const BowlerInventoryTurns = () => {
    const kpi = "INVENTORY: Inventory Turns";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return formatNumber(bowlerData.value.MonthlyResult[index].Plan, 2);

      return `${formatNumber(bowlerData.value.MonthlyResult[index].Actual, 2)}`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 2, { accounting: true })}`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.YTDPlan, 2, { accounting: true })}`;

      return `${formatNumber(bowlerData.value.YTDActual, 2, { accounting: true })}`;
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
            return "background: #51b44b !important;";

          return "background: #ff0000 !important; color: #FFFFFF;";
        }
      }

      if (
        bowlerData.value.MonthlyResult[index].Actual >
        bowlerData.value.MonthlyResult[index].Plan
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
          .post(`svc/corporate/bowler/netinventory/invturn`, {
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
      getCellStyle,
      getGapCellStyle,
      formatYTD,
      formatGap,
      Refresh,
    };
  };

  const BowlerCycleCount = () => {
    const kpi = "INVENTORY: Inventory Cycle Count in %";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatActual = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.CurrentYearPlan, 0, {accounting: true, suffix: "%" })}`;

      return `${formatNumber(bowlerData.value.PrevYearActual, 0, {accounting: true, suffix: "%" })}`;
    };

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.MonthlyResult[index].Plan, 2)}%`;

      return `${formatNumber(bowlerData.value.MonthlyResult[index].Actual, 2)}%`;
    };

    const formatGap = () => {
      if (!bowlerData.value) return 0;
      return `${formatNumber(bowlerData.value.Gap, 1, { accounting: true, suffix: "%" })}`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.YTDPlan, 2, { accounting: true, suffix: "%" })}`;

      return `${formatNumber(bowlerData.value.YTDActual, 2, { accounting: true, suffix: "%" })}`;
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
            return "background: #51b44b !important;";

          return "background: #ff0000 !important; color: #FFFFFF;";
        }
      }

      if (
        bowlerData.value.MonthlyResult[index].Actual >
        bowlerData.value.MonthlyResult[index].Plan
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
          .post(`svc/corporate/bowler/netinventory/cyclecount`, {
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
      getCellStyle,
      getGapCellStyle,
      formatYTD,
      formatGap,
      Refresh,
      formatActual
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
    BowlerOpInventory,
    BowlerInventoryTurns,
    BowlerCycleCount
  };
}
