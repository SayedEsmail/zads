
// @ts-nocheck


export const localeCodes =  [
  "en",
  "ar"
]

export const localeLoaders = {
  "en": [{ key: "../i18n/locales/en.json", load: () => import("../i18n/locales/en.json" /* webpackChunkName: "locale__Users_sayed_Devs_Zads_zads_web_i18n_locales_en_json" */), cache: true }],
  "ar": [{ key: "../i18n/locales/ar.json", load: () => import("../i18n/locales/ar.json" /* webpackChunkName: "locale__Users_sayed_Devs_Zads_zads_web_i18n_locales_ar_json" */), cache: true }]
}

export const vueI18nConfigs = [
  
]

export const nuxtI18nOptions = {
  "restructureDir": "i18n",
  "experimental": {
    "localeDetector": "",
    "switchLocalePathLinkSSR": false,
    "autoImportTranslationFunctions": false,
    "typedPages": true,
    "typedOptionsAndMessages": false,
    "generatedLocaleFilePathFormat": "absolute"
  },
  "bundle": {
    "compositionOnly": true,
    "runtimeOnly": false,
    "fullInstall": true,
    "dropMessageCompiler": false,
    "optimizeTranslationDirective": true
  },
  "compilation": {
    "jit": true,
    "strictMessage": true,
    "escapeHtml": false
  },
  "customBlocks": {
    "defaultSFCLang": "json",
    "globalSFCScope": false
  },
  "vueI18n": "",
  "locales": [
    {
      "code": "en",
      "files": [
        "/Users/sayed/Devs/Zads/zads_web/i18n/locales/en.json"
      ]
    },
    {
      "code": "ar",
      "files": [
        "/Users/sayed/Devs/Zads/zads_web/i18n/locales/ar.json"
      ]
    }
  ],
  "defaultLocale": "ar",
  "defaultDirection": "ltr",
  "routesNameSeparator": "___",
  "trailingSlash": false,
  "defaultLocaleRouteNameSuffix": "default",
  "strategy": "no_prefix",
  "lazy": true,
  "langDir": "locales",
  "detectBrowserLanguage": false,
  "differentDomains": false,
  "baseUrl": "",
  "customRoutes": "page",
  "pages": {},
  "skipSettingLocaleOnNavigate": false,
  "types": "composition",
  "debug": false,
  "parallelPlugin": false,
  "multiDomainLocales": false,
  "i18nModules": []
}

export const normalizedLocales = [
  {
    "code": "en",
    "files": [
      {
        "path": "/Users/sayed/Devs/Zads/zads_web/i18n/locales/en.json"
      }
    ]
  },
  {
    "code": "ar",
    "files": [
      {
        "path": "/Users/sayed/Devs/Zads/zads_web/i18n/locales/ar.json"
      }
    ]
  }
]

export const NUXT_I18N_MODULE_ID = "@nuxtjs/i18n"
export const parallelPlugin = false
export const isSSG = false

export const DEFAULT_DYNAMIC_PARAMS_KEY = "nuxtI18nInternal"
export const DEFAULT_COOKIE_KEY = "i18n_redirected"
export const SWITCH_LOCALE_PATH_LINK_IDENTIFIER = "nuxt-i18n-slp"
