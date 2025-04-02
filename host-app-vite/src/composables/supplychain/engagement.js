import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "../server.js";
import { useMainStore } from "../store/index";
import { useCalc } from "../composables/calc";
import axios from "axios";
import general from "../mixins/general";

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
  const title = ref("Supply Chain Engagement");
  const dataConfig = ref({
    dataApi: "svc/supplychain/data/engagement/current",
    historyApi: "svc/supplychain/data/engagement/history",
    saveApi: "svc/supplychain/data/engagement/save",
  });
  const graphopts = ref({
    title: "Supply Chain Engagement",
    dataApi: "svc/supplychain/graph/engagement/",
    commentApi: "svc/supplychain/comment/engagement",
    commentApiSave: "svc/supplychain/comment/save/engagement",
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
          title: "Supply Chain Engagement",
          category: "SUPPLIER_QUALIFICATION",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "# of E-Audits",
      key: "eAudits",
      type: "input",
      value: (data) => {
        return formatNumber(data.eAudits || 0);
      },
    },
    {
      label: "# of Audits",
      key: "audits",
      type: "input",
      value: (data) => {
        return formatNumber(data.audits || 0);
      },
    },
    {
      label: "# of E-Business Reviews",
      key: "eBusinessReviews",
      type: "input",
      value: (data) => {
        return formatNumber(data.eBusinessReviews || 0);
      },
    },
    {
      label: "# of Business Reviews",
      key: "businessReviews",
      type: "input",
      value: (data) => {
        return formatNumber(data.businessReviews || 0);
      },
    },
    {
      label: "# of New suppliers qualified",
      key: "newSuppliersQualified",
      type: "input",
      value: (data) => {
        return formatNumber(data.newSuppliersQualified || 0);
      },
    },
    {
      label: "# of Suppliers re-Qualified",
      key: "suppliersReQualified",
      type: "input",
      value: (data) => {
        return formatNumber(data.suppliersReQualified || 0);
      },
    },
    {
      label: "# of Planned Engagements next month",
      key: "plannedEngagement",
      type: "input",
      value: (data) => {
        return formatNumber(data.plannedEngagement || 0);
      },
    },
    {
      label: "# of Total Engagements",
      key: "totalEngagement",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        try {
          var a = parseInt(data.eAudits) || 0;
          var b = parseInt(data.audits) || 0;
          var c = parseInt(data.eBusinessReviews) || 0;
          var d = parseInt(data.businessReviews) || 0;
          var e = parseInt(data.newSuppliersQualified) || 0;
          var f = parseInt(data.suppliersReQualified) || 0;
          var x = formatNumber(a + b + c + d + e + f, 0);
          return x;
        } catch (err) {
          return 0;
        }
      },
    },
    // {
    //   label: "# of Planned Audits",
    //   key: "plannedAudits",
    //   type: "input",
    //   value: (data) => {
    //     return data.plannedAudits || 0;
    //   },
    // },
    // {
    //   label: "# of Scheduled Audits",
    //   key: "scheduledAudits",
    //   type: "input",
    //   value: (data) => {
    //     return data.scheduledAudits || 0;
    //   },
    // },
    // {
    //   label: "# of Conducted Audits",
    //   key: "conductedAudits",
    //   type: "input",
    //   value: (data) => {
    //     return data.conductedAudits || 0;
    //   },
    // },
    // {
    //   label: "# of Completed Audits",
    //   key: "completedAudits",
    //   type: "input",
    //   value: (data) => {
    //     return data.completedAudits || 0;
    //   },
    // },
    // {
    //   label: "# of Suppliers Re-qualed / Newly Qualed",
    //   key: "suppliersQualified",
    //   type: "input",
    //   value: (data) => {
    //     return data.suppliersQualified || 0;
    //   },
    // },
    // {
    //   label: "Completed Audits vs. Supplier Spend %",
    //   key: "completedAuditsSupplierSpend",
    //   type: "input",
    //   value: (data) => {
    //     return data.completedAuditsSupplierSpend || 0;
    //   },
    // },
    // {
    //   label: "Completed Audits ($K)",
    //   key: "completedAuditsKs",
    //   type: "input",
    //   value: (data) => {
    //     return data.completedAuditsKs || 0;
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
