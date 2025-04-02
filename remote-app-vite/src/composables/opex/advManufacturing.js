import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "../server.js";
import { useMainStore } from "../store/index";
import { useCalc } from "../composables/calc";
import axios from "axios";
import general from "../mixins/general";

export default function useOpexAdvManufacturing(overrideOpts) {
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
  const title = ref("4IR Projects");
  const dataConfig = ref({
    dataApi: "svc/opex/data/advmanufacturing/current",
    historyApi: "svc/opex/data/advmanufacturing/history",
    saveApi: "svc/opex/data/advmanufacturing/save",
  });
  const graphopts = ref({
    title: "4IR Projects",
    dataApi: "svc/opex/graph/advmanufacturing/",
    commentApi: "svc/opex/comment/advmanufacturing",
    commentApiSave: "svc/opex/comment/save/advmanufacturing",
    remarkType: [2, 3],
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
          category: "ADV_MANUF_PROJ_DIST",
        });
      },
    },
  ]);

  const rowItemConfig = ref([
    {
      label: "# of Projects: COBOTS / ROBOTS",
      key: "lineItemsShippedOnTimeRequestExternal",
      group: [
        {
          label: "WIP",
          key: "cobotsRobots_approved",
          type: "input",
          value: (data) => {
            return formatNumber(data.cobotsRobots_approved || 0);
          },
        },
        {
          label: "CMPL: YTD",
          key: "cobotsRobots_completed",
          type: "input",
          value: (data) => {
            return formatNumber(data.cobotsRobots_completed || 0);
          },
        },
      ],
    },
    // {
    //   label: "# of Projects: AGVs/Smart Transport",
    //   key: "lineItemsShippedOnTimeRequestExternal",
    //   group: [
    //     {
    //       label: "WIP",
    //       key: "agvSmartTranspo_approved",
    //       type: "input",
    //       value: (data) => {
    //         return data.agvSmartTranspo_approved || 0;
    //       },
    //     },
    //     {
    //       label: "CMPL: YTD",
    //       key: "agvSmartTranspo_completed",
    //       type: "input",
    //       value: (data) => {
    //         return data.agvSmartTranspo_completed || 0;
    //       },
    //     },
    //   ],
    // },
    {
      label: "# of Projects: Process Automation",
      key: "lineItemsShippedOnTimeRequestExternal",
      group: [
        {
          label: "WIP",
          key: "processAutomation_approved",
          type: "input",
          value: (data) => {
            return formatNumber(data.processAutomation_approved || 0);
          },
        },
        {
          label: "CMPL: YTD",
          key: "processAutomation_completed",
          type: "input",
          value: (data) => {
            return formatNumber(data.processAutomation_completed || 0);
          },
        },
      ],
    },
    {
      label: "# of Projects: Digital OEE",
      key: "lineItemsShippedOnTimeRequestExternal",
      group: [
        {
          label: "WIP",
          key: "digitalOee_approved",
          type: "input",
          value: (data) => {
            return formatNumber(data.digitalOee_approved || 0);
          },
        },
        {
          label: "CMPL: YTD",
          key: "digitalOee_completed",
          type: "input",
          value: (data) => {
            return formatNumber(data.digitalOee_completed || 0);
          },
        },
      ],
    },
    {
      label: "# of Projects: Digital Mfg.",
      key: "lineItemsShippedOnTimeRequestExternal",
      group: [
        {
          label: "WIP",
          key: "digitalManufacturing_approved",
          type: "input",
          value: (data) => {
            return formatNumber(data.digitalManufacturing_approved || 0);
          },
        },
        {
          label: "CMPL: YTD",
          key: "digitalManufacturing_completed",
          type: "input",
          value: (data) => {
            return formatNumber(data.digitalManufacturing_completed || 0);
          },
        },
      ],
    },
    {
      label: "# of Projects: Modernization",
      key: "lineItemsShippedOnTimeRequestExternal",
      group: [
        {
          label: "WIP",
          key: "modernization_approved",
          type: "input",
          value: (data) => {
            return formatNumber(data.modernization_approved || 0);
          },
        },
        {
          label: "CMPL: YTD",
          key: "modernization_completed",
          type: "input",
          value: (data) => {
            return formatNumber(data.modernization_completed || 0);
          },
        },
      ],
    },
    {
      label: "# of Projects: COBOTS / ROBOTS (WIP)",
      key: "cobotsRobots_approved",
      type: "input",
      value: (data) => {
        return formatNumber(data.cobotsRobots_approved || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: COBOTS / ROBOTS (CMPL: YTD)",
      key: "cobotsRobots_completed",
      type: "input",
      value: (data) => {
        return formatNumber(data.cobotsRobots_completed || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: AGVs/Smart Transport (WIP)",
      key: "agvSmartTranspo_approved",
      type: "input",
      value: (data) => {
        return formatNumber(data.agvSmartTranspo_approved || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: AGVs/Smart Transport(CMPL: YTD)",
      key: "agvSmartTranspo_completed",
      type: "input",
      value: (data) => {
        return formatNumber(data.agvSmartTranspo_completed || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: Process Automation (WIP)",
      key: "processAutomation_approved",
      type: "input",
      value: (data) => {
        return formatNumber(data.processAutomation_approved || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: Process Automation (CMPL: YTD)",
      key: "processAutomation_completed",
      type: "input",
      value: (data) => {
        return formatNumber(data.processAutomation_completed || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: Digital OEE (WIP)",
      key: "digitalOee_approved",
      type: "input",
      value: (data) => {
        return formatNumber(data.digitalOee_approved || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: Digital OEE (CMPL: YTD)",
      key: "digitalOee_completed",
      type: "input",
      value: (data) => {
        return formatNumber(data.digitalOee_completed || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: Digital Mfg. (WIP)",
      key: "digitalManufacturing_approved",
      type: "input",
      value: (data) => {
        return formatNumber(data.digitalManufacturing_approved || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: Digital Mfg. (CMPL: YTD)",
      key: "digitalManufacturing_completed",
      type: "input",
      value: (data) => {
        return formatNumber(data.digitalManufacturing_completed || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: Modernization (WIP)",
      key: "modernization_approved",
      type: "input",
      value: (data) => {
        return formatNumber(data.modernization_approved || 0);
      },
      view: [2],
    },
    {
      label: "# of Projects: Modernization (CMPL: YTD)",
      key: "modernization_completed",
      type: "input",
      value: (data) => {
        return formatNumber(data.modernization_completed || 0);
      },
      view: [2],
    },
    {
      label: "# of Machines",
      key: "machineCount",
      type: "input",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(data.machineCount || 0);
      },
    },
    {
      label: "Adjusted #Man",
      key: "adjustedNumMan",
      type: "input",
      value: (data) => {
        return formatNumber(data.adjustedNumMan || 0);
      },
    },
    {
      label: "Machine to Man ratio",
      key: "manToMachinePercent",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        try {
          var a = parseInt(data.machineCount) || 0;
          var b = parseInt(data.adjustedNumMan) || 0;

          if (b === 0) return 0;
          else return formatNumber(a / b, 2);
        } catch (err) {
          return 0;
        }
      },
    },
    {
      label: "# Projects: (CMPL: YTD)",
      key: "noOfCompletedYtdProjects",
      type: "text",
      value: (data) => {
        try {
          var a = parseInt(data.cobotsRobots_completed) || 0;
          var b = parseInt(data.agvSmartTranspo_completed) || 0;
          var c = parseInt(data.processAutomation_completed) || 0;
          var d = parseInt(data.digitalOee_completed) || 0;
          var e = parseInt(data.digitalManufacturing_completed) || 0;
          var f = parseInt(data.modernization_completed) || 0;

          return formatNumber(a + b + c + d + e + f, 0);
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
