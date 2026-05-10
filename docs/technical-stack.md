# 技术栈与架构

最后更新：2026-05-10

## 推荐技术栈

项目部署在自有服务器，推荐继续使用：

| 模块 | 推荐技术 | 说明 |
| --- | --- | --- |
| Web 框架 | Next.js App Router + TypeScript | 同时承载首页、编辑器、转换器、图库、教程和后续 API。 |
| UI | Tailwind CSS + 自建组件 | 编辑器交互较定制，先自建核心组件更直接。 |
| 编辑器渲染 | HTML/CSS Grid + Canvas 导出 | 页面编辑用 DOM grid，导出用 Canvas。 |
| 图片导入 | File API + Canvas + createImageBitmap | 图片在浏览器本地处理，默认不上传原图。 |
| 色彩匹配 | LAB 色彩空间 + 品牌色卡 | 当前已具备基础 LAB 匹配能力。 |
| 图纸模型 | TypeScript Pattern model | 编辑器、转换器、导出、图库共用同一数据模型。 |
| 数据库 | PostgreSQL，后置 | 用户保存、公开图库、审核队列上线后再引入。 |
| ORM | Prisma，后置 | 配合 PostgreSQL 管理迁移和类型。 |
| 对象存储 | Cloudflare R2，后置 | 存公开预览图、PDF、pattern JSON。 |
| 登录 | Auth.js，后置 | 保存、投稿、收藏、用户页需要时再上。 |
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
  patterns/page.tsx
  categories/[categorySlug]/page.tsx
  pattern/[patternSlug]/page.tsx
  guides/page.tsx
  guides/[guideSlug]/page.tsx

src/components/editor/
  pattern-editor.tsx
  pattern-grid.tsx
  editor-toolbar.tsx
  palette-panel.tsx
  color-count-panel.tsx
  export-panel.tsx

src/components/convert/
  image-importer.tsx
  crop-controls.tsx
  conversion-settings.tsx

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

src/data/
  bead-palettes.ts
  patterns.ts
  categories.ts
  guides.ts
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
-> PostgreSQL later
-> Cloudflare R2 later
```

前期如果没有数据库，Next.js 可以先以静态数据和本地前端工具运行。

## 环境变量预留

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

