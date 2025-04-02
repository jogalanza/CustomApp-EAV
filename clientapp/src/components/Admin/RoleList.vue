<template>
  <q-table
    class="col-12 sticky-header sticky-row-header sticky-action-col"
    flat
    :columns="columns"
    :rows="items"
    row-key="ID"
    virtual-scroll
    v-model:pagination="pagination"
    :visible-columns="visibleCols"
    :loading="loading"
    @request="GetMaster"
    :filter="pagination.search"
    selection="multiple"
    v-model:selected="selected"
    :rows-per-page-options="[10, 20]"
    style="height: 100%; overflow-y: auto"
  >
    <template v-slot:loading>
      <div
        class="absolute fit row justify-center items-center"
        style="background: rgba(0, 0, 0, 0.5); margin: 0px; z-index: 100"
      >
        <q-spinner-ball size="md" color="white" style="margin-right: 16px" />
        <span style="color: white; letter-spacing: 0.2rem">Loading</span>
      </div>
    </template>

    <template v-slot:top>
      <q-toolbar>
        <q-input
          v-model="pagination.search"
          filled
          dense
          class="toolbar-input"
          style="height: 30px"
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
                  pagination.search = null;
                }
              "
            />
          </template>
        </q-input>
        <q-space />

        
        <q-btn
          v-if="selected.length > 0"
          icon="r_delete_forever"
          dense
          flat
          no-caps
          color="primary"
          :label="GetLocaleString(`DELETE`, 'Delete')"
          @click="DeleteItems"
          class="q-mr-sm"
        >
          <q-tooltip>{{ GetLocaleString("DELETED_SELECTED", "Delete selected") }}</q-tooltip>
        </q-btn>
        <q-btn
          icon="r_refresh"
          dense
          flat
          no-caps
          color="primary"
          :label="GetLocaleString(`REFRESH`, 'Refresh')"
          @click="GetMaster()"
          class="q-mr-sm"
        >
          <q-tooltip>{{ GetLocaleString("REFRESH", "Refresh") }}</q-tooltip>
        </q-btn>

        <q-btn
          icon="r_add"
          dense
          no-caps
          color="primary"
          :label="GetLocaleString(`ADD_NEW`, 'Add New')"
          @click="ctx.emit('addnew')"
          padding="xs sm"
        >
          <q-tooltip>{{ GetLocaleString("ADD_NEW", "Add New Role") }}</q-tooltip>
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
                  <q-item
                    v-for="(c, i) in columns.filter((e) => e.label !== '')"
                    :key="i"
                    class="q-pa-none"
                  >
                    <q-item-section avatar class="q-pr-none"
                      ><q-toggle v-model="visibleCols" :val="c.name"
                    /></q-item-section>
                    <q-item-section>{{ c.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>
      </q-th>
    </template>

    <template v-slot:body-cell-action="props">
      <q-td
        class="sticky-bg-color"
        :props="props"
        :style="props.col.style ? { ...props.col.style } : null"
      >
        <q-btn
          icon="r_edit"
          unelevated
          dense
          no-caps
          @click="EditUser(props.row)"
          class="q-mr-sm"
        >
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
    width: 62px;
    height: 62px;
    text-align: center;
    padding: 0px;
    line-height: 2em;
}
</style>

<script>
import { defineComponent, ref, watch, inject, onMounted } from "vue";
import general from "@/mixins/general";
import api from "@/api/index";
import server from "@/server";

export default defineComponent({
  name: "RoleList",
  emits: ["edit", "addnew"],
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");

    const { NotifyUser, ConfirmAction } = general();
    const loading = ref(false);
    const selected = ref([]);
    const pagination = ref({
      sortBy: "RoleName",
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20,
      search: null
    });
    const visibleCols = ref([
      "RoleName",
      "Description",
      "action",
    ]);

    const columns = ref([
      {
        field: "RoleName",
        name: "RoleName",
        label: "Role",
        align: "left",
        sortable: true,
      },
      {
        field: "Description",
        name: "Description",
        label: "Description",
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

    watch(
      visibleCols,
      () => {
        window.localStorage.setItem(
          "_xmap_roles_cols",
          JSON.stringify(visibleCols.value)
        );
      },
      { deep: true }
    );

    const GetMaster = (props) => {
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
        .RoleGetAll(props.pagination)
        .then((r) => {
          items.value = [...r.data.payload.data];
          loading.value = false;

          pagination.value.page = page;
          pagination.value.rowsPerPage = rowsPerPage;
          pagination.value.sortBy = sortBy;
          pagination.value.descending = descending;
          pagination.value.rowsNumber = r.total;
        })
        .catch(() => {
          loading.value = false;
        });
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
      ctx.emit("edit", row);
    }

    const ParseName = (r) => {
      var x = r.split(" ");
      if (x.length > 1){
        return x[0].substring(0, 1) + x[1].substring(0, 1)
      }

      return x[0].substring(0, 2);
    }

    const DeleteItems = () => {
      ConfirmAction(
        "Are you sure you want to proceed with delete action?",
        () => {
          var x = [];
          selected.value.map((e) => {
            // delete roles other than admin, viewer
            if ([1,2].indexOf(e.ID) === -1){
              x.push(e.ID)
            }            
          });

          if (x.length === 0){
            selected.value = [];
            return;
          }

          loading.value = true;
          api
            .RoleDelete(x)
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

    onMounted(() => {
      var cols = window.localStorage.getItem("_xmap_roles_cols");

      if (cols) {
        try {
          var _cols = JSON.parse(cols);
          visibleCols.value = [..._cols];
        } catch {
          //
        }
      }

      GetMaster();
    });

    return {
      selected,
      GetLocaleString,
      pagination,
      visibleCols,
      columns,
      items,
      loading,
      ApproveAccess,
      GetMaster,
      EditUser,
      ParseName,
      server,
      ctx,
      DeleteItems
    };
  },
});
</script>