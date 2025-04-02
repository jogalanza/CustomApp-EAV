<template>
  <q-tr>
    <q-td v-for="col in columns" :key="col.name" :style="{ ...col.cellStyle }">
      <div :style="{ 'padding-left': `${(level - 1) * 12}px` }">
        <QBtn
          v-if="col.name === expandId"
          class="q-mr-sm"
          size="sm"
          round
          dense
          @click="ExpandRow(props)"
          :icon="props.expand ? 'r_expand_more' : 'r_chevron_right'"
        />

        {{ `${props.row[col.name] === undefined ? "" : props.row[col.name]}` }}
      </div>
    </q-td>
  </q-tr>
</template>

<script>
export default {
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
  },
  setup() {
    return {};
  },
};
</script>