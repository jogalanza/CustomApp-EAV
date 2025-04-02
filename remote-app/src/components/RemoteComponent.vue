<template>
  <q-card class="my-card">
    <q-toolbar>
      title
    </q-toolbar>
    <q-card-section>
      <div class="text-h6">Hello from Remote App 2!</div>
      <q-btn color="primary" label="Click Me" style="width: 50px; height: 30px;" />
      <!-- <div>Count: {{ count }}</div> -->
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'RemoteComponent',
};
</script>

<style scoped>
.my-card {
  width: 300px;
  margin: 20px;
}
</style>
