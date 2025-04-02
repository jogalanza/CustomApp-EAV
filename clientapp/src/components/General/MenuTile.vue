<template>
  <q-card
    class="home-tile q-ma-sm q-pa-sm"
    @click="context.emit('click', item)"
    style="height: 120px"
  >
    <q-toolbar>
      <q-icon name="o_dashboard" size="32px" />
      <!-- <q-toolbar-title class="clip">
        {{ item.Title }}
      </q-toolbar-title> -->
      <q-space />
      <q-btn v-if="countView > 0" round flat icon="o_visibility" size="sm">
        <q-badge floating rounded color="green">{{ countView }}</q-badge>
        <q-tooltip>{{ `${countView} currently viewing`}}</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        :icon="item.Pinned ? 'r_push_pin' : 'o_push_pin'"
        size="sm"
        @click.stop="SetPinnedDashboard"
      >
      <q-tooltip>{{ `${(item.Pinned ? 'Remove from Favorites' : 'Add to Favorites')}` }}</q-tooltip>
    </q-btn>
    </q-toolbar>
    <q-list>
      <q-item class="q-pa-sm">
        <!-- <q-item-section avatar top>
          <q-avatar>
            <q-icon name="o_dashboard" size="1.4em" color="white"></q-icon>
          </q-avatar>
        </q-item-section> -->
        <q-item-section>
          <q-item-section class="text-white" style="font-size: 1.4em">{{
            item.Title
          }}</q-item-section>
        </q-item-section>
        <!-- <q-item-section side top class="row no-wrap">
          <q-btn round flat icon="O_visibility">
            <q-badge floating rounded color="green">{{ countView }}</q-badge>
          </q-btn>
          <q-btn
            flat
            round
            :icon="item.Pinned ? 'r_push_pin' : 'o_push_pin'"
            size="sm"
            @click.stop="SetPinnedDashboard"
          />
        </q-item-section> -->
      </q-item>
    </q-list>
    <!-- <q-card-section
      class="dashboard-notes text-grey"
      style="
        max-height: 3rem;
        line-height: 1.2rem;
        text-overflow: clip;
        overflow: auto;
        padding: 0px;
        text-align: justify;
      "
      >{{ item.Notes }}</q-card-section
    > -->
  </q-card>
</template>

<style lang="scss">
.dashboard-notes {
  &::-webkit-scrollbar {
    width: 0px;
    /* Remove scrollbar space ebe3e3 */
    background: transparent;
    /* Optional: just make scrollbar invisible */
  }
}
.home-tile{
  background: #0F2027;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #2C5364, #203A43, #0F2027);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #2C5364, #203A43, #0F2027); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  //emarld water
  background: #348F50;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #56B4D3, #348F50);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #56B4D3, #348F50); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  //moss
  background: #134E5E;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #71B280, #134E5E);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #71B280, #134E5E); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */


  .q-toolbar{
    background: transparent !important;
    color: white !important;
  }
}

.body--dark{
  .home-tile{
  background: #0F2027 !important;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #2C5364, #203A43, #0F2027) !important;  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #2C5364, #203A43, #0F2027) !important; /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  //emarald water
  background: #348F50 !important;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #56B4D3, #348F50) !important;  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #56B4D3, #348F50) !important; /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  //moss
  background: #134E5E !important;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #71B280, #134E5E) !important;  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #71B280, #134E5E) !important; /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */


  .q-toolbar{
    background: transparent !important;
    color: white !important;
  }
}
}
</style>

<script>
import { defineComponent, inject, onBeforeUnmount, onMounted, ref } from "vue";
import api from "@/api/index";
import { useUser } from "../../store/user";

export default defineComponent({
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["click"],
  setup(props, context) {
    const eventBus = inject("eventBus");
    const user = useUser();
    const countView = ref(0);

    const SetPinnedDashboard = () => {
      api
        .SetPinnedDashboard(
          user.ActiveUser.ID,
          props.item.ID,
          props.item.Pinned !== undefined && props.item.Pinned ? 0 : 1
        )
        .then((response) => {
          if (response.data.success) {
            user.GetUserDashboards();
          }
        });
    };

    const GetDashboardActivity = (_payload) => {
      if (props.item.ID === _payload.ID) {
        countView.value = _payload.Count;
      }
    };

    const GetViewerCount = () => {
      api.DashboardViewerCount(props.item.ID).then((response) => {
        countView.value = response.data;
      });
    };

    onMounted(() => {
      eventBus.$on("hub-update-dashboard-activity", GetDashboardActivity);
      GetViewerCount();
    });

    onBeforeUnmount(() => {
      eventBus.$off("hub-update-dashboard-activity", GetDashboardActivity);
    });

    return {
      context,
      SetPinnedDashboard,
      eventBus,
      countView,
    };
  },
});
</script>