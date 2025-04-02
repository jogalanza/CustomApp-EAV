import { nextTick, onBeforeUnmount, onMounted, ref, watch, inject } from "vue";
import server from "@/server.js";
import { useMainStore } from "@/store/index";
import { useCalc } from "@/composables/calc";
import axios from "axios";
import general from "@/mixins/general";

export default function useSupplyChainDeflationEfficiency(overrideOpts) {
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
  const title = ref("Direct Material Savings");
  const dataConfig = ref({
    dataApi: "svc/supplychain/data/deflationefficiency/current",
    historyApi: "svc/supplychain/data/deflationefficiency/history",
    saveApi: "svc/supplychain/data/deflationefficiency/save",
  });
  const graphopts = ref({
    title: "Direct Material Savings",
    dataApi: "svc/supplychain/graph/deflationefficiency/",
    commentApi: "svc/supplychain/comment/deflationefficiency",
    commentApiSave: "svc/supplychain/comment/save/deflationefficiency",
    remarkType: [1],
  });

  const history = ref([]);

  const current = ref({});

  const tableIndex = 1; //first in tble view

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
          title: "Direct Material Savings",
          category: "PPV_EFFICIENCY",
        });
      },
    },
  ]);

  // const SumAmount = (h, i) => {
  //   try {
  //     var a = parseFloat(h) || 0;
  //     var b = parseFloat(i) || 0;
  //     var x = Math.abs(a) * -1 + b;

  //     return formatNumber(x, 2);
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // };

  const rowItemConfig = ref([
    {
      label: "BO DataMart ($K)",
      group: [
        {
          label: "(Inflation)",
          key: "inflationBODataMart",
          type: "input",
          value: (data) => {
            data.inflationBODataMart = Math.abs(data.inflationBODataMart) * -1;

            return formatNumber(data.inflationBODataMart || 0);
          },
        },
        {
          label: "Deflation",
          key: "deflationBODataMart",
          type: "input",
          value: (data) => {
            return formatNumber(data.deflationBODataMart || 0);
          },
        },
        {
          label: "Net Savings",
          key: "deflationBODataMart",
          type: "input",
          readonly: true,
          value: (data) => {
            data.inflationBODataMart = Math.abs(data.inflationBODataMart) * -1;
            data.deflationBODataMart = Math.abs(data.deflationBODataMart);

            var a = parseFloat(data.inflationBODataMart) || 0;
            var b = parseFloat(data.deflationBODataMart) || 0;
            var x = Math.abs(a) * -1 + b;
            return formatNumber(x, 2);
          },
        },
      ],
    },
    {
      label: "BO Late Invoice Postings ($K)",
      group: [
        {
          label: "(Inflation)",
          key: "inflationBOLateInvoicePostings",
          type: "input",
          value: (data) => {
            data.inflationBOLateInvoicePostings =
              Math.abs(data.inflationBOLateInvoicePostings) * -1;

            return formatNumber(data.inflationBOLateInvoicePostings || 0);
          },
        },
        {
          label: "Deflation",
          key: "deflationBOLateInvoicePostings",
          type: "input",
          value: (data) => {
            return formatNumber(data.deflationBOLateInvoicePostings || 0);
          },
        },
        {
          label: "Net Savings",
          key: "deflationBODataMart",
          type: "input",
          readonly: true,
          value: (data) => {
            data.inflationBOLateInvoicePostings =
              Math.abs(data.inflationBOLateInvoicePostings) * -1;
            data.deflationBOLateInvoicePostings =
              Math.abs(data.deflationBOLateInvoicePostings);

            var a = parseFloat(data.inflationBOLateInvoicePostings) || 0;
            var b = parseFloat(data.deflationBOLateInvoicePostings) || 0;
            var x = Math.abs(a) * -1 + b;
            return formatNumber(x, 2);
          },
        },
      ],
    },
    {
      label: "Manual Adjustment ($K)",
      group: [
        {
          label: "(Inflation)",
          key: "inflationManualAdjustment",
          type: "input",
          value: (data) => {
            data.inflationManualAdjustment =
              Math.abs(data.inflationManualAdjustment) * -1;
            return formatNumber(data.inflationManualAdjustment || 0);
          },
        },
        {
          label: "Deflation",
          key: "deflationManualAdjustment",
          type: "input",
          value: (data) => {
            return formatNumber(data.deflationManualAdjustment || 0);
          },
        },
        {
          label: "Net Savings",
          key: "deflationBODataMart",
          type: "input",
          readonly: true,
          value: (data) => {
            data.inflationManualAdjustment =
              Math.abs(data.inflationManualAdjustment) * -1;
            data.deflationManualAdjustment =
              Math.abs(data.deflationManualAdjustment);

            var a = parseFloat(data.inflationManualAdjustment) || 0;
            var b = parseFloat(data.deflationManualAdjustment) || 0;
            var x = Math.abs(a) * -1 + b;
            return formatNumber(x, 2);
          },
        },
      ],
    },
    {
      label: "Total ($K)",
      group: [
        {
          label: "(Inflation)",
          key: "inflation",
          type: "input",
          readonly: true,
          value: (data) => {
            return formatNumber(
              (Math.abs(parseFloat(data.inflationManualAdjustment) || 0) +
                Math.abs(parseFloat(data.inflationBOLateInvoicePostings) || 0) +
                Math.abs(parseFloat(data.inflationBODataMart) || 0)) *
                -1,
              2
            );
          },
        },
        {
          label: "Deflation",
          key: "deflation",
          type: "input",
          readonly: true,
          value: (data) => {
            return formatNumber(
              (parseFloat(data.deflationManualAdjustment) || 0) +
                (parseFloat(data.deflationBOLateInvoicePostings) || 0) +
                (parseFloat(data.deflationBODataMart) || 0),
              2
            );
          },
        },
        {
          label: "Net Savings",
          key: "deflationBODataMart",
          type: "input",
          readonly: true,
          value: (data) => {
            data.netMaterialSavingAmountKs =
              ((Math.abs(parseFloat(data.inflationManualAdjustment) || 0) +
                Math.abs(parseFloat(data.inflationBOLateInvoicePostings) || 0) +
                Math.abs(parseFloat(data.inflationBODataMart) || 0)) *
                -1) +
              ((parseFloat(data.deflationManualAdjustment) || 0) +
                (parseFloat(data.deflationBOLateInvoicePostings) || 0) +
                (parseFloat(data.deflationBODataMart) || 0));

            return formatNumber(data.netMaterialSavingAmountKs, 2);
          },
        },
      ],
    },

    {
      label: "Inflation: BO DataMart ($K)",
      key: "inflationBODataMart",
      type: "input",
      value: (data) => {
        data.inflationBODataMart = Math.abs(data.inflationBODataMart) * -1;
        return formatNumber(data.inflationBODataMart || 0);
      },
      view: [2],
    },
    {
      label: "Deflation: BO DataMart ($K)",
      key: "deflationBODataMart",
      type: "input",
      value: (data) => {
        return formatNumber(data.deflationBODataMart || 0);
      },
      view: [2],
    },

    {
      label: "Inflation: BO Late Invoice Postings ($K)",
      key: "inflationBOLateInvoicePostings",
      type: "input",
      value: (data) => {
        data.inflationBOLateInvoicePostings =
          Math.abs(data.inflationBOLateInvoicePostings) * -1;
        return formatNumber(data.inflationBOLateInvoicePostings || 0);
      },
      view: [2],
    },
    {
      label: "Deflation: BO Late Invoice Postings ($K)",
      key: "deflationBOLateInvoicePostings",
      type: "input",
      value: (data) => {
        return formatNumber(data.deflationBOLateInvoicePostings || 0);
      },
      view: [2],
    },
    {
      label: "Inflation: Manual Adjustment ($K)",
      key: "inflationManualAdjustment",
      type: "input",
      value: (data) => {
        data.inflationManualAdjustment =
          Math.abs(data.inflationManualAdjustment) * -1;
        return formatNumber(data.inflationManualAdjustment || 0);
      },
      view: [2],
    },

    {
      label: "Deflation: Manual Adjustment ($K)",
      key: "deflationManualAdjustment",
      type: "input",
      value: (data) => {
        return formatNumber(data.deflationManualAdjustment || 0);
      },
      view: [2],
    },
    {
      label: "Supplier Spend - Direct ($K)",
      key: "supplierSpendAmountKs",
      type: "input",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(data.supplierSpendAmountKs || 0);
      },
    },
    {
      label: "Target Direct Material Savings ($K)",
      key: "TargetDirectMaterialSavingsKS",
      type: "text",
      itemclass: "q-mt-md",
      value: (data) => {
        return formatNumber(data.TargetDirectMaterialSavingsKS || 0);
      },
    },
    {
      label: "Inflation ($K)",
      key: "inflationAmountKs",
      type: "text",
      value: (data) => {
        return formatNumber(
          (Math.abs(parseFloat(data.inflationManualAdjustment) || 0) +
            Math.abs(parseFloat(data.inflationBOLateInvoicePostings) || 0) +
            Math.abs(parseFloat(data.inflationBODataMart) || 0)) *
            -1,
          2
        );

        // return data.inflationAmountKs || 0;
      },
      view: [2],
    },
    {
      label: "Direct Material Savings ($K)",
      key: "netMaterialSavingAmountKs",
      type: "text",
      value: (data) => {
        data.netMaterialSavingAmountKs =
          ((Math.abs(parseFloat(data.inflationManualAdjustment) || 0) +
            Math.abs(parseFloat(data.inflationBOLateInvoicePostings) || 0) +
            Math.abs(parseFloat(data.inflationBODataMart) || 0)) *
            -1) +
          ((parseFloat(data.deflationManualAdjustment) || 0) +
            (parseFloat(data.deflationBOLateInvoicePostings) || 0) +
            (parseFloat(data.deflationBODataMart) || 0));

        return formatNumber(data.netMaterialSavingAmountKs, 2);

        // return formatNumber(data.netMaterialSavingAmountKs || 0);
      },
      view: [2],
    },
    {
      label: "Direct Material Savings %",
      key: "netPpvPercent",
      type: "text",
      value: (data) => {
        try {
          data.inflationBODataMart = Math.abs(data.inflationBODataMart) * -1;

          if ((parseFloat(data.supplierSpendAmountKs) || 0) === 0) return 0;

          var step1 =
            ((parseFloat(data.netMaterialSavingAmountKs) || 0) /
              (parseFloat(data.supplierSpendAmountKs) || 0)) *
            100.0;

          data.netPpvPercent = step1.toFixed(2);

          return formatNumber(step1, 2); //step1.toFixed(2);
        } catch {
          return 0;
        }
      },
    },
  ]);

  watch(
    current,
    () => {
      if (current.value) {
        current.value.inflationBODataMart =
          Math.abs(current.value.inflationBODataMart) * -1;
        current.value.inflationBOLateInvoicePostings =
          Math.abs(current.value.inflationBOLateInvoicePostings) * -1;
        current.value.inflationManualAdjustment =
          Math.abs(current.value.inflationManualAdjustment) * -1;
      }
    },
    { deep: true }
  );

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

  const BowlerMaterialSaving = () => {
    const kpi = "COST: SC Savings ($000)";
    const loading = ref(false);
    const bowlerData = ref(null);
    const cancelToken = ref(null);

    const formatValue = (index, isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return formatNumber(bowlerData.value.MonthlyResult[index].Plan, 0, { accounting: true });

      return `${formatNumber(bowlerData.value.MonthlyResult[index].Actual, 0, { accounting: true })}`;
    };

    const formatYTD = (isPlan = true) => {
      if (!bowlerData.value) return 0;
      if (isPlan) return `${formatNumber(bowlerData.value.YTDPlan, 0, { accounting: true})}`;

      return `${formatNumber(bowlerData.value.YTDActual, 0, { accounting: true})}`;
    };

    const getGapCellStyle = () => {
      if (!bowlerData.value) return "";

      if (bowlerData.value.Gap < 0)
        return "color: #ff0000;";

      return ``;
    };

    const getCellStyle = (index, opts) => {
      if (!bowlerData.value) return "";
      if (
        opts === undefined &&
        bowlerData.value.MonthlyResult[index].IsFuturePeriod
      )
        return "locked-period";

      if (opts) {
        if (opts?.ytd) {
          if (bowlerData.value.YTDActual >= bowlerData.value.YTDPlan)
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
          .post(
            `svc/supplychain/bowler/deflationefficiency/materialsaving`,
            {
              session: mainStore.SessionOptions,
            },
            {
              cancelToken: cancelToken.value.token,
            }
          )
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
      return {
        override: true,
        id: "OPEX_PRODUCTIVITY"
      };

      //return graphopts.value;
    };

    return {
      kpi,
      loading,
      bowlerData,
      GetGraphOpts,
      formatValue,
      getGapCellStyle,
      getCellStyle,
      formatYTD,
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
    tableIndex,
    GetCurrent,
    GetHistory,
    EvalPostData,
    Save,
    GetGridData,
    GetPeriodHeader,
    Refresh,
    BowlerMaterialSaving,
  };
}
