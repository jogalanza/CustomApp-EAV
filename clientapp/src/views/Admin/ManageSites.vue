<template>
  <BoardLayout class="manage-targets" :loading="loading" :drawer="drawerRight" :breakpoint="20000" :show-if-above="false" :drawer-width="q.screen.width < 450 ? q.screen.width : 450"
    @drawerchange="(e) => (drawerRight = e)">
    <q-card flat style="height: 100%; width: 100%">
      <q-toolbar class="text-bold q-pt-sm q-px-lg" style="overflow: initial">
        <q-toolbar-title class="clip text-bold">Sites</q-toolbar-title>
        <q-space />

        <q-btn v-if="selected.length > 0" icon="o_delete_forever" flat label="Delete" style="min-width: 60px" dense color="red" padding="xs sm" no-caps stack @click="DeleteItems"><q-tooltip>Delete
            Selected</q-tooltip></q-btn>

        <q-btn icon="r_refresh" style="min-width: 60px" dense flat no-caps color="primary" stack :label="GetLocaleString(`REFRESH`, 'Refresh')" @click="GetMaster()">
          <q-tooltip>{{ GetLocaleString("REFRESH", "Refresh") }}</q-tooltip>
        </q-btn>

        <q-btn icon="o_calendar_month" style="min-width: 60px" dense flat no-caps color="primary" unelevated stack :label="GetLocaleString(`NEW`, 'New')" @click="AddNew" class="q-ml-sm">
          <q-tooltip>{{
    GetLocaleString("ADD_NEW_PERIOD", "Add new period")
  }}</q-tooltip>
        </q-btn>
      </q-toolbar>

      <EditSite ref="editPeriod" @update="GetMaster" />

      <q-card-section :class="`${mobileView ? 'q-pa-none' : 'q-pt-none'}`" style="height: calc(100% - 64px)">


        <q-table class="col-12 sticky-header sticky-row-header sticky-action-col" flat :columns="columns" :rows="items" row-key="SiteId" virtual-scroll v-model:pagination="pagination"
          :loading="loading" @request="GetMaster" :filter="pagination.search" selection="multiple" v-model:selected="selected" hide-pagination
          :rows-per-page-options="[10, 20, 50, 100, 500]" style="height: 100%; overflow-y: auto">
          <template v-slot:loading>
            <div class="absolute fit row justify-center items-center" style="background: rgba(0, 0, 0, 0.5); margin: 0px; z-index: 100">
              <q-spinner-ball size="md" color="white" style="margin-right: 16px" />
              <span style="color: white; letter-spacing: 0.2rem">Loading</span>
            </div>
          </template>         


          <!-- <template v-slot:header-cell-action="props">
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
          </template> -->

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
                  </q-item-section>
                </q-item>
              </q-list>
            </q-td>
          </template>

          <template v-slot:body-cell-Description="props">
            <q-td :props="props" :style="props.col.style ? { ...props.col.style } : null">
              {{ props.row.Description }}
            </q-td>
          </template>

          <!-- <template v-slot:body-cell-START_DATE="props">
            <q-td :props="props" :style="props.col.style ? { ...props.col.style } : null">
              {{ props.row.START_DATE }}
            </q-td>
          </template>

          <template v-slot:body-cell-END_DATE="props">
            <q-td :props="props" :style="props.col.style ? { ...props.col.style } : null">
              {{ props.row.END_DATE }}
            </q-td>
          </template> -->

          <template v-slot:body-cell-action="props">
            <q-td class="sticky-bg-color" :props="props" :style="props.col.style ? { ...props.col.style } : null">

              <q-btn icon="r_edit" unelevated dense round no-caps @click="EditItem(props.row)" class="q-mr-sm" size="sm">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body-cell="props">
            <q-td :props="props">
              {{ props.value }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </BoardLayout>
</template>

<style lang="scss">
.manage-targets {
  .q-item {
    &.q-item--active {
      background: #21ba45;
      color: black;
      font-weight: bold;
    }
  }

  .q-splitter__before {
    overflow: hidden;
  }

  .q-splitter__after {
    padding: 4px 4px 4px 16px;
  }
}
</style>

<script>
import { defineComponent, ref, watch, inject, onMounted, defineAsyncComponent } from "vue";
import general from "@/mixins/general";
import api from "@/api/site";
import server from "@/server";
import moment from "moment";
import { useRoute } from "vue-router";
import fileDownload from "js-file-download";
import { useHelper } from "@/composables/helper";
import { useQuasar } from "quasar"

export default defineComponent({
  name: "ManageSites",
  emits: ["edit", "addnew"],
  components: {
    EditSite: defineAsyncComponent(() => import("@/components/Admin/EditSite.vue")),
  },
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const route = useRoute();
    const q = useQuasar();
    const { NotifyUser, ParseName, ConfirmAction } = general();
    const { renderKey, UpRender } = useHelper();
    const loading = ref(false);
    const selected = ref([]);
    const pagination = ref({
      sortBy: "DESCRIPTION",
      descending: false,
      page: 1,
      rowsPerPage: 100,
      rowsNumber: 20,
      search: null,
      Year: 0
    });

    const editPeriod = ref(null);

    const filters = ref({});
    const visibleCols = ref([
      "Description",
      "action",
    ]);

    const columns = ref([
      {
        field: "SiteName",
        name: "SiteName",
        label: "Site Name",
        align: "left",
        sortable: true,
      },
      {
        field: "City",
        name: "City",
        label: "City",
        align: "left",
        sortable: true,
      },
      {
        field: "State",
        name: "State",
        label: "State",
        align: "left",
        sortable: true,
      },
      {
        field: "Country",
        name: "Country",
        label: "Country",
        align: "left",
        sortable: true,
      },
      {
        field: "Region",
        name: "Region",
        label: "Region",
        align: "left",
        sortable: true,
      },
      {
        field: "Active",
        name: "Active",
        label: "Active",
        align: "left",
        sortable: true,
      },
      {
        field: "InConsoSum",
        name: "InConsoSum",
        label: "Include in Consolidated Sum",
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

    const dialog = ref(false);

    watch(
      visibleCols,
      () => {
        window.localStorage.setItem(
          "_xmap_period_cols",
          JSON.stringify(visibleCols.value)
        );
      },
      { deep: true }
    );

    watch(
      pagination,
      () => {
        GetMaster();
      },
      { deep: true }
    );

    const GetMaster = (props) => {

      if (loading.value) return;

      loading.value = true;

      if (!props || props.which !== undefined) {
        props = {
          pagination: pagination.value,
          filter: undefined,
        };
      }

      const { page, rowsPerPage, sortBy, descending } = props.pagination;


      selected.value = [];

      api
        .GetAll(props.pagination)
        .then((r) => {
          items.value = [...r.data.payload.data];
          loading.value = false;

          pagination.value.page = page;
          pagination.value.rowsPerPage = rowsPerPage;
          pagination.value.sortBy = sortBy;
          pagination.value.descending = descending;
          pagination.value.rowsNumber = r.data.payload.total;

          filters.value = r.data.payload.filters;

          UpRender();
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const ExportToFile = () => {
      NotifyUser({ success: true, message: "Preparing file..." });
      api.UserExport(pagination.value).then((response) => {
        fileDownload(response.data, "XMAP_Users.xlsx");
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
      dialog.value = true;
      setTimeout(() => {
        editPeriod.value.Edit(row);
      }, 800);
    };

    const DeleteItems = () => {
      ConfirmAction(
        "Are you sure you want to proceed with delete action?",
        () => {
          var x = [];
          selected.value.map((e) => x.push(e.SiteId));
          loading.value = true;
          api
            .Delete(x)
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
        editPeriod.value.AddNew();
      }, 800);
    }

    watch(route, (newVal) => {
      console.warn("watch route", newVal, newVal.query);
    }, { deep: true });

    onMounted(() => {
      pagination.value.Year = new Date().getFullYear();

      var cols = window.localStorage.getItem("_xmap_period_cols");

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
      q,
      dialog,
      selected,
      GetLocaleString,
      pagination,
      visibleCols,
      columns,
      items,
      loading,
      renderKey,
      ApproveAccess,
      GetMaster,
      EditItem,
      ParseName,
      server,
      moment,
      ExportToFile,
      DeleteItems,
      AddNew,
      ctx,
      filters,
      editPeriod
    };
  },
});
</script>
