<template>
  <MultiView title="Key Focus Areas" class="comment-card" @refresh="GetMaster" @save="Save" :dirty="true" :config="config" :with-history="false" style="min-height: 0px">
    <template v-slot:default-toolbar>
      <q-toolbar class="chart-toolbar">
        <q-btn v-if="withHistory" flat icon="o_history" dense @click="localSlide = 'history'" size="12px"><q-tooltip>History</q-tooltip></q-btn>
        <div class="card-title">
          <div>{{ title }}</div>
        </div>
        <q-btn round flat icon="o_fullscreen" dense @click="dialog = !dialog" size="12px"><q-tooltip>Toggle Fullscreen View</q-tooltip></q-btn>
        <q-btn v-if="dirty && !readonly" flat icon="o_save" no-wrap no-caps dense @click="InvokeSave" size="12px"><q-tooltip>Save Changes</q-tooltip></q-btn>
        <q-btn v-if="!readonly" flat icon="o_content_copy" dense @click="CopyPrevious" size="12px">
          <q-tooltip>Copy from previous period</q-tooltip>
        </q-btn>
        <q-btn flat icon="o_refresh" dense @click="GetMaster" size="12px">
          <q-tooltip>{{ `${(dirty ? 'Cancel changes' : 'Refresh')}` }}</q-tooltip>
          <!-- <q-badge rounded floating color="red" /> -->
        </q-btn>
        <q-btn icon="o_attach_file" flat dense size="12px">
          <q-badge v-if="files.length > 0" floating rounded align="bottom">{{ files.length }}</q-badge>
          <q-popup-proxy>
            <q-card flat style="width: 380px">
              <q-card-section>
                <q-list separator style="max-height: 330px; overflow: auto;">
                  <q-item class="q-pa-sm" style="padding: 8px; position: sticky; top: 0px; background: #fff; z-index: 2;">
                    <q-item-section>
                      <q-item-label class="text-bold text-h6">Attachments</q-item-label>
                    </q-item-section>
                    <q-item-section v-if="!readonly" side top>
                      <q-btn color="primary" no-caps size="sm" icon="o_add" label="Upload file" @click="qfile.pickFiles()" style="margin-top: 4px" :disable="readonly" unelevated>
                        <q-tooltip>Upload new attachment</q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="files.length === 0" class="q-px-sm">
                    <q-item-section>
                      <q-item-label>No attached files</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-for="(f, i) in files" :key="i" class="q-px-sm" clickable style="padding-left: 8px; padding-right: 8px;" @click="OpenFile(f)">
                    <q-item-section avatar top>
                      <q-icon name="o_description" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ f.FileName }}</q-item-label>
                      <q-item-label caption>{{ `Uploaded by ${f.Uploader} on ${f.Timestamp}` }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat round size="sm" icon="o_close" @click.stop="DeleteFile(f)" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>
        <q-btn icon="o_more_vert" flat dense size="12px">
          <q-menu auto-close>
            <q-list>
              <q-item v-for="(m, i) in extramenu" :key="i" clickable @click="m.action" dense>
                <q-item-section>{{ m.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-file v-model="file" ref="qfile" label="Pick one file" filled style="max-width: 300px; display: none;" dense accept="*/*" />
      </q-toolbar>
    </template>
    <q-list class="" style="height: calc(100% - 60px)">
      <q-item v-if="resultMsg" :class="`q-px-sm q-mt-md q-mx-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense
        style="padding: 8px; overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
        <q-item-section>
          <q-item-label class="text-white q-pa-sm">{{ resultMsg.message }}</q-item-label>
        </q-item-section>
        <q-item-section side class="q-pa-none">
          <q-btn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
        </q-item-section>
      </q-item>
      <q-item style="padding: 8px; height: calc(100%);">
        <q-input ref="editor" class="key-focus-editor" filled v-model="item.comment" :readonly="readonly" style="min-height: 180px; width: 100%; height: 100%" type="textarea">

        </q-input>
      </q-item>

    </q-list>

    <q-dialog v-model="dialog" persistent>
      <q-card class="comment-card-fs">
        <q-toolbar class="chart-toolbar">
          <!-- <q-btn round flat icon="o_download" dense><q-tooltip>Download</q-tooltip></q-btn> -->
          <div class="card-title" style="font-size: 2em;">{{ title }}</div>
          <q-spinner v-if="loading > 0" color="white" size="30px" />
          <q-btn v-if="dirty" round flat icon="o_save" dense @click="InvokeSave"><q-tooltip>Save Changes</q-tooltip></q-btn>
          <q-btn round flat icon="o_refresh" dense @click="GetMaster"><q-tooltip>Refresh</q-tooltip></q-btn>
          <q-btn round flat icon="o_close" dense @click="dialog = !dialog"><q-tooltip>Toggle Fullscreen View</q-tooltip></q-btn>
        </q-toolbar>
        <q-list class="" style="height: calc(100% - 50px)">
          <q-item v-if="resultMsg" :class="`q-px-sm q-mt-md q-mx-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense
            style="padding: 8px; overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
            <q-item-section>
              <q-item-label class="text-white q-pa-sm">{{ resultMsg.message }}</q-item-label>
            </q-item-section>
            <q-item-section side class="q-pa-none">
              <q-btn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
            </q-item-section>
          </q-item>
          <q-item style="padding: 8px; height: calc(100%);">
            <q-input ref="editor2" class="key-focus-editor" filled v-model="item.comment" :readonly="readonly" style="min-height: 180px; width: 100%; height: 100%" type="textarea">
            </q-input>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </MultiView>
</template>

<style lang="scss">
.comment-card {
  .multiview-card {
    min-height: 0px;
    height: 100%;

    .key-focus-editor {
      .q-field__control {
        height: 100%;
        padding-right: 4px;
      }
    }
  }
}

.comment-card-fs {
  max-width: 95vw !important;
  width: 90vw;
  height: 90vh;

  textarea {
    font-size: 1.4em;
    line-height: 1.5em !important;
  }

  .key-focus-editor {
    .q-field__control {
      height: 100%;
      padding-right: 0px;
    }


  }
}
</style>

<script>
import { computed, defineAsyncComponent, defineComponent, inject, onMounted, ref, watch } from "vue";
import general from "@/mixins/general";
import { useMainStore } from "@/store/index";
import { useUser } from "@/store/user"
import useComment from "@/composables/comment";

export default defineComponent({
  name: "CommentCard",
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      default: null
    },
    category: {
      type: String,
      default: ""
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  components: {
    MultiView: defineAsyncComponent(() =>
      import("@/components/General/MultiView.vue")
    ),
  },
  setup(props) {
    const {
      dirty,
      files,
      item,
      GetMaster,
      CopyPrevious,
      InvokeSave,
      OpenFile,
      GetFiles,
      DeleteFile,
      ShowEditHistory,
      SetCategory,
      SetItem,
      SubmitFile
    } = useComment(props.category, props.title);
    const mainStore = useMainStore();
    const { NotifyUser } = general();
    const resultMsg = ref(null);
    const user = useUser();
    const editMode = ref(false);
    const editor = ref(null);
    const dialog = ref(false);

    const file = ref(null);
    const qfile = ref(null);

    const CalcReadOnly = inject("CalcReadOnly");

    const extramenu = computed(() => {
      return [
        {
          label: "Show Edit History",
          action: ShowEditHistory
        }
      ];
    });


    watch(() => mainStore.SessionOptions, () => {
      GetMaster();
    }, { deep: true });

    watch(file, (newVal) => {
      if (newVal) {
        SubmitFile(file.value);
        setTimeout(() => {
          file.value = null;
        }, 800);
      }
    });

    const HandleBlankValue = (key) => {
      if (item.value[key] === undefined || item.value[key] === null || item.value[key] === '') {
        item.value[key] = 0;
      }
    }

    onMounted(() => {
      SetCategory(props.category);
      GetMaster();
    })

    return {
      qfile,
      file,
      user,
      mainStore,
      history,
      resultMsg,
      NotifyUser,
      editMode,
      editor,
      CalcReadOnly,
      extramenu,
      dialog,
      HandleBlankValue,
      dirty,
      files,
      item,
      GetMaster,
      CopyPrevious,
      InvokeSave,
      OpenFile,
      GetFiles,
      DeleteFile,
      ShowEditHistory,
      SetCategory,
      SetItem,
      SubmitFile
    };
  },
});
</script>
