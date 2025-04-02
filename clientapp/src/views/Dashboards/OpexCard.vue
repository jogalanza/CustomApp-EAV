<template>
  <Dashboard @viewchanged="localView = $event" group="OpEx">
    <div :class="calcParentClass" style="width: 100%">

      <component
        v-for="(c, i) in items"
        :key="i"
        :class="calcChildClass"
        style="min-height: 400px"
        :is="c.component"
        :title="c.title"
        :view="localView"
        :graphopts="c.graphopts"
      />
    </div>
  </Dashboard>
</template>

<script>
import { defineComponent, defineAsyncComponent, computed, ref } from "vue";

export default defineComponent({
  name: "Corporate",
  components: {
    Dashboard: defineAsyncComponent(() =>
      import("@/components/General/Dashboard.vue")
    ),
  },
  setup() {
    const localView = ref("chart");
    const items = ref([
      {
        component: "QualityCard",
        title: "Actual Productivity",
        graphopts: {
          title: "Actual Productivity",
          dataApi: "svc/graph/opex/productivity/",
          remarkType: [2,3]
        }
      },
      {
        component: "QualityCard",
        title: "Project Pipeline",
        graphopts: {          
          title: "Project Pipeline",
          dataApi: "svc/graph/opex/projectpipeline/",
          remarkType: [2,3]
        }
      },
      {
        component: "QualityCard",
        title: "Adv. Manuf. Project Distribution & MMR",
        graphopts: {         
          title: "Adv. Manuf. Project Distribution & MMR", 
          dataApi: "svc/graph/opex/advancedmanufacturing/",
          remarkType: [2,3]
        }
      },
      {
        component: "QualityCard",
        title: "Site Excursions",
        graphopts: {       
          title: "Site Excursions",   
          dataApi: "svc/graph/opex/siteexcursion/",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Yield / Rework",
        graphopts: {          
          title: "Yield / Rework",
          dataApi: "svc/graph/opex/firstpassyield/",
          remarkType: [2,3]
        }
      },
      {
        component: "QualityCard",
        title: "Cost of Quality",
        graphopts: {       
          title: "Cost of Quality",   
          dataApi: "svc/graph/opex/costofquality/",
          remarkType: [2,3]
        }
      },
      {
        component: "QualityCard",
        title: "Labor Efficiency",
        graphopts: {          
          title: "Labor Efficiency",
          dataApi: "svc/graph/opex/laborefficiency/",
          remarkType: [2,3]
        }
      },
      {
        component: "QualityCard",
        title: "Environmental Efficiency Index",
        graphopts: {          
          title: "Environmental Efficiency Index",
          dataApi: "svc/graph/opex/eei/",
          remarkType: [1]
        }
      },
    ]);
    const calcParentClass = computed(() => `row`);
    const calcChildClass = computed(() => `card-tile q-pa-sm`);

    //col-12 col-sm-6 col-md-4 

    return {
      localView,
      items,
      calcParentClass,
      calcChildClass,
    };
  },
});
</script>
