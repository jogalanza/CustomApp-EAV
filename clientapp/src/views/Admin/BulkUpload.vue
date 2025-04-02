<template>
  <BoardLayout class="manage-targets" :loading="loading" :drawer="drawerRight" :breakpoint="20000" :show-if-above="false" :drawer-width="q.screen.width < 450 ? q.screen.width : 450"
    @drawerchange="(e) => (drawerRight = e)">
    <q-card flat style="height: 100%; width: 100%">
      <q-toolbar class="text-bold q-pt-sm q-px-lg" style="overflow: initial">
        <q-toolbar-title class="clip text-bold">Upload</q-toolbar-title>
        <q-space />

        <!-- <q-btn icon="r_refresh" style="min-width: 60px" dense flat no-caps color="primary" stack :label="GetLocaleString(`REFRESH`, 'Refresh')" @click="GetMaster()">
          <q-tooltip>{{ GetLocaleString("REFRESH", "Refresh") }}</q-tooltip>
        </q-btn> -->

        <q-btn split icon="o_download" style="min-width: 60px" dense flat no-caps color="primary" stack :label="GetLocaleString(`DOWNLOD`, 'Download')" @click="DownloadTemplate2">
          <q-tooltip>{{ GetLocaleString("DOWNLOAD_TEMPLATE", "Donwload template") }}</q-tooltip>
          <!-- <q-list>
            <q-item clickable v-close-popup @click="DownloadTemplate2">
              <q-item-section>
                <q-item-label>Dynamic template (Beta)</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="info" color="amber" />
              </q-item-section>
            </q-item>
          </q-list> -->
        </q-btn>

        <q-btn split icon="o_upload_file" style="min-width: 60px" dense flat no-caps color="primary" unelevated stack :label="GetLocaleString(`UPLOAD`, 'Upload')" @click="qfile2.pickFiles()"
          class="q-ml-sm">
          <q-tooltip>{{
            GetLocaleString("UPLOAD_BULK", "Upload bulk template")
          }}</q-tooltip>
          <!-- <q-list>
            <q-item clickable v-close-popup @click="qfile2.pickFiles()">
              <q-item-section>
                <q-item-label>Upload V2 (Beta)</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="info" color="amber" />
              </q-item-section>
            </q-item>
          </q-list> -->
        </q-btn>
        <q-file v-model="file" ref="qfile" label="Pick one file" filled style="display: none;" dense />
        <q-file v-model="file2" ref="qfile2" label="Pick one file" filled style="display: none;" dense />
      </q-toolbar>

      <q-card-section :class="`${mobileView ? 'q-pa-none' : 'q-pt-none'}`" style="height: calc(100% - 64px)">
        <q-card class="q-mx-auto" style="height: 100%;; max-width: 720px;">
          <q-card-section style="height: 100%; ">
            <q-virtual-scroll ref="vscroll" :items="items" separator :style="`height: calc(100% - 0px)`">
              <template v-slot:default="{ item, index }">
                <q-item :key="index" class="q-my-sm q-mx-none" dense style="background: transparent">
                  <q-item-section avatar top>
                    <q-avatar size="42px" style="background: transparent;">
                      <q-icon :name="item.success ? 'o_check_circle' : 'o_error'" :color="item.success ? 'green' : 'red'" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="item.message"></q-item-label>
                    <q-item-label caption v-html="item.timestamp"></q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-virtual-scroll>
          </q-card-section>
        </q-card>

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
import { defineComponent, ref, watch, inject, onMounted, onBeforeUnmount } from "vue";
import general from "@/mixins/general";
import api from "@/api/import";
import server from "@/server";
import moment from "moment";
import { useRoute } from "vue-router";
import fileDownload from "js-file-download";
import { useHelper } from "@/composables/helper";
import { useQuasar } from "quasar"

export default defineComponent({
  name: "BulkUpload",
  emits: ["edit", "addnew"],
  components: {

  },
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const eventBus = inject("eventBus");
    const route = useRoute();
    const q = useQuasar();
    const { NotifyUser, ParseName } = general();
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

    const file = ref(null);
    const qfile = ref(null);
    const file2 = ref(null);
    const qfile2 = ref(null);

    const editPeriod = ref(null);

    const filters = ref({});
    const visibleCols = ref([
      "DESCRIPTION",
      "START_DATE",
      "END_DATE",
      "action",
    ]);

    const columns = ref([
      {
        field: "DESCRIPTION",
        name: "DESCRIPTION",
        label: "Period",
        align: "left",
        sortable: true,
      },
      {
        field: "START_DATE",
        name: "START_DATE",
        label: "Start Date",
        align: "left",
        sortable: true,
      },
      {
        field: "END_DATE",
        name: "END_DATE",
        label: "Start Date",
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

    watch(file, (newVal) => {
      if (newVal) {
        SubmitFile();
      }
    });

    watch(file2, (newVal) => {
      if (newVal) {
        SubmitFileV2();
      }
    });

    const SubmitFile = () => {
      try {
        items.value = [];

        items.value.push({
          success: true,
          message: "Preparing file for upload...",
          timestamp: moment().format("YYYY-MM-DD HH:mm:ss")
        });

        let formData = new FormData()
        formData.append('file', file.value)

        loading.value = true;

        file.value = null;

        api.Upload(formData)
          .then((response) => {
            file.value = null;
            NotifyUser(response.data);
          })
          .catch((err) => {
            console.warn(err)
            var s = `<b>ERROR:</b><br/>1. Possible network issue <br/>2. File for upload was changed. Please clear and re-select file.`
            file.value = null;
            NotifyUser({ success: false, message: s })
          })
          .finally(() => {
            loading.value = false;
          })
      } catch (err) {
        console.log('catch', err)
      }
    }

    const SubmitFileV2 = () => {
      try {
        items.value = [];

        items.value.push({
          success: true,
          message: "Preparing file for upload...",
          timestamp: moment().format("YYYY-MM-DD HH:mm:ss")
        });

        let formData = new FormData()
        formData.append('file', file2.value)

        loading.value = true;

        file2.value = null;

        api.UploadV2(formData)
          .then((response) => {
            file2.value = null;
            NotifyUser(response.data);
          })
          .catch((err) => {
            console.warn(err)
            var s = `<b>ERROR:</b><br/>1. Possible network issue <br/>2. File for upload was changed. Please clear and re-select file.`
            file2.value = null;
            NotifyUser({ success: false, message: s })
          })
          .finally(() => {
            loading.value = false;
          })
      } catch (err) {
        console.log('catch', err)
      }
    }

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

    watch(route, (newVal) => {
      console.warn("watch route", newVal, newVal.query);
    }, { deep: true });

    const HandleBulkUploadEvent = (data) => {
      var x = JSON.parse(data);
      if (x) {
        x.timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
        items.value.push(x);
      }
    }

    const getItems = (from, size) => {
      const d = [];
      for (let i = 0; i < size; i++) {
        d.push(items.value[from + i]);
      }
      return Object.freeze(d);
    };

    const DownloadTemplate = () => {
      window.open(`${server.defaults.baseURL}/template/bulk_template.xlsx?t=${(new Date().getUTCMilliseconds())}`, "_blank")
    };

    const DownloadTemplate2 = () => {
      api.DownloadTemplate();
    };

    onMounted(() => {
      eventBus.$on("bulk-upload", HandleBulkUploadEvent);
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

      var x = {
        success: true,
        message: "To get started, select a bulk template file to upload by clicking the <b>Upload</b> button. The bulk template file is also available for download by clicking the <b>Download</b> button.",
        timestamp: moment().format("YYYY-MM-DD HH:mm:ss")
      }
      items.value.push(x);
    });

    onBeforeUnmount(() => {
      eventBus.$off("bulk-upload", HandleBulkUploadEvent);
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
      GetMaster,
      ParseName,
      server,
      moment,
      ExportToFile,
      ctx,
      filters,
      editPeriod,
      file,
      file2,
      qfile,
      qfile2,
      getItems,
      DownloadTemplate,
      DownloadTemplate2,
      SubmitFileV2
    };
  },
});
</script>
