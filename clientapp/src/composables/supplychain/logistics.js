import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useSupplyChainLogistics(overrideOpts) {
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
  const title = ref("Logistics");
  const dataConfig = ref({
    dataApi: "svc/supplychain/data/logistics/current",
    historyApi: "svc/supplychain/data/logistics/history",
    saveApi: "svc/supplychain/data/logistics/save",
  });
  const graphopts = ref({
    title: "Logistics",
    dataApi: "svc/supplychain/graph/logistics/",
    commentApi: "svc/supplychain/comment/logistics",
    commentApiSave: "svc/supplychain/comment/save/logistics",
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
          title: title.value,
          category: "LOGISTICS",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "Inbound Logistics Spend ($K)",
      key: "inboundSpendKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.inboundSpendKs || 0);
      },
    },
    {
      label: "Outbound Logistics Spend ($K)",
      key: "outboundSpendKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.outboundSpendKs || 0);
      },
    },
    {
      label: "Inbound Duty & Tax ($K)",
      key: "inboundDutyTaxKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.inboundDutyTaxKs || 0);
      },
    },
    {
      label: "Outbound Duty & Tax ($K)",
      key: "outboundDutyTaxKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.outboundDutyTaxKs || 0);
      },
    },
    {
      label: "Delayed Shipments (%)",
      key: "delayedShipmentPercent",
      type: "input",
      value: (data) => {
        return formatNumber(data.delayedShipmentPercent || 0);
      },
    },
    {
      label: "Expedited Air Shipments ($K)",
      key: "expeditedAirShipmentKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.expeditedAirShipmentKs || 0);
      },
    },
    {
      label: "Inflation on Logistics Spend ($K)",
      key: "inflationSpendKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.inflationSpendKs || 0);
      },
    },
    {
      label: "Deflation on Logistics Spend ($K)",
      key: "deflationSpendKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.deflationSpendKs || 0);
      },
    },
    {
      label: "Net deflation on Logistics Spend ($K)",
      key: "netSavingsSpendKs",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        try {
          data.inflationSpendKs = Math.abs(data.inflationSpendKs) * -1;
          data.deflationSpendKs = Math.abs(data.deflationSpendKs);

          var l = Math.abs(parseFloat(data.inflationSpendKs) || 0) * -1;
          var s = parseFloat(data.deflationSpendKs) || 0;
          return formatNumber(l + s, 0);
        } catch (err) {
          //
        }
      },
    },
    {
      label: "Total Supplier Spend ($K)",
      key: "supplierSpendAmountKs",
      type: "text",
      value: (data) => {
        return formatNumber(data.supplierSpendAmountKs || 0);
      },
    },
    {
      label: "Inbound Logistics / Supplier Spend (%)",
      key: "inboundLogisticSupplierSpend",
      type: "text",
      value: (data) => {
        try {          
          var l = parseFloat(data.inboundSpendKs) || 0;
          var s = parseFloat(data.supplierSpendAmountKs) || 0;
          if (s === 0) return 0;
          else return formatNumber((l / s) * 100, 2);
        } catch (err) {
          return 0;
        }
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
    Refresh
  };
}
