<template>
  <q-table
    class="nested-grid"
    :rows="items"
    :columns="calcColumns"
    :row-key="calcRowKey"
    :rows-per-page-options="[0]"
    :hide-pagination="true"
    :hide-header="calcHideNestedHeader && level > 1"
    :override-options="overrideopts"
    :loading="loading"
    :hide-bottom="items.length > 0"
  >
    <!--  :props="props"
    virtual-scroll
    :virtual-scroll-item-size="48" -->

    <template v-slot:loading>
      <div
        class="absolute fit row justify-center items-center"
        style="background: rgba(0, 0, 0, 0.5); margin: 0px; z-index: 100"
      >
        <q-spinner-ball size="md" color="white" style="margin-right: 16px" />
        <span style="color: white; letter-spacing: 0.3rem">Loading</span>
      </div>
    </template>

    <template v-slot:header="props">
      <q-tr :props="props">
        <!-- <q-th style="width: 48px" /> -->
        <q-th
          v-for="col in props.cols"
          :key="col.name"
          :style="{ 'text-align': 'left', ...col.headStyle }"
        >
          <div
            :style="{
              'padding-left':
                col.name === calcExpandId
                  ? `${
                      (level - 1) * 20 -
                      (props.row !== undefined && props.row[urlKey] ? 0 : 16)
                    }px`
                  : '0px',
            }"
          >
            {{ col.label }}
          </div>
        </q-th>
      </q-tr>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <!-- <q-td style="width: 48px">
          <q-btn
            size="sm"
            color="accent"
            round
            dense
            @click="ExpandRow(props)"
            :icon="props.expand ? 'remove' : 'add'"
          />
        </q-td> -->
        <q-td
          v-for="(col, i) in props.cols"
          :key="col.name"
          :style="{ ...col.cellStyle }"
        >
          <!-- :style="{ 'margin-left': `${(level - 1) * 12}px` }" -->
          <div
            :style="{
              'padding-left':
                col.name !== calcExpandId ? '0px' : `${(level - 1) * 12}px`,
            }"
          >
            <q-btn
              v-if="col.name === calcExpandId && (props.row[urlKey] || props.row.emit)"
              class="q-mr-sm"
              size="md"
              round
              dense
              flat
              @click="ExpandRow(props)"
              :icon="props.expand ? 'r_expand_more' : 'r_chevron_right'"
              style="float: left"
            />
            <div
              :style="`display: block;line-height: 2rem;${
                i === 0 ? 'font-weight: bold;' : ''
              }`"
            >
              {{
                `${
                  props.row[col.name] === undefined ? "" : props.row[col.name]
                }`
              }}
            </div>
          </div>
        </q-td>
      </q-tr>
      <q-tr v-if="props.expand" :props="props">
        <q-td :colspan="colSpan" class="q-pa-none" style="padding: 0px">
          <div :class="calcDetailClass">
            <NestedGrid
              :columns="columns"
              :rows="items"
              :row-key="rowKey"
              :hide-header="calcHideNestedHeader"
              class="no-shadow"
              :expand-id="expandId"
              :level="level + 1"
              :col-span="colSpan"
              :hide-nested-header="hideNestedHeader"
              :filter="filter"
              :overrideopts="overrideopts"
              :max-level="maxLevel"
              :data-url="props.row.subReportUrl"
              @open-row="EmitOpenRow"
            />
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<style lang="scss">
.nested-grid {
  .q-table {
    table-layout: fixed;
  }
}
</style>

<script>
import { ref, defineAsyncComponent, onMounted, computed } from "vue";
import server from "../../server";
//import merge from "lodash.merge"

export default {
  components: {
    NestedGrid: defineAsyncComponent(() => import("./NestedGrid.vue")),
  },
  props: {
    rows: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
    rowKey: {
      type: String,
      default: "name",
    },
    expandId: {
      type: String,
      default: null,
      required: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    colSpan: {
      type: Number,
      default: 1,
    },
    hideNestedHeader: {
      type: Boolean,
      default: false,
    },
    dataUrl: {
      type: String,
      default: null,
    },
    filter: {
      type: Object,
      default: () => ({}),
    },
    overrideopts: {
      type: Object,
      default: () => ({}),
    },
    maxLevel: {
      type: Number,
      default: 1,
    },
    urlKey: {
      type: String,
      default: "subReportUrl",
    },
    payloadKey: {
      type: String,
      default: "",
    },
  },
  emits: ["open-row"],
  setup(props, context) {
    const items = ref([]);
    const loading = ref(false);
    const nextRow = ref(null);

    const calcColumns = computed(() => {
      if (props.overrideopts[props.level.toString()] !== undefined) {
        if (props.overrideopts[props.level.toString()].columns !== undefined) {
          return props.overrideopts[props.level.toString()].columns;
        }
      }
      return [...props.columns];
    });

    const calcExpandId = computed(() => {
      if (props.overrideopts[props.level.toString()] !== undefined) {
        if (props.overrideopts[props.level.toString()].expandId !== undefined) {
          return props.overrideopts[props.level.toString()].expandId;
        }
      }
      return props.expandId;
    });

    const calcRowKey = computed(() => {
      if (props.overrideopts[props.level.toString()] !== undefined) {
        if (props.overrideopts[props.level.toString()].rowKey !== undefined) {
          return props.overrideopts[props.level.toString()].rowKey;
        }
      }
      return props.rowKey;
    });

    const calcHideNestedHeader = computed(() => {
      if (props.overrideopts[(props.level + 1).toString()] !== undefined) {
        if (
          props.overrideopts[(props.level + 1).toString()].hideNestedHeader !==
          undefined
        ) {
          //console.warn("calcHideNestedHeader", props.overrideopts, props.level, props.overrideopts[props.level.toString()].hideNestedHeader);
          return props.overrideopts[(props.level + 1).toString()]
            .hideNestedHeader;
        }
      }
      return props.hideNestedHeader;
    });

    const calcDetailClass = computed(() => {
      //console.warn("calcDetailClass", props.overrideopts, props.level, props.overrideopts[props.level.toString()].detailClass);
      if (props.overrideopts[(props.level + 1).toString()] !== undefined) {
        if (
          props.overrideopts[(props.level + 1).toString()].detailClass !==
          undefined
        ) {
          return props.overrideopts[(props.level + 1).toString()].detailClass;
        }
      }
      return "";
    });

    const ExpandRow = (e) => {
      nextRow.value = e;

      if (e.row.emit){
        context.emit("open-row", e.row);
      }else{
        e.expand = !e.expand;
      }      
    };

    const EmitOpenRow = (e) => {
      context.emit("open-row", e);
    }

    const GetData = (e) => {
      console.log(e, props.dataUrl);
      items.value = [];
      loading.value = true;
      if (props.dataUrl !== null && props.dataUrl !== undefined) {
        server
          .post(props.dataUrl, props.filter)
          .then((response) => {
            loading.value = false;
            if (props.payloadKey === "") {
              items.value = [...response.data.payload];
            } else {
              items.value = [...response.data.payload[props.payloadKey]];
            }

            e.expand = true;
          })
          .catch(() => {
            loading.value = false;
          });
      }
    };

    onMounted(() => {
      //console.log("nested grid", props.columns, props.level);
      GetData();
    });

    return {
      loading,
      calcHideNestedHeader,
      calcRowKey,
      calcExpandId,
      calcColumns,
      calcDetailClass,
      ExpandRow,
      items,
      GetData,
      EmitOpenRow
    };
  },
};
</script>

<style>
</style>