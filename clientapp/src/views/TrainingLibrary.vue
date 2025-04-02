<template>
  <BoardLayout class="training-library" :loading="loading" :drawer="drawerRight" :breakpoint="20000" :show-if-above="false" :drawer-width="q.screen.width < 450 ? q.screen.width : 450"
    @drawerchange="(e) => (drawerRight = e)">
    <q-card flat style="height: 100%; width: 100%">
      <q-toolbar class="text-bold q-pt-sm q-px-lg" style="overflow: initial">
        <q-toolbar-title class="clip text-bold">Training</q-toolbar-title>
        <q-space />

        <q-btn v-if="selected.length > 0" icon="o_delete_forever" flat label="Delete" style="min-width: 60px" dense color="red" padding="xs sm" no-caps stack @click="DeleteItem"><q-tooltip>Delete
            Selected</q-tooltip></q-btn>

        <q-btn icon="r_refresh" style="min-width: 60px" dense flat no-caps color="primary" stack :label="GetLocaleString(`REFRESH`, 'Refresh')" @click="GetMaster()">
          <q-tooltip>{{ GetLocaleString("REFRESH", "Refresh") }}</q-tooltip>
        </q-btn>

        <q-btn v-if="[1].indexOf(user.ActiveUser.RoleId) > -1" icon="o_publish" style="min-width: 60px" dense flat no-caps color="primary" unelevated stack
          :label="GetLocaleString(`PUBLISH`, 'Publish')" @click="AddNew" class="q-ml-sm">
          <q-tooltip>{{
            GetLocaleString("PUBLISH_TRAINNIG_DOC", "Publish Training Document")
          }}</q-tooltip>
        </q-btn>
      </q-toolbar>

      <EditTraining ref="editor" @update="GetMaster" />

      <q-card-section v-if="items.length > 0" :class="`row justify-center ${mobileView ? 'q-pa-none' : 'q-pt-none'}`" style="height: calc(100% - 64px); overflow: auto;">
        <div class="col-12 col-sm-11 col-md-10 row">
          <div v-for="(j, i) in items" :key="i" class="col-12 col-sm-6 col-md-4 q-pa-sm">
            <q-card class="training-card full-width" clickable style="min-height: 364px;" @click.stop="LoadDocument(j)">
              <q-card-section class="q-pa-none" style="height: 300px;">
                <q-img v-if="j.BannerImageID" :src="server.defaults.baseURL + 'api/file/get/image/' + j.BannerImageID" style="height: 300px" />
                <q-img v-else :src="require('@/assets/pdf-banner.png')" alt="PDF Document" style="height: 300px" />
                <q-list style="position: absolute; bottom: 0px; left: 0px; right: 0px; background: rgba(255, 255, 255, 0.9)" >
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-bold text-two-lines">{{ j.Title }}
                        <q-tooltip max-width="400px">{{ j.Title }}</q-tooltip>
                      </q-item-label>
                      <q-item-label v-if="j.Description" caption class="text-two-lines">{{ j.Description }}
                        <q-tooltip max-width="400px">{{ j.Description }}</q-tooltip>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn label="View" no-caps color="primary" unelevated @click.stop="LoadDocument(j)" />
                    </q-item-section>
                  </q-item>
                  <q-separator />
                </q-list>
              </q-card-section>
              <q-card-section class="q-py-sm">
                <q-list>
                  <q-item class="q-px-none">
                    <q-item-section avatar>
                      <q-icon name="o_account_circle" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>{{ j.PublishedBy }}</q-item-label>
                      <q-item-label caption>{{ moment(j.DatePublished) }}</q-item-label>
                    </q-item-section>
                    <q-item-section v-if="[1].indexOf(user.ActiveUser.RoleId) > -1" side style="flex-direction: row;">
                      <q-btn icon="o_edit" flat size="sm" round @click.stop="EditItem(j)" />
                      <q-btn icon="o_delete" flat size="sm" round @click.stop="DeleteItem(j)" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </div>

      </q-card-section>
      <q-card-section v-else class="text-center q-py-lg">
        <q-list class="q-mx-auto" style="max-width: 450px;">
          <q-item>
            <q-item-section avatar>
              <q-icon name="o_info" size="3em" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>No training documents have been published yet. Please check back later or contact support for assistance.</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-dialog v-model="trainingDialog" persistent>   
    <q-card style="height: 95vh; width: 95vw; max-width: 100vw">
      <q-toolbar>
        <q-toolbar-title>{{ activeTraining.Title }}</q-toolbar-title>
        <q-space />
        <q-btn flat round icon="r_close" size="sm" @click="trainingDialog = false" />
      </q-toolbar>
      <q-card-section class="q-pa-none" style="height: calc(100% - 50px); overflow: hidden;">
        <iframe :src="trainingDoc" style="width: 100%; height: 100%;" seamless></iframe>
      </q-card-section>
    </q-card>         
      
      
    </q-dialog>
  </BoardLayout>
</template>

<style lang="scss">
.training-library {
  .q-item {
    &.q-item--active {
      background: #21ba45;
      color: black;
      font-weight: bold;
    }
  }

  .training-card{
    &:hover{
      box-shadow: 0 0 16px rgba(0, 0, 0, 0.4);
      cursor: pointer;
    }
  }

  .q-splitter__before {
    overflow: hidden;
  }

  .q-splitter__after {
    padding: 4px 4px 4px 16px;
  }

  .text-two-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /* Limit to two lines */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5em;
    /* Adjust based on your design */
    max-height: 3em;
    /* 2 lines * line-height */
  }
}
</style>

<script>
import { defineComponent, ref, watch, inject, onMounted, defineAsyncComponent } from "vue";
import general from "@/mixins/general";
import api from "@/api/training";
import server from "@/server";
import moment from "moment";
import { useRoute } from "vue-router";
import fileDownload from "js-file-download";
import { useHelper } from "@/composables/helper";
import { useQuasar } from "quasar"
import { useUser } from "../store/user";

export default defineComponent({
  name: "ManageSites",
  emits: ["edit", "addnew"],
  components: {
    EditTraining: defineAsyncComponent(() => import("@/components/Admin/EditTraining.vue")),
  },
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const route = useRoute();
    const q = useQuasar();
    const user = useUser();
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
    const trainingDoc = ref(null);
    const trainingDialog = ref(false);

    const editor = ref(null);

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
        name: "action",
        field: "Action",
        langkey: "ACTION",
        label: "",
        sortable: false,
        style: { padding: "8px" },
      },
    ]);

    const items = ref([]);
    const activeTraining = ref({});

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


      selected.value = [];

      api
        .GetAll(props.pagination)
        .then((r) => {
          items.value = [...r.data];
          loading.value = false;

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
        editor.value.Edit(row);
      }, 800);
    };

    const LoadDocument = (data) => {
      activeTraining.value = {...data};
      trainingDoc.value = server.defaults.baseURL + "api/file/get/file/" + data.FileID;
      //window.open(server.defaults.baseURL + "/api/file/get/file/" + data.FileID, "_blank");
      trainingDialog.value = true;
    }

    const DeleteItem = (data) => {
      ConfirmAction(
        "Are you sure you want to remove this training document? You cannot undo this action.",
        () => {

          loading.value = true;
          api
            .Delete(data)
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
        editor.value.AddNew();
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
      user,
      ApproveAccess,
      GetMaster,
      EditItem,
      ParseName,
      server,
      moment,
      ExportToFile,
      DeleteItem,
      AddNew,
      LoadDocument,
      ctx,
      filters,
      editor,
      trainingDoc,
      trainingDialog,
      activeTraining
    };
  },
});
</script>
