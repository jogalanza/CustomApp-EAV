
import './styles/quasar.scss'
import iconSet from 'quasar/icon-set/material-icons-round.js'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-round/material-icons-round.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'

import { Notify, Dialog, Cookies, LocalStorage, AppFullscreen } from 'quasar'

// To be used on app.use(Quasar, { ... })
export default {
  config: {},
  plugins: {
    Notify,
    Dialog,
    Cookies,
    LocalStorage,
    AppFullscreen
  },
  iconSet: iconSet
}