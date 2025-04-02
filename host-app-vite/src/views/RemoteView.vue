
<template>
  <BoardLayout title="Manage Credentials">
    <QCardSection style="height:100%;overflow-y:auto">
      <h1>Host App with Quasar</h1>
      <QBtn color="secondary" label="Load Remote" @click="loadRemote" />
      <Suspense>
        <template #default>
          <component :is="remoteComponent" :key="renderKey" />
        </template>
        <template #fallback>
          Loading
        </template>
      </Suspense>
      
    </QCardSection>
  </BoardLayout>
  <div>

  </div>
</template>

<script setup>
import { defineAsyncComponent, ref, onMounted } from 'vue';

defineProps({
  title: String
})

// Reactive state for the remote component
const BoardLayout = defineAsyncComponent(() => import("../components/General/BoardLayout.vue"))
const remoteComponent = ref(null);
const renderKey = ref(1);


const loadRemoteScript = (url, scope) => {
  return new Promise((resolve, reject) => {
    if (window[scope]) {
      resolve(window[scope]);
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => {
      const container = window[scope];

      if (!container || typeof container.get !== 'function') {
        reject(new Error(`${container}: remote container not initialized`));
        return;
      }

      container.init(GetSharedScope());
      resolve(container);
    };
    script.onerror = () => reject(new Error(`Failed to load remote script: ${url}`));
    document.head.appendChild(script);
  });
};

const GetSharedScope = () => {
  return {
    default: {
      vue: {
        get: () => Promise.resolve(() => import('vue')),
        from: "host-app",
        eager: true,
        loaded: 1
      },
      quasar: { get: () => Promise.resolve(() => import('quasar')), from: 'host-app', eager: true, loaded: 1 }
    }
  }
}

// Method to load the remote module dynamically
const loadRemote = async () => {
  try {
    // Dynamically load the remoteEntry.js script
    const remoteUrl = 'https://localhost:7053/Plugins/Plugin.Default/component/dist/assets/remoteEntry.js';
    const script = document.createElement('script');
    script.src = remoteUrl;
    script.type = 'module';

    // Wait for the script to load
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${remoteUrl}`));
      document.head.appendChild(script);
    });

    // Since remoteEntry.js is an ES module, we need to import it dynamically
    const remoteModule = await import(/* @vite-ignore */ remoteUrl);

    // Initialize the remote module with shared scope   
    await remoteModule.init(GetSharedScope());

    console.warn("sss", remoteModule, window["remote-app"]);
    // Get the exposed QuasarButton module
    const moduleFactory = await remoteModule.get('./Button');
    const module = await moduleFactory();

    console.warn("remote comp", module);

    // Set the component
    remoteComponent.value = defineAsyncComponent(() => Promise.resolve(module));

  } catch (error) {
    console.error('Failed to load remote module:', error);
  }
};

onMounted(async() => {
  await loadRemote();
})

</script>


<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
