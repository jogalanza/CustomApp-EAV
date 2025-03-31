import { createApp } from 'vue'
import App from './App.vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'

createApp(App).use(Quasar, quasarUserOptions).mount('#app')


// // Always export a factory function for Module Federation
// const createAppFactory = () => {
//     console.log('createAppFactory called');
//     return createApp(App);
//   };

// // Check if running standalone (not as a Module Federation remote)
// // Use a reliable browser context check
// const isStandalone = typeof window !== 'undefined' && document && !window.__MODULE_FEDERATION_MODE__;

// // If standalone, mount the app
// if (isStandalone) {
//     const app = createAppFactory();
//     app.mount('#app');
//     console.log('Running standalone, mounted to #app');
//   } else {
//     console.log('Running as Module Federation remote');
//   }
  
//   // Export the factory function consistently
//   console.log('Exporting createAppFactory:', createAppFactory);
//   export default createAppFactory;
