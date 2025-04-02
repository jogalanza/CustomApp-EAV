<template>
  <BoardLayout>
    <q-card-section class="sticky-board-toolbar q-pa-sm">
      <q-toolbar>
      
        <q-space />
      </q-toolbar>
    </q-card-section>

    <q-card-section style="height:500px">

    </q-card-section>

  </BoardLayout>
</template>

<style scoped>
</style>

<script>
import { defineAsyncComponent, onMounted } from "vue";

// import { useQuasar } from "quasar";

export default {
  name: "Employees",
  components: {
    BoardLayout: defineAsyncComponent(() => import("./General/BoardLayout.vue"))
  },
  setup() {
    const user = useUser();
    
    onMounted(() => {
      store.dispatch("UpdateBoardTitle", "Dashboard");
    });

    return {
    };
  }
};
</script>
