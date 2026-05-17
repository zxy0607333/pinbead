# Pinbead Docs

这个目录用于沉淀 Pinbead 的产品、技术、内容、SEO、AdSense、版本路线和执行任务。

当前统一定位：

```text
Pinbead = bead pattern editor + printable pattern library + image import converter
```

中文理解：

```text
Pinbead 是一个拼豆图纸编辑器、可打印拼豆图库，以及图片导入转换工具。
```

图片转拼豆图不再被视为最终成品，而是生成可编辑草稿的一种方式。真正核心是让用户能编辑、修正、导出、打印和分享可制作的拼豆图纸。

## 文档索引

- [任务列表](./task-list.md)：按 `[x]`、`[~]`、`[ ]` 标注执行状态，并附详细需求。
- [产品规划](./product-plan.md)：产品定位、用户路径、首页策略、编辑器优先原则和内容来源。
- [技术栈与架构](./technical-stack.md)：自有服务器部署、编辑器模型、图片导入、导出和后续后端规划。
- [后台 CMS 规划](./admin-cms-plan.md)：自用后台、图纸发布流程、数据模型和管理员内容管理范围。
- [版本路线图](./roadmap.md)：从当前原型调整到编辑器优先、SEO 内容站和社区化的路线。
- [内容、SEO 与 AdSense](./content-seo-adsense.md)：URL 结构、页面矩阵、分类策略、图纸内容和广告策略。
- [AdSense 上线前体检](./adsense-readiness-audit.md)：提交审核前的页面、内容、广告位和合规检查。

## 当前推荐 URL

```text
/                              首页
/editor                        拼豆图纸编辑器
/convert                       图片转拼豆图纸
/admin                         管理员后台
/patterns                      免费图纸库
/categories/[categorySlug]     分类页
/pattern/[patternSlug]         单个图纸详情页
/guides                        教程列表
/guides/[guideSlug]            教程详情页
```

## 核心原则

1. 首页保持轻量，负责解释 Pinbead 并分流到编辑器、转换器和图库。
2. `/editor` 是产品核心，支持从零绘制、修改导入草稿、导出可打印图纸。
3. `/convert` 只负责把图片转成可编辑草稿，不能把自动转换结果当成最终成品。
4. `/admin` 是自用内容后台，用于管理图纸、分类、教程、草稿、发布和下架。
5. SEO 主力放在图纸详情页、分类页、教程页和工具介绍页。
6. 公开图纸库优先使用原创或授权安全内容；用户生成内容必须审核后公开和展示广告。

