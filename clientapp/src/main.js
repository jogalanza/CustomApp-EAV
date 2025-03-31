import { createApp } from 'vue'
import App from './App.vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import { createPinia } from "pinia";

import 'quasar/dist/quasar.css';
import router from './router'

createApp(App)
    .use(router)
    .use(createPinia())
    .use(Quasar, quasarUserOptions)
    .mount('#app')
