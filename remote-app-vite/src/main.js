import { createApp } from "vue";
import App from "./App.vue";
import { Quasar } from "quasar";
import 'quasar/dist/quasar.css';
import quasarUserOptions from "./quasar-user-options";
import router from "./router";
// import VuexApexCharts from "vue3-apexcharts"
//import hub from "./plugins/hub"
import eventBus from "./plugins/eventBus";
import { createPinia } from "pinia";
//import SignalRPlugin from "./plugins/signalr";


import "./assets/scss/app.scss";
//import './registerServiceWorker'

var server_address = `${
  window.location.origin
}${window.location.pathname.replace("clientapp/dist/", "")}`;
if (server_address[server_address.length - 1] !== "/") {
  server_address = `${server_address}/`;
}

const app = createApp(App)
  .use(Quasar, quasarUserOptions)
  .use(router)
  .use(createPinia())
  // .use(VuexApexCharts)
  .use(eventBus)
  //.use(SignalRPlugin, { hubUrl: `${server_address}mainhub` });

app.mount("#app");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().then((success) => {
        console.log("Service Worker unregistered:", success);
      });
    });
  });
}
