<template>
  <div class="unauthorized column flex-center no-wrap" style="height:100%">
    <div class="text-h4">{{ GetLocaleString("UNAUTH_ACCESS", "Unauthorized Access") }}</div>
    <div>{{ GetLocaleString("NO_PERMISSION_TO_VIEW", "You do not have permission to view this section.") }}</div>
    <div class="text-bold">Redirecting in {{ counter }} seconds...</div>
  </div>
</template>

<script>
import { inject, onBeforeUnmount, onMounted, ref } from '@vue/runtime-core';
import { useMainStore } from "../store/index"
import general from '../mixins/general';
export default {
  setup() {
    const mainStore = useMainStore();
    const GetLocaleString = inject("GetLocaleString");
    const { navigateTo } = general();
    const counter = ref(5);
    const interval = ref(null);

    const Decrement = () => {
      counter.value = counter.value - 1;
      if (counter.value <= 0){
        navigateTo({name: "Home"});
      }
    }

    onMounted(() => {
      // mainStore.UpdateBoardTitle(null);
      // interval.value = setInterval(() => {
      //   Decrement();
      // }, 1000);
    });

    onBeforeUnmount(() => {
      clearInterval(interval.value);
    })

    return {
      mainStore,
      Decrement,
      GetLocaleString,
      counter
    }
  },
}
</script>
