import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

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
  const title = ref("Supplier Quality");
  const dataConfig = ref({
    dataApi: "svc/supplychain/data/supplierquality/current",
    historyApi: "svc/supplychain/data/supplierquality/history",
    saveApi: "svc/supplychain/data/supplierquality/save",
  });
  const graphopts = ref({
    title: "Supplier Quality",
    dataApi: "svc/supplychain/graph/supplierquality/",
    commentApi: "svc/supplychain/comment/supplierquality",
    commentApiSave: "svc/supplychain/comment/save/supplierquality",
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
          title: "Supplier Quality",
          category: "SUPPLIER_DELIVERY_QUALITY",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "Supplier Total Defective",
      key: "supplierTotalDefective",
      type: "input",
      value: (data) => {
        return formatNumber(data.supplierTotalDefective || 0);
      },
    },
    {
      label: "Total Received Quantity",
      key: "totalReceivedQuantity",
      type: "input",
      value: (data) => {
        return formatNumber(data.totalReceivedQuantity || 0);
      },
    },
    {
      label: "Supplier Dollar Recoveries ($K)",
      key: "supplierDollarRecoveriesKS",
      type: "input",
      value: (data) => {
        return formatNumber(data.supplierDollarRecoveriesKS || 0);
      },
    },
    {
      label: "Supplier PPM",
      key: "supplierPpm",
      type: "text",
      value: (data) => {
        try {
          var step1 = parseFloat(data.totalReceivedQuantity) || 0;
          if (step1 === 0) {
            return formatNumber(step1);
          } else {
            var step2 =
              (parseFloat(data.supplierTotalDefective) || 0) /
              (parseFloat(data.totalReceivedQuantity) || 0);
            if (isFinite(step2)) {
              return formatNumber(Math.round(step2 * 1000000));
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
      label: "PPM Target",
      key: "ppmTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.ppmTarget || 0);
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
