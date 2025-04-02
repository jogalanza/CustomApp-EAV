<template>
  <q-dialog v-model="dialog" persistent>
    <QCard class="bg-red text-white">
      <QToolbar>
          <QAvatar v-if="icon !== null" :icon="icon" text-color="white" size="60px" />
          <QSpace />
          <QBtn flat  @click="dialog = false" label="Dismiss" />
        </QToolbar>
      <QCardSection class="q-pt-none row">
        <div class="text-h6">{{ calcMsg }}</div>
      </QCardSection>
      <QCardSection v-if="calcMsg2 !== null" class="q-pt-none row">
        <QSeparator class="col-12 bg-grey q-mb-md" style="height:1px"/>
        <div style="font-size: 0.9em">{{ calcMsg2 }}</div>
      </QCardSection>
    </QCard>
  </q-dialog>
</template>

<style scoped>
</style>

<script>
import { onMounted, ref, computed } from "vue";
// import { useQuasar } from "quasar";

export default {
  name: "OfflineNotif",
  props: {
    message: {
      type: Object,
      default: () => null
    },
    msg: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const dialog = ref(false);
    const calcMsg = computed(() => {
      if (props.message && props.message.message !== undefined) return props.message.message;
      if (props.msg !== null) return props.msg;
      return "Default message here";
    })
    const calcMsg2 = computed(() => {
      if (props.message && props.message.errmsg !== undefined) return props.message.errmsg;
      return null
    })
    const Show = () => {
      dialog.value = true;
    }

    const Dismiss = () => {
      if (dialog.value) dialog.value = false;
    }
    
    onMounted(() => {
      //
    });

    return {
      dialog,
      calcMsg,
      calcMsg2,
      Show,
      Dismiss
    };
  }
};
</script>
