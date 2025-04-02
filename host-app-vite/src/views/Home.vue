<template>
  <BoardLayout
    class="home"
    :title="GetLocaleString('HOME', 'Home')"
    :drawer="drawer"
    :breakpoint="50000"
    :show-if-above="true"
    :drawer-width="400"
    @drawerchange="(e) => (drawer = e)"
    ref="boardLayout"
  >
    <template v-slot:header> </template>

    <template v-slot:right-drawer> </template>

    <QCardSection
      ref="contdiv"
      class="container-section q-pa-none"
      :style="{
        height: 'calc(100vh - 67px)',
      }"
    >
      <AppTour ref="appTour" @start="StartTour" />

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
        class="report-carousel rounded-borders"
        style="height: 100%"
        keep-alive
      >
        <q-carousel-slide
          name="0"
          class="column no-wrap flex-center q-pa-md"
          style="justify-content: flex-start; padding: 0px !important"
        >
          <div
            class="
              home-title-container
              text-h3
              text-bold text-center text-white
            "
            :style="`width: 100%;background: url('${require('../assets/etc2.png')}') 0% 40%;`"
          >
            <div class="home-title">Global Operations Metrics</div>
            <div class="sub" style="font-size: 1rem; line-height: 1rem; margin-top: -50px">Engage  |  Enable  |  Excel</div>
          </div>
          <div style="padding: 32px">
            <QCard class="q-pa-md">
              <QCardSection style="font-size: 1.1rem; text-align: justify">
                The Mandate of Excelitas Operations is to deliver the highest
              quality and cost effective products and services to our external
              and internal customers. We conduct ourselves with integrity,
              ethics and respect for ourselves, customers, society and our
              environment. Our employee safety is of the utmost importance and
              we'll take every and all precautions to ensure they are safe while
              working at Excelitas. Every day we will strive to continuously
              improve our Operations to enable us to win in the global market
              and continue growing our company.
              </QCardSection>
            </QCard>
            </div>
        </q-carousel-slide>
      </q-carousel>
    </QCardSection>
  </BoardLayout>
</template>

<style lang="scss">
.group-title {
  text-align: left;
  width: 100%;
}

.home-title-container {
  height: 140px;
  width: 100%;
  box-shadow: 0px 8px 16px rgb(0 0 0 / 30%);

  // .sub{
  //   background: rgba(0,0,0,0.4);
  // }
}

.home-search-container {
  margin-top: -48px;
}

.home-search {
  width: 50%;
  border-radius: 8px;
  background: #d9d9d9;

  @media screen and (max-width: 620px) {
    width: 92%;
  }
}

.home-title {
  line-height: 2;
  background: rgba(0,0,0,0.4);
  height: 100%;

  @media screen and (max-width: 620px) {
    font-size: 0.7em;
  }

  @media screen and (max-width: 400px) {
    font-size: 0.5em;
  }
}

.home-tile {
  height: 120px;
  box-shadow: 0px 4px 7px rgb(0 0 0 / 30%);
  cursor: pointer;
}

.home {
  .q-carousel__slide {
    background: #eee;
  }
}

.body--dark {
  .home {
    .q-carousel__slide {
      background: linear-gradient(16deg, #010101 28%, transparent);
    }
  }

  .home-search {
    background: #444444;
  }
  .home-tile {
    background: #444444 !important;
    // box-shadow: 0px 4px 1px rgb(133 251 130 / 86%);

    .QToolbar {
      background: transparent !important;
    }
  }
}
</style>

<script>
import {
  computed,
  defineAsyncComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useUser } from "../store/user";
import { useMainStore } from "../store";
import general from "../mixins/general";
import { useQuasar } from "quasar";
import { useHomeTour } from "../composables/appTour";
import { useAOS } from "../composables/ao";

export default {
  name: "Home",
  components: {
    BoardLayout: defineAsyncComponent(() =>
      import("../components/General/BoardLayout.vue")
    ),
    AppTour: defineAsyncComponent(() => import("../components/AppTour.vue")),
  },
  setup(props, ctx) {
    const eventBus = inject("eventBus");
    const GetLocaleString = inject("GetLocaleString");
    const { navigateTo } = general();
    const q = useQuasar();
    const user = useUser();
    const mainStore = useMainStore();
    const drawer = ref(false);
    const slide = ref("0");
    const addEmbed = ref(null);
    const contdiv = ref(null);
    const boardLayout = ref(null);
    const carousel = ref(null);
    const shareReport = ref(null);
    const mobileView = inject("mobileView");
    const rightDrawerItem = ref(1);
    const search = ref({
      key: null,
    });
    const commentPanel = ref(null);
    const aos = useAOS();

    const inputsearch = ref(null);
    const appTour = ref(null);

    watch(
      () => search.value,
      () => {
        console.warn("seach changed");
        user.SyncHomeFilter(search.value);
      },
      { deep: true }
    );

    watch(
      () => user.ActiveUser,
      (newVal) => {
        if (newVal.ID !== undefined) {
          EvalTour();
        }
      },
      { deep: true }
    );

    const calcHeight = computed(() => {
      if (boardLayout.value) {
        return `${
          boardLayout.value._.vnode.el.children[0].clientHeight - 50
        }px`;
      }
      return "calc(100vh)";
    });

    const ShowDashboard = (data) => {
      mainStore.SetActiveDashboard(data).then(() => {
        navigateTo({ name: "Dashboard" });
      });
    };

    const ShowRightDrawerItem = (_index) => {
      rightDrawerItem.value = _index;
      drawer.value = true;
    };

    const EvalTour = () => {
      // var c = q.cookies.get("xmap_apptour_home");
      // var d = q.cookies.get("xmap_notours");
      // if (
      //   !c &&
      //   (!d || mainStore.adhocTour) &&
      //   user.ActiveUser.ID !== undefined
      // ) {
      //   setTimeout(() => {
      //     if (appTour.value) {
      //       appTour.value.Show();
      //     }
      //   }, 300);
      // }
    };

    const StartTour = () => {
      const { tour } = useHomeTour(user.ActiveUser, q);
      tour.start();
    };

    onMounted(() => {
      eventBus.$on("invoke-guided-tour", EvalTour);
      search.value = { ...user.HomeFilter };

      //EvalTour();
    });

    onBeforeUnmount(() => {
      eventBus.$off("invoke-guided-tour", EvalTour);
    });

    return {
      commentPanel,
      shareReport,
      carousel,
      boardLayout,
      addEmbed,
      slide,
      drawer,
      rightDrawerItem,
      GetLocaleString,
      contdiv,
      calcHeight,
      mobileView,
      user,
      ShowRightDrawerItem,
      ShowDashboard,
      search,
      ctx,
      inputsearch,
      appTour,
      StartTour,
      aos,
    };
  },
};
</script>
