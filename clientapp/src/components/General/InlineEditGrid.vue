<template>
  <q-table
    ref="table"
    flat
    :rows="items"
    :columns="fields"
    :row-key="rowKey"
    virtual-scroll
    :virtual-scroll-item-size="48"
    :pagination="pagination"
    :rows-per-page-options="[0]"
    :loading="loading"
    :class="{
      'inline-edit-grid': true,
      'no-data': items.length === 0,
      'has-data': items.length > 0,
      loading: loading,
    }"
  >
    <template v-slot:loading>
      <div
        class="absolute fit row justify-center items-center"
        style="background: rgba(0, 0, 0, 0.5); margin: 0px; z-index: 100"
      >
        <q-spinner-ball size="md" color="white" style="margin-right: 16px" />
        <span style="color: white; letter-spacing: 0.3rem">Loading</span>
      </div>
    </template>

    <template v-slot:no-data>
      <div
        v-if="!loading"
        class="loading-bar full-width row flex-center q-gutter-sm"
        style="font-size: 14px; color: #5d5d5d; font-weight: bold"
      >
        <span>
          {{ noDataMsg }}
        </span>
      </div>
    </template>

    <template v-slot:top>
      <slot name="top">
        <q-btn label="test"></q-btn>
      </slot>
    </template>

    <!-- <template v-slot:header>
      <tr>
        <th
          v-for="col in fields"
          :key="'1--' + col.field"
          :align="col.align !== undefined ? col.align : 'left'"
          :class="`q-px-sm ${(col.thClass === undefined ? '' : col.thClass)}`"
          :style="col.thStyle === undefined ? '' : col.thStyle"
        >
          <div
            style="white-space: normal; padding-left: 8px; padding-right: 8px"
          >
            {{ col.label }}
          </div>
        </th>
      </tr>
    </template> -->

    <template v-slot:body="props">
      <q-tr
        :props="props"
        :key="props.field === null ? `m_${GenUID()}` : `m_${props.field}`"
        :class="`${props.row.dirty ? 'row-dirty' : ''}`"
      >
        <td
          v-for="col in props.cols"
          :key="props.field + '-' + col.label"
          :class="`${col.class === undefined ? '' : col.class}`"
          :style="col.style === undefined ? '' : col.style"
        >
          <template
            v-if="col.datatype === 'Currency' || col.datatype === 'Number'"
          >
            <div
              :class="{
                'cell-display': true,
                'disabled-light':
                  props.row.PeriodLock !== undefined &&
                  props.row.PeriodLock.indexOf(col.field) > -1
                    ? true
                    : false,
              }"
              @focus="SelectItem($event, props.row, col.field, 'number')"
              :tabindex="`${
                (props.row.PeriodLock !== undefined &&
                  props.row.PeriodLock.indexOf(col.field) > -1) ||
                readOnly
                  ? '-1'
                  : '0'
              }`"
              style="text-align: right"
            >
              <span v-if="col.datatype === 'Currency'" style="float: left">{{
                !localCurrency
                  ? "$"
                  : `${props.row.Symbol ? props.row.Symbol : ""}`
              }}</span>
              {{
                formatNumber(
                  props.row[col.field],
                  false,
                  col.decimal ? col.decimal : 0
                )
              }}
            </div>
          </template>
          <template v-else-if="col.edit === 'select'">
            <div
              class="cell-display"
              @focus="
                SelectEditor(
                  props,
                  col.field,
                  `${col.field}Edit`,
                  `${col.field}`,
                  `${props.field}-${col.label}-select-editor`
                )
              "
              tabindex="0"
            >
              <q-select
                v-if="props.row[`${col.field}Edit`] === true"
                :ref="`${col.field}-${col.label}-select-editor`"
                v-model="targetObj[`${props.rowIndex}`][`${col.field}`]"
                dense
                hide-details
                :options="EvalOptions(props, col)"
                :option-label="col.optionLabel"
                :option-value="col.optionValue"
                :emit-value="col.emitValue"
                :map-options="col.emitValue"
                borderless
                flat
                @blur="
                  BlurObject(
                    props,
                    props.row,
                    `${col.field}Edit`,
                    col.field,
                    `${col.field}`
                  )
                "
                @popup-hide="
                  BlurObject(
                    props,
                    props.row,
                    `${col.field}Edit`,
                    col.field,
                    `${col.field}`
                  )
                "
                class="select-editor"
                style="margin-top: -14px"
              ></q-select>
              <div class="static-text" v-else style="text-align: left">
                {{ props.row[col.field] }}
              </div>
            </div>
          </template>
          <template v-else-if="col.edit === 'input'">
            <div
              class="cell-display"
              @focus="SelectItem($event, props.row, col)"
              :tabindex="readOnly ? -1 : 0"
            >
              {{
                `${
                  col.type === "number"
                    ? formatNumber(props.row[col.field])
                    : props.row[col.field]
                }`
              }}
            </div>
          </template>
          <template
            v-else-if="
              col.datatype === 'datetime' ||
              col.datatype === 'datetime2' ||
              col.datatype === 'datetime3'
            "
          >
            <div class="cell-display">
              <div class="static-text">
                {{ formatDate(props.row[col.field], col.datatype) }}
              </div>
            </div>
          </template>
          <template v-else-if="col.datatype === 'CustomField'">
            <slot name="CustomField" v-bind:data="{ props, col }">
              <q-btn
                small
                color="green"
                dark
                @click.stop="$emit('custom-field-cliked')"
                >{{ col.label }}</q-btn
              >
            </slot>
          </template>
          <template v-else>
            <div style="overflow: hidden">
              {{ props.row[col.field] }}
            </div>
          </template>
        </td>
      </q-tr>
    </template>
  </q-table>
</template>

<style lang="scss">
.inline-edit-grid {
  .q-table {
    table-layout: fixed;
  }

  .row-dirty {
    background: #d2fbd0;

    td {
      background: #d2fbd0 !important;
    }
  }

  .cell-display {
    /* background-color: yellow; */
    position: absolute;
    top: 0px;
    bottom: 0px;
    width: 100%;
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 7px 14px;
    padding-top: 14px;
    left: 0px;
    right: 0px;
  }

  .input-text {
    background-color: rgb(188, 240, 191);
    display: block;
    top: 0px;
    right: 0px;
    left: 0px;
    position: absolute;
    bottom: 0px;
    width: 100%;
    padding-left: 14px;
    padding-right: 14px;
    border: 1px solid transparent !important;
  }

  input {
    &:focus {
      outline: red;
    }
  }
}

.body--dark {
  .inline-edit-grid {
    .row-dirty {
      background: #3c3c3c;

      td {
        background: #3c3c3c !important;
      }
    }
  }
}
</style>

<style lang="scss">
.inline-edit-grid {
  // .q-table__top {
  //   display: none;
  // }

  &.no-data {
    .q-table__bottom {
      min-height: 0px;
      height: 30px;
      max-height: 30px;
      padding: 6px;
      border: none;
      /* display: none; */
    }
  }

  &.loading,
  &.has-data {
    .q-table__bottom {
      display: none;
    }
  }

  .static-text {
    min-width: 100%;
    min-height: 100%;
  }

  .cell-display {
    &.disabled {
      background-color: #eee;
    }

    &.disabled-light {
      outline: 0 !important;
      cursor: not-allowed !important;
      color: #777;
    }
  }

  tr {
    &.row-class {
      td {
        padding: 0px;
        height: 40px;
        position: relative;
        display: table-cell;
      }
    }
  }

  .text-padding {
    padding: 0.5rem;
  }

  .q-table {
    td {
      padding: 0px 16px;
    }

    th {
      padding: 7px 16px;
    }
  }
}
</style>

<script>
// @ is an alias to /src
import { v4 as uuidv4 } from "uuid";
import { defineComponent, ref } from "vue";
import general from "../../mixins/general";

export default defineComponent({
  name: "InlineEditGrid",
  props: {
    targetName: {
      type: String,
      default: "inline-edit-grid",
    },
    fields: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
    rowKey: {
      type: String,
      default: "RowNum",
    },
    selectedCount: {
      type: Number,
      default: 0,
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    localCurrency: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    noDataMsg: {
      type: String,
      default: "There are no records to show",
    },
  },
  components: {},
  emits: ["row-dirty"],
  setup(props, context) {
    const items = ref([]);
    const { formatNumber } = general();
    const activeComponent = ref(null);
    const pagination = ref({
      page: 1,
      itemsPerPage: 32,
      maxPage: 10,
      rowsPerPage: 0,
    });
    const selected = ref([]);

    const targetObj = ref({
      element: null,
      text: "",
      rowItem: null,
      key: null,
      siteName: null,
    });

    const checkObject = (props, col) => {
      console.log(props, col);
    };

    const SetModifiedFields = (_props, key) => {
      if (!_props.modified) _props.modified = [];
      if (_props.modified.indexOf(key) === -1) _props.modified.push(key);
    };

    const SelectChange = (event, row) => {
      row["selected"] = event;
      //this.$set(row, 'selected', event)
    };

    const SelectAllChange = (event) => {
      items.value.forEach((e) => {
        e["selected"] = event;
      });
    };

    const BlurObject = (e, row, key, targetKey, valueKey) => {
      //console.warn("Blur Object", e, row, key, targetKey, valueKey);

      var x = row[targetKey];
      row[targetKey] = targetObj.value[`${e.rowIndex}`][valueKey];
      row[key] = false;

      if (x !== targetObj.value[valueKey]) {
        row.dirty = true;
        context.emit("row-dirty", row);
        SetModifiedFields(row, targetKey);
      }
    };

    const RemoveItem = (e) => {
      var val =
        e.target.type === "number"
          ? parseFloat(e.target.value) || 0
          : e.target.value; //e.target.value

      if (targetObj.value.rowItem && targetObj.value.field) {
        var x = targetObj.value.rowItem[targetObj.value.field];
        if (x === null) x = "";

        targetObj.value.rowItem[targetObj.value.field] = val;

        if (val !== x) {
          if (val.toString() !== x.toString()) {
            targetObj.value.rowItem.dirty = true;
            context.emit("row-dirty", targetObj.value.rowItem);
            SetModifiedFields(targetObj.value.rowItem, targetObj.value.field);
          }
        }
      }
      e.target.removeEventListener("blur", RemoveItem);
      e.target.remove();
    };

    const SelectItem = (event, row, colInfo) => {
      if (props.readOnly) return;
      
      if (colInfo == undefined || colInfo.readOnly) {
        return;
      } else {
        CreateInput(event, row, colInfo);
      }
    };

    const CreateInput = (event, row, colInfo) => {
      //console.log('SelectItem', event, row, row.DeferredBacklog, row[key])
      targetObj.value.text = "";
      targetObj.value.rowItem = row;
      targetObj.value.field = colInfo.field;
      var input = document.createElement("input");
      input.type = colInfo.type === undefined ? "text" : colInfo.type;
      input.className = "input-text";
      input.value =
        colInfo.type === "number"
          ? parseFloat(row[colInfo.field]) || 0
          : row[colInfo.field];
      //if (colInfo.type === "number") input.style.textAlign = "right";
      input.addEventListener("blur", RemoveItem);
      event.target.appendChild(input);
      input.focus();
    };

    const SelectEditor = (_props, key, rowFlag, tempKey) => {
      if (props.readOnly) return;

      if (targetObj.value[`${_props.rowIndex}`] === undefined) {
        targetObj.value[`${_props.rowIndex}`] = {};
      }
      targetObj.value[`${_props.rowIndex}`][tempKey] = _props.row[key];

      _props.row[rowFlag] = true;
    };

    const GenUID = () => {
      return uuidv4();
    };

    const EvalOptions = (props, col) => {
      //console.log(props, col);
      if (col.options !== undefined) {
        return [...col.options.value];
      }
      return [{ label: "[Invalid Options]", value: -1 }];
    };

    return {
      activeComponent,
      pagination,
      targetObj,
      selected,
      formatNumber,
      SelectEditor,
      GenUID,
      CreateInput,
      SelectItem,
      RemoveItem,
      BlurObject,
      SelectAllChange,
      SelectChange,
      checkObject,
      EvalOptions,
    };
  },
});
</script>
