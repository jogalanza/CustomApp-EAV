<template>
  <q-dialog v-model="dialog">
    <q-card style="min-width: 100px">
      <q-card-section>
        <q-list>
          <q-item class="q-pt-none">
            <q-item-section>
              <q-item-label class="text-h5 text-bold"
                >Snapshot Time</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item-label caption class="q-pl-md">*Pacific Standard Time </q-item-label>
          <q-item>
            <q-item-section>
              <q-time v-model="item" mask="hh:mm A" flat />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-btn label="Set Snapshot Time" no-caps dense color="primary" @click="SaveItem" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { useMainStore } from "../../store";
import api  from "@/api/index";
import general from "../../mixins/general";

export default defineComponent({
  name: "SnapshotTime",
  setup() {
    const mainStore = useMainStore();
    const { NotifyUser } = general();
    const dialog = ref(false);
    const item = ref(null);

    const GetMaster = () => {
      api.SnapshotTimeGet().then(response => {
        item.value = response.data;
      });
    }

    const Show = () => {
      dialog.value = true;
      GetMaster();
    };

    const SaveItem = () => {
      api.SnapshotTimeSave(item.value).then(response => {
        NotifyUser(response.data);
        if (response.data.success){          
          dialog.value = false;
        }
      })
    }

    onMounted(() => {
        //
    });

    return {
      dialog,
      item,
      mainStore,
      Show,
      SaveItem,
    };
  },
});
</script>