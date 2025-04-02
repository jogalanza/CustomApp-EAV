<template>
  <QCard flat class="graph-card q-pb-md">
    <!-- <q-linear-progress indeterminate v-show="loading > 0" color="green" /> -->
    <QToolbar class="chart-toolbar q-py-sm q-px-md">
      <slot name="chart-toolbar">
        <q-spinner v-if="loading > 0" color="white" size="20px" />
        <!-- <QBtn round flat icon="o_download" dense size="12px"><QTooltip>Download</QTooltip></QBtn> -->
        <div class="card-title">{{ CalcTitle }}</div>
        <QBtn v-if="dirty" round flat icon="o_save" dense @click="SaveChanges" size="12px"><QTooltip>Save Changes</QTooltip></QBtn>
        <q-toggle v-if="options.toggleView && (options.toggleView.visible === undefined || options.toggleView.visible(mainStore.SessionOptions))" v-model="altView" round flat dense size="32px"
          color="orange">
          <QTooltip>{{ `${(altView ? options.toggleView?.label || 'Switch view' : 'Default view')}` }}</QTooltip>
        </q-toggle>
        <QBtn v-if="options.externalLink" round flat icon="o_open_in_new" dense @click="OpenLink" size="12px">
          <QTooltip>{{ `${(options.externalLink?.label || 'Open an external link')}` }}</QTooltip>
        </QBtn>
        <QBtn round flat icon="o_refresh" dense @click="RefreshChart" size="12px"><QTooltip>Refresh</QTooltip></QBtn>
        <QBtn round flat icon="o_fullscreen" dense @click="dialog = !dialog" size="12px"><QTooltip>Toggle Fullscreen View</QTooltip></QBtn>

        <QBtn v-if="extramenu && extramenu.filter(e => e.view === undefined || e.view.indexOf(1) > -1).length > 0" icon="o_more_vert" round flat dense>
          <QMenu auto-close>
            <QList>
              <QItem v-for="(m, i) in extramenu.filter(e => e.view === undefined || e.view.indexOf(1) > -1)" :key="i" clickable @click="m.action" dense>
                <QItemSection>{{ m.label }}</QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </slot>
    </QToolbar>

    <QCardSection class="q-pa-none">
      <highcharts ref="chart1" :options="OptionsDefault" :redrawOnUpdate="true" :oneToOneUpdate="false" :animateOnUpdate="true" style="width: 100%; height: 100%" :key="renderKey"></highcharts>
    </QCardSection>

    <div v-if="CalcShowComment" class="side-comment col-12 q-pa-sm scroll q-mx-md">
      <QCardSection v-if="!CalcReadOnly" class="q-pa-none row" style="position: absolute; z-index: 2; right: 20px;">
        <QBtn size="9px" icon="o_content_copy" color="#b3a3a3" flat round @click.stop="InvokeCopyPrevious" padding="xs" style="color: #b3a3a3">
          <QTooltip>Copy from previous period</QTooltip>
        </QBtn>
      </QCardSection>
      <QCardSection v-if="options.remarkType && options.remarkType.indexOf(1) > -1" class="q-pa-none q-pb-sm">
        <q-input v-model="remarks.comment" :disable="commentLoading > 0" :loading="commentLoading" dense label="Comment" class="graph-comment" type="textarea" autogrow :maxlength="5000" borderless
          :readonly="CalcReadOnly" />
      </QCardSection>
      <QCardSection v-if="options.remarkType && options.remarkType.indexOf(2) > -1" class="q-pa-none q-pb-sm">
        <q-input v-model="remarks.highlights" :disable="commentLoading" :loading="commentLoading" dense label="Highlights" class="graph-comment" type="textarea" autogrow :maxlength="5000" borderless
          :readonly="CalcReadOnly" />
      </QCardSection>
      <QCardSection v-if="options.remarkType && options.remarkType.indexOf(3) > -1" class="q-pa-none q-pb-sm">
        <q-input v-model="remarks.lowlights" :disable="commentLoading" :loading="commentLoading" dense label="Lowlights" class="graph-comment" type="textarea" autogrow :maxlength="5000" borderless
          :readonly="CalcReadOnly" />
      </QCardSection>
    </div>


    <q-dialog v-model="dialog" persistent>
      <QCard class="graph-card-fs">
        <!-- <q-linear-progress indeterminate v-show="loading > 0" color="green" /> -->
        <QToolbar class="chart-toolbar">
          <!-- <QBtn round flat icon="o_download" dense><QTooltip>Download</QTooltip></QBtn> -->
          <div class="card-title" style="font-size: 2em;">{{ CalcTitle }}</div>
          <q-spinner v-if="loading > 0" color="white" size="30px" />
          <QBtn v-if="dirty" round flat icon="o_save" dense @click="SaveChanges"><QTooltip>Save Changes</QTooltip></QBtn>
          <q-toggle v-if="options.toggleView && (options.toggleView.visible === undefined || options.toggleView.visible(mainStore.SessionOptions))" v-model="altView" round flat dense color="orange">
            <QTooltip>{{ `${(altView ? options.toggleView?.label || 'Switch view' : 'Default view')}` }}</QTooltip>
          </q-toggle>
          <QBtn v-if="options.externalLink" round flat icon="o_open_in_new" dense @click="OpenLink">
            <QTooltip>{{ `${(options.externalLink?.label || 'Open an external link')}` }}</QTooltip>
          </QBtn>
          <QBtn round flat icon="o_refresh" dense @click="RefreshChart"><QTooltip>Refresh</QTooltip></QBtn>
          <QBtn round flat icon="o_close" dense @click="dialog = !dialog"><QTooltip>Toggle Fullscreen View</QTooltip></QBtn>
        </QToolbar>
        <QCardSection v-if="showChart" class="row" style="height: calc(100% - 50px)">
          <div :class="`${(CalcShowComment ? 'col-12 col-sm-8' : 'col-12')}`" style="height: calc(100% - 16px)">
            <highcharts ref="chart2" :key="renderKey" :options="OptionsDefaultFS" :highcharts="hcInstance1" :callback="LoadCallback" :updateArgs="[true, true, { duration: 1000 }]"
              style="height: 100%"></highcharts>
          </div>
          <div v-if="CalcShowComment" :class="`side-comment ${(CalcShowComment ? 'col-12 col-sm-4' : 'col-12')} q-pa-md scroll`">
            <QCardSection v-if="!CalcReadOnly" class="q-pa-none row" style="position: absolute; z-index: 2; right: 24px; margin-top: -8px;">
              <QBtn size="14px" icon="o_content_copy" color="#b3a3a3" flat round @click.stop="InvokeCopyPrevious" padding="xs" style="color: #b3a3a3">
                <QTooltip>Copy from previous period</QTooltip>
              </QBtn>
            </QCardSection>
            <QCardSection v-if="options.remarkType && options.remarkType.indexOf(1) > -1" class="q-pa-none q-pb-md">
              <q-input v-model="remarks.comment" :disable="commentLoading" :loading="commentLoading" dense label="Comment" class="graph-comment full-window" type="textarea" autogrow :maxlength="5000"
                borderless :readonly="CalcReadOnly" />
            </QCardSection>
            <QCardSection v-if="options.remarkType && options.remarkType.indexOf(2) > -1" class="q-pa-none q-pb-md">
              <q-input v-model="remarks.highlights" :disable="commentLoading" :loading="commentLoading" dense label="Highlights" class="graph-comment full-window lohigh" type="textarea" autogrow
                :maxlength="5000" borderless :readonly="CalcReadOnly" />
            </QCardSection>
            <QCardSection v-if="options.remarkType && options.remarkType.indexOf(3) > -1" class="q-pa-none q-pb-md">
              <q-input v-model="remarks.lowlights" :disable="commentLoading" :loading="commentLoading" dense label="Lowlights" class="graph-comment full-window lohigh" type="textarea" autogrow
                :maxlength="5000" borderless :readonly="CalcReadOnly" />
            </QCardSection>
          </div>
        </QCardSection>
      </QCard>
    </q-dialog>
  </QCard>
</template>

<style lang="scss"></style>

<script>
import { defineComponent, ref, watch, computed, onMounted, nextTick, inject } from "vue";
import { Chart } from "highcharts-vue";
//import VueHighcharts from 'vue3-highcharts';
import HighCharts from "highcharts";
import exportingInit from "highcharts/modules/exporting";
import exportDataInit from "highcharts/modules/export-data";
import { useMainStore } from "../../store";
import { useEvalFilter } from "../composables/evalFilter"
import server from "../server.js"
import { useQuasar } from "quasar";
import general from "../mixins/general";
import axios from "axios";
import { useHelper } from "../../composables/helper";
import useComment from '../composables/comment';

exportingInit(HighCharts);
exportDataInit(HighCharts);

export default defineComponent({
  components: {
    highcharts: Chart,
  },
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    override: {
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
    extramenu: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const CalcReadOnly = inject("CalcReadOnly");
    const mainStore = useMainStore();
    const q = useQuasar();
    const { IsValidFilter } = useEvalFilter();
    const { NotifyUser, ConfirmAction } = general();
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
    const commentLoading = ref(false);
    const dirty = ref(false);
    const altView = ref(false);
    const { renderKey, UpRender } = useHelper();
    const {
      SetCategory,
      CopyPrevious,
    } = useComment();

    const isFetching = ref(false);

    const chartData = ref({
    });
    const remarks = ref({});
    const hcInstance1 = ref(HighCharts);
    const showChart = ref(true);

    const cancelToken = ref(null);

    const HCData = ref({});
    const HCDataFS = ref({});

    watch(remarks, () => {
      dirty.value = true;
    }, { deep: true });

    watch(() => mainStore.SessionOptions.Consolidated, (newVal) => {
      if (newVal) {
        altView.value = false;

      }
      ToggleShowChart();

    }, { deep: true });

    watch(altView, () => {
      GetChartData();
    }, { deep: true });

    watch(dialog, (newVal) => {
      if (newVal) {
        showChart.value = false;
        setTimeout(() => {
          showChart.value = true;
        }, 400);
      } else {
        showChart.value = false;
      }
    }, { deep: true });

    const ActiveAPI = computed(() => {
      console.warn('ActiveAPI', level.value, APIs.value);
      if (level.value > 1) return APIs.value[level.value - 1]
      return APIs.value[0]
    });

    const CalcShowComment = computed(() => {
      if (mainStore.SessionOptions.Consolidated && mainStore.SessionOptions.Region?.Name == "ByRegion"){
        return false;
      }
      return true;
    })

    // const ChartFilter = computed(() => {
    //   return null;  //.$store.state.ChartFilter
    // });

    const CalcTitle = computed(() => {
      return props.override?.graphopts?.title ? props.override.graphopts.title : props.options.title ?? props.title;
    })

    const ActiveTitle = computed(() => {
      if (level.value > 1) return ChartTitles.value[level.value - 1]
      return ChartTitles.value[0];
    });

    const OptionsDefault = computed(() => {
      //if (!chartData.value) return chartData.value;
      return CalcOptions()
    });

    const OptionsDefaultFS = computed(() => {
      //if (!chartData.value) return chartData.value;
      return CalcOptions(true)
    });

    const ToggleShowChart = () => {
      showChart.value = false;
      setTimeout(() => {
        showChart.value = true;
      }, 400);
    }

    const GetDefault_YAxis = (fullscreen = false) => {
      var x = {
        softMin: 0,
        labels: {
          style: {
            fontSize: fullscreen ? "18px" : "10px",
            color: q.dark.isActive ? '#aaaaaa' : 'black'
          }
          // formatter: function () {
          //     return Highcharts.numberFormat(value, 0, '.', ',');
          // }
        },
        title: {
          style: {
            fontWeight: "900",
            fontSize: fullscreen ? "18px" : "11px",
            color: q.dark.isActive ? '#aaaaaa' : 'black'
          }
        },
        // plotLines: {
        //   color: q.dark.isActive ? "#555555" : "#999999"
        // }
      };
      return x;
    }

    const CalcOptions = (fullscreen = false) => {

      //if (!chartData.value) return chartData.value;

      var merge = require("lodash.merge");

      var _yAxis = [];
      _yAxis.push(GetDefault_YAxis(fullscreen));

      if (chartData.value.yAxis && chartData.value.yAxis.length > 1) {
        _yAxis.push(GetDefault_YAxis(fullscreen));
      }

      //console.log(_yAxis);
      //  height: dialog ? null : `${height}`,

      //var vm = this;
      //dialog.value ? null : `${props.height}`,

      var _options = {
        chart: {
          style: {
            fontFamily: "SAP72",

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
              radius: fullscreen ? 11 : 3
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
                fontSize: fullscreen ? "18px" : "10px",
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
                fontSize: fullscreen ? "18px" : "10px"
              },
              padding: 10,
              autoRotationLimit: 70
            },
            title: {
              style: {
                color: q.dark.isActive ? '#dddddd' : 'blue',
                fontSize: fullscreen ? "18px" : "10px"
              },
              margin: 30
            },
            opposite: true
          }
        ],
        yAxis: _yAxis,
        tooltip: {
          shared: true,
          style: {
            fontSize: fullscreen ? "18px" : "12px"
          },
          formatter: function () {
            //return HighCharts.numberFormat(this.y, 0, '', ',');

            let s = '<b>' + this.x + '</b><br/>';  // Formatting the X-axis label (if needed)

            this.points.forEach(function (point) {
              let formattedValue = point.y % 1 === 0
                ? HighCharts.numberFormat(point.y, 0, '', ',')  // Whole number
                : point.y.toLocaleString();
              // Create a colored box for the series
              s += '<span style="color:' + point.series.color + '">\u25CF</span> ';
              // Add series name and formatted value with commas
              s += point.series.name + ': <b>' + formattedValue + '</b><br/>';
            });

            return s;
          }
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
            fontSize: fullscreen ? "18px" : "12px",
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
            a.radius = fullscreen ? 7 : 2;
            a.lineWidth = fullscreen ? 8 : 3;
            element.marker = a;
          }

          if (element.dataLabels?.enabled) {
            var a1 = { ...element.dataLabels };
            a1.style = {
              fontSize: fullscreen ? "18px" : "10px"
            };
            element.dataLabels = a1;
          }
        });
      }


      result.plotOptions.series.marker.radius = fullscreen ? 12 : 4;

      //console.warn('eval', result);


      return result;
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

    const ZoomOut = () => {
      //console.log(Chart, this.$refs.Chart1.chart)
      if (chart1.value) {
        chart1.value.chart.zoomOut()
      }
      if (chart2.value) {
        chart2.value.chart.zoomOut()
      }
    }

    const SetBusy = (val, msg, spinner = true) => {
      busyMsg.value = msg
      busy.value = val
      showSpinner.value = spinner
    }

    const GetChartData = () => {
      console.warn('GetChartData', ActiveAPI.value, IsValidFilter(), customApi)

      if (isFetching.value) return

      isFetching.value = true;

      if ((ActiveAPI.value !== '' && IsValidFilter()) || customApi != undefined) {



        ZoomOut()
        SetBusy(true, 'Loading')
        loading.value += 1;

        if (cancelToken.value) cancelToken.value.cancel();

        cancelToken.value = axios.CancelToken.source();

        var customApi = null;
        try {
          if (altView.value && props.options.toggleView?.dataApi) {
            customApi = props.options.toggleView.dataApi;
          }
        } catch {
          //
        }



        server.post(customApi ? customApi : ActiveAPI.value, {
          session: props.override?.session ? props.override?.session : mainStore.SessionOptions
        }, {
          cancelToken: cancelToken.value.token
        }).then(response => {
          //SetBusy(false, '')
          //if (response.data !== '') {
          loading.value -= 1;
          response.data.chartData.chart.height = "100%";
          chartData.value = { ...response.data.chartData }
          HCData.value = CalcOptions();
          HCDataFS.value = CalcOptions(true);

          //Update chart title for drilldown
          if (level.value > 1 && response.data.chartData.chartTitle) {
            ChartTitles.value[level.value - 1] = response.data.chartData.chartTitle;
          }

          //check for loading message
          if (response.data.chartData.loadingMessage !== "") {
            SetBusy(true, response.data.chartData.loadingMessage, response.data.chartData.success)
          }

          UpRender();

          //}
        }).catch(() => {
          loading.value -= 1;
          SetBusy(false, '')
        }).finally(() => {
          //
        });
      }

      isFetching.value = false;
    }

    const GetComments = () => {
      //
      if (props.options.commentApi) {
        commentLoading.value = true;
        server.post(props.options.commentApi, {
          session: props.override?.session ? props.override?.session : mainStore.SessionOptions
        }).then(response => {
          commentLoading.value = false;
          remarks.value = { ...response.data }
          nextTick(() => {
            dirty.value = false;
          });
        }).catch(() => {
          commentLoading.value = false;
        });
      }
    }

    const SaveChanges = () => {
      //i.e., the Comments
      if (props.options.commentApiSave) {
        remarks.value.highlightmode = props.options.remarkType.indexOf(2) > -1;
        commentLoading.value = true;
        server.post(props.options.commentApiSave, {
          session: props.override?.session ? props.override?.session : mainStore.SessionOptions,
          comments: remarks.value
        }).then(response => {
          commentLoading.value = false;
          NotifyUser(response.data);
          nextTick(() => {
            dirty.value = false;
          });
        }).catch(() => {
          commentLoading.value = false;
        });
      }
    }

    const InvokeCopyPrevious = () => {
      ConfirmAction("You are about to copy the comments from the previous period. Are you sure you want to proceed?", () => {
        SetCategory(remarks.value.Category);
        CopyPrevious(props.override?.session ? props.override?.session : mainStore.SessionOptions).then((response) => {
          remarks.value = { ...response };
        });
      })
    }

    const OpenLink = () => {
      window.open(props.options.externalLink.url, '_blank');
    }

    const RefreshChart = () => {
      GetChartData();
      GetComments();
    }

    const ShowCustom = () => {
      //reset
      console.warn('ShowCustom', props.options, APIs.value, ChartTitles.value, level.value)
      Initialize();


      nextTick(() => {

        setTimeout(() => {
          dialog.value = true;
        }, 800);
      });

    }

    const Initialize = () => {
      console.warn(`graph card init ${(props.options.title || props.title)}`)
      level.value = 1;
      ChartTitles.value = [];
      APIs.value = [];

      nextTick(() => {
        parentTitle.value = props.options.title || props.title;
        ChartTitles.value.push(props.options.title || props.title)
        APIs.value.push(props.options.dataApi || props.dataApi)
        RefreshChart();
      });


    }

    onMounted(() => {
      Initialize();
    });

    return {
      chart1,
      chart2,
      remarks,
      dialog,
      hcInstance1,
      editMode,
      OptionsDefault,
      OptionsDefaultFS,
      showChart,
      loading,
      commentLoading,
      dirty,
      CalcReadOnly,
      altView,
      mainStore,
      renderKey,
      CalcOptions,
      LoadCallback,
      RefreshChart,
      SaveChanges,
      OpenLink,
      HCData,
      HCDataFS,
      ShowCustom,
      InvokeCopyPrevious,
      CalcTitle,
      CalcShowComment
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
