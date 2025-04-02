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
          icon="o_delete_forever"
          flat
          label="Delete"
          dense
          color="red"
          padding="xs sm"
          no-caps
          @click="DeleteItems"
          ><q-tooltip>Delete Selected</q-tooltip></q-btn
        >

        <q-btn
          icon="r_refresh"
          dense
          flat
          no-caps
          color="primary"
          :label="GetLocaleString(`REFRESH`, 'Refresh')"
          @click="GetMaster()"
        >
          <q-tooltip>{{ GetLocaleString("REFRESH", "Refresh") }}</q-tooltip>
        </q-btn>

        <q-btn
          icon="o_addchart"
          dense
          flat
          no-caps
          color="primary"
          :label="GetLocaleString(`ADD_NEW`, 'Add New')"
          @click="ctx.emit('addnew')"
        >
          <q-tooltip>{{
            GetLocaleString("ADD_NEW_DASHBOARD", "Add New Dashboard")
          }}</q-tooltip>
        </q-btn>
      </q-toolbar>
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

    <template v-slot:body-cell-Email="props">
      <q-td
        :props="props"
        :style="props.col.style ? { ...props.col.style } : null"
      >
        <q-list style="margin-left: -16px">
          <q-item>
            <q-item-section avatar>
              <q-avatar size="62px" style="background: #bbb">
                <q-img
                  :src="`${server.defaults.baseURL}/user/photo/?id=${props.row.ID}`"
                  width="62px"
                  height="62px"
                >
                  <!-- :src="`data:image/png;base64,${props.row.Photo}`" -->
                  <template v-slot:error>
                    <div class="no-photo">
                      {{ ParseName(props.row.DisplayName) }}
                    </div>
                  </template>
                </q-img>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ props.row.DisplayName }}</q-item-label>
              <q-item-label caption="">{{ props.row.Email }}</q-item-label>
              <q-item-label caption>{{ props.row.Title }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-td>
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
          @click="EditItem(props.row)"
          class="q-mr-sm"
          round
        >
          <q-tooltip>Edit</q-tooltip>
        </q-btn>

        <q-btn
          icon="o_supervised_user_circle"
          unelevated
          dense
          no-caps
          @click="ctx.emit('editusers', props.row.ID)"
          class="q-mr-sm"
          round
        >
          <q-badge v-if="props.row.AccessCount > 0" floating color="red" rounded>{{ props.row.AccessCount }}</q-badge>
          <q-tooltip>Access</q-tooltip>
        </q-btn>
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
import moment from "moment";

export default defineComponent({
  name: "DashboardList",
  emits: ["edit", "addnew", "editusers"],
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const { NotifyUser, ParseName, ConfirmDelete } = general();
    const loading = ref(false);
    const selected = ref([]);
    const pagination = ref({
      sortBy: "Title",
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 20,
      search: null,
    });
    const visibleCols = ref([
      "Title",
      "ChartUrl",
      "Notes",
      "GroupName",
      "action",
    ]);

    const columns = ref([
      {
        field: "Title",
        name: "Title",
        label: "Title",
        align: "left",
        sortable: true,
      },
      // {
      //   field: "ChartUrl",
      //   name: "ChartUrl",
      //   label: "Url",
      //   align: "left",
      //   sortable: true,
      // },
      {
        field: "Notes",
        name: "Notes",
        label: "Notes",
        align: "left",
        sortable: true,
      },
      {
        field: "GroupName",
        name: "GroupName",
        label: "Group",
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
          "_xmap_dashboardlist_cols",
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

      api
        .DashboardGetAll(props.pagination)
        .then((r) => {
          items.value = [...r.data.payload.data];
          selected.value = [];
          loading.value = false;

          pagination.value.page = page;
          pagination.value.rowsPerPage = rowsPerPage;
          pagination.value.sortBy = sortBy;
          pagination.value.descending = descending;
          pagination.value.rowsNumber = r.data.payload.total;
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

    const EditItem = (row) => {
      ctx.emit("edit", row);
    };

    const DeleteItems = () => {
      console.warn(selected.value);
      var x = [];
      selected.value.forEach((element) => {
        x.push(element.ID);
      });

      ConfirmDelete(x, () => {
        loading.value = true;
        api
          .DashboardDelete(x)
          .then((response) => {
            loading.value = false;
            NotifyUser(response.data);
            GetMaster();
          })
          .catch(() => {
            loading.value = false;
          });
      });
    };

    onMounted(() => {
      var cols = window.localStorage.getItem("_xmap_dashboardlist_cols");

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
      ctx,
      selected,
      GetLocaleString,
      pagination,
      visibleCols,
      columns,
      items,
      loading,
      ApproveAccess,
      GetMaster,
      EditItem,
      ParseName,
      server,
      moment,
      DeleteItems
    };
  },
});
</script>