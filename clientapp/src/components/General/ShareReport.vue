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
          <q-input v-model="url" readonly filled dense>
              <template v-slot:append>
                <q-icon
                  name="r_content_copy"
                  @click="CopyToClipboard"
                  class="cursor-pointer"
                />
              </template>
            </q-input>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { inject, ref } from "vue";
import { useEmbeddables } from "../../store/embeddables";
import general from "../../mixins/general";

export default {
  name: "ShareReport",
  props: {
    title: {
      type: String,
      default: "Share Report",
    },
    page: {
      type: String,
      default: null,
    },
    index: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const GetLocaleString = inject("GetLocaleString");
    const embeddables = useEmbeddables();
    const { NotifyUser } = general();
    const dialog = ref(false);
    const url = ref(null);

    const Show = () => {
      url.value = embeddables.ShareLink(props.index);
      dialog.value = true;
    };

    const Save = () => {
      if (url.value) {
        embeddables.AddEmbedReports(url.value, props.page).then((response) => {
          NotifyUser(response);
          dialog.value = false;
        });
      }
    };

    const CopyToClipboard = () => {
      navigator.clipboard.writeText(url.value);
      NotifyUser({ success: true, message: "Text copied!" });
    };

    return {
      CopyToClipboard,
      url,
      embeddables,
      dialog,
      GetLocaleString,
      Show,
      Save,
    };
  },
};
</script>