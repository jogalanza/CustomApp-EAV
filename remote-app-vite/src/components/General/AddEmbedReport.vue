<template>
  <q-dialog v-model="dialog">
    <QCard>
      <QToolbar>
        <QToolbarTitle class="clip">{{ title }}</QToolbarTitle>
        <QSpace />
        <QBtn flat round icon="r_close" @click="dialog = false"></QBtn>
      </QToolbar>
      <QCardSection class="row">
        <div class="col-12">
          <QInput v-model="url" filled dense :label="GetLocaleString('REPORT_URL', 'Report URL')"> </QInput>
        </div>
        <div class="col-12">
          <q-checkbox v-model="isPublic" filled dense :label="GetLocaleString('IS_PUBLIC', 'Visible to all users')"> </q-checkbox>
        </div>
      </QCardSection>
      <QCard-actions class="q-px-md">
        <QBtn
          :label="GetLocaleString('SAVE', 'Save')"
          color="green"
          @click="Save"
          class="full-width"
        />
      </QCard-actions>
    </QCard>
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