<template>
  <Dashboard @viewchanged="localView = $event" group="Corporate" >
    <div :class="calcParentClass" style="padding-bottom: 32px">

      <component
        v-for="(c, i) in items"
        :key="i"
        :class="calcChildClass"
        :is="c.component"
        :title="c.title"
        :view="localView"
        :graphopts="c.graphopts"
        :options="c"
      />
    </div>
  </Dashboard>
</template>

<script>
import { defineComponent, defineAsyncComponent, computed, ref, onMounted } from "vue";
import { useMainStore } from "../../store";

export default defineComponent({
  name: "Corporate",
  components: {
    Dashboard: defineAsyncComponent(() =>
      import("@/components/General/Dashboard.vue")
    ),
  },
  setup() {
    const mainStore = useMainStore();
    const localView = ref("chart");
    const items = ref([
      {
        component: "QualityCard",
        title: "Quality",
        key: "QUALITY",
        dataApi: "svc/corporate/data/quality/current",
        historyApi: "svc/corporate/data/quality/history",
        saveApi: "svc/corporate/data/quality/save",
        graphopts: {
          title: "Quality",
          dataApi: "svc/corporate/graph/quality/",
          commentApi: "svc/comment/corporate/get/quality",
          commentApiSave: "svc/comment/corporate/save/quality",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Safety",
        dataApi: "svc/corporate/data/quality/current",
        historyApi: "svc/corporate/data/quality/history",
        saveApi: "svc/corporate/data/quality/save",
        graphopts: {
          title: "Safety",
          dataApi: "svc/graph/corporate/safety/",
          commentApi: "svc/comment/corporate/get/safety",
          commentApiSave: "svc/comment/corporate/save/safety",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Delivery",
        graphopts: {
          title: "Delivery",
          dataApi: "svc/graph/corporate/delivery/",
          commentApi: "svc/comment/corporate/get/delivery",
          commentApiSave: "svc/comment/corporate/save/delivery",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Efficiency",
        graphopts: {
          title: "Efficiency",
          dataApi: "svc/graph/corporate/efficiency/",
          commentApi: "svc/comment/corporate/get/efficiency",
          commentApiSave: "svc/comment/corporate/save/efficiency",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Net Inventory",
        graphopts: {
          title: "Net Inventory",
          dataApi: "svc/graph/corporate/netinventory/",
          commentApi: "svc/comment/corporate/get/netinventory",
          commentApiSave: "svc/comment/corporate/save/netinventory",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Headcount",
        graphopts: {
          title: "Headcount",
          dataApi: "svc/graph/corporate/headcount/",
          commentApi: "svc/comment/corporate/get/headcount",
          commentApiSave: "svc/comment/corporate/save/headcount",
          remarkType: [1]
        }
      },
    ]);
    const calcParentClass = computed(() => {
      if (localView.value === "grid") {
        return `grid-container block`;
      }

      return `row`;
    });
    const calcChildClass = computed(() => {
      if (localView.value === "grid") {
        return `card-tile grid-mode q-pa-sm full-width`;
      }
      return `card-tile q-pa-sm`
    });

    //col-12 col-sm-6 col-md-4 

    onMounted(() => {
      localView.value = mainStore.DashboardView;
    })

    return {
      localView,
      items,
      calcParentClass,
      calcChildClass,
    };
  },
});
</script>
