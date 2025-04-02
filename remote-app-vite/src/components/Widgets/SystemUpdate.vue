<template>
    <QCard class="update-logs">
        <QToolbar>
            <QToolbarTitle class="q-pl-md text-bold" style="padding-left: 16px;">Update Logs</QToolbarTitle>
            <!-- <QInput v-model="pagination.search" filled dense class="toolbar-input" style="height: 30px" placeholder="Search ..." clearable :disable="loading" :debounce="800">
            </QInput> -->

            <QBadge rounded :color="HubConnected ? 'green' : 'red'" class="q-mr-sm" style="width: 18px; height: 18px;">
              <QTooltip>{{ `${(HubConnected ? 'Online' : 'Offline')}` }}</QTooltip>
            </QBadge>

            <QBtn v-if="!collapseMenu && !loading && !mobileView" round flat icon="r_refresh" size="md" @click="GetMaster" no-caps stack>
                <QTooltip>Refresh</QTooltip>
            </QBtn>

            <QBtn flat round icon="o_upload_file" no-caps stack
                @click="CheckUploadAction" />

            <QBtn flat round icon="o_download" no-caps stack @click="Download" />

            <input v-if="!fileReset" type="file" name="fields[assetsFieldHandle][]" id="assetsFieldHandle" class="w-px h-px opacity-0 overflow-hidden absolute" @change="Upload" ref="file"
                accept="application/zip,application/x-zip-compressed" style="width: 1px; height: 1px" />

        </QToolbar>
        <QToolbar>
          <QList>
            <QItem>
              <QItemSection>
                <QItemLabel v-if="apiVer.Build || apiVer.Version">API version {{ `${apiVer.Build || apiVer.Version}` }}</QItemLabel>
                <QItemLabel>UI version {{ appVer }}</QItemLabel>
              </QItemSection>
            </QItem>
          </QList>
        </QToolbar>
        <QCardSection :class="`q-py-none ${(mobileView ? 'q-px-none' : '')}`" style="height: calc(100% - 120px)">
        <q-table flat :class="`app-data-grid sticky-header sticky-row-header sticky-action-col ${(mobileView ? 'dense-pagination' : '')}`" :columns="columns" :rows="items" row-key="ID"
          v-model:pagination="pagination" :filter="pagination.search" @request="GetMaster" virtual-scroll :grid="true" style="height: 100%">

          <template v-slot:header="props">
            <q-tr :props="props">
              <template v-for="col in props.cols" :key="col.name">
                <q-th v-if="col.field !== 'Action'" class="text-left" :style="col.style !== undefined ? col.style : ''">
                  {{ GetLocaleString(col.langkey, col.label) }}
                </q-th>
                <q-th v-else> </q-th>
              </template>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div>{{ GetLocaleString("NO_DATA", "No records available") }}</div>
          </template>

          <template v-slot:item="props">
            <QCard class="grid-item q-mb-sm" style="width: 100%; margin-top: 2px;" clickable>
              <QCardSection class="q-pa-none" style="cursor: pointer">
                <div :class="{
    'QItem row q-pa-md QItem--clickable': true,
    'no-wrap': false,
  }">
                  <!-- <QItemSection avatar top style="justify-content: inherit; align-items: center">
                    <ProfileAvatar :text1="props.row.PackageName" listmode :selected="props.row.isSelected" />
                  </QItemSection> -->

                  <QItemSection class="row wrap q-pm-md" style="justify-content: flex-start">
                    <QItemLabel :class="`text-bold`">{{ props.row.PackageName }}</QItemLabel>
                    <QItemLabel caption style="color: inherit">Prior version: {{ props.row.PriorVersion }}</QItemLabel>
                    <QItemLabel caption style="color: inherit">Processed by {{ props.row.UserName }}</QItemLabel>
                    <QItemLabel caption style="color: inherit">Updated on {{ props.row.Timestamp }}</QItemLabel>
                    
                  </QItemSection>

                  <!-- <QItemSection side top>
                    <QBtn v-if="IsMenuOK('ADM_UPD_EDIT')" flat round icon="o_edit" @click="EditItem(props.row)" color="grey" size="sm" />
                  </QItemSection> -->
                </div>
              </QCardSection>
            </QCard>
          </template>

          <template v-slot:body-cell="props">
            <q-td v-if="props.col.field === 'Action'" class="sticky-bg-color" :props="props" :style="props.col.style ? { ...props.col.style } : null">
              <QBtn v-if="IsMenuOK('ADM_UPD_EDIT')" flat round icon="o_edit" @click="EditItem(props.row)" color="grey" size="sm" />
            </q-td>
            <q-td v-else-if="props.col.field === 'PackageName'" :props="props">
              <div class="QItem q-pa-none row no-wrap">
                <!-- <QItemSection avatar>
                  <ProfileAvatar :text1="props.row.PackageName" listmode :selected="props.row.isSelected" />
                </QItemSection> -->
                <QItemSection class="text-left" style="font-size: 0.8rem">
                  <div class="text-bold" style="font-size: 1em;">{{ props.row.PackageName }}</div>
                  <QItemLabel caption style="color: inherit">{{ props.row.UserName }}</QItemLabel>
                  <QItemLabel caption style="color: inherit">{{ props.row.Timestamp }}</QItemLabel>
                </QItemSection>
              </div>
            </q-td>
            <q-td v-else :props="props" style="text-align: left">
              {{ formatValue(props.value, props.col) }}
            </q-td>
          </template>
        </q-table>
      </QCardSection>
    </QCard>
</template>

<style lang="scss">
.update-logs{

  height: 400px;

  .q-table__grid-content{
    overflow-y: auto;
  }
}
</style>

<script>
import {
  onMounted,
  inject,
  ref,
  onBeforeUnmount,
  computed,
  watch
} from "vue";
import general from "../../mixins/general";
import api from "../../api/update";
import { useUser } from "../../store/user";
import apiIndex from "../api/index"

export default {
  name: "SystemUpdate",
  components: {

  },
  setup() {
    const user = useUser();
    const HubConnected = inject("HubConnected");
    const {
      formatValue,
      NotifyUser,
      hasSelectedItem,
      ConfirmDelete,
      base64ToArrayBuffer,
      saveByteArray,
      ConfirmAction
    } = general();
    const loading = ref(false);
    const drawer = ref(false);
    const editDialog = ref(false);
    const editMode = ref(true);
    const localWorkCenter = ref(null);

    const maxPage = ref(1);
    const pagination = ref({
      search: null,
      productStatus: 1,
      site: null,
      page: 1,
      rowsPerPage: 20,
      sortField: null,
      sortDir: "desc",
    });
    const columns = ref([
      {
        field: "PackageName",
        langkey: "UPDATE_PACKAGE",
        label: "Package",
        canFilter: true,
        sortable: true,
      },
      {
        field: "PriorVersion",
        label: "Version Prior Update",
        sortable: false,
        langkey: "VER_PRIOR_UPDATE",
      },
      // {
      //   field: "Notes",
      //   label: "Notes",
      //   sortable: false,
      //   langkey: "NOTES",
      // },
      // {
      //   field: "Action",
      //   langkey: "ACTION",
      //   label: "",
      //   sortable: false,
      //   style: { padding: "8px" },
      // },
    ]);

    const item = ref({
      ActionType: 2,
      StatusMode: 1,
      RunDate: null,
      RunTime: null,
      Remarks: null,
    });
    const items = ref([]);

    const file = ref(null);
    const filelist = ref([]);
    const fileReset = ref(false);

    const apiVer = ref({
      Build: null,
      Version: null,
      Copyright: null,
    });

    const hasMultiSelect = computed(() => hasSelectedItem(items.value));
    const appVer = computed(() => process.env.VUE_APP_GIT_HASH);
    const GetLocaleString = inject("GetLocaleString");
    const mobileView = inject("mobileView");

    watch(
      () => pagination.value,
      () => {
        GetMaster();
      },
      { deep: true }
    );

    const GetMaster = (_props) => {
      if (!_props || _props.which !== undefined) {
        _props = {
          pagination: pagination.value,
          filter: undefined,
        };
      }

      const { page, rowsPerPage, sortBy, descending } = _props.pagination;

      loading.value = true;
      api
        .GetAll(pagination.value)
        .then((response) => {
          loading.value = false;
          if (response.data.success) {
            items.value = [...response.data.payload.data];

            pagination.value.page = page;
            pagination.value.rowsPerPage = rowsPerPage;
            pagination.value.sortBy = sortBy;
            pagination.value.descending = descending;
            pagination.value.rowsNumber = response.data.payload.total;
          }
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const SaveItem = () => {
      loading.value = true;
      api
        .Save(item.value, user.ActiveUser.EmployeeID)
        .then((response) => {
          loading.value = false;
          if (response.data.success) {
            editDialog.value = false;
            GetMaster();
          }
          NotifyUser(response.data);
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const AddNew = () => {
      editMode.value = false;
      editDialog.value = true;
      item.value.Machine = null;
      item.value.ProcessWorkCenter = null;
      item.value.ID = 0;
      item.value.ProductLineID = 0;
    };

    const EditItem = (data) => {
      editMode.value = true;
      item.value = { ...data };
      editDialog.value = true;
    };

    const DeleteItems = () => {
      var x = [];
      items.value.forEach((element) => {
        if (element.isSelected) x.push(element.Id);
      });

      ConfirmDelete(x, () => {
        loading.value = true;
        api
          .Delete(x, user.ActiveUser.EmployeeID)
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

    const Download = () => {
      api
        .GetAll(pagination.value, true)
        .then((response) => {
          if (response.data.success) {
            var byteArr = base64ToArrayBuffer(response.data.payload);
            saveByteArray("UpdateLogs.xlsx", byteArr);
          }
        })
        .catch(() => {
          loading.value = false;
        });
    }

    const CheckUploadAction = () => {
      ConfirmAction("WARNING: Make sure that there's a proper authorization before rolling out an update. You cannot undo this action. Are you sure you want to proceed?", () => {
        file.value.click();
      });

    }

    const Upload = () => {
      filelist.value = [...file.value.files];
      let formData = new FormData();
      formData.append("file", filelist.value[0]);
      NotifyUser({ message: "Processing file...", success: true });

      fileReset.value = true;

      api.Upload(formData, user.ActiveUser.EmployeeID).then((response) => {
        NotifyUser(response.data);

        if (response.data.success) {
          GetMaster();
        }

        setTimeout(() => {
          fileReset.value = false;
        }, 800);
      });
    }

    const GetApiVersion = () => {
      apiIndex.GetApiVersion().then((response) => {
        apiVer.value = { ...response.data };
      });
    };

    onMounted(() => {
      GetMaster();
      GetApiVersion();
    });

    onBeforeUnmount(() => {
      //
    });

    return {
      apiVer,
      appVer,
      editMode,
      user,
      mobileView,
      item,
      editDialog,
      pagination,
      maxPage,
      columns,
      items,
      file,
      filelist,
      fileReset,

      hasMultiSelect,
      formatValue,
      GetLocaleString,
      loading,
      drawer,
      GetMaster,
      SaveItem,
      AddNew,
      EditItem,
      DeleteItems,
      Download,
      Upload,
      CheckUploadAction,
      HubConnected,
      localWorkCenter,
    };
  },
};
</script>

