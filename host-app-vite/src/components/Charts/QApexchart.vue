<template>
  <QCard class="graph-card" style="width: 100%; height: 350px">
    <QToolbar v-if="!chartOnly">
      <QToolbarTitle :class="`graph-toolbar ${titleClass}`">{{ title }}</QToolbarTitle>
      <QSpace />
      <q-spinner v-if="loading" />
    </QToolbar>
    <QCardSection class="q-pa-none q-pb-sm" :style="`height: calc(100% - ${(chartOnly ? '0' : '50')}px)`">
      <QLinearProgress v-if="loading && chartOnly" />
      <apexchart ref="chart" height="100%" width="100%" :options="chartOptions" :series="_series"></apexchart>
    </QCardSection>
  </QCard>
</template>

<style lang="scss">
.graph-card {
  background: #fff;

  .graph-toolbar {
    font-size: 1.1rem;
  }
}

.body--dark {
  .graph-card {
    background: #1d0e0e;

    .QToolbar {
      background: #333333 !important;
    }
  }
}
</style>

<script>
import { ref, computed, onMounted, watch, inject, onBeforeUnmount } from "vue";
import server from "../../server";
//import general from "../../mixins/general";
import { useQuasar, extend } from "quasar";
import { useConstants } from "../../composables/constants";

export default {
  props: {
    wsEvent: {
      type: String,
      default: null
    },
    wsTriggers: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: "line",
    },
    sparkline: {
      type: Boolean,
      default: false,
    },
    chartOnly: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Metric",
    },
    titleClass: {
      type: String,
      default: "",
    },
    dataApi: {
      type: String,
      default: null,
    },
    args: {
      type: Object,
      default: () => ({}),
    },
    plotOptions: {
      type: Object,
      default: null,
    },
    series: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    //const { GetMomentFromNow } = general();
    const q = useQuasar();
    const { COLOR_A } = useConstants();
    const WSSend = inject("WSSend");
    const eventBus = inject("eventBus");
    const lastUpdate = ref(null);
    const lastUpdateStr = ref("");
    const categories = ref([]);
    const chart = ref(null);
    const show = ref(false);
    const actualVal = ref(0);
    const _series = ref([]);
    const apexOpts = ref({});
    const loading = ref(false);
    //const darkMode = inject("darkMode");

    watch(props.value, (e) => {
      actualVal.value = e;
    });

    const chartOptions = computed(() => {

      var options = {
        chart: {
          background: q.dark.isActive ? '#333' : '#fff'
        },
        colors: COLOR_A,
        plotOptions: {
          treemap: {
            distributed: true,
            enableShades: false
          },
          radialBar: {
            dataLabels: {
              total: {
                show: true,
                label: 'Total',
                formatter: function (w) {
                  // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                  //console.warn("formatter", w, "seriesTotals", w.globals.seriesTotals, "series", w.globals.series)
                  var x = 0;
                  w.globals.seriesTotals.map(e => x += e);
                  return x;
                }
              }
            },
            barLabels: {
              enabled: true,
              useSeriesColors: true,
              margin: 8,
              fontSize: '16px',
              formatter: function (seriesName, opts) {
                return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
              },
            },
          },
          // bar: {
          //   barHeight: '100%',
          //   distributed: true,
          //   horizontal: true,
          //   dataLabels: {
          //     position: 'bottom'
          //   },
          // }
        },
        tooltip: {
          shared: false,
          theme: q.dark.isActive ? 'dark' : 'light',
          items: {
            display: "flex",
          },
          y: {
            title: {
              formatter: (seriesName, opts) => {
                console.warn("toolip formatter", seriesName, opts)
                if (opts.w.config.chart.type === "bar" && !opts.w.config.chart.stacked) {
                  return opts.w.config.xaxis.categories[opts.seriesIndex] === undefined ? seriesName : `${opts.w.config.xaxis.categories[opts.seriesIndex]}`
                }
                return seriesName;
              }
            }
          }
        },
        grid: {
          row: {
            opacity: 0.5
          },
          column: {
            opacity: 0.5
          }
        },
        theme: {
          mode: q.dark.isActive ? 'dark' : 'light',
        }
      };

      // if (props.plotOptions !== null) {
      //   var _plotOptions = extend(true, {}, options.plotOptions, props.plotOptions);
      //   options.plotOptions = {..._plotOptions};
      // }


      var xx = extend(true, {}, options, apexOpts.value);
      console.warn("CHART OPTIONS", xx, apexOpts.value, options);

      //override
      if (xx.chart === undefined) xx.chart = {};
      if (xx.dataLabels === undefined) xx.dataLabels = {};

      xx.chart.toolbar = {
        show: false
      };

      xx.chart.fontFamily = 'DaxPro, Archivo';
      xx.chart.foreColor = q.dark.isActive ? "white" : "black";

      xx.dataLabels = {
        //enabled: xx.chart.type === "bar" && !xx.plotOptions.bar?.horizontal ? false : true,
        //textAnchor: 'start',
        style: {
          colors: [q.dark.isActive ? '#fff' : "#333"]
        },
        // offsetX: 0,
        // dropShadow: {
        //   enabled: false
        // },
        formatter: function (val, opt) {
          //console.warn("datalabels formatter", val, opt)
          if (opt.w.config.chart.type === "donut") {
            return `${opt.w.globals.labels[opt.seriesIndex]}:  ${val.toFixed(0)}%`
          } else if (opt.w.config.chart.type === "treemap") {
            return `${val}: ${opt.value}`;
          }
          return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val.toFixed(0)
        }
      };

      return xx;
    });

    const GetData = () => {
      if (props.wsEvent !== null) {
        SendData();
      } else if (props.dataApi !== null) {
        loading.value = true;
        server.post(props.dataApi, props.args).then((response) => {
          loading.value = false;
          apexOpts.value = response.data;

          if (response.data.custom?.series) {
            _series.value = response.data.custom.series;
          }
        }).catch(() => {
          loading.value = false;
        });
      } else {
        apexOpts.value = props.value;
      }
    };

    const SendData = () => {
      if (props.wsEvent !== null) {
        loading.value = true;
        WSSend(props.wsEvent);
      }
    }

    const ParseWSData = (e) => {
      console.warn("parsewsdate", e)
      loading.value = false;
      apexOpts.value = { ...e };

      if (e.custom?.series) {
        _series.value = e.custom.series;
      }
    }

    const HookEvents = (on = true) => {
      if (props.wsTriggers !== null) {
        var e = props.wsTriggers.split(",");
        e.map(x => {
          if (on) {
            eventBus.$on(x, GetData);
          } else {
            eventBus.$off(x, GetData);
          }
        });
      }
    }

    onMounted(() => {
      HookEvents();
      if (props.wsEvent !== null) eventBus.$on(props.wsEvent, ParseWSData);

      setTimeout(() => {
        GetData();
      }, 500);
    });

    onBeforeUnmount(() => {
      HookEvents(false);
      if (props.wsEvent !== null) eventBus.$off(props.wsEvent, ParseWSData);
    })

    return {
      q,
      _series,
      actualVal,
      show,
      chart,
      lastUpdate,
      lastUpdateStr,
      categories,
      chartOptions,
      WSSend,
      eventBus,
      loading,
      apexOpts
    };
  }
};
</script>