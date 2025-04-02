<template>
  <q-page class="flex flex-center">
    <h1>Host App</h1>
    <Suspense>
      <template #default>
        <component :is="RemoteComponent" v-if="RemoteComponent" />
      </template>
      <template #fallback>
        <div>Loading remote component...</div>
      </template>
    </Suspense>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";

const RemoteComponent = ref(null);

onMounted(async () => {
  try {
    // Dynamically load the remoteEntry.js script
    //const remoteUrl = "https://localhost:7053/Plugins/Plugin.Default/component/dist/remoteEntry.js";
    const remoteUrl = "http://localhost:9000/remoteEntry.js";
    await loadRemoteScript(remoteUrl);

    // Initialize the remote module
    // eslint-disable-next-line
    const remoteModule = await __webpack_init_sharing__("default");
    const container = window.remoteApp; // Matches the 'name' in remote app’s config
    console.warn("conrabner", container)
    // eslint-disable-next-line
    await container.init(__webpack_share_scopes__.default);

    console.warn("conrabner 2", container)

    window.remoteApp.get('./RemoteComponent').then(factory => {
      console.warn('asda')
      const module = factory();
      console.log('sdasd', module);
    });


    // Get the factory for the exposed component
    const factory = await container.get("./RemoteComponent");

    console.warn("conrabner 3", factory())

    const module = factory();

    console.warn("conrabner 4", module)

    // Set the component
    RemoteComponent.value = module.default || module;
  } catch (error) {
    console.error("Failed to load remote component:", error);
  }
});

// function executeRemoteAppScript(scriptText) {
//   (function () {
//     "use strict";
//     var remoteApp;
//     eval(scriptText); // Execute the script safely in scope
//     window.remoteApp = remoteApp; // Assign the result to global scope
//   })();
// }

// Function to load the remote script dynamically
async function loadRemoteScript(url) {

  // await fetch(url)
  //   .then(response => response.text())
  //   .then(scriptText => {
  //     scriptText += "\nwindow.remoteApp = remoteApp;";
  //     eval(scriptText);
  //     console.log("window.remoteApp:", window.remoteApp);
  //   })
  //   // .then(scriptText => executeRemoteAppScript(scriptText))
  //   .then(() => console.log("window.remoteApp is now available:", window.remoteApp))
  //   .catch(error => console.error("Script execution failed:", error));


  // // Fetch the script text
  // const response = await fetch(url);
  // if (!response.ok) {
  //   throw new Error(`Failed to fetch script: ${response.statusText}`);
  // }

  // var scriptText = await response.text();

  // eval(scriptText);

  // // Ensure that window.remoteApp is set correctly
  // if (typeof window.remoteApp === "undefined") {
  //   console.error("window.remoteApp is not defined after script execution.");
  // } else {
  //   console.log("window.remoteApp successfully set.");
  // }

  // scriptText = scriptText.replace(/\)\(\),\s*window\.remoteApp\s*=\s*remoteApp;/, ')()');
  // scriptText = scriptText.replace(/\bremoteApp\s*=\s*r\b/, 'window.remoteApp = r');

  // // Create a function to evaluate the script in a controlled scope
  // const scriptFn = new Function(`
  //   ${scriptText}
  //   console.warn(window.remoteApp);
  //   return window.remoteApp;
  // `);

  // console.log("scriptText", scriptFn);

  // // Execute the script and capture the container
  // const container = scriptFn();
  // console.log("Captured container:", container);
  // return container;


  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    //script.type = "module"; // Ensure ES Module support
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}
</script>
