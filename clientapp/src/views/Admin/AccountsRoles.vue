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
            <q-tabs v-model="tab" no-caps align="left" style="width: 100%" dense>
              <q-tab name="user" label="Accounts" class="app-title in-board maintenance-tab"/>
              <q-tab name="group" label="Roles" class="app-title in-board maintenance-tab" />
            </q-tabs>

            <q-tab-panels
              v-model="tab"
              keep-alive
              style="width: 100%; height: calc(100% - 62px)"
            >
              <q-tab-panel name="user">
                <UserList ref="userList" @edit="EditUser" @addnew="AddNewUser" />
              </q-tab-panel>

              <q-tab-panel name="group">
                <RoleList ref="roleList" @edit="EditRoleAccess" @addnew="AddRoleAccess" />
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
  onMounted,
} from "vue";

import general from "@/mixins/general";
import { useUser } from "@/store/user";
import { useMainStore } from "@/store/index";
import { useQuasar } from "quasar";

export default {
  name: "AccountsRoles",
  components: {
    BoardLayout: defineAsyncComponent(() =>
      import("../../components/General/BoardLayout.vue")
    ),
    UserList: defineAsyncComponent(() =>
      import("../../components/Admin/UserList.vue")
    ),
    RoleList: defineAsyncComponent(() =>
      import("../../components/Admin/RoleList.vue")
    ),
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
    const userList = ref(null);
    const roleList = ref(null);
    const editRoleAccess = ref(null);
    const editUser = ref(null);

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

    const EditUser = (data) => {
      SwitchPanel("edituser");
      setTimeout(() => {
        editUser.value.Edit(data);
      }, 500);
    };

    const AddNewUser = () => {
      SwitchPanel("edituser");
      setTimeout(() => {
        editUser.value.AddNew();
      }, 500);
    };

    const EditRoleAccess = (data) => {
      SwitchPanel("editroleaccess");
      setTimeout(() => {
        editRoleAccess.value.Edit(data);
      }, 500);
    };

    const AddRoleAccess = () => {
      SwitchPanel("editroleaccess");
      setTimeout(() => {
        editRoleAccess.value.AddNew();
      }, 500);
    };

    const CloseDrawer = () => {
      drawerRight.value = false;
    };

    onMounted(() => {
      //
    })

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
      EditUser,
      filterOpts,
      selected,
      mainStore,
      EditRoleAccess,
      AddRoleAccess,
      editRoleAccess,
      userList,
      roleList,
      editUser,
      AddNewUser,
      CloseDrawer
    };
  },
};
</script>
