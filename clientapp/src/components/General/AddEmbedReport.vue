<template>
  <q-dialog v-model="dialog">
    <q-card>
      <q-toolbar>
        <q-toolbar-title class="clip">{{ title }}</q-toolbar-title>
        <q-space />
        <q-btn flat round icon="r_close" @click="dialog = false"></q-btn>
      </q-toolbar>
      <q-card-section class="row">
        <div class="col-12">
          <q-input v-model="url" filled dense :label="GetLocaleString('REPORT_URL', 'Report URL')"> </q-input>
        </div>
        <div class="col-12">
          <q-checkbox v-model="isPublic" filled dense :label="GetLocaleString('IS_PUBLIC', 'Visible to all users')"> </q-checkbox>
        </div>
      </q-card-section>
      <q-card-actions class="q-px-md">
        <q-btn
          :label="GetLocaleString('SAVE', 'Save')"
          color="green"
          @click="Save"
          class="full-width"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { inject, ref } from "vue";
import { useEmbeddables } from "../../store/embeddables";
import general from "../../mixins/general";

export default {
  name: "AddEmbedReport",
  props: {
    title: {
      type: String,
      default: "Embed Report",
    },
    page: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const GetLocaleString = inject("GetLocaleString");
    const embeddables = useEmbeddables();
    const { NotifyUser } = general();
    const dialog = ref(false);
    const url = ref(null);
    const isPublic = ref(true);

    const Show = () => {
      url.value = null;
      dialog.value = true;
    };

    const Save = () => {
      if (url.value) {
        embeddables.AddEmbedReports(url.value, props.page, isPublic.value).then((response) => {
          NotifyUser(response);
          dialog.value = false;
        });
      }
    };

    return {
      url,
      embeddables,
      dialog,
      GetLocaleString,
      isPublic,
      Show,
      Save,
    };
  },
};
</script>