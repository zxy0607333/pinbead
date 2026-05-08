# 技术栈与架构

## 推荐栈

因为项目部署在自有服务器，推荐使用下面这套组合：

| 模块 | 推荐技术 | 说明 |
| --- | --- | --- |
| Web 框架 | Next.js App Router + TypeScript | 同时承载工具页、SEO 内容页、后台和 API。 |
| UI | Tailwind CSS + shadcn/ui 或自建组件 | 快速构建专业工具界面。 |
| 图片处理 | Canvas + Web Worker + OffscreenCanvas | 私人图片在浏览器本地处理，减少服务器压力。 |
| 图纸导出 | Canvas PNG + pdf-lib 或 jsPDF | 导出 PNG、PDF、颜色清单。 |
| 数据库 | PostgreSQL | 存图纸、分类、色卡、审核状态、用户数据。 |
| ORM | Prisma | 自托管 Node/Next 项目里迁移和类型生成都比较直接。 |
| 登录 | Auth.js | 自有服务器友好，支持 Google OAuth、邮箱登录。 |
| 对象存储 | Cloudflare R2 | 存公开图纸预览图、PDF、pattern JSON，适合图片站。 |
| 缓存/队列 | Redis + BullMQ，后置 | MVP 不必上，等后台任务变多后再加。 |
| 反滥用 | Cloudflare Turnstile + API rate limit | 防止垃圾投稿和批量请求。 |
| 部署 | Docker Compose + Nginx 或 Caddy | 应用跑在自有服务器，由反向代理处理 HTTPS。 |
| 监控 | Sentry + uptime monitor | 前期先覆盖前后端错误和可用性。 |
| 分析 | GA4 + Search Console | SEO 和 AdSense 前置必备。 |

## 自有服务器部署结构

```text
Internet
-> Cloudflare DNS/CDN/WAF
-> Server Nginx or Caddy
-> Next.js standalone Node process
-> PostgreSQL
-> Cloudflare R2 for public assets
```

推荐前期用 Docker Compose 管理服务：

```text
services:
  app: Next.js standalone
  postgres: PostgreSQL
  redis: optional, later
  nginx/caddy: reverse proxy, optional if host already has one
```

如果服务器已经有统一的 Nginx 网关，可以只部署 app 和 postgres。

## 为什么不用服务器处理所有图片

拼豆图纸生成天然适合浏览器端处理：

- 用户原图不必上传，隐私体验更好。
- 避免大图片上传、队列、CPU 峰值和清理任务。
- 转换过程能即时预览，交互更顺。
- 降低版权内容进入服务器的概率。

服务器只处理公开分享后的资产：

- 公开预览图。
- 公开图纸 JSON。
- 可打印 PDF。
- 缩略图和 Open Graph 图。

## 图片转换引擎

第一版转换引擎建议包含：

- 图片读取：File API + createImageBitmap。
- 裁剪缩放：Canvas。
- 后台计算：Web Worker，优先支持 OffscreenCanvas。
- 像素采样：按目标格子宽高缩放。
- 调色板匹配：RGB 转 LAB，再按色差匹配品牌色。
- 颜色数量限制：median cut / k-means 简化版 / popularity quantization。
- 可选抖动：Floyd-Steinberg dithering。
- 预览模式：square pixels、round beads、numbered grid。
- 导出：PNG、PDF、CSV 或 TXT bead count。

色彩匹配不要只用 RGB 欧氏距离，否则浅色、肤色、灰阶会很容易偏。

## 数据模型草案

### patterns

公开图纸主表。

| 字段 | 说明 |
| --- | --- |
| id | 主键 |
| slug | URL slug |
| title | 英文标题 |
| description | 页面简介 |
| category_id | 分类 |
| difficulty | beginner / easy / medium / hard |
| width | 格子宽 |
| height | 格子高 |
| color_count | 颜色数 |
| status | draft / published / rejected / archived |
| source_type | original / ai_assisted / public_domain / user_submission |
| author_id | 作者，可空 |
| created_at | 创建时间 |
| updated_at | 更新时间 |

### pattern_assets

| 字段 | 说明 |
| --- | --- |
| pattern_id | 图纸 ID |
| preview_url | 预览图 |
| thumbnail_url | 缩略图 |
| pdf_url | PDF |
| pattern_json_url | 图纸 JSON |

### palette_colors

| 字段 | 说明 |
| --- | --- |
| brand | Perler / Hama / Artkal / MARD |
| code | 品牌色号 |
| name | 颜色名 |
| hex | HEX |
| lab_l / lab_a / lab_b | LAB 值，用于匹配 |

### pattern_colors

| 字段 | 说明 |
| --- | --- |
| pattern_id | 图纸 ID |
| palette_color_id | 色卡颜色 |
| bead_count | 需要颗数 |

### moderation_queue

| 字段 | 说明 |
| --- | --- |
| target_type | pattern / comment / profile |
| target_id | 目标 ID |
| status | pending / approved / rejected |
| reason | 审核原因 |
| reviewer_id | 审核人 |
| reviewed_at | 审核时间 |

## 图纸 JSON 格式

不要把每个像素格作为一行存数据库。建议用压缩 JSON 存 R2：

```json
{
  "version": 1,
  "width": 32,
  "height": 32,
  "palette": [
    { "id": "perler-black", "brand": "Perler", "code": "80-19018", "hex": "#111111" }
  ],
  "cellsEncoding": "rle",
  "cells": "0x12,1x5,0x2"
}
```

数据库只存图纸元数据、统计和资产 URL。

## 环境变量

建议预留：

```text
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
SENTRY_DSN=
GA_MEASUREMENT_ID=
ADSENSE_CLIENT_ID=
```

## 运维建议

- PostgreSQL 每天备份，至少保留 7-14 天。
- R2 开生命周期策略，清理未发布的临时资产。
- Nginx/Caddy 开 gzip 或 brotli。
- Next.js 使用 standalone 输出，减少部署体积。
- 用 systemd 或 Docker restart policy 保持应用自动恢复。
- 上线前跑 Lighthouse，重点看移动端性能、CLS、广告位布局。

