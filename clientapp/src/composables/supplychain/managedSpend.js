import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useSupplyChainEngagement(overrideOpts) {
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
  const title = ref("Managed Spend Agreement");
  const dataConfig = ref({
    dataApi: "svc/supplychain/data/managedspend/current",
    historyApi: "svc/supplychain/data/managedspend/history",
    saveApi: "svc/supplychain/data/managedspend/save",
  });
  const graphopts = ref({
    title: "Managed Spend Agreement",
    dataApi: "svc/supplychain/graph/managedspend/",
    commentApi: "svc/supplychain/comment/managedspend",
    commentApiSave: "svc/supplychain/comment/save/managedspend",
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
          category: "MANAGED_SPEND_UNDER_AGREEMENT",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "Frame Agreements ($K)",
      key: "frameAgreementAmountKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.frameAgreementAmountKs || 0);
      },
    },
    {
      label: "Blanket Terms ($K)",
      key: "blanketTermsAmountKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.blanketTermsAmountKs || 0);
      },
    },
    {
      label: "LTA's ($K)",
      key: "ltaAmountKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.ltaAmountKs || 0);
      },
    },
    {
      label: "Signed/Authorized T&C's ($K)",
      key: "signedTcAmountKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.signedTcAmountKs || 0);
      },
    },
    {
      label: "Other ($K)",
      key: "otherKs",
      type: "input",
      value: (data) => {
        return formatNumber(data.otherKs || 0);
      },
    },
    {
      label: "Total % Spend Under Contract",
      key: "totalSpendPercent",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        try {
          var a = parseInt(data.frameAgreementAmountKs) || 0; 
          var b = parseInt(data.blanketTermsAmountKs) || 0;
          var c = parseInt(data.ltaAmountKs) || 0;
          var d = parseInt(data.signedTcAmountKs) || 0;
          var f = parseInt(data.otherKs) || 0;
          var e = parseInt(data.supplierSpendAmountKs) || 0;

          if (e === 0) return formatNumber(0, 2);
          else return formatNumber(((a + b + c + d + f) / e) * 100, 2);
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
