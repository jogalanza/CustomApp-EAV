<template>
  <div
    :class="`filter-bar row ${scroll ? 'no-wrap' : ''} ${
      scroll ? 'scroll' : ''
    } ${showScroll && scroll ? 'show-scroll' : ''}`"
    @mouseenter="showScroll = true"
    @mouseleave="showScroll = false"
    style="max-height: 100px; overflow: auto"
  >
    <q-chip
      v-for="(m, i) in activeFilters"
      v-show="visible.length === 0 || visible.indexOf(m.key) > -1"
      :key="i"
      clickable
      :removable="!m.alwaysVisible"
      @remove="RemoveFilter(i)"
      @click="EditFilter(i)"
      class="filter-bar-chip"
    >
      <b>{{ m.label }}:</b> &nbsp;{{
        `${
          m.displayValue && m.displayValue.length > 20 && !m.fullDisplay
            ? `${m.displayValue.substring(0, 20)}...`
            : m.displayValue
        }`
      }}
      <q-tooltip>{{ m.displayValue }}</q-tooltip>
    </q-chip>
    <q-chip
      v-if="calcOptions.length > 0 && !single"
      :label="actionLabel"
      @click="ShowFields"
      clickable
      icon="r_filter_alt"
      class="filter-bar-chip"
    ></q-chip>

    <q-chip v-if="single" @click="EditSingleFilter" clickable>
      <b>{{ label }}:</b>&nbsp;
      {{
        `${
          displayValue && displayValue.length > 20
            ? `${displayValue.substring(0, 20)}...`
            : displayValue
        }`
      }}
      <q-tooltip>{{ displayValue }}</q-tooltip>
    </q-chip>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 300px; width: 500px">
        <q-toolbar class="q-pt-sm q-pb-none">
          <q-toolbar-title class="clip"
            >{{
              `${
                editMode === -1
                  ? GetLocaleString("FILTER", "Filter")
                  : `${!single ? selectField.label : label}`
              }`
            }}
            <q-chip
              v-if="
                selectField.type === 'select' &&
                !single &&
                selectField.multiple &&
                selectField.useChips
              "
              dense
              flat
              label="Clear"
              clickable
              class="q-ml-md filter-bar-chip"
              @click="filterValue = []"
            />
            <!-- <q-chip
              v-if="
                selectField.type === 'select' &&
                !single &&
                selectField.multiple &&
                selectField.useChips
              "
              dense
              flat
              label="Select All"
              class="filter-bar-chip"
              clickable
              @click="FillArr(filterValue, selectField.options)"
            /> -->
          </q-toolbar-title>
          <q-space />
          <q-btn round flat icon="r_close" @click="dialog = false" />
        </q-toolbar>
        <q-card-section class="row q-pt-none">
          <div v-if="editMode === -1 && !single" class="col-12 q-mt-md">
            <q-select
              v-model="selectField"
              :options="calcOptions"
              option-label="label"
              dense
              filled
              :label="GetLocaleString('SELECT_FIELD', 'Select Field')"
            />
          </div>
          <div class="col-12 q-mt-md">
            <q-input
              v-if="
                (selectField.type === 'input-text' && !single) ||
                (type === 'input-text' && single)
              "
              v-model="filterValue"
              dense
              filled
              label="Value"
              autofocus
            />
            <div
              v-else-if="
                selectField.type === 'select' &&
                !single &&
                selectField.multiple &&
                selectField.useChips
              "
            >
              <q-chip
                v-for="(m, i) in selectField.options"
                :key="i"
                clickable
                :class="`filter-chip ${
                  filterValue !== null &&
                  filterValue.indexOf(
                    selectField.optionsValue !== undefined &&
                      selectField.emitValue
                      ? m[selectField.optionsValue]
                      : m
                  ) > -1
                    ? 'active'
                    : ''
                }`"
                @click="
                  SetValueToArr(
                    filterValue,
                    selectField.optionsValue !== undefined &&
                      selectField.emitValue
                      ? m[selectField.optionsValue]
                      : m
                  )
                "
                >{{
                  `${
                    selectField.optionsLabel !== undefined &&
                    m[selectField.optionsLabel] !== undefined
                      ? m[selectField.optionsLabel]
                      : m
                  }`
                }}</q-chip
              >
            </div>
            <q-select
              v-else-if="selectField.type === 'select' && !single"
              v-model="filterValue"
              :options="selectField.options"
              :option-label="`${
                selectField.optionsLabel !== undefined
                  ? selectField.optionsLabel
                  : 'label'
              }`"
              :option-value="`${
                selectField.optionsValue !== undefined
                  ? selectField.optionsValue
                  : 'label'
              }`"
              :multiple="
                selectField.multiple !== undefined
                  ? selectField.multiple
                  : false
              "
              dense
              filled
              :label="GetLocaleString('VALUE', 'Value')"
            />
            <q-select
              v-else-if="type === 'select' && single"
              v-model="filterValue"
              :options="options"
              :option-label="optionLabel"
              :option-value="optionValue"
              :multiple="multiple"
              :emit-value="emitValue"
              :map-options="emitValue"
              dense
              filled
              :label="GetLocaleString('VALUE', 'Value')"
            />
            <div
              v-else-if="
                (selectField.type === 'date-range' && !single) ||
                (type === 'date-range' && single) ||
                (selectField.type === 'number-range' && !single) ||
                (type === 'number-range' && single)
              "
              class="row"
            >
              <div class="col-6 q-pr-sm">
                <q-input
                  label="Value 1"
                  :type="
                    (selectField.type === 'date-range' && !single) ||
                    (type === 'date-range' && single)
                      ? 'date'
                      : 'number'
                  "
                  v-model="filterValue"
                  dense
                  filled
                  autofocus
                />
              </div>
              <div class="col-6 q-pl-sm">
                <q-input
                  label="Value 2"
                  :type="
                    (selectField.type === 'date-range' && !single) ||
                    (type === 'date-range' && single)
                      ? 'date'
                      : 'number'
                  "
                  v-model="filterValue2"
                  dense
                  filled
                  autofocus
                />
              </div>
              <div class="col-12 q-mt-sm">
                <q-toggle
                  v-model="incBlankData"
                  label="Include null values"
                  style="margin-left: -8px"
                />
              </div>
              <div class="col-12 q-mt-sm">
                {{ valueRangeStr }}
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator style="height: 1px" />
        <q-card-actions>
          <q-space />
          <q-btn
            v-if="!single"
            :label="GetLocaleString('APPLY_FILTER', 'Apply Filter')"
            no-caps
            color="primary"
            unelevated
            @click="
              AddFilter(selectField, filterValue, filterValue2, incBlankData)
            "
          />
          <q-btn
            v-else
            :label="GetLocaleString('APPLY_FILTER', 'Apply Filter')"
            no-caps
            color="primary"
            unelevated
            @click="UpdateSingleFilter"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style lang="scss">
.filter-bar {
  padding-top: 8px;
  margin-bottom: 8px;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &.show-scroll {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
  }

  // &::-webkit-scrollbar-thumb {
  //   background: transparent;
  // }
}
</style>

<script>
import {
  computed,
  defineComponent,
  inject,
  isRef,
  onMounted,
  ref,
  toRaw,
  watch,
} from "vue";
import general from "@/mixins/general";

export default defineComponent({
  name: "FilterBar",
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    opts: {
      type: Array,
      default: () => [],
    },
    visible: {
      type: Array,
      default: () => [],
    },
    scroll: {
      type: Boolean,
      default: false,
    },
    single: {
      type: Boolean,
      default: false,
    },
    //Single-Mode
    keyValue: {
      type: String,
      default: "",
    },
    keyValue2: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: "Label",
    },
    type: {
      type: String,
      default: "input-text",
    },
    optionLabel: {
      type: String,
      default: "label",
    },
    optionValue: {
      type: String,
      default: "value",
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    emitValue: {
      type: Boolean,
      default: true,
    },
    actionLabel: {
      type: String,
      default: "Add data filter",
    },
  },
  emits: ["update:modelValue", "update"],
  setup(props, context) {
    const GetLocaleString = inject("GetLocaleString");
    const { getObjValue, getMultiObjValue, SetValueToArr, FillArr } = general();
    const dialog = ref(false);
    const selectField = ref({});
    const filterValue = ref(null);
    const filterValue2 = ref(null);
    const incBlankData = ref(false);
    const activeFilters = ref([]);
    const editMode = ref(-1);
    const showScroll = ref(false);
    const items = ref([
      {
        label: "Product Line",
      },
    ]);
    const displayValue = ref(null);

    const activeLabels = computed(() => {
      var x = [];
      activeFilters.value.map((e) => {
        x.push(e.label);
      });
      return x;
    });

    const calcOptions = computed(() => {
      var x = [
        ...props.opts.filter((e) => activeLabels.value.indexOf(e.label) === -1),
      ];
      if (selectField.value.label === undefined && x.length > 0) {
        ////console.log(selectField.value, x);
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        selectField.value = { ...x[0] };
      }
      return x;
    });

    const valueRangeStr = computed(() => {
      if (filterValue.value && filterValue2.value) {
        return `Between ${filterValue.value} and ${filterValue2.value}`;
      } else if (filterValue.value && !filterValue2.value) {
        return `Greater than or equal ${filterValue.value}`;
      } else if (!filterValue.value && filterValue2.value) {
        return `Less than or equal ${filterValue2.value}`;
      }
      return "";
    });

    // watch(
    //   selectField,
    //   () => {
    //     if (editMode.value === -1) {
    //       filterValue.value = null;
    //       filterValue2.value = null;
    //     }
    //   },
    //   { deep: true }
    // );

    watch(
      () => props.modelValue,
      () => {
        UpdateDisplayValues();
      },
      { deep: true }
    );

    watch(
      () => props.opts,
      () => {
        CheckVisibleFilters();
      },
      { deep: true }
    );

    watch(
      () => selectField.value,
      (newVal) => {
        if (editMode.value === -1) {
          filterValue.value = newVal.multiple ? [] : null;
          filterValue2.value = newVal.multiple ? [] : null;
        }
      },
      { deep: true }
    );

    const ShowFields = () => {
      editMode.value = -1;
      filterValue.value = null;
      filterValue2.value = null;
      selectField.value = {};
      dialog.value = true;
    };

    const AddFilter = (opt, val1, val2, blkDate, _emit = true) => {
      var isArray = false;

      var _opt = opt !== undefined ? opt : selectField.value;
      var _filterValue = val1 !== undefined ? val1 : filterValue.value;
      var _filterValue2 = val2 !== undefined ? val2 : filterValue2.value;
      var _blkDate = blkDate !== undefined ? blkDate : incBlankData.value;

      if (_filterValue !== null) {
        isArray =
          typeof _filterValue === "object" && _filterValue.length !== undefined;
      }

      var disValue = _filterValue;
      var eValue = _filterValue;

      // console.warn(
      //   "AddFilter",
      //   opt,
      //   val1,
      //   val2,
      //   blkDate,
      //   disValue,
      //   eValue,
      //   typeof _filterValue,
      //   isArray
      // );

      if (isArray && _opt.type === "select") {
        //&& _opt.optionsLabel !== undefined
        disValue = "";
        eValue = [];
        for (var i = 0; i < _filterValue.length; i++) {
          disValue += `${disValue !== "" ? ", " : ""}${
            _opt.optionsLabel === undefined
              ? _filterValue[i]
              : _filterValue[i][_opt.optionsLabel]
          }`;

          eValue.push(
            _opt.optionsValue !== undefined && _opt.emitValue
              ? `${_filterValue[i][_opt.optionsValue]}`
              : _filterValue[i]
          );
        }
      } else if (
        _opt.type === "select" &&
        _opt.optionsLabel !== undefined &&
        typeof _filterValue === "object"
      ) {
        try {
          disValue = _filterValue[_opt.optionsLabel];
        } catch {
          disValue = "No data";
        }

        //console.warn("FilterValue", _filterValue, disValue);
        //disValue = _filterValue === null && _filterValue[_opt.optionsLabel] === undefined ? "No data" : _filterValue[_opt.optionsLabel]
        eValue =
          _filterValue === null
            ? "No data"
            : _opt.optionsValue !== undefined
            ? _filterValue[_opt.optionsValue]
            : _filterValue;

        // eValue = `${
        //   _filterValue === null
        //     ? "No data"
        //     : _filterValue[
        //         `${
        //           _opt.optionsValue !== undefined
        //             ? _opt.optionsValue
        //             : _opt.optionsLabel
        //         }`
        //       ]
        // }`;
      } else if (_opt.type === "date-range" || _opt.type === "number-range") {
        disValue = `${_filterValue} - ${_filterValue2}`;
        if (!_filterValue2 && _filterValue) disValue = `>= ${_filterValue}`;
        else if (_filterValue2 && !_filterValue)
          disValue = `<= ${_filterValue2}`;
        eValue = {};
        eValue[_opt.key] = _filterValue;
        eValue[_opt.key2] = _filterValue2;
        eValue[_opt.blankKey] = _blkDate;
      }

      var x = {
        ..._opt,
        actualValue: _filterValue,
        actualValue2: _filterValue2,
        displayValue: disValue,
        incBlankDate: _blkDate,
        value: eValue,
      };

      if (editMode.value === -1) {
        activeFilters.value.push(x);
      } else {
        //edit mode
        var buffer = [...activeFilters.value];
        buffer[editMode.value] = { ...x };
        //activeFilters.value[editMode.value] = { ...x };
        activeFilters.value = [...buffer];
        //console.warn("edit mode", editMode.value, activeFilters.value, x);
      }

      // TODO: emit event
      if (_opt.key !== undefined && _emit) {
        var m = { ...props.modelValue };

        if (_opt.type === "date-range" || _opt.type === "number-range") {
          m[_opt.key] = x.value[_opt.key];
          m[_opt.key2] = x.value[_opt.key2];
          if (_opt.blankKey) m[_opt.blankKey] = x.value[_opt.blankKey];
        } else {
          m[_opt.key] = x.value;
        }

        //console.warn("emit", m);

        context.emit("update", m);
      }

      dialog.value = false;
    };

    const RemoveFilter = (index) => {
      //console.warn("RemoveFilter", activeFilters.value, props.modelValue);
      if (index < activeFilters.value.length) {
        var x = { ...activeFilters.value[index] };
        var m = { ...props.modelValue };
        m[x.key] = x.emptyValue === undefined ? null : x.emptyValue; //we no longer use defaultValue prop x.defaultValue;
        if (x.type === "date-range" || x.type === "number-range") {
          m[x.key2] = x.emptyValue === undefined ? null : x.emptyValue; //x.defaultValue2;
          m[x.blankKey] = x.incBlankDate;
        }
        context.emit("update", m);

        activeFilters.value.splice(index, 1);
      }
    };

    const EditFilter = (index) => {
      editMode.value = index;
      var x = activeFilters.value[index];
      selectField.value = { ...x };
      console.warn(selectField.value);
      filterValue.value = x.actualValue;
      filterValue2.value = x.actualValue2;
      incBlankData.value = x.incBlankDate;
      dialog.value = true;
    };

    const EditSingleFilter = () => {
      editMode.value = 0;
      dialog.value = true;
    };

    const UpdateSingleFilter = () => {
      //console.warn(props);
      if (props.keyValue !== null && props.keyValue !== "") {
        var m = { ...props.modelValue };

        if (props.type === "date-range" || props.type === "number-range") {
          m[props.keyValue] = filterValue.value;
          if (props.keyValue2) m[props.keyValue2] = filterValue2.value;
        } else {
          m[props.keyValue] = filterValue.value;
        }

        //console.warn("emit", m);

        context.emit("update", m);

        dialog.value = false;
      } else {
        //console.error("FilterBar: No key defined");
      }
    };

    const GetSingleValue = () => {
      if (props.single && props.keyValue !== "") {
        var x = props.modelValue[props.keyValue];
        displayValue.value = x;
        filterValue.value = x;
        if (props.keyValue2 !== "")
          filterValue2.value = props.modelValue[props.keyValue2];

        //console.warn("GetSingleValue", props.label, props, displayValue.value);

        if (
          x !== null &&
          props.type === "select" &&
          props.emitValue &&
          props.optionValue !== ""
        ) {
          for (var i = 0; i < props.options.length; i++) {
            if (
              props.options[i][props.optionValue] !== undefined &&
              props.options[i][props.optionValue].toString() === x.toString()
            ) {
              displayValue.value = props.options[i][props.optionLabel];
            } else if (props.options[i][props.optionValue] === undefined) {
              if (props.options[i].toString() === x.toString()) {
                displayValue.value = props.options[i];
              }
            }
          }
        } else if (
          props.type === "date-range" ||
          props.type === "number-range"
        ) {
          displayValue.value = `${filterValue.value}${
            filterValue2.value !== null ? " - " : ""
          }${filterValue.value}`;
        }
      }
    };

    const ValidateDefaultValue = (_opts) => {
      if (_opts.type === "select") {
        //&& _opts.options.length > 0
        var options = isRef(_opts.options)
          ? _opts.options.value
          : _opts.options;
        var xx = null;

        if (_opts.multiple && options.length > 0) {
          xx = getMultiObjValue(
            options,
            _opts.optionsValue,
            props.modelValue[_opts.key]
          );

          if (xx) {
            _opts.defaultValue = xx;
          }

          xx = getMultiObjValue(
            options,
            _opts.optionsValue,
            props.modelValue[_opts.key]
          );

          if (xx) {
            _opts.defaultValue2 = xx;
          }
        } else if (options.length > 0) {
          xx = getObjValue(
            _opts.options,
            _opts.optionsValue,
            props.modelValue[_opts.key]
          );

          if (xx) {
            _opts.defaultValue = xx;
          }

          xx = getObjValue(
            _opts.options,
            _opts.optionsValue,
            props.modelValue[_opts.key]
          );

          if (xx) {
            _opts.defaultValue2 = xx;
          }
        }
      } else if (
        _opts.type === "input-text" &&
        props.modelValue[_opts.key] !== _opts.defaultValue
      ) {
        _opts.defaultValue = props.modelValue[_opts.key];
      }
    };

    const CheckVisibleFilters = () => {
      if (!dialog.value) {
        var _opts = [...props.opts];

        for (var i = 0; i < _opts.length; i++) {
          if (
            _opts[i].alwaysVisible ||
            (_opts[i].emptyValue !== undefined &&
              toRaw(props.modelValue[_opts[i].key] || "").toString() !=
                toRaw(_opts[i].emptyValue || "").toString())
          ) {
            var _index = activeLabels.value.indexOf(_opts[i].label);
            ValidateDefaultValue(_opts[i]);
            editMode.value = _index;

            AddFilter(
              _opts[i],
              _opts[i].defaultValue,
              _opts[i].defaultValue2,
              _opts[i].blankKey ?? false,
              false
            );
          }
        }
      }
    };

    const UpdateDisplayValues = () => {
      if (props.single) {
        GetSingleValue();
      } else {
        CheckVisibleFilters();
      }
    };

    onMounted(() => {
      setTimeout(() => {
        UpdateDisplayValues();
      }, 1000);
    });

    return {
      displayValue,
      showScroll,
      activeFilters,
      calcOptions,
      dialog,
      selectField,
      filterValue,
      filterValue2,
      items,
      editMode,
      ShowFields,
      AddFilter,
      RemoveFilter,
      EditFilter,
      GetLocaleString,
      EditSingleFilter,
      UpdateSingleFilter,
      SetValueToArr,
      valueRangeStr,
      incBlankData,
      FillArr
    };
  },
});
</script>
