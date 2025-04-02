<template>
  <QCard style="width: 100%">
  <q-linear-progress v-if="loading" indeterminate></q-linear-progress>
    <QCardSection :class="titleClass">{{ title }}</QCardSection>
    <QCardSection class="q-py-none">
      <apexchart
        ref="chart"
        height="300px"
        width="100%"
        :options="chartOptions"
        :series="_series"
      ></apexchart>
    </QCardSection>
  </QCard>
</template>

<script>
import { ref, computed, onMounted, watch, inject, onBeforeUnmount } from "vue";
import server from "../../server";
//import general from "../../mixins/general";

export default {
  name: "BarChart",
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
      default: () => {},
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

    const darkMode = inject("darkMode");

    watch(props.value, (e) => {
      actualVal.value = e;
    });

    const chartOptions = computed(() => {
      var options = {
        chart: {
          height: 300,
          type: "bar",
          fontFamily: 'Montserrat, Archivo',
          toolbar: {
            show: false
          }
        },
        plotOptions: {
          radialBar: {
            dataLabels: {
              show: true,
              name: {
                show: false,
                fontSize: "16px",
                fontFamily: undefined,
                fontWeight: 600,
                color: undefined,
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "32px",
                fontFamily: undefined,
                fontWeight: 400,
                color: darkMode ? "white": "black",
                offsetY: 8,
                formatter: function (val) {
                  return val + "%";
                },
              },
              total: {
                show: false,
                label: "Total",
                color: "#373d3f",
                fontSize: "16px",
                fontFamily: undefined,
                fontWeight: 600,
                formatter: function (w) {
                  return (
                    w.globals.seriesTotals.reduce((a, b) => {
                      return a + b;
                    }, 0) /
                      w.globals.series.length +
                    "%"
                  );
                },
              },
            },
          },
        },
        //labels: [""],
      };

      return {...options, ...apexOpts.value};
    });

    const GetData = () => {
      if (props.wsEvent !== null){
        SendData();
      }else if (props.dataApi !== null) {
        loading.value = true;
        server.post(props.dataApi, props.args).then((response) => {
          loading.value = false;
          if (response.data.result.success) {
            actualVal.value = response.data.result.payload;
          }
        }).catch(() => {
          loading.value = false;
        });
      } else {
        actualVal.value = props.value;
      }
    };

    const SendData = () => {
      if (props.wsEvent !== null){
        loading.value = true;
      }      
    }

    const ParseWSData  = (e) => {
      loading.value = false;
      apexOpts.value = {...e};
    }

    const HookEvents = (on = true) => {      
      if (props.wsTriggers !== null){
        var e = props.wsTriggers.split(",");
        e.map(x => {
          if (on){
            eventBus.$on(x, SendData);
          }else{
            eventBus.$off(x, SendData);
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
      _series,
      actualVal,
      show,
      chart,
      lastUpdate,
      lastUpdateStr,
      categories,
      chartOptions,
      eventBus,
      loading
    };
  }
};
</script>