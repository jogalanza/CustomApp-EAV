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
        <q-select
          label="Year"
          dense
          filled
          v-model="selectYear"
          :options="options.FiscalYears"
        />
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
          class="q-mr-sm"
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
          class="q-mr-sm"
        >
          <q-tooltip>{{ GetLocaleString("REFRESH", "Refresh") }}</q-tooltip>
        </q-btn>
        <q-btn
          icon="o_timer"
          dense
          flat
          no-caps
          color="primary"
          :label="GetLocaleString(`SNAPSHOT_TIME`, 'Snapshot Time')"
          @click="snapshotTime.Show()"
          class="q-mr-sm"
        >
          <q-tooltip>{{
            GetLocaleString("SET_SNAPSHOT_TIME", "Set Snapshot Time")
          }}</q-tooltip>
        </q-btn>
        <q-btn
          icon="o_contact_mail"
          dense
          flat
          no-caps
          color="primary"
          :label="GetLocaleString(`NOTIFICATIONS`, 'Notifications')"
          @click="ctx.emit('editusers')"
        >
          <q-tooltip>{{
            GetLocaleString("NOTIF_RECIPIENTS", "Notification Recipients")
          }}</q-tooltip>
        </q-btn>
      </q-toolbar>

      <SnapshotTime ref="snapshotTime" />

      <q-dialog v-model="dialogOverride">
        <q-card style="min-width: 100px">
          <q-card-section>
            <q-list>
              <q-item class="q-pt-none">
                <q-item-section>
                  <q-item-label class="text-h5 text-bold"
                    >Override Snapshot Date</q-item-label
                  >
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-date v-model="overrideDate.ClosingDate" flat />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-input v-model="overrideDate.Notes" label="Notes" />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-btn
                    label="Set New Date"
                    no-caps
                    dense
                    color="primary"
                    @click="OverrideDefaultSave"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-dialog>
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

    <template v-slot:body-cell-PreviousMonth="props">
      <q-td
        :props="props"
        :style="props.col.style ? { ...props.col.style } : null"
      >
        <q-list style="margin-left: -16px">
          <q-item>
            <!-- <q-item-section avatar top>
              <q-avatar :color="props.row.Locked ? 'red' : 'green'">
                <q-icon
                  v-if="props.row.Locked"
                  name="o_lock"
                  size="24px"
                  color="white"
                />
                <q-icon v-else name="o_lock_open" size="24px" color="white" />
              </q-avatar>
            </q-item-section> -->
            <q-item-section>
              <q-item-label class="text-bold">{{
                props.row.PreviousMonth
              }}</q-item-label>
              <q-item-label class="row no-wrap">
                <q-chip
                  class="status-chip"
                  dense
                  :color="props.row.Locked ? 'red' : 'green'"
                  text-color="white"
                  :label="props.row.Locked ? 'Locked' : 'Open'"
                  :icon="props.row.Locked ? 'o_lock' : 'o_lock_open'" />
                <q-chip
                  v-if="props.row.WithSnapshot"
                  class="status-chip"
                  dense
                  color="primary"
                  text-color="white"
                  label="With Snapshot"
                  icon="o_check_circle"
              /></q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-td>
    </template>
    <template v-slot:body-cell-PrevMonthClosing="props">
      <q-td
        :props="props"
        :style="props.col.style ? { ...props.col.style } : null"
      >
        {{ moment(props.row.PrevMonthClosing).format("DD-MMM-YYYY") }}
      </q-td>
    </template>
    <template v-slot:body-cell-Status="props">
      <q-td
        :props="props"
        :style="props.col.style ? { ...props.col.style } : null"
      >
        <div class="row no-wrap">
          <q-chip
            dense
            :color="props.row.Locked ? 'red' : 'green'"
            text-color="white"
            :label="props.row.Locked ? 'LOCKED' : 'OPEN'"
            :icon="props.row.Locked ? 'o_lock' : 'o_check_circle'"
          />
          <q-chip
            v-if="props.row.WithSnapshot"
            dense
            color="primary"
            text-color="white"
            label="With Snapshot"
            icon="o_check_circle"
          />
        </div>
      </q-td>
    </template>

    <template v-slot:body-cell-action="props">
      <q-td
        class="sticky-bg-color"
        :props="props"
        :style="props.col.style ? { ...props.col.style } : null"
      >
        <q-btn
          v-if="!props.row.Locked && props.row.CloseID > 0"
          icon="o_undo"
          unelevated
          dense
          no-caps
          @click="RevertDefault(props.row)"
          class="q-mr-sm"
          round
        >
          <q-tooltip>Set To Default Snapshot Date</q-tooltip>
        </q-btn>
        <q-btn
          v-if="!props.row.Locked"
          icon="o_edit_calendar"
          unelevated
          dense
          no-caps
          @click="OverrideDefault(props.row)"
          class="q-mr-sm"
          round
        >
          <q-tooltip>Override Snapshot Date</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>
</template>

<style lang="scss">
.status-chip {
  .q-chip__content {
    font-size: 0.95em;
  }
}
</style>

<script>
import {
  defineComponent,
  ref,
  watch,
  inject,
  onMounted,
  defineAsyncComponent,
} from "vue";
import general from "@/mixins/general";
import api from "@/api/index";
import server from "@/server";
import moment from "moment";
import { useOptions } from "@/store/options";
import { useUser } from "../../store/user";

export default defineComponent({
  name: "SnapshotData",
  components: {
    SnapshotTime: defineAsyncComponent(() =>
      import("@/components/General/SnapshotTime.vue")
    ),
  },
  emits: ["edit", "addnew", "editusers"],
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const options = useOptions();
    const user = useUser();
    const { ParseName, NotifyUser, ConfirmAction } = general();
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
      "PreviousMonth",
      "PrevMonthClosing",
      "Notes",
      "action",
    ]);
    const selectYear = ref(0);
    const snapshotTime = ref(null);
    const overrideDate = ref({
      ClosingDate: null,
      Notes: null,
    });
    const dialogOverride = ref(false);
    const activePeriod = ref({});

    const columns = ref([
      {
        field: "PreviousMonth",
        name: "PreviousMonth",
        label: "Month",
        align: "left",
      },
      {
        field: "PrevMonthClosing",
        name: "PrevMonthClosing",
        label: "Last Day Edit",
        align: "left",
      },
      // {
      //   field: "Status",
      //   name: "Status",
      //   label: "Status",
      //   align: "left",
      // },
      {
        field: "Notes",
        name: "Notes",
        label: "Notes",
        align: "left",
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
          "_xmap_snapshotdata_cols",
          JSON.stringify(visibleCols.value)
        );
      },
      { deep: true }
    );

    watch(selectYear, () => {
      GetMaster();
    });

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
        .SnapshotPeriodGetAll(selectYear.value)
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

    const EditItem = (row) => {
      ctx.emit("edit", row);
    };

    const OverrideDefault = (_info) => {
      activePeriod.value = { ..._info };
      overrideDate.value.ClosingDate = moment(_info.PrevMonthClosing).format(
        "yyyy/MM/DD"
      );
      overrideDate.value.Notes = null;
      dialogOverride.value = true;
    };

    const OverrideDefaultSave = () => {
      var payload = {
        PeriodInfo: { ...activePeriod.value },
        ClosingInfo: {
          ClosingDate: overrideDate.value.ClosingDate,
          Notes: overrideDate.value.Notes,
          UserId: user.ActiveUser.ID !== undefined ? user.ActiveUser.ID : 0,
        },
      };
      api.SnapshotPeriodOverride(payload).then((response) => {
        NotifyUser(response.data);
        if (response.data.success) {
          GetMaster();
          dialogOverride.value = false;
        }
      });
    };

    const RevertDefault = (_info) => {
      ConfirmAction(
        `Are you sure you want to revert to default date ${moment(
          _info.DefaultCloseDate
        ).format("DD-MMM-yyyy")}?`,
        () => {
          api.SnapshotPeriodRevert(_info).then((response) => {
            NotifyUser(response.data);
            if (response.data.success) {
              GetMaster();
            }
          });
        }
      );
    };

    onMounted(() => {
      selectYear.value = new Date().getFullYear();
      var cols = window.localStorage.getItem("_xmap_snapshotdata_cols");

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
      GetMaster,
      EditItem,
      ParseName,
      server,
      moment,
      selectYear,
      options,
      snapshotTime,
      overrideDate,
      dialogOverride,
      OverrideDefault,
      OverrideDefaultSave,
      RevertDefault,
    };
  },
});
</script>