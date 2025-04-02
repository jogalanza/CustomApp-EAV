<template>
  <q-card style="width: 100%">
    <q-card-section :class="titleClass" style="text-overflow:ellipsis;white-space:nowrap;overflow:hidden">{{ title }}</q-card-section>
    <q-card-section class="q-py-none text-h3 text-bold text-center justify-center column" style="min-height: 120px">
      <div style="font-size: 1.6em" class="text-primary">{{ actualVal }}</div>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref, computed, onMounted, watch, inject, onBeforeUnmount } from "vue";
import server from "../../server";
//import general from "../../mixins/general";

export default {
  name: "CircleChart",
  props: {
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
    const eventBus = inject("eventBus")
    const lastUpdate = ref(null);
    const lastUpdateStr = ref("");
    const categories = ref([]);
    const chart = ref(null);
    const show = ref(false);
    const actualVal = ref(0);

    const darkMode = inject("darkMode");

    watch(props.value, (e) => {
      actualVal.value = e;
    });

    const chartOptions = computed(() => {
      var options = {
        chart: {
          height: 300,
          type: "radialBar",
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

      return options;
    });

    const GetData = () => {
      if (props.dataApi !== null) {
        server.post(props.dataApi, props.args).then((response) => {
          if (response.data.success) {
            actualVal.value = response.data.payload;
          }
        });
      } else {
        actualVal.value = props.value;
      }
    };

    onMounted(() => {
      eventBus.$on("ws-update-dashboard", GetData);
      setTimeout(() => {
        GetData();
      }, 500);
    });

    onBeforeUnmount(() => {
      eventBus.$off("ws-update-dashboard", GetData);
    });

    return {
      actualVal,
      show,
      chart,
      lastUpdate,
      lastUpdateStr,
      categories,
      chartOptions,
    };
  },

  // mounted() {
  //   this.$ws.$on("ws-update-dashboard", this.GetData);
  //   this.$eventHub.$on("stat-update-last-time", this.CalcLastUpdate);
  //   setTimeout(this.GetData, 500);
  // },
  // beforeDestroy() {
  //   this.$ws.$off("ws-update-dashboard", this.GetData);
  //   this.$eventHub.$off("stat-update-last-time", this.CalcLastUpdate);
  // },
};
</script>