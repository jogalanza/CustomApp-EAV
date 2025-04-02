<template>
  <EditDialog class="batch-clocking" :dialog="dialog" @ondialog="dialog = $event" action-style="height: 70px" content-style="height: calc(100% - 120px);">
    <template v-slot:header>
      <q-linear-progress v-if="loading || loading_mac || loading_act" indeterminate />
      <q-toolbar class="q-pr-none">
        <div class="text-h6" style="text-overflow: inherit">
          Edit Training
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

      <q-item class="q-px-none1">
        <q-item-section>
          <q-item-label>
            <q-input filled v-model="item.Title" label="Title" @focus="SelectInput" autofocus />
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item class="q-px-none1">
        <q-item-section>
          <q-item-label>
            <q-input filled v-model="item.Description" label="Description" @focus="SelectInput" />
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item-label class="text-bold q-mt-md q-px-md">Document</q-item-label>
      <q-item v-if="!doc" class="q-px-none1">
        <q-item-section>
          <q-item-label>
            <q-btn color="primary" no-caps label="Attach file" icon="o_add" @click="qfile.pickFiles()" class="full-width">
              <q-tooltip>Upload File</q-tooltip>
            </q-btn>
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="doc" class="q-px-none1" clickable>
        <q-item-section avatar>
          <q-icon name="o_source" size="md" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-bold">{{ doc.FileName }}</q-item-label>
          <q-item-label caption>{{ doc.FileType }}</q-item-label>
          <q-item-label caption>{{ `Uploaded by ${doc.Uploader} on ${doc.Timestamp}` }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn color="primary" flat round size="sm" icon="o_close" @click.stop="DeleteDoc">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
      <q-separator />
      <q-item-label class="text-bold q-mt-md q-px-md">Banner</q-item-label>
      <q-item v-if="!banner" class="q-px-none1">
        <q-item-section>
          <q-item-label>
            <q-btn color="primary" no-caps label="Pick a banner image" icon="o_add" @click="qfile2.pickFiles()" class="full-width">
              <q-tooltip>Upload banner image</q-tooltip>
            </q-btn>
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="banner" class="q-px-none1">
        <q-item-section avatar>
          <q-img :src="server.defaults.baseURL + 'api/file/get/image/' + banner.Uuid" class="no-photo" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-bold">{{ banner.FileName }}</q-item-label>
          <q-item-label caption>{{ banner.FileType }}</q-item-label>
          <q-item-label caption>{{ `Uploaded by ${banner.Uploader} on ${banner.Timestamp}` }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn color="primary" flat round size="sm" icon="o_close" @click.stop="DeleteBanner">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>


      <q-file v-model="file" ref="qfile" label="Pick one file" filled style="max-width: 300px; display: none;" dense accept=".pdf" />
      <q-file v-model="file2" ref="qfile2" label="Pick one file" filled style="max-width: 300px; display: none;" dense accept="image/*" />
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
  watch
} from "vue";
import general from "@/mixins/general";
import api from "@/api/training";
import apiFile from "@/api/file";
import server from "@/server";
import { useMainStore } from "../../store";
import { useUser } from "../../store/user";
import { useOptions } from "../../store/options";
import { useHelper } from "@/composables/helper";

export default defineComponent({
  name: "EditSite",
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
    const { NotifyUser, ConfirmAction } = general();
    const loading = ref(false);
    const item = ref({});
    const isNew = ref(false);
    const dialog = ref(false);
    const resultMsg = ref(null);

    const file = ref(null);
    const file2 = ref(null);
    const qfile = ref(null);
    const qfile2 = ref(null);

    const doc = ref(null);
    const banner = ref(null);

    watch(file, (newVal) => {
      if (newVal) {
        SubmitFile();
      }
    });

    watch(file2, (newVal) => {
      if (newVal) {
        SubmitFile2();
      }
    });

    const SubmitFile = () => {
      try {
        let formData = new FormData()
        formData.append('file', file.value)
        formData.append('session', JSON.stringify(mainStore.SessionOptions));
        formData.append('category', "TRAINING_DOCUMENT");

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: function (progressEvent) {
            var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(percentCompleted);
          }
        }

        setTimeout(() => {
          file.value = null;
        }, 1000);

        apiFile.Upload(formData, config).then(response => {
          if (response.data.success) {
            item.value.FileID = response.data.payload.UUID;
            GetDocInfo();
          }

        }).catch(() => {
          //
        });


      }
      catch {
        //
      }
    }

    const SubmitFile2 = () => {
      try {
        let formData = new FormData()
        formData.append('file', file2.value)
        formData.append('session', JSON.stringify(mainStore.SessionOptions));
        formData.append('category', "TRAINING_BANNER");

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: function (progressEvent) {
            var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(percentCompleted);
          }
        }

        setTimeout(() => {
          file2.value = null;
        }, 1000);

        apiFile.Upload(formData, config).then(response => {
          if (response.data.success) {
            item.value.BannerImageID = response.data.payload.UUID;
            GetBannerInfo();
          }

        }).catch(() => {
          //
        });


      }
      catch {
        //
      }
    }

    const GetDocInfo = () => {
      if (item.value.FileID) {
        apiFile.GetFileInfo(item.value.FileID).then(response => {
          doc.value = { ...response.data };
        });
      }

    }

    const DeleteDoc = () => {
      ConfirmAction("Are you sure you want to delete this document?", () => {
        apiFile.DeleteFile(item.value.FileID).then(response => {
          if (response.data.success) {
            item.value.FileID = null;
            doc.value = null;
          }
        })
      });
    }

    const DeleteBanner = () => {
      ConfirmAction("Are you sure you want to delete this image?", () => {
        apiFile.DeleteFile(item.value.BannerImageID).then(response => {
          if (response.data.success) {
            item.value.BannerImageID = null;
            banner.value = null;
          }
        })
      });
    }

    const GetBannerInfo = () => {
      if (item.value.BannerImageID) {
        apiFile.GetFileInfo(item.value.BannerImageID).then(response => {
          banner.value = { ...response.data };
        });
      }
    }

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
          } else {
            resultMsg.value = response.data;
          }
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const Edit = (data) => {
      doc.value = null;
      banner.value = null;
      isNew.value = false;
      item.value = { ...data };
      dialog.value = true;

      GetDocInfo();
      GetBannerInfo();
    };

    const AddNew = () => {
      doc.value = null;
      banner.value = null;
      isNew.value = true;
      item.value = {
        Title: null,
        Description: null,
        FileID: null,
        BannerImageID: null
      };

      dialog.value = true;
    };

    onMounted(() => {
      //GetMaster();
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
      SelectInput,
      qfile,
      qfile2,
      file,
      file2,
      doc,
      banner,
      DeleteDoc,
      DeleteBanner
    };
  },
});
</script>