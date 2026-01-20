import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import VueMatomo from 'vue-matomo'
import App from './App.vue'

import './assets/css/tailwind.css'

import fr from './locales/fr.json'
import en from './locales/en.json'

const savedLang = localStorage.getItem('language') || 'en'
// Map API language codes to i18n locales (fallback to 'en' for unsupported)
const i18nLocale = ['fr', 'en'].includes(savedLang) ? savedLang : 'en'

const i18n = createI18n({
    legacy: false,
    locale: i18nLocale,
    fallbackLocale: 'en',
    messages: { fr, en }
})

const app = createApp(App)
app.use(i18n)

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
