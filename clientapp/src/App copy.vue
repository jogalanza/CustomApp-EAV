<template>
  <div id="app">
    <host-component />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import HostComponent from './components/HostComponent.vue';

export default defineComponent({
  name: 'App',
  components: {
    HostComponent
  },
  setup() {
    // No reactive state needed here, just rendering HostComponent
  }
});
</script>