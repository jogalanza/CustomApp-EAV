<template>
  <EditDialog :dialog="dialog" @ondialog="dialog = $event" action-style="height: 70px" content-style="height: calc(100% - 50px);" :show-action="false">
    <template v-slot:header>
      <q-toolbar>
        <q-toolbar-title>Account</q-toolbar-title>
        <q-space />
        <q-btn flat round icon="o_close" @click="dialog = false" :disable="loading" />
      </q-toolbar>
    </template>
    <EditUser ref="editUser" @done="dialog = false" @update="GetMaster" style="width: 100%" />
  </EditDialog>

  <q-table class="col-12 sticky-header sticky-row-header sticky-action-col" flat :columns="columns" :rows="items" row-key="ID" virtual-scroll v-model:pagination="pagination"
    :visible-columns="visibleCols" :loading="loading" @request="GetMaster" :filter="pagination.search" selection="multiple" v-model:selected="selected" :rows-per-page-options="[10, 20]"
    style="height: 100%; overflow-y: auto">
    <template v-slot:loading>
      <div class="absolute fit row justify-center items-center" style="background: rgba(0, 0, 0, 0.5); margin: 0px; z-index: 100">
        <q-spinner-ball size="md" color="white" style="margin-right: 16px" />
        <span style="color: white; letter-spacing: 0.2rem">Loading</span>
      </div>
    </template>

    <template v-slot:top>
      <q-toolbar>
        <q-input v-model="pagination.search" filled borderless dense class="toolbar-input" style="height: 30px" :placeholder="GetLocaleString('SEARCH', 'Search...')" :disable="loading" :debounce="800"
          autofocus>
          <template v-slot:append>
            <q-btn flat round size="sm" icon="r_close" @click.stop="() => {
    pagination.search = null;
  }
    " />
          </template>
        </q-input>
        <q-space />

        <q-btn v-if="selected.length > 0" icon="o_delete_forever" flat label="Delete" style="min-width: 60px" dense color="red" padding="xs sm" no-caps stack @click="DeleteItems"><q-tooltip>Delete
            Selected</q-tooltip></q-btn>

        <q-btn icon="r_refresh" style="min-width: 60px" dense flat no-caps color="primary" stack :label="GetLocaleString(`REFRESH`, 'Refresh')" @click="GetMaster()">
          <q-tooltip>{{ GetLocaleString("REFRESH", "Refresh") }}</q-tooltip>
        </q-btn>

        <q-btn icon="o_file_download" style="min-width: 60px" dense flat no-caps color="primary" stack :label="GetLocaleString(`EXPORT`, 'Export')" @click="ExportToFile" class="q-ml-sm">
          <q-tooltip>{{
    GetLocaleString("EXPORT_USER_EXCEL", "Export User List to Excel")
  }}</q-tooltip>
        </q-btn>

        <q-btn icon="o_person_add" style="min-width: 60px" dense flat no-caps color="primary" unelevated stack :label="GetLocaleString(`NEW`, 'New')" @click="AddNew" class="q-ml-sm">
          <q-tooltip>{{
    GetLocaleString("ADD_NEW_USER", "Add new user")
  }}</q-tooltip>
        </q-btn>
      </q-toolbar>

      <!-- <q-toolbar>
                      <FilterBar v-model="dataOptions" :opts="filterOpts" />
                    </q-toolbar> -->
    </template>

    <template v-slot:header-cell-action="props">
      <q-th :props="props">
        <q-btn icon="r_settings" flat round size="sm">
          <q-popup-proxy>
            <q-card>
              <q-card-section class="q-pl-none">
                <q-list>
                  <q-item v-for="(c, i) in columns.filter((e) => e.label !== '')" :key="i" class="q-pa-none">
                    <q-item-section avatar class="q-pr-none"><q-toggle v-model="visibleCols" :val="c.name" /></q-item-section>
                    <q-item-section>{{ c.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>
      </q-th>
    </template>

    <template v-slot:body-cell-Email="props">
      <q-td :props="props" :style="props.col.style ? { ...props.col.style } : null">
        <q-list style="margin-left: -16px">
          <q-item>
            <q-item-section avatar>
              <q-avatar size="48px" style="background: #bbb">
                <q-img :src="`${server.defaults.baseURL}api/account/photo/${props.row.ID}?t=${renderKey}`" width="48px" height="48px">
                  <!-- :src="`data:image/png;base64,${props.row.Photo}`" -->
                  <template v-slot:error>
                    <div class="no-photo">
                      {{ ParseName(props.row.DisplayName) }}
                    </div>
                  </template>
                </q-img>
                <q-badge float :color="props.row.IsOnline ? 'green' : 'grey'" rounded style="
                    position: absolute;
                    bottom: 2px;
                    right: 0px;
                    width: 16px;
                    height: 16px;
                    outline: 2px solid white;
                  " />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ props.row.DisplayName }}
                <span v-if="props.row.IsApprover"><q-chip label="Approver" dense color="primary" text-color="white" /></span></q-item-label>
              <q-item-label caption="">{{ props.row.Email }}</q-item-label>
              <q-item-label caption>{{ props.row.Title }}</q-item-label>
              <q-item-label caption><q-chip dense :color="props.row.IsActive ? 'primary' : 'red'">{{ props.row.IsActive ? "Active" : "Inactive" }}</q-chip></q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-td>
    </template>

    <template v-slot:body-cell-LastLogin="props">
      <q-td :props="props" :style="props.col.style ? { ...props.col.style } : null">
        {{ moment(moment.utc(props.row.LastLogin)).local().fromNow() }}
      </q-td>
    </template>

    <template v-slot:body-cell-action="props">
      <q-td class="sticky-bg-color" :props="props" :style="props.col.style ? { ...props.col.style } : null">

        <q-btn icon="r_edit" unelevated dense round no-caps @click="EditUser(props.row)" class="q-mr-sm" size="sm">
          <q-tooltip>Edit</q-tooltip>
        </q-btn>

        <!-- <q-btn icon="r_more_horiz" dense unelevated>
          <q-menu>
            <q-list style="min-width: 100px" dense>
              <q-item clickable v-close-popup @click="EditUser(props.row)">
                <q-item-section>Edit</q-item-section>
              </q-item>            
            </q-list>
          </q-menu>
        </q-btn> -->
      </q-td>
    </template>


  </q-table>
</template>

<style scoped lang="scss">
.no-photo {
  width: 48px;
  height: 48px;
  text-align: center;
  padding: 0px;
  line-height: 2em;
}
</style>

<script>
import { defineComponent, ref, watch, inject, onMounted, defineAsyncComponent } from "vue";
import general from "@/mixins/general";
import api from "@/api/account";
import server from "@/server";
import moment from "moment";
import { useRoute } from "vue-router";
import { useHelper } from "@/composables/helper";

export default defineComponent({
  name: "UserList",
  emits: ["edit", "addnew"],
  components: {
    EditDialog: defineAsyncComponent(() =>
      import("@/components/General/EditDialog.vue")),
    EditUser: defineAsyncComponent(() => import("@/components/Admin/EditUser.vue")),
  },
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const route = useRoute();
    const { NotifyUser, ParseName, ConfirmAction } = general();
    const { renderKey, UpRender } = useHelper();
    const loading = ref(false);
    const selected = ref([]);
    const pagination = ref({
      sortBy: "Email",
      descending: false,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20,
      search: null,
    });
    const visibleCols = ref([
      "Email",
      "Manager",
      "RoleName",
      "LastLogin",
      "action",
    ]);

    const columns = ref([
      {
        field: "Email",
        name: "Email",
        label: "User",
        align: "left",
        sortable: true,
      },
      {
        field: "Manager",
        name: "Manager",
        label: "Manager",
        align: "left",
        sortable: true,
      },
      {
        field: "RoleName",
        name: "RoleName",
        label: "Role",
        align: "left",
      },
      {
        field: "LastLogin",
        name: "LastLogin",
        label: "Last Seen",
        align: "left",
        sortable: true,
      },
      {
        name: "action",
        field: "Action",
        langkey: "ACTION",
        label: "",
        sortable: false,
        style: { padding: "8px" },
      },
    ]);

    const items = ref([]);

    const editUser = ref(null);
    const dialog = ref(false);

    watch(
      visibleCols,
      () => {
        window.localStorage.setItem(
          "_xmap_acct_cols",
          JSON.stringify(visibleCols.value)
        );
      },
      { deep: true }
    );

    const GetMaster = (props) => {

      if (loading.value) return;

      if (!props || props.which !== undefined) {
        props = {
          pagination: pagination.value,
          filter: undefined,
        };
      }

      const { page, rowsPerPage, sortBy, descending } = props.pagination;

      loading.value = true;
      selected.value = [];

      api
        .UserGetAll(props.pagination)
        .then((r) => {
          items.value = [...r.data.payload.data];
          loading.value = false;

          pagination.value.page = page;
          pagination.value.rowsPerPage = rowsPerPage;
          pagination.value.sortBy = sortBy;
          pagination.value.descending = descending;
          pagination.value.rowsNumber = r.data.payload.total;

          UpRender();
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const ExportToFile = () => {
      NotifyUser({ success: true, message: "Preparing file..." });
      api.UserExport(pagination.value);
    };

    const ApproveAccess = (row) => {
      row.loading = true;

      api
        .UserApproveAccess(row.ID)
        .then((response) => {
          row.loading = false;
          if (response.data.success) {
            GetMaster();
          }
          NotifyUser(response.data);
        })
        .catch(() => {
          row.loading = false;
        });
    };

    const EditUser = (row) => {
      dialog.value = true;
      setTimeout(() => {
        editUser.value.Edit(row);
      }, 800);
    };

    const DeleteItems = () => {
      ConfirmAction(
        "Are you sure you want to proceed with delete action?",
        () => {
          var x = [];
          selected.value.map((e) => x.push(e.ID));
          loading.value = true;
          api
            .UserDelete(x)
            .then((response) => {
              loading.value = false;
              NotifyUser(response.data);
              if (response.data.success) {
                GetMaster();
              }
            })
            .catch(() => {
              loading.value = false;
            });
        }
      );
    };

    const AddNew = () => {
      dialog.value = true;
      setTimeout(() => {
        editUser.value.AddNew();
      }, 800);
    }

    watch(route, (newVal) => {
      console.warn("watch route", newVal, newVal.query);
    }, { deep: true });

    onMounted(() => {
      var cols = window.localStorage.getItem("_xmap_acct_cols");

      if (cols) {
        try {
          var _cols = JSON.parse(cols);
          visibleCols.value = [..._cols];
        } catch {
          //
        }
      }

      console.warn(route.query, route);
      if (route.query.search) {
        pagination.value.search = route.query.search;
      }

      GetMaster();
    });

    return {
      dialog,
      selected,
      GetLocaleString,
      pagination,
      visibleCols,
      columns,
      items,
      loading,
      renderKey,
      editUser,
      ApproveAccess,
      GetMaster,
      EditUser,
      ParseName,
      server,
      moment,
      ExportToFile,
      DeleteItems,
      AddNew,
      ctx
    };
  },
});
</script>