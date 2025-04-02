<template>
  <q-card flat class="graph-card q-pb-md">
    <q-linear-progress indeterminate v-show="loading > 0" color="green" />
    <q-toolbar class="chart-toolbar q-py-sm q-px-md">
      <slot name="chart-toolbar">
        <q-btn round flat icon="o_download" dense size="sm"><q-tooltip>Download</q-tooltip></q-btn>
        <div class="card-title">{{ `${options.title ?? title}` }}</div>
        <q-btn v-if="dirty" round flat icon="o_save" dense @click="SaveChanges" size="sm"><q-tooltip>Save Changes</q-tooltip></q-btn>
        <q-btn round flat icon="o_refresh" dense @click="RefreshChart" size="sm"><q-tooltip>Refresh</q-tooltip></q-btn>
        <q-btn round flat icon="o_fullscreen" dense @click="dialog = !dialog" size="sm"><q-tooltip>Toggle Fullscreen View</q-tooltip></q-btn>
      </slot>
    </q-toolbar>

    <q-card-section class="q-pa-none">
      <!-- <apexchart ref="chart1" height="400px" width="100%" :options="OptionsDefault" :key="renderKey" :series="_series" style="width: 100%; height: 100%"></apexchart> -->
      <div v-if="showChart" ref="chart1" :id="`chart${chartid}`" />
    </q-card-section>
    <q-card-section v-if="options.remarkType && options.remarkType.indexOf(1) > -1" class="q-pa-sm q-px-md">
      <q-input v-model="remarks.comment" :disable="commentLoading > 0" :loading="commentLoading > 0" dense label="Comment" class="graph-comment" type="textarea" autogrow :maxlength="5000"
        borderless />
    </q-card-section>
    <q-card-section v-if="options.remarkType && options.remarkType.indexOf(2) > -1" class="q-pa-sm q-px-md">
      <q-input v-model="remarks.highlights" :disable="commentLoading > 0" :loading="commentLoading > 0" dense label="Highlights" class="graph-comment" type="textarea" autogrow :maxlength="5000"
        borderless />
    </q-card-section>
    <q-card-section v-if="options.remarkType && options.remarkType.indexOf(3) > -1" class="q-pa-sm q-px-md">
      <q-input v-model="remarks.lowlights" :disable="commentLoading > 0" :loading="commentLoading > 0" dense label="Lowlights" class="graph-comment" type="textarea" autogrow :maxlength="5000"
        borderless />
    </q-card-section>

    <!-- <q-dialog v-model="dialog" maximized>
      <q-card class="graph-card-fs">
        <q-linear-progress indeterminate v-show="loading > 0" color="green" />
        <q-toolbar>          
          <div class="card-title">{{ `${options.title ?? title}` }}</div>
          <q-btn v-if="dirty" round flat icon="o_save" dense @click="SaveChanges"><q-tooltip>Save Changes</q-tooltip></q-btn>
          <q-btn round flat icon="o_refresh" dense @click="RefreshChart"><q-tooltip>Refresh</q-tooltip></q-btn>
          <q-btn round flat icon="o_close" dense @click="dialog = !dialog"><q-tooltip>Toggle Fullscreen View</q-tooltip></q-btn>
        </q-toolbar>
        <q-card-section class="row" style="height: calc(100vh - 50px)">
          <div class="col-12 col-sm-8" style="height: calc(100% - 16px)">            
            <apexchart ref="chart2" height="90vh" width="100%" :options="OptionsDefaultFS" :key="renderKey" :series="_series" style="height: 100%"></apexchart>
          </div>
          <div class="side-comment col-12 col-sm-4 q-pa-md scroll">
            <q-card-section v-if="options.remarkType && options.remarkType.indexOf(1) > -1" class="q-pa-none">
              <q-input v-model="remarks.comment" :disable="commentLoading > 0" :loading="commentLoading > 0" dense label="Comment" class="graph-comment full-window" type="textarea" autogrow
                :maxlength="5000" borderless />
            </q-card-section>
            <q-card-section v-if="options.remarkType && options.remarkType.indexOf(2) > -1" class="q-pa-none">
              <q-input v-model="remarks.highlights" :disable="commentLoading > 0" :loading="commentLoading > 0" dense label="Highlights" class="graph-comment full-window lohigh" type="textarea"
                autogrow :maxlength="5000" borderless />
            </q-card-section>
            <q-card-section v-if="options.remarkType && options.remarkType.indexOf(3) > -1" class="q-pa-none">
              <q-input v-model="remarks.lowlights" :disable="commentLoading > 0" :loading="commentLoading > 0" dense label="Lowlights" class="graph-comment full-window lohigh" type="textarea" autogrow
                :maxlength="5000" borderless />
            </q-card-section>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog> -->
  </q-card>
</template>

<style lang="scss">
.chart-toolbar {
  color: white !important;
  background: #80d180;
  background: linear-gradient(179deg, #2ea13b, rgb(14 114 13 / 57%)) !important;
}

.graph-card-fs {
  background: #ffffff;
}

.graph-comment {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;

  textarea {
    max-height: 170px;
    margin-top: 8px;
  }

  &.full-window {
    border-left: solid 2px #069f06;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;

    textarea {
      max-height: calc(100vh - 160px);
    }

    &.lohigh {
      textarea {
        max-height: 40vh;
      }
    }
  }
}

.side-comment {
  background: #f5f5f5;
  border-radius: 8px;
  height: 100%;
  overflow-y: auto;
}

.body--dark {
  .chart-toolbar {
    background: #1f1f1f !important;
    background: linear-gradient(#262626, #323232, #363636) !important;
  }

  .graph-card-fs {
    background: #323232;
  }

  .graph-comment {
    background: #363636;
  }

  .side-comment {
    background: #363636;
  }
}
</style>

<script>
import { defineComponent, ref, watch, computed, onMounted, nextTick, onBeforeMount } from "vue";
// import { Chart } from "highcharts-vue";
// import HighCharts from "highcharts";
// import exportingInit from "highcharts/modules/exporting";
// import exportDataInit from "highcharts/modules/export-data";
import { useMainStore } from "../../store";
import { useEvalFilter } from "@/composables/evalFilter"
import server from "@/server.js"
import { useQuasar, extend } from "quasar";
import general from "@/mixins/general";
//import VuexApexCharts from "vue3-apexcharts"
//import ApexChart from "apexcharts";

// exportingInit(HighCharts);
// exportDataInit(HighCharts);

export default defineComponent({
  components: {
    // highcharts: Chart,
    //apexchart: VuexApexCharts
  },
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      default: ''
    },
    dataApi: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '450px'
    },
    height: {
      type: String,
      default: '420px'
    },
    showToolbarControl: {
      type: Boolean,
      default: true
    },
    trigger: {
      type: String,
      default: 'refresh-charts'
    },
    chartid: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {

    let chartInstance;

    const mainStore = useMainStore();
    const q = useQuasar();
    const { IsValidFilter } = useEvalFilter();
    const { NotifyUser } = general();
    const chart1 = ref(null);
    const chart2 = ref(null);
    const editMode = ref(false);
    const dialog = ref(false);
    const parentTitle = ref('');
    const APIs = ref([]);
    const ChartTitles = ref([]);
    const level = ref(1);
    const busyMsg = ref('');
    const busy = ref(true);
    const showSpinner = ref(true);
    const loading = ref(0);
    const commentLoading = ref(0);
    const dirty = ref(false);

    const renderKey = ref(0);

    const chartData = ref({
    });
    const _series = ref([]);
    const remarks = ref({});
    //const hcInstance1 = ref(HighCharts);
    const showChart = ref(true);

    watch(remarks, () => {
      dirty.value = true;
    }, { deep: true });

    const ActiveAPI = computed(() => {
      if (level.value > 1) return APIs.value[level.value - 1]
      return APIs.value[0]
    });

    const ActiveTitle = computed(() => {
      if (level.value > 1) return ChartTitles.value[level.value - 1]
      return ChartTitles.value[0];
    });

    const OptionsDefault = computed(() => {
      var x = 0;
      if (!chartData.value) {
        x = 1;
        //return chartData.value;
      }
      return CalcOptions(false, x)
    });

    const OptionsDefaultFS = computed(() => {
      var x = 0;
      if (!chartData.value) {
        x = 1;
        //return chartData.value;
      }
      return CalcOptions(true, x)
    });

    const GetDefault_YAxis = (fullscreen = false) => {
      var x = {
        softMin: 0,
        labels: {
          style: {
            fontSize: fullscreen ? "16px" : "10px",
            color: q.dark.isActive ? '#aaaaaa' : 'black'
          }
        },
        title: {
          style: {
            fontWeight: "900",
            fontSize: fullscreen ? "18px" : "11px",
            color: q.dark.isActive ? '#aaaaaa' : 'black'
          }
        },
      };
      return x;
    }

    const CalcOptions_V1 = (fullscreen = false) => {

      if (!chartData.value) return chartData.value;

      var merge = require("lodash.merge");

      var _yAxis = [];
      _yAxis.push(GetDefault_YAxis(fullscreen));

      if (chartData.value.yAxis && chartData.value.yAxis.length > 1) {
        _yAxis.push(GetDefault_YAxis(fullscreen));
      }

      var _options = {
        chart: {
          style: {
            fontFamily: "DaxPro",

          },
          backgroundColor: q.dark.isActive ? '#323232' : '#ffffff',
          height: fullscreen ? "calc(100% - 100px)" : `${props.height}`,
          spacingLeft: 10,
          spacingRight: 10,
          spacingTop: 20,
          marginLeft: null,
          marginRight: null,
          zoomType: 'x',
          resetZoomButton: {
            position: {
              x: -10,
              y: 0
            },
            relativeTo: 'chart'
          },
          events: {
            selection: function () {
              // if (event.xAxis) {
              //   vm.zoomMode = true;
              // } else {
              //   vm.zoomMode = false;
              // }
            }
          }
        },
        title: {
          text: ""
        },
        subtitle: {
          text: ""
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          line: {
            enabled: true,
            marker: {
              radius: fullscreen ? 12 : 3
            },
          },
          series: {
            animation: true,
            cursor: "pointer",
            borderWidth: 0,
            groupPadding: 0.1,
            pointPadding: 0,
            point: {
              events: {
                click: function () {
                  //console.log('Series clicked', this, vm);
                  if (this.series.options.drillDownInfoArr.length > this.x) {
                    var payload = this.series.options.drillDownInfoArr[this.x]
                    console.log(payload)
                    if (payload && payload.chartDataAPI !== '' && payload.chartDataAPI !== null) {
                      InvokeDrillDownChart(payload);
                    } else if (payload && payload.emit) {
                      //InvokeChartEmit(payload);
                    }

                  }
                }
              }
            },
            marker: {
              radius: fullscreen ? 10 : 4
            },
            events: {
              hide: function () {
                //console.log("series hide");
                //console.log(this, vm);
              },
              show: function () {
                //console.log("series show");
                //console.log(this, vm);
              }
            },
            states: {
              hover: {
                enabled: true,
                lineWidth: 0,
                lineWidthPlus: 0
              }
            }
          }
        },
        xAxis: [
          {
            categories: [],
            labels: {
              step: 1,
              style: {
                color: q.dark.isActive ? '#dddddd' : 'black',
                fontSize: fullscreen ? "14px" : "10px",
                textOverflow: 'none',
                whiteSpace: 'nowrap'
              },
              padding: 10,
              rotation: -90
            },
            type: "linear"
          },
          {
            categories: [],
            labels: {
              step: 1,
              style: {
                color: q.dark.isActive ? '#dddddd' : 'blue',
                fontSize: fullscreen ? "16px" : "10px"
              },
              padding: 10,
              autoRotationLimit: 70
            },
            opposite: true
          }
        ],
        yAxis: _yAxis,
        tooltip: {
          shared: true
        },
        legend: {
          enabled: true,
          symbolRadius: 0,
          layout: "horizontal",
          verticalAlign: "bottom",
          itemDistance: 10,
          itemWidth: null,
          align: "center",
          itemStyle: {
            color: q.dark.isActive ? '#dddddd' : 'black',
            fontSize: fullscreen ? "16px" : "12px",
            fontWeight: "normal"
          },
          y: 15
        },
        exporting: {
          type: "image/jpeg",
          allowHTML: false,
          enabled: false,
          buttons: {
            printButton: {
              enabled: false
            },
            exportButton: {
              enabled: false
            }
          },
          chartOptions: {
            chart: {
              width: 1024,
              height: 768
            },
            title: {
              text: ActiveTitle.value
            },
            legend: {
              title: {
                style: "font-size: 9px"
              },
              itemStyle: {
                fontSize: "9px"
              }
            }
          }
        }
      };

      var result = merge({}, _options, chartData.value);

      if (fullscreen) {
        // result.chart.marginBottom = "100px";
      }

      result.chart.height = null;


      result.yAxis.forEach(element => {
        if (q.dark.isActive) { element.gridLineColor = "#666666" }
        else { element.gridLineColor = "#999999" }
      });

      if (result.series) {
        result.series.forEach(element => {
          if (element.marker) {
            var a = { ...element.marker };
            a.radius = fullscreen ? 6 : 2;
            a.lineWidth = fullscreen ? 8 : 3;
            element.marker = a;
          }
        });
      }


      result.plotOptions.series.marker.radius = fullscreen ? 12 : 4;

      console.warn('eval', result);


      return result;
    }

    const CalcOptions = (fullscreen = false) => {
      //fullscreen = false
      //if (!chartData.value) return chartData.value;

      var options = {
        chart: {
          background: q.dark.isActive ? '#333' : '#fff'
        },
        dataLabels: {
          style: {
            fontSize: fullscreen ? "22px" : "16px",
          }
        },
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
              fontSize: fullscreen ? '22px' : '16px',
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
        },
        // yaxis: [
        //   {
        //     title: {
        //       style: {
        //         fontSize: fullscreen ? "22px" : "12px",
        //       }
        //     },
        //     labels: {
        //       style: {
        //         fontSize: fullscreen ? "22px" : "12px",
        //       }
        //     }
        //   },
        //   {
        //     title: {
        //       style: {
        //         fontSize: fullscreen ? "22px" : "12px",
        //       }
        //     },
        //     labels: {
        //       style: {
        //         fontSize: fullscreen ? "22px" : "12px",
        //       }
        //     }
        //   }
        // ],
        xaxis: {
          title: {
            style: {
              fontSize: fullscreen ? "22px" : "12px",
            }
          },
          labels: {
            rotate: -45,
            rotateAlways: true,
            style: {
              fontSize: fullscreen ? "22px" : "12px",
            }
          },

        }
      };

      // if (props.plotOptions !== null) {
      //   var _plotOptions = extend(true, {}, options.plotOptions, props.plotOptions);
      //   options.plotOptions = {..._plotOptions};
      // }


      var xx = extend(true, {}, options, chartData.value);
      console.warn("CHART OPTIONS", xx, chartData.value, options);

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
    }

    const LoadCallback = () => {
      //
    }

    const InvokeDrillDownChart = (api) => {
      if (api.chartDataAPI === '') return
      APIs.value.push(`${server.defaults.baseURL}/${api.chartDataAPI}`)
      ChartTitles.value.push('') //to be filled in later
      level.value += 1
      RefreshChart()
    }

    // const ZoomOut = () => {
    //   //console.log(Chart, this.$refs.Chart1.chart)
    //   if (chart1.value) {
    //     chart1.value.chart.zoomOut()
    //   }
    //   if (chart2.value) {
    //     chart2.value.chart.zoomOut()
    //   }
    // }

    const SetBusy = (val, msg, spinner = true) => {
      busyMsg.value = msg
      busy.value = val
      showSpinner.value = spinner
    }

    const GetChartData = () => {
      if (ActiveAPI.value !== '' && IsValidFilter()) {
        //ZoomOut()
        SetBusy(true, 'Loading')
        loading.value += 1;
        server.post(ActiveAPI.value, {
          session: mainStore.SessionOptions
        }).then(response => {
          //SetBusy(false, '')
          //if (response.data !== '') {
          loading.value -= 1;
          response.data.chartData.chart.height = "100%";
          chartData.value = { ...response.data.chartData }

          //Update chart title for drilldown
          if (level.value > 1 && response.data.chartData.chartTitle) {
            ChartTitles.value[level.value - 1] = response.data.chartData.chartTitle;
          }

          //check for loading message
          if (response.data.chartData.loadingMessage !== "") {
            SetBusy(true, response.data.chartData.loadingMessage, response.data.chartData.success)
          }

          nextTick(() => {

            renderKey.value = new Date().getMilliseconds();
          });

          showChart.value = false;
          setTimeout(() => {
            InitChart();
          }, 2000);

          //}
        }).catch(() => {
          loading.value -= 1;
          SetBusy(false, '')
        });
      }
    }

    const GetComments = () => {
      //
      if (props.options.commentApi) {
        commentLoading.value += 1;
        server.post(props.options.commentApi, {
          session: mainStore.SessionOptions
        }).then(response => {
          commentLoading.value -= 1;
          remarks.value = { ...response.data.result }
          nextTick(() => {
            dirty.value = false;
          });
        }).catch(() => {
          commentLoading.value -= 1;
        });
      }
    }

    const SaveChanges = () => {
      //i.e., the Comments
      if (props.options.commentApiSave) {
        remarks.value.highlightmode = props.options.remarkType.indexOf(2) > -1;
        commentLoading.value += 1;
        server.post(props.options.commentApiSave, {
          session: mainStore.SessionOptions,
          commentsdata: remarks.value
        }).then(response => {
          commentLoading.value -= 1;
          NotifyUser(response.data.result);
          nextTick(() => {
            dirty.value = false;
          });
        }).catch(() => {
          commentLoading.value -= 1;
        });
      }
    }

    const InitChart = () => {
      showChart.value = true;
      nextTick(() => {
        if (chart1.value) {
          console.warn('InitChart', chart1.value, document.querySelector("#chart1"), chartInstance)
          var x = CalcOptions(false);
          // eslint-disable-next-line no-undef
          chartInstance = new ApexCharts(document.querySelector(`#chart${props.chartid}`), {
            ...x,
            series: x.series,
          });
          chartInstance.render();
        }
      });
    }

    const RefreshChart = () => {
      GetChartData();
      GetComments();
    }

    onBeforeMount(() => {
      //console.log('before mount')
      //InitChart();
    });

    onMounted(() => {
      parentTitle.value = props.options.title || props.title;
      ChartTitles.value.push(props.options.title || props.title)
      APIs.value.push(props.options.dataApi || props.dataApi)
      RefreshChart();
    });

    return {
      chart1,
      chart2,
      remarks,
      dialog,
      //hcInstance1,
      editMode,
      OptionsDefault,
      OptionsDefaultFS,
      showChart,
      loading,
      commentLoading,
      dirty,
      _series,
      renderKey,
      CalcOptions_V1,
      CalcOptions,
      LoadCallback,
      RefreshChart,
      SaveChanges
    }
  },
});
</script>

<style lang="scss">
.graph-comment {
  .q-field__control {
    height: auto;
  }
}
</style>
