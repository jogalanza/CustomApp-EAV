<template>
  <BoardLayout>
    <QCardSection class="sticky-board-toolbar q-pa-sm">
      <QToolbar>
      
        <QSpace />
      </QToolbar>
    </QCardSection>

    <QCardSection style="height:500px">

    </QCardSection>

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
