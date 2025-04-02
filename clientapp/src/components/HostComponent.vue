<template>
  <div>
    <q-btn label="Load component" @click="LoadComponent">Main App Host Component</q-btn>
    <Suspense>
      <template #default>
        <component :is="remoteComponent" v-if="remoteComponent" />
      </template>
      <template #fallback>
        <p>Loading remote component...</p>
      </template>
    </Suspense>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, nextTick } from 'vue';
import Vue from 'vue';

export default defineComponent({
  name: 'HostComponent',
  setup() {
    const remoteComponent = ref(null);

    // Function to load remote module
    const loadRemote = (url, scope) => {
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
                from: "hostApp",
                eager: true,
                loaded: 1
              },
              quasar: { get: () => Promise.resolve(() => import('quasar')), from: 'hostApp', eager: true, loaded: 1 }
            }
          }

          container.init(sharedScope);
          resolve(container);
        };
        script.onerror = () => reject(new Error(`Failed to load remote script: ${url}`));
        document.head.appendChild(script);
      });
    };

    const LoadComponent = async () => {
      //const remoteUrl = "http://localhost:8082/Plugins/Plugin.Default/component/dist/remoteEntry.js";
      const remoteUrl = "http://localhost:9000/remoteEntry.js";
      const scope = 'remoteApp'; // Matches ModuleFederationPlugin 'name'

      const container = await loadRemote(remoteUrl, scope);
      const moduleFactory = await container.get('./RemoteComponent'); //await container.get('./CustomControl');
      const module = moduleFactory();
      remoteComponent.value = module.default || module;
    }

    // Load remote component on mount
    onMounted(() => {
      try {
        nextTick(async () => {
          //test


          // const response = await fetch('/api/widgets');
          // const widgets = await response.json();
          // const remoteWidget = widgets.find(w => w.Name === 'sample-remote-component');
          // if (remoteWidget) {
          //   const module = await loadRemote(remoteWidget.RemoteUrl);
          //   remoteComponent.value = module.RemoteComponent;
          // }
        });

      } catch (error) {
        console.error('Failed to load remote component:', error);
      }
    });

    return {
      remoteComponent,
      LoadComponent
    };
  }
});
</script>