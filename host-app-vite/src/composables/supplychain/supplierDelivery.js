import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "../server.js";
import { useMainStore } from "../store/index";
import { useCalc } from "../composables/calc";
import axios from "axios";
import general from "../mixins/general";

export default function useSupplyChainSupplierDelivery(overrideOpts) {
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
  const title = ref("Supplier Delivery");
  const dataConfig = ref({
    dataApi: "svc/supplychain/data/supplierdelivery/current",
    historyApi: "svc/supplychain/data/supplierdelivery/history",
    saveApi: "svc/supplychain/data/supplierdelivery/save",
  });
  const graphopts = ref({
    title: "Supplier Delivery",
    dataApi: "svc/supplychain/graph/supplierdelivery/",
    commentApi: "svc/supplychain/comment/supplierdelivery",
    commentApiSave: "svc/supplychain/comment/save/supplierdelivery",
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
          title: "Supplier Delivery",
          category: "SUPPLIER_DELIVERY",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "Items Delivered On-time (Original)",
      key: "supplierLineItemsDeliveredOnTimeCommitted",
      type: "input",
      value: (data) => {
        return formatNumber(data.supplierLineItemsDeliveredOnTimeCommitted || 0);
      },
    },
    {
      label: "Total Items Due (Original)",
      key: "supplierTotalLineItemsDueCommitted",
      type: "input",
      value: (data) => {
        return formatNumber(data.supplierTotalLineItemsDueCommitted || 0);
      },
    },
    {
      label: "Items Delivered On-time (Request)",
      key: "supplierLineItemsDeliveredOnTimeRequested",
      type: "input",
      value: (data) => {
        return formatNumber(data.supplierLineItemsDeliveredOnTimeRequested || 0);
      },
    },
    {
      label: "Total Items Due (Request)",
      key: "supplierTotalLineItemsDueRequested",
      type: "input",
      value: (data) => {
        return formatNumber(data.supplierTotalLineItemsDueRequested || 0);
      },
    },
    {
      label: "Supplier Past Due ($K)",
      key: "supplierPastDueKS",
      type: "input",
      value: (data) => {
        return formatNumber(data.supplierPastDueKS || 0);
      },
    },
    {
      label: "Average Days Late",
      key: "averageDaysLate",
      type: "input",
      value: (data) => {
        return formatNumber(data.averageDaysLate || 0);
      },
    },
    {
      label: "Supplier OCD (%)",
      key: "supplierOcdPercent",
      type: "text",
      value: (data) => {
        try {
          var step1 = parseFloat(data.supplierTotalLineItemsDueCommitted) || 0;
          if (step1 == 0) {
            return step1;
          } else {
            var step2 =
              (parseFloat(data.supplierLineItemsDeliveredOnTimeCommitted) || 0) /
                (parseFloat(data.supplierTotalLineItemsDueCommitted) || 0) || 0;
            if (isFinite(step2)) {
              return formatNumber(Math.round(step2 * 100));
            } else {
              return 0;
            }
          }
        } catch {
          return 0;
        }
      },
    },
    {
      label: "OCD Target (%)",
      key: "ocdTargetPercent",
      type: "text",
      value: (data) => {
        return formatNumber(data.ocdTargetPercent || 0);
      },
    },

    {
      label: "Supplier CRD (%)",
      key: "supplierCrdPercent",
      type: "text",
      value: (data) => {
        try {
          var step1 = parseFloat(data.supplierTotalLineItemsDueRequested) || 0;
          if (step1 == 0) {
            return step1;
          } else {
            var step2 =
              (parseFloat(data.supplierLineItemsDeliveredOnTimeRequested) || 0) /
                (parseFloat(data.supplierTotalLineItemsDueRequested) || 0) || 0;
            if (isFinite(step2)) {
              return formatNumber(Math.round(step2 * 100));
            } else {
              return 0;
            }
          }
        } catch {
          return 0;
        }
      },
    },
    {
      label: "CRD Target (%)",
      key: "crdTargetPercent",
      type: "text",
      value: (data) => {
        return formatNumber(data.crdTargetPercent || 0);
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

  const BowlerSupplierOTD = () => {
    const kpi = "DELIVERY: Supplier OCD in %";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return bowlerData.value.MonthlyResult[index].Plan?.toFixed(2);

      return `${bowlerData.value.MonthlyResult[index].Actual?.toFixed(2)}`;
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
          .post(`svc/supplychain/bowler/supplierdelivery/otd`, {
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
    formatNumber,
    GetCurrent,
    GetHistory,
    EvalPostData,
    Save,
    GetGridData,
    GetPeriodHeader,
    Refresh,
    BowlerSupplierOTD,
  };
}
