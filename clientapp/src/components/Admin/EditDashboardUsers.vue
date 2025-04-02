<template>
  <q-card flat class="edit-dashboard-users">
    <q-toolbar>
      <q-input
        v-model="search"
        filled
        dense
        :placeholder="GetLocaleString('SEARCH', 'Search...')"
        :disable="loading"
        :debounce="800"
        autofocus
      >
        <template v-slot:append>
          <q-btn
            flat
            round
            size="sm"
            icon="r_close"
            @click.stop="
              () => {
                search = null;
              }
            "
          />
        </template>
      </q-input>
      <q-space />
      <q-btn
        label="Add User"
        color="primary"
        flat
        icon="o_search"
        dense
        @click="ShowSearchUser"
        no-caps
      />
    </q-toolbar>
    <q-card-section class="q-pa-none" style="height: calc(100% - 52px)">
      <q-virtual-scroll
        v-if="items.length > 0"
        ref="vscroll"
        :items-size="itemSize"
        :items-fn="getItems"
  
        :style="`height: calc(100% - 0px)`"
      >
        <template v-slot:default="{ item, index }">
          <q-item
            :key="index"
            class="q-my-sm q-mx-none"
            dense
            style="background: transparent"
          >
            <q-item-section avatar top>
              <q-avatar
                size="42px"
                style="background: transparent; margin-top: 4px"
              >
                <q-img
                  :src="`${server.defaults.baseURL}/user/photo/?id=${item.ID}`"
                  width="42px"
                  height="42px"
                >
                  <!-- :src="`data:image/png;base64,${props.row.Photo}`" -->
                  <template v-slot:error>
                    <q-icon name="o_account_circle" size="42px" />
                  </template>
                </q-img>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-bold">{{
                item.DisplayName
              }}</q-item-label>
              <q-item-label caption="">{{ item.Email }}</q-item-label>
              <q-item-label caption>{{ item.Title }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                round
                flat
                icon="o_close"
                dense
                @click="DeleteItem(item.ID)"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </q-card-section>

    <SearchUser ref="searchUser" @select="SelectEmployee" />
  </q-card>
</template>

<style lang="scss">
.edit-dashboard-users {
  .q-field__control {
    height: 100%;
  }

  .q-editor__content {
    background: rgba(0, 0, 0, 0.05);
  }
}

.body--dark {
  .edit-dashboard-users {
    .q-editor__content {
      background: hsla(0, 0%, 100%, 0.07);
    }
  }
}
</style>

<script>
import {
  defineComponent,
  ref,
  inject,
  onMounted,
  watch,
  defineAsyncComponent,
} from "vue";
import general from "@/mixins/general";
import api from "@/api/index";
import server from "@/server";
import { useMainStore } from "../../store";
import { useUser } from "../../store/user";
import { useOptions } from "../../store/options";
import { useEvalFilter } from "@/composables/evalFilter";

export default defineComponent({
  name: "EditDashboardUsers",
  components: {
    SearchUser: defineAsyncComponent(() =>
      import("@/components/General/SearchUser.vue")
    ),
  },
  emits: ["update", "done"],
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const mainStore = useMainStore();
    const user = useUser();
    const options = useOptions();
    const { FilterToken } = useEvalFilter();
    const { NotifyUser, ParseName, SetValueToArr, FillArr } = general();
    const loading = ref(false);
    const items = ref([]);
    const dashboardId = ref(-1);
    const itemSize = ref(1);
    const search = ref(null);
    const searchUser = ref(null);

    const GetMaster = () => {
      loading.value = true;

      api
        .DashboardUserGetAll(dashboardId.value, { search: search.value })
        .then((r) => {
          itemSize.value = r.data.payload.total;
          items.value = [...r.data.payload.data];

          loading.value = false;
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const Edit = (data) => {
      dashboardId.value = data;
      items.value = [];
      GetMaster();
    };

    const getItems = (from, size) => {
      const d = [];
      for (let i = 0; i < size; i++) {
        d.push(items.value[from + i]);
      }
      return Object.freeze(d);
    };

    const DeleteItem = (id) => {
      api.DashboardUserDelete(dashboardId.value, id).then((response) => {
        NotifyUser(response.data);
        if (response.data.success) {
          GetMaster();
          ctx.emit("update");
        }
      });
    };

    const SelectEmployee = (data) => {
      console.warn(data);
      if (data.ID !== undefined) {
        api.DashboardUserSave(dashboardId.value, data.ID).then((response) => {
          if (response.data.success) {
            GetMaster();
            ctx.emit("update");
          }
        });
      }
    };

    const ShowSearchUser = () => {
      setTimeout(() => {
        if (searchUser.value) searchUser.value.Show();
      }, 300);
    };

    watch(search, () => {
      GetMaster();
    });

    onMounted(() => {
      //GetMaster();
    });

    return {
      ctx,
      GetLocaleString,
      loading,
      GetMaster,
      server,
      Edit,
      mainStore,
      user,
      options,
      ParseName,
      SetValueToArr,
      FillArr,
      FilterToken,
      items,
      dashboardId,
      itemSize,
      getItems,
      search,
      DeleteItem,
      searchUser,
      SelectEmployee,
      ShowSearchUser,
    };
  },
});
</script>