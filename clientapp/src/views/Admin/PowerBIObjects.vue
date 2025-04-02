<template>
  <BoardLayout
    :loading="loading"
    :drawer="drawerRight"
    :breakpoint="20000"
    :show-if-above="false"
    :drawer-width="q.screen.width < 450 ? q.screen.width : 450"
    @drawerchange="(e) => (drawerRight = e)"
  >
    <!-- <template v-slot:header> </template> -->

    <template v-slot:right-drawer>
      <q-card flat class="fit">
        <q-card-section class="row q-pa-none" style="height: 100%">
          <q-tab-panels v-model="panel" class="full-width fit">
            <q-tab-panel name="editdashboard" class="q-pa-none">
              <q-toolbar class="q-pa-none">
                <q-btn
                  flat
                  round
                  icon="r_arrow_back"
                  @click="drawerRight = false"
                />
                <q-toolbar-title class="clip">{{
                  GetLocaleString("EDIT_DASHBOARD", "Edit Dashboard")
                }}</q-toolbar-title>
                <q-space />
              </q-toolbar>
              <EditDashboard
                ref="editDashboard"
                style="height: calc(100% - 50px)"
                @done="drawerRight = false"
                @close="drawerRight = false"
                @update="dashboardList.GetMaster"
              />
            </q-tab-panel>
            <q-tab-panel name="editdashboardusers" class="q-pa-none">
              <q-toolbar class="q-pa-none">
                <q-btn
                  flat
                  round
                  icon="r_arrow_back"
                  @click="drawerRight = false"
                />
                <q-toolbar-title class="clip">{{
                  GetLocaleString("EDIT_DASHBOARD_USERS", "Edit Dashboard Users")
                }}</q-toolbar-title>
                <q-space />
              </q-toolbar>
              <EditDashboardUsers
                ref="editDashboardUsers"
                style="height: calc(100% - 50px)"
                @done="drawerRight = false"
                @close="drawerRight = false"
                @update="dashboardList.GetMaster"
              />
            </q-tab-panel>

            <q-tab-panel name="editroleaccess" class="q-pa-none">
              <q-toolbar class="q-pa-none">
                <q-btn
                  flat
                  round
                  icon="r_arrow_back"
                  @click="drawerRight = false"
                />
                <q-toolbar-title class="clip">{{
                  GetLocaleString("EDIT_ROLE_ACCESS", "Edit Role Access")
                }}</q-toolbar-title>
                <q-space />
              </q-toolbar>
              <EditRoleAccess
                ref="editRoleAccess"
                style="height: calc(100% - 50px)"
                @done="drawerRight = false"
                @close="drawerRight = false"
                @update="roleList.GetMaster"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </template>

    <q-card class="absolute" flat style="height: 100%; width: 100%">
      <q-card-section
        :class="`${mobileView ? 'q-pa-none' : 'q-pt-none'}`"
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
            <q-toolbar
              class="q-px-none"
              :style="`${
                mobileView ? 'padding-bottom: 0px;padding-top:0px' : ''
              }`"
            >
              <q-toolbar-title :class="`app-title in-board clip`">
                {{ GetLocaleString("PBI_OBJS", "Dashboards") }}
              </q-toolbar-title>
              <q-space />
            </q-toolbar>

            <!-- <q-tabs v-model="tab" no-caps align="left" style="width: 100%">
              <q-tab name="user" label="Dashboards" />
              <q-tab name="group" label="Group" />
            </q-tabs> -->

            <q-tab-panels
              v-model="tab"
              keep-alive
              style="width: 100%; height: calc(100% - 48px - 69px)"
            >
              <q-tab-panel name="user">
                <DashboardList
                  ref="dashboardList"
                  @edit="EditDashboard"
                  @addnew="AddDashboard"
                  @editusers="EditDashboardUsers"
                />
              </q-tab-panel>

              <q-tab-panel name="group">
                <RoleList ref="roleList" @edit="EditRoleAccess" />
              </q-tab-panel>
            </q-tab-panels>
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
    DashboardList: defineAsyncComponent(() =>
      import("../../components/Admin/DashboardList.vue")
    ),
    RoleList: defineAsyncComponent(() =>
      import("../../components/Admin/RoleList.vue")
    ),
    EditRoleAccess: defineAsyncComponent(() =>
      import("../../components/Admin/EditRoleAccess.vue")
    ),
    EditDashboard: defineAsyncComponent(() =>
      import("../../components/Admin/EditDashboard.vue")
    ),
    EditDashboardUsers: defineAsyncComponent(() =>
      import("../../components/Admin/EditDashboardUsers.vue")
    ),
    // ProfileAvatar: defineAsyncComponent(() =>
    //   import("../components/General/ProfileAvatar.vue")
    // ),
    // FilterBar: defineAsyncComponent(() =>
    //   import("../../components/General/FilterBar.vue")
    // ),
  },
  setup() {
    const q = useQuasar();
    const user = useUser();
    const mainStore = useMainStore();
    const { navigateTo } = general();
    const panel = ref("settings");
    const slide = ref("main");
    const showSearch = ref(false);
    const selected = ref([]);
    const dataOptions = ref({
      search: null,
      InvoiceDate: null,
      InvoiceDate2: null,
      ChannelPartner: null,
      CustomerName: null,
      ItemNumber: null,
      Description: null,
    });
    const dashboardList = ref(null);
    const roleList = ref(null);
    const editRoleAccess = ref(null);
    const editDashboard = ref(null);
    const editDashboardUsers = ref(null);

    const tab = ref("user");

    const filterOpts = computed(() => {
      return [
        {
          label: "Channel Partner",
          type: "input-text",
          defaultValue: null,
          key: "ChannelPartner",
        },
        {
          label: "Domain Name",
          type: "input-text",
          defaultValue: null,
          key: "DomainName",
        },
      ];
    });

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

    const EditDashboard = (data) => {
      SwitchPanel("editdashboard");
      setTimeout(() => {
        editDashboard.value.Edit(data);
      }, 300);
    };

    const EditDashboardUsers = (data) => {
      SwitchPanel("editdashboardusers");
      setTimeout(() => {
        editDashboardUsers.value.Edit(data);
      }, 300);
    };

    const AddDashboard = () => {
      SwitchPanel("editdashboard");
      setTimeout(() => {
        editDashboard.value.AddNew();
      }, 500);
    };

    const EditRoleAccess = (data) => {
      SwitchPanel("editroleaccess");
      setTimeout(() => {
        editRoleAccess.value.Edit(data);
      }, 500);
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
      dataOptions,
      showSearch,
      collapseMenu,
      GetLocaleString,
      IsMenuOK,
      panel,
      SwitchPanel,
      RowClick,
      EditDashboard,
      filterOpts,
      selected,
      mainStore,
      EditRoleAccess,
      editRoleAccess,
      dashboardList,
      roleList,
      editDashboard,
      AddDashboard,
      EditDashboardUsers,
      editDashboardUsers,
    };
  },
};
</script>
