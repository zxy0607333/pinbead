# 产品规划

最后更新：2026-05-14

## 产品定位

Pinbead 面向海外英文市场，定位为：

```text
Bead pattern editor and printable pattern library.
```

它不是单纯的图片转换器。更准确的产品关系是：

```text
Editor is the core.
Image conversion is an import method.
Pattern library is the SEO and content engine.
Admin CMS is the publishing workflow.
```

中文说明：

```text
编辑器是核心。
图片转换只是导入草稿。
图纸库负责 SEO、内容厚度和 AdSense。
后台 CMS 负责图纸、分类和教程的持续发布。
```

## 为什么要调整方向

直接把图片缩小并匹配色卡，通常只能得到草稿，不一定能得到真正可制作的拼豆图纸。常见问题包括：

- 眼睛、嘴巴、表情位置不对称。
- 小尺寸图纸细节糊掉。
- 轮廓断裂，主体不清晰。
- 颜色数量减少后画面变脏。
- 生成结果看起来像像素图，但不适合照着拼。

因此产品必须支持用户继续编辑。合理流程是：

```text
Upload image
-> Generate draft pattern
-> Open in editor
-> Fix eyes, outlines, colors, and details
-> Export printable chart
```

## 目标用户

- Craft makers：从零设计或修改拼豆图纸。
- Parents and teachers：下载可打印的新手图纸和课堂活动素材。
- Hobby creators：上传图片生成草稿，再手动修正成可制作图纸。
- SEO users：通过 `bead pattern maker`、`image to bead pattern`、`free printable bead patterns` 等关键词进入站点。

## 核心页面

### 首页 `/`

首页不放完整重工具，而是轻量介绍和分流。

首页目标：

- 让用户快速理解 Pinbead 是拼豆图纸编辑器和图库。
- 引导用户进入 `/editor`、`/convert`、`/patterns`。
- 展示精选图纸、热门分类、入门教程。
- 末尾展示精选瀑布流，但不做无限社区流。

首页主 CTA：

```text
Start designing
```

次 CTA：

```text
Convert image
Browse patterns
```

### 编辑器 `/editor`

编辑器是核心产品。

第一版编辑器应支持：

- 设置画布尺寸，例如 16x16、24x24、32x32、50x50。
- 网格编辑。
- 画笔、橡皮、填充。
- 色卡选择。
- 每格显示色号。
- 顶部、左侧、右侧、底部坐标编号。
- 颜色统计。
- PNG 导出。
- 后续支持 PDF 导出。

参考图纸应接近实际制作需要，而不只是展示漂亮预览。

### 转换器 `/convert`

转换器负责图片导入。

它的定位不是“生成最终图纸”，而是：

```text
Turn an image into an editable bead pattern draft.
```

流程：

```text
Upload image
-> Crop and choose size
-> Match palette and reduce colors
-> Generate draft
-> Open in editor
```

### 后台 CMS `/admin`

后台是站长自用的内容发布系统，不面向普通用户开放。

后台目标：

- 管理图纸库内容，而不是长期手动修改静态数据。
- 新建、编辑、预览、发布和下架图纸。
- 管理分类和教程。
- 补充英文标题、摘要、正文说明、SEO title 和 SEO description。
- 管理图纸状态：draft、published、archived。
- 只让 `published` 内容进入公开页面、sitemap 和 AdSense 流量承载页。

第一版后台允许管理员手动创建图纸、导入 Pattern JSON 和上传预览图；从 `/editor` 或 `/convert` 一键保存到后台草稿后置，不阻塞图纸库上线。

推荐后台页面：

```text
/admin/login
/admin
/admin/patterns
/admin/patterns/new
/admin/patterns/[id]
/admin/categories
/admin/guides
```

第一版后台只给管理员使用，暂不做普通用户注册、投稿、评论、点赞和复杂权限系统。

### 图纸库 `/patterns`

图纸库是 SEO 和 AdSense 的核心承载区。

它应展示：

- 精选原创图纸。
- 分类入口。
- 热门/新手/节日图纸。
- 可打印图纸详情页入口。

### 分类页 `/categories/[categorySlug]`

分类页用于承接长尾 SEO 和用户浏览。

首批分类建议：

- Animals
- Food
- Holidays
- Beginner
- Cute
- Nature
- Letters & Numbers

第一版不要创建大量空分类。每个分类必须有足够图纸和独特说明。

### 图纸详情页 `/pattern/[patternSlug]`

图纸详情页是最重要的 SEO 页面之一。

每个图纸页至少包含：

- 图纸预览。
- 尺寸。
- 难度。
- 颜色数量。
- 每种颜色用豆数量。
- 可打印下载。
- 制作提示。
- 相关图纸。

### 教程页 `/guides/[guideSlug]`

教程页承接长尾搜索和 AdSense。

首批教程：

- How to Make a Bead Pattern
- How to Turn a Photo into a Bead Pattern
- How to Use the Pinbead Editor
- Bead Color Chart
- How to Print and Follow a Bead Pattern

## 内容来源

公开图库优先级：

1. 自己原创的拼豆图纸。
2. AI 辅助原创后人工修正的图纸。
3. Public Domain / CC0 素材转制，并记录来源。
4. 授权设计师投稿。
5. 用户投稿，必须审核后公开。

所有公开图纸都应该通过后台 CMS 进入发布流程。后台负责记录来源类型、正文说明、SEO 信息、发布状态和下架状态，避免公开页面直接依赖临时静态数据。

不建议公开收录高风险 IP 内容，例如 Disney、Nintendo、Pokemon、Marvel、Sanrio、明星照片、影视角色和动漫角色。

## 前期不做

流量没起来之前，以下功能后置：

- 评论。
- 关注流。
- 站内私信。
- 复杂社区动态。
- 付费会员。
- 原生移动 App。
- AI 自动审核。
- 服务器端保存所有上传原图。

## 第一阶段目标

当前代码已经有一个首页工具原型，包括图片上传、裁剪、像素化、色卡匹配、颜色限制、预览、用豆统计和 PNG 导出。下一步不继续把它堆在首页，而是拆分成：

```text
/editor  核心编辑器
/convert 图片导入入口
/        轻量首页
```

