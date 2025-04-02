<template>
  <BoardLayout title="Manage Credentials" :loading="loading">
    <q-card-section v-if="showUI" style="height:100%;overflow-y:auto">
      <q-list>
        <q-item>
          <q-item-section>Use Light Theme</q-item-section>
          <q-item-section side>
            <q-toggle v-model="useLightTheme" color="green" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </BoardLayout>
</template>

<style scoped></style>

<script>
import { defineAsyncComponent, onMounted, ref, reactive, computed, watch } from "vue";

import { useQuasar } from "quasar";
//import api from "../api/index"
//import general from "../mixins/general"
// import { useQuasar } from "quasar";

export default {
  name: "Preferences",
  components: {
    BoardLayout: defineAsyncComponent(() =>
      import("../components/General/BoardLayout.vue")
    ),
  },
  setup() {
    const q = useQuasar();
    //const { NotifyUser } = general();
    const useLightTheme = ref(false);
    const maxPage = ref(1);
    const dataOptions = ref({
      search: null,
      productStatus: 1,
      site: null,
      currentPage: 1,
      rowsPerPage: 10,
    });

    const passwords = reactive({
      current: null,
      newPW: null,
      confirmNew: null,
    });

    const loading = ref(false);
    const showUI = ref(false);

    const qr = ref(null);
    const qrErrMsg = ref(null);

    const accessKey = ref(null);

    watch(useLightTheme, () => {
      window.localStorage.setItem("pdcs_theme", useLightTheme.value ? "1" : "0");
      q.dark.set(!useLightTheme.value);
    });

    //

    const qrImage = computed(() => {
      if (qr.value !== null){
        return `data:image/png;base64,${qr.value}`;
      }
      return null;
    });

    const GetTheme = () => {
      var x = window.localStorage.getItem("pdcs_theme");
      useLightTheme.value = x === "1";
    }


    const GetMaster = () => {};


    onMounted(() => {
      setTimeout(() => {
        showUI.value = true;
      }, 200);
      GetTheme();
    });

    return {
      useLightTheme,
      showUI,
      loading,
      qrImage,
      qr,
      qrErrMsg,
      accessKey,
      passwords,
      maxPage,
      dataOptions,
      GetMaster,
    };
  },
};
</script>
