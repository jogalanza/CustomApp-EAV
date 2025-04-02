<template>
  <QCard class="chart-card" :style="`width:${width}`">
    <!-- max-height:600px -->
    <QToolbar class="chart-toolbar">
      <QBtn v-if="level > 1" icon="mdi-arrow-left" dense rounded flat @click="ChartLevelUp">
        <QTooltip>Chart one level up</QTooltip>
      </QBtn>
      <QToolbarTitle style="font-size:16px">{{ ActiveTitle }}</QToolbarTitle>

      <QBtn v-if="showToolbarControl" icon="mdi-refresh" dense rounded flat @click="RefreshChart">
        <QTooltip>Refresh</QTooltip>
      </QBtn>
      <QBtn v-if="showToolbarControl" icon="mdi-download" dense rounded flat >
        <QMenu :offset="[130, 0]" :dark="GetDarkModeBeta">
          <QList :dark="GetDarkModeBeta">
            <QItem dense clickable @click="DownloadChart" :dark="GetDarkModeBeta">
              <QItemSection class="qmenu-text">
                Download Chart as Image
              </QItemSection>
            </QItem>
            <QItem dense clickable @click="DownloadData" :dark="GetDarkModeBeta"> 
              <QItemSection class="qmenu-text">
                Export Data to Excel
              </QItemSection>
            </QItem>
          </QList>
        </QMenu>
        <!-- <QTooltip>Download Chart as Image</QTooltip> -->
      </QBtn>
      <QBtn v-if="showToolbarControl" icon="mdi-fullscreen" dense rounded flat @click="GoFullScreen">
        <QTooltip>Fullscreen View</QTooltip>
      </QBtn>
    </QToolbar>
    <!-- height:${height}; -->
    <QCardSection :style="`padding-top:0px`">
      <highcharts 
        ref="Chart1" 
        :options="OptionsDefault" 
        :highcharts="hcInstance1" 
        :callback="LoadCallback" 
        :updateArgs="[true, true, {duration: 1000}]"
        style="width:100%"
        ></highcharts>
      <q-inner-loading :showing="busy" :dark="GetDarkModeBeta">
        <QItemLabel class="loading-message">{{ busyMsg }}</QItemLabel>
        <!-- <q-spinner-gears v-if="showSpinner" size="50px" color="green" /> -->
        <q-spinner-ball v-if="showSpinner" size="50px" color="green" />
      </q-inner-loading>
    </QCardSection>

    <q-dialog persistent maximized v-model="dialog">
      <QCard :class="{'modern-beta-dialog': GetDarkModeBeta}">
        <QToolbar class="chart-toolbar">
          <QBtn v-if="level > 1" icon="mdi-arrow-left" dense rounded flat @click="ChartLevelUp">
            <QTooltip>Chart one level up</QTooltip>
          </QBtn>
          <QToolbarTitle>{{ ActiveTitle }}</QToolbarTitle>
          <QBtn icon="mdi-close" dense rounded flat @click="dialog =  false" />
        </QToolbar>
        <QCardSection style="height: calc(100vh - 64px);">
          <highcharts v-if="vwDlgChart" ref="Chart2" :options="OptionsFullScreen" :highcharts="hcInstance1" :deepCopyOnUpdate="false" style="height:100%"></highcharts>
          <q-inner-loading :showing="busy" :dark="GetDarkModeBeta">
            <QItemLabel class="loading-message">{{ busyMsg }}</QItemLabel>
            <q-spinner-gears v-if="showSpinner" size="50px" color="green" />
          </q-inner-loading>
        </QCardSection>
      </QCard>
    </q-dialog>
  </QCard>
</template>

<style scoped>
.qmenu-text{
  font-size: 0.9em;
}
.chart-toolbar {
  /* background: linear-gradient(#424340, #52554e, #444444); */
  background-image: linear-gradient(#44883e, #64a70b);
  color: white;
  height: 56px;
}
</style>
<style>
.loading-message{
  font-weight: bold;
  color: green;
  margin-bottom: 16px;
}
</style>

<script>
import { Chart } from "highcharts-vue";
import HighCharts from "highcharts";
import exportingInit from 'highcharts/modules/exporting'
import exportDataInit from 'highcharts/modules/export-data'
import { ref, computed } from "vue"
import server from "../server"

exportingInit(HighCharts)
exportDataInit(HighCharts)

export default {
  name: "HighChart",
  components: {
    highcharts: Chart
  },
  props: {
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
      default: '480px'
    },
    showToolbarControl: {
      type: Boolean,
      default: true
    },
    trigger: {
      type: String,
      default: 'refresh-charts'
    }
  },
  setup(props) {
    const Chart1 = ref(null);
    const Chart2 = ref(null);
    const dialog = ref(false);
    const zoomMode = ref(false);
    const vwDlgChart = ref(true);
    const parentTitle = ref('');
    const APIs = ref([]);
    const ChartTitles = ref([]);
    const level =  ref(1);
    const busyMsg = ref('');
    const busy = ref(true);
    const showSpinner = ref(true);
    const hcInstance1 = ref(HighCharts);
    const chartOptions = ref({
      series: [
        {
          data: [1, 2, 3] // sample data
        }
      ]
    });

    const chartData = ref({
      series: []
    });

    //computed
    const ActiveAPI = computed(() => {
      if (level.value > 1) return APIs.value[level.value - 1]
      return APIs.value[0]
    });

    const ActiveTitle = computed(() => {
      if (level.value > 1) return ChartTitles.value[level.value - 1]
      return ChartTitles.value[0]
    });

    const OptionsDefault = computed(() => {
      if (!chartData.value) return chartOptions.value;
      return CalcOptions()
    });

    const OptionsFullScreen = computed(() => {
      if (!chartData.value) return chartOptions.value;
      return CalcOptions(true)
    });

    const GetDarkModeBeta = computed(() => { return false; })
    //methods

    const CalcOptions = (fullscreen = false) => {
      var merge = require("lodash.merge");

      var _yAxis = [];
      _yAxis.push(GetDefault_YAxis(fullscreen));

      if (chartData.value.yAxis && chartData.value.yAxis.length > 1) {
        _yAxis.push(GetDefault_YAxis(fullscreen));
      }

      //console.log(_yAxis);
      //  height: dialog ? null : `${height}`,

      var vm = this;

      var _options = {
        chart: {
          style: {
            fontFamily: "Archivo",
          },
          height: dialog.value ? null : `${props.height.value}`,
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
            selection: function (event) {
                if (event.xAxis) {
                    vm.zoomMode = true;
                } else {
                    vm.zoomMode = false;
                }
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
              radius: fullscreen ? 6 : 3
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
                click: function() {
                  //console.log('Series clicked', this, vm);
                  if (this.series.options.drillDownInfoArr.length > this.x) {
                      var payload = this.series.options.drillDownInfoArr[this.x]
                      console.log(payload)
                      if (payload && payload.chartDataAPI !== '' && payload.chartDataAPI !== null){
                        vm.InvokeDrillDownChart(payload);
                      }else if (payload && payload.emit){
                        vm.InvokeChartEmit(payload);
                      }
                      
                  }
                }
              }
            },
            events: {
              hide: function() {
                //console.log("series hide");
                //console.log(this, vm);
              },
              show: function() {
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
                color: GetDarkModeBeta.value ? '#aaaaaa' : 'black',
                fontSize: fullscreen ? "14px" : "11px",
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
                color: GetDarkModeBeta.value ? '#aaaaaa' : 'blue',
                fontSize: fullscreen ? "16px" : "12px"
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
              text: ActiveTitle
            },
            legend: {
              title: {
                style: "font-size: 10px"
              },
              itemStyle: {
                fontSize: "10px"
              }
            }
          }
        }
      };

      var result = merge({}, _options, chartData);

      if (fullscreen) result.chart.marginBottom = null
      
      return result;
    }

    const LoadCallback = () => {
      //console.log('LoadCallback', e)
    }

    const ZoomOut = () => {
      //console.log(Chart, $refs.Chart1.chart)
      Chart1.value.chart.zoomOut()
      if (Chart2.value) Chart2.value.chart.zoomOut()
    }

    const DownloadChart = () => {
      //console.log($refs.Chart1, hcInstance1, zoomMode)
      Chart1.value.chart.exportChart({
        filename: `export`
      })
    }

    const DownloadData = () => {
      //console.log($refs.Chart1, hcInstance1, zoomMode)
      //console.log($refs.Chart1.chart);
      //var x = $refs.Chart1.chart.getTable();
      Chart1.value.chart.downloadXLS();
    }

    const GetDefault_YAxis = (fullscreen = false) => {
      var x = {
        softMin: 0,
        labels: {
          style: {
            fontSize: fullscreen ? "16px" : "12px",
            color: GetDarkModeBeta.value ? '#aaaaaa' : 'black'
          }
          // formatter: function () {
          //     return Highcharts.numberFormat(value, 0, '.', ',');
          // }
        },
        title: {
          style: {
            fontWeight: "900",
            fontSize: fullscreen ? "18px" : "14px",
            color: GetDarkModeBeta.value ? '#aaaaaa' : 'black'
          }
        }
      };
      return x;
    }

    const ChartLevelUp = () => {
      level.value -= 1
      APIs.value.pop()
      ChartTitles.value.pop()
      RefreshChart()
    }

    const InvokeDrillDownChart = (api) => {
      if (api.chartDataAPI === '') return
      APIs.value.push(`${server.defaults.baseURL}/${api.chartDataAPI}`)
      ChartTitles.value.push('') //to be filled in later
      level.value += 1
      RefreshChart();
    }

    const InvokeChartEmit = (payload) => {
      if (!payload.emit) return

      //UpdateChartFilterSite(payload.emit)
      
      //$eventHub.$emit('update-chart-filter')

      // $nextTick(() => { 
      //   navigateTo({
      //     route: { name: 'Dashboard'}
      //   })
      // })
    }

    const SetBusy = (val, msg, spinner = true) => {
      busyMsg.value = msg
      busy.value = val
      showSpinner.value = spinner
    }

    const GoFullScreen = () => {
      vwDlgChart.value = false
      dialog.value = true
      setTimeout(function(){ 
        //console.log('timeout')
        vwDlgChart.value = true
      }, 500);
    }

    const RefreshChart = () => {
      //console.log('RefreshChart called',ActiveAPI, ChartFilter)
      //&& ChartFilter.Site !== null && ChartFilter.Month !== null && ChartFilter.Year !== null
      if (ActiveAPI.value !== ''){
        ZoomOut()
        SetBusy(true, 'Loading')
        server.post(ActiveAPI.value).then(response => {
          SetBusy(false, '')
          if (response.data !== ''){     
            //console.log(response.data.chartData)        
            chartData.value = {...response.data.chartData}
            //$emit('chart-data-received')

            //Update chart title for drilldown
            if (level.value > 1 && response.data.chartData.chartTitle) {
              //$set(ChartTitles, level - 1, response.data.chartData.chartTitle)
            }

            //check for loading message
            if (response.data.chartData.loadingMessage !== ""){
              SetBusy(true, response.data.chartData.loadingMessage, response.data.chartData.success)
            }
          }
        }).catch(() => {
          SetBusy(false, '')
        })
      }
    }

    return {
      dialog,
      level,
      zoomMode,
      vwDlgChart,
      parentTitle,
      busyMsg,
      busy,
      showSpinner,
      hcInstance1,
      Chart1,
      Chart2,
      OptionsDefault,
      OptionsFullScreen,
      CalcOptions,
      LoadCallback,
      DownloadChart,
      DownloadData,
      ChartLevelUp,
      InvokeDrillDownChart,
      InvokeChartEmit,
      GoFullScreen,
      GetDarkModeBeta,
      RefreshChart,
      ActiveTitle
    }
  },
  // computed: {
  //   ...mapGetters([
  //     'FilterInfo',
  //     'GetDarkModeBeta'
  //   ]),
  //   ChartFilter(){
  //     return $store.state.ChartFilter
  //   },
    
  // },
  // methods: {
  //   ...mapActions([
  //     'UpdateChartFilterSite'
  //   ]),
  // },
  // mounted(){
  //   console.log('Highcharts mounted')
  //   parentTitle = title
  //   ChartTitles.push(title)
  //   APIs.push(dataApi)
  //   $eventHub.$on(trigger, RefreshChart)
  //   RefreshChart()
  //   // $nextTick(() => {
  //   //   RefreshChart()
  //   // })
  // },
};
</script>
