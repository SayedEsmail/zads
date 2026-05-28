import { createI18n } from 'vue-i18n'

const messages = {
    ar: {
        // Arabic translations
    },
    en: {
        // English translations
    },
}

const i18n = createI18n({
    legacy: false,
    locale: 'ar',
    fallbackLocale: 'en',
    messages,
    globalInjection: true,
})

export default function (app) {
    app.use(i18n)
}
