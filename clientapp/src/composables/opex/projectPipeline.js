import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useOpexProjectPipeline(overrideOpts) {
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
  const title = ref("Project Pipeline");
  const subtitle = ref("future 12 months");
  const dataConfig = ref({
    dataApi: "svc/opex/data/projectpipeline/current",
    historyApi: "svc/opex/data/projectpipeline/history",
    saveApi: "svc/opex/data/projectpipeline/save",
  });
  const graphopts = ref({
    title: "Project Pipeline",
    subtitle: "future 12 months",
    dataApi: "svc/opex/graph/projectpipeline/",
    commentApi: "svc/opex/comment/projectpipeline",
    commentApiSave: "svc/opex/comment/save/projectpipeline",
    remarkType: [2,3],
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
          category: "PROJECT_PIPELINE",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "# of Projects: Advanced Manufacturing",
      key: "advanceManufacturing",
      type: "input",
      value: (data) => {
        return formatNumber(data.advanceManufacturing || 0);
      },
    },
    {
      label: "# of Projects: OEE",
      key: "oee",
      type: "input",
      value: (data) => {
        return formatNumber(data.oee || 0);
      },
    },
    {
      label: "# of Projects: Lean Six Sigma",
      key: "lean",
      type: "input",
      value: (data) => {
        return formatNumber(data.lean || 0);
      },
    },
    {
      label: "# of Projects: SC Savings",
      key: "scmDeflation",
      type: "input",
      value: (data) => {
        return formatNumber(data.scmDeflation || 0);
      },
    },
    {
      label: "# of Projects: Operating Leverage",
      key: "operatingLeverage",
      type: "input",
      value: (data) => {
        return formatNumber(data.operatingLeverage || 0);
      },
    },
    {
      label: "Total Pipeline $K (includes SC Savings)",
      key: "totalPipeLineAmount",
      type: "input",
      value: (data) => {
        return formatNumber(data.totalPipeLineAmount || 0);
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
    subtitle,
    GetCurrent,
    GetHistory,
    EvalPostData,
    Save,
    GetGridData,
    GetPeriodHeader,
    Refresh
  };
}
