<template>
  <QCard>
    <QCardSection class="q-pa-none">
      <q-virtual-scroll
        ref="vscroll"
        :items="items"
        :style="`max-height: 260px`"
      >
        <template v-slot:default="{ item, index }">
          <QItem
            :key="index"
            class="q-my-sm q-mx-none"
            dense
            style="background: transparent"
          >
            <QItemSection avatar style="padding-right: 8px">
              <QAvatar
                size="32px"
                style="background: transparent;"
              >
                <QImg
                  :src="`${server.defaults.baseURL}/user/photo/?id=${item.ID}`"
                  width="32px"
                  height="32px"
                >
                  <!-- :src="`data:image/png;base64,${props.row.Photo}`" -->
                  <template v-slot:error>
                    <QIcon name="o_account_circle" size="32px" />
                  </template>
                </QImg>
              </QAvatar>
            </QItemSection>
            <QItemSection>
              <QItemLabel class="text-grey">{{
                item.DisplayName
              }}</QItemLabel>
            </QItemSection>
          </QItem>
        </template>
      </q-virtual-scroll>
    </QCardSection>
  </QCard>
</template>

<script>
import { defineComponent, inject, onBeforeUnmount, onMounted, ref } from "vue";
import server from "../server"
import api from "../api/index"
import { useMainStore } from "../../store";

export default defineComponent({
  setup() {
    const mainStore = useMainStore();
    const eventBus = inject("eventBus");
    const items = ref([]);

    const GetMaster = () => {
        api.DashboardViewers(mainStore.ActiveDashboard.ID).then(response => {
            items.value = [...response.data];
        });
    }

    const GetDashboardActivity = (_payload) => {
      if (mainStore.ActiveDashboard.ID === _payload.ID) {
        GetMaster();
      }
    };

    onMounted(() => {
        eventBus.$on("hub-update-dashboard-activity", GetDashboardActivity);
        GetMaster();
    });

    onBeforeUnmount(() => {
        eventBus.$off("hub-update-dashboard-activity", GetDashboardActivity);
    });

    return {
        items,
        GetMaster,
        server
    }
  },
});
</script>