# Pinbead 后台 CMS 规划

最后更新：2026-05-14

## 目标

Pinbead 需要一个自用后台来管理图纸库、分类和教程内容。图纸库如果要承接 SEO、持续发布内容，并最终支持 AdSense，不能长期依赖手动修改 `src/data/patterns.ts`。

后台第一阶段只服务站长和管理员，不面向普通用户开放。

## 后台定位

后台负责内容生产和发布：

```text
editor / convert 负责生产可编辑图纸
admin 负责补充元信息、SEO 信息、预览和发布
public pages 负责展示已发布内容并承接搜索流量
```

推荐后台路径：

```text
/admin/login
/admin
/admin/patterns
/admin/patterns/new
/admin/patterns/[id]
/admin/categories
/admin/guides
```

公开路径保持：

```text
/patterns
/categories/[categorySlug]
/pattern/[patternSlug]
/guides
/guides/[guideSlug]
```

## MVP 范围

第一版后台只做图纸库发布闭环：

- 管理员登录。
- 图纸列表：按状态、分类、关键词筛选。
- 新建图纸。
- 编辑标题、slug、摘要、正文说明、SEO title、SEO description。
- 选择分类、难度、尺寸、颜色数量、来源类型。
- 保存 Pattern JSON。
- 上传或生成预览图。
- 保存草稿、预览、发布、下架。
- 前台只读取 `published` 状态的内容。

暂不做：

- 普通用户注册。
- 用户投稿。
- 评论、点赞、收藏。
- 复杂审核流。
- 多管理员权限矩阵。
- 服务器端保存用户上传原图。
- 从 `/editor` 或 `/convert` 一键保存到后台草稿。

## 推荐技术方案

自有服务器部署，推荐：

```text
Next.js App Router
PostgreSQL
Prisma
管理员 Session / Cookie 登录
本地磁盘或 S3-compatible 对象存储
```

第一版可以用简单管理员账号，不接 Google OAuth。后续如果要多人协作，再升级为 Auth.js 或更完整的权限系统。

## 安全要求

后台虽然第一版只给站长使用，但它会控制公开内容和上传文件，因此安全边界不能后置。

必须做到：

- 管理员密码只存哈希，例如 bcrypt 或 argon2，不保存明文密码。
- 登录态使用服务端 session 或签名 cookie，Cookie 必须设置 `httpOnly`、`secure`、`sameSite` 和过期时间。
- `/admin`、`/admin/patterns`、`/admin/categories`、`/admin/guides` 等所有后台路由都必须服务端鉴权。
- 未登录访问后台页面和后台 API 必须拒绝，不能只依赖前端隐藏按钮。
- 登录接口需要基础限流，例如按 IP 和邮箱限制失败次数。
- 后台新增、编辑、发布、下架、上传等写操作需要 CSRF 防护或严格同源校验。
- 退出登录后需要让当前 session 失效。
- `/admin` 全部页面必须 `noindex`，不进入 sitemap，不展示 AdSense。

上传安全要求：

- 只允许白名单文件类型，例如 PNG、JPG、WEBP、PDF、JSON。
- 限制单文件大小、图片尺寸和 Pattern JSON 大小。
- 文件名使用随机 ID，不使用用户上传的原始文件名。
- 本地上传目录必须在应用构建目录之外，例如 `/var/lib/pinbead/uploads` 或 Docker volume。
- 上传文件按只读静态资源或受控 API 输出，禁止执行脚本文件。
- 本地上传目录需要纳入备份策略；后续可迁移到 Cloudflare R2。

## 数据模型

### AdminUser

```text
id
email
passwordHash
role
createdAt
updatedAt
```

### Category

```text
id
slug
name
description
seoTitle
seoDescription
sortOrder
status
createdAt
updatedAt
```

### Pattern

```text
id
slug
title
summary
description
categoryId
difficulty
width
height
colorCount
beadCount
paletteId
cellsJson
previewImageUrl
downloadImageUrl
sourceType
seoTitle
seoDescription
status
publishedAt
createdAt
updatedAt
```

`status` 建议：

```text
draft
published
archived
```

`sourceType` 建议：

```text
original
ai_assisted
public_domain
licensed
user_submission
```

### Guide

```text
id
slug
title
summary
content
seoTitle
seoDescription
status
publishedAt
createdAt
updatedAt
```

## 图纸发布流程

第一版推荐流程：

```text
1. 管理员在 /admin/patterns/new 新建图纸草稿
2. 填写标题、分类、描述、SEO 信息和来源类型
3. 粘贴或导入 Pattern JSON
4. 上传或生成预览 PNG
5. 管理员预览公开详情页
6. 发布
7. /patterns、/categories/[slug]、/pattern/[slug] 自动展示
```

从 `/editor` 或 `/convert` 一键保存到后台草稿是后续增强，不阻塞图纸库上线。

## 前台读取规则

- `/patterns` 只展示已发布图纸。
- `/categories/[categorySlug]` 只展示该分类下已发布图纸。
- `/pattern/[patternSlug]` 对未发布内容返回 404。
- sitemap 只包含已发布内容。
- 下架内容不展示、不索引。

## SEO 要求

后台必须让每张图纸具备可编辑的 SEO 字段：

- `seoTitle`
- `seoDescription`
- `summary`
- `description`
- `category`
- `difficulty`
- `width`
- `height`
- `colorCount`
- `beadCount`

每张公开图纸详情页至少应该有 200-400 英文词的独立说明，不要只展示图片。

## 上线优先级

建议拆成这些任务：

1. 接入 PostgreSQL 和 Prisma。
2. 建立 Category / Pattern / AdminUser 模型。
3. 建立管理员登录。
4. 建立 `/admin/patterns` 列表。
5. 建立图纸新建和编辑页面。
6. 支持草稿、发布、下架状态。
7. 让 `/patterns` 和 `/pattern/[slug]` 读取数据库中的已发布图纸。
8. 再做 `/categories/[categorySlug]` 和 `/guides`。
