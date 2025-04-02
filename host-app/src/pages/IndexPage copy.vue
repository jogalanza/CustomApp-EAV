<template>
  <q-page class="flex flex-center">
    <h1>Host App</h1>
    <Suspense>
      <template #default>
        <RemoteComponent />
      </template>
      <template #fallback>
        <div>Loading remote component...</div>
      </template>
    </Suspense>
  </q-page>
</template>

<script setup>
import { defineAsyncComponent } from "vue";

// Dynamically import the remote component
const RemoteComponent = defineAsyncComponent(() =>
  import("remoteApp/RemoteComponent.vue")
);
</script>
