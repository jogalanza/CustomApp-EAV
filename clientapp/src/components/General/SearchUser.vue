<template>
  <q-dialog v-model="dialog" persistent>
    <q-card class="find-employee">
      <q-linear-progress
        color="red"
        v-if="loading"
        indeterminate
      ></q-linear-progress>
      <q-toolbar>
        <q-toolbar-title>{{ title }}</q-toolbar-title>
        <q-space />
        <q-btn icon="r_close" flat round dense @click="dialog = false" />
      </q-toolbar>
      <q-toolbar>
        <q-input
          v-model="search"
          debounce="800"
          filled
          dense
          label="Search Employee"
          style="width: 100%"
          autofocus
          :disable="loading"
          clearable
        ></q-input>
      </q-toolbar>
      <q-card-section>
        <div v-if="loading">Searching...</div>
        <div v-else-if="items.length === 0">No results found</div>
        <q-virtual-scroll
          v-else
          style="max-height: 300px"
          :items="items"
          v-slot="{ item, index }"
        >
          <q-item
            :key="index"
            clickable
            @click="activeItem = item"
            :active="activeItem === item"
          >
            <q-item-section avatar top>
              <q-avatar
                size="42px"
                style="background: transparent; margin-top: 4px"
              >
                <q-img
                  :src="`${server.defaults.baseURL}/user/photo/?t=${renderKey}&id=${item.ID}`"
                  width="42px"
                  height="42px"
                >
                  <template v-slot:error>
                    <q-icon name="o_account_circle" size="42px" />
                  </template>
                </q-img>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.DisplayName }} </q-item-label>
              <q-item-label caption="">{{ item.Email }}</q-item-label>
              <q-item-label caption>{{ item.Title }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
      </q-card-section>
      <q-card-actions class="q-px-md">
        <q-space />
        <q-btn
          class="q-mr-md"
          label="Select"
          no-caps
          flat
          padding="xs lg"
          dense
          :disable="loading || activeItem.ID === undefined"
          @click="SelectItem(false)"
        />
        <q-btn
          label="Select and Close"
          no-caps
          color="green"
          padding="xs lg"
          dense
          :disable="loading || activeItem.ID === undefined"
          @click="SelectItem"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.find-employee {
  .q-item--active {
    background: #e9dddd;
    border-radius: 8px;
  }
}
</style>

<script>
import { defineComponent, ref, watch } from "vue";
import api from "@/api/index";
import server from "@/server";
import { useUser } from "../../store/user";

export default defineComponent({
  name: "SearchUser",
  props: {
    admode: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Find Employee"
    }
  },
  components: {
    // ProfileAvatar: defineAsyncComponent(() =>
    //   import("@/components/General/ProfileAvatar.vue")
    // ),
  },
  emits: ["select"],
  setup(props, context) {
    const user = useUser();
    const dialog = ref(false);
    const search = ref(null);
    const items = ref([]);
    const loading = ref(false);
    const renderKey = ref(1);
    const activeItem = ref({});

    watch(
      () => search.value,
      () => {
        if (props.admode) {
          GetADMaster();
        } else {
          GetMaster();
        }
      }
    );

    const Show = () => {
      search.value = null;
      activeItem.value = {};
      dialog.value = true;
      if (props.admode) {
        items.value = [];
        GetADMaster();
      } else {
        GetMaster();
      }
    };

    const GetADMaster = () => {
      if (search.value && search.value.length < 2) return;

      loading.value = true;
      activeItem.value = {};

      user.SearchUserFromAD(search.value).then(() => {
        loading.value = false;
        renderKey.value = new Date().getTime();
        items.value = [...user.ADUsers];
      });
    };

    const GetMaster = () => {
      if (search.value && search.value.length < 2) return;

      loading.value = true;
      activeItem.value = {};
      api
        .UserGetAll({ search: search.value })
        .then((response) => {
          loading.value = false;
          renderKey.value = new Date().getTime();
          items.value = [...response.data.payload.data];
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const SelectItem = (_close = true) => {
      context.emit("select", activeItem.value);
      if (_close) {
        dialog.value = false;
      }
    };
    return {
      items,
      activeItem,
      search,
      dialog,
      renderKey,
      server,
      Show,
      GetMaster,
      SelectItem,
      user,
      loading
    };
  },
});
</script>
