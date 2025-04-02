<template>
  <MultiView title="Key Focus Areas" class="comment-card" @refresh="GetMaster" @save="Save" :dirty="true" :config="config" :with-history="false" style="min-height: 0px">
    <template v-slot:default-toolbar>
      <QToolbar class="chart-toolbar">
        <QBtn v-if="withHistory" flat icon="o_history" dense @click="localSlide = 'history'" size="12px"><QTooltip>History</QTooltip></QBtn>
        <div class="card-title">
          <div>{{ title }}</div>
        </div>
        <QBtn round flat icon="o_fullscreen" dense @click="dialog = !dialog" size="12px"><QTooltip>Toggle Fullscreen View</QTooltip></QBtn>
        <QBtn v-if="dirty && !readonly" flat icon="o_save" no-wrap no-caps dense @click="InvokeSave" size="12px"><QTooltip>Save Changes</QTooltip></QBtn>
        <QBtn v-if="!readonly" flat icon="o_content_copy" dense @click="CopyPrevious" size="12px">
          <QTooltip>Copy from previous period</QTooltip>
        </QBtn>
        <QBtn flat icon="o_refresh" dense @click="GetMaster" size="12px">
          <QTooltip>{{ `${(dirty ? 'Cancel changes' : 'Refresh')}` }}</QTooltip>
          <!-- <QBadge rounded floating color="red" /> -->
        </QBtn>
        <QBtn icon="o_attach_file" flat dense size="12px">
          <QBadge v-if="files.length > 0" floating rounded align="bottom">{{ files.length }}</QBadge>
          <QPopupProxy>
            <QCard flat style="width: 380px">
              <QCardSection>
                <QList separator style="max-height: 330px; overflow: auto;">
                  <QItem class="q-pa-sm" style="padding: 8px; position: sticky; top: 0px; background: #fff; z-index: 2;">
                    <QItemSection>
                      <QItemLabel class="text-bold text-h6">Attachments</QItemLabel>
                    </QItemSection>
                    <QItemSection v-if="!readonly" side top>
                      <QBtn color="primary" no-caps size="sm" icon="o_add" label="Upload file" @click="qfile.pickFiles()" style="margin-top: 4px" :disable="readonly" unelevated>
                        <QTooltip>Upload new attachment</QTooltip>
                      </QBtn>
                    </QItemSection>
                  </QItem>
                  <QItem v-if="files.length === 0" class="q-px-sm">
                    <QItemSection>
                      <QItemLabel>No attached files</QItemLabel>
                    </QItemSection>
                  </QItem>
                  <QItem v-for="(f, i) in files" :key="i" class="q-px-sm" clickable style="padding-left: 8px; padding-right: 8px;" @click="OpenFile(f)">
                    <QItemSection avatar top>
                      <QIcon name="o_description" size="sm" />
                    </QItemSection>
                    <QItemSection>
                      <QItemLabel>{{ f.FileName }}</QItemLabel>
                      <QItemLabel caption>{{ `Uploaded by ${f.Uploader} on ${f.Timestamp}` }}</QItemLabel>
                    </QItemSection>
                    <QItemSection side>
                      <QBtn flat round size="sm" icon="o_close" @click.stop="DeleteFile(f)" />
                    </QItemSection>
                  </QItem>
                </QList>
              </QCardSection>
            </QCard>
          </QPopupProxy>
        </QBtn>
        <QBtn icon="o_more_vert" flat dense size="12px">
          <QMenu auto-close>
            <QList>
              <QItem v-for="(m, i) in extramenu" :key="i" clickable @click="m.action" dense>
                <QItemSection>{{ m.label }}</QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
        <q-file v-model="file" ref="qfile" label="Pick one file" filled style="max-width: 300px; display: none;" dense accept="*/*" />
      </QToolbar>
    </template>
    <QList class="" style="height: calc(100% - 60px)">
      <QItem v-if="resultMsg" :class="`q-px-sm q-mt-md q-mx-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense
        style="padding: 8px; overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
        <QItemSection>
          <QItemLabel class="text-white q-pa-sm">{{ resultMsg.message }}</QItemLabel>
        </QItemSection>
        <QItemSection side class="q-pa-none">
          <QBtn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
        </QItemSection>
      </QItem>
      <QItem style="padding: 8px; height: calc(100%);">
        <q-input ref="editor" class="key-focus-editor" filled v-model="item.comment" :readonly="readonly" style="min-height: 180px; width: 100%; height: 100%" type="textarea">

        </q-input>
      </QItem>

    </QList>

    <q-dialog v-model="dialog" persistent>
      <QCard class="comment-card-fs">
        <QToolbar class="chart-toolbar">
          <!-- <QBtn round flat icon="o_download" dense><QTooltip>Download</QTooltip></QBtn> -->
          <div class="card-title" style="font-size: 2em;">{{ title }}</div>
          <q-spinner v-if="loading > 0" color="white" size="30px" />
          <QBtn v-if="dirty" round flat icon="o_save" dense @click="InvokeSave"><QTooltip>Save Changes</QTooltip></QBtn>
          <QBtn round flat icon="o_refresh" dense @click="GetMaster"><QTooltip>Refresh</QTooltip></QBtn>
          <QBtn round flat icon="o_close" dense @click="dialog = !dialog"><QTooltip>Toggle Fullscreen View</QTooltip></QBtn>
        </QToolbar>
        <QList class="" style="height: calc(100% - 50px)">
          <QItem v-if="resultMsg" :class="`q-px-sm q-mt-md q-mx-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense
            style="padding: 8px; overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
            <QItemSection>
              <QItemLabel class="text-white q-pa-sm">{{ resultMsg.message }}</QItemLabel>
            </QItemSection>
            <QItemSection side class="q-pa-none">
              <QBtn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
            </QItemSection>
          </QItem>
          <QItem style="padding: 8px; height: calc(100%);">
            <q-input ref="editor2" class="key-focus-editor" filled v-model="item.comment" :readonly="readonly" style="min-height: 180px; width: 100%; height: 100%" type="textarea">
            </q-input>
          </QItem>
        </QList>
      </QCard>
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
import general from "../mixins/general";
import { useMainStore } from "../store/index";
import { useUser } from "../store/user"
import useComment from "../composables/comment";

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
      import("../components/General/MultiView.vue")
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
