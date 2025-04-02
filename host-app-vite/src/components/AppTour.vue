<template>
  <q-dialog v-model="dialog">
    <QCard class="app-tour">
      <QCardSection class="header">
        <div class="text-h5">{{ title }}</div>
      </QCardSection>
      <QCardSection class="content">
        <div>{{ message }}</div>
      </QCardSection>
      <QCard-actions class="footer row justify-between">
        <q-checkbox v-model="donotShow" label="Do not show this again" color="info" class="text-grey" dense />
        <div class="row justify-end">
          <QBtn label="No, thanks" flat no-caps @click="CancelTour" />
          <QBtn
            label="OK, let start!"
            color="info"
            @click="Start"
            no-caps
            class="q-ml-md"
            unelevated
          />
        </div>
      </QCard-actions>
    </QCard>
  </q-dialog>
</template>

<style lang="scss">
.app-tour{
    max-width: 500px;
    width: 100%;
    min-width: 0px;

    .header, .content, .footer{
        background: #31ccec;
        color: white;
    }

    .content{
        padding-bottom: 48px;
    }
}
</style>

<script>
import { defineComponent, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { noTours } from "../composables/appTour";
import { useMainStore } from "../store";

export default defineComponent({
  name: "AppTour",
  props: {
    title: {
        type: String,
        default: "Getting Started"
    },
    message: {
        type: String,
        default: "Take a quick guided tour to get familiar with XMAP"
    }
  },
  emits: ["start"],
  setup(props, ctx) {
    const mainStore = useMainStore();
    const q = useQuasar();
    const dialog = ref(false);
    const donotShow = ref(false);

    watch(
      () => donotShow.value,
      () => {
        NoTour();
      }
    );

    const NoTour = () => {
        noTours(q, donotShow.value);
    };

    const Start = () => {
      dialog.value = false;
      ctx.emit("start");
    };

    const Show = () => {
      // dialog.value = true;
      // var d = q.cookies.get("xmap_notours");
      // donotShow.value = d ? true : false;
    };

    const CancelTour = () => {
        mainStore.SetAdHocTour(false);
        dialog.value = false;
    }
    return {
      q,
      dialog,
      donotShow,
      ctx,
      Show,
      Start,
      CancelTour,
    };
  },
});
</script>
