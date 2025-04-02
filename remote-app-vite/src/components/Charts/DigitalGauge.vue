<template>
  <QCard style="width:100%;height:100%">
    <QCardSection>{{ title }}</QCardSection>
    <QCardSection class="q-py-none text-center text-bold text-h2 row" style="height:calc(100% - 60px);min-height:220px">
      <div style="margin:auto;color:#424242;font-weight:400">{{ actualVal }}</div>
    </QCardSection>
  </QCard>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import server from "../../server";
//import general from "../../mixins/general";

export default {
  name: "DigitalGauge",
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
    dataApi: {
      type: String,
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
    const lastUpdate = ref(null);
    const lastUpdateStr = ref("");
    const categories = ref([]);
    const chart = ref(null);
    const show = ref(false);
    const actualVal = ref(null);

    const chartOptions = computed(() => {
      var options = {
        chart: {
          height: 350,
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
                color: undefined,
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
          if (response.data.result.success) {
            actualVal.value = response.data.result.payload.toString();
          }
        });
      } else {
        actualVal.value = props.value;
      }
    };

    onMounted(() => {
      GetData();
    });

    return {
      show,
      chart,
      lastUpdate,
      lastUpdateStr,
      categories,
      chartOptions,
      actualVal
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