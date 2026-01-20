import { createApp } from 'vue'
import VueMatomo from 'vue-matomo'
import App from './App.vue'

import './assets/css/tailwind.css'

const app = createApp(App)

// Configure Matomo only if environment variables are set
const matomoHost = import.meta.env.VITE_MATOMO_HOST
const matomoSiteId = import.meta.env.VITE_MATOMO_SITE_ID

if (matomoHost && matomoSiteId) {
    app.use(VueMatomo, {
        host: matomoHost,
        siteId: Number(matomoSiteId),
        trackerFileName: 'matomo',
        enableLinkTracking: true,
        trackInitialView: true,
        disableCookies: false,
        requireConsent: false,
        enableHeartBeatTimer: true,
        heartBeatTimerInterval: 15,
    })
}

app.mount('#app')
