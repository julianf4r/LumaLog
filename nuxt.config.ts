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

  // KaTeX 的样式表：公式在服务端就渲染成 HTML 了，浏览器只需要这份 CSS
  // 和它引用的字体（字体按需下载，没有公式的页面不会加载）
  css: ['~/assets/css/main.css', 'katex/dist/katex.min.css'],

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
