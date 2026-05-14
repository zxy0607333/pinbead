# 技术栈与架构

最后更新：2026-05-14

## 推荐技术栈

项目部署在自有服务器，推荐继续使用：

| 模块 | 推荐技术 | 说明 |
| --- | --- | --- |
| Web 框架 | Next.js App Router + TypeScript | 同时承载首页、编辑器、转换器、图库、教程和后续 API。 |
| UI | Tailwind CSS + 自建组件 | 编辑器交互较定制，先自建核心组件更直接。 |
| 编辑器渲染 | Canvas editor stage + Canvas 导出 | 中间画板使用 Canvas 渲染，支持平移、缩放、高亮和高密度格子；导出继续使用 Canvas。 |
| 图片导入 | File API + Canvas + createImageBitmap | 图片在浏览器本地处理，默认不上传原图。 |
| 色彩匹配 | LAB 色彩空间 + 品牌色卡 | 当前已具备基础 LAB 匹配能力。 |
| 图纸模型 | TypeScript Pattern model | 编辑器、转换器、导出、图库共用同一数据模型。 |
| 数据库 | PostgreSQL | 后台 CMS、图纸库、分类、教程和发布状态需要数据库支撑。 |
| ORM | Prisma | 配合 PostgreSQL 管理迁移、类型和后台 CRUD。 |
| 对象存储 | 本地磁盘起步，后续 Cloudflare R2 | 存公开预览图、PDF、pattern JSON；自有服务器可先用本地上传目录。 |
| 后台登录 | 自建 Admin Session 起步，后续 Auth.js | 第一版只给管理员使用，不急着接公开用户系统。 |
| 部署 | Docker Compose + Nginx/Caddy | 自有服务器部署，Next.js 使用 standalone 输出。 |
| 分析 | GA4 + Search Console | SEO 和行为分析必备。 |
| 监控 | Sentry + uptime monitor | 上线后监控前端和服务端错误。 |

## 当前架构调整方向

当前 `src/components/home-pattern-maker.tsx` 已经承载过多职责：

- 图片上传。
- 裁剪和尺寸设置。
- 像素化。
- 色卡匹配。
- 颜色限制。
- 图纸预览。
- 用豆统计。
- PNG 导出。

下一步应拆成独立模块，避免首页组件继续膨胀。

推荐结构：

```text
src/app/
  page.tsx
  editor/page.tsx
  convert/page.tsx
  admin/login/page.tsx
  admin/page.tsx
  admin/patterns/page.tsx
  admin/patterns/new/page.tsx
  admin/patterns/[id]/page.tsx
  admin/categories/page.tsx
  admin/guides/page.tsx
  patterns/page.tsx
  categories/[categorySlug]/page.tsx
  pattern/[patternSlug]/page.tsx
  guides/page.tsx
  guides/[guideSlug]/page.tsx

src/components/editor/
  pattern-editor-shell.tsx
  canvas-stage.tsx
  editor-sidebars.tsx
  floating-tool-dock.tsx
  palette-panel.tsx
  color-count-panel.tsx
  export-panel.tsx

src/components/convert/
  image-importer.tsx
  crop-controls.tsx
  conversion-settings.tsx

src/components/admin/
  admin-shell.tsx
  pattern-form.tsx
  pattern-status-controls.tsx
  category-form.tsx
  guide-form.tsx

src/components/home/
  hero.tsx
  category-shortcuts.tsx
  featured-patterns.tsx
  pattern-masonry.tsx

src/lib/pattern/
  pattern-model.ts
  pattern-utils.ts
  image-to-pattern.ts
  pattern-export.ts
  bead-color-matching.ts

src/lib/admin/
  auth.ts
  permissions.ts

src/lib/db/
  prisma.ts
  patterns.ts
  categories.ts
  guides.ts

src/data/
  bead-palettes.ts
  seed-patterns.ts
  seed-categories.ts
  seed-guides.ts
```

## 核心图纸模型

编辑器、转换器和导出应共用同一个模型：

```ts
type Pattern = {
  version: 1;
  width: number;
  height: number;
  paletteId: string;
  cells: Array<string | null>; // colorId per cell, null means empty
};
```

公开图纸可以扩展元数据：

```ts
type PatternDocument = {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  difficulty: "beginner" | "easy" | "medium" | "hard";
  sourceType: "original" | "ai_assisted" | "public_domain" | "user_submission";
  status: "draft" | "published" | "rejected" | "archived";
  pattern: Pattern;
};
```

不要把每个格子作为数据库行存储。后续持久化时，用压缩 JSON 或 RLE 存储图纸矩阵。

## 后台 CMS 能力

图纸库上线后需要后台驱动发布，而不是长期使用静态数组维护。

第一版后台建议能力：

- 管理员登录。
- Pattern 列表、新建、编辑、预览、发布、下架。
- Category 列表、新建、编辑。
- Guide 列表、新建、编辑、发布。
- 所有公开页面只读取 `published` 状态内容。
- sitemap 只收录已发布内容。
- 管理员页面不展示广告，不被搜索引擎索引。

后台数据模型至少包括：

```text
AdminUser
Category
Pattern
Guide
```

图纸矩阵使用 `cellsJson` 存储，不拆成单格数据库行。

## 编辑器能力

第一版编辑器重点：

- 可设置画布尺寸。
- 单格绘制。
- 橡皮擦。
- 填充工具。
- 色卡选择。
- 每格显示色号。
- 坐标编号。
- 颜色统计。
- PNG 导出。

第二版再考虑：

- 框选、复制、移动。
- 撤销/重做。
- 镜像、旋转。
- 图层。
- PDF 导出。
- 键盘快捷键。

## 图片导入能力

图片导入逻辑应放在 `/convert`，并输出 `Pattern` 草稿。

流程：

```text
File input
-> Decode locally
-> Crop and resize
-> Match palette
-> Reduce colors
-> Create Pattern model
-> Open in editor
```

图片原图默认不上传服务器。只有用户明确公开分享或保存云端时，才进入后端流程。

## 导出能力

PNG 导出应支持：

- 像素图。
- 圆珠预览。
- 网格线。
- 色号显示。
- 坐标编号。
- 底部颜色清单。

PDF 导出后续应更接近实际制作图纸：

- 顶部、左侧、右侧、底部坐标。
- 每格色号。
- 底部颜色统计。
- 可分页打印。

## 自有服务器部署

```text
Internet
-> Cloudflare DNS/CDN/WAF
-> Server Nginx or Caddy
-> Next.js standalone Node process
-> PostgreSQL
-> Local uploads or Cloudflare R2 later
```

上线图纸库前建议先接入 PostgreSQL 和 Prisma，否则后台发布、图纸状态、分类页和 sitemap 都会变得难维护。

本地上传可以作为第一版起步方案，但必须明确持久化边界：

- 上传目录必须位于应用构建目录之外，例如 `/var/lib/pinbead/uploads`，或挂载为 Docker volume。
- 不要把后台上传内容写入 `.next`、临时目录或会被重新构建覆盖的 `public` 输出目录。
- 预览图、导出图和附件文件名使用随机 ID，不使用用户原始文件名。
- 限制文件类型、文件大小和图片尺寸，公开访问的上传文件只允许图片、PDF、JSON 等白名单类型。
- Nginx/Caddy 可以只读方式托管公开上传目录，也可以由 Next.js 受控代理输出。
- 本地磁盘上传需要纳入服务器备份；后续流量起来后再迁移到 Cloudflare R2。

后台安全边界第一版也要明确：

- 管理员密码只存哈希，不把明文密码写入代码或环境变量。
- 登录 Cookie 使用 `httpOnly`、`secure`、`sameSite`，并设置过期时间。
- `/admin` 所有路由必须经过服务端鉴权，未登录不能只靠前端隐藏。
- 登录接口需要基础限流，防止暴力尝试。
- 后台写操作需要 CSRF 防护或同源校验。
- `/admin` 页面全部 `noindex`，不进入 sitemap，也不展示 AdSense。

## 环境变量预留

```text
DATABASE_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=
ADMIN_SESSION_MAX_AGE=
UPLOAD_DIR=
UPLOAD_PUBLIC_BASE_URL=
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
