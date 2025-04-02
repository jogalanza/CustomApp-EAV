<template>
  <div class="about text-center">
    <QCard style="width: 450px" class="q-mx-auto q-mt-lg">
      <QCardSection>
        <div class="text-h4 q-pa-none q-mt-lg text-etc-green-1">PDCS</div>
        <div class="text-h6 q-pa-sm text-grey q-mb-lg">Plant Data Collection System</div>
        <div style="font-size: 1.2em">
          api: {{ `${apiVer.Version} (build ${apiVer.Build})` }}
        </div>
        <div style="font-size: 1.2em" class="q-mb-md">app: {{ appVer }}</div>
        <QSeparator />
        <div class="q-my-md text-grey">{{ `${apiVer.Copyright}` }}</div>
      </QCardSection>
    </QCard>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import api from "../api/index";
import { useMainStore } from "../store/index"

export default {
  setup() {
    const store = useMainStore();
    const apiVer = ref({
      Build: null,
      Version: null,
      Copyright: null,
    });

    const appVer = computed(() => process.env.VUE_APP_GIT_HASH);

    const GetApiVersion = () => {
      store.UpdateBoardTitle("About");
      api.GetApiVersion().then((response) => {
        apiVer.value = { ...response.data };
      });
    };

    onMounted(() => {
      GetApiVersion();
    });

    return {
      apiVer,
      appVer,
    };
  },
};
</script>
