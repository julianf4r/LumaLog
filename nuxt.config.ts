export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },

  modules: ['nuxt-auth-utils'],

  runtimeConfig: {
    // 生产环境用 NUXT_ADMIN_USERNAME / NUXT_ADMIN_PASSWORD / NUXT_DATA_DIR 覆盖
    adminUsername: 'admin',
    adminPassword: 'lumalog-dev',
    dataDir: '.data',
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'LumaLog · 光屿',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '光屿 LumaLog — 把每一点微光，都留在这座小岛上。' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

})
