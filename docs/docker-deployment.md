# Docker 和 Portainer 部署

最后更新：2026-05-18

## 可以先部署再上传吗

可以。

Pinbead 现在已经有后台、数据库、上传目录和 Docker 镜像构建脚本。先部署到 Docker，然后登录 `/admin` 上传预览图、下载图、图纸 JSON 和英文内容，是当前最合理的内容生产方式。

上线前要保证：

- PostgreSQL 数据库持久化。
- `/var/lib/pinbead/uploads` 挂载为 Docker volume。
- `ADMIN_SESSION_SECRET` 配置完整。
- 启动容器前或启动时执行 `npm run db:deploy`。
- 第一次打开 `/admin` 时，通过 `/admin/setup` 创建主号。

## 本地 Docker

本地 Docker 用仓库里的 `compose.yaml`，会同时启动：

- `pinbead-db`：PostgreSQL。
- `pinbead-app`：Next.js standalone 应用。
- `pinbead-uploads`：后台上传文件 volume。

第一次先准备环境变量：

```bash
cp .env.example .env
```

至少确认 `.env` 里有：

```text
ADMIN_SESSION_SECRET="replace-with-a-long-random-secret"
ADMIN_COOKIE_SECURE="false"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

启动：

```bash
docker compose up -d --build
```

查看日志：

```bash
docker compose logs -f app
```

访问：

```text
http://localhost:3000
http://localhost:3000/admin
```

第一次访问 `/admin` 会跳到 `/admin/setup`。创建的第一个账号就是主号；创建后 setup 入口会自动关闭。

停止：

```bash
docker compose down
```

如果要连数据和上传文件一起清掉：

```bash
docker compose down -v
```

## 构建并推送镜像

默认镜像仓库不变：

```text
zhangxianyuan/yukid-tool
```

默认 tag：

```text
zhangxianyuan/yukid-tool:pinbead-0.1.0
zhangxianyuan/yukid-tool:pinbead-latest
```

构建并推送：

```bash
./build.sh 0.1.0 --push --login
```

如果已经登录 Docker Registry：

```bash
./build.sh 0.1.0 --push
```

只在本机加载镜像：

```bash
./build.sh --load
```

## Portainer 部署

Portainer 推荐用 `compose.portainer.yaml` 建 Stack。

流程：

1. 先在本地或 CI 执行 `./build.sh 0.1.0 --push --login`，确保镜像已推送。
2. 打开 Portainer。
3. 进入 `Stacks`。
4. 新建 Stack，例如 `pinbead`。
5. 使用 `Repository` 或 `Web editor`。
6. 如果用 `Web editor`，粘贴 `compose.portainer.yaml` 内容。
7. 在 Environment variables 区域填写变量。
8. Deploy the stack。

Portainer 环境变量至少需要：

```text
POSTGRES_PASSWORD=replace-with-a-strong-db-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
ADMIN_COOKIE_SECURE=true
NEXTAUTH_URL=https://pinbead.com
NEXTAUTH_SECRET=replace-with-a-long-random-secret
APP_PORT=3000
```

如果你前面有 Nginx/Caddy 反代，通常：

```text
APP_PORT=3000
NEXTAUTH_URL=https://pinbead.com
```

反代到：

```text
http://服务器IP:3000
```

## 上传目录

后台上传文件保存在：

```text
/var/lib/pinbead/uploads
```

Docker 内通过 volume 持久化：

```text
pinbead-uploads:/var/lib/pinbead/uploads
```

这一步很重要。否则容器重建后，后台上传的预览图和下载图会丢。

## 常见问题

### Docker 里不要用 localhost 连接数据库

在 compose 网络里，应用连接数据库要用服务名：

```text
postgresql://pinbead:password@db:5432/pinbead?schema=public
```

不要写：

```text
postgresql://pinbead:password@localhost:5432/pinbead?schema=public
```

因为容器里的 `localhost` 指的是应用容器自己，不是数据库容器。

### 修改代码后怎么更新 Portainer

1. 本地提交代码。
2. 重新构建并推送镜像：

```bash
./build.sh 0.1.1 --push
```

3. Portainer Stack 里更新镜像 tag，或者继续使用 `pinbead-latest` 并点击 Recreate / Pull latest image。

### 本地开发要不要一直用 Docker

不一定。

日常开发可以继续用：

```bash
docker compose up -d db
npm run dev
```

如果你想模拟线上容器环境，再用：

```bash
docker compose up -d --build
```
