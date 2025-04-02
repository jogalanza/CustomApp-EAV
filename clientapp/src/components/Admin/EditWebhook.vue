<template>
  <q-dialog
    v-model="dialog"
    persistent
    :full-height="fullView"
    :full-width="fullView"
  >
    <q-card>
      <q-toolbar class="q-py-sm">
        <div class="text-h6" style="text-overflow: inherit">
          {{
            `${
              editMode
                ? GetLocaleString("EDIT_WEBHOOK", "Edit Webhook")
                : GetLocaleString("ADD_WEBHOOK", "Add Webhook")
            }`
          }}
        </div>
        <q-space />
        <q-btn
          icon="r_close"
          flat
          round
          @click="dialog = false"
          :disable="loading"
        />
      </q-toolbar>
      <q-card-section
        class="row"
        :style="`min-height: 300px; max-height: ${
          fullView ? 'calc(100% - 60px)' : '600px'
        }; overflow-y: auto`"
      >
        <div class="col-12 q-mb-md">
          <q-list class="full-width">
            <q-item class="q-px-none">
              <q-item-section>
                <q-input
                  v-model="item.Url"
                  filled
                  dense
                  hide-bottom-space
                  hide-hint
                  clearable
                  :label="GetLocaleString('PAYLOAD_URL', 'Payload URL')"
                />
              </q-item-section>
            </q-item>
            <q-item class="q-px-none">
              <q-item-section>
                <q-item-label>Events</q-item-label>
              </q-item-section>
            </q-item>
            <q-item class="q-px-none">
              <q-item-section
                class="row"
              >
                <div class="row">
                  <div class="col-12 col-md-6 q-pa-sm" v-for="(m, i) in events" :key="i">
                    <q-card>
                      <q-card-section>
                        <q-list>
                          <q-item class="q-pa-none">
                            <q-item-section avatar style="min-width:32px">
                              <q-checkbox
                                v-model="selectedEvents"
                                :val="m.value"
                                filled
                                dense
                                hide-bottom-space
                                hide-hint
                              />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ GetLocaleString(m.langkey, m.label) }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </q-item-section>
            </q-item>
            <q-item class="q-px-none">
              <q-item-section>
                <q-toggle
                  v-model="item.Active"
                  filled
                  dense
                  :true-value="true"
                  :false-value="false"
                  :label="GetLocaleString('ACTIVE', 'Active')"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <!-- <q-btn flat label="Add More" @click="AddRow" /> -->
        </div>
        <div class="col-12 q-my-md">
          <q-btn
            class="full-width"
            :label="GetLocaleString('SAVE', 'Save')"
            size="md"
            color="green"
            :loading="loading"
            :disable="loading"
            @click="Save"
          ></q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
</style>

<script>
import { ref, inject, onMounted, onBeforeUnmount, computed } from "vue";
import api from "../../api/index";
import { useUser } from "../../store/user"
import general from "../../mixins/general";
import { useQuasar } from "quasar";

export default {
  name: "EditWebhook",
  components: {},
  emits: ["refresh"],
  setup(props, context) {
    const q = useQuasar();
    const user = useUser();
    const dialog = ref(false);
    const { NotifyUser } = general();
    const errmsg = ref(null);
    const loading = ref(false);
    const editMode = ref(true);
    const item = ref({
      ID: 0,
      Url: null,
      Events: null,
      Active: true
    });
    const events = ref([]);
    const selectedEvents = ref([]);

    const fullView = computed(() => q.screen.width < 580);

    const GetLocaleString = inject("GetLocaleString");

    const Edit = (data) => {
      selectedEvents.value = [];
      editMode.value = true;
      dialog.value = true;
      item.value = {...data}
      if (data.Events !== null && data.Events !== ""){
        selectedEvents.value  = [...data.Events.split(";")];
      }
    };

    const Add = () => {
      selectedEvents.value = [];
      editMode.value = false;
      item.value.ID = 0;
      item.value.Url = null;
      item.value.Events = null;
      dialog.value = true;
    };

    const GetEvents = () => {
      api.Webhooks_GetAllEvents().then(response => {
        events.value = [...response.data];
      })
    }

    const Save = () => {
      if (selectedEvents.value.length > 0){
        item.value.Events = selectedEvents.value.join(";");
      }else{
        item.value.Events = null;
      }

      if (!editMode.value){
        item.value.UserId = user.ActiveUser.EmployeeID;
      }

      loading.value = true;
      api.Webhooks_Save(item.value).then(response => {
        loading.value = false;
        NotifyUser(response.data);
        if (response.data.success){
          dialog.value = false;
          context.emit("refresh");
        }
      }).catch(() => {
        loading.value = false;
      });
    }

    onMounted(() => {
      GetEvents();
    });

    onBeforeUnmount(() => {
      //document.removeEventListener("keydown", KeyHandler);
    });

    return {
      fullView,
      editMode,
      errmsg,
      loading,
      dialog,
      GetLocaleString,
      Edit,
      Add,
      events,
      item,
      selectedEvents,
      Save
    };
  },
};
</script>
