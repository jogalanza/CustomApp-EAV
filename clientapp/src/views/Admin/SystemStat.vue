<template>
  <BoardLayout class="home" :title="GetLocaleString('HOME', 'Home')" :drawer="drawer" :breakpoint="50000" :show-if-above="true" :drawer-width="400" @drawerchange="(e) => (drawer = e)"
    ref="boardLayout">
    <template v-slot:header> </template>

    <template v-slot:right-drawer> </template>

    <q-card-section ref="contdiv" class="container-section q-pa-none" :style="{
      height: 'calc(100vh - 72px)',
    }">
      <q-carousel ref="carousel" v-model="slide" transition-prev="jump-right" transition-next="jump-left" swipeable animated control-color="green" prev-icon="r_navigate_before"
        next-icon="r_navigate_next" padding infinite class="report-carousel rounded-borders" style="height: 100%" keep-alive>
        <q-carousel-slide name="0" class="column no-wrap flex-center q-pa-md" style="justify-content: flex-start; padding: 0px !important">
          <!-- <div class="
              home-title-container
              text-h3
              q-pa-md
              text-bold text-center text-white
            " :style="`width: 100%;background: url('${require('@/assets/etc2.png')}') 0% 32%;`">
            <div class="home-title">System Info</div>
            <div class="version-info" v-if="apiVer.Build || apiVer.Version">
              api: {{ `${apiVer.Build || apiVer.Version}` }}
            </div>
            <div class="version-info">app: {{ appVer }}</div>
          </div> -->

          <div class="row full-width flex flex-center">
            <div class="col-12 col-md-11">
              <div class="row" v-for="(m, i) in items" :key="i" style="width: 100%; padding: 22px">
                <div v-for="(n, o) in m.items" :key="o" class="col-12 col-md-3 q-pa-sm" style="min-height: 0px">
                  <q-card>
                    <q-card-section class="text-grey text-h6 q-pb-none">{{
                      n.label
                    }}</q-card-section>
                    <q-card-section class="text-center" :style="`font-size: 4.5em; font-family: 'SAP72-Bold'; ${(n.style ? n.style : '')}`">
                      {{ n.value }}
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <div class="row" style="width: 100%; padding: 22px">
                <div class="col-12 col-md-6 q-pa-sm">
                  <SystemUpdate />
                </div>
              </div>
            </div>


          </div>
        </q-carousel-slide>
      </q-carousel>
    </q-card-section>
  </BoardLayout>
</template>

<style lang="scss">
.group-title {
  text-align: left;
  width: 100%;
}

.home-title-container {
  height: 140px;
  box-shadow: 0px 8px 16px rgb(0 0 0 / 30%);

  @media screen and (max-width: 620px) {
    height: 100px;
  }
}

.home-search-container {
  margin-top: -48px;
}

.version-info {
  font-size: 1.2rem;
  line-height: 1.5rem;
  color: #888;
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
  line-height: 1.4;

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

.body--dark {
  .home {
    .q-carousel__slide {
      background: linear-gradient(178deg, #010101 28%, transparent);
    }
  }

  .home-search {
    background: #444444;
  }

  .home-tile {
    background: #444444 !important;
    box-shadow: 0px 4px 1px rgb(133 251 130 / 86%);

    .q-toolbar {
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
} from "vue";
import { useUser } from "@/store/user";
import { useMainStore } from "@/store";
import SystemUpdate from "../../components/Widgets/SystemUpdate.vue";
import api from "@/api/index"
import apiSystem from "@/api/system"

export default {
  name: "SystemStat",
  components: {
    BoardLayout: defineAsyncComponent(() =>
      import("@/components/General/BoardLayout.vue")
    ),
    SystemUpdate
  },
  setup() {
    const GetLocaleString = inject("GetLocaleString");
    const eventBus = inject("eventBus");
    //const HubSend = inject("HubSend");
    const user = useUser();
    const mainStore = useMainStore();
    const drawer = ref(false);
    const slide = ref("0");
    const contdiv = ref(null);
    const boardLayout = ref(null);
    const carousel = ref(null);
    const loading = ref(false);
    const hub = inject("hub");
    // const serverStat = ref({
    //   CPU: "N/A",
    //   RAM: "N/A"
    // });
    const systemUsage = ref({});
    const intervalServer = ref(null);

    const apiVer = ref({
      Build: null,
      Version: null,
      Copyright: null,
    });

    const sessionInfo = ref({});

    const appVer = computed(() => process.env.VUE_APP_GIT_HASH);

    const items = computed(() => {
      var x = [];

      x.push({
        label: null,
        items: [
          {
            label: "Current Users",
            value: sessionInfo.value.users || 0 //mainStore.AppSessionInfo.Users,
          },
          {
            label: "Active Sessions",
            value: sessionInfo.value.sessions || 0 //mainStore.AppSessionInfo.Sessions,
          },
          {
            label: "CPU Usage %",
            value: systemUsage.value.CpuUsage,
          },
          {
            label: "Memory Usage %",
            value: systemUsage.value.MemoryUsage,
          },
        ],
      });

      return x;
    });

    const UpdateServerStat = () => {
      //HubSend({ method: "system-stat" });
      apiSystem.GetUsage().then(response => {
        systemUsage.value = {...response.data}
      });

      // hub.sendMessage({
      //   method: "hub-system-usage"
      // });
    }

    const GetApiVersion = () => {
      api.GetApiVersion().then((response) => {
        apiVer.value = { ...response.data };
      });
    };

    const HandleUserAware = (data) => {
      try {
        var x = JSON.parse(data);
        sessionInfo.value = { ...x };
      } catch {
        //
      }
    }

    const EvalSystemUsage = (data) => {
      try {
        console.warn("system usage", data)
        //var x = JSON.parse(data);
        systemUsage.value = data;
      } catch {
        //
      }
    }

    onMounted(() => {
      eventBus.$on("hub-system-usage", EvalSystemUsage);
      eventBus.$on("hub-user-aware", HandleUserAware);
      

      intervalServer.value = setInterval(() => {
        UpdateServerStat();
      }, 5000);

      GetApiVersion();
      UpdateServerStat();

      setTimeout(() => {
        hub.sendMessage({
          method: "hub-user-aware"
        });
      }, 2000);

    });

    onBeforeUnmount(() => {
      eventBus.$off("hub-system-usage", EvalSystemUsage);
      eventBus.$off("hub-user-aware", HandleUserAware);
      

      clearInterval(intervalServer.value);
    });

    return {
      systemUsage,
      carousel,
      boardLayout,
      slide,
      drawer,
      GetLocaleString,
      contdiv,
      user,
      loading,
      mainStore,
      items,
      appVer,
      apiVer,
      sessionInfo
    };
  },
};
</script>
