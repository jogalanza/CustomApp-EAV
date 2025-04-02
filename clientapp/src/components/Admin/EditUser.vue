<template>
  <q-card flat class="edit-user">
    <q-card-section class="q-py-none" style="height: calc(100% - 52px)">
      <q-list :disable="loading" style="
          height: 100%;
          overflow-y: auto;
          padding-right: 8px;
          margin-right: -16px;
        ">
        <q-item v-if="isNew" class="q-px-none">
          <q-item-section>
            <q-item-label>
              <q-btn label="Search Employee From Active Directory" color="primary" icon="o_search" dense @click="ShowSearchUser" no-caps style="width: 100%" />
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="item.Email !== null" class="q-px-none">
          <q-item-section avatar>
            <q-avatar size="62px" style="background: #bbb">
              <q-img :src="`${server.defaults.baseURL}api/account/photo/${item.ID}`" width="62px" height="62px">
                <!-- :src="`data:image/png;base64,${props.row.Photo}`" -->
                <template v-slot:error>
                  <div class="no-photo">{{ ParseName(item.DisplayName) }}</div>
                </template>
              </q-img>
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label style="text-overflow: ellipsis; overflow: hidden">{{
        item.DisplayName
      }}</q-item-label>
            <!-- <q-item-label caption="" style="text-overflow: ellipsis; overflow: hidden">{{ item.Email }}</q-item-label> -->
            <q-item-label caption style="text-overflow: ellipsis; overflow: hidden">{{ item.Title }}</q-item-label>
            <q-item-label v-if="item.Manager" caption style="text-overflow: ellipsis; overflow: hidden">{{ `Reports to ${item.Manager}` }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-my-sm" />
        <q-item class="q-pa-none">
          <q-item-section>
            <q-item-label>Email</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model="item.Email" filled borderless dense input-class="text-right" square style="width: 280px;" />
          </q-item-section>
        </q-item>
        <q-item class="q-pa-none">
          <q-item-section>
            <q-item-label>Role</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select v-model="item.RoleId" :options="options.Roles" option-label="label" option-value="value" borderless dense emit-value map-options input-class="text-right" />
          </q-item-section>
        </q-item>
        <q-item class="q-pa-none">
          <q-item-section>
            <q-item-label>Status</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select v-model="item.IsActive" :options="[{ label: 'Active', value: true }, { label: 'Inactive', value: false }]" option-label="label" option-value="value" borderless dense emit-value
              map-options input-class="text-right" />
          </q-item-section>
        </q-item>
        <q-separator v-if="[2, 4].indexOf(item.RoleId) > -1" class="q-my-sm" />
        <q-item v-if="[2, 4].indexOf(item.RoleId) > -1" class="q-px-none">
          <q-item-section>
            <div class="q-mt-md q-mb-sm">
              <span class="text-h6 text-bold">Sites</span>
              <q-chip clickable dense flat outline no-caps class="q-ml-md" style="border-color: transparent" @click="item.Sites.map(e => e.Assigned = false)">Clear</q-chip>
              <q-chip clickable style="border-color: transparent" outline dense flat no-caps class="q-ml-sm" @click="item.Sites.map(e => e.Assigned = true)">Select All</q-chip>
            </div>
            <div class="row">
              <q-chip v-for="(m, i) in item.Sites" :key="i" clickable :class="`filter-chip ${m.Assigned ? 'active' : ''
        }`" @click="m.Assigned = !m.Assigned">{{ m.SiteName }}</q-chip>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-actions class="q-pt-md">
      <q-space />
      <q-btn label="Cancel" flat @click="$emit('close')" :disable="loading" no-caps />
      <q-btn label="Save" no-caps color="primary" padding="sm lg" @click="SaveItem" :disable="loading" :loading="loading" />
    </q-card-actions>

    <SearchUser ref="searchUser" @select="SelectEmployee" admode title="Search in Active Directory" />
  </q-card>
</template>

<style scoped lang="scss">
.no-photo {
  width: 62px;
  height: 62px;
  text-align: center;
  padding: 0px;
  line-height: 2em;
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
  nextTick,
} from "vue";
import general from "@/mixins/general";
import api from "@/api/account";
import server from "@/server";
import { useMainStore } from "../../store";
import { useUser } from "../../store/user";
import { useOptions } from "../../store/options";

export default defineComponent({
  name: "EditUser",
  emits: ["update", "done", "approve"],
  components: {
    SearchUser: defineAsyncComponent(() =>
      import("@/components/General/SearchUser.vue")
    ),
  },
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const mainStore = useMainStore();
    const user = useUser();
    const options = useOptions();
    const { NotifyUser, ParseName, SetValueToArr, FillArr } = general();
    const loading = ref(false);
    const item = ref({});
    const roles = ref([]);
    const userSites = ref([]);
    const userProducts = ref([]);
    const userDashboards = ref([]);
    const userRoles = ref([]);
    const isNew = ref(false);
    const userSearch = ref(null);
    const searchUser = ref(null);

    watch(
      () => userSearch.value,
      (newVal) => {
        if (newVal.length >= 3) {
          user.SearchUserFromAD(newVal);
        }
      }
    );

    const GetMaster = () => {
      api.GetUserByID(item.value.ID).then(response => {
        item.value = { ...response.data };
      })
    };

    const SaveItem = () => {
      loading.value = true;
      api
        .UserSave(item.value)
        .then((response) => {
          NotifyUser(response.data);
          loading.value = false;
          if (response.data.success) {
            nextTick(() => {
              ctx.emit("done");
              ctx.emit("update");
            });
          }
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const Edit = (data) => {
      isNew.value = false;
      item.value = { ...data };
      GetMaster();
    };

    const AddNew = () => {
      isNew.value = true;
      item.value = {
        ID: 0,
        Email: null,
        Collaboration: 0,
        BusinessDriver: 0,
        RoleId: 4,
        DisplayName: null,
        FirstName: null,
        LastName: null,
        Manager: null,
        Title: null,
      };

      GetMaster();

      ShowSearchUser();
    };
    
    const SelectEmployee = (data) => {
      //console.warn(data, data.value);
      item.value.DisplayName = data.DisplayName;
      item.value.FirstName = data.FirstName;
      item.value.LastName = data.LastName;
      item.value.Manager = data.Manager;
      item.value.Title = data.Title;
      item.value.Email = data.Email;
    };

    const ShowSearchUser = () => {
      setTimeout(() => {
        if (searchUser.value) searchUser.value.Show();
      }, 300);
    };

    onMounted(() => {
      //GetMaster();
      console.error("EditROleAccess mounted");
    });

    return {
      ctx,
      GetLocaleString,
      loading,
      GetMaster,
      server,
      Edit,
      item,
      mainStore,
      user,
      options,
      SaveItem,
      ParseName,
      roles,
      userRoles,
      userSites,
      userProducts,
      userDashboards,
      SetValueToArr,
      FillArr,
      AddNew,
      isNew,
      userSearch,
      SelectEmployee,
      searchUser,
      ShowSearchUser,
    };
  },
});
</script>