import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import server from "../server.js";
import { useMainStore } from "../store/index";
import { useCalc } from "../composables/calc";
import axios from "axios";
import general from "../mixins/general";

export default function useSupplyChainPaymentTerms(overrideOpts) {
  const override = ref(overrideOpts);
  const mainStore = useMainStore();
  const { CalcGridData, CalcGridPeriodHeader } = useCalc();
  const { formatNumber } = general();
  const dirty = ref(false);
  const slidePointer = ref(10);
  const loading = ref(false);
  const resultMsg = ref(null);

  const cancelTokenCurrent = ref(null);
  const cancelTokenHistory = ref(null);

  const component = ref(null);
  const title = ref("Supplier Payment Terms");
  const dataConfig = ref({
    dataApi: "svc/supplychain/data/payment/current",
    historyApi: "svc/supplychain/data/payment/history",
    saveApi: "svc/supplychain/data/payment/save",
  });
  const graphopts = ref({
    title: "Supplier Payment Terms",
    dataApi: "svc/supplychain/graph/payment/",
    commentApi: "svc/supplychain/comment/payment",
    commentApiSave: "svc/supplychain/comment/save/payment",
    remarkType: [1],
  });

  const dview = ref("grid;default");

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
        //
      },
    },
  ]);

  const Calc_Total = (data) => {
    return (
      (parseFloat(data.ciaOrCod) || 0) +
      (parseFloat(data.numSuppliersWithPaymentTermLessThan30Days) || 0) +
      (parseFloat(data.numSuppliersWithPaymentTermBetween30To44Days) || 0) +
      (parseFloat(data.numSuppliersWithPaymentTermBetween45To60Days) || 0) +
      (parseFloat(data.numSuppliersWithPaymentTermOfAtleast60Days) || 0)
    );
  };

  const rowItemConfig = ref([
    {
      label: "CIA or COD",
      key: "ciaOrCod",
      type: "input",
      value: (data) => {
        return formatNumber(data.ciaOrCod || 0);
      },
    },
    {
      label: "# of Suppliers < 30 days",
      key: "numSuppliersWithPaymentTermLessThan30Days",
      type: "input",
      value: (data) => {
        return formatNumber(data.numSuppliersWithPaymentTermLessThan30Days || 0);
      },
    },
    {
      label: "# of Suppliers  30 to 44 days",
      key: "numSuppliersWithPaymentTermBetween30To44Days",
      type: "input",
      value: (data) => {
        return formatNumber(data.numSuppliersWithPaymentTermBetween30To44Days || 0);
      },
    },
    {
      label: "# of Suppliers  45 to 59 days",
      key: "numSuppliersWithPaymentTermBetween45To60Days",
      type: "input",
      value: (data) => {
        return formatNumber(data.numSuppliersWithPaymentTermBetween45To60Days || 0);
      },
    },
    {
      label: "# of Suppliers > 60 days",
      key: "numSuppliersWithPaymentTermOfAtleast60Days",
      type: "input",
      value: (data) => {
        return formatNumber(data.numSuppliersWithPaymentTermOfAtleast60Days || 0);
      },
    },
    {
      label: "Total",
      key: "total",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(Calc_Total(data));
      },
    },
    {
      label: "Ave Payment Terms",
      key: "averagePaymentTerms",
      type: "text",
      value: (data) => {
        var sum = Calc_Total(data);
        if (sum == 0) {
          return sum;
        } else {
          return Math.round(
            ((parseFloat(data.ciaOrCod) || 0) / sum) * 1 +
              ((parseFloat(data.numSuppliersWithPaymentTermLessThan30Days) ||
                0) /
                sum) *
                20 +
              ((parseFloat(data.numSuppliersWithPaymentTermBetween30To44Days) ||
                0) /
                sum) *
                35 +
              ((parseFloat(data.numSuppliersWithPaymentTermBetween45To60Days) || 0) / sum) * 50 +
              ((parseFloat(data.numSuppliersWithPaymentTermOfAtleast60Days) || 0) / sum) * 75 || 0
          );
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
    dview,
    GetCurrent,
    GetHistory,
    EvalPostData,
    Save,
    GetGridData,
    GetPeriodHeader,
    Refresh
  };
}
