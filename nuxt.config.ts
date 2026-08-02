export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },

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

  nitro: {
    // SQLite 与图片目录在里程碑二接入；当前使用内置假数据
  },
})
