<template>
  <q-card flat class="edit-dashboard">
    <q-card-section class="q-py-none" style="height: calc(100% - 52px)">
      <q-list
        v-if="item.ID !== undefined"
        :disable="loading"
        style="
          height: 100%;
          overflow-y: auto;
          padding-right: 8px;
          margin-right: -16px;
        "
      >
        <q-item class="q-pa-none">
          <q-item-section>
            <q-item-label>
              <q-input
                label="Title"
                v-model="item.Title"
                dense
                filled
              ></q-input>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="q-pa-none">
          <q-item-section>
            <q-item-label>
              <q-select
                label="Group"
                v-model="item.GroupID"
                :options="options.DBGroup"
                option-label="label"
                option-value="value"
                @new-value="NewDBGroup"
                use-input
                map-options
                emit-value
                dense
                filled
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        icon="o_close"
                        round
                        flat
                        dense
                        @click.stop="RemoveDBGroup(scope.opt.value)"
                      />
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="q-px-none" style="height: 200px">
          <q-item-section>
            <q-item-label style="height: 100%">
              <q-input
                label="URL"
                v-model="item.ChartUrl"
                dense
                filled
                type="textarea"
                style="height: 100%"
              ></q-input>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="q-px-none" style="height: 200px">
          <q-item-section>
            <q-item-label style="height: 100%">
              <q-editor
                v-model="item.Filter"
                ref="editorRef"
                filled
                :toolbar="[['title'], ['token']]"
                min-height="9rem"
                max-height="9rem"
              >
                <template v-slot:title>
                  <div
                    class="text-grey q-pr-md q-pl-sm"
                    style="height: 100%; line-height: 2rem; font-size: 0.9em"
                  >
                    Filter Text
                  </div>
                </template>
                <template v-slot:token>
                  <q-btn-dropdown
                    dense
                    no-caps
                    ref="tokenRef"
                    no-wrap
                    label="Insert Filter Key"
                    size="sm"
                    unelevated
                    color="primary"
                    padding="xs md"
                  >
                    <q-list dense>
                      <q-item
                        v-for="(m, i) in FilterToken"
                        :key="i"
                        tag="label"
                        clickable
                        @click="InsertVar(m.value)"
                      >
                        <q-item-section side>
                          <q-icon name="o_filter_alt" />
                        </q-item-section>
                        <q-item-section>{{ m.label }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>
              </q-editor>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="q-px-none" style="height: 100px">
          <q-item-section>
            <q-item-label style="height: 100%">
              <q-input
                label="Notes"
                v-model="item.Notes"
                dense
                filled
                type="textarea"
                style="height: 100%"
              ></q-input>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item-label class="q-mt-lg text-bold"
          >Custom Filter Objects (select whichever applies)</q-item-label
        >
        <q-item v-for="(m, i) in optCustomFilters" :key="i">
          <q-item-section>
            <q-item-label>{{ m.label }}</q-item-label>
            <q-item-label caption>Default: {{ m.defaultValue }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-toggle v-model="m.enabled" />
          </q-item-section>
        </q-item>

        <q-item-label class="q-mt-lg text-bold"
          >Default Selections (will vary based on account's access
          matrix)</q-item-label
        >
        <q-item>
          <q-item-section>
            <q-select
              v-model="defaultProducts"
              multiple
              label="Products"
              :options="options.Products"
              dense
              filled
              use-chips
              option-value="label"
              map-options
              emit-value
            />
          </q-item-section>
        </q-item>

        <q-item-label class="q-mt-lg text-bold">Filter Settings</q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label
              >Expand Product options when SBU is selected</q-item-label
            >
            <q-item-label
              ><q-select
                v-model="productExpand"
                multiple
                label="Products"
                :options="options.Products"
                dense
                filled
                use-chips
                option-value="label"
                map-options
                emit-value
            /></q-item-label>
          </q-item-section>
          <!-- <q-item-section side top>
            <q-toggle v-model="item.ExpandProductFilter" />
          </q-item-section> -->
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-actions>
      <q-space />
      <q-btn label="Cancel" flat @click="$emit('close')" :disable="loading" />
      <q-btn
        label="Save"
        color="primary"
        @click="SaveItem"
        :disable="loading"
        :loading="loading"
      />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss">
.edit-dashboard {
  .q-field__control {
    height: 100%;
  }

  .q-editor__content {
    background: rgba(0, 0, 0, 0.05);
  }
}

.body--dark {
  .edit-dashboard {
    .q-editor__content {
      background: hsla(0, 0%, 100%, 0.07);
    }
  }
}
</style>

<script>
import { defineComponent, ref, inject, onMounted } from "vue";
import general from "@/mixins/general";
import api from "@/api/index";
import server from "@/server";
import { useMainStore } from "../../store";
import { useUser } from "../../store/user";
import { useOptions } from "../../store/options";
import { useEvalFilter } from "@/composables/evalFilter";

export default defineComponent({
  name: "EditDashboard",
  emits: ["update", "done"],
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const mainStore = useMainStore();
    const user = useUser();
    const options = useOptions();
    const { FilterToken, CustomFilters, ParseFilterObjects } = useEvalFilter();
    const { NotifyUser, ParseName, SetValueToArr, FillArr, ConfirmAction } =
      general();
    const loading = ref(false);
    const item = ref({});
    const roles = ref([]);
    const userSites = ref([]);
    const userProducts = ref([]);
    const userDashboards = ref([]);
    const userRoles = ref([]);
    const tokenRef = ref(null);
    const editorRef = ref(null);
    const filterObjs = ref([]);
    const defaultProducts = ref([]);
    const productExpand = ref([]);

    const optCustomFilters = ref([]);

    for (var k in CustomFilters.value) {
      var y = {
        key: CustomFilters.value[k].key,
        label: CustomFilters.value[k].tableRef,
        defaultValue: CustomFilters.value[k].defaultValue,
      };
      optCustomFilters.value.push(y);
    }

    const GetMaster = () => {
      //
    };

    const SaveItem = () => {
      var x = optCustomFilters.value.filter((e) => e.enabled);
      item.value.FilterObjects = JSON.stringify(x);
      item.value.DefaultProducts =
        defaultProducts.value.length == 0
          ? null
          : JSON.stringify(defaultProducts.value);
      item.value.ProductExpand =
      productExpand.value.length == 0
          ? null
          : JSON.stringify(productExpand.value);

      loading.value = true;
      api
        .DashboardSave(item.value)
        .then((response) => {
          NotifyUser(response.data);
          loading.value = false;
          if (response.data.success) {
            ctx.emit("update");
            ctx.emit("done");
          }
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const Edit = (data) => {
      item.value = { ...data };
      filterObjs.value = [...ParseFilterObjects(item.value.FilterObjects)];

      if (item.value.DefaultProducts) {
        defaultProducts.value = JSON.parse(item.value.DefaultProducts);
      } else {
        defaultProducts.value = [];
      }

      if (item.value.ProductExpand) {
        productExpand.value = JSON.parse(item.value.ProductExpand);
      } else {
        productExpand.value = [];
      }

      MapCustomFilterOpts();
    };

    const MapCustomFilterOpts = () => {
      optCustomFilters.value.map((e) => {
        e.enabled = false;
        for (var i in filterObjs.value) {
          if (filterObjs.value[i].key === e.key) {
            e.enabled = true;
            e.defaultValue = filterObjs.value[i].defaultValue;
          }
        }
      });
    };

    const AddNew = () => {
      item.value = {
        ID: 0,
        Title: null,
        ChartUrl: null,
        Filter: null,
        Notes: null,
        FilterObjects: null,
        DefaultProducts: null,
      };
      filterObjs.value = [];
      defaultProducts.value = [];
      MapCustomFilterOpts();
    };

    const InsertVar = (name) => {
      const edit = editorRef.value;
      tokenRef.value.hide();
      edit.caret.restore();
      edit.runCmd("insertHTML", `${name}`);
      edit.focus();
    };

    const NewDBGroup = (val, done) => {
      console.warn("NewDBGroup", val);
      var payload = {
        label: val,
        value: 0,
      };

      api.DBGroupSave(payload).then(() => {
        options.GetDBGroup();
      });
      done(val);
    };

    const RemoveDBGroup = (_id) => {
      ConfirmAction("Are you sure you want to delete this group?", () => {
        api.DBGroupDelete([_id]).then(() => {
          if (item.value.GroupID == _id) item.value.GroupID = 0;
          options.GetDBGroup();
        });
      });
    };

    onMounted(() => {
      //GetMaster();
    });

    return {
      tokenRef,
      editorRef,
      GetLocaleString,
      loading,
      GetMaster,
      server,
      Edit,
      item,
      mainStore,
      user,
      options,
      SaveItem,
      ParseName,
      roles,
      userRoles,
      userSites,
      userProducts,
      userDashboards,
      SetValueToArr,
      FillArr,
      InsertVar,
      FilterToken,
      AddNew,
      filterObjs,
      optCustomFilters,
      defaultProducts,
      NewDBGroup,
      RemoveDBGroup,
      productExpand
    };
  },
});
</script>