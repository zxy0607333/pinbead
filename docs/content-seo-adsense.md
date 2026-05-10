# 内容、SEO 与 AdSense

最后更新：2026-05-10

## SEO 总体判断

编辑器优先不会影响 SEO，反而让产品更清楚。首页不需要承载完整重工具；SEO 主力应该来自页面矩阵：

```text
/editor
/convert
/patterns
/categories/[categorySlug]
/pattern/[patternSlug]
/guides/[guideSlug]
```

首页负责分流，图纸页、分类页、教程页和工具介绍页负责搜索承接。

## 推荐 URL 结构

```text
/                              首页
/editor                        拼豆图纸编辑器
/convert                       图片转拼豆图纸
/patterns                      免费图纸库
/categories/animals            动物分类
/categories/food               食物分类
/categories/holidays           节日分类
/categories/beginner           新手分类
/pattern/cute-cat              单个图纸详情页
/guides                        教程列表
/guides/bead-color-chart       教程详情页
```

不使用 `/c`、`/p` 这类过短路径。分类和详情分开，避免 `/patterns/animals` 与 `/patterns/cute-cat` 同级混淆。

## 首页 SEO 和设计

首页建议轻量设计：

1. Header：Logo、Patterns、Editor、Convert、Guides。
2. Hero：明确 Pinbead 是 bead pattern editor and printable pattern library。
3. CTA：`Start designing`、`Convert image`、`Browse patterns`。
4. Featured categories：Animals、Food、Holidays、Beginner、Cute、Nature。
5. How Pinbead works：Create from scratch、Convert image to draft、Edit details、Export printable pattern。
6. Editor highlight：展示网格、色号、颜色统计和导出能力。
7. Beginner-friendly pattern library：展示 6-8 个精选图纸。
8. Guides：展示 3 个教程入口。
9. Featured pattern feed：末尾展示精选瀑布流。

首页末尾可以做瀑布流，但第一版不要无限加载。建议展示 12-20 个精选图纸，用于视觉展示和内链。

## 关键词方向

### 编辑器词

- bead pattern maker
- bead pattern editor
- pin bead pattern maker
- fuse bead pattern maker
- pixel bead pattern maker
- printable bead pattern maker

### 图片转换词

- image to bead pattern
- photo to bead pattern
- picture to bead pattern
- image to perler bead pattern
- pixel bead pattern generator

`/convert` URL 虽短，但页面 title、H1、描述和正文要覆盖这些词。

### 图库词

- free printable bead patterns
- beginner bead patterns
- animal bead patterns
- holiday bead patterns
- cute bead patterns
- bead keychain patterns

### 教程词

- how to make a bead pattern
- how to turn a photo into a bead pattern
- how to use a bead pattern editor
- how to print a bead pattern
- bead color chart

## 分类策略

第一版建议只做少量高质量分类：

- Animals
- Food
- Holidays
- Beginner
- Cute
- Nature
- Letters & Numbers

每个分类页需要：

- 独特英文介绍。
- 该分类下的精选图纸。
- 内链到 `/editor`、`/convert` 和相关教程。
- 不要创建空分类或只有 1-2 个图纸的分类。

## 图纸详情页要求

每个 `/pattern/[patternSlug]` 至少包含：

- 图纸标题。
- 可视预览。
- 尺寸，例如 `32 x 32 beads`。
- 难度。
- 颜色数量。
- 每种颜色用豆数量。
- PNG/PDF 下载。
- 制作提示。
- 相关图纸。
- 面包屑。

不要批量生成只有图片、没有说明的薄页面。

## 图纸内容来源

第一批公开图纸建议：

| 分类 | 数量 | 示例 |
| --- | --- | --- |
| Animals | 10 | cat, dog, bunny, frog |
| Food | 8 | strawberry, pizza, cupcake |
| Holidays | 8 | pumpkin, snowman, heart |
| Beginner | 10 | simple icons, small keychains |
| Cute | 8 | star, rainbow, mushroom |
| Nature | 6 | flower, leaf, sun |

优先做 16x16、24x24、32x32 的 beginner-friendly 图纸。

## AdSense 策略

申请前建议具备：

- 30-50 个高质量图纸详情页。
- 3-5 篇教程文章。
- 首页、图库、分类页结构完整。
- Privacy Policy、Terms、Contact、Copyright 页面。
- 没有大量空白页、测试页和重复薄页面。

推荐广告位：

- 图纸详情页正文中部。
- 图纸详情页下载区之后。
- 分类页列表之间。
- 教程文章正文中部和底部。

不推荐广告位：

- 编辑器画布旁边。
- 上传按钮旁边。
- 生成草稿按钮旁边。
- 下载按钮旁边。
- 移动端首屏挤压主功能。
- 未审核 UGC 页面。

## UGC 审核原则

用户生成内容公开前必须审核。

审核前：

- 不公开。
- 不进 sitemap。
- 不允许搜索引擎索引。
- 不展示 AdSense。

重点拦截：

- 明显版权角色。
- 明星或真人肖像。
- 成人、暴力、仇恨、违法内容。
- 商标和品牌 logo。
- 低质量重复内容。
- 垃圾链接和推广内容。

## 衡量指标

上线后重点看：

- Search Console impressions。
- Indexed pages。
- `/editor` 启动次数。
- `/convert` 上传和草稿生成次数。
- 图纸详情页点击率。
- 分类页到图纸页点击率。
- PNG/PDF 下载次数。
- AdSense RPM。
- 用户是否主动请求保存和分享功能。

