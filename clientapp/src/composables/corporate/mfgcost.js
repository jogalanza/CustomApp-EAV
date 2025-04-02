import { inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
//import axios from "axios";
import general from "@/mixins/general";

export default function useCorporateMfgCost(overrideOpts) {
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
  const title = ref("Mfg Cost");
  const dataConfig = ref({
    dataApi: "svc/corporate/data/mfgcost/current",
    historyApi: "svc/corporate/data/mfgcost/history",
    saveApi: "svc/corporate/data/mfgcost/save",
  });
  const graphopts = ref({
    title: "Mfg Cost",
    dataApi: "svc/corporate/graph/mfgcost/",
    commentApi: "svc/corporate/comment/mfgcost",
    commentApiSave: "svc/corporate/comment/save/mfgcost",
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
          title: "Mfg Cost",
          category: "MFG_COST",
        });
      },
    },
  ]);

  const CalcPercentOverSales = (raw, data) => {
		if (raw.totalSales != undefined && parseFloat(raw.totalSales || 0) != 0) {
			var x = parseFloat(data || "0");
			return formatNumber((x / parseFloat(raw.totalSales || 0)) * 100, 2);
		}
		return "-";
	}

  const rowItemConfig = ref([
    {
      label: "DL Burdened Cost ($K)",
      key: "dlBurdenedCost",
      type: "input",
      value: (data) => {
        return formatNumber(data.dlBurdenedCost || 0);
      },
    },
    {
      label: "IDL Burdened Cost ($K)",
      key: "idlBurdenedCost",
      type: "input",
      value: (data) => {
        return formatNumber(data.idlBurdenedCost || 0);
      },
    },
    {
      label: "Overhead excl Labor ($K)",
      key: "overheadExclLabor",
      type: "input",
      value: (data) => {
        return formatNumber(data.overheadExclLabor || 0);
      },
    },
    {
      label: "Mfg Cost Total ($K)",
      key: "mfgCostTotal",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        var x = parseFloat(data.dlBurdenedCost || "0");
        var y = parseFloat(data.idlBurdenedCost || "0");
        var z = parseFloat(data.overheadExclLabor || "0");
        return formatNumber(x + y + z, 2);
      },
    },
    {
      label: "Mfg Cost Target ($K)",
      key: "mfgCostTarget",
      type: "text",
      value: (data) => {
        return formatNumber(data.mfgCostTarget || 0);
      },
    },
    {
      label: "DL as % of sales",
      key: "dlOverSales",
      type: "text",
      value: (data) => {
        return CalcPercentOverSales(data, data.dlBurdenedCost || 0) ;
      },
    },
    {
      label: "IDL as % of sales",
      key: "idlOverSales",
      type: "text",
      value: (data) => {
        return CalcPercentOverSales(data, data.idlBurdenedCost || 0) ;
      },
    },
    // {
    //   label: "Total Sales",
    //   key: "totalSales",
    //   type: "input",
    //   value: (data) => {
    //     return data.totalSales || 0;
    //   },
    // },
    {
      label: "OVH excl labor as % of sales",
      key: "overheadOverSales",
      type: "text",
      value: (data) => {
        return CalcPercentOverSales(data, data.overheadExclLabor || 0) ;
      },
    },
  ]);

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
