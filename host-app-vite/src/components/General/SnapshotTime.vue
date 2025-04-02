<template>
  <QDialog v-model="dialog">
    <QCard style="min-width: 100px">
      <QCardSection>
        <QList>
          <QItem class="q-pt-none">
            <QItemSection>
              <QItemLabel class="text-h5 text-bold"
                >Snapshot Time</QItemLabel
              >
            </QItemSection>
          </QItem>
          <QItemLabel caption class="q-pl-md">*Pacific Standard Time </QItemLabel>
          <QItem>
            <QItemSection>
              <q-time v-model="item" mask="hh:mm A" flat />
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection>
              <QBtn label="Set Snapshot Time" no-caps dense color="primary" @click="SaveItem" />
            </QItemSection>
          </QItem>
        </QList>
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { useMainStore } from "../../store";
import api  from "../api/index";
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