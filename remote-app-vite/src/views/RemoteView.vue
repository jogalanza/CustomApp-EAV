<script setup>
import { defineAsyncComponent, ref } from 'vue';

// Reactive state for the remote component
const BoardLayout = defineAsyncComponent(() => import("../components/General/BoardLayout.vue"))
const remoteComponent = ref(null);

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

      const sharedScope = {
        default: {
          vue: {
            get: () => Promise.resolve(() => Vue),
            from: "host-app",
            eager: true,
            loaded: 1
          },
          quasar: { get: () => Promise.resolve(() => import('quasar')), from: 'host-app', eager: true, loaded: 1 }
        }
      }

      container.init(sharedScope);
      resolve(container);
    };
    script.onerror = () => reject(new Error(`Failed to load remote script: ${url}`));
    document.head.appendChild(script);
  });
};

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
    const sharedScope = {
      vue: {
        '*': {
          from: 'host-app',
          get: () => () => import('vue'),
        },
      },
      quasar: {
        '*': {
          from: 'host-app',
          get: () => () => import('quasar'),
        },
      },
    };
    await remoteModule.init(sharedScope);

    console.warn("sss", remoteModule, window["remote-app"]);
    // Get the exposed QuasarButton module
    const moduleFactory = await remoteModule.get('./Button');
    const module = await moduleFactory();

    // Set the component
    remoteComponent.value = defineAsyncComponent(() => Promise.resolve(module.default));
  } catch (error) {
    console.error('Failed to load remote module:', error);
  }
};

const loadRemote_V2 = async () => {
  try {
    //const remoteUrl = 'http://localhost:5001/assets/remoteEntry.js';
    const remoteUrl = 'https://localhost:7053/Plugins/Plugin.Default/component/dist/assets/remoteEntry.js';
    await import(/* @vite-ignore */ remoteUrl);
    console.warn(window['remote-app']);
    const module = await window['remote-app'].get('./QuasarButton');
    console.warn('module', module);
    const component = module().default;
    console.warn('component', component);
    remoteComponent.value = defineAsyncComponent(() => Promise.resolve(component));
  } catch (error) {
    console.error('Failed to load remote module:', error);
  }
};
</script>

<template>
  <BoardLayout title="Manage Credentials">
    <QCardSection  style="height:100%;overflow-y:auto">
      <h1>Host App with Quasar</h1>
      <QBtn color="secondary" label="Load Remote" @click="loadRemote" />
      <component v-if="remoteComponent" :is="remoteComponent" />
    </QCardSection>
  </BoardLayout>
  <div>

  </div>
</template>

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
