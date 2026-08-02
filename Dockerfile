# ---------- 构建阶段 ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- 运行阶段 ----------
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=256 \
    NUXT_DATA_DIR=/data \
    PORT=3000

COPY --from=build /app/.output ./.output

# 数据目录（SQLite + 上传图片），务必挂载卷持久化
VOLUME /data
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
