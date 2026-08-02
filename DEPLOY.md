# LumaLog · 光屿 — 部署指南

目标：部署到 Oracle 免费云主机，外网通过你的域名 HTTPS 访问。
架构：`GitHub Actions 构建镜像 → GHCR 镜像仓库 → 服务器拉取运行（app + Caddy 两个容器）`。
服务器上**永远不执行构建**，只拉镜像，1G 内存机器毫无压力。

---

## 一、把代码推上 GitHub（本地电脑执行）

```bash
git init
git add -A
git commit -m "LumaLog initial"
git branch -M main
git remote add origin https://github.com/<你的用户名>/LumaLog.git
git push -u origin main
```

推送后 GitHub Actions 会自动构建 **amd64 + arm64 双架构**镜像（Oracle 的 AMD 和 ARM 机型都能用），发布到 `ghcr.io/<你的用户名>/lumalog:latest`。在仓库的 Actions 页面等它变绿即可。

> **重要**：首次构建成功后，到 GitHub 个人主页 → Packages → lumalog → Package settings，把可见性改成 **Public**。这样服务器拉镜像不需要登录（镜像里不含任何密钥，公开无风险；账密都在服务器的 .env 里）。

## 二、准备 Oracle 服务器（SSH 到服务器执行）

以 Ubuntu 系统为例。

### 1. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

执行完退出 SSH 重新登录一次，让用户组生效。

### 2. 加 1G swap（1G 内存机器的安全带）

```bash
sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3. 放行 80/443 端口（两处都要做）

**Oracle 控制台**：实例详情 → 子网 → Security List → 添加两条 Ingress 规则：源 `0.0.0.0/0`，TCP 端口分别为 `80` 和 `443`。

**服务器本机防火墙**（Oracle 的 Ubuntu 镜像自带 iptables 拦截规则）：

```bash
sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 443 -j ACCEPT
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save
```

### 4. 域名解析

到你的域名服务商，加一条 A 记录：`blog`（或你喜欢的子域名）→ 服务器公网 IP。用 `ping blog.你的域名` 确认解析生效。

## 三、部署（SSH 到服务器执行）

```bash
sudo mkdir -p /opt/lumalog && sudo chown $USER /opt/lumalog && cd /opt/lumalog
```

把仓库里 `deploy/` 目录下的三个文件放到这里（scp 上传或直接复制粘贴内容）：

- `docker-compose.yml` —— 把里面的 `OWNER` 改成你的 GitHub 用户名（**全小写**）
- `Caddyfile` —— 不用改
- `.env.example` —— 复制为 `.env` 并修改：

```bash
cp .env.example .env
openssl rand -base64 32   # 把输出填进 .env 的 NUXT_SESSION_PASSWORD
nano .env                 # 改域名、后台账密
```

启动：

```bash
docker compose up -d
```

半分钟后打开 `https://你的域名`，应该就能看到光屿了（Caddy 首次启动会自动申请证书）。后台在 `https://你的域名/admin`。

## 四、日常更新（发布新版本）

本地改完代码推送 GitHub，Actions 构建完成后，在服务器上：

```bash
cd /opt/lumalog && docker compose pull app && docker compose up -d app
```

写文章不属于「更新」——直接在网页后台写就行，数据都在服务器的 `data/` 目录里。

## 五、备份

所有数据（SQLite + 上传图片）都在 `/opt/lumalog/data/`。每天凌晨自动打包、保留最近 30 天：

```bash
mkdir -p /opt/lumalog/backup
crontab -e
# 加入这一行：
0 4 * * * tar czf /opt/lumalog/backup/lumalog-$(date +\%F).tar.gz -C /opt/lumalog data && find /opt/lumalog/backup -name "*.tar.gz" -mtime +30 -delete
```

恢复 = 解压覆盖 `data/` 后 `docker compose restart app`。建议偶尔把备份下载到本地一份（异地备份）。

> 说明：直接打包数据库文件理论上要求打包瞬间没有写入。个人博客写入极少，实际风险可忽略；如果想做到零风险，可在打包命令前加一步 `docker compose exec app node -e "require('node:sqlite');"`（或干脆选凌晨你不写文章的时间，比如默认的 4 点）。

## 六、常见问题

| 现象 | 排查 |
|---|---|
| 域名打不开 | 安全列表和 iptables 是否都放行了 80/443；`docker compose ps` 看容器是否都在跑 |
| HTTPS 证书失败 | DNS 是否已解析到本机 IP（`dig +short 你的域名`）；80 端口是否被占用 |
| 拉取镜像失败 | GHCR 包是否已设为 Public；`OWNER` 是否为全小写 |
| 忘记后台密码 | 改 `.env` 里的 `NUXT_ADMIN_PASSWORD`，然后 `docker compose up -d app` |
| 看应用日志 | `docker compose logs -f app` |
