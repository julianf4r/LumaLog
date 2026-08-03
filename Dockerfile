# ---------- 构建阶段 ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# 这里刻意用 npm install 而非 npm ci。
# npm ci 要求 lockfile 与 npm 计算出的依赖树逐条吻合，而本项目的 lockfile 在
# Windows 上生成：Linux 下 npm 对 @napi-rs/wasm-runtime 的 peer 依赖
# （@emnapi/core、@emnapi/runtime）会解析出 lockfile 里没有的条目，于是判定
# 不同步、直接失败。npm install 同样以 lockfile 为准，但允许就地补齐这类差异。
# 若日后需要恢复 npm ci，先在 Linux 环境下重新生成 package-lock.json 并提交。
RUN npm install --no-audit --no-fund

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
