# LumaLog · 光屿

> 把每一点微光，都留在这座小岛上。

一个轻量的自用博客系统：Nuxt 3 + SQLite（Node 内置 `node:sqlite`，零原生依赖），单容器部署，带账密登录的网页后台，写文章不碰 git。

- **前台**：首页（置顶 + 分页）、文章页（右侧悬浮大纲、代码高亮/行号/一键复制）、标签、归档、搜索、亮暗双主题
- **后台** `/admin`：Markdown 分屏实时预览、粘贴即传图、草稿箱、置顶、标签管理

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000 ，后台 http://localhost:3000/admin （开发默认账密 `admin` / `lumalog-dev`）。

## 文档

- [SPEC.md](./SPEC.md) —— 需求与设计规格
- [DEPLOY.md](./DEPLOY.md) —— 部署指南（GitHub Actions 构建镜像 → 服务器 Docker Compose 运行）

数据（SQLite 与上传图片）默认在 `.data/` 目录，生产环境用 `NUXT_DATA_DIR` 指定并挂载卷。
