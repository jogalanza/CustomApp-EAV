<template>
  <BoardLayout class="manage-targets" :loading="loading" :drawer="drawerRight" :breakpoint="20000" :show-if-above="false" :drawer-width="q.screen.width < 450 ? q.screen.width : 450"
    @drawerchange="(e) => (drawerRight = e)">
    <q-card class="absolute" flat style="height: 100%; width: 100%">
      <q-card-section :class="`${mobileView ? 'q-pa-none' : 'q-pt-none'}`" style="height: 100%">
        <q-carousel ref="carousel" v-model="slide" transition-prev="jump-right" transition-next="jump-left" swipeable animated control-color="green" prev-icon="r_navigate_before"
          next-icon="r_navigate_next" padding infinite keep-alive class="report-carousel rounded-borders" style="height: 100%">
          <q-carousel-slide name="main" class="row q-pa-none" style="align-content: flex-start">
            <q-toolbar class="text-bold" style="overflow: initial">
              <q-toolbar-title class="clip text-bold">{{ `Targets${(activeSite ? ` - ${activeSite.SiteName}` : '')}` }}</q-toolbar-title>
              <q-space />
              <q-btn v-if="dirty" icon="r_refresh" style="min-width: 60px" dense flat no-caps color="primary" stack :label="GetLocaleString(`UNDO`, 'Undo')" @click="Refresh">
                <q-tooltip>{{ GetLocaleString("UNDO_CHANGES", "Undo changes") }}</q-tooltip>
              </q-btn>
              <q-btn v-if="dirty" icon="r_save" style="min-width: 60px" dense flat no-caps color="primary" stack :label="GetLocaleString(`SAVE`, 'Save')" @click="SaveChanges()">
                <q-tooltip>{{ GetLocaleString("SAVE_CHANGES", "Save changes") }}</q-tooltip>
              </q-btn>
            </q-toolbar>

            <q-tab-panels v-model="tab" keep-alive style="width: 100%; height: calc(100% - 62px)">
              <q-tab-panel name="main">
                <q-splitter v-model="splitterModel" style="height: 100%" :limits="[10, 20]">

                  <template v-slot:before>
                    <q-list separator style="height: 100%; overflow: auto;">
                      <q-item v-for="(m, i) in options.Sites" :key="i" clickable @click="ShowTargets(m)" :active="m.SiteId === activeSite?.SiteId">
                        <q-item-section>
                          <q-item-label>{{ m.SiteName }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </template>

                  <template v-slot:after>
                    <q-markup-table v-if="item" class="target-editor" style="height: 100%">
                      <thead>
                        <q-tr>
                          <!-- <q-th>Targets</q-th> -->
                          <q-th v-for="(p, i) in item.period" :key="i">{{ p.DESCRIPTION }}</q-th>
                        </q-tr>
                      </thead>

                      <tbody>
                        <!-- <tr v-for="(m, i) in item.targets" :key="i">
                          <q-td class="text-bold">{{ m.targetName }}</q-td>
                          <q-td v-for="(mm, ii) in m.targetValues" :key="`${i}-${ii}`">
                            <q-input dense borderless v-model="mm.targetValue" input-class="text-center" type="number" />
                          </q-td>
                        </tr> -->

                        <template v-for="(m, i) in item.targets" :key="i">
                          <q-tr class="header-row">
                            <q-td colspan="12" class="header text-bold" style="font-size: 0.9rem;"><span class="q-pa-sm">{{ m.targetName }}</span></q-td>
                          </q-tr>
                          <tr>
                            <q-td v-for="(mm, ii) in m.targetValues" :key="`${i}-${ii}`" style="padding: 0px">
                              <q-input dense filled v-model="mm.targetValue" @update:modelValue="mm.targetValue = SetModelValue($event)" input-class="text-center" type="number" square />
                            </q-td>
                          </tr>
                        </template>
                      </tbody>
                    </q-markup-table>
                  </template>

                </q-splitter>
              </q-tab-panel>
            </q-tab-panels>
          </q-carousel-slide>
        </q-carousel>
      </q-card-section>
    </q-card>
  </BoardLayout>
</template>

<style lang="scss">
.manage-targets {
  .q-item {
    &.q-item--active {
      background: #21ba45;
      color: black;
      font-weight: bold;
    }
  }

  .q-splitter__before{
    overflow: hidden;
  }

  .q-splitter__after{
    padding: 4px 4px 4px 16px;
  }
}

.target-editor {
  .q-table {
    thead {
      th {
        border-bottom-width: 1px;
        border-right-width: 1px;

        position: sticky;
        top: 0px;
        background: white;
        z-index: 10;
      }
    }

    tbody {
      td {
        padding: 0px;
        border-right-width: 1px;
        height: 32px;

        &.header {
          position: sticky;
          top: 48px;
          z-index: 9;
          background: beige;
        }
      }
    }
  }
}
</style>

<script>
import {
  defineAsyncComponent,
  ref,
  inject,
  onBeforeUnmount,
  onMounted,
  watch,
  nextTick,
} from "vue";

import general from "@/mixins/general";
import { useUser } from "@/store/user";
import { useMainStore } from "@/store/index";
import { useQuasar } from "quasar";
import { useOptions } from "@/store/options";
import api from "@/api/targets"

export default {
  name: "ManageTargets",
  components: {
    BoardLayout: defineAsyncComponent(() =>
      import("../../components/General/BoardLayout.vue")
    ),
  },
  setup() {
    const q = useQuasar();
    const user = useUser();
    const options = useOptions();
    const mainStore = useMainStore();
    const { navigateTo, NotifyUser } = general();
    const panel = ref("settings");
    const slide = ref("main");
    const splitterModel = ref(15);
    const activeSite = ref(null);
    const item = ref(null);
    const dirty = ref(false);
    const loading = ref(false);

    const tab = ref("main");

    const drawerRight = ref(false);

    const IsMenuOK = inject("IsMenuOK");

    const GetLocaleString = inject("GetLocaleString");

    watch(item, (newVal) => {
      if (newVal) {
        dirty.value = true;
      }
    }, { deep: true });

    const SwitchPanel = (data) => {
      drawerRight.value = true;
      panel.value = data;
    };

    const RowClick = (e, row, index) => {
      console.log("RowClick", e, row, index);
    };

    const CloseDrawer = () => {
      drawerRight.value = false;
    };

    const LoadSites = () => {
      options.GetSites().then(response => {
        ShowTargets(response[0]);
      });
    }

    const ShowTargets = (data) => {
      activeSite.value = data;
      GetMaster(data.SiteId);
    }

    const GetMaster = (id) => {
      loading.value = true;
      api.GetTargets(id).then(response => {
        loading.value = false;
        item.value = response.data;
        nextTick(() => {
          dirty.value = false;
        });
      }).catch(() => {
        loading.value = false;
      });
    }

    const SaveChanges = () => {
      api.SaveTargets(item.value).then(response => {
        NotifyUser(response.data);
        GetMaster(activeSite.value.SiteId);
      });
    }

    const Refresh = () => {
      GetMaster(activeSite.value.SiteId);
    }

    const SetModelValue = (e) => {
      return !e ? 0 : e;      
    }

    onMounted(() => {
      LoadSites();
    })

    onBeforeUnmount(() => {
      //
    });

    return {
      mainStore,
      tab,
      q,
      slide,
      user,
      drawerRight,
      navigateTo,
      GetLocaleString,
      IsMenuOK,
      panel,
      splitterModel,
      activeSite,
      options,
      item,
      loading,
      dirty,
      SwitchPanel,
      RowClick,
      CloseDrawer,
      ShowTargets,
      SaveChanges,
      Refresh,
      SetModelValue
    };
  },
};
</script>
