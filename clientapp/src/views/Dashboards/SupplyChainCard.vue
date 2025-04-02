<template>
  <Dashboard @viewchanged="localView = $event" group="Supply Chain" >
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
  name: "SupplyChain",
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
        title: "Vendor Inventory : Current",
        graphopts: {
          title: "Vendor Inventory",
          dataApi: "svc/graph/supplychain/inventorymanagement/",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Supplier Delivery : Current",
        graphopts: {
          title: "Supplier Delivery",
          dataApi: "svc/graph/supplychain/supplierdelivery/",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Supplier Quality : Current",
        graphopts: {
          title: "Supplier Quality",
          dataApi: "svc/graph/supplychain/supplierquality/",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Direct Material Savings : Current",
        graphopts: {
          title: "Direct Material Savings",
          dataApi: "svc/graph/supplychain/deflationefficiency/",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "SCAR : Current",
        graphopts: {
          title: "SCAR",
          dataApi: "svc/graph/supplychain/scar/",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Supply Chain Engagement : Current",
        graphopts: {
          title: "Supply Chain Engagement",
          dataApi: "svc/graph/supplychain/supplierqualification/",
          remarkType: [1]
        }
      },
      {
        component: "QualityCard",
        title: "Managed Spend Agreement : Current",
        graphopts: {
          title: "Managed Spend Agreement",
          dataApi: "svc/graph/supplychain/managedspendunderagreement/",
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
