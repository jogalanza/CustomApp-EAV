<template>
  <BoardLayout
    :loading="loading"
    :drawer="drawerRight"
    :breakpoint="20000"
    :show-if-above="false"
    :drawer-width="q.screen.width < 450 ? q.screen.width : 450"
    @drawerchange="(e) => (drawerRight = e)"
  >
    <q-card class="absolute" flat style="height: 100%; width: 100%">
      <q-card-section
        class="q-pa-none"
        style="height: 100%"
      >
        <q-carousel
          ref="carousel"
          v-model="slide"
          transition-prev="jump-right"
          transition-next="jump-left"
          swipeable
          animated
          control-color="green"
          prev-icon="r_navigate_before"
          next-icon="r_navigate_next"
          padding
          infinite
          keep-alive
          class="report-carousel rounded-borders"
          style="height: 100%"
        >
          <q-carousel-slide
            name="main"
            class="row q-pa-none"
            style="align-content: flex-start"
          >
            <iframe
            id="cms"
            ref="iframe"
            :src="cmsUrl"
            width="100%"
            frameBorder="0"
            style="height: calc(100% + 0px); position: absolute; top: 0px"
          >
          </iframe>
          </q-carousel-slide>
        </q-carousel>
      </q-card-section>
    </q-card>
  </BoardLayout>
</template>

<style scoped></style>

<script>
import {
  defineAsyncComponent,
  ref,
  inject,
  computed,
  onBeforeUnmount,
} from "vue";

import general from "@/mixins/general";
import { useUser } from "@/store/user";
import { useMainStore } from "@/store/index";
import { useQuasar } from "quasar";

export default {
  name: "PowerBIObjects",
  components: {
    BoardLayout: defineAsyncComponent(() =>
      import("../../components/General/BoardLayout.vue")
    ),
  },
  setup() {
    const q = useQuasar();
    const user = useUser();
    const mainStore = useMainStore();
    const { navigateTo } = general();
    const panel = ref("settings");
    const slide = ref("main");

    const cmsUrl = computed(() => {
      return window.xmap.cms ? `${window.xmap.cms}admin/` : `http://localhost:1339/admin/`
    })

    const tab = ref("user");

    const drawerRight = ref(false);

    const collapseMenu = computed(() => {
      return q.screen.width < 700;
    });

    const IsMenuOK = inject("IsMenuOK");

    const GetLocaleString = inject("GetLocaleString");

    const SwitchPanel = (data) => {
      drawerRight.value = true;
      panel.value = data;
    };

    const RowClick = (e, row, index) => {
      console.log("RowClick", e, row, index);
    };

    onBeforeUnmount(() => {
      //
    });

    return {
      tab,
      q,
      slide,
      user,
      drawerRight,
      navigateTo,
      collapseMenu,
      GetLocaleString,
      IsMenuOK,
      panel,
      SwitchPanel,
      RowClick,     
      mainStore,
      cmsUrl,
    };
  },
};
</script>
