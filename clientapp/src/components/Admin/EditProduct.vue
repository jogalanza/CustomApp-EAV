<template>
  <EditDialog class="batch-clocking" :dialog="dialog" @ondialog="dialog = $event" action-style="height: 70px" content-style="height: calc(100% - 120px);">
    <template v-slot:header>
      <q-linear-progress v-if="loading || loading_mac || loading_act" indeterminate />
      <q-toolbar class="q-pr-none">
        <div class="text-h6" style="text-overflow: inherit">
          Edit Product
        </div>
        <q-space />
        <q-btn v-close-popup round flat icon="r_close" />
      </q-toolbar>
    </template>

    <template v-slot:action>
      <q-space />
      <q-btn label="Cancel" flat @click="dialog = false" :disable="loading" no-caps />
      <q-btn label="Save" no-caps color="primary" padding="sm lg" @click="SaveItem" :disable="loading" :loading="loading" />
    </template>

    <q-list class="full-width" style="height: 100%; overflow: auto; padding: 4px">
      <q-item v-if="resultMsg" class="q-card" style="border-left: solid red 8px; border-radius: 4px;">
        <q-item-section>
          <q-item-label v-html="resultMsg.message">
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat round icon="o_close" @click="resultMsg = null" size="sm" />
        </q-item-section>
      </q-item>

      <q-item class="q-px-none">
        <q-item-section>
          <q-item-label>
            <q-input filled v-model="item.Description" label="Description" @focus="SelectInput" autofocus />
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

  </EditDialog>
</template>

<style scoped lang="scss">
.no-photo {
  width: 62px;
  height: 62px;
  text-align: center;
  padding: 0px;
  line-height: 2em;
}
</style>

<script>
import {
  defineComponent,
  ref,
  inject,
  onMounted,
  defineAsyncComponent,
  nextTick,
} from "vue";
import general from "@/mixins/general";
import api from "@/api/product";
import server from "@/server";
import { useMainStore } from "../../store";
import { useUser } from "../../store/user";
import { useOptions } from "../../store/options";
import { useHelper } from "@/composables/helper";

export default defineComponent({
  name: "EditProduct",
  emits: ["update", "done", "approve"],
  components: {
    EditDialog: defineAsyncComponent(() =>
      import("@/components/General/EditDialog.vue")
    ),
  },
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const mainStore = useMainStore();
    const { SelectInput } = useHelper();
    const user = useUser();
    const options = useOptions();
    const { NotifyUser, } = general();
    const loading = ref(false);
    const item = ref({});
    const isNew = ref(false);
    const dialog = ref(false);
    const resultMsg = ref(null);

    const GetMaster = () => {
      api.GetUserByID(item.value.ID).then(response => {
        item.value = { ...response.data };
      })
    };

    const SaveItem = () => {
      loading.value = true;
      resultMsg.value = null;
      api
        .Save(item.value)
        .then((response) => {
          
          loading.value = false;

          if (response.data.success) {
            NotifyUser(response.data);
            dialog.value = false;
            nextTick(() => {
              ctx.emit("done");
              ctx.emit("update");
            });
          }else{
            resultMsg.value = response.data;
          }
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const Edit = (data) => {
      isNew.value = false;
      item.value = { ...data };
      dialog.value = true;
    };

    const AddNew = () => {
      isNew.value = true;
      item.value = {
        Descrption: null,
        ProductLineId: 0
      };

      dialog.value = true;
    };

    onMounted(() => {
      //GetMaster();
      console.error("EditROleAccess mounted");
    });

    return {
      ctx,
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
      AddNew,
      isNew,
      dialog,
      resultMsg,
      SelectInput
    };
  },
});
</script>